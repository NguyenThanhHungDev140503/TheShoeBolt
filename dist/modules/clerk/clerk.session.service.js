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
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
let ClerkSessionService = class ClerkSessionService {
    constructor(options) {
        this.options = options;
        this.clerk = clerk_sdk_node_1.clerkClient;
    }
    async getSessionList(userId) {
        try {
            const sessions = await this.clerk.sessions.getSessionList({
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
            const revokedSession = await this.clerk.sessions.revokeSession(sessionId);
            return revokedSession;
        }
        catch (error) {
            throw new common_1.UnauthorizedException(`Failed to revoke session: ${error.message}`);
        }
    }
    async verifySessionToken(token) {
        try {
            const session = await this.clerk.sessions.verifySession(token, {
                secretKey: this.options.secretKey,
            });
            return session;
        }
        catch (error) {
            throw new common_1.UnauthorizedException(`Invalid session token: ${error.message}`);
        }
    }
    async revokeAllUserSessions(userId) {
        try {
            const sessions = await this.getSessionList(userId);
            const revokedSessions = await Promise.all(sessions.map(session => this.revokeSession(session.id)));
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
    __param(0, (0, common_1.Inject)('CLERK_OPTIONS')),
    __metadata("design:paramtypes", [Object])
], ClerkSessionService);
//# sourceMappingURL=clerk.session.service.js.map