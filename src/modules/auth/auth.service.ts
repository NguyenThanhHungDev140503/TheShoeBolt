import { Injectable, Inject, Optional } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { IAuthenticationService } from './interfaces/i-authentication-service.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    /* 
    
    
    Tiêm implement vào trong interface (đảo ngược phụ thuộc)
    Khi có nhiều implement có thể thay đổi hoặc thêm mới trong provider (AppModule) 
    Khi đó chỉ cần thay đổi tên token tiêm vào là có thể chuyển implement sang một implement khác
    
    */
    @Optional() @Inject('IAuthenticationService')
    private readonly authService?: IAuthenticationService,
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

  /**
   * Validate user session using authentication service
   * @param token - Session token to verify
   * @returns Authentication data if valid
   */
  async validateUserSession(token: string) {
    if (this.authService) {
      return await this.authService.verifyTokenAndGetAuthData(token);
    }
    throw new Error('Authentication service not available');
  }
}