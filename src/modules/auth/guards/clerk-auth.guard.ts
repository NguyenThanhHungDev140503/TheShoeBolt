import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { ClerkModuleOptions } from '../../clerk/clerk.module';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    @Inject('CLERK_OPTIONS') private options: ClerkModuleOptions,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    try {
      // Extract token from Authorization header
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Missing or invalid authorization header');
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify the session token using Clerk
      const sessionToken = await clerkClient.verifyToken(token, {
        secretKey: this.options.secretKey,
        issuer: `https://clerk.${this.options.publishableKey.split('_')[1]}.lcl.dev`,
      });

      // Get session information
      const session = await clerkClient.sessions.getSession(sessionToken.sid);
      
      if (!session || session.status !== 'active') {
        throw new UnauthorizedException('Invalid or inactive session');
      }

      // Get user information
      const user = await clerkClient.users.getUser(session.userId);

      // Attach user info to request object
      request.user = {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        publicMetadata: user.publicMetadata,
      };
      
      request.session = session;
      request.sessionClaims = sessionToken;

      return true;
    } catch (error) {
      throw new UnauthorizedException(`Authentication failed: ${error.message}`);
    }
  }
}