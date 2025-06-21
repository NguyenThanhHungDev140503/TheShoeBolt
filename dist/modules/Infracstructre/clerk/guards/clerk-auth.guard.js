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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const clerk_session_service_1 = require("../clerk.session.service");
let ClerkAuthGuard = class ClerkAuthGuard {
    constructor(clerkSessionService) {
        this.clerkSessionService = clerkSessionService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        try {
            const authHeader = request.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new common_1.UnauthorizedException('Missing or invalid authorization header');
            }
            const token = authHeader.substring(7);
            const authData = await this.clerkSessionService.verifyTokenAndGetAuthData(token);
            request.user = authData.user;
            request.session = authData.session;
            request.sessionClaims = authData.sessionClaims;
            return true;
        }
        catch (error) {
            throw new common_1.UnauthorizedException(`Authentication failed: ${error.message}`);
        }
    }
};
exports.ClerkAuthGuard = ClerkAuthGuard;
exports.ClerkAuthGuard = ClerkAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [clerk_session_service_1.ClerkSessionService])
], ClerkAuthGuard);
//# sourceMappingURL=clerk-auth.guard.js.map