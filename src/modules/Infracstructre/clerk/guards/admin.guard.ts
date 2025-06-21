import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../../users/entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Kiểm tra xem request có thông tin user không (phải qua ClerkAuthGuard trước)
    if (!request.user) {
      throw new ForbiddenException('User information not found');
    }
    
    // Lấy role từ Clerk's publicMetadata
    const userRole = request.user.publicMetadata?.role || UserRole.USER;
    
    // Chỉ cho phép ADMIN truy cập
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin role required');
    }
    
    return true;
  }
} 