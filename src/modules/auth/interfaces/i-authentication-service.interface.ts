import { ExecutionContext } from '@nestjs/common';
import { ClerkClient } from '@clerk/backend';
import { JwtPayload } from '@clerk/types';

/**
 * Interface for authentication service that handles token verification and session management
 * This interface abstracts the authentication provider implementation from the application layer
 */
export interface IAuthenticationService {
  /**
   * Verify token and get complete authentication data
   * @param token - Session token to verify
   * @returns Complete authentication data including user, session, and claims
   */
  verifyTokenAndGetAuthData(token: string): Promise<{
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      publicMetadata: any;
    };
    session: any;
    sessionClaims: JwtPayload;
  }>;

  /**
   * Get session details by session ID
   * @param sessionId - Session ID
   * @returns Session details
   */
  getSession(sessionId: string): Promise<any>;

  /**
   * Retrieves all active sessions for a specific user
   * @param userId - The user ID
   * @returns Array of user sessions
   */
  getSessionList(userId: string): Promise<any>;

  /**
   * Revoke a specific session
   * @param sessionId - Session ID to revoke
   * @returns Revoked session data
   */
  revokeSession(sessionId: string): Promise<any>;

  /**
   * Revoke all sessions for a specific user
   * @param userId - User ID whose sessions should be revoked
   * @returns Array of revoked sessions
   */
  revokeAllUserSessions(userId: string): Promise<any>;

  /**
   * Verify a session token and return session claims
   * @param token - Session token to verify
   * @returns Session claims if valid
   */
  verifySessionToken(token: string): Promise<JwtPayload>;

  /**
   * Get user details by user ID
   * @param userId - User ID
   * @returns User details
   */
  getUser(userId: string): Promise<any>;
}
