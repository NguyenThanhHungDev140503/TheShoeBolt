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
var ClerkAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const clerk_client_provider_1 = require("../providers/clerk-client.provider");
const config_1 = require("@nestjs/config");
let ClerkAuthGuard = ClerkAuthGuard_1 = class ClerkAuthGuard {
    constructor(clerkClient, configService) {
        this.clerkClient = clerkClient;
        this.configService = configService;
        this.logger = new common_1.Logger(ClerkAuthGuard_1.name);
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        try {
            const webRequest = this.convertToWebRequest(request);
            const authState = await this.clerkClient.authenticateRequest(webRequest, {
                jwtKey: this.configService.get('CLERK_JWT_KEY'),
                secretKey: this.configService.get('CLERK_SECRET_KEY'),
            });
            if (!authState.isAuthenticated) {
                this.logger.error('User not authenticated');
                throw new common_1.UnauthorizedException('User not authenticated');
            }
            const authObject = authState.toAuth();
            request['clerkUser'] = {
                sessionId: authObject.sessionId,
                userId: authObject.userId,
                orgId: authObject.orgId,
                claims: authObject.sessionClaims
            };
            this.logger.debug(`User ${authObject.userId} authenticated`);
            return true;
        }
        catch (error) {
            this.logger.error(`Authentication failed: ${error.message}`);
            throw new common_1.UnauthorizedException('Authentication failed');
        }
    }
    convertToWebRequest(expressRequest) {
        const url = `${expressRequest.protocol}://${expressRequest.get('host')}${expressRequest.originalUrl}`;
        const headers = new Headers();
        Object.entries(expressRequest.headers).forEach(([key, value]) => {
            if (typeof value === 'string') {
                headers.set(key, value);
            }
            else if (Array.isArray(value)) {
                headers.set(key, value.join(', '));
            }
        });
        if (expressRequest.cookies && Object.keys(expressRequest.cookies).length > 0) {
            const cookieString = Object.entries(expressRequest.cookies)
                .map(([key, value]) => `${key}=${String(value)}`)
                .join('; ');
            headers.set('Cookie', cookieString);
        }
        return new globalThis.Request(url, {
            method: expressRequest.method,
            headers: headers,
        });
    }
};
exports.ClerkAuthGuard = ClerkAuthGuard;
exports.ClerkAuthGuard = ClerkAuthGuard = ClerkAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(clerk_client_provider_1.CLERK_CLIENT)),
    __metadata("design:paramtypes", [Object, config_1.ConfigService])
], ClerkAuthGuard);
//# sourceMappingURL=clerk-auth.guard.js.map