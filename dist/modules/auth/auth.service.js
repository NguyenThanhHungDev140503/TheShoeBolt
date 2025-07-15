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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    constructor(usersService, authService) {
        this.usersService = usersService;
        this.authService = authService;
    }
    async syncUserFromClerk(clerkUser) {
        const existingUser = await this.usersService.findByEmail(clerkUser.email);
        if (!existingUser) {
            const userData = {
                email: clerkUser.email,
                firstName: clerkUser.firstName || '',
                lastName: clerkUser.lastName || '',
                password: 'clerk_managed',
                role: clerkUser.publicMetadata?.role || 'user',
            };
            return await this.usersService.create(userData);
        }
        if (existingUser.firstName !== clerkUser.firstName ||
            existingUser.lastName !== clerkUser.lastName) {
            await this.usersService.update(existingUser.id, {
                firstName: clerkUser.firstName,
                lastName: clerkUser.lastName,
            });
        }
        return existingUser;
    }
    async getUserProfile(userId) {
        return this.usersService.findOne(userId);
    }
    async validateUserSession(token) {
        if (this.authService) {
            return await this.authService.verifyTokenAndGetAuthData(token);
        }
        throw new Error('Authentication service not available');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __param(1, (0, common_1.Inject)('IAuthenticationService')),
    __metadata("design:paramtypes", [users_service_1.UsersService, Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map