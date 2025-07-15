import { CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * Interface for authentication guard that handles request authentication
 * This interface abstracts the authentication guard implementation from the application layer
 */
export interface IAuthGuard extends CanActivate {
  /**
   * Determines if the current request is authenticated
   * @param context - Execution context containing request information
   * @returns Promise<boolean> - true if authenticated, false otherwise
   */
  canActivate(context: ExecutionContext): Promise<boolean>;

  /**
   * Convert Express Request to Web API Request format
   * @param request - Express request object
   * @returns Web API Request object
   */
  convertToWebRequest(request: any): globalThis.Request;
}
