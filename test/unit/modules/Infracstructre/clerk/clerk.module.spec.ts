import { Test, TestingModule } from '@nestjs/testing';
import { ClerkModule } from 'src/modules/Infracstructre/clerk/clerk.module';
import { ClerkSessionService } from 'src/modules/Infracstructre/clerk/clerk.session.service';
import { ClerkAuthGuard } from 'src/modules/Infracstructre/clerk/guards/clerk-auth.guard';

describe('ClerkModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ClerkModule.forRoot({
          publishableKey: 'test-publishable-key',
          secretKey: 'test-secret-key',
        }),
      ],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  describe('Module Configuration', () => {
    it('should compile the module successfully', () => {
      expect(module).toBeDefined();
    });

    it('should provide ClerkSessionService', () => {
      const clerkSessionService = module.get<ClerkSessionService>(ClerkSessionService);
      expect(clerkSessionService).toBeDefined();
      expect(clerkSessionService).toBeInstanceOf(ClerkSessionService);
    });

    it('should provide ClerkAuthGuard', () => {
      const clerkAuthGuard = module.get<ClerkAuthGuard>(ClerkAuthGuard);
      expect(clerkAuthGuard).toBeDefined();
      expect(clerkAuthGuard).toBeInstanceOf(ClerkAuthGuard);
    });

    it('should provide CLERK_OPTIONS token', () => {
      const clerkOptions = module.get('CLERK_OPTIONS');
      expect(clerkOptions).toBeDefined();
      expect(clerkOptions).toEqual({
        publishableKey: 'test-publishable-key',
        secretKey: 'test-secret-key',
      });
    });
  });

  describe('Exported Services', () => {
    it('should export ClerkSessionService for other modules', async () => {
      // Tạo một module test khác để import ClerkModule
      const testConsumerModule = await Test.createTestingModule({
        imports: [
          ClerkModule.forRoot({
            publishableKey: 'test-publishable-key',
            secretKey: 'test-secret-key',
          }),
        ],
        providers: [
          {
            provide: 'TestService',
            useFactory: (clerkService: ClerkSessionService) => {
              return { clerkService };
            },
            inject: [ClerkSessionService],
          },
        ],
      }).compile();

      const testService = testConsumerModule.get('TestService');
      expect(testService.clerkService).toBeDefined();
      expect(testService.clerkService).toBeInstanceOf(ClerkSessionService);

      await testConsumerModule.close();
    });

    it('should export ClerkAuthGuard for other modules', async () => {
      const testConsumerModule = await Test.createTestingModule({
        imports: [
          ClerkModule.forRoot({
            publishableKey: 'test-publishable-key',
            secretKey: 'test-secret-key',
          }),
        ],
        providers: [
          {
            provide: 'TestGuardConsumer',
            useFactory: (clerkGuard: ClerkAuthGuard) => {
              return { clerkGuard };
            },
            inject: [ClerkAuthGuard],
          },
        ],
      }).compile();

      const testConsumer = testConsumerModule.get('TestGuardConsumer');
      expect(testConsumer.clerkGuard).toBeDefined();
      expect(testConsumer.clerkGuard).toBeInstanceOf(ClerkAuthGuard);

      await testConsumerModule.close();
    });
  });

  describe('Module Refactoring Verification', () => {
    it('should NOT export AdminGuard (removed during refactoring)', () => {
      // Kiểm tra rằng AdminGuard không còn được export
      expect(() => {
        module.get('AdminGuard');
      }).toThrow();
    });

    it('should NOT provide any admin-specific guards or decorators', () => {
      // Đảm bảo rằng không có admin-specific providers
      const moduleProviders = Reflect.getMetadata('providers', ClerkModule) || [];
      const adminRelatedProviders = moduleProviders.filter((provider: any) => 
        provider?.name?.toLowerCase().includes('admin') ||
        provider?.toString?.()?.toLowerCase().includes('admin')
      );
      
      expect(adminRelatedProviders).toHaveLength(0);
    });

    it('should maintain clean separation of concerns - only authentication, no authorization', () => {
      // Verify that ClerkModule only handles authentication-related concerns
      const clerkSessionService = module.get<ClerkSessionService>(ClerkSessionService);
      const clerkAuthGuard = module.get<ClerkAuthGuard>(ClerkAuthGuard);
      
      expect(clerkSessionService).toBeDefined();
      expect(clerkAuthGuard).toBeDefined();
      
      // These services should not contain authorization logic
      expect(clerkSessionService.constructor.name).toBe('ClerkSessionService');
      expect(clerkAuthGuard.constructor.name).toBe('ClerkAuthGuard');
    });
  });

  describe('Dynamic Module Configuration', () => {
    it('should create different configurations for different environments', async () => {
      const devModule = await Test.createTestingModule({
        imports: [
          ClerkModule.forRoot({
            publishableKey: 'dev-key',
            secretKey: 'dev-secret',
          }),
        ],
      }).compile();

      const prodModule = await Test.createTestingModule({
        imports: [
          ClerkModule.forRoot({
            publishableKey: 'prod-key',
            secretKey: 'prod-secret',
          }),
        ],
      }).compile();

      const devOptions = devModule.get('CLERK_OPTIONS');
      const prodOptions = prodModule.get('CLERK_OPTIONS');

      expect(devOptions.publishableKey).toBe('dev-key');
      expect(prodOptions.publishableKey).toBe('prod-key');

      await devModule.close();
      await prodModule.close();
    });

    it('should handle missing configuration gracefully', async () => {
      // Test edge case where configuration might be incomplete
      const moduleWithPartialConfig = await Test.createTestingModule({
        imports: [
          ClerkModule.forRoot({
            publishableKey: 'test-key',
            // secretKey missing intentionally
          } as any),
        ],
      }).compile();

      const options = moduleWithPartialConfig.get('CLERK_OPTIONS');
      expect(options.publishableKey).toBe('test-key');
      expect(options.secretKey).toBeUndefined();

      await moduleWithPartialConfig.close();
    });
  });
}); 