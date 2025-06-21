import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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
}