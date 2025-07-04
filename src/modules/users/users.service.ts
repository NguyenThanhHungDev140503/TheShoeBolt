import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}