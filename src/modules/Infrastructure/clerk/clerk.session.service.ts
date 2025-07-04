import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { ClerkClient } from '@clerk/backend';
import { ClerkModuleOptions } from './clerk.module';
import { CLERK_CLIENT } from './providers/clerk-client.provider';

@Injectable()
export class ClerkSessionService {
  constructor(
    @Inject(CLERK_CLIENT) private readonly clerkClient: ClerkClient,
    @Inject('CLERK_OPTIONS') private readonly options: ClerkModuleOptions,
  ) {}

  /**
   * Get list of sessions for a specific user
   * @param userId - Clerk user ID
   * @returns Array of user sessions
   */
  async getSessionList(userId: string) {
    try {
      const sessions = await this.clerkClient.sessions.getSessionList({
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
      const revokedSession = await this.clerkClient.sessions.revokeSession(sessionId);
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
      // Create a minimal Web API Request for authentication with both headers and cookies
      const headers = new Headers({
        'Authorization': `Bearer ${token}`,
        'Cookie': `__session=${token}`, // Include session token in cookies as well
      });

      const webRequest = new globalThis.Request('https://api.clerk.dev', {
        method: 'GET',
        headers: headers,
      });

      const authState = await this.clerkClient.authenticateRequest(webRequest, {
        secretKey: this.options.secretKey,
      });

      if (!authState.isAuthenticated) {
        throw new UnauthorizedException('Token is not valid or expired');
      }

      const authObject = authState.toAuth();
      return authObject.sessionClaims;
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
      const session = await this.clerkClient.sessions.getSession(sessionId);
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
      const user = await this.clerkClient.users.getUser(userId);
      return user;
    } catch (error) {
      throw new UnauthorizedException(`Failed to get user: ${error.message}`);
    }
  }

  /**
   * Verify token and get complete authentication data using authenticateRequest
   * @param token - Session token to verify
   * @returns Complete authentication data including user, session, and claims
   */
  async verifyTokenAndGetAuthData(token: string) {
    try {
      // Create a minimal Web API Request for authentication with both headers and cookies
      const headers = new Headers({
        'Authorization': `Bearer ${token}`,
        'Cookie': `__session=${token}`, // Include session token in cookies as well
      });

      const webRequest = new globalThis.Request('https://api.clerk.dev', {
        method: 'GET',
        headers: headers,
      });

      // Use authenticateRequest for comprehensive authentication
      const authState = await this.clerkClient.authenticateRequest(webRequest, {
        secretKey: this.options.secretKey,
      });

      if (!authState.isAuthenticated) {
        throw new UnauthorizedException('Token is not valid or expired');
      }

      const authObject = authState.toAuth();
      const sessionClaims = authObject.sessionClaims;

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
      const sessionsResponse = await this.getSessionList(userId);

      // Revoke each session
      const revokedSessions = await Promise.all(
        sessionsResponse.data.map((session: any) => this.revokeSession(session.id))
      );

      return revokedSessions;
    } catch (error) {
      throw new UnauthorizedException(`Failed to revoke all user sessions: ${error.message}`);
    }
  }
}