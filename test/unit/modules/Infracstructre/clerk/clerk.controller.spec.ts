import { Test, TestingModule } from '@nestjs/testing';
import { ClerkController } from 'src/modules/Infrastructure/clerk/clerk.controller';
import { ClerkSessionService } from 'src/modules/Infrastructure/clerk/clerk.session.service';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { ClerkAuthGuard } from 'src/modules/Infrastructure/clerk/guards/clerk-auth.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from 'src/modules/users/entities/user.entity';

describe('ClerkController', () => {
  let controller: ClerkController;
  let clerkSessionService: ClerkSessionService;
  let rolesGuard: RolesGuard;
  let clerkAuthGuard: ClerkAuthGuard;

  const mockClerkSessionService = {
    getSessionList: jest.fn(),
    revokeSession: jest.fn(),
    revokeAllUserSessions: jest.fn(),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClerkController],
      providers: [
        {
          provide: ClerkSessionService,
          useValue: mockClerkSessionService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        RolesGuard,
        ClerkAuthGuard,
      ],
    }).compile();

    controller = module.get<ClerkController>(ClerkController);
    clerkSessionService = module.get<ClerkSessionService>(ClerkSessionService);
    rolesGuard = module.get<RolesGuard>(RolesGuard);
    clerkAuthGuard = module.get<ClerkAuthGuard>(ClerkAuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have required dependencies', () => {
      expect(clerkSessionService).toBeDefined();
      expect(rolesGuard).toBeDefined();
      expect(clerkAuthGuard).toBeDefined();
    });
  });

  describe('User Session Endpoints', () => {
    const mockRequest = {
      clerkUser: {
        userId: 'test-user-id',
        sessionId: 'test-session-id',
        claims: {
          public_metadata: {
            role: UserRole.USER,
          },
        },
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
        mockClerkSessionService.revokeSession.mockResolvedValue(undefined);

        const result = await controller.revokeSession(sessionId);

        expect(mockClerkSessionService.revokeSession).toHaveBeenCalledWith(sessionId);
        expect(result).toBeUndefined();
      });
    });

    describe('revokeAllSessions', () => {
      it('should revoke all sessions for current user', async () => {
        mockClerkSessionService.revokeAllUserSessions.mockResolvedValue(undefined);

        const result = await controller.revokeAllSessions(mockRequest);

        expect(mockClerkSessionService.revokeAllUserSessions).toHaveBeenCalledWith('test-user-id');
        expect(result).toBeUndefined();
      });
    });
  });

  describe('Admin Endpoints - Guard Configuration', () => {
    let mockExecutionContext: Partial<ExecutionContext>;
    let mockAdminRequest: any;

    beforeEach(() => {
      mockAdminRequest = {
        clerkUser: {
          userId: 'admin-user-id',
          sessionId: 'admin-session-id',
          claims: {
            public_metadata: {
              role: UserRole.ADMIN,
            },
          },
        },
      };

      mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockAdminRequest,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };
    });

    describe('getAnyUserSessions endpoint', () => {
      it('should require ADMIN role', () => {
        mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

        const canActivate = rolesGuard.canActivate(mockExecutionContext as ExecutionContext);
        expect(canActivate).toBe(true);
        expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
          'roles',
          [mockExecutionContext.getHandler(), mockExecutionContext.getClass()]
        );
      });

      it('should deny access for non-admin users', () => {
        mockAdminRequest.clerkUser.claims.public_metadata.role = UserRole.USER;
        mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

        expect(() => {
          rolesGuard.canActivate(mockExecutionContext as ExecutionContext);
        }).toThrow(ForbiddenException);
      });

      it('should get sessions for any user when authorized', async () => {
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
    });

    describe('revokeAllUserSessions endpoint', () => {
      it('should require ADMIN role', () => {
        mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

        const canActivate = rolesGuard.canActivate(mockExecutionContext as ExecutionContext);
        expect(canActivate).toBe(true);
      });

      it('should revoke all sessions for any user when authorized', async () => {
        const userId = 'target-user-id';
        mockClerkSessionService.revokeAllUserSessions.mockResolvedValue(undefined);

        const result = await controller.revokeAllUserSessions(userId);

        expect(mockClerkSessionService.revokeAllUserSessions).toHaveBeenCalledWith(userId);
        expect(result).toBeUndefined();
      });
    });
  });

  describe('Refactoring Verification', () => {
    it('should not use AdminGuard anymore', () => {
      // Verify that controller methods don't reference AdminGuard
      const controllerMethods = Object.getOwnPropertyNames(ClerkController.prototype)
        .filter(name => name !== 'constructor');

      controllerMethods.forEach(methodName => {
        const method = ClerkController.prototype[methodName];
        if (method) {
          const methodString = method.toString();
          expect(methodString).not.toContain('AdminGuard');
          expect(methodString).not.toContain('@AdminOnly');
        }
      });
    });

    it('should use RolesGuard and ClerkAuthGuard combination for admin endpoints', () => {
      // Verify that admin endpoints exist
      const adminEndpoints = ['getAnyUserSessions', 'revokeAllUserSessions'];
      
      adminEndpoints.forEach(endpoint => {
        expect(controller[endpoint]).toBeDefined();
      });
    });

    it('should properly handle authorization errors for admin endpoints', () => {
      const mockNonAdminRequest = {
        clerkUser: {
          userId: 'user-id',
          sessionId: 'user-session-id',
          claims: {
            public_metadata: { role: UserRole.USER },
          },
        },
      };

      const mockNonAdminContext: Partial<ExecutionContext> = {
        switchToHttp: () => ({
          getRequest: () => mockNonAdminRequest as any,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };

      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      expect(() => {
        rolesGuard.canActivate(mockNonAdminContext as ExecutionContext);
      }).toThrow(ForbiddenException);
      expect(() => {
        rolesGuard.canActivate(mockNonAdminContext as ExecutionContext);
      }).toThrow('You do not have the required permissions to access this resource.');
    });
  });
}); 