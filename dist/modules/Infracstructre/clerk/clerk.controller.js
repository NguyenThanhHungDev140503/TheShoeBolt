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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const clerk_session_service_1 = require("./clerk.session.service");
const clerk_auth_guard_1 = require("./guards/clerk-auth.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const user_entity_1 = require("../../users/entities/user.entity");
let ClerkController = class ClerkController {
    constructor(clerkSessionService) {
        this.clerkSessionService = clerkSessionService;
    }
    async getUserSessions(req) {
        const sessions = await this.clerkSessionService.getSessionList(req.user.id);
        return {
            message: 'Sessions retrieved successfully',
            sessions,
        };
    }
    async revokeSession(sessionId) {
        await this.clerkSessionService.revokeSession(sessionId);
        return;
    }
    async revokeAllSessions(req) {
        await this.clerkSessionService.revokeAllUserSessions(req.user.id);
        return;
    }
    async getAnyUserSessions(userId) {
        const sessions = await this.clerkSessionService.getSessionList(userId);
        return {
            message: 'User sessions retrieved successfully',
            userId,
            sessions,
        };
    }
    async revokeAllUserSessions(userId) {
        await this.clerkSessionService.revokeAllUserSessions(userId);
        return;
    }
};
exports.ClerkController = ClerkController;
__decorate([
    (0, common_1.Get)('sessions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all sessions for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sessions retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClerkController.prototype, "getUserSessions", null);
__decorate([
    (0, common_1.Delete)('sessions/:sessionId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke a specific session' }),
    (0, swagger_1.ApiParam)({ name: 'sessionId', description: 'Session ID to revoke' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Session revoked successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClerkController.prototype, "revokeSession", null);
__decorate([
    (0, common_1.Delete)('sessions'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke all sessions for current user' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'All sessions revoked successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClerkController.prototype, "revokeAllSessions", null);
__decorate([
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Get)('admin/users/:userId/sessions'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Get sessions for any user' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'User ID to get sessions for' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClerkController.prototype, "getAnyUserSessions", null);
__decorate([
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Delete)('admin/users/:userId/sessions'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Revoke all sessions for any user' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'User ID to revoke sessions for' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClerkController.prototype, "revokeAllUserSessions", null);
exports.ClerkController = ClerkController = __decorate([
    (0, swagger_1.ApiTags)('Clerk Session Management'),
    (0, common_1.Controller)('clerk'),
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard),
    __metadata("design:paramtypes", [clerk_session_service_1.ClerkSessionService])
], ClerkController);
//# sourceMappingURL=clerk.controller.js.map