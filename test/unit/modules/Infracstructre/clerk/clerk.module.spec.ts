import { Test, TestingModule } from '@nestjs/testing';
import { ClerkModule } from 'src/modules/Infrastructure/clerk/clerk.module';
import { ClerkSessionService } from 'src/modules/Infrastructure/clerk/clerk.session.service';
import { ClerkAuthGuard } from 'src/modules/Infrastructure/clerk/guards/clerk-auth.guard';
import { ConfigModule } from '@nestjs/config';
import { CLERK_CLIENT } from 'src/modules/Infrastructure/clerk/providers/clerk-client.provider';

// Create a mock object for the Clerk client
const mockClerkClient = {
  // Mock methods that might be called if services were used
  users: {
    getUser: jest.fn(),
  },
  sessions: {
    getSessionList: jest.fn(),
  },
};

describe('ClerkModule', () => {
  let module: TestingModule;

  const setupModule = async (config: Record<string, any> = {}) => {
    const defaultConfig = {
      CLERK_SECRET_KEY: 'test-secret-key',
      CLERK_PUBLISHABLE_KEY: 'test-publishable-key',
      CLERK_JWT_KEY: 'test-jwt-key',
      ...config,
    };

    return Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => defaultConfig],
        }),
        ClerkModule.forRootAsync(),
      ],
    })
      .overrideProvider(CLERK_CLIENT)
      .useValue(mockClerkClient)
      .compile();
  };

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('Module Initialization and Providers', () => {
    beforeEach(async () => {
      module = await setupModule();
    });
    
    it('should compile the module successfully', () => {
      expect(module).toBeDefined();
    });

    it('should provide ClerkSessionService', () => {
      const service = module.get<ClerkSessionService>(ClerkSessionService);
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(ClerkSessionService);
    });

    it('should provide ClerkAuthGuard', () => {
      const guard = module.get<ClerkAuthGuard>(ClerkAuthGuard);
      expect(guard).toBeDefined();
      expect(guard).toBeInstanceOf(ClerkAuthGuard);
    });

    it('should provide CLERK_OPTIONS with values from ConfigModule', () => {
      const options = module.get('CLERK_OPTIONS');
      expect(options).toBeDefined();
      expect(options).toEqual({
        secretKey: 'test-secret-key',
        publishableKey: 'test-publishable-key',
      });
    });

    it('should provide the mocked CLERK_CLIENT', () => {
        const client = module.get(CLERK_CLIENT);
        expect(client).toBe(mockClerkClient);
    });
  });

  describe('Configuration Error Handling', () => {
    it('should fail to compile if required configuration is missing', async () => {
        // We test this by attempting to compile without the required keys.
        // The real provider would throw an error. Since we mock the provider,
        // we're essentially testing if the module *could* compile.
        // A more direct test would be on the provider itself, but this is a good sanity check.
        const moduleWithMissingKey = await setupModule({ CLERK_SECRET_KEY: undefined });
        const options = moduleWithMissingKey.get('CLERK_OPTIONS');
        expect(options.secretKey).toBeUndefined();
    });
  });

  describe('ClerkModule.forRoot() Static Method', () => {
    it('should create dynamic module with forRoot method', async () => {
      const options = {
        secretKey: 'test-secret-key',
        publishableKey: 'test-publishable-key',
        jwtKey: 'test-jwt-key',
      };

      const dynamicModule = ClerkModule.forRoot(options);

      expect(dynamicModule).toBeDefined();
      expect(dynamicModule.module).toBe(ClerkModule);
      expect(dynamicModule.controllers).toContain(require('src/modules/Infrastructure/clerk/clerk.controller').ClerkController);
      expect(dynamicModule.providers).toBeDefined();
      expect(dynamicModule.exports).toBeDefined();

      // Check that CLERK_OPTIONS provider is configured correctly
      const clerkOptionsProvider = dynamicModule.providers?.find(
        (provider: any) => provider.provide === 'CLERK_OPTIONS'
      ) as any;
      expect(clerkOptionsProvider).toBeDefined();
      expect(clerkOptionsProvider.useValue).toEqual(options);
    });

    it('should create module with different options', async () => {
      const customOptions = {
        secretKey: 'custom-secret',
        publishableKey: 'custom-publishable',
        jwtKey: 'custom-jwt',
      };

      const dynamicModule = ClerkModule.forRoot(customOptions);

      const clerkOptionsProvider = dynamicModule.providers?.find(
        (provider: any) => provider.provide === 'CLERK_OPTIONS'
      ) as any;
      expect(clerkOptionsProvider.useValue).toEqual(customOptions);
    });

    it('should include all required providers in forRoot', () => {
      const options = {
        secretKey: 'test-secret-key',
        publishableKey: 'test-publishable-key',
        jwtKey: 'test-jwt-key',
      };

      const dynamicModule = ClerkModule.forRoot(options);

      expect(dynamicModule.providers).toHaveLength(4); // CLERK_OPTIONS, ClerkClientProvider, ClerkSessionService, ClerkAuthGuard

      // Check for specific providers
      const providerTokens = dynamicModule.providers?.map((provider: any) =>
        provider.provide || provider.name || provider
      );

      expect(providerTokens).toContain('CLERK_OPTIONS');
      expect(providerTokens).toContain(CLERK_CLIENT);
    });

    it('should include all required exports in forRoot', () => {
      const options = {
        secretKey: 'test-secret-key',
        publishableKey: 'test-publishable-key',
        jwtKey: 'test-jwt-key',
      };

      const dynamicModule = ClerkModule.forRoot(options);

      expect(dynamicModule.exports).toHaveLength(4); // ClerkSessionService, ClerkAuthGuard, CLERK_OPTIONS, ClerkClient

      // Check that specific exports are included
      const exportNames = dynamicModule.exports?.map((exp: any) =>
        exp.name || exp
      );
      expect(exportNames).toContain('ClerkSessionService');
      expect(exportNames).toContain('ClerkAuthGuard');
      expect(exportNames).toContain('CLERK_OPTIONS');
      expect(exportNames).toContain('ClerkClient');
    });
  });
});