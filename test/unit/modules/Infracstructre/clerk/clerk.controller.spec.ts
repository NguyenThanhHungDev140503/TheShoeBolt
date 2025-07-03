import { Test, TestingModule } from '@nestjs/testing';
import { ClerkController } from 'src/modules/Infrastructure/clerk/clerk.controller';
import { ClerkSessionService } from 'src/modules/Infrastructure/clerk/clerk.session.service';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { ClerkAuthGuard } from 'src/modules/Infrastructure/clerk/guards/clerk-auth.guard';
import { UserRole } from 'src/modules/users/entities/user.entity';
import { CanActivate } from '@nestjs/common';

// Mock Guards
const mockClerkAuthGuard: CanActivate = { canActivate: jest.fn(() => true) };
const mockRolesGuard: CanActivate = { canActivate: jest.fn(() => true) };

describe('ClerkController', () => {
  let controller: ClerkController;
  let clerkSessionService: ClerkSessionService;

  const mockClerkSessionService = {
    getSessionList: jest.fn(),
    revokeSession: jest.fn(),
    revokeAllUserSessions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClerkController],
      providers: [
        {
          provide: ClerkSessionService,
          useValue: mockClerkSessionService,
        },
      ],
    })
    .overrideGuard(ClerkAuthGuard)
    .useValue(mockClerkAuthGuard)
    .overrideGuard(RolesGuard)
    .useValue(mockRolesGuard)
    .compile();

    controller = module.get<ClerkController>(ClerkController);
    clerkSessionService = module.get<ClerkSessionService>(ClerkSessionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('User Session Endpoints', () => {
    const mockRequest = {
      clerkUser: {
        userId: 'test-user-id',
      },
    };

    describe('getUserSessions', () => {
      it('should get sessions for current user', async () => {
        const mockSessions = [{ id: 'session1' }, { id: 'session2' }];
        mockClerkSessionService.getSessionList.mockResolvedValue(mockSessions);

        const result = await controller.getUserSessions(mockRequest);

        expect(mockClerkSessionService.getSessionList).toHaveBeenCalledWith('test-user-id');
        expect(result).toEqual({
          message: 'Sessions retrieved successfully',
          sessions: mockSessions,
        });
      });
    });

    describe('revokeSession', () => {
      it('should revoke specific session', async () => {
        const sessionId = 'session-to-revoke';
        const mockRevokedSession = { id: sessionId, status: 'revoked' };
        mockClerkSessionService.revokeSession.mockResolvedValue(mockRevokedSession);

        const result = await controller.revokeSession(sessionId);

        expect(mockClerkSessionService.revokeSession).toHaveBeenCalledWith(sessionId);
        expect(result).toEqual({ 
            message: `Session ${sessionId} revoked successfully`, 
            session: mockRevokedSession 
        });
      });
    });

    describe('revokeAllSessions', () => {
      it('should revoke all sessions for current user', async () => {
        const mockRevokedInfo = { revoked: 2 };
        mockClerkSessionService.revokeAllUserSessions.mockResolvedValue(mockRevokedInfo);

        const result = await controller.revokeAllSessions(mockRequest);

        expect(mockClerkSessionService.revokeAllUserSessions).toHaveBeenCalledWith('test-user-id');
        expect(result).toEqual({
          message: 'All sessions revoked successfully',
          details: mockRevokedInfo,
        });
      });
    });
  });

  describe('Admin Endpoints', () => {

    it('getAnyUserSessions should get sessions for any user', async () => {
        const userId = 'target-user-id';
        const mockSessions = [{ id: 'session1' }];
        mockClerkSessionService.getSessionList.mockResolvedValue(mockSessions);

        const result = await controller.getAnyUserSessions(userId);

        expect(mockClerkSessionService.getSessionList).toHaveBeenCalledWith(userId);
        expect(result).toEqual({
          message: 'User sessions retrieved successfully',
          userId,
          sessions: mockSessions,
        });
    });

    it('revokeAllUserSessions (admin) should revoke all sessions for any user', async () => {
        const userId = 'target-user-id';
        const mockRevokedInfo = { revoked: 5 };
        mockClerkSessionService.revokeAllUserSessions.mockResolvedValue(mockRevokedInfo);

        const result = await controller.revokeAllUserSessions(userId);

        expect(mockClerkSessionService.revokeAllUserSessions).toHaveBeenCalledWith(userId);
        expect(result).toEqual({
          message: `All sessions for user ${userId} revoked successfully`,
          details: mockRevokedInfo,
        });
    });
  });
}); 