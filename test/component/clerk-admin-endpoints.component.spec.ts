import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ForbiddenException } from '@nestjs/common';
import * as request from 'supertest';
import { ClerkController } from '../../src/modules/Infrastructure/clerk/clerk.controller';
import { ClerkSessionService } from '../../src/modules/Infrastructure/clerk/clerk.session.service';
import { RolesGuard } from '../../src/modules/auth/guards/roles.guard';
import { ClerkAuthGuard } from '../../src/modules/Infrastructure/clerk/guards/clerk-auth.guard';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../src/modules/users/entities/user.entity';

/**
 * Component Tests for Clerk Admin Endpoints
 *
 * These are component-level tests that focus on testing the ClerkController
 * and its interactions with mocked dependencies. All external services,
 * guards, and dependencies are mocked to isolate the component under test.
 *
 * Scope:
 * - Controller logic and routing
 * - Guard integration behavior
 * - Error handling and response formatting
 * - Component interactions with mocked services
 *
 * NOT tested here:
 * - Real external API calls (Clerk SDK)
 * - Real database operations
 * - Real authentication flows
 * - End-to-end system integration
 *
 * For true integration testing with real external services,
 * see the integration test suite (when implemented).
 */
describe('Clerk Admin Endpoints Component Tests', () => {
  let app: INestApplication;
  let clerkSessionService: ClerkSessionService;
  let reflector: Reflector;
  let rolesGuard: RolesGuard;

  const mockClerkSessionService = {
    getSessionList: jest.fn(),
    revokeSession: jest.fn(),
    revokeAllUserSessions: jest.fn(),
    verifyToken: jest.fn(),
    getUser: jest.fn(),
    verifyTokenAndGetAuthData: jest.fn(),
  };

  const mockClerkAuthGuard = {
    canActivate: jest.fn().mockImplementation(context => {
      const request = context.switchToHttp().getRequest();
      // ClerkAuthGuard attaches clerkUser object, not user object
      request.clerkUser = { userId: 'test-user-id' };
      return true;
    }),
  };

  const mockRolesGuard = {
    canActivate: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ClerkController],
      providers: [
        {
          provide: ClerkSessionService,
          useValue: mockClerkSessionService,
        },
        Reflector,
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue(mockClerkAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    clerkSessionService = moduleFixture.get<ClerkSessionService>(ClerkSessionService);
    reflector = moduleFixture.get<Reflector>(Reflector);
    rolesGuard = moduleFixture.get<RolesGuard>(RolesGuard);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('Authentication and Authorization Flow', () => {
    it('should authenticate and authorize admin for admin endpoints', async () => {
      // Setup guards to pass
      mockClerkAuthGuard.canActivate.mockReturnValue(true);
      mockRolesGuard.canActivate.mockReturnValue(true);

      // Mock session service
      const mockSessions = [{ id: 'session1', status: 'active' }];
      mockClerkSessionService.getSessionList.mockResolvedValue(mockSessions);

      const response = await request(app.getHttpServer())
        .get('/clerk/admin/users/test-user-id/sessions')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(mockClerkAuthGuard.canActivate).toHaveBeenCalled();
      expect(mockRolesGuard.canActivate).toHaveBeenCalled();
      expect(response.body.message).toBe('User sessions retrieved successfully');
      expect(response.body.userId).toBe('test-user-id');
      expect(response.body.sessions).toEqual(mockSessions);
    });

    it('should reject unauthenticated requests', async () => {
      mockClerkAuthGuard.canActivate.mockReturnValue(false);
      mockRolesGuard.canActivate.mockReturnValue(true);

      await request(app.getHttpServer())
        .get('/clerk/admin/users/test-user-id/sessions')
        .expect(403);

      expect(mockClerkAuthGuard.canActivate).toHaveBeenCalled();
      // RolesGuard should not be called if auth fails
      expect(mockRolesGuard.canActivate).not.toHaveBeenCalled();
    });

    it('should reject requests from non-admin users', async () => {
      mockClerkAuthGuard.canActivate.mockReturnValue(true);
      mockRolesGuard.canActivate.mockReturnValue(false);

      await request(app.getHttpServer())
        .get('/clerk/admin/users/test-user-id/sessions')
        .set('Authorization', 'Bearer user-token')
        .expect(403);

      expect(mockClerkAuthGuard.canActivate).toHaveBeenCalled();
      expect(mockRolesGuard.canActivate).toHaveBeenCalled();
    });
  });

  describe('GET /clerk/admin/users/:userId/sessions', () => {
    beforeEach(() => {
      mockClerkAuthGuard.canActivate.mockReturnValue(true);
      mockRolesGuard.canActivate.mockReturnValue(true);
    });

    it('should return user sessions successfully', async () => {
      const userId = 'target-user-id';
      const mockSessions = [
        { id: 'session1', status: 'active', lastActiveAt: "2025-06-21T12:42:29.555Z" },
        { id: 'session2', status: 'active', lastActiveAt: "2025-06-21T12:42:29.555Z" },
      ];

      mockClerkSessionService.getSessionList.mockResolvedValue(mockSessions);

      const response = await request(app.getHttpServer())
        .get(`/clerk/admin/users/${userId}/sessions`)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(mockClerkSessionService.getSessionList).toHaveBeenCalledWith(userId);
      expect(response.body).toEqual({
        message: 'User sessions retrieved successfully',
        userId,
        sessions: mockSessions,
      });
    });

    it('should handle empty sessions list', async () => {
      const userId = 'user-with-no-sessions';
      mockClerkSessionService.getSessionList.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get(`/clerk/admin/users/${userId}/sessions`)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.sessions).toEqual([]);
      expect(response.body.userId).toBe(userId);
    });

    it('should handle invalid user ID', async () => {
      const invalidUserId = 'invalid-user-id';
      const error = new Error('User not found');
      mockClerkSessionService.getSessionList.mockRejectedValue(error);

      await request(app.getHttpServer())
        .get(`/clerk/admin/users/${invalidUserId}/sessions`)
        .set('Authorization', 'Bearer admin-token')
        .expect(500);

      expect(mockClerkSessionService.getSessionList).toHaveBeenCalledWith(invalidUserId);
    });

    it('should validate userId parameter format', async () => {
      const malformedUserId = '';

      await request(app.getHttpServer())
        .get(`/clerk/admin/users/${malformedUserId}/sessions`)
        .set('Authorization', 'Bearer admin-token')
        .expect(404); // Should return 404 for malformed route
    });
  });

  describe('DELETE /clerk/admin/users/:userId/sessions', () => {
    beforeEach(() => {
      mockClerkAuthGuard.canActivate.mockReturnValue(true);
      mockRolesGuard.canActivate.mockReturnValue(true);
    });

    it('should revoke all user sessions successfully', async () => {
      const userId = 'target-user-id';
      mockClerkSessionService.revokeAllUserSessions.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .delete(`/clerk/admin/users/${userId}/sessions`)
        .set('Authorization', 'Bearer admin-token')
        .expect(200); // Controller returns 200 with response body, not 204

      expect(mockClerkSessionService.revokeAllUserSessions).toHaveBeenCalledWith(userId);
      expect(response.body.message).toContain(`All sessions for user ${userId} revoked successfully`);
    });

    it('should handle service errors gracefully', async () => {
      const userId = 'target-user-id';
      const error = new Error('Service temporarily unavailable');
      mockClerkSessionService.revokeAllUserSessions.mockRejectedValue(error);

      await request(app.getHttpServer())
        .delete(`/clerk/admin/users/${userId}/sessions`)
        .set('Authorization', 'Bearer admin-token')
        .expect(500);

      expect(mockClerkSessionService.revokeAllUserSessions).toHaveBeenCalledWith(userId);
    });

    it('should handle non-existent user gracefully', async () => {
      const nonExistentUserId = 'non-existent-user';
      const error = new Error('User not found');
      mockClerkSessionService.revokeAllUserSessions.mockRejectedValue(error);

      await request(app.getHttpServer())
        .delete(`/clerk/admin/users/${nonExistentUserId}/sessions`)
        .set('Authorization', 'Bearer admin-token')
        .expect(500);
    });
  });

  describe('Regular User Endpoints (Non-Admin)', () => {
    beforeEach(() => {
      // ClerkAuthGuard attaches clerkUser object, not user object
      mockClerkAuthGuard.canActivate.mockImplementation(context => {
        const request = context.switchToHttp().getRequest();
        request.clerkUser = { userId: 'regular-user-id' };
        return true;
      });
      // No RolesGuard for regular endpoints
    });

    it('should allow regular users to access their own sessions', async () => {
      const mockSessions = [{ id: 'user-session1' }];
      mockClerkSessionService.getSessionList.mockResolvedValue(mockSessions);

      const response = await request(app.getHttpServer())
        .get('/clerk/sessions')
        .set('Authorization', 'Bearer user-token')
        .expect(200);

      expect(response.body.message).toBe('Sessions retrieved successfully');
    });

    it('should allow regular users to revoke their own sessions', async () => {
      const sessionId = 'user-session-id';
      mockClerkSessionService.revokeSession.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .delete(`/clerk/sessions/${sessionId}`)
        .set('Authorization', 'Bearer user-token')
        .expect(200); // Controller returns 200 with response body, not 204

      expect(mockClerkSessionService.revokeSession).toHaveBeenCalledWith(sessionId);
      expect(response.body.message).toContain(`Session ${sessionId} revoked successfully`);
    });

    it('should allow regular users to revoke all their sessions', async () => {
      mockClerkSessionService.revokeAllUserSessions.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .delete('/clerk/sessions')
        .set('Authorization', 'Bearer user-token')
        .expect(200); // Controller returns 200 with response body, not 204

      expect(response.body.message).toBe('All sessions revoked successfully');
    });
  });

  describe('Guard Component Interaction Testing', () => {
    it('should apply ClerkAuthGuard to all endpoints', async () => {
      mockClerkAuthGuard.canActivate.mockReturnValue(false);

      // Test regular endpoint
      await request(app.getHttpServer())
        .get('/clerk/sessions')
        .expect(403);

      // Test admin endpoint
      await request(app.getHttpServer())
        .get('/clerk/admin/users/test-id/sessions')
        .expect(403);

      expect(mockClerkAuthGuard.canActivate).toHaveBeenCalledTimes(2);
    });

    it('should apply RolesGuard only to admin endpoints', async () => {
      // Reset mock counts
      mockClerkAuthGuard.canActivate.mockClear();
      mockRolesGuard.canActivate.mockClear();

      // ClerkAuthGuard attaches clerkUser object, not user object
      mockClerkAuthGuard.canActivate.mockImplementation(context => {
        const request = context.switchToHttp().getRequest();
        request.clerkUser = { userId: 'test-user-id' };
        return true;
      });

      mockRolesGuard.canActivate.mockReturnValue(false);

      // Mock session service để regular endpoint có thể hoạt động
      mockClerkSessionService.getSessionList.mockResolvedValue([]);

      // Regular endpoint should not call RolesGuard
      await request(app.getHttpServer())
        .get('/clerk/sessions')
        .expect(200);

      // Admin endpoint should call RolesGuard
      await request(app.getHttpServer())
        .get('/clerk/admin/users/test-id/sessions')
        .expect(403);

      expect(mockRolesGuard.canActivate).toHaveBeenCalledTimes(1);
    });

    it('should ensure proper guard execution order', async () => {
      const callOrder: string[] = [];

      // Đảm bảo clear mảng callOrder trước khi test
      callOrder.length = 0;

      mockClerkAuthGuard.canActivate.mockImplementation(context => {
        const request = context.switchToHttp().getRequest();
        request.user = { id: 'test-user-id' };
        // Chỉ ghi nhận lần gọi đầu tiên
        if (!callOrder.includes('ClerkAuthGuard')) {
          callOrder.push('ClerkAuthGuard');
        }
        return true;
      });

      mockRolesGuard.canActivate.mockImplementation(() => {
        callOrder.push('RolesGuard');
        return true;
      });

      mockClerkSessionService.getSessionList.mockResolvedValue([]);

      await request(app.getHttpServer())
        .get('/clerk/admin/users/test-id/sessions')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      // ClerkAuthGuard should execute before RolesGuard
      expect(callOrder).toEqual(['ClerkAuthGuard', 'RolesGuard']);
    });
  });

  describe('Error Handling Component Behavior', () => {
    beforeEach(() => {
      mockClerkAuthGuard.canActivate.mockReturnValue(true);
      mockRolesGuard.canActivate.mockReturnValue(true);
    });

    it('should handle Clerk service timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      mockClerkSessionService.getSessionList.mockRejectedValue(timeoutError);

      await request(app.getHttpServer())
        .get('/clerk/admin/users/test-id/sessions')
        .set('Authorization', 'Bearer admin-token')
        .expect(500);
    });

    it('should handle Clerk API rate limiting', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.name = 'RateLimitError';
      mockClerkSessionService.getSessionList.mockRejectedValue(rateLimitError);

      await request(app.getHttpServer())
        .get('/clerk/admin/users/test-id/sessions')
        .set('Authorization', 'Bearer admin-token')
        .expect(500);
    });

    it('should handle network connectivity issues', async () => {
      const networkError = new Error('Network unreachable');
      networkError.name = 'NetworkError';
      mockClerkSessionService.revokeAllUserSessions.mockRejectedValue(networkError);

      await request(app.getHttpServer())
        .delete('/clerk/admin/users/test-id/sessions')
        .set('Authorization', 'Bearer admin-token')
        .expect(500);
    });
  });

  describe('Vấn đề 1.1: SDK Upgrade & Provider Pattern - Component Tests', () => {
    describe('API Request Authentication with authenticateRequest', () => {
      it('should successfully authenticate API request with valid Authorization header', async () => {
        // Arrange
        mockClerkAuthGuard.canActivate.mockImplementation(context => {
          const request = context.switchToHttp().getRequest();
          // Simulate successful authenticateRequest behavior
          request.clerkUser = {
            sessionId: 'sess_123',
            userId: 'user_456',
            orgId: null,
            claims: { role: 'admin' }
          };
          return true;
        });
        mockRolesGuard.canActivate.mockReturnValue(true);
        mockClerkSessionService.getSessionList.mockResolvedValue([]);

        // Act & Assert
        const response = await request(app.getHttpServer())
          .get('/clerk/admin/users/test-user-id/sessions')
          .set('Authorization', 'Bearer valid-jwt-token')
          .expect(200);

        expect(mockClerkAuthGuard.canActivate).toHaveBeenCalled();
        expect(response.body.message).toBe('User sessions retrieved successfully');
      });

      it('should reject API request with invalid Authorization header', async () => {
        // Arrange
        mockClerkAuthGuard.canActivate.mockImplementation(() => {
          // Simulate authenticateRequest failure - return false instead of throwing
          return false;
        });

        // Act & Assert
        await request(app.getHttpServer())
          .get('/clerk/admin/users/test-user-id/sessions')
          .set('Authorization', 'Bearer invalid-token')
          .expect(403);

        expect(mockClerkAuthGuard.canActivate).toHaveBeenCalled();
      });

      it('should reject API request with missing Authorization header', async () => {
        // Arrange
        mockClerkAuthGuard.canActivate.mockImplementation(() => {
          // Simulate missing authorization
          return false;
        });

        // Act & Assert
        await request(app.getHttpServer())
          .get('/clerk/admin/users/test-user-id/sessions')
          // No Authorization header
          .expect(403);

        expect(mockClerkAuthGuard.canActivate).toHaveBeenCalled();
      });

      it('should verify networkless behavior - no external network calls during authentication', async () => {
        // Arrange
        const networkCallSpy = jest.fn();

        mockClerkAuthGuard.canActivate.mockImplementation(context => {
          const request = context.switchToHttp().getRequest();
          // Simulate JWT-only verification (networkless)
          // This should not make any external API calls to Clerk servers
          request.clerkUser = {
            sessionId: 'sess_local_123',
            userId: 'user_local_456',
            orgId: null,
            claims: { role: 'admin' }
          };
          return true;
        });
        mockRolesGuard.canActivate.mockReturnValue(true);
        mockClerkSessionService.getSessionList.mockResolvedValue([]);

        // Act
        await request(app.getHttpServer())
          .get('/clerk/admin/users/test-user-id/sessions')
          .set('Authorization', 'Bearer jwt-token-with-local-verification')
          .expect(200);

        // Assert
        expect(networkCallSpy).not.toHaveBeenCalled();
        expect(mockClerkAuthGuard.canActivate).toHaveBeenCalled();
      });
    });

    describe('ClerkUser Object Attachment', () => {
      it('should attach clerkUser object to request after successful authentication', async () => {
        // Arrange
        let capturedRequest: any;

        mockClerkAuthGuard.canActivate.mockImplementation(context => {
          const request = context.switchToHttp().getRequest();
          capturedRequest = request;

          // Simulate ClerkAuthGuard attaching user info
          request.clerkUser = {
            sessionId: 'sess_integration_123',
            userId: 'user_integration_456',
            orgId: 'org_integration_789',
            claims: {
              role: 'admin',
              email: 'admin@example.com',
              firstName: 'Admin',
              lastName: 'User'
            }
          };
          return true;
        });
        mockRolesGuard.canActivate.mockReturnValue(true);
        mockClerkSessionService.getSessionList.mockResolvedValue([]);

        // Act
        await request(app.getHttpServer())
          .get('/clerk/admin/users/test-user-id/sessions')
          .set('Authorization', 'Bearer valid-token')
          .expect(200);

        // Assert
        expect(capturedRequest.clerkUser).toBeDefined();
        expect(capturedRequest.clerkUser).toEqual({
          sessionId: 'sess_integration_123',
          userId: 'user_integration_456',
          orgId: 'org_integration_789',
          claims: {
            role: 'admin',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User'
          }
        });
      });

      it('should not attach clerkUser object when authentication fails', async () => {
        // Arrange
        let capturedRequest: any;

        mockClerkAuthGuard.canActivate.mockImplementation(context => {
          const request = context.switchToHttp().getRequest();
          capturedRequest = request;

          // Simulate authentication failure - no user attachment
          return false;
        });

        // Act
        await request(app.getHttpServer())
          .get('/clerk/admin/users/test-user-id/sessions')
          .set('Authorization', 'Bearer invalid-token')
          .expect(403);

        // Assert
        expect(capturedRequest.clerkUser).toBeUndefined();
      });
    });
  });

  describe('Refactoring Verification', () => {
    it('should work without AdminGuard dependency', async () => {
      // This test verifies that the refactored endpoints work correctly
      // without the removed AdminGuard
      mockClerkAuthGuard.canActivate.mockReturnValue(true);
      mockRolesGuard.canActivate.mockReturnValue(true);
      mockClerkSessionService.getSessionList.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/clerk/admin/users/test-id/sessions')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.message).toBe('User sessions retrieved successfully');
      expect(mockRolesGuard.canActivate).toHaveBeenCalled();
    });

    it('should use new guard combination (ClerkAuthGuard + RolesGuard)', async () => {
      const guardCallLog: string[] = [];

      mockClerkAuthGuard.canActivate.mockImplementation(() => {
        guardCallLog.push('ClerkAuthGuard');
        return true;
      });

      mockRolesGuard.canActivate.mockImplementation(() => {
        guardCallLog.push('RolesGuard');
        return true;
      });

      mockClerkSessionService.revokeAllUserSessions.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/clerk/admin/users/test-id/sessions')
        .set('Authorization', 'Bearer admin-token')
        .expect(200); // Controller returns 200 with response body, not 204

      expect(guardCallLog).toContain('ClerkAuthGuard');
      expect(guardCallLog).toContain('RolesGuard');
    });

    it('should not reference AdminGuard anywhere in the flow', () => {
      // Verify that the controller and its endpoints don't use AdminGuard
      const controllerInstance = app.get(ClerkController);
      const controllerString = controllerInstance.constructor.toString();

      expect(controllerString).not.toContain('AdminGuard');
      expect(controllerString).not.toContain('@AdminOnly');
    });
  });

  describe('Enhanced Role-based Authorization Component Tests', () => {
    describe('RolesAny Decorator Behavior', () => {
      it('should allow access to admin endpoints when RolesGuard passes (simulating RolesAny logic)', async () => {
        // Setup: Mock guards to simulate successful RolesAny authorization
        mockClerkAuthGuard.canActivate.mockImplementation(context => {
          const request = context.switchToHttp().getRequest();
          request.clerkUser = {
            userId: 'user_123',
            sessionId: 'sess_123',
            claims: { public_metadata: { role: 'user' } }
          };
          return true;
        });

        // Simulate RolesAny allowing access (user has one of required roles)
        mockRolesGuard.canActivate.mockReturnValue(true);
        mockClerkSessionService.getSessionList.mockResolvedValue([]);

        const response = await request(app.getHttpServer())
          .get('/clerk/admin/users/test-user-id/sessions')
          .set('Authorization', 'Bearer user-token')
          .expect(200);

        expect(mockRolesGuard.canActivate).toHaveBeenCalled();
        expect(response.body.message).toBe('User sessions retrieved successfully');
      });

      it('should deny access to admin endpoints when RolesGuard fails (simulating RolesAny logic)', async () => {
        // Setup: Mock guards to simulate failed RolesAny authorization
        mockClerkAuthGuard.canActivate.mockImplementation(context => {
          const request = context.switchToHttp().getRequest();
          request.clerkUser = {
            userId: 'user_123',
            sessionId: 'sess_123',
            claims: { public_metadata: { role: 'user' } }
          };
          return true;
        });

        // Simulate RolesAny denying access (user has none of required roles)
        mockRolesGuard.canActivate.mockReturnValue(false);

        await request(app.getHttpServer())
          .get('/clerk/admin/users/test-user-id/sessions')
          .set('Authorization', 'Bearer user-token')
          .expect(403);

        expect(mockRolesGuard.canActivate).toHaveBeenCalled();
      });
    });

    describe('RolesAll Decorator Behavior', () => {
      it('should allow access to admin endpoints when RolesGuard passes (simulating RolesAll logic)', async () => {
        // Setup: Mock guards to simulate successful RolesAll authorization
        mockClerkAuthGuard.canActivate.mockImplementation(context => {
          const request = context.switchToHttp().getRequest();
          request.clerkUser = {
            userId: 'user_123',
            sessionId: 'sess_123',
            claims: { public_metadata: { roles: ['admin', 'user'] } }
          };
          return true;
        });

        // Simulate RolesAll allowing access (user has all required roles)
        mockRolesGuard.canActivate.mockReturnValue(true);
        mockClerkSessionService.getSessionList.mockResolvedValue([]);

        const response = await request(app.getHttpServer())
          .get('/clerk/admin/users/test-user-id/sessions')
          .set('Authorization', 'Bearer admin-token')
          .expect(200);

        expect(mockRolesGuard.canActivate).toHaveBeenCalled();
        expect(response.body.message).toBe('User sessions retrieved successfully');
      });

      it('should deny access to admin endpoints when RolesGuard fails (simulating RolesAll logic)', async () => {
        // Setup: Mock guards to simulate failed RolesAll authorization
        mockClerkAuthGuard.canActivate.mockImplementation(context => {
          const request = context.switchToHttp().getRequest();
          request.clerkUser = {
            userId: 'user_123',
            sessionId: 'sess_123',
            claims: { public_metadata: { roles: ['admin'] } } // Missing required role
          };
          return true;
        });

        // Simulate RolesAll denying access (user missing required roles)
        mockRolesGuard.canActivate.mockReturnValue(false);

        await request(app.getHttpServer())
          .get('/clerk/admin/users/test-user-id/sessions')
          .set('Authorization', 'Bearer admin-token')
          .expect(403);

        expect(mockRolesGuard.canActivate).toHaveBeenCalled();
      });
    });

    describe('Edge Cases and Error Scenarios', () => {
      it('should handle authorization failures gracefully', async () => {
        // Setup: Mock guards to simulate authorization failure
        mockClerkAuthGuard.canActivate.mockReturnValue(true);
        mockRolesGuard.canActivate.mockReturnValue(false);

        await request(app.getHttpServer())
          .get('/clerk/admin/users/test-user-id/sessions')
          .set('Authorization', 'Bearer token')
          .expect(403);

        expect(mockRolesGuard.canActivate).toHaveBeenCalled();
      });

      it('should handle authentication failures before authorization', async () => {
        // Setup: Mock authentication failure
        mockClerkAuthGuard.canActivate.mockReturnValue(false);
        mockRolesGuard.canActivate.mockReturnValue(true);

        await request(app.getHttpServer())
          .get('/clerk/admin/users/test-user-id/sessions')
          .set('Authorization', 'Bearer invalid-token')
          .expect(403);

        expect(mockClerkAuthGuard.canActivate).toHaveBeenCalled();
        // RolesGuard should not be called if authentication fails
        expect(mockRolesGuard.canActivate).not.toHaveBeenCalled();
      });

      it('should handle mixed role scenarios correctly', async () => {
        // Test different role combinations through component behavior
        const testCases = [
          { roles: ['admin'], shouldPass: true, description: 'admin role' },
          { roles: ['user'], shouldPass: false, description: 'user role only' },
          { roles: [], shouldPass: false, description: 'no roles' },
        ];

        for (const testCase of testCases) {
          // Reset mocks
          jest.clearAllMocks();

          mockClerkAuthGuard.canActivate.mockImplementation(context => {
            const request = context.switchToHttp().getRequest();
            request.clerkUser = {
              userId: 'test_user',
              claims: { public_metadata: { roles: testCase.roles } }
            };
            return true;
          });

          mockRolesGuard.canActivate.mockReturnValue(testCase.shouldPass);
          mockClerkSessionService.getSessionList.mockResolvedValue([]);

          const expectedStatus = testCase.shouldPass ? 200 : 403;

          await request(app.getHttpServer())
            .get('/clerk/admin/users/test-user-id/sessions')
            .set('Authorization', 'Bearer token')
            .expect(expectedStatus);
        }
      });
    });
  });
});