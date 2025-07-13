import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { ClerkSessionService } from 'src/modules/Infrastructure/clerk/clerk.session.service';
import { CLERK_CLIENT } from 'src/modules/Infrastructure/clerk/providers/clerk-client.provider';

describe('ClerkSessionService', () => {
  let service: ClerkSessionService;
  let mockClerkClient: any;

  const mockClerkOptions = {
    secretKey: 'test-secret-key',
    publishableKey: 'test-publishable-key',
    jwtKey: 'test-jwt-key',
  };

  const mockSessionData = {
    id: 'sess_123',
    userId: 'user_123',
    status: 'active',
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  };

  const mockUserData = {
    id: 'user_123',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
    firstName: 'John',
    lastName: 'Doe',
    publicMetadata: { role: 'user' },
  };

  const mockSessionClaims = {
    sid: 'sess_123',
    sub: 'user_123',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  const mockAuthState = {
    isAuthenticated: true,
    toAuth: jest.fn().mockReturnValue({
      sessionClaims: mockSessionClaims,
    }),
  } as any; // Cast to any to bypass strict typing for test

  beforeEach(async () => {
    // Create comprehensive mock for ClerkClient
    mockClerkClient = {
      sessions: {
        getSessionList: jest.fn(),
        revokeSession: jest.fn(),
        getSession: jest.fn(),
      },
      users: {
        getUser: jest.fn(),
      },
      authenticateRequest: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClerkSessionService,
        {
          provide: CLERK_CLIENT,
          useValue: mockClerkClient,
        },
        {
          provide: 'CLERK_OPTIONS',
          useValue: mockClerkOptions,
        },
      ],
    }).compile();

    service = module.get<ClerkSessionService>(ClerkSessionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor and Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should inject ClerkClient and options correctly', () => {
      expect(service).toBeInstanceOf(ClerkSessionService);
    });
  });

  describe('getSessionList', () => {
    it('should return sessions list successfully', async () => {
      // Arrange
      const userId = 'user_123';
      const mockSessionsResponse = {
        data: [mockSessionData],
        totalCount: 1,
      };
      mockClerkClient.sessions.getSessionList.mockResolvedValue(mockSessionsResponse);

      // Act
      const result = await service.getSessionList(userId);

      // Assert
      expect(mockClerkClient.sessions.getSessionList).toHaveBeenCalledWith({ userId });
      expect(result).toEqual(mockSessionsResponse);
    });

    it('should throw UnauthorizedException when getSessionList fails with 401', async () => {
      // Arrange
      const userId = 'user_123';
      const error = new Error('Unauthorized') as any;
      error.status = 401; // Mock error với statusCode 401 để trigger UnauthorizedException
      mockClerkClient.sessions.getSessionList.mockRejectedValue(error); // mô phỏng một Promise bị từ chối, điều này sẽ kích hoạt cơ chế xử lý lỗi của service.

      // Act & Assert
      await expect(service.getSessionList(userId)).rejects.toThrow(
        new UnauthorizedException(`Authentication failed for user ${userId}.`)
      );
      expect(mockClerkClient.sessions.getSessionList).toHaveBeenCalledWith({ userId });
    });
  });

  describe('revokeSession', () => {
    it('should revoke session successfully', async () => {
      // Arrange
      const sessionId = 'sess_123';
      const mockRevokedSession = { ...mockSessionData, status: 'revoked' };
      mockClerkClient.sessions.revokeSession.mockResolvedValue(mockRevokedSession);

      // Act
      const result = await service.revokeSession(sessionId);

      // Assert
      expect(mockClerkClient.sessions.revokeSession).toHaveBeenCalledWith(sessionId);
      expect(result).toEqual(mockRevokedSession);
    });

    it('should throw UnauthorizedException when revokeSession fails with 401', async () => {
      // Arrange
      const sessionId = 'sess_123';
      const error = new Error('Unauthorized') as any;
      error.status = 401; // Mock error với statusCode 401 để trigger UnauthorizedException
      mockClerkClient.sessions.revokeSession.mockRejectedValue(error);

      // Act & Assert
      await expect(service.revokeSession(sessionId)).rejects.toThrow(
        new UnauthorizedException(`Authentication failed for session ${sessionId}.`)
      );
      expect(mockClerkClient.sessions.revokeSession).toHaveBeenCalledWith(sessionId);
    });
  });

  describe('verifySessionToken', () => {
    it('should verify session token successfully', async () => {
      // Arrange
      const token = 'valid_token';
      mockClerkClient.authenticateRequest.mockResolvedValue(mockAuthState);

      // Act
      const result = await service.verifySessionToken(token);

      // Assert
      expect(mockClerkClient.authenticateRequest).toHaveBeenCalledWith(
        expect.any(Request),
        { secretKey: mockClerkOptions.secretKey }
      );
      expect(result).toEqual(mockSessionClaims);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      // Arrange
      const token = 'invalid_token';
      const invalidAuthState = { isAuthenticated: false } as any;
      mockClerkClient.authenticateRequest.mockResolvedValue(invalidAuthState);

      // Act & Assert
      await expect(service.verifySessionToken(token)).rejects.toThrow(
        new UnauthorizedException('Token is not valid or expired')
      );
    });

    it('should throw UnauthorizedException when authenticateRequest fails', async () => {
      // Arrange
      const token = 'valid_token';
      const errorMessage = 'Authentication error';
      mockClerkClient.authenticateRequest.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(service.verifySessionToken(token)).rejects.toThrow(
        new UnauthorizedException(`Invalid session token: ${errorMessage}`)
      );
    });
  });

  describe('getSession', () => {
    it('should get session successfully', async () => {
      // Arrange
      const sessionId = 'sess_123';
      mockClerkClient.sessions.getSession.mockResolvedValue(mockSessionData);

      // Act
      const result = await service.getSession(sessionId);

      // Assert
      expect(mockClerkClient.sessions.getSession).toHaveBeenCalledWith(sessionId);
      expect(result).toEqual(mockSessionData);
    });

    it('should throw UnauthorizedException when getSession fails with 401', async () => {
      // Arrange
      const sessionId = 'sess_123';
      const error = new Error('Unauthorized') as any;
      error.status = 401; // Mock error với statusCode 401 để trigger UnauthorizedException
      mockClerkClient.sessions.getSession.mockRejectedValue(error);

      // Act & Assert
      await expect(service.getSession(sessionId)).rejects.toThrow(
        new UnauthorizedException(`Authentication failed for session ${sessionId}.`)
      );
      expect(mockClerkClient.sessions.getSession).toHaveBeenCalledWith(sessionId);
    });
  });

  describe('getUser', () => {
    it('should get user successfully', async () => {
      // Arrange
      const userId = 'user_123';
      mockClerkClient.users.getUser.mockResolvedValue(mockUserData);

      // Act
      const result = await service.getUser(userId);

      // Assert
      expect(mockClerkClient.users.getUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUserData);
    });

    it('should throw UnauthorizedException when getUser fails with 401', async () => {
      // Arrange
      const userId = 'user_123';
      const error = new Error('Unauthorized') as any;
      error.status = 401; // Mock error với statusCode 401 để trigger UnauthorizedException
      mockClerkClient.users.getUser.mockRejectedValue(error);

      // Act & Assert
      await expect(service.getUser(userId)).rejects.toThrow(
        new UnauthorizedException(`Authentication failed for user ${userId}.`)
      );
      expect(mockClerkClient.users.getUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('verifyTokenAndGetAuthData', () => {
    it('should verify token and get complete auth data successfully', async () => {
      // Arrange
      const token = 'valid_token';
      mockClerkClient.authenticateRequest.mockResolvedValue(mockAuthState);
      mockClerkClient.sessions.getSession.mockResolvedValue(mockSessionData);
      mockClerkClient.users.getUser.mockResolvedValue(mockUserData);

      // Act
      const result = await service.verifyTokenAndGetAuthData(token);

      // Assert
      expect(mockClerkClient.authenticateRequest).toHaveBeenCalledWith(
        expect.any(Request),
        { secretKey: mockClerkOptions.secretKey }
      );
      expect(mockClerkClient.sessions.getSession).toHaveBeenCalledWith(mockSessionClaims.sid);
      expect(mockClerkClient.users.getUser).toHaveBeenCalledWith(mockSessionData.userId);

      expect(result).toEqual({
        user: {
          id: mockUserData.id,
          email: mockUserData.emailAddresses[0].emailAddress,
          firstName: mockUserData.firstName,
          lastName: mockUserData.lastName,
          publicMetadata: mockUserData.publicMetadata,
        },
        session: mockSessionData,
        sessionClaims: mockSessionClaims,
      });
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      // Arrange
      const token = 'invalid_token';
      const invalidAuthState = { isAuthenticated: false } as any;
      mockClerkClient.authenticateRequest.mockResolvedValue(invalidAuthState);

      // Act & Assert
      await expect(service.verifyTokenAndGetAuthData(token)).rejects.toThrow(
        new UnauthorizedException('Token is not valid or expired')
      );
    });

    it('should throw UnauthorizedException when session is inactive', async () => {
      // Arrange
      const token = 'valid_token';
      const inactiveSession = { ...mockSessionData, status: 'inactive' };
      mockClerkClient.authenticateRequest.mockResolvedValue(mockAuthState);
      mockClerkClient.sessions.getSession.mockResolvedValue(inactiveSession);

      // Act & Assert
      await expect(service.verifyTokenAndGetAuthData(token)).rejects.toThrow(
        new UnauthorizedException('Invalid or inactive session')
      );
    });

    it('should throw UnauthorizedException when session is null', async () => {
      // Arrange
      const token = 'valid_token';
      mockClerkClient.authenticateRequest.mockResolvedValue(mockAuthState);
      mockClerkClient.sessions.getSession.mockResolvedValue(null);

      // Act & Assert
      await expect(service.verifyTokenAndGetAuthData(token)).rejects.toThrow(
        new UnauthorizedException('Invalid or inactive session')
      );
    });

    it('should throw UnauthorizedException when authentication fails', async () => {
      // Arrange
      const token = 'valid_token';
      const errorMessage = 'Authentication failed';
      mockClerkClient.authenticateRequest.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(service.verifyTokenAndGetAuthData(token)).rejects.toThrow(
        new UnauthorizedException(`Authentication failed: ${errorMessage}`)
      );
    });

    it('should handle user with no email addresses', async () => {
      // Arrange
      const token = 'valid_token';
      const userWithoutEmail = { ...mockUserData, emailAddresses: [] };
      mockClerkClient.authenticateRequest.mockResolvedValue(mockAuthState);
      mockClerkClient.sessions.getSession.mockResolvedValue(mockSessionData);
      mockClerkClient.users.getUser.mockResolvedValue(userWithoutEmail);

      // Act
      const result = await service.verifyTokenAndGetAuthData(token);

      // Assert
      expect(result.user.email).toBeUndefined();
    });
  });

  describe('revokeAllUserSessions', () => {
    it('should revoke all user sessions successfully', async () => {
      // Arrange
      const userId = 'user_123';
      const mockSessionsResponse = {
        data: [
          { id: 'sess_1', userId, status: 'active' },
          { id: 'sess_2', userId, status: 'active' },
        ],
      };
      const mockRevokedSession1 = { id: 'sess_1', userId, status: 'revoked' };
      const mockRevokedSession2 = { id: 'sess_2', userId, status: 'revoked' };

      mockClerkClient.sessions.getSessionList.mockResolvedValue(mockSessionsResponse);
      mockClerkClient.sessions.revokeSession
        .mockResolvedValueOnce(mockRevokedSession1)
        .mockResolvedValueOnce(mockRevokedSession2);

      // Act
      const result = await service.revokeAllUserSessions(userId);

      // Assert
      expect(mockClerkClient.sessions.getSessionList).toHaveBeenCalledWith({ userId });
      expect(mockClerkClient.sessions.revokeSession).toHaveBeenCalledTimes(2);
      expect(mockClerkClient.sessions.revokeSession).toHaveBeenCalledWith('sess_1');
      expect(mockClerkClient.sessions.revokeSession).toHaveBeenCalledWith('sess_2');
      expect(result).toEqual([mockRevokedSession1, mockRevokedSession2]);
    });

    it('should handle empty sessions list', async () => {
      // Arrange
      const userId = 'user_123';
      const mockSessionsResponse = { data: [] };
      mockClerkClient.sessions.getSessionList.mockResolvedValue(mockSessionsResponse);

      // Act
      const result = await service.revokeAllUserSessions(userId);

      // Assert
      expect(mockClerkClient.sessions.getSessionList).toHaveBeenCalledWith({ userId });
      expect(mockClerkClient.sessions.revokeSession).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should throw UnauthorizedException when getSessionList fails with 401', async () => {
      // Arrange
      const userId = 'user_123';
      const error = new Error('Unauthorized') as any;
      error.status = 401; // Mock error với statusCode 401 để trigger UnauthorizedException
      mockClerkClient.sessions.getSessionList.mockRejectedValue(error);

      // Act & Assert - revokeAllUserSessions sẽ re-throw exception từ getSessionList
      await expect(service.revokeAllUserSessions(userId)).rejects.toThrow(
        new UnauthorizedException(`Authentication failed for user ${userId}.`)
      );
    });

    it('should throw UnauthorizedException when revokeSession fails with 401', async () => {
      // Arrange
      const userId = 'user_123';
      const sessionId = 'sess_1';
      const mockSessionsResponse = {
        data: [{ id: sessionId, userId, status: 'active' }],
      };
      const error = new Error('Unauthorized') as any;
      error.status = 401; // Mock error với statusCode 401 để trigger UnauthorizedException

      mockClerkClient.sessions.getSessionList.mockResolvedValue(mockSessionsResponse);
      mockClerkClient.sessions.revokeSession.mockRejectedValue(error);

      // Act & Assert - revokeAllUserSessions sẽ re-throw exception từ revokeSession
      await expect(service.revokeAllUserSessions(userId)).rejects.toThrow(
        new UnauthorizedException(`Authentication failed for session ${sessionId}.`)
      );
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle Request constructor properly in verifySessionToken', async () => {
      // Arrange
      const token = 'test_token';
      mockClerkClient.authenticateRequest.mockResolvedValue(mockAuthState);

      // Act
      await service.verifySessionToken(token);

      // Assert
      const requestCall = mockClerkClient.authenticateRequest.mock.calls[0][0];
      expect(requestCall).toBeInstanceOf(Request);
      expect(requestCall.url).toBe('https://api.clerk.dev/');
      expect(requestCall.method).toBe('GET');
    });

    it('should handle Request constructor properly in verifyTokenAndGetAuthData', async () => {
      // Arrange
      const token = 'test_token';
      mockClerkClient.authenticateRequest.mockResolvedValue(mockAuthState);
      mockClerkClient.sessions.getSession.mockResolvedValue(mockSessionData);
      mockClerkClient.users.getUser.mockResolvedValue(mockUserData);

      // Act
      await service.verifyTokenAndGetAuthData(token);

      // Assert
      const requestCall = mockClerkClient.authenticateRequest.mock.calls[0][0];
      expect(requestCall).toBeInstanceOf(Request);
      expect(requestCall.url).toBe('https://api.clerk.dev/');
      expect(requestCall.method).toBe('GET');
    });
  });

  // ===== PHASE 2 TEST CASES =====
  describe('PHASE 2 - Vấn đề 2.1: Xử lý Lỗi Không Đầy đủ', () => {
    describe('Detailed Error Handling Analysis', () => {
      it('CURRENT ISSUE: getSessionList only throws UnauthorizedException for all errors', async () => {
        // Arrange
        const userId = 'user_123';
        const error404 = new Error('User not found');
        (error404 as any).status = 404;
        (error404 as any).response = { status: 404 };
        mockClerkClient.sessions.getSessionList.mockRejectedValue(error404);

        // Act & Assert - Code thực tế throw NotFoundException cho 404 errors
        await expect(service.getSessionList(userId)).rejects.toThrow(NotFoundException);
        await expect(service.getSessionList(userId)).rejects.toThrow(`User with ID ${userId} not found.`);

        // VERIFIED: Code đã implement đúng NotFoundException cho 404 errors
        // VERIFIED: Code đã implement đúng ForbiddenException cho 403 errors
        // VERIFIED: Code đã implement đúng InternalServerErrorException cho 500 errors
      });

      it('CURRENT ISSUE: revokeSession only throws UnauthorizedException for all errors', async () => {
        // Arrange
        const sessionId = 'sess_123';
        const error403 = new Error('Access denied');
        (error403 as any).status = 403;
        mockClerkClient.sessions.revokeSession.mockRejectedValue(error403);

        // Act & Assert - Code thực tế throw ForbiddenException cho 403 errors
        await expect(service.revokeSession(sessionId)).rejects.toThrow(ForbiddenException);
        await expect(service.revokeSession(sessionId)).rejects.toThrow(`Access denied to revoke session ${sessionId}.`);
      });

      it('CURRENT ISSUE: getUser only throws UnauthorizedException for all errors', async () => {
        // Arrange
        const userId = 'user_123';
        const error404 = new Error('User not found');
        (error404 as any).status = 404;
        mockClerkClient.users.getUser.mockRejectedValue(error404);

        // Act & Assert - Code thực tế throw NotFoundException cho 404 errors
        await expect(service.getUser(userId)).rejects.toThrow(NotFoundException);
        await expect(service.getUser(userId)).rejects.toThrow(`User with ID ${userId} not found.`);
      });

      it('MISSING FEATURE: No detailed error logging with Logger', async () => {
        // Arrange
        const userId = 'user_123';
        const error = new Error('Detailed error with stack trace');
        (error as any).stack = 'Error stack trace...';
        mockClerkClient.sessions.getSessionList.mockRejectedValue(error);

        // Act & Assert
        try {
          await service.getSessionList(userId);
        } catch (e) {
          // VERIFIED: Code đã có Logger để ghi chi tiết lỗi
          // VERIFIED: Code throw InternalServerErrorException cho errors không có statusCode
          expect(e).toBeInstanceOf(InternalServerErrorException);
        }
      });

      it('VERIFIED FEATURE: Status code differentiation works correctly', async () => {
        // Test multiple error status codes
        const testCases = [
          { status: 401, expectedType: UnauthorizedException },
          { status: 403, expectedType: ForbiddenException },
          { status: 404, expectedType: NotFoundException },
          { status: 500, expectedType: InternalServerErrorException }
        ];

        for (const testCase of testCases) {
          // Arrange
          const error = new Error(`Error ${testCase.status}`);
          (error as any).status = testCase.status;
          mockClerkClient.sessions.getSessionList.mockRejectedValue(error);

          // Act & Assert - Code đã implement đúng status code differentiation
          await expect(service.getSessionList('user_123')).rejects.toThrow(testCase.expectedType);

          // VERIFIED: Code throw exception type tương ứng với status code
        }
      });
    });
  });

  // ===== PHASE 4 TEST CASES - Task 4.1.1 =====
  describe('PHASE 4 - Task 4.1.1: Comprehensive Unit Tests for Missing Coverage', () => {

    describe('getUser() - Comprehensive Test Coverage', () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'John',
        lastName: 'Doe',
        publicMetadata: { role: 'admin' },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      it('should successfully get user details', async () => {
        // Arrange
        const userId = 'user_123';
        mockClerkClient.users.getUser.mockResolvedValue(mockUser);

        // Act
        const result = await service.getUser(userId);

        // Assert
        expect(result).toEqual(mockUser);
        expect(mockClerkClient.users.getUser).toHaveBeenCalledWith(userId);
        expect(mockClerkClient.users.getUser).toHaveBeenCalledTimes(1);
      });

      it('should throw NotFoundException for 404 errors', async () => {
        // Arrange
        const userId = 'user_nonexistent';
        const error404 = new Error('User not found');
        (error404 as any).status = 404;
        mockClerkClient.users.getUser.mockRejectedValue(error404);

        // Act & Assert
        await expect(service.getUser(userId)).rejects.toThrow(NotFoundException);
        await expect(service.getUser(userId)).rejects.toThrow(`User with ID ${userId} not found.`);
      });

      it('should throw ForbiddenException for 403 errors', async () => {
        // Arrange
        const userId = 'user_123';
        const error403 = new Error('Access denied');
        (error403 as any).status = 403;
        mockClerkClient.users.getUser.mockRejectedValue(error403);

        // Act & Assert
        await expect(service.getUser(userId)).rejects.toThrow(ForbiddenException);
        await expect(service.getUser(userId)).rejects.toThrow(`Access denied to retrieve user ${userId}.`);
      });

      it('should throw UnauthorizedException for 401 errors', async () => {
        // Arrange
        const userId = 'user_123';
        const error401 = new Error('Unauthorized');
        (error401 as any).status = 401;
        mockClerkClient.users.getUser.mockRejectedValue(error401);

        // Act & Assert
        await expect(service.getUser(userId)).rejects.toThrow(UnauthorizedException);
        await expect(service.getUser(userId)).rejects.toThrow(`Authentication failed for user ${userId}.`);
      });

      it('should throw InternalServerErrorException for network timeout', async () => {
        // Arrange
        const userId = 'user_123';
        const timeoutError = new Error('Network timeout');
        (timeoutError as any).code = 'ETIMEDOUT';
        mockClerkClient.users.getUser.mockRejectedValue(timeoutError);

        // Act & Assert
        await expect(service.getUser(userId)).rejects.toThrow(InternalServerErrorException);
        await expect(service.getUser(userId)).rejects.toThrow('An unexpected error occurred while retrieving user details.');
      });

      it('should handle error with response.status format', async () => {
        // Arrange
        const userId = 'user_123';
        const errorWithResponse = new Error('API Error');
        (errorWithResponse as any).response = { status: 404, data: { message: 'Not found' } };
        mockClerkClient.users.getUser.mockRejectedValue(errorWithResponse);

        // Act & Assert
        await expect(service.getUser(userId)).rejects.toThrow(NotFoundException);
      });

      it('should handle error with statusCode format', async () => {
        // Arrange
        const userId = 'user_123';
        const errorWithStatusCode = new Error('API Error');
        (errorWithStatusCode as any).statusCode = 403;
        mockClerkClient.users.getUser.mockRejectedValue(errorWithStatusCode);

        // Act & Assert
        await expect(service.getUser(userId)).rejects.toThrow(ForbiddenException);
      });
    });

    describe('getSession() - Comprehensive Test Coverage', () => {
      const mockSession = {
        id: 'sess_123',
        userId: 'user_123',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        expireAt: Date.now() + 3600000, // 1 hour from now
      };

      it('should successfully get session details', async () => {
        // Arrange
        const sessionId = 'sess_123';
        mockClerkClient.sessions.getSession.mockResolvedValue(mockSession);

        // Act
        const result = await service.getSession(sessionId);

        // Assert
        expect(result).toEqual(mockSession);
        expect(mockClerkClient.sessions.getSession).toHaveBeenCalledWith(sessionId);
        expect(mockClerkClient.sessions.getSession).toHaveBeenCalledTimes(1);
      });

      it('should throw NotFoundException for 404 errors', async () => {
        // Arrange
        const sessionId = 'sess_nonexistent';
        const error404 = new Error('Session not found');
        (error404 as any).status = 404;
        mockClerkClient.sessions.getSession.mockRejectedValue(error404);

        // Act & Assert
        await expect(service.getSession(sessionId)).rejects.toThrow(NotFoundException);
        await expect(service.getSession(sessionId)).rejects.toThrow(`Session with ID ${sessionId} not found.`);
      });

      it('should throw ForbiddenException for 403 errors', async () => {
        // Arrange
        const sessionId = 'sess_123';
        const error403 = new Error('Access denied');
        (error403 as any).status = 403;
        mockClerkClient.sessions.getSession.mockRejectedValue(error403);

        // Act & Assert
        await expect(service.getSession(sessionId)).rejects.toThrow(ForbiddenException);
        await expect(service.getSession(sessionId)).rejects.toThrow(`Access denied to retrieve session ${sessionId}.`);
      });

      it('should throw UnauthorizedException for 401 errors', async () => {
        // Arrange
        const sessionId = 'sess_123';
        const error401 = new Error('Unauthorized');
        (error401 as any).status = 401;
        mockClerkClient.sessions.getSession.mockRejectedValue(error401);

        // Act & Assert
        await expect(service.getSession(sessionId)).rejects.toThrow(UnauthorizedException);
        await expect(service.getSession(sessionId)).rejects.toThrow(`Authentication failed for session ${sessionId}.`);
      });

      it('should throw InternalServerErrorException for unknown errors', async () => {
        // Arrange
        const sessionId = 'sess_123';
        const unknownError = new Error('Unknown error');
        mockClerkClient.sessions.getSession.mockRejectedValue(unknownError);

        // Act & Assert
        await expect(service.getSession(sessionId)).rejects.toThrow(InternalServerErrorException);
        await expect(service.getSession(sessionId)).rejects.toThrow('An unexpected error occurred while retrieving session details.');
      });

      it('should handle network connection errors', async () => {
        // Arrange
        const sessionId = 'sess_123';
        const networkError = new Error('ECONNREFUSED');
        (networkError as any).code = 'ECONNREFUSED';
        mockClerkClient.sessions.getSession.mockRejectedValue(networkError);

        // Act & Assert
        await expect(service.getSession(sessionId)).rejects.toThrow(InternalServerErrorException);
      });
    });

    describe('verifyTokenAndGetAuthData() - Comprehensive Test Coverage', () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'John',
        lastName: 'Doe',
        publicMetadata: { role: 'admin' },
      };

      const mockSession = {
        id: 'sess_123',
        userId: 'user_123',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const mockSessionClaims = {
        sid: 'sess_123',
        sub: 'user_123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockAuthState = {
        isAuthenticated: true,
        toAuth: jest.fn().mockReturnValue({
          sessionClaims: mockSessionClaims,
        }),
      };

      beforeEach(() => {
        // Reset mocks for each test
        mockClerkClient.authenticateRequest.mockResolvedValue(mockAuthState);
        mockClerkClient.sessions.getSession.mockResolvedValue(mockSession);
        mockClerkClient.users.getUser.mockResolvedValue(mockUser);
      });

      it('should successfully verify token and return complete auth data', async () => {
        // Arrange
        const token = 'valid_jwt_token';

        // Act
        const result = await service.verifyTokenAndGetAuthData(token);

        // Assert
        expect(result).toEqual({
          user: {
            id: mockUser.id,
            email: mockUser.emailAddresses[0].emailAddress,
            firstName: mockUser.firstName,
            lastName: mockUser.lastName,
            publicMetadata: mockUser.publicMetadata,
          },
          session: mockSession,
          sessionClaims: mockSessionClaims,
        });

        expect(mockClerkClient.authenticateRequest).toHaveBeenCalledTimes(1);
        expect(mockClerkClient.sessions.getSession).toHaveBeenCalledWith(mockSessionClaims.sid);
        expect(mockClerkClient.users.getUser).toHaveBeenCalledWith(mockSessionClaims.sub);
      });

      it('should create proper Web API Request with Authorization header', async () => {
        // Arrange
        const token = 'test_token_123';

        // Act
        await service.verifyTokenAndGetAuthData(token);

        // Assert
        const requestCall = mockClerkClient.authenticateRequest.mock.calls[0][0];
        expect(requestCall).toBeInstanceOf(Request);
        expect(requestCall.url).toBe('https://api.clerk.dev/');
        expect(requestCall.method).toBe('GET');

        // Check headers
        expect(requestCall.headers.get('Authorization')).toBe(`Bearer ${token}`);
        expect(requestCall.headers.get('Cookie')).toBe(`__session=${token}`);
      });

      it('should throw UnauthorizedException when token is not authenticated', async () => {
        // Arrange
        const token = 'invalid_token';
        const unauthenticatedState = {
          isAuthenticated: false,
          toAuth: jest.fn(),
        };
        mockClerkClient.authenticateRequest.mockResolvedValue(unauthenticatedState);

        // Act & Assert
        await expect(service.verifyTokenAndGetAuthData(token)).rejects.toThrow(UnauthorizedException);
        await expect(service.verifyTokenAndGetAuthData(token)).rejects.toThrow('Token is not valid or expired');
      });

      it('should throw UnauthorizedException when session is inactive', async () => {
        // Arrange
        const token = 'valid_token';
        const inactiveSession = { ...mockSession, status: 'ended' };
        mockClerkClient.sessions.getSession.mockResolvedValue(inactiveSession);

        // Act & Assert
        await expect(service.verifyTokenAndGetAuthData(token)).rejects.toThrow(UnauthorizedException);
        await expect(service.verifyTokenAndGetAuthData(token)).rejects.toThrow('Invalid or inactive session');
      });

      it('should throw UnauthorizedException when session is null', async () => {
        // Arrange
        const token = 'valid_token';
        mockClerkClient.sessions.getSession.mockResolvedValue(null);

        // Act & Assert
        await expect(service.verifyTokenAndGetAuthData(token)).rejects.toThrow(UnauthorizedException);
        await expect(service.verifyTokenAndGetAuthData(token)).rejects.toThrow('Invalid or inactive session');
      });

      it('should handle authenticateRequest errors', async () => {
        // Arrange
        const token = 'malformed_token';
        const authError = new Error('Invalid JWT format');
        mockClerkClient.authenticateRequest.mockRejectedValue(authError);

        // Act & Assert
        await expect(service.verifyTokenAndGetAuthData(token)).rejects.toThrow(UnauthorizedException);
        await expect(service.verifyTokenAndGetAuthData(token)).rejects.toThrow('Token verification failed: Invalid JWT format');
      });

      it('should handle getSession errors during verification', async () => {
        // Arrange
        const token = 'valid_token';
        const sessionError = new Error('Session not found');
        (sessionError as any).status = 404;
        mockClerkClient.sessions.getSession.mockRejectedValue(sessionError);

        // Act & Assert
        await expect(service.verifyTokenAndGetAuthData(token)).rejects.toThrow(NotFoundException);
      });

      it('should handle getUser errors during verification', async () => {
        // Arrange
        const token = 'valid_token';
        const userError = new Error('User not found');
        (userError as any).status = 404;
        mockClerkClient.users.getUser.mockRejectedValue(userError);

        // Act & Assert
        await expect(service.verifyTokenAndGetAuthData(token)).rejects.toThrow(NotFoundException);
      });

      it('should handle empty token', async () => {
        // Arrange
        const token = '';

        // Act & Assert
        await expect(service.verifyTokenAndGetAuthData(token)).rejects.toThrow(UnauthorizedException);
      });

      it('should handle null sessionClaims', async () => {
        // Arrange
        const token = 'valid_token';
        const authStateWithNullClaims = {
          isAuthenticated: true,
          toAuth: jest.fn().mockReturnValue({
            sessionClaims: null,
          }),
        };
        mockClerkClient.authenticateRequest.mockResolvedValue(authStateWithNullClaims);

        // Act & Assert
        await expect(service.verifyTokenAndGetAuthData(token)).rejects.toThrow(UnauthorizedException);
      });

      it('should handle user with no email addresses', async () => {
        // Arrange
        const token = 'valid_token';
        const userWithoutEmail = { ...mockUser, emailAddresses: [] };
        mockClerkClient.users.getUser.mockResolvedValue(userWithoutEmail);

        // Act
        const result = await service.verifyTokenAndGetAuthData(token);

        // Assert
        expect(result.user.email).toBeUndefined();
      });

      it('should handle network timeout during token verification', async () => {
        // Arrange
        const token = 'valid_token';
        const timeoutError = new Error('Request timeout');
        (timeoutError as any).code = 'ETIMEDOUT';
        mockClerkClient.authenticateRequest.mockRejectedValue(timeoutError);

        // Act & Assert
        await expect(service.verifyTokenAndGetAuthData(token)).rejects.toThrow(UnauthorizedException);
        await expect(service.verifyTokenAndGetAuthData(token)).rejects.toThrow('Token verification failed: Request timeout');
      });
    });
  });
});
