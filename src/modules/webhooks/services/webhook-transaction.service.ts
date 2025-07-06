import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { WebhookEvent, WebhookEventStatus } from '../entities/webhook-event.entity';
import { UsersService } from '../../users/users.service';
import { SessionTrackingService } from './session-tracking.service';

export interface WebhookProcessingContext {
  eventType: string;
  clerkId?: string;
  payload: any;
  webhookId?: string;
  webhookTimestamp?: Date;
}

@Injectable()
export class WebhookTransactionService {
  private readonly logger = new Logger(WebhookTransactionService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(WebhookEvent)
    private readonly webhookEventRepository: Repository<WebhookEvent>,
    private readonly usersService: UsersService,
    private readonly sessionTrackingService: SessionTrackingService,
  ) {}

  /**
   * Process webhook event within a database transaction
   */
  async processWebhookWithTransaction(context: WebhookProcessingContext): Promise<void> {
    const startTime = Date.now();
    
    // Create webhook event record
    const webhookEvent = await this.createWebhookEvent(context);
    
    try {
      await this.dataSource.transaction(async (manager: EntityManager) => {
        this.logger.debug(`Starting transaction for webhook event: ${context.eventType}`);
        
        // Process the webhook event based on type
        await this.processEventInTransaction(context, manager);
        
        // Mark webhook event as successful
        webhookEvent.markAsSuccess(Date.now() - startTime);
        await manager.save(WebhookEvent, webhookEvent);
        
        this.logger.log(`Successfully processed webhook event: ${context.eventType} for ${context.clerkId}`);
      });
    } catch (error) {
      this.logger.error(`Transaction failed for webhook event: ${context.eventType}`, error);
      
      // Mark webhook event as failed
      webhookEvent.markAsFailed(error.message);
      await this.webhookEventRepository.save(webhookEvent);
      
      throw new InternalServerErrorException(`Failed to process webhook event: ${error.message}`);
    }
  }

  /**
   * Process specific webhook event types within transaction
   */
  private async processEventInTransaction(
    context: WebhookProcessingContext,
    manager: EntityManager
  ): Promise<void> {
    switch (context.eventType) {
      case 'user.created':
        await this.handleUserCreatedInTransaction(context.payload, manager);
        break;
      case 'user.updated':
        await this.handleUserUpdatedInTransaction(context.payload, manager);
        break;
      case 'user.deleted':
        await this.handleUserDeletedInTransaction(context.payload, manager);
        break;
      case 'session.created':
        await this.handleSessionCreatedInTransaction(context.payload, manager);
        break;
      case 'session.ended':
        await this.handleSessionEndedInTransaction(context.payload, manager);
        break;
      default:
        this.logger.warn(`Unhandled webhook event type: ${context.eventType}`);
    }
  }

  /**
   * Handle user.created event within transaction
   */
  private async handleUserCreatedInTransaction(userData: any, manager: EntityManager): Promise<void> {
    this.logger.debug(`Processing user.created in transaction: ${userData.id}`);
    
    // Use the existing UsersService but within transaction context
    // Note: This would require updating UsersService to accept EntityManager
    await this.usersService.syncUserFromClerk(userData);
    
    // Additional transaction-specific operations can be added here
    // For example: indexing in Elasticsearch, sending notifications, etc.
  }

  /**
   * Handle user.updated event within transaction
   */
  private async handleUserUpdatedInTransaction(userData: any, manager: EntityManager): Promise<void> {
    this.logger.debug(`Processing user.updated in transaction: ${userData.id}`);
    
    await this.usersService.syncUserFromClerk(userData);
  }

  /**
   * Handle user.deleted event within transaction
   */
  private async handleUserDeletedInTransaction(userData: any, manager: EntityManager): Promise<void> {
    this.logger.debug(`Processing user.deleted in transaction: ${userData.id}`);
    
    // Find and soft delete user
    const user = await this.usersService.findByClerkId(userData.id);
    if (user) {
      await this.usersService.remove(user.id);
    }
  }

  /**
   * Handle session.created event within transaction
   */
  private async handleSessionCreatedInTransaction(sessionData: any, manager: EntityManager): Promise<void> {
    this.logger.debug(`Processing session.created in transaction: ${sessionData.id}`);
    
    // Find user by clerkId
    const user = await this.usersService.findByClerkId(sessionData.user_id);
    if (!user) {
      throw new Error(`User not found for session creation: ${sessionData.user_id}`);
    }

    // Create session tracking record
    await this.sessionTrackingService.createSession({
      clerkSessionId: sessionData.id,
      userId: user.id,
      createdAt: new Date(sessionData.created_at * 1000),
      lastActivity: sessionData.last_active_at ? new Date(sessionData.last_active_at.timestamp * 1000) : new Date(),
      ipAddress: sessionData.last_active_at?.ip_address,
      userAgent: sessionData.last_active_at?.user_agent,
      sessionMetadata: {
        clerkUserId: sessionData.user_id,
        status: sessionData.status,
        lastActiveAt: sessionData.last_active_at
      }
    });
  }

  /**
   * Handle session.ended event within transaction
   */
  private async handleSessionEndedInTransaction(sessionData: any, manager: EntityManager): Promise<void> {
    this.logger.debug(`Processing session.ended in transaction: ${sessionData.id}`);
    
    // End session tracking record
    await this.sessionTrackingService.endSession(sessionData.id);
  }

  /**
   * Create webhook event record for tracking
   */
  private async createWebhookEvent(context: WebhookProcessingContext): Promise<WebhookEvent> {
    const webhookEvent = this.webhookEventRepository.create({
      eventType: context.eventType,
      clerkId: context.clerkId,
      payload: context.payload,
      webhookId: context.webhookId,
      webhookTimestamp: context.webhookTimestamp,
      status: WebhookEventStatus.PROCESSING,
    });

    return await this.webhookEventRepository.save(webhookEvent);
  }

  /**
   * Get webhook event statistics
   */
  async getWebhookStats(): Promise<{
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    averageProcessingTime: number;
  }> {
    try {
      const [totalEvents, successfulEvents, failedEvents] = await Promise.all([
        this.webhookEventRepository.count(),
        this.webhookEventRepository.count({ where: { status: WebhookEventStatus.SUCCESS } }),
        this.webhookEventRepository.count({ where: { status: WebhookEventStatus.FAILED } })
      ]);

      // Calculate average processing time for successful events
      const successfulEventsWithDuration = await this.webhookEventRepository.find({
        where: { 
          status: WebhookEventStatus.SUCCESS,
        },
        select: ['processingDurationMs']
      });

      let averageProcessingTime = 0;
      if (successfulEventsWithDuration.length > 0) {
        const totalDuration = successfulEventsWithDuration.reduce((sum, event) => {
          return sum + (event.processingDurationMs || 0);
        }, 0);
        averageProcessingTime = totalDuration / successfulEventsWithDuration.length;
      }

      return {
        totalEvents,
        successfulEvents,
        failedEvents,
        averageProcessingTime
      };
    } catch (error) {
      this.logger.error(`Failed to get webhook stats: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to get webhook stats');
    }
  }

  /**
   * Get failed webhook events for retry processing
   */
  async getFailedEvents(limit: number = 10): Promise<WebhookEvent[]> {
    try {
      return await this.webhookEventRepository.find({
        where: { status: WebhookEventStatus.FAILED },
        order: { createdAt: 'ASC' },
        take: limit
      });
    } catch (error) {
      this.logger.error(`Failed to get failed events: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to get failed events');
    }
  }

  /**
   * Retry failed webhook event
   */
  async retryFailedEvent(eventId: string): Promise<void> {
    try {
      const webhookEvent = await this.webhookEventRepository.findOne({
        where: { id: eventId }
      });

      if (!webhookEvent) {
        throw new Error(`Webhook event not found: ${eventId}`);
      }

      if (!webhookEvent.isRetryable()) {
        throw new Error(`Webhook event is not retryable: ${eventId}`);
      }

      webhookEvent.incrementRetry();
      await this.webhookEventRepository.save(webhookEvent);

      // Retry processing
      const context: WebhookProcessingContext = {
        eventType: webhookEvent.eventType,
        clerkId: webhookEvent.clerkId,
        payload: webhookEvent.payload,
        webhookId: webhookEvent.webhookId,
        webhookTimestamp: webhookEvent.webhookTimestamp,
      };

      await this.processWebhookWithTransaction(context);
    } catch (error) {
      this.logger.error(`Failed to retry webhook event: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to retry webhook event: ${error.message}`);
    }
  }
}
