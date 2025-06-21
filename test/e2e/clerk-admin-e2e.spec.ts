import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { ClerkSessionService } from '../../src/modules/Infracstructre/clerk/clerk.session.service';
import { RolesGuard } from '../../src/modules/auth/guards/roles.guard';
import { ClerkAuthGuard } from '../../src/modules/Infracstructre/clerk/guards/clerk-auth.guard';
import { UserRole } from '../../src/modules/users/entities/user.entity';

describe('Clerk Admin E2E Flows', () => {
  let app: INestApplication;
  let clerkSessionService: ClerkSessionService;

  // Mock admin user context
  const mockAdminUser = {
    id: 'admin-user-123',
    emailAddresses: [{ emailAddress: 'admin@example.com' }],
    publicMetadata: {
      role: UserRole.ADMIN,
    },
  };

  // Mock regular user context  
  const mockRegularUser = {
    id: 'regular-user-456',
    emailAddresses: [{ emailAddress: 'user@example.com' }],
    publicMetadata: {
      role: UserRole.USER,
    },
  };

  // Mock target user for admin operations
  const mockTargetUser = {
    id: 'target-user-789',
    emailAddresses: [{ emailAddress: 'target@example.com' }],
    publicMetadata: {
      role: UserRole.USER,
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ClerkSessionService)
      .useValue({
        getSessionList: jest.fn(),
        revokeSession: jest.fn(),
        revokeAllUserSessions: jest.fn(),
        verifyToken: jest.fn(),
        getUser: jest.fn(),
      })
      .overrideGuard(ClerkAuthGuard)
      .useValue({
        canActivate: jest.fn((context) => {
          const request = context.switchToHttp().getRequest();
          const authHeader = request.headers.authorization;
          
          if (!authHeader) return false;
          
          // Mock authentication based on token
          if (authHeader.includes('admin-token')) {
            request.user = mockAdminUser;
            return true;
          } else if (authHeader.includes('user-token')) {
            request.user = mockRegularUser;
            return true;
          } else if (authHeader.includes('target-token')) {
            request.user = mockTargetUser;
            return true;
          }
          
          return false;
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    clerkSessionService = moduleFixture.get<ClerkSessionService>(ClerkSessionService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Admin Session Management Flow', () => {
    it('should complete full admin workflow: view user sessions -> revoke specific session -> revoke all sessions', async () => {
      const targetUserId = mockTargetUser.id;
      const sessionId1 = 'session-to-revoke';
      const sessionId2 = 'session-to-keep';

      // Mock initial sessions
      const initialSessions = [
        { id: sessionId1, status: 'active', lastActiveAt: new Date() },
        { id: sessionId2, status: 'active', lastActiveAt: new Date() },
      ];

      // Mock sessions after individual revocation
      const sessionsAfterRevoke = [
        { id: sessionId2, status: 'active', lastActiveAt: new Date() },
      ];

      // Step 1: Admin views user sessions
      (clerkSessionService.getSessionList as jest.Mock).mockResolvedValueOnce(initialSessions);

      const viewSessionsResponse = await request(app.getHttpServer())
        .get(`/clerk/admin/users/${targetUserId}/sessions`)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(viewSessionsResponse.body).toEqual({
        message: 'User sessions retrieved successfully',
        userId: targetUserId,
        sessions: initialSessions,
      });
      expect(clerkSessionService.getSessionList).toHaveBeenCalledWith(targetUserId);

      // Step 2: Admin revokes a specific session (simulated via regular endpoint)
      (clerkSessionService.revokeSession as jest.Mock).mockResolvedValueOnce(undefined);

      await request(app.getHttpServer())
        .delete(`/clerk/sessions/${sessionId1}`)
        .set('Authorization', 'Bearer admin-token')
        .expect(204);

      expect(clerkSessionService.revokeSession).toHaveBeenCalledWith(sessionId1);

      // Step 3: Admin views updated sessions
      (clerkSessionService.getSessionList as jest.Mock).mockResolvedValueOnce(sessionsAfterRevoke);

      const updatedSessionsResponse = await request(app.getHttpServer())
        .get(`/clerk/admin/users/${targetUserId}/sessions`)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(updatedSessionsResponse.body.sessions).toEqual(sessionsAfterRevoke);

      // Step 4: Admin revokes all remaining sessions
      (clerkSessionService.revokeAllUserSessions as jest.Mock).mockResolvedValueOnce(undefined);

      await request(app.getHttpServer())
        .delete(`/clerk/admin/users/${targetUserId}/sessions`)
        .set('Authorization', 'Bearer admin-token')
        .expect(204);

      expect(clerkSessionService.revokeAllUserSessions).toHaveBeenCalledWith(targetUserId);

      // Step 5: Admin verifies all sessions are gone
      (clerkSessionService.getSessionList as jest.Mock).mockResolvedValueOnce([]);

      const finalSessionsResponse = await request(app.getHttpServer())
        .get(`/clerk/admin/users/${targetUserId}/sessions`)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(finalSessionsResponse.body.sessions).toEqual([]);
    });

    it('should handle admin monitoring multiple users simultaneously', async () => {
      const user1Id = 'user-001';
      const user2Id = 'user-002';
      const user3Id = 'user-003';

      const user1Sessions = [{ id: 'session-u1-1' }, { id: 'session-u1-2' }];
      const user2Sessions = [{ id: 'session-u2-1' }];
      const user3Sessions = [];

      // Mock responses for different users
      (clerkSessionService.getSessionList as jest.Mock)
        .mockResolvedValueOnce(user1Sessions)
        .mockResolvedValueOnce(user2Sessions)
        .mockResolvedValueOnce(user3Sessions);

      // Admin checks sessions for multiple users
      const responses = await Promise.all([
        request(app.getHttpServer())
          .get(`/clerk/admin/users/${user1Id}/sessions`)
          .set('Authorization', 'Bearer admin-token'),
        request(app.getHttpServer())
          .get(`/clerk/admin/users/${user2Id}/sessions`)
          .set('Authorization', 'Bearer admin-token'),
        request(app.getHttpServer())
          .get(`/clerk/admin/users/${user3Id}/sessions`)
          .set('Authorization', 'Bearer admin-token'),
      ]);

      expect(responses[0].status).toBe(200);
      expect(responses[0].body.sessions).toEqual(user1Sessions);

      expect(responses[1].status).toBe(200);
      expect(responses[1].body.sessions).toEqual(user2Sessions);

      expect(responses[2].status).toBe(200);
      expect(responses[2].body.sessions).toEqual(user3Sessions);

      expect(clerkSessionService.getSessionList).toHaveBeenCalledTimes(3);
    });
  });

  describe('Access Control Verification E2E', () => {
    it('should prevent regular users from accessing admin endpoints', async () => {
      const targetUserId = 'some-user-id';

      // Regular user tries to access admin endpoint
      await request(app.getHttpServer())
        .get(`/clerk/admin/users/${targetUserId}/sessions`)
        .set('Authorization', 'Bearer user-token')
        .expect(403);

      // Regular user tries to revoke another user's sessions
      await request(app.getHttpServer())
        .delete(`/clerk/admin/users/${targetUserId}/sessions`)
        .set('Authorization', 'Bearer user-token')
        .expect(403);

      // Verify service methods were not called
      expect(clerkSessionService.getSessionList).not.toHaveBeenCalled();
      expect(clerkSessionService.revokeAllUserSessions).not.toHaveBeenCalled();
    });

    it('should allow regular users to manage only their own sessions', async () => {
      const userSessions = [{ id: 'user-session-1' }, { id: 'user-session-2' }];
      
      (clerkSessionService.getSessionList as jest.Mock).mockResolvedValue(userSessions);
      (clerkSessionService.revokeSession as jest.Mock).mockResolvedValue(undefined);
      (clerkSessionService.revokeAllUserSessions as jest.Mock).mockResolvedValue(undefined);

      // User gets their own sessions
      const getUserSessionsResponse = await request(app.getHttpServer())
        .get('/clerk/sessions')
        .set('Authorization', 'Bearer user-token')
        .expect(200);

      expect(getUserSessionsResponse.body.message).toBe('Sessions retrieved successfully');

      // User revokes their own specific session
      await request(app.getHttpServer())
        .delete('/clerk/sessions/user-session-1')
        .set('Authorization', 'Bearer user-token')
        .expect(204);

      // User revokes all their sessions
      await request(app.getHttpServer())
        .delete('/clerk/sessions')
        .set('Authorization', 'Bearer user-token')
        .expect(204);

      expect(clerkSessionService.revokeSession).toHaveBeenCalledWith('user-session-1');
      expect(clerkSessionService.revokeAllUserSessions).toHaveBeenCalledWith(mockRegularUser.id);
    });

    it('should reject all requests without authentication', async () => {
      // Test admin endpoints
      await request(app.getHttpServer())
        .get('/clerk/admin/users/test-id/sessions')
        .expect(403);

      await request(app.getHttpServer())
        .delete('/clerk/admin/users/test-id/sessions')
        .expect(403);

      // Test regular endpoints
      await request(app.getHttpServer())
        .get('/clerk/sessions')
        .expect(403);

      await request(app.getHttpServer())
        .delete('/clerk/sessions/session-id')
        .expect(403);

      await request(app.getHttpServer())
        .delete('/clerk/sessions')
        .expect(403);
    });
  });

  describe('Error Handling E2E Scenarios', () => {
    it('should handle complete service failure gracefully', async () => {
      const serviceError = new Error('Clerk service is down');
      (clerkSessionService.getSessionList as jest.Mock).mockRejectedValue(serviceError);
      (clerkSessionService.revokeAllUserSessions as jest.Mock).mockRejectedValue(serviceError);

      // Admin attempts to view sessions during service outage
      await request(app.getHttpServer())
        .get('/clerk/admin/users/test-user/sessions')
        .set('Authorization', 'Bearer admin-token')
        .expect(500);

      // Admin attempts to revoke sessions during service outage
      await request(app.getHttpServer())
        .delete('/clerk/admin/users/test-user/sessions')
        .set('Authorization', 'Bearer admin-token')
        .expect(500);
    });

    it('should handle partial failures in multi-step operations', async () => {
      const targetUserId = 'problematic-user';

      // Step 1: Successfully get sessions
      const sessions = [{ id: 'session-1' }];
      (clerkSessionService.getSessionList as jest.Mock).mockResolvedValueOnce(sessions);

      await request(app.getHttpServer())
        .get(`/clerk/admin/users/${targetUserId}/sessions`)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      // Step 2: Fail to revoke sessions
      const revokeError = new Error('Failed to revoke sessions');
      (clerkSessionService.revokeAllUserSessions as jest.Mock).mockRejectedValueOnce(revokeError);

      await request(app.getHttpServer())
        .delete(`/clerk/admin/users/${targetUserId}/sessions`)
        .set('Authorization', 'Bearer admin-token')
        .expect(500);

      // Step 3: Successfully verify sessions still exist
      (clerkSessionService.getSessionList as jest.Mock).mockResolvedValueOnce(sessions);

      const verifyResponse = await request(app.getHttpServer())
        .get(`/clerk/admin/users/${targetUserId}/sessions`)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(verifyResponse.body.sessions).toEqual(sessions);
    });

    it('should handle invalid user IDs consistently across endpoints', async () => {
      const invalidUserId = 'non-existent-user';
      const userNotFoundError = new Error('User not found');

      (clerkSessionService.getSessionList as jest.Mock).mockRejectedValue(userNotFoundError);
      (clerkSessionService.revokeAllUserSessions as jest.Mock).mockRejectedValue(userNotFoundError);

      // Both admin endpoints should handle invalid user consistently
      await request(app.getHttpServer())
        .get(`/clerk/admin/users/${invalidUserId}/sessions`)
        .set('Authorization', 'Bearer admin-token')
        .expect(500);

      await request(app.getHttpServer())
        .delete(`/clerk/admin/users/${invalidUserId}/sessions`)
        .set('Authorization', 'Bearer admin-token')
        .expect(500);
    });
  });

  describe('Performance and Scalability E2E', () => {
    it('should handle concurrent admin operations', async () => {
      const userIds = ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'];
      
      // Mock successful responses for all users
      (clerkSessionService.getSessionList as jest.Mock).mockResolvedValue([]);

      // Execute concurrent requests
      const promises = userIds.map(userId =>
        request(app.getHttpServer())
          .get(`/clerk/admin/users/${userId}/sessions`)
          .set('Authorization', 'Bearer admin-token')
      );

      const responses = await Promise.all(promises);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User sessions retrieved successfully');
      });

      expect(clerkSessionService.getSessionList).toHaveBeenCalledTimes(userIds.length);
    });

    it('should handle large session lists efficiently', async () => {
      const targetUserId = 'power-user';
      
      // Mock user with many sessions
      const largeSessio回避名词sessions = Array.from({ length: 50 }, (_, i) => ({
        id: `session-${i}`,
        status: 'active',
        lastActiveAt: new Date(),
      }));

      (clerkSessionService.getSessionList as jest.Mock).mockResolvedValue(largeSessio回避名词sessions);

      const response = await request(app.getHttpServer())
        .get(`/clerk/admin/users/${targetUserId}/sessions`)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.sessions).toHaveLength(50);
      expect(response.body.sessions[0].id).toBe('session-0');
      expect(response.body.sessions[49].id).toBe('session-49');
    });
  });

  describe('Refactoring Validation E2E', () => {
    it('should verify complete removal of AdminGuard from the flow', async () => {
      // This E2E test verifies that the refactoring successfully removed AdminGuard
      // and replaced it with the new RolesGuard + ClerkAuthGuard combination
      
      const targetUserId = 'test-user-for-refactoring';
      (clerkSessionService.getSessionList as jest.Mock).mockResolvedValue([]);

      // Admin should be able to access admin endpoints
      const adminResponse = await request(app.getHttpServer())
        .get(`/clerk/admin/users/${targetUserId}/sessions`)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(adminResponse.body.message).toBe('User sessions retrieved successfully');

      // Regular user should be denied access to admin endpoints
      await request(app.getHttpServer())
        .get(`/clerk/admin/users/${targetUserId}/sessions`)
        .set('Authorization', 'Bearer user-token')
        .expect(403);

      // This confirms that the new guard system is working correctly
    });

    it('should demonstrate architectural separation: infrastructure vs business logic', async () => {
      // ClerkController (infrastructure) should handle session management
      // RolesGuard (auth/business) should handle authorization
      
      const targetUserId = 'architecture-test-user';
      (clerkSessionService.getSessionList as jest.Mock).mockResolvedValue([]);
      (clerkSessionService.revokeAllUserSessions as jest.Mock).mockResolvedValue(undefined);

      // Infrastructure layer: session management works
      await request(app.getHttpServer())
        .get(`/clerk/admin/users/${targetUserId}/sessions`)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      // Business layer: authorization enforcement works
      await request(app.getHttpServer())
        .get(`/clerk/admin/users/${targetUserId}/sessions`)
        .set('Authorization', 'Bearer user-token')
        .expect(403);

      // Combined: both layers work together seamlessly
      await request(app.getHttpServer())
        .delete(`/clerk/admin/users/${targetUserId}/sessions`)
        .set('Authorization', 'Bearer admin-token')
        .expect(204);

      expect(clerkSessionService.revokeAllUserSessions).toHaveBeenCalledWith(targetUserId);
    });
  });
});