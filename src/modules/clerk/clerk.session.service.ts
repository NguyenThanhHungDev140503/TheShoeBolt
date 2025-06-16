import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { ClerkModuleOptions } from './clerk.module';

@Injectable()
export class ClerkSessionService {
  private clerk;

  constructor(
    @Inject('CLERK_OPTIONS') private options: ClerkModuleOptions,
  ) {
    // clerkClient is already initialized with the secret key from environment
    this.clerk = clerkClient;
  }

  /**
   * Get list of sessions for a specific user
   * @param userId - Clerk user ID
   * @returns Array of user sessions
   */
  async getSessionList(userId: string) {
    try {
      const sessions = await this.clerk.sessions.getSessionList({
        userId,
      });
      return sessions;
    } catch (error) {
      throw new UnauthorizedException(`Failed to get sessions: ${error.message}`);
    }
  }

  /**
   * Revoke a specific session
   * @param sessionId - Session ID to revoke
   * @returns Revoked session data
   */
  async revokeSession(sessionId: string) {
    try {
      const revokedSession = await this.clerk.sessions.revokeSession(sessionId);
      return revokedSession;
    } catch (error) {
      throw new UnauthorizedException(`Failed to revoke session: ${error.message}`);
    }
  }

  /**
   * Verify a session token
   * @param token - Session token to verify
   * @returns Session data if valid
   */
  async verifySessionToken(token: string) {
    try {
      const session = await this.clerk.sessions.verifySession(token, {
        secretKey: this.options.secretKey,
      });
      return session;
    } catch (error) {
      throw new UnauthorizedException(`Invalid session token: ${error.message}`);
    }
  }

  /**
   * Revoke all sessions for a specific user
   * @param userId - Clerk user ID
   * @returns Array of revoked sessions
   */
  async revokeAllUserSessions(userId: string) {
    try {
      // Get all user sessions first
      const sessions = await this.getSessionList(userId);
      
      // Revoke each session
      const revokedSessions = await Promise.all(
        sessions.map(session => this.revokeSession(session.id))
      );
      
      return revokedSessions;
    } catch (error) {
      throw new UnauthorizedException(`Failed to revoke all user sessions: ${error.message}`);
    }
  }
}