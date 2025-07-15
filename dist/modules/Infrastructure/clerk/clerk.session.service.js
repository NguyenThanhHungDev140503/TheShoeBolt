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
var ClerkSessionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkSessionService = void 0;
const common_1 = require("@nestjs/common");
const clerk_client_provider_1 = require("./providers/clerk-client.provider");
let ClerkSessionService = ClerkSessionService_1 = class ClerkSessionService {
    constructor(clerkClient, options) {
        this.clerkClient = clerkClient;
        this.options = options;
        this.logger = new common_1.Logger(ClerkSessionService_1.name);
    }
    async getSessionList(userId) {
        try {
            this.logger.debug(`Attempting to get sessions for user: ${userId}`);
            const sessions = await this.clerkClient.sessions.getSessionList({
                userId,
            });
            this.logger.debug(`Successfully found ${sessions.data?.length || 0} sessions for user: ${userId}`);
            return sessions;
        }
        catch (error) {
            this.logger.error(`Failed to get sessions for user ${userId}:`, error.stack);
            const statusCode = error.status || error.response?.status || error.statusCode;
            if (statusCode === 404) {
                throw new common_1.NotFoundException(`User with ID ${userId} not found.`);
            }
            if (statusCode === 403) {
                throw new common_1.ForbiddenException(`Access denied to retrieve sessions for user ${userId}.`);
            }
            if (statusCode === 401) {
                throw new common_1.UnauthorizedException(`Authentication failed for user ${userId}.`);
            }
            this.logger.error(`Unexpected error details:`, {
                message: error.message,
                status: statusCode,
                response: error.response?.data,
                stack: error.stack
            });
            throw new common_1.InternalServerErrorException('An unexpected error occurred while retrieving user sessions.');
        }
    }
    async revokeSession(sessionId) {
        try {
            this.logger.debug(`Attempting to revoke session: ${sessionId}`);
            const revokedSession = await this.clerkClient.sessions.revokeSession(sessionId);
            this.logger.debug(`Successfully revoked session: ${sessionId}`);
            return revokedSession;
        }
        catch (error) {
            this.logger.error(`Failed to revoke session ${sessionId}:`, error.stack);
            const statusCode = error.status ?? error.response?.status ?? error.statusCode;
            if (statusCode === 404) {
                throw new common_1.NotFoundException(`Session with ID ${sessionId} not found.`);
            }
            if (statusCode === 403) {
                throw new common_1.ForbiddenException(`Access denied to revoke session ${sessionId}.`);
            }
            if (statusCode === 401) {
                throw new common_1.UnauthorizedException(`Authentication failed for session ${sessionId}.`);
            }
            this.logger.error(`Unexpected error details:`, {
                message: error.message,
                status: statusCode,
                response: error.response?.data,
                stack: error.stack
            });
            throw new common_1.InternalServerErrorException('An unexpected error occurred while revoking session.');
        }
    }
    async verifySessionToken(token) {
        try {
            this.logger.debug(`Attempting to verify session token`);
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
                this.logger.warn('Session token verification failed - token is not valid or expired');
                throw new common_1.UnauthorizedException('Token is not valid or expired');
            }
            const authObject = authState.toAuth();
            this.logger.debug(`Successfully verified session token for session: ${authObject.sessionClaims?.sid}`);
            return authObject.sessionClaims;
        }
        catch (error) {
            this.logger.error(`Session token verification failed:`, error.stack);
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            this.logger.error(`Unexpected token verification error details:`, {
                message: error.message,
                stack: error.stack
            });
            throw new common_1.UnauthorizedException(`Invalid session token: ${error.message}`);
        }
    }
    async getSession(sessionId) {
        try {
            this.logger.debug(`Attempting to get session details: ${sessionId}`);
            const session = await this.clerkClient.sessions.getSession(sessionId);
            this.logger.debug(`Successfully retrieved session: ${sessionId}`);
            return session;
        }
        catch (error) {
            this.logger.error(`Failed to get session ${sessionId}:`, error.stack);
            const statusCode = error.status ?? error.response?.status ?? error.statusCode;
            if (statusCode === 404) {
                throw new common_1.NotFoundException(`Session with ID ${sessionId} not found.`);
            }
            if (statusCode === 403) {
                throw new common_1.ForbiddenException(`Access denied to retrieve session ${sessionId}.`);
            }
            if (statusCode === 401) {
                throw new common_1.UnauthorizedException(`Authentication failed for session ${sessionId}.`);
            }
            this.logger.error(`Unexpected error details:`, {
                message: error.message,
                status: statusCode,
                response: error.response?.data,
                stack: error.stack
            });
            throw new common_1.InternalServerErrorException('An unexpected error occurred while retrieving session.');
        }
    }
    async getUser(userId) {
        try {
            this.logger.debug(`Attempting to get user details: ${userId}`);
            const user = await this.clerkClient.users.getUser(userId);
            this.logger.debug(`Successfully retrieved user: ${userId}`);
            return user;
        }
        catch (error) {
            this.logger.error(`Failed to get user ${userId}:`, error.stack);
            const statusCode = error.status ?? error.response?.status ?? error.statusCode;
            if (statusCode === 404) {
                throw new common_1.NotFoundException(`User with ID ${userId} not found.`);
            }
            if (statusCode === 403) {
                throw new common_1.ForbiddenException(`Access denied to retrieve user ${userId}.`);
            }
            if (statusCode === 401) {
                throw new common_1.UnauthorizedException(`Authentication failed for user ${userId}.`);
            }
            this.logger.error(`Unexpected error details:`, {
                message: error.message,
                status: statusCode,
                response: error.response?.data,
                stack: error.stack
            });
            throw new common_1.InternalServerErrorException('An unexpected error occurred while retrieving user.');
        }
    }
    async verifyTokenAndGetAuthData(token) {
        try {
            this.logger.debug(`Attempting to verify token and get auth data`);
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
                this.logger.warn('Token authentication failed - token is not valid or expired');
                throw new common_1.UnauthorizedException('Token is not valid or expired');
            }
            const authObject = authState.toAuth();
            const sessionClaims = authObject.sessionClaims;
            const session = await this.getSession(sessionClaims.sid);
            if (!session || session.status !== 'active') {
                this.logger.warn(`Session validation failed - session ${sessionClaims.sid} is invalid or inactive`);
                throw new common_1.UnauthorizedException('Invalid or inactive session');
            }
            const user = await this.getUser(session.userId);
            this.logger.debug(`Successfully verified token and retrieved auth data for user: ${user.id}`);
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
            this.logger.error(`Authentication failed:`, error.stack);
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException ||
                error instanceof common_1.UnauthorizedException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error(`Unexpected authentication error details:`, {
                message: error.message,
                stack: error.stack
            });
            throw new common_1.UnauthorizedException(`Authentication failed: ${error.message}`);
        }
    }
    async revokeAllUserSessions(userId) {
        try {
            this.logger.debug(`Attempting to revoke all sessions for user: ${userId}`);
            const sessionsResponse = await this.getSessionList(userId);
            if (!sessionsResponse.data || sessionsResponse.data.length === 0) {
                this.logger.debug(`No sessions found for user: ${userId}`);
                return [];
            }
            const revokedSessions = await Promise.all(sessionsResponse.data.map((session) => this.revokeSession(session.id)));
            this.logger.log(`Successfully revoked ${revokedSessions.length} sessions for user: ${userId}`);
            return revokedSessions;
        }
        catch (error) {
            this.logger.error(`Failed to revoke all user sessions for ${userId}:`, error.stack);
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException ||
                error instanceof common_1.UnauthorizedException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error(`Unexpected error details:`, {
                message: error.message,
                stack: error.stack
            });
            throw new common_1.InternalServerErrorException('An unexpected error occurred while revoking all user sessions.');
        }
    }
};
exports.ClerkSessionService = ClerkSessionService;
exports.ClerkSessionService = ClerkSessionService = ClerkSessionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(clerk_client_provider_1.CLERK_CLIENT)),
    __param(1, (0, common_1.Inject)('CLERK_OPTIONS')),
    __metadata("design:paramtypes", [Object, Object])
], ClerkSessionService);
//# sourceMappingURL=clerk.session.service.js.map