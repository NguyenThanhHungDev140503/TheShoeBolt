import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClerkWebhookController } from './clerk-webhook.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ConfigModule, UsersModule],
  controllers: [ClerkWebhookController],
})
export class WebhooksModule {}
