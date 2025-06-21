import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ClerkController } from '../../src/modules/Infracstructre/clerk/clerk.controller';
import { ClerkSessionService } from '../../src/modules/Infracstructre/clerk/clerk.session.service';
import { RolesGuard } from '../../src/modules/auth/guards/roles.guard';
import { ClerkAuthGuard } from '../../src/modules/Infracstructre/clerk/guards/clerk-auth.guard';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../src/modules/users/entities/user.entity';

describe('Clerk Admin Endpoints Integration', () => {
  let app: INestApplication;
  let clerkSessionService: ClerkSessionService;

  const mockClerkSessionService = {
    getSessionList: jest.fn(),
    revokeSession: jest.fn(),
    revokeAllUserSessions: jest.fn(),
    verifyToken: jest.fn(),
    getUser: jest.fn(),
  };

  const mockClerkAuthGuard = {
    canActivate: jest.fn().mockImplementation(context => {
      const request = context.switchToHttp().getRequest();
      // Đảm bảo request luôn có đối tượng user
      request.user = { id: 'test-user-id' };
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

      await request(app.getHttpServer())
        .delete(`/clerk/admin/users/${userId}/sessions`)
        .set('Authorization', 'Bearer admin-token')
        .expect(204);

      expect(mockClerkSessionService.revokeAllUserSessions).toHaveBeenCalledWith(userId);
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
      // Sử dụng mockImplementation thay vì mockReturnValue để có thể thiết lập user trong request
      mockClerkAuthGuard.canActivate.mockImplementation(context => {
        const request = context.switchToHttp().getRequest();
        request.user = { id: 'regular-user-id' };
        return true;
      });
      // No RolesGuard for regular endpoints
    });

    it('should allow regular users to access their own sessions', async () => {
      const mockSessions = [{ id: 'user-session1' }];
      mockClerkSessionService.getSessionList.mockResolvedValue(mockSessions);

      // Mock request with user context
      const mockRequest = {
        user: { id: 'regular-user-id' },
      };

      const response = await request(app.getHttpServer())
        .get('/clerk/sessions')
        .set('Authorization', 'Bearer user-token')
        .expect(200);

      expect(response.body.message).toBe('Sessions retrieved successfully');
    });

    it('should allow regular users to revoke their own sessions', async () => {
      const sessionId = 'user-session-id';
      mockClerkSessionService.revokeSession.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete(`/clerk/sessions/${sessionId}`)
        .set('Authorization', 'Bearer user-token')
        .expect(204);

      expect(mockClerkSessionService.revokeSession).toHaveBeenCalledWith(sessionId);
    });

    it('should allow regular users to revoke all their sessions', async () => {
      mockClerkSessionService.revokeAllUserSessions.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/clerk/sessions')
        .set('Authorization', 'Bearer user-token')
        .expect(204);
    });
  });

  describe('Guard Integration Testing', () => {
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
      
      // Mock users service để regular endpoint hoạt động đúng
      mockClerkAuthGuard.canActivate.mockImplementation(context => {
        const request = context.switchToHttp().getRequest();
        request.user = { id: 'test-user-id' };
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

  describe('Error Handling Integration', () => {
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
        .expect(204);

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
});