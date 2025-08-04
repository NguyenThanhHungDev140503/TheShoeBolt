import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = this.usersRepository.create(createUserDto);
    const savedUser = await this.usersRepository.save(user);
    
    // Index the user in Elasticsearch
    try {
      await this.elasticsearchService.indexUser(savedUser);
    } catch (error) {
      // Log the error but don't fail the user creation
      console.error(`Failed to index user in Elasticsearch: ${error.message}`);
    }
    
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt', 'updatedAt'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    await this.usersRepository.update(id, updateUserDto);
    const updatedUser = await this.findOne(id);
    
    // Update the user in Elasticsearch
    try {
      await this.elasticsearchService.indexUser(updatedUser);
    } catch (error) {
      // Log the error but don't fail the user update
      console.error(`Failed to update user in Elasticsearch: ${error.message}`);
    }
    
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);

    // Delete the user from Elasticsearch
    try {
      await this.elasticsearchService.deleteUser(id);
    } catch (error) {
      // Log the error but don't fail the user deletion
      console.error(`Failed to delete user from Elasticsearch: ${error.message}`);
    }
  }

  /**
   * Find user by Clerk ID
   */
  async findByClerkId(clerkId: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { clerkId } });
  }

  /**
   * Sync user data from Clerk webhook
   */
  async syncUserFromClerk(clerkUserData: any): Promise<void> {
    try {
      this.logger.debug(`Syncing user from Clerk: ${clerkUserData.id}`);

      const userData = {
        clerkId: clerkUserData.id,
        email: clerkUserData.email_addresses?.[0]?.email_address,
        firstName: clerkUserData.first_name,
        lastName: clerkUserData.last_name,
        profileImageUrl: clerkUserData.profile_image_url,
        publicMetadata: clerkUserData.public_metadata,
        privateMetadata: clerkUserData.private_metadata,
        createdAt: new Date(clerkUserData.created_at),
        updatedAt: new Date(clerkUserData.updated_at),
      };

      // Check if user already exists
      const existingUser = await this.findByClerkId(clerkUserData.id);

      if (existingUser) {
        this.logger.warn(`User ${clerkUserData.id} already exists, updating instead`);
        await this.updateUserFromClerk(clerkUserData);
        return;
      }

      // Create new user
      await this.create(userData as CreateUserDto);
      this.logger.log(`Successfully synced new user: ${clerkUserData.id}`);

    } catch (error) {
      this.logger.error(`Failed to sync user from Clerk: ${clerkUserData.id}`, error);
      throw error;
    }
  }

  /**
   * Update user data from Clerk webhook
   */
  async updateUserFromClerk(clerkUserData: any): Promise<void> {
    try {
      this.logger.debug(`Updating user from Clerk: ${clerkUserData.id}`);

      const existingUser = await this.findByClerkId(clerkUserData.id);
      if (!existingUser) {
        this.logger.warn(`User ${clerkUserData.id} not found, creating instead`);
        await this.syncUserFromClerk(clerkUserData);
        return;
      }

      const updateData = {
        email: clerkUserData.email_addresses?.[0]?.email_address,
        firstName: clerkUserData.first_name,
        lastName: clerkUserData.last_name,
        profileImageUrl: clerkUserData.profile_image_url,
        publicMetadata: clerkUserData.public_metadata,
        privateMetadata: clerkUserData.private_metadata,
        updatedAt: new Date(clerkUserData.updated_at),
      };

      await this.update(existingUser.id, updateData as UpdateUserDto);
      this.logger.log(`Successfully updated user: ${clerkUserData.id}`);

    } catch (error) {
      this.logger.error(`Failed to update user from Clerk: ${clerkUserData.id}`, error);
      throw error;
    }
  }

  /**
   * Delete user from Clerk webhook
   */
  async deleteUser(clerkUserId: string): Promise<void> {
    try {
      this.logger.debug(`Deleting user from Clerk webhook: ${clerkUserId}`);

      const existingUser = await this.findByClerkId(clerkUserId);
      if (!existingUser) {
        this.logger.warn(`User ${clerkUserId} not found for deletion`);
        return;
      }

      await this.remove(existingUser.id);
      this.logger.log(`Successfully deleted user: ${clerkUserId}`);

    } catch (error) {
      this.logger.error(`Failed to delete user from Clerk: ${clerkUserId}`, error);
      throw error;
    }
  }

  // ===== USER REGISTRATION METHODS (Refactored from sp_register_user) =====

  /**
   * Register new user with associated resources
   * Business logic moved from sp_register_user stored procedure
   * This implements the complete user registration workflow
   */
  async registerUser(userData: {
    name: string;
    email: string;
    phone: string;
    password: string; // Already hashed
  }): Promise<User> {
    this.logger.log(`Registering new user with email: ${userData.email}`);

    return await this.dataSource.transaction(async (manager) => {
      try {
        // 1. Validate business rules
        await this.validateUserRegistration(userData, manager);

        // 2. Create user
        const user = await this.createUserInTransaction(userData, manager);

        // 3. Initialize user resources (cart and wishlist)
        await this.initializeUserResources(user.id, manager);

        this.logger.log(`Successfully registered user with ID: ${user.id}`);
        return user;
      } catch (error) {
        this.logger.error(`Failed to register user: ${error.message}`, error.stack);
        throw error;
      }
    });
  }

  /**
   * Validate user registration business rules
   * Business logic that was previously in database layer
   */
  private async validateUserRegistration(
    userData: { email: string; phone: string },
    manager?: EntityManager
  ): Promise<void> {
    const repository = manager ? manager.getRepository(User) : this.usersRepository;

    // Check email uniqueness
    const existingUserByEmail = await repository.findOne({
      where: { email: userData.email }
    });

    if (existingUserByEmail) {
      throw new ConflictException(`Email đã tồn tại: ${userData.email}`);
    }

    // Check phone uniqueness (assuming sodienthoai field exists)
    const existingUserByPhone = await repository.findOne({
      where: { sodienthoai: userData.phone } as any
    });

    if (existingUserByPhone) {
      throw new ConflictException(`Số điện thoại đã tồn tại: ${userData.phone}`);
    }

    this.logger.debug(`Validation passed for user registration: ${userData.email}`);
  }

  /**
   * Create user record within transaction
   * Uses simplified stored procedure (sp_create_user_simple)
   */
  private async createUserInTransaction(
    userData: { name: string; email: string; phone: string; password: string },
    manager: EntityManager
  ): Promise<User> {
    try {
      // Use simplified stored procedure for user creation
      const result = await manager.query(
        'CALL sp_create_user_simple($1, $2, $3, $4)',
        [userData.name, userData.email, userData.phone, userData.password]
      );

      // Get the created user ID from the procedure output
      const userId = result[0]?.p_user_id;
      if (!userId) {
        throw new Error('Failed to get user ID from stored procedure');
      }

      // Fetch the created user
      const repository = manager.getRepository(User);
      const user = await repository.findOne({ where: { id: userId } });

      if (!user) {
        throw new Error(`User not found after creation: ${userId}`);
      }

      this.logger.debug(`Created user with ID: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Initialize user resources (cart and wishlist)
   * Uses simplified stored procedures
   */
  private async initializeUserResources(
    userId: string,
    manager: EntityManager
  ): Promise<void> {
    try {
      // Use simplified stored procedures for resource creation
      await Promise.all([
        manager.query('CALL sp_create_cart_simple($1)', [userId]),
        manager.query('CALL sp_create_wishlist_simple($1)', [userId])
      ]);

      this.logger.debug(`Initialized cart and wishlist for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to initialize user resources: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if email exists
   * Utility method for validation
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.usersRepository.count({
      where: { email }
    });
    return count > 0;
  }

  /**
   * Check if phone exists
   * Utility method for validation
   */
  async existsByPhone(phone: string): Promise<boolean> {
    // TODO: Implement when phone field is available in User entity
    // const count = await this.usersRepository.count({
    //   where: { sodienthoai: phone }
    // });
    // return count > 0;

    this.logger.debug(`Would check phone existence for: ${phone}`);
    return false; // Placeholder
  }
}