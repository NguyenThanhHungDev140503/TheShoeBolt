import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { UserSession } from '../entities/user-session.entity';
import { CreateSessionDto } from '../dto/create-session.dto';
import { UpdateSessionDto } from '../dto/update-session.dto';

@Injectable()
export class SessionTrackingService {
  private readonly logger = new Logger(SessionTrackingService.name);

  constructor(
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
  ) {}

  /**
   * Create a new user session
   */
  async createSession(sessionData: CreateSessionDto): Promise<UserSession> {
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
    } catch (error) {
      this.logger.error(`Failed to create session: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create session');
    }
  }

  /**
   * Update an existing session
   */
  async updateSession(clerkSessionId: string, updateData: UpdateSessionDto): Promise<UserSession> {
    try {
      this.logger.debug(`Updating session: ${clerkSessionId}`);

      const session = await this.sessionRepository.findOne({
        where: { clerkSessionId }
      });

      if (!session) {
        throw new NotFoundException(`Session not found: ${clerkSessionId}`);
      }

      Object.assign(session, updateData);
      const updatedSession = await this.sessionRepository.save(session);
      
      this.logger.log(`Session updated successfully: ${clerkSessionId}`);
      return updatedSession;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update session: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update session');
    }
  }

  /**
   * End a session by setting endedAt timestamp
   */
  async endSession(clerkSessionId: string): Promise<void> {
    try {
      this.logger.debug(`Ending session: ${clerkSessionId}`);

      const result = await this.sessionRepository.update(
        { clerkSessionId },
        { endedAt: new Date() }
      );

      if (result.affected === 0) {
        this.logger.warn(`Session not found for ending: ${clerkSessionId}`);
        throw new NotFoundException(`Session not found: ${clerkSessionId}`);
      }

      this.logger.log(`Session ended successfully: ${clerkSessionId}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to end session: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to end session');
    }
  }

  /**
   * Get active sessions for a user
   */
  async getActiveSessions(userId: string): Promise<UserSession[]> {
    try {
      this.logger.debug(`Getting active sessions for user: ${userId}`);

      const sessions = await this.sessionRepository.find({
        where: { 
          userId, 
          endedAt: IsNull() 
        },
        order: { createdAt: 'DESC' }
      });

      this.logger.debug(`Found ${sessions.length} active sessions for user: ${userId}`);
      return sessions;
    } catch (error) {
      this.logger.error(`Failed to get active sessions: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to get active sessions');
    }
  }

  /**
   * Get session by Clerk session ID
   */
  async getSessionByClerkId(clerkSessionId: string): Promise<UserSession | null> {
    try {
      this.logger.debug(`Getting session by Clerk ID: ${clerkSessionId}`);

      const session = await this.sessionRepository.findOne({
        where: { clerkSessionId },
        relations: ['user']
      });

      return session;
    } catch (error) {
      this.logger.error(`Failed to get session by Clerk ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to get session');
    }
  }

  /**
   * Update last activity for a session
   */
  async updateLastActivity(clerkSessionId: string): Promise<void> {
    try {
      this.logger.debug(`Updating last activity for session: ${clerkSessionId}`);

      const result = await this.sessionRepository.update(
        { clerkSessionId },
        { lastActivity: new Date() }
      );

      if (result.affected === 0) {
        this.logger.warn(`Session not found for activity update: ${clerkSessionId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to update last activity: ${error.message}`, error.stack);
      // Don't throw error for activity updates to avoid breaking main flow
    }
  }

  /**
   * Clean up expired sessions (sessions older than specified days)
   */
  async cleanupExpiredSessions(daysOld: number = 30): Promise<number> {
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
    } catch (error) {
      this.logger.error(`Failed to cleanup expired sessions: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to cleanup expired sessions');
    }
  }

  /**
   * Get session statistics for a user
   */
  async getSessionStats(userId: string): Promise<{
    totalSessions: number;
    activeSessions: number;
    averageSessionDuration: number;
  }> {
    try {
      this.logger.debug(`Getting session stats for user: ${userId}`);

      const [totalSessions, activeSessions] = await Promise.all([
        this.sessionRepository.count({ where: { userId } }),
        this.sessionRepository.count({ where: { userId, endedAt: IsNull() } })
      ]);

      // Calculate average session duration for ended sessions
      const endedSessions = await this.sessionRepository.find({
        where: { userId, endedAt: IsNull() },
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
    } catch (error) {
      this.logger.error(`Failed to get session stats: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to get session stats');
    }
  }
}
