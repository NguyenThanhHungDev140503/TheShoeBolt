import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ClerkClient, createClerkClient } from '@clerk/backend';
import { ClerkClientProvider, CLERK_CLIENT } from 'src/modules/Infrastructure/clerk/providers/clerk-client.provider';

// Mock the createClerkClient function
jest.mock('@clerk/backend', () => ({
  createClerkClient: jest.fn(),
}));

describe('ClerkClientProvider', () => {
  let mockCreateClerkClient: jest.MockedFunction<typeof createClerkClient>;

  const mockClerkClient = {
    users: { getUser: jest.fn() },
    sessions: { getSessionList: jest.fn() },
    authenticateRequest: jest.fn(),
  } as unknown as ClerkClient;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockCreateClerkClient = createClerkClient as jest.MockedFunction<typeof createClerkClient>;
    mockCreateClerkClient.mockReturnValue(mockClerkClient);
  });

  const createTestModule = async (configMock: Record<string, any>) => {
    return Test.createTestingModule({
      providers: [
        ClerkClientProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => configMock[key]),
          },
        },
      ],
    }).compile();
  };

  describe('Provider Creation Success', () => {
    it('should create ClerkClient successfully with all required environment variables', async () => {
      // Arrange
      const configMock = {
        'CLERK_SECRET_KEY': 'test-secret-key',
        'CLERK_PUBLISHABLE_KEY': 'test-publishable-key',
        'CLERK_JWT_KEY': 'test-jwt-key',
      };

      const module = await createTestModule(configMock);

      // Act
      const clerkClient = module.get(CLERK_CLIENT);

      // Assert
      expect(clerkClient).toBeDefined();
      expect(clerkClient).toBe(mockClerkClient);
      expect(mockCreateClerkClient).toHaveBeenCalledWith({
        secretKey: 'test-secret-key',
        publishableKey: 'test-publishable-key',
        jwtKey: 'test-jwt-key',
      });
      expect(mockCreateClerkClient).toHaveBeenCalledTimes(1);

      await module.close();
    });

    it('should call createClerkClient with correct parameters including jwtKey', async () => {
      // Arrange
      const expectedSecretKey = 'sk_test_12345';
      const expectedPublishableKey = 'pk_test_67890';
      const expectedJwtKey = 'jwt_test_abcdef';

      const configMock = {
        'CLERK_SECRET_KEY': expectedSecretKey,
        'CLERK_PUBLISHABLE_KEY': expectedPublishableKey,
        'CLERK_JWT_KEY': expectedJwtKey,
      };

      const module = await createTestModule(configMock);

      // Act
      module.get(CLERK_CLIENT);

      // Assert
      expect(mockCreateClerkClient).toHaveBeenCalledWith({
        secretKey: expectedSecretKey,
        publishableKey: expectedPublishableKey,
        jwtKey: expectedJwtKey,
      });

      await module.close();
    });
  });

  describe('Environment Variable Validation', () => {
    it('should throw error when CLERK_SECRET_KEY is missing', async () => {
      // Arrange
      const configMock = {
        'CLERK_SECRET_KEY': undefined, // Missing secret key
        'CLERK_PUBLISHABLE_KEY': 'test-publishable-key',
        'CLERK_JWT_KEY': 'test-jwt-key',
      };

      // Act & Assert
      await expect(createTestModule(configMock)).rejects.toThrow(
        'CLERK_SECRET_KEY is not set in environment variables.'
      );
      expect(mockCreateClerkClient).not.toHaveBeenCalled();
    });

    it('should throw error when CLERK_PUBLISHABLE_KEY is missing', async () => {
      // Arrange
      const configMock = {
        'CLERK_SECRET_KEY': 'test-secret-key',
        'CLERK_PUBLISHABLE_KEY': undefined, // Missing publishable key
        'CLERK_JWT_KEY': 'test-jwt-key',
      };

      // Act & Assert
      await expect(createTestModule(configMock)).rejects.toThrow(
        'CLERK_PUBLISHABLE_KEY is not set in environment variables.'
      );
      expect(mockCreateClerkClient).not.toHaveBeenCalled();
    });

    it('should throw error when CLERK_JWT_KEY is missing', async () => {
      // Arrange
      const configMock = {
        'CLERK_SECRET_KEY': 'test-secret-key',
        'CLERK_PUBLISHABLE_KEY': 'test-publishable-key',
        'CLERK_JWT_KEY': undefined, // Missing JWT key
      };

      // Act & Assert
      await expect(createTestModule(configMock)).rejects.toThrow(
        'CLERK_JWT_KEY is not set in environment variables.'
      );
      expect(mockCreateClerkClient).not.toHaveBeenCalled();
    });

    it('should throw error when all environment variables are missing', async () => {
      // Arrange
      const configMock = {}; // All keys missing

      // Act & Assert
      await expect(createTestModule(configMock)).rejects.toThrow(
        'CLERK_SECRET_KEY is not set in environment variables.'
      );
      expect(mockCreateClerkClient).not.toHaveBeenCalled();
    });

    it('should throw error when environment variables are empty strings', async () => {
      // Arrange
      const configMock = {
        'CLERK_SECRET_KEY': '', // Empty string
        'CLERK_PUBLISHABLE_KEY': 'test-publishable-key',
        'CLERK_JWT_KEY': 'test-jwt-key',
      };

      // Act & Assert
      await expect(createTestModule(configMock)).rejects.toThrow(
        'CLERK_SECRET_KEY is not set in environment variables.'
      );
      expect(mockCreateClerkClient).not.toHaveBeenCalled();
    });
  });

  describe('Provider Configuration', () => {
    it('should have correct provider configuration', () => {
      // Assert - Cast to any to access provider properties for testing
      const provider = ClerkClientProvider as any;
      expect(provider.provide).toBe(CLERK_CLIENT);
      expect(provider.inject).toEqual([ConfigService]);
      expect(typeof provider.useFactory).toBe('function');
    });

    it('should inject ConfigService dependency', async () => {
      // Arrange
      const configMock = {
        'CLERK_SECRET_KEY': 'test-secret-key',
        'CLERK_PUBLISHABLE_KEY': 'test-publishable-key',
        'CLERK_JWT_KEY': 'test-jwt-key',
      };

      const module = await createTestModule(configMock);
      const configService = module.get<ConfigService>(ConfigService);

      // Act
      module.get(CLERK_CLIENT);

      // Assert
      expect(configService.get).toHaveBeenCalledWith('CLERK_SECRET_KEY');
      expect(configService.get).toHaveBeenCalledWith('CLERK_PUBLISHABLE_KEY');
      expect(configService.get).toHaveBeenCalledWith('CLERK_JWT_KEY');
      expect(configService.get).toHaveBeenCalledTimes(3);

      await module.close();
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle null values as missing environment variables', async () => {
      // Arrange
      const configMock = {
        'CLERK_SECRET_KEY': null, // Null value
        'CLERK_PUBLISHABLE_KEY': 'test-publishable-key',
        'CLERK_JWT_KEY': 'test-jwt-key',
      };

      // Act & Assert
      await expect(createTestModule(configMock)).rejects.toThrow(
        'CLERK_SECRET_KEY is not set in environment variables.'
      );
    });

    it('should accept whitespace-only values as valid environment variables', async () => {
      // Arrange
      const configMock = {
        'CLERK_SECRET_KEY': '   ', // Whitespace only - this is considered truthy
        'CLERK_PUBLISHABLE_KEY': 'test-publishable-key',
        'CLERK_JWT_KEY': 'test-jwt-key',
      };

      // Act
      const module = await createTestModule(configMock);
      const clerkClient = module.get(CLERK_CLIENT);

      // Assert
      expect(clerkClient).toBeDefined();
      expect(mockCreateClerkClient).toHaveBeenCalledWith({
        secretKey: '   ',
        publishableKey: 'test-publishable-key',
        jwtKey: 'test-jwt-key',
      });

      await module.close();
    });
  });
});
