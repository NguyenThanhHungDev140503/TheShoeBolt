import { Request, Response } from 'express';
import { EnvConfigService } from '../../config/env.config';
import { UsersService } from '../users/users.service';
import { SessionTrackingService } from './services/session-tracking.service';
import { WebhookTransactionService } from './services/webhook-transaction.service';
export declare class ClerkWebhookController {
    private readonly envConfig;
    private readonly usersService;
    private readonly sessionTrackingService;
    private readonly webhookTransactionService;
    private readonly logger;
    constructor(envConfig: EnvConfigService, usersService: UsersService, sessionTrackingService: SessionTrackingService, webhookTransactionService: WebhookTransactionService);
    handleClerkWebhook(headers: any, req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    private handleUserCreated;
    private handleUserUpdated;
    private handleUserDeleted;
    private handleSessionCreated;
    private handleSessionEnded;
}
