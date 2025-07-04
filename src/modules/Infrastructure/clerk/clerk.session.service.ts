import { Injectable, Inject, UnauthorizedException, Logger, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { ClerkClient } from '@clerk/backend';
import { ClerkModuleOptions } from './clerk.module';
import { CLERK_CLIENT } from './providers/clerk-client.provider';

@Injectable()
export class ClerkSessionService {
  private readonly logger = new Logger(ClerkSessionService.name);

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
      this.logger.debug(`Attempting to get sessions for user: ${userId}`);
      const sessions = await this.clerkClient.sessions.getSessionList({
        userId,
      });
      this.logger.debug(`Successfully found ${sessions.data?.length || 0} sessions for user: ${userId}`);
      return sessions;
    } catch (error) {
      this.logger.error(`Failed to get sessions for user ${userId}:`, error.stack);

      // Kiểm tra error format từ Clerk API - có thể là error.status hoặc error.response?.status
      const statusCode = error.status || error.response?.status || error.statusCode;

      if (statusCode === 404) {
        throw new NotFoundException(`User with ID ${userId} not found.`);
      }
      if (statusCode === 403) {
        throw new ForbiddenException(`Access denied to retrieve sessions for user ${userId}.`);
      }
      if (statusCode === 401) {
        throw new UnauthorizedException(`Authentication failed for user ${userId}.`);
      }

      // Log chi tiết error để debugging
      this.logger.error(`Unexpected error details:`, {
        message: error.message,
        status: statusCode,
        response: error.response?.data,
        stack: error.stack
      });

      throw new InternalServerErrorException('An unexpected error occurred while retrieving user sessions.');
    }
  }

  /**
   * Revoke a specific session
   * @param sessionId - Session ID to revoke
   * @returns Revoked session data
   */
  async revokeSession(sessionId: string) {
    try {
      this.logger.debug(`Attempting to revoke session: ${sessionId}`);
      const revokedSession = await this.clerkClient.sessions.revokeSession(sessionId);
      this.logger.debug(`Successfully revoked session: ${sessionId}`);
      return revokedSession;
    } catch (error) {
      this.logger.error(`Failed to revoke session ${sessionId}:`, error.stack);

      const statusCode = error.status ?? error.response?.status ?? error.statusCode;

      if (statusCode === 404) {
        throw new NotFoundException(`Session with ID ${sessionId} not found.`);
      }
      if (statusCode === 403) {
        throw new ForbiddenException(`Access denied to revoke session ${sessionId}.`);
      }
      if (statusCode === 401) {
        throw new UnauthorizedException(`Authentication failed for session ${sessionId}.`);
      }

      this.logger.error(`Unexpected error details:`, {
        message: error.message,
        status: statusCode,
        response: error.response?.data,
        stack: error.stack
      });

      throw new InternalServerErrorException('An unexpected error occurred while revoking session.');
    }
  }

  /**
   * Verify a session token and return session claims
   * @param token - Session token to verify
   * @returns Session claims if valid
   */
  async verifySessionToken(token: string) {
    try {
      this.logger.debug(`Attempting to verify session token`);

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
        this.logger.warn('Session token verification failed - token is not valid or expired');
        throw new UnauthorizedException('Token is not valid or expired');
      }

      const authObject = authState.toAuth();
      this.logger.debug(`Successfully verified session token for session: ${authObject.sessionClaims?.sid}`);
      return authObject.sessionClaims;
    } catch (error) {
      this.logger.error(`Session token verification failed:`, error.stack);

      // If it's already an UnauthorizedException, re-throw it
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Handle unexpected errors
      this.logger.error(`Unexpected token verification error details:`, {
        message: error.message,
        stack: error.stack
      });

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
      this.logger.debug(`Attempting to get session details: ${sessionId}`);
      const session = await this.clerkClient.sessions.getSession(sessionId);
      this.logger.debug(`Successfully retrieved session: ${sessionId}`);
      return session;
    } catch (error) {
      this.logger.error(`Failed to get session ${sessionId}:`, error.stack);

      const statusCode = error.status ?? error.response?.status ?? error.statusCode;

      if (statusCode === 404) {
        throw new NotFoundException(`Session with ID ${sessionId} not found.`);
      }
      if (statusCode === 403) {
        throw new ForbiddenException(`Access denied to retrieve session ${sessionId}.`);
      }
      if (statusCode === 401) {
        throw new UnauthorizedException(`Authentication failed for session ${sessionId}.`);
      }

      this.logger.error(`Unexpected error details:`, {
        message: error.message,
        status: statusCode,
        response: error.response?.data,
        stack: error.stack
      });

      throw new InternalServerErrorException('An unexpected error occurred while retrieving session.');
    }
  }

  /**
   * Get user details by user ID
   * @param userId - User ID
   * @returns User details
   */
  async getUser(userId: string) {
    try {
      this.logger.debug(`Attempting to get user details: ${userId}`);
      const user = await this.clerkClient.users.getUser(userId);
      this.logger.debug(`Successfully retrieved user: ${userId}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to get user ${userId}:`, error.stack);

      const statusCode = error.status ?? error.response?.status ?? error.statusCode;

      if (statusCode === 404) {
        throw new NotFoundException(`User with ID ${userId} not found.`);
      }
      if (statusCode === 403) {
        throw new ForbiddenException(`Access denied to retrieve user ${userId}.`);
      }
      if (statusCode === 401) {
        throw new UnauthorizedException(`Authentication failed for user ${userId}.`);
      }

      this.logger.error(`Unexpected error details:`, {
        message: error.message,
        status: statusCode,
        response: error.response?.data,
        stack: error.stack
      });

      throw new InternalServerErrorException('An unexpected error occurred while retrieving user.');
    }
  }

  /**
   * Verify token and get complete authentication data using authenticateRequest
   * @param token - Session token to verify
   * @returns Complete authentication data including user, session, and claims
   */
  async verifyTokenAndGetAuthData(token: string) {
    try {
      this.logger.debug(`Attempting to verify token and get auth data`);

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
        this.logger.warn('Token authentication failed - token is not valid or expired');
        throw new UnauthorizedException('Token is not valid or expired');
      }

      const authObject = authState.toAuth();
      const sessionClaims = authObject.sessionClaims;

      // Get session information
      const session = await this.getSession(sessionClaims.sid);

      if (!session || session.status !== 'active') {
        this.logger.warn(`Session validation failed - session ${sessionClaims.sid} is invalid or inactive`);
        throw new UnauthorizedException('Invalid or inactive session');
      }

      // Get user information
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
    } catch (error) {
      this.logger.error(`Authentication failed:`, error.stack);

      // If it's already a specific exception from getSession or getUser, re-throw it
      if (error instanceof NotFoundException ||
          error instanceof ForbiddenException ||
          error instanceof UnauthorizedException ||
          error instanceof InternalServerErrorException) {
        throw error;
      }

      // Handle unexpected errors
      this.logger.error(`Unexpected authentication error details:`, {
        message: error.message,
        stack: error.stack
      });

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
      this.logger.debug(`Attempting to revoke all sessions for user: ${userId}`);

      // Get all user sessions first
      const sessionsResponse = await this.getSessionList(userId);

      if (!sessionsResponse.data || sessionsResponse.data.length === 0) {
        this.logger.debug(`No sessions found for user: ${userId}`);
        return [];
      }

      // Revoke each session
      const revokedSessions = await Promise.all(
        sessionsResponse.data.map((session: any) => this.revokeSession(session.id))
      );

      this.logger.log(`Successfully revoked ${revokedSessions.length} sessions for user: ${userId}`);
      return revokedSessions;
    } catch (error) {
      this.logger.error(`Failed to revoke all user sessions for ${userId}:`, error.stack);

      // If it's already a specific exception from getSessionList or revokeSession, re-throw it
      if (error instanceof NotFoundException ||
          error instanceof ForbiddenException ||
          error instanceof UnauthorizedException ||
          error instanceof InternalServerErrorException) {
        throw error;
      }

      // Handle unexpected errors
      this.logger.error(`Unexpected error details:`, {
        message: error.message,
        stack: error.stack
      });

      throw new InternalServerErrorException('An unexpected error occurred while revoking all user sessions.');
    }
  }
}