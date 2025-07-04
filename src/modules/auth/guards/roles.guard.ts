import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, ROLES_ANY_KEY, ROLES_ALL_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

// Định nghĩa một kiểu cho payload của người dùng từ Clerk để tăng tính an toàn về kiểu
interface ClerkUserPayload {
  sessionId?: string;
  userId?: string;
  orgId?: string;
  claims?: {
    public_metadata?: {
      role?: UserRole; // Hỗ trợ vai trò đơn lẻ như hiện tại
      roles?: UserRole[]; // Hỗ trợ mảng các vai trò cho tương lai
    };
    // Thêm các thuộc tính khác của claims nếu cần
    sub?: string;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Kiểm tra các loại decorator roles khác nhau
    const rolesAll = this.reflector.getAllAndOverride<UserRole[]>(ROLES_ALL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const rolesAny = this.reflector.getAllAndOverride<UserRole[]>(ROLES_ANY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const rolesLegacy = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Xác định loại logic và roles cần kiểm tra
    let requiredRoles: UserRole[] | null = null;
    let requireAll = false; // Mặc định là logic ANY

    if (rolesAll && rolesAll.length > 0) {
      requiredRoles = rolesAll;
      requireAll = true;
    } else if (rolesAny && rolesAny.length > 0) {
      requiredRoles = rolesAny;
      requireAll = false;
    } else if (rolesLegacy && rolesLegacy.length > 0) {
      // Thay đổi: @Roles decorator cũ bây giờ sử dụng logic ALL (AND) thay vì ANY (OR)
      requiredRoles = rolesLegacy;
      requireAll = true;
    }

    // Nếu không có vai trò nào được yêu cầu, áp dụng nguyên tắc fail-safe
    if (!requiredRoles || requiredRoles.length === 0) {
      this.logger.warn('RolesGuard được áp dụng cho endpoint không có role decorator. Từ chối truy cập theo nguyên tắc fail-safe.');
      throw new ForbiddenException('Access denied: No role requirements specified for this endpoint.');
    }

    const request = context.switchToHttp().getRequest();
    const clerkUser = request.clerkUser as ClerkUserPayload;

    // 1. Kiểm tra phòng vệ: Đảm bảo `clerkUser` tồn tại
    if (!clerkUser) {
      this.logger.error('ClerkUser object is missing in RolesGuard. Ensure ClerkAuthGuard runs before it.');
      throw new InternalServerErrorException('User authentication data is not available.');
    }

    // 2. Trích xuất vai trò của người dùng một cách an toàn
    const userRoles = this.extractUserRoles(clerkUser);

    // 3. Kiểm tra xem người dùng có vai trò hay không
    if (!userRoles || userRoles.length === 0) {
      this.logger.warn(`User ${clerkUser.userId ?? 'unknown'} không có vai trò nào được gán.`);
      throw new ForbiddenException('You have not been assigned any roles.');
    }

    // 4. Thực hiện so khớp vai trò
    const hasPermission = this.matchRoles(requiredRoles, userRoles, requireAll);

    if (!hasPermission) {
      const logicType = requireAll ? 'ALL' : 'ANY';
      this.logger.warn(`User ${clerkUser.userId ?? 'unknown'} với roles [${userRoles.join(', ')}] không có quyền truy cập endpoint yêu cầu ${logicType} roles [${requiredRoles.join(', ')}].`);
      throw new ForbiddenException('You do not have the required permissions to access this resource.');
    }

    this.logger.debug(`User ${clerkUser.userId ?? 'unknown'} được phép truy cập với roles [${userRoles.join(', ')}].`);
    return true;
  }

  /**
   * Trích xuất danh sách vai trò của người dùng từ Clerk payload
   * Hỗ trợ cả định dạng cũ (role đơn lẻ) và định dạng mới (roles array)
   * @param clerkUser Clerk user payload
   * @returns Mảng các vai trò của người dùng
   */
  private extractUserRoles(clerkUser: ClerkUserPayload): UserRole[] {
    if (!clerkUser.claims?.public_metadata) {
      return [];
    }

    const publicMetadata = clerkUser.claims.public_metadata;

    // Ưu tiên sử dụng roles array nếu có (cho tương lai)
    if (publicMetadata.roles && Array.isArray(publicMetadata.roles)) {
      return publicMetadata.roles;
    }

    // Fallback sang role đơn lẻ (hiện tại)
    if (publicMetadata.role) {
      return [publicMetadata.role];
    }

    // Không có vai trò nào
    return [];
  }

  /**
   * So khớp vai trò yêu cầu với vai trò của người dùng.
   * @param requiredRoles Các vai trò được yêu cầu bởi endpoint.
   * @param userRoles Các vai trò mà người dùng hiện tại có.
   * @param requireAll Nếu true, yêu cầu tất cả roles (AND logic). Nếu false, yêu cầu ít nhất một role (OR logic).
   * @returns `true` nếu người dùng thỏa mãn yêu cầu vai trò.
   */
  private matchRoles(requiredRoles: UserRole[], userRoles: UserRole[], requireAll: boolean): boolean {
    if (requireAll) {
      // Logic AND: Người dùng phải có TẤT CẢ các vai trò yêu cầu
      return requiredRoles.every((role) => userRoles.includes(role));
    } else {
      // Logic OR: Người dùng chỉ cần có ÍT NHẤT MỘT trong các vai trò yêu cầu
      return requiredRoles.some((role) => userRoles.includes(role));
    }
  }
}