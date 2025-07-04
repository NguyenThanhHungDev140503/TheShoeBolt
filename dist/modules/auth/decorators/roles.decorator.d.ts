import { UserRole } from '../../users/entities/user.entity';
export declare const ROLES_KEY = "roles";
export declare const ROLES_ANY_KEY = "roles_any";
export declare const ROLES_ALL_KEY = "roles_all";
export declare const Roles: (...roles: UserRole[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const RolesAny: (...roles: UserRole[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const RolesAll: (...roles: UserRole[]) => import("@nestjs/common").CustomDecorator<string>;
