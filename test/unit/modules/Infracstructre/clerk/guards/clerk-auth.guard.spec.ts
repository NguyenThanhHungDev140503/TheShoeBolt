import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClerkClient } from '@clerk/backend';
import { Request } from 'express';
import { ClerkAuthGuard } from 'src/modules/Infrastructure/clerk/guards/clerk-auth.guard';
import { CLERK_CLIENT } from 'src/modules/Infrastructure/clerk/providers/clerk-client.provider';

describe('ClerkAuthGuard', () => {
  let guard: ClerkAuthGuard;
  let module: TestingModule;
  let mockClerkClient: jest.Mocked<ClerkClient>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockRequest: Partial<Request>;

  beforeEach(async () => {
    // Create mocks
    mockClerkClient = {
      authenticateRequest: jest.fn(),
    } as unknown as jest.Mocked<ClerkClient>;

    mockConfigService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    mockRequest = {
      protocol: 'https',
      get: jest.fn(),
      originalUrl: '/api/test',
      method: 'GET',
      headers: {
        authorization: 'Bearer test-token',
        'content-type': 'application/json',
      },
      cookies: {},
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as jest.Mocked<ExecutionContext>;

    module = await Test.createTestingModule({
      providers: [
        ClerkAuthGuard,
        {
          provide: CLERK_CLIENT,
          useValue: mockClerkClient,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    guard = module.get<ClerkAuthGuard>(ClerkAuthGuard);

    // Setup default config service responses
    mockConfigService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'CLERK_JWT_KEY':
          return 'test-jwt-key';
        case 'CLERK_SECRET_KEY':
          return 'test-secret-key';
        default:
          return undefined;
      }
    });
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
    jest.clearAllMocks();
  });

  describe('canActivate - Success Scenarios', () => {
    it('should return true when authentication is successful', async () => {
      // Arrange
      const mockAuthState = {
        isAuthenticated: true,
        toAuth: jest.fn().mockReturnValue({
          sessionId: 'sess_123',
          userId: 'user_456',
          orgId: 'org_789',
          sessionClaims: { role: 'admin' },
        }),
      } as any; // Cast to any to bypass strict typing for test
      mockClerkClient.authenticateRequest.mockResolvedValue(mockAuthState);

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(mockClerkClient.authenticateRequest).toHaveBeenCalledTimes(1);
      expect(mockAuthState.toAuth).toHaveBeenCalledTimes(1);
    });

    it('should attach clerkUser object to request when authentication succeeds', async () => {
      // Arrange
      const mockAuthObject = {
        sessionId: 'sess_123',
        userId: 'user_456',
        orgId: 'org_789',
        sessionClaims: { role: 'admin', email: 'test@example.com' },
      };
      const mockAuthState = {
        isAuthenticated: true,
        toAuth: jest.fn().mockReturnValue(mockAuthObject),
      } as any; // Cast to any to bypass strict typing for test
      mockClerkClient.authenticateRequest.mockResolvedValue(mockAuthState);

      // Act
      await guard.canActivate(mockExecutionContext);

      // Assert
      expect(mockRequest['clerkUser']).toEqual({
        sessionId: 'sess_123',
        userId: 'user_456',
        orgId: 'org_789',
        claims: { role: 'admin', email: 'test@example.com' },
      });
    });

    it('should call authenticateRequest with correct parameters', async () => {
      // Arrange
      const mockAuthState = {
        isAuthenticated: true,
        toAuth: jest.fn().mockReturnValue({
          sessionId: 'sess_123',
          userId: 'user_456',
          orgId: null,
          sessionClaims: {},
        }),
      } as any; // Cast to any to bypass strict typing for test
      mockClerkClient.authenticateRequest.mockResolvedValue(mockAuthState);

      // Act
      await guard.canActivate(mockExecutionContext);

      // Assert
      expect(mockClerkClient.authenticateRequest).toHaveBeenCalledWith(
        expect.any(globalThis.Request),
        {
          jwtKey: 'test-jwt-key',
          secretKey: 'test-secret-key',
        }
      );
    });
  });

  describe('canActivate - Authentication Failure Scenarios', () => {
    it('should throw UnauthorizedException when isAuthenticated is false', async () => {
      // Arrange
      const mockAuthState = {
        isAuthenticated: false,
        toAuth: jest.fn(),
      } as any; // Cast to any to bypass strict typing for test
      mockClerkClient.authenticateRequest.mockResolvedValue(mockAuthState);

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException
      );
      // Note: The actual error message will be "User not authenticated" but it gets wrapped
      // in try-catch and re-thrown as "Authentication failed"
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Authentication failed'
      );
      expect(mockAuthState.toAuth).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when authenticateRequest throws error', async () => {
      // Arrange
      const authError = new Error('Invalid token');
      mockClerkClient.authenticateRequest.mockRejectedValue(authError);

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Authentication failed'
      );
    });

    it('should throw UnauthorizedException when toAuth throws error', async () => {
      // Arrange
      const mockAuthState = {
        isAuthenticated: true,
        toAuth: jest.fn().mockImplementation(() => {
          throw new Error('Failed to get auth object');
        }),
      } as any; // Cast to any to bypass strict typing for test
      mockClerkClient.authenticateRequest.mockResolvedValue(mockAuthState);

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Authentication failed'
      );
    });
  });

  describe('convertToWebRequest', () => {
    it('should convert Express Request to Web API Request correctly', async () => {
      // Arrange
      mockRequest.get = jest.fn().mockReturnValue('localhost:3000');
      const mockAuthState = {
        isAuthenticated: true,
        toAuth: jest.fn().mockReturnValue({
          sessionId: 'sess_123',
          userId: 'user_456',
          orgId: null,
          sessionClaims: {},
        }),
      } as any; // Cast to any to bypass strict typing for test
      mockClerkClient.authenticateRequest.mockResolvedValue(mockAuthState);

      // Act
      await guard.canActivate(mockExecutionContext);

      // Assert
      const capturedRequest = mockClerkClient.authenticateRequest.mock.calls[0][0];
      expect(capturedRequest).toBeInstanceOf(globalThis.Request);
      expect(capturedRequest.url).toBe('https://localhost:3000/api/test');
      expect(capturedRequest.method).toBe('GET');
    });

    it('should handle headers conversion correctly', async () => {
      // Arrange
      mockRequest.get = jest.fn().mockReturnValue('localhost:3000');
      mockRequest.headers = {
        authorization: 'Bearer token123',
        'content-type': 'application/json',
        'x-custom-header': ['value1', 'value2'], // Array header
      };

      const mockAuthState = {
        isAuthenticated: true,
        toAuth: jest.fn().mockReturnValue({
          sessionId: 'sess_123',
          userId: 'user_456',
          orgId: null,
          sessionClaims: {},
        }),
      } as any; // Cast to any to bypass strict typing for test
      mockClerkClient.authenticateRequest.mockResolvedValue(mockAuthState);

      // Act
      await guard.canActivate(mockExecutionContext);

      // Assert
      const capturedRequest = mockClerkClient.authenticateRequest.mock.calls[0][0];
      expect(capturedRequest.headers.get('authorization')).toBe('Bearer token123');
      expect(capturedRequest.headers.get('content-type')).toBe('application/json');
      expect(capturedRequest.headers.get('x-custom-header')).toBe('value1, value2');
    });

    it('should handle cookies conversion correctly', async () => {
      // Arrange
      mockRequest.get = jest.fn().mockReturnValue('localhost:3000');
      mockRequest.cookies = {
        sessionToken: 'abc123',
        userId: 'user456',
      };

      const mockAuthState = {
        isAuthenticated: true,
        toAuth: jest.fn().mockReturnValue({
          sessionId: 'sess_123',
          userId: 'user_456',
          orgId: null,
          sessionClaims: {},
        }),
      } as any; // Cast to any to bypass strict typing for test
      mockClerkClient.authenticateRequest.mockResolvedValue(mockAuthState);

      // Act
      await guard.canActivate(mockExecutionContext);

      // Assert
      const capturedRequest = mockClerkClient.authenticateRequest.mock.calls[0][0];
      expect(capturedRequest.headers.get('Cookie')).toBe('sessionToken=abc123; userId=user456');
    });

    it('should handle empty cookies object', async () => {
      // Arrange
      mockRequest.get = jest.fn().mockReturnValue('localhost:3000');
      mockRequest.cookies = {};

      const mockAuthState = {
        isAuthenticated: true,
        toAuth: jest.fn().mockReturnValue({
          sessionId: 'sess_123',
          userId: 'user_456',
          orgId: null,
          sessionClaims: {},
        }),
      } as any; // Cast to any to bypass strict typing for test
      mockClerkClient.authenticateRequest.mockResolvedValue(mockAuthState);

      // Act
      await guard.canActivate(mockExecutionContext);

      // Assert
      const capturedRequest = mockClerkClient.authenticateRequest.mock.calls[0][0];
      expect(capturedRequest.headers.get('Cookie')).toBeNull();
    });
  });

  describe('Error Handling and Logging', () => {
    it('should log error when authentication fails', async () => {
      // Arrange
      const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
      const authError = new Error('Token expired');
      mockClerkClient.authenticateRequest.mockRejectedValue(authError);

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException
      );
      expect(loggerSpy).toHaveBeenCalledWith('Authentication failed: Token expired');

      loggerSpy.mockRestore();
    });

    it('should log error when user is not authenticated', async () => {
      // Arrange
      const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
      const mockAuthState = {
        isAuthenticated: false,
        toAuth: jest.fn(),
      } as any; // Cast to any to bypass strict typing for test
      mockClerkClient.authenticateRequest.mockResolvedValue(mockAuthState);

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException
      );
      expect(loggerSpy).toHaveBeenCalledWith('User not authenticated');

      loggerSpy.mockRestore();
    });

    it('should log debug message when user is authenticated successfully', async () => {
      // Arrange
      const loggerSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
      const mockAuthState = {
        isAuthenticated: true,
        toAuth: jest.fn().mockReturnValue({
          sessionId: 'sess_123',
          userId: 'user_456',
          orgId: null,
          sessionClaims: {},
        }),
      } as any; // Cast to any to bypass strict typing for test
      mockClerkClient.authenticateRequest.mockResolvedValue(mockAuthState);

      // Act
      await guard.canActivate(mockExecutionContext);

      // Assert
      expect(loggerSpy).toHaveBeenCalledWith('User user_456 authenticated');

      loggerSpy.mockRestore();
    });
  });
});
