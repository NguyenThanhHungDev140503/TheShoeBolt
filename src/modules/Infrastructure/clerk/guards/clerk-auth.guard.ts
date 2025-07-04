import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { ClerkClient } from '@clerk/backend';
import { CLERK_CLIENT } from '../providers/clerk-client.provider';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  constructor(
    @Inject(CLERK_CLIENT) private readonly clerkClient: ClerkClient,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    try {
      // Convert Express Request to Web API Request for Clerk
      const webRequest = this.convertToWebRequest(request);

      // Use authenticateRequest from ClerkClient
      const authState = await this.clerkClient.authenticateRequest(webRequest, {
        jwtKey: this.configService.get('CLERK_JWT_KEY'),
        secretKey: this.configService.get('CLERK_SECRET_KEY'),
      });

      if (!authState.isAuthenticated) {
        this.logger.error('User not authenticated');
        throw new UnauthorizedException('User not authenticated');
      }

      // Get auth object from authenticated state
      const authObject = authState.toAuth();

      // Attach user info to request
      request['clerkUser'] = {
        sessionId: authObject.sessionId,
        userId: authObject.userId,
        orgId: authObject.orgId,
        claims: authObject.sessionClaims
      };
      this.logger.debug(`User ${authObject.userId} authenticated`);
      return true;
    } catch (error) {
      this.logger.error(`Authentication failed: ${error.message}`);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  /**
   * Convert Express Request to Web API Request for Clerk
   */
  private convertToWebRequest(expressRequest: Request): globalThis.Request {
    const url = `${expressRequest.protocol}://${expressRequest.get('host')}${expressRequest.originalUrl}`;

    // Create headers object
    const headers = new Headers();
    Object.entries(expressRequest.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers.set(key, value);
      } else if (Array.isArray(value)) {
        headers.set(key, value.join(', '));
      }
    });

    // Add cookies to headers if they exist
    if (expressRequest.cookies && Object.keys(expressRequest.cookies).length > 0) {
      const cookieString = Object.entries(expressRequest.cookies)
        .map(([key, value]) => `${key}=${String(value)}`)
        .join('; ');
      headers.set('Cookie', cookieString);
    }

    return new globalThis.Request(url, {
      method: expressRequest.method,
      headers: headers,
    });
  }
}