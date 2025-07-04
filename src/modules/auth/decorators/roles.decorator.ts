import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

// Export constants để tránh magic strings và đảm bảo tính nhất quán
export const ROLES_KEY = 'roles';
export const ROLES_ANY_KEY = 'roles_any';
export const ROLES_ALL_KEY = 'roles_all';

// Decorator cũ - giữ lại để backward compatibility (mặc định sử dụng logic ANY)
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// Decorator mới - yêu cầu ít nhất một trong các roles (OR logic)
export const RolesAny = (...roles: UserRole[]) => SetMetadata(ROLES_ANY_KEY, roles);

// Decorator mới - yêu cầu tất cả các roles (AND logic)
export const RolesAll = (...roles: UserRole[]) => SetMetadata(ROLES_ALL_KEY, roles);