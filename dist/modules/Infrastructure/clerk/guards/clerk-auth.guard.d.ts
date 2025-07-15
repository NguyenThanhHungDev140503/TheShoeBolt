import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';
import { IAuthGuard } from '../../../auth/interfaces/i-auth-guard.interface';
export declare class ClerkAuthGuard implements IAuthGuard {
    private readonly clerkClient;
    private readonly configService;
    private readonly logger;
    constructor(clerkClient: ClerkClient, configService: ConfigService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    convertToWebRequest(expressRequest: Request): globalThis.Request;
}
