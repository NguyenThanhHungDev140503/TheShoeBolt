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
exports.ClerkAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
let ClerkAuthGuard = class ClerkAuthGuard {
    constructor(options) {
        this.options = options;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        try {
            const authHeader = request.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new common_1.UnauthorizedException('Missing or invalid authorization header');
            }
            const token = authHeader.substring(7);
            const sessionToken = await clerk_sdk_node_1.clerkClient.verifyToken(token, {
                secretKey: this.options.secretKey,
                issuer: `https://clerk.${this.options.publishableKey.split('_')[1]}.lcl.dev`,
            });
            const session = await clerk_sdk_node_1.clerkClient.sessions.getSession(sessionToken.sid);
            if (!session || session.status !== 'active') {
                throw new common_1.UnauthorizedException('Invalid or inactive session');
            }
            const user = await clerk_sdk_node_1.clerkClient.users.getUser(session.userId);
            request.user = {
                id: user.id,
                email: user.emailAddresses[0]?.emailAddress,
                firstName: user.firstName,
                lastName: user.lastName,
                publicMetadata: user.publicMetadata,
            };
            request.session = session;
            request.sessionClaims = sessionToken;
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
    __param(0, (0, common_1.Inject)('CLERK_OPTIONS')),
    __metadata("design:paramtypes", [Object])
], ClerkAuthGuard);
//# sourceMappingURL=clerk-auth.guard.js.map