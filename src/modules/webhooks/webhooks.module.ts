import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClerkWebhookController } from './clerk-webhook.controller';
import { UsersModule } from '../users/users.module';
import { SessionTrackingService } from './services/session-tracking.service';
import { WebhookTransactionService } from './services/webhook-transaction.service';
import { WebhookValidationPipe } from './pipes/webhook-validation.pipe';
import { WebhookExceptionFilter } from './filters/webhook-exception.filter';
import { UserSession } from './entities/user-session.entity';
import { WebhookEvent } from './entities/webhook-event.entity';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    TypeOrmModule.forFeature([UserSession, WebhookEvent])
  ],
  controllers: [ClerkWebhookController],
  providers: [
    SessionTrackingService,
    WebhookTransactionService,
    WebhookValidationPipe,
    WebhookExceptionFilter
  ],
  exports: [
    SessionTrackingService,
    WebhookTransactionService,
    WebhookValidationPipe,
    WebhookExceptionFilter
  ],
})
export class WebhooksModule {}
