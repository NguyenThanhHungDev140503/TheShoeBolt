import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';
export declare class ClerkAuthGuard implements CanActivate {
    private readonly clerkClient;
    private readonly configService;
    private readonly logger;
    constructor(clerkClient: ClerkClient, configService: ConfigService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private convertToWebRequest;
}
