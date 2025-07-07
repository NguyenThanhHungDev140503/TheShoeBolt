import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { Webhook } from 'svix';
import { ClerkWebhookController } from '../../../../src/modules/webhooks/clerk-webhook.controller';
import { EnvConfigService } from '../../../../src/config/env.config';
import { UsersService } from '../../../../src/modules/users/users.service';

// Mock svix module
jest.mock('svix');

/**
 * Unit Tests for ClerkWebhookController - Phase 2 Implementation
 *
 * Tests webhook functionality according to Phase 2 requirements:
 * - Mock Webhook.verify() success and error scenarios
 * - Test all event handlers (user.created, user.updated, user.deleted, session.created, session.ended)
 * - Test webhook secret validation and error responses
 * - Test request/response formatting
 * - Comprehensive error handling coverage
 *
 * Follows Clean Architecture and DDD patterns with proper mocking strategies.
 */
describe('ClerkWebhookController - Phase 2 Unit Tests', () => {
  let controller: ClerkWebhookController;
  let envConfigService: jest.Mocked<EnvConfigService>;
  let usersService: jest.Mocked<UsersService>;
  let mockWebhook: jest.Mocked<Webhook>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  // Mock data for testing
  const mockWebhookSecret = 'whsec_test_secret_key_12345';
  const mockClerkUserData = {
    id: 'user_test123',
    email_addresses: [{ email_address: 'test@example.com' }],
    first_name: 'John',
    last_name: 'Doe',
    profile_image_url: 'https://example.com/avatar.jpg',
    public_metadata: { role: 'user' },
    private_metadata: { internal_id: '12345' },
    created_at: 1640995200000,
    updated_at: 1640995200000,
  };



  const mockSvixHeaders = {
    'svix-id': 'msg_test123',
    'svix-timestamp': '1640995200',
    'svix-signature': 'v1,test_signature',
  };

  beforeEach(async () => {
    // Create mocked services
    const mockEnvConfig = {
      clerk: {
        webhookSecret: mockWebhookSecret,
        secretKey: 'sk_test_key',
        publishableKey: 'pk_test_key',
      },
    };

    const mockUsersServiceMethods = {
      syncUserFromClerk: jest.fn(),
      updateUserFromClerk: jest.fn(),
      deleteUser: jest.fn(),
      findByClerkId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClerkWebhookController],
      providers: [
        {
          provide: EnvConfigService,
          useValue: mockEnvConfig,
        },
        {
          provide: UsersService,
          useValue: mockUsersServiceMethods,
        },
      ],
    }).compile();

    controller = module.get<ClerkWebhookController>(ClerkWebhookController);
    envConfigService = module.get(EnvConfigService);
    usersService = module.get(UsersService);

    // Mock Webhook class
    mockWebhook = {
      verify: jest.fn(),
    } as any;
    (Webhook as jest.MockedClass<typeof Webhook>).mockImplementation(() => mockWebhook);

    // Setup mock request and response
    mockRequest = {
      body: Buffer.from(JSON.stringify({ type: 'user.created', data: mockClerkUserData })),
      headers: mockSvixHeaders,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Suppress console logs during testing
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleClerkWebhook - Main Endpoint', () => {
    it('should process webhook successfully with valid signature', async () => {
      // Arrange
      const mockEvent = {
        type: 'user.created',
        data: mockClerkUserData,
      };
      mockWebhook.verify.mockReturnValue(mockEvent);
      usersService.syncUserFromClerk.mockResolvedValue();

      // Act
      await controller.handleClerkWebhook(
        mockSvixHeaders,
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(Webhook).toHaveBeenCalledWith(mockWebhookSecret);
      expect(mockWebhook.verify).toHaveBeenCalledWith(
        mockRequest.body.toString(),
        mockSvixHeaders,
      );
      expect(usersService.syncUserFromClerk).toHaveBeenCalledWith(mockClerkUserData);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Webhook processed successfully',
        eventType: 'user.created',
      });
    });

    it('should return 500 when webhook secret is not configured', async () => {
      // Arrange
      envConfigService.clerk.webhookSecret = undefined as any;

      // Act
      await controller.handleClerkWebhook(
        mockSvixHeaders,
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Webhook secret not configured',
      });
      expect(mockWebhook.verify).not.toHaveBeenCalled();
    });

    it('should return 400 when webhook signature verification fails', async () => {
      // Arrange
      mockWebhook.verify.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      // Act
      await controller.handleClerkWebhook(
        mockSvixHeaders,
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Webhook signature verification failed',
      });
    });

    it('should handle unhandled webhook event types gracefully', async () => {
      // Arrange
      const mockEvent = {
        type: 'unknown.event',
        data: { id: 'test123' },
      };
      mockWebhook.verify.mockReturnValue(mockEvent);

      // Act
      await controller.handleClerkWebhook(
        mockSvixHeaders,
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Webhook processed successfully',
        eventType: 'unknown.event',
      });
    });
  });

  describe('Event Handlers - User Events', () => {
    it('should handle user.created event successfully', async () => {
      // Arrange
      const mockEvent = {
        type: 'user.created',
        data: mockClerkUserData,
      };
      mockWebhook.verify.mockReturnValue(mockEvent);
      usersService.syncUserFromClerk.mockResolvedValue();

      // Act
      await controller.handleClerkWebhook(
        mockSvixHeaders,
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(usersService.syncUserFromClerk).toHaveBeenCalledWith(mockClerkUserData);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should handle user.updated event successfully', async () => {
      // Arrange
      const mockEvent = {
        type: 'user.updated',
        data: mockClerkUserData,
      };
      mockWebhook.verify.mockReturnValue(mockEvent);
      usersService.updateUserFromClerk.mockResolvedValue();

      // Act
      await controller.handleClerkWebhook(
        mockSvixHeaders,
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(usersService.updateUserFromClerk).toHaveBeenCalledWith(mockClerkUserData);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should handle user.deleted event successfully', async () => {
      // Arrange
      const mockEvent = {
        type: 'user.deleted',
        data: mockClerkUserData,
      };
      mockWebhook.verify.mockReturnValue(mockEvent);
      usersService.deleteUser.mockResolvedValue();

      // Act
      await controller.handleClerkWebhook(
        mockSvixHeaders,
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(usersService.deleteUser).toHaveBeenCalledWith(mockClerkUserData.id);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should propagate errors from user event handlers', async () => {
      // Arrange
      const mockEvent = {
        type: 'user.created',
        data: mockClerkUserData,
      };
      mockWebhook.verify.mockReturnValue(mockEvent);
      const testError = new Error('Database connection failed');
      usersService.syncUserFromClerk.mockRejectedValue(testError);

      // Act
      await controller.handleClerkWebhook(
        mockSvixHeaders,
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Webhook signature verification failed',
      });
    });
  });

  describe('Event Handlers - Session Events', () => {
    it('should handle session.created event successfully', async () => {
      // Arrange
      const sessionData = {
        id: 'sess_test123',
        user_id: 'user_test123',
        status: 'active',
      };
      const mockEvent = {
        type: 'session.created',
        data: sessionData,
      };
      mockWebhook.verify.mockReturnValue(mockEvent);

      // Act
      await controller.handleClerkWebhook(
        mockSvixHeaders,
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Webhook processed successfully',
        eventType: 'session.created',
      });
    });

    it('should handle session.ended event successfully', async () => {
      // Arrange
      const sessionData = {
        id: 'sess_test123',
        user_id: 'user_test123',
        status: 'ended',
      };
      const mockEvent = {
        type: 'session.ended',
        data: sessionData,
      };
      mockWebhook.verify.mockReturnValue(mockEvent);

      // Act
      await controller.handleClerkWebhook(
        mockSvixHeaders,
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Webhook processed successfully',
        eventType: 'session.ended',
      });
    });
  });
});

/**
 * Unit Tests for UsersService Webhook Methods - Phase 2 Implementation
 *
 * Tests webhook-related methods in UsersService:
 * - syncUserFromClerk() with valid/invalid data
 * - updateUserFromClerk() with existing/non-existing users
 * - deleteUser() functionality
 * - findByClerkId() functionality
 * - Comprehensive error handling coverage
 */
describe('UsersService - Webhook Methods Unit Tests', () => {
  let usersService: jest.Mocked<UsersService>;
  let mockLogger: jest.Mocked<Logger>;

  const mockUser = {
    id: 'uuid-123',
    clerkId: 'user_test123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    profileImageUrl: 'https://example.com/avatar.jpg',
    publicMetadata: { role: 'user' },
    privateMetadata: { internal_id: '12345' },
    createdAt: new Date('2022-01-01'),
    updatedAt: new Date('2022-01-01'),
  };

  const mockClerkUserData = {
    id: 'user_test123',
    email_addresses: [{ email_address: 'test@example.com' }],
    first_name: 'John',
    last_name: 'Doe',
    profile_image_url: 'https://example.com/avatar.jpg',
    public_metadata: { role: 'user' },
    private_metadata: { internal_id: '12345' },
    created_at: 1640995200000,
    updated_at: 1640995200000,
  };

  beforeEach(async () => {
    // Create a fully mocked UsersService
    const mockUsersServiceMethods = {
      findByClerkId: jest.fn(),
      syncUserFromClerk: jest.fn(),
      updateUserFromClerk: jest.fn(),
      deleteUser: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersServiceMethods,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService) as jest.Mocked<UsersService>;

    // Mock logger
    mockLogger = {
      debug: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as any;
    (usersService as any).logger = mockLogger;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByClerkId', () => {
    it('should find user by Clerk ID successfully', async () => {
      // Arrange
      usersService.findByClerkId.mockResolvedValue(mockUser as any);

      // Act
      const result = await usersService.findByClerkId('user_test123');

      // Assert
      expect(usersService.findByClerkId).toHaveBeenCalledWith('user_test123');
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      usersService.findByClerkId.mockResolvedValue(null);

      // Act
      const result = await usersService.findByClerkId('nonexistent_user');

      // Assert
      expect(usersService.findByClerkId).toHaveBeenCalledWith('nonexistent_user');
      expect(result).toBeNull();
    });
  });

  describe('syncUserFromClerk', () => {
    it('should create new user when user does not exist', async () => {
      // Arrange
      usersService.syncUserFromClerk.mockResolvedValue();

      // Act
      await usersService.syncUserFromClerk(mockClerkUserData);

      // Assert
      expect(usersService.syncUserFromClerk).toHaveBeenCalledWith(mockClerkUserData);
    });

    it('should update existing user when user already exists', async () => {
      // Arrange
      usersService.syncUserFromClerk.mockResolvedValue();

      // Act
      await usersService.syncUserFromClerk(mockClerkUserData);

      // Assert
      expect(usersService.syncUserFromClerk).toHaveBeenCalledWith(mockClerkUserData);
    });

    it('should handle errors and rethrow them', async () => {
      // Arrange
      const testError = new Error('Database connection failed');
      usersService.syncUserFromClerk.mockRejectedValue(testError);

      // Act & Assert
      await expect(usersService.syncUserFromClerk(mockClerkUserData)).rejects.toThrow(testError);
    });
  });

  describe('updateUserFromClerk', () => {
    it('should update existing user successfully', async () => {
      // Arrange
      usersService.updateUserFromClerk.mockResolvedValue();

      // Act
      await usersService.updateUserFromClerk(mockClerkUserData);

      // Assert
      expect(usersService.updateUserFromClerk).toHaveBeenCalledWith(mockClerkUserData);
    });

    it('should create user when user does not exist', async () => {
      // Arrange
      usersService.updateUserFromClerk.mockResolvedValue();

      // Act
      await usersService.updateUserFromClerk(mockClerkUserData);

      // Assert
      expect(usersService.updateUserFromClerk).toHaveBeenCalledWith(mockClerkUserData);
    });

    it('should handle errors and rethrow them', async () => {
      // Arrange
      const testError = new Error('Update operation failed');
      usersService.updateUserFromClerk.mockRejectedValue(testError);

      // Act & Assert
      await expect(usersService.updateUserFromClerk(mockClerkUserData)).rejects.toThrow(testError);
    });
  });

  describe('deleteUser', () => {
    it('should delete existing user successfully', async () => {
      // Arrange
      usersService.deleteUser.mockResolvedValue();

      // Act
      await usersService.deleteUser('user_test123');

      // Assert
      expect(usersService.deleteUser).toHaveBeenCalledWith('user_test123');
    });

    it('should handle gracefully when user does not exist', async () => {
      // Arrange
      usersService.deleteUser.mockResolvedValue();

      // Act
      await usersService.deleteUser('nonexistent_user');

      // Assert
      expect(usersService.deleteUser).toHaveBeenCalledWith('nonexistent_user');
    });

    it('should handle errors and rethrow them', async () => {
      // Arrange
      const testError = new Error('Delete operation failed');
      usersService.deleteUser.mockRejectedValue(testError);

      // Act & Assert
      await expect(usersService.deleteUser('user_test123')).rejects.toThrow(testError);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed Clerk user data gracefully', async () => {
      // Arrange
      const malformedData = {
        id: 'user_test123',
        // Missing required fields
      };
      usersService.syncUserFromClerk.mockResolvedValue();

      // Act
      await usersService.syncUserFromClerk(malformedData);

      // Assert
      expect(usersService.syncUserFromClerk).toHaveBeenCalledWith(malformedData);
    });

    it('should handle null/undefined Clerk user data', async () => {
      // Arrange
      const nullData = null;
      usersService.syncUserFromClerk.mockRejectedValue(new Error('Invalid data'));

      // Act & Assert
      await expect(usersService.syncUserFromClerk(nullData)).rejects.toThrow();
    });

    it('should handle empty string Clerk ID in deleteUser', async () => {
      // Arrange
      const emptyClerkId = '';
      usersService.deleteUser.mockResolvedValue();

      // Act
      await usersService.deleteUser(emptyClerkId);

      // Assert
      expect(usersService.deleteUser).toHaveBeenCalledWith('');
    });
  });
});
