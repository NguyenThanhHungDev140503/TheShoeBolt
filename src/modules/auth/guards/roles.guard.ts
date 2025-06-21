import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

// Định nghĩa một kiểu cho payload của người dùng từ Clerk để tăng tính an toàn về kiểu
interface ClerkUserPayload {
  publicMetadata?: {
    role?: UserRole; // Hỗ trợ vai trò đơn lẻ như hiện tại
    roles?: UserRole[]; // Hỗ trợ mảng các vai trò cho tương lai
  };
  // Thêm các thuộc tính khác của user nếu cần
  id?: string;
  emailAddresses?: Array<{ emailAddress: string }>;
}

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Sử dụng getAllAndOverride để lấy các vai trò từ cả handler và class
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu không có vai trò nào được yêu cầu, áp dụng nguyên tắc fail-safe
    // Guard này chỉ nên được kích hoạt trên các endpoint CÓ decorator @Roles.
    // Các endpoint công khai nên được xử lý bởi một @Public decorator và một AuthGuard toàn cục.
    if (!requiredRoles || requiredRoles.length === 0) {
      this.logger.warn('RolesGuard được áp dụng cho endpoint không có @Roles decorator. Từ chối truy cập theo nguyên tắc fail-safe.');
      throw new ForbiddenException('Access denied: No role requirements specified for this endpoint.');
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as ClerkUserPayload;

    // 1. Kiểm tra phòng vệ: Đảm bảo `user` tồn tại
    if (!user) {
      this.logger.error('User object is missing in RolesGuard. Ensure an authentication guard runs before it.');
      throw new InternalServerErrorException('User authentication data is not available.');
    }

    // 2. Trích xuất vai trò của người dùng một cách an toàn
    const userRoles = this.extractUserRoles(user);

    // 3. Kiểm tra xem người dùng có vai trò hay không
    if (!userRoles || userRoles.length === 0) {
      this.logger.warn(`User ${user.id || 'unknown'} không có vai trò nào được gán.`);
      throw new ForbiddenException('You have not been assigned any roles.');
    }

    // 4. Thực hiện so khớp vai trò
    const hasPermission = this.matchRoles(requiredRoles, userRoles);

    if (!hasPermission) {
      this.logger.warn(`User ${user.id || 'unknown'} với roles [${userRoles.join(', ')}] không có quyền truy cập endpoint yêu cầu roles [${requiredRoles.join(', ')}].`);
      throw new ForbiddenException('You do not have the required permissions to access this resource.');
    }

    this.logger.debug(`User ${user.id || 'unknown'} được phép truy cập với roles [${userRoles.join(', ')}].`);
    return true;
  }

  /**
   * Trích xuất danh sách vai trò của người dùng từ Clerk payload
   * Hỗ trợ cả định dạng cũ (role đơn lẻ) và định dạng mới (roles array)
   * @param user Clerk user payload
   * @returns Mảng các vai trò của người dùng
   */
  private extractUserRoles(user: ClerkUserPayload): UserRole[] {
    if (!user.publicMetadata) {
      return [];
    }

    // Ưu tiên sử dụng roles array nếu có (cho tương lai)
    if (user.publicMetadata.roles && Array.isArray(user.publicMetadata.roles)) {
      return user.publicMetadata.roles;
    }

    // Fallback sang role đơn lẻ (hiện tại)
    if (user.publicMetadata.role) {
      return [user.publicMetadata.role];
    }

    // Không có vai trò nào
    return [];
  }

  /**
   * So khớp vai trò yêu cầu với vai trò của người dùng.
   * @param requiredRoles Các vai trò được yêu cầu bởi endpoint.
   * @param userRoles Các vai trò mà người dùng hiện tại có.
   * @returns `true` nếu người dùng có ít nhất một trong các vai trò yêu cầu.
   */
  private matchRoles(requiredRoles: UserRole[], userRoles: UserRole[]): boolean {
    // Logic cơ bản: kiểm tra intersection
    // Có thể được mở rộng ở đây để hỗ trợ thừa kế vai trò trong tương lai
    // Ví dụ: nếu requiredRoles có 'USER' và userRoles có 'ADMIN', nó nên trả về true.
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}