import { Controller, Post, Req, Res, Headers, Logger, HttpStatus, UseFilters, UsePipes, Body } from '@nestjs/common';
import { Request, Response } from 'express';
import { Webhook } from 'svix';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { EnvConfigService } from '../../config/env.config';
import { UsersService } from '../users/users.service';
import { SessionTrackingService } from './services/session-tracking.service';
import { WebhookTransactionService, WebhookProcessingContext } from './services/webhook-transaction.service';
import { WebhookValidationPipe } from './pipes/webhook-validation.pipe';
import { WebhookExceptionFilter } from './filters/webhook-exception.filter';
import { WebhookEventDto } from './dto/clerk-webhook-event.dto';

@ApiTags('Webhooks')
@Controller('webhooks')
export class ClerkWebhookController {
  private readonly logger = new Logger(ClerkWebhookController.name);

  constructor(
    private readonly envConfig: EnvConfigService,
    private readonly usersService: UsersService,
    private readonly sessionTrackingService: SessionTrackingService,
    private readonly webhookTransactionService: WebhookTransactionService,
  ) {}

  @Post('clerk')
  @UseFilters(WebhookExceptionFilter)
  @ApiOperation({ summary: 'Handle Clerk webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature or payload' })
  @ApiResponse({ status: 422, description: 'Unknown event type' })
  async handleClerkWebhook(@Headers() headers, @Req() req: Request, @Res() res: Response) {
    const webhookSecret = this.envConfig.clerk.webhookSecret;
    if (!webhookSecret) {
      this.logger.error('Clerk webhook secret is not configured.');
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Webhook secret not configured'
      });
    }

    try {
      // Get raw body from express.raw() middleware
      const payload = req.body;
      const payloadString = payload.toString();

      const svixHeaders = {
        'svix-id': headers['svix-id'] as string,
        'svix-timestamp': headers['svix-timestamp'] as string,
        'svix-signature': headers['svix-signature'] as string,
      };

      // Verify webhook signature
      const wh = new Webhook(webhookSecret);
      const evt = wh.verify(payloadString, svixHeaders) as any;

      this.logger.log(`Webhook event received: ${evt.type} for ${evt.data?.id ?? 'unknown'}`);

      // Validate webhook event structure using validation pipe
      const validationPipe = new WebhookValidationPipe();
      const validatedEvent = await validationPipe.transform(evt);

      this.logger.debug(`Webhook event validated successfully: ${evt.type}`);

      // Process webhook events using transaction service
      const context: WebhookProcessingContext = {
        eventType: validatedEvent.type,
        clerkId: validatedEvent.data?.id || evt.data?.id,
        payload: validatedEvent.data,
        webhookId: svixHeaders['svix-id'],
        webhookTimestamp: new Date(parseInt(svixHeaders['svix-timestamp']) * 1000),
      };

      await this.webhookTransactionService.processWebhookWithTransaction(context);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Webhook processed successfully',
        eventType: evt.type
      });

    } catch (err) {
      this.logger.error('Error processing Clerk webhook:', {
        error: err.message,
        stack: err.stack,
        headers: headers
      });

      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'Webhook signature verification failed'
      });
    }
  }

  private async handleUserCreated(userData: any) {
    try {
      this.logger.debug(`Processing user.created for user: ${userData.id}`);
      await this.usersService.syncUserFromClerk(userData);
      this.logger.log(`Successfully synced new user: ${userData.id}`);
    } catch (error) {
      this.logger.error(`Failed to sync user.created for ${userData.id}:`, error);
      throw error;
    }
  }

  private async handleUserUpdated(userData: any) {
    try {
      this.logger.debug(`Processing user.updated for user: ${userData.id}`);
      await this.usersService.updateUserFromClerk(userData);
      this.logger.log(`Successfully updated user: ${userData.id}`);
    } catch (error) {
      this.logger.error(`Failed to sync user.updated for ${userData.id}:`, error);
      throw error;
    }
  }

  private async handleUserDeleted(userData: any) {
    try {
      this.logger.debug(`Processing user.deleted for user: ${userData.id}`);
      await this.usersService.deleteUser(userData.id);
      this.logger.log(`Successfully deleted user: ${userData.id}`);
    } catch (error) {
      this.logger.error(`Failed to sync user.deleted for ${userData.id}:`, error);
      throw error;
    }
  }

  private async handleSessionCreated(sessionData: any) {
    try {
      this.logger.debug(`Processing session.created for session: ${sessionData.id}`);

      // Find user by clerkId to get our internal user ID
      const user = await this.usersService.findByClerkId(sessionData.user_id);
      if (!user) {
        this.logger.warn(`User not found for session creation: ${sessionData.user_id}`);
        return;
      }

      // Create session tracking record
      await this.sessionTrackingService.createSession({
        clerkSessionId: sessionData.id,
        userId: user.id,
        createdAt: new Date(sessionData.created_at * 1000), // Convert Unix timestamp
        lastActivity: sessionData.last_active_at ? new Date(sessionData.last_active_at.timestamp * 1000) : new Date(),
        ipAddress: sessionData.last_active_at?.ip_address,
        userAgent: sessionData.last_active_at?.user_agent,
        sessionMetadata: {
          clerkUserId: sessionData.user_id,
          status: sessionData.status,
          lastActiveAt: sessionData.last_active_at
        }
      });

      this.logger.log(`Session tracking created: ${sessionData.id} for user: ${sessionData.user_id}`);
    } catch (error) {
      this.logger.error(`Failed to process session.created for ${sessionData.id}:`, error);
      throw error;
    }
  }

  private async handleSessionEnded(sessionData: any) {
    try {
      this.logger.debug(`Processing session.ended for session: ${sessionData.id}`);

      // End session tracking record
      await this.sessionTrackingService.endSession(sessionData.id);

      this.logger.log(`Session tracking ended: ${sessionData.id} for user: ${sessionData.user_id}`);
    } catch (error) {
      this.logger.error(`Failed to process session.ended for ${sessionData.id}:`, error);
      throw error;
    }
  }
}
