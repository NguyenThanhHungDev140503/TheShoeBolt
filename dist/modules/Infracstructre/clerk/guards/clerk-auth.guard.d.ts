import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ClerkSessionService } from '../clerk.session.service';
export declare class ClerkAuthGuard implements CanActivate {
    private readonly clerkSessionService;
    constructor(clerkSessionService: ClerkSessionService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
