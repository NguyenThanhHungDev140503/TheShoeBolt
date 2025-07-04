import { Controller, Post, Req, Res, Headers, Logger, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Webhook } from 'svix';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EnvConfigService } from '../../config/env.config';
import { UsersService } from '../users/users.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class ClerkWebhookController {
  private readonly logger = new Logger(ClerkWebhookController.name);

  constructor(
    private readonly envConfig: EnvConfigService,
    private readonly usersService: UsersService,
  ) {}

  @Post('clerk')
  @ApiOperation({ summary: 'Handle Clerk webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
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

      this.logger.log(`Webhook event received: ${evt.type} for ${evt.data?.id || 'unknown'}`);

      // Process webhook events
      switch (evt.type) {
        case 'user.created':
          await this.handleUserCreated(evt.data);
          break;
        case 'user.updated':
          await this.handleUserUpdated(evt.data);
          break;
        case 'user.deleted':
          await this.handleUserDeleted(evt.data);
          break;
        case 'session.created':
          await this.handleSessionCreated(evt.data);
          break;
        case 'session.ended':
          await this.handleSessionEnded(evt.data);
          break;
        default:
          this.logger.warn(`Unhandled webhook event type: ${evt.type}`);
      }

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
      // Implement session tracking logic if needed
      this.logger.log(`Session created: ${sessionData.id} for user: ${sessionData.user_id}`);
    } catch (error) {
      this.logger.error(`Failed to process session.created for ${sessionData.id}:`, error);
    }
  }

  private async handleSessionEnded(sessionData: any) {
    try {
      this.logger.debug(`Processing session.ended for session: ${sessionData.id}`);
      // Implement session cleanup logic if needed
      this.logger.log(`Session ended: ${sessionData.id} for user: ${sessionData.user_id}`);
    } catch (error) {
      this.logger.error(`Failed to process session.ended for ${sessionData.id}:`, error);
    }
  }
}
