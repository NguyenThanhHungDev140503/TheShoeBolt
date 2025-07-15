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
var SessionTrackingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionTrackingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_session_entity_1 = require("../entities/user-session.entity");
let SessionTrackingService = SessionTrackingService_1 = class SessionTrackingService {
    constructor(sessionRepository) {
        this.sessionRepository = sessionRepository;
        this.logger = new common_1.Logger(SessionTrackingService_1.name);
    }
    async createSession(sessionData) {
        try {
            this.logger.debug(`Creating session: ${sessionData.clerkSessionId} for user: ${sessionData.userId}`);
            const session = this.sessionRepository.create({
                clerkSessionId: sessionData.clerkSessionId,
                userId: sessionData.userId,
                createdAt: sessionData.createdAt || new Date(),
                lastActivity: sessionData.lastActivity || new Date(),
                ipAddress: sessionData.ipAddress,
                userAgent: sessionData.userAgent,
                sessionMetadata: sessionData.sessionMetadata,
            });
            const savedSession = await this.sessionRepository.save(session);
            this.logger.log(`Session created successfully: ${sessionData.clerkSessionId}`);
            return savedSession;
        }
        catch (error) {
            this.logger.error(`Failed to create session: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to create session');
        }
    }
    async updateSession(clerkSessionId, updateData) {
        try {
            this.logger.debug(`Updating session: ${clerkSessionId}`);
            const session = await this.sessionRepository.findOne({
                where: { clerkSessionId }
            });
            if (!session) {
                throw new common_1.NotFoundException(`Session not found: ${clerkSessionId}`);
            }
            Object.assign(session, updateData);
            const updatedSession = await this.sessionRepository.save(session);
            this.logger.log(`Session updated successfully: ${clerkSessionId}`);
            return updatedSession;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Failed to update session: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to update session');
        }
    }
    async endSession(clerkSessionId) {
        try {
            this.logger.debug(`Ending session: ${clerkSessionId}`);
            const result = await this.sessionRepository.update({ clerkSessionId }, { endedAt: new Date() });
            if (result.affected === 0) {
                this.logger.warn(`Session not found for ending: ${clerkSessionId}`);
                throw new common_1.NotFoundException(`Session not found: ${clerkSessionId}`);
            }
            this.logger.log(`Session ended successfully: ${clerkSessionId}`);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Failed to end session: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to end session');
        }
    }
    async getActiveSessions(userId) {
        try {
            this.logger.debug(`Getting active sessions for user: ${userId}`);
            const sessions = await this.sessionRepository.find({
                where: {
                    userId,
                    endedAt: (0, typeorm_2.IsNull)()
                },
                order: { createdAt: 'DESC' }
            });
            this.logger.debug(`Found ${sessions.length} active sessions for user: ${userId}`);
            return sessions;
        }
        catch (error) {
            this.logger.error(`Failed to get active sessions: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to get active sessions');
        }
    }
    async getSessionByClerkId(clerkSessionId) {
        try {
            this.logger.debug(`Getting session by Clerk ID: ${clerkSessionId}`);
            const session = await this.sessionRepository.findOne({
                where: { clerkSessionId },
                relations: ['user']
            });
            return session;
        }
        catch (error) {
            this.logger.error(`Failed to get session by Clerk ID: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to get session');
        }
    }
    async updateLastActivity(clerkSessionId) {
        try {
            this.logger.debug(`Updating last activity for session: ${clerkSessionId}`);
            const result = await this.sessionRepository.update({ clerkSessionId }, { lastActivity: new Date() });
            if (result.affected === 0) {
                this.logger.warn(`Session not found for activity update: ${clerkSessionId}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to update last activity: ${error.message}`, error.stack);
        }
    }
    async cleanupExpiredSessions(daysOld = 30) {
        try {
            this.logger.debug(`Cleaning up sessions older than ${daysOld} days`);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            const result = await this.sessionRepository
                .createQueryBuilder()
                .delete()
                .where('created_at < :cutoffDate', { cutoffDate })
                .execute();
            const deletedCount = result.affected || 0;
            this.logger.log(`Cleaned up ${deletedCount} expired sessions`);
            return deletedCount;
        }
        catch (error) {
            this.logger.error(`Failed to cleanup expired sessions: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to cleanup expired sessions');
        }
    }
    async getSessionStats(userId) {
        try {
            this.logger.debug(`Getting session stats for user: ${userId}`);
            const [totalSessions, activeSessions] = await Promise.all([
                this.sessionRepository.count({ where: { userId } }),
                this.sessionRepository.count({ where: { userId, endedAt: (0, typeorm_2.IsNull)() } })
            ]);
            const endedSessions = await this.sessionRepository.find({
                where: { userId, endedAt: (0, typeorm_2.IsNull)() },
                select: ['createdAt', 'endedAt']
            });
            let averageSessionDuration = 0;
            if (endedSessions.length > 0) {
                const totalDuration = endedSessions.reduce((sum, session) => {
                    if (session.endedAt) {
                        return sum + (session.endedAt.getTime() - session.createdAt.getTime());
                    }
                    return sum;
                }, 0);
                averageSessionDuration = totalDuration / endedSessions.length;
            }
            return {
                totalSessions,
                activeSessions,
                averageSessionDuration
            };
        }
        catch (error) {
            this.logger.error(`Failed to get session stats: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to get session stats');
        }
    }
};
exports.SessionTrackingService = SessionTrackingService;
exports.SessionTrackingService = SessionTrackingService = SessionTrackingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_session_entity_1.UserSession)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SessionTrackingService);
//# sourceMappingURL=session-tracking.service.js.map