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
   * Verify a session token and return session claims
   * @param token - Session token to verify
   * @returns Session claims if valid
   */
  async verifySessionToken(token: string) {
    try {
      const sessionClaims = await this.clerk.verifyToken(token, {
        secretKey: this.options.secretKey,
        issuer: `https://clerk.${this.options.publishableKey.split('_')[1]}.lcl.dev`,
      });
      return sessionClaims;
    } catch (error) {
      throw new UnauthorizedException(`Invalid session token: ${error.message}`);
    }
  }

  /**
   * Get session details by session ID
   * @param sessionId - Session ID
   * @returns Session details
   */
  async getSession(sessionId: string) {
    try {
      const session = await this.clerk.sessions.getSession(sessionId);
      return session;
    } catch (error) {
      throw new UnauthorizedException(`Failed to get session: ${error.message}`);
    }
  }

  /**
   * Get user details by user ID
   * @param userId - User ID
   * @returns User details
   */
  async getUser(userId: string) {
    try {
      const user = await this.clerk.users.getUser(userId);
      return user;
    } catch (error) {
      throw new UnauthorizedException(`Failed to get user: ${error.message}`);
    }
  }

  /**
   * Verify token and get complete authentication data
   * @param token - Session token to verify
   * @returns Complete authentication data including user, session, and claims
   */
  async verifyTokenAndGetAuthData(token: string) {
    try {
      // Verify the session token
      const sessionClaims = await this.verifySessionToken(token);

      // Get session information
      const session = await this.getSession(sessionClaims.sid);
      
      if (!session || session.status !== 'active') {
        throw new UnauthorizedException('Invalid or inactive session');
      }

      // Get user information
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
    } catch (error) {
      throw new UnauthorizedException(`Authentication failed: ${error.message}`);
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