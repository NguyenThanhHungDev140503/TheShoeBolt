import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClerkSessionService } from './clerk.session.service';
import { ClerkController } from './clerk.controller';

export interface ClerkModuleOptions {
  secretKey: string;
  publishableKey: string;
}

@Module({})
export class ClerkModule {
  static forRoot(options: ClerkModuleOptions): DynamicModule {
    return {
      module: ClerkModule,
      controllers: [ClerkController],
      providers: [
        {
          provide: 'CLERK_OPTIONS',
          useValue: options,
        },
        ClerkSessionService,
      ],
      exports: [ClerkSessionService, 'CLERK_OPTIONS'],
      global: true,
    };
  }

  static forRootAsync(): DynamicModule {
    return {
      module: ClerkModule,
      imports: [ConfigModule],
      controllers: [ClerkController],
      providers: [
        {
          provide: 'CLERK_OPTIONS',
          useFactory: (configService: ConfigService): ClerkModuleOptions => ({
            secretKey: configService.get<string>('CLERK_SECRET_KEY'),
            publishableKey: configService.get<string>('CLERK_PUBLISHABLE_KEY'),
          }),
          inject: [ConfigService],
        },
        ClerkSessionService,
      ],
      exports: [ClerkSessionService, 'CLERK_OPTIONS'],
      global: true,
    };
  }
}