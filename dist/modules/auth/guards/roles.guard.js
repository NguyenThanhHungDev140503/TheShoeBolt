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
        const rolesAll = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_ALL_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        const rolesAny = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_ANY_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        const rolesLegacy = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        let requiredRoles = null;
        let requireAll = false;
        if (rolesAll && rolesAll.length > 0) {
            requiredRoles = rolesAll;
            requireAll = true;
        }
        else if (rolesAny && rolesAny.length > 0) {
            requiredRoles = rolesAny;
            requireAll = false;
        }
        else if (rolesLegacy && rolesLegacy.length > 0) {
            requiredRoles = rolesLegacy;
            requireAll = true;
        }
        if (!requiredRoles || requiredRoles.length === 0) {
            this.logger.warn('RolesGuard được áp dụng cho endpoint không có role decorator. Từ chối truy cập theo nguyên tắc fail-safe.');
            throw new common_1.ForbiddenException('Access denied: No role requirements specified for this endpoint.');
        }
        const request = context.switchToHttp().getRequest();
        const clerkUser = request.clerkUser;
        if (!clerkUser) {
            this.logger.error('ClerkUser object is missing in RolesGuard. Ensure ClerkAuthGuard runs before it.');
            throw new common_1.InternalServerErrorException('User authentication data is not available.');
        }
        const userRoles = this.extractUserRoles(clerkUser);
        if (!userRoles || userRoles.length === 0) {
            this.logger.warn(`User ${clerkUser.userId ?? 'unknown'} không có vai trò nào được gán.`);
            throw new common_1.ForbiddenException('You have not been assigned any roles.');
        }
        const hasPermission = this.matchRoles(requiredRoles, userRoles, requireAll);
        if (!hasPermission) {
            const logicType = requireAll ? 'ALL' : 'ANY';
            this.logger.warn(`User ${clerkUser.userId ?? 'unknown'} với roles [${userRoles.join(', ')}] không có quyền truy cập endpoint yêu cầu ${logicType} roles [${requiredRoles.join(', ')}].`);
            throw new common_1.ForbiddenException('You do not have the required permissions to access this resource.');
        }
        this.logger.debug(`User ${clerkUser.userId ?? 'unknown'} được phép truy cập với roles [${userRoles.join(', ')}].`);
        return true;
    }
    extractUserRoles(clerkUser) {
        if (!clerkUser.claims?.public_metadata) {
            return [];
        }
        const publicMetadata = clerkUser.claims.public_metadata;
        if (publicMetadata.roles && Array.isArray(publicMetadata.roles)) {
            return publicMetadata.roles;
        }
        if (publicMetadata.role) {
            return [publicMetadata.role];
        }
        return [];
    }
    matchRoles(requiredRoles, userRoles, requireAll) {
        if (requireAll) {
            return requiredRoles.every((role) => userRoles.includes(role));
        }
        else {
            return requiredRoles.some((role) => userRoles.includes(role));
        }
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = RolesGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map