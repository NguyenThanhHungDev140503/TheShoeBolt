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
exports.ClerkSessionService = void 0;
const common_1 = require("@nestjs/common");
const clerk_client_provider_1 = require("./providers/clerk-client.provider");
let ClerkSessionService = class ClerkSessionService {
    constructor(clerkClient, options) {
        this.clerkClient = clerkClient;
        this.options = options;
    }
    async getSessionList(userId) {
        try {
            const sessions = await this.clerkClient.sessions.getSessionList({
                userId,
            });
            return sessions;
        }
        catch (error) {
            throw new common_1.UnauthorizedException(`Failed to get sessions: ${error.message}`);
        }
    }
    async revokeSession(sessionId) {
        try {
            const revokedSession = await this.clerkClient.sessions.revokeSession(sessionId);
            return revokedSession;
        }
        catch (error) {
            throw new common_1.UnauthorizedException(`Failed to revoke session: ${error.message}`);
        }
    }
    async verifySessionToken(token) {
        try {
            const headers = new Headers({
                'Authorization': `Bearer ${token}`,
                'Cookie': `__session=${token}`,
            });
            const webRequest = new globalThis.Request('https://api.clerk.dev', {
                method: 'GET',
                headers: headers,
            });
            const authState = await this.clerkClient.authenticateRequest(webRequest, {
                secretKey: this.options.secretKey,
            });
            if (!authState.isAuthenticated) {
                throw new common_1.UnauthorizedException('Token is not valid or expired');
            }
            const authObject = authState.toAuth();
            return authObject.sessionClaims;
        }
        catch (error) {
            throw new common_1.UnauthorizedException(`Invalid session token: ${error.message}`);
        }
    }
    async getSession(sessionId) {
        try {
            const session = await this.clerkClient.sessions.getSession(sessionId);
            return session;
        }
        catch (error) {
            throw new common_1.UnauthorizedException(`Failed to get session: ${error.message}`);
        }
    }
    async getUser(userId) {
        try {
            const user = await this.clerkClient.users.getUser(userId);
            return user;
        }
        catch (error) {
            throw new common_1.UnauthorizedException(`Failed to get user: ${error.message}`);
        }
    }
    async verifyTokenAndGetAuthData(token) {
        try {
            const headers = new Headers({
                'Authorization': `Bearer ${token}`,
                'Cookie': `__session=${token}`,
            });
            const webRequest = new globalThis.Request('https://api.clerk.dev', {
                method: 'GET',
                headers: headers,
            });
            const authState = await this.clerkClient.authenticateRequest(webRequest, {
                secretKey: this.options.secretKey,
            });
            if (!authState.isAuthenticated) {
                throw new common_1.UnauthorizedException('Token is not valid or expired');
            }
            const authObject = authState.toAuth();
            const sessionClaims = authObject.sessionClaims;
            const session = await this.getSession(sessionClaims.sid);
            if (!session || session.status !== 'active') {
                throw new common_1.UnauthorizedException('Invalid or inactive session');
            }
            const user = await this.getUser(session.userId);
            return {
                user: {
                    id: user.id,
                    email: user.emailAddresses[0]?.emailAddress,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    publicMetadata: user.publicMetadata,
                },
                session,
                sessionClaims,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException(`Authentication failed: ${error.message}`);
        }
    }
    async revokeAllUserSessions(userId) {
        try {
            const sessionsResponse = await this.getSessionList(userId);
            const revokedSessions = await Promise.all(sessionsResponse.data.map((session) => this.revokeSession(session.id)));
            return revokedSessions;
        }
        catch (error) {
            throw new common_1.UnauthorizedException(`Failed to revoke all user sessions: ${error.message}`);
        }
    }
};
exports.ClerkSessionService = ClerkSessionService;
exports.ClerkSessionService = ClerkSessionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(clerk_client_provider_1.CLERK_CLIENT)),
    __param(1, (0, common_1.Inject)('CLERK_OPTIONS')),
    __metadata("design:paramtypes", [Object, Object])
], ClerkSessionService);
//# sourceMappingURL=clerk.session.service.js.map