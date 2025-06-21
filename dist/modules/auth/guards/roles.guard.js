"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RolesGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const roles_decorator_1 = require("../decorators/roles.decorator");
let RolesGuard = RolesGuard_1 = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
        this.logger = new common_1.Logger(RolesGuard_1.name);
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0) {
            this.logger.warn('RolesGuard được áp dụng cho endpoint không có @Roles decorator. Từ chối truy cập theo nguyên tắc fail-safe.');
            throw new common_1.ForbiddenException('Access denied: No role requirements specified for this endpoint.');
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            this.logger.error('User object is missing in RolesGuard. Ensure an authentication guard runs before it.');
            throw new common_1.InternalServerErrorException('User authentication data is not available.');
        }
        const userRoles = this.extractUserRoles(user);
        if (!userRoles || userRoles.length === 0) {
            this.logger.warn(`User ${user.id || 'unknown'} không có vai trò nào được gán.`);
            throw new common_1.ForbiddenException('You have not been assigned any roles.');
        }
        const hasPermission = this.matchRoles(requiredRoles, userRoles);
        if (!hasPermission) {
            this.logger.warn(`User ${user.id || 'unknown'} với roles [${userRoles.join(', ')}] không có quyền truy cập endpoint yêu cầu roles [${requiredRoles.join(', ')}].`);
            throw new common_1.ForbiddenException('You do not have the required permissions to access this resource.');
        }
        this.logger.debug(`User ${user.id || 'unknown'} được phép truy cập với roles [${userRoles.join(', ')}].`);
        return true;
    }
    extractUserRoles(user) {
        if (!user.publicMetadata) {
            return [];
        }
        if (user.publicMetadata.roles && Array.isArray(user.publicMetadata.roles)) {
            return user.publicMetadata.roles;
        }
        if (user.publicMetadata.role) {
            return [user.publicMetadata.role];
        }
        return [];
    }
    matchRoles(requiredRoles, userRoles) {
        return requiredRoles.some((role) => userRoles.includes(role));
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = RolesGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map