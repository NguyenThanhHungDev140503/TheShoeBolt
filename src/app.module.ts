import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { redisStore } from 'cache-manager-redis-yet';
import { APP_GUARD } from '@nestjs/core';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { EmailsModule } from './modules/emails/emails.module';
import { QueuesModule } from './modules/queues/queues.module';
import { HealthModule } from './modules/health/health.module';
import { ElasticsearchModule } from './modules/elasticsearch/elasticsearch.module';
import { ChatModule } from './modules/chat/chat.module';
import { ClerkModule } from './modules/Infrastructure/clerk/clerk.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

// Interface imports for Dependency Inversion
import { IAuthenticationService } from './modules/auth/interfaces/i-authentication-service.interface';
import { IAuthGuard } from './modules/auth/interfaces/i-auth-guard.interface';
import { ClerkSessionService } from './modules/Infrastructure/clerk/clerk.session.service';
import { ClerkAuthGuard } from './modules/Infrastructure/clerk/guards/clerk-auth.guard';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { redisConfig } from './config/redis.config';
import { elasticsearchConfig } from './config/elasticsearch.config';
import { mongodbConfig } from './config/mongodb.config';
import { validateEnvironment } from './config/env.validation';
import { EnvConfigService } from './config/env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [databaseConfig, redisConfig, elasticsearchConfig, mongodbConfig],
      validate: validateEnvironment,
      validationOptions: {
        allowUnknown: false,
        abortEarly: false,
      },
    }),
    
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),

    ThrottlerModule.forRootAsync({
      inject: [EnvConfigService],
      useFactory: (envConfig: EnvConfigService) => [
        {
          ttl: envConfig.throttle.ttl,
          limit: envConfig.throttle.limit,
        },
      ],
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      inject: [EnvConfigService],
      useFactory: async (envConfig: EnvConfigService) => ({
        store: redisStore,
        host: envConfig.redis.host,
        port: envConfig.redis.port,
        password: envConfig.redis.password,
        ttl: envConfig.cache.ttl,
      }),
    }),

    DatabaseModule,
    AuthModule,
    UsersModule,
    PaymentsModule,
    EmailsModule,
    QueuesModule,
    HealthModule,
    ElasticsearchModule,
    ChatModule,
    ClerkModule.forRootAsync(),
    WebhooksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EnvConfigService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Interface implementations for Dependency Inversion
    {
      /* 
      
      
      Có thể có nhiều implementation:  ClerkSessionService, Auth0Service, FirebaseAuthService
      Switch giữa các provider chỉ cần thay đổi DI configuration
      Code business logic không cần thay đổi
      
      
      */
      provide: 'IAuthenticationService', 
      useExisting: ClerkSessionService,
    },
    {
      provide: 'IAuthGuard',
      useExisting: ClerkAuthGuard,
    },
  ],
  exports: [EnvConfigService],
})
export class AppModule {}