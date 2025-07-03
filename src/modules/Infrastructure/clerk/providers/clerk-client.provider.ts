import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClerkClient, createClerkClient } from '@clerk/backend';

export const CLERK_CLIENT = 'ClerkClient';

export const ClerkClientProvider: Provider = {
  provide: CLERK_CLIENT,
  useFactory: (configService: ConfigService): ClerkClient => {
    const secretKey = configService.get<string>('CLERK_SECRET_KEY');
    const publishableKey = configService.get<string>('CLERK_PUBLISHABLE_KEY');
    const jwtKey = configService.get<string>('CLERK_JWT_KEY');

    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY is not set in environment variables.');
    }
    if (!publishableKey) {
      throw new Error('CLERK_PUBLISHABLE_KEY is not set in environment variables.');
    }
    if (!jwtKey) {
      throw new Error('CLERK_JWT_KEY is not set in environment variables.');
    }

    return createClerkClient({
      secretKey,
      publishableKey,
      jwtKey
    });
  },
  inject: [ConfigService],
};
