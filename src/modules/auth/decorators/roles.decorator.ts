import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

// Export constant để tránh magic strings và đảm bảo tính nhất quán
export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);