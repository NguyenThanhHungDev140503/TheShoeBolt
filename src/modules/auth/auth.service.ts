import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
  ) {}

  /**
   * Sync user data từ Clerk vào local database
   * Được gọi sau khi user authenticate thành công qua Clerk
   */
  async syncUserFromClerk(clerkUser: any) {
    const existingUser = await this.usersService.findByEmail(clerkUser.email);
    
    if (!existingUser) {
      // Create new user in local database
      const userData: CreateUserDto = {
        email: clerkUser.email,
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        password: 'clerk_managed', // Password không được quản lý local
        role: clerkUser.publicMetadata?.role || 'user',
      };
      
      return await this.usersService.create(userData);
    }
    
    // Update existing user data if needed
    if (existingUser.firstName !== clerkUser.firstName || 
        existingUser.lastName !== clerkUser.lastName) {
      await this.usersService.update(existingUser.id, {
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
      });
    }
    
    return existingUser;
  }

  /**
   * Get user profile từ local database
   * Dùng cho các endpoints cần thông tin user từ DB local
   */
  async getUserProfile(userId: string) {
    return this.usersService.findOne(userId);
  }
}