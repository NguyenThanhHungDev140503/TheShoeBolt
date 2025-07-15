import { UserRole } from '../../users/entities/user.entity';

/**
 * Interface representing the user payload structure from Clerk authentication
 * This interface defines the structure of user data attached to requests after authentication
 */
export interface ClerkUserPayload {
  /**
   * Session ID from Clerk
   */
  sessionId?: string;

  /**
   * User ID from Clerk
   */
  userId?: string;

  /**
   * Organization ID from Clerk (if user belongs to an organization)
   */
  orgId?: string;

  /**
   * JWT claims containing user metadata and session information
   */
  claims?: {
    /**
     * Public metadata containing user roles and other public information
     */
    public_metadata?: {
      /**
       * Single role for backward compatibility (current implementation)
       */
      role?: UserRole;

      /**
       * Array of roles for future multiple roles support
       */
      roles?: UserRole[];
    };

    /**
     * Subject claim (typically user ID)
     */
    sub?: string;

    /**
     * Session ID claim
     */
    sid?: string;

    /**
     * Issued at timestamp
     */
    iat?: number;

    /**
     * Expiration timestamp
     */
    exp?: number;

    /**
     * Additional claims as needed
     */
    [key: string]: any;
  };
}
