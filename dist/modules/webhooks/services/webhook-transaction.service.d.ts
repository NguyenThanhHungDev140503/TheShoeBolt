import { Repository, DataSource } from 'typeorm';
import { WebhookEvent } from '../entities/webhook-event.entity';
import { UsersService } from '../../users/users.service';
import { SessionTrackingService } from './session-tracking.service';
export interface WebhookProcessingContext {
    eventType: string;
    clerkId?: string;
    payload: any;
    webhookId?: string;
    webhookTimestamp?: Date;
}
export declare class WebhookTransactionService {
    private readonly dataSource;
    private readonly webhookEventRepository;
    private readonly usersService;
    private readonly sessionTrackingService;
    private readonly logger;
    constructor(dataSource: DataSource, webhookEventRepository: Repository<WebhookEvent>, usersService: UsersService, sessionTrackingService: SessionTrackingService);
    processWebhookWithTransaction(context: WebhookProcessingContext): Promise<void>;
    private processEventInTransaction;
    private handleUserCreatedInTransaction;
    private handleUserUpdatedInTransaction;
    private handleUserDeletedInTransaction;
    private handleSessionCreatedInTransaction;
    private handleSessionEndedInTransaction;
    private createWebhookEvent;
    getWebhookStats(): Promise<{
        totalEvents: number;
        successfulEvents: number;
        failedEvents: number;
        averageProcessingTime: number;
    }>;
    getFailedEvents(limit?: number): Promise<WebhookEvent[]>;
    retryFailedEvent(eventId: string): Promise<void>;
}
