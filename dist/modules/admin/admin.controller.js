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
var AdminController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const clerk_auth_guard_1 = require("../Infrastructure/clerk/guards/clerk-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const admin_service_1 = require("./admin.service");
let AdminController = AdminController_1 = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
        this.logger = new common_1.Logger(AdminController_1.name);
    }
    async searchChatMessages(searchParams) {
        this.logger.log(`Admin searching chat messages with params: ${JSON.stringify(searchParams)}`);
        return this.adminService.searchChatMessages(searchParams);
    }
    async getChatStats(startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.adminService.getChatStats(start, end);
    }
    async searchUsers(query, from = 0, size = 10) {
        this.logger.log(`Admin searching users with query: ${query}`);
        return this.adminService.searchUsers(query, { from, size });
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('chat/search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search chat messages (admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns search results' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "searchChatMessages", null);
__decorate([
    (0, common_1.Get)('chat/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get chat statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns chat statistics' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getChatStats", null);
__decorate([
    (0, common_1.Get)('users/search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search users (admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns user search results' }),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('size')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "searchUsers", null);
exports.AdminController = AdminController = AdminController_1 = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map