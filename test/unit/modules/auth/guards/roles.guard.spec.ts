import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { UserRole } from 'src/modules/users/entities/user.entity';
import { ROLES_KEY, ROLES_ANY_KEY, ROLES_ALL_KEY } from 'src/modules/auth/decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(() => {
    reflector = mockReflector as any;
    guard = new RolesGuard(reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Guard Basic Functionality', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should have reflector dependency', () => {
      expect(guard['reflector']).toBeDefined();
    });
  });

  describe('Role Requirement Validation', () => {
    let mockExecutionContext: Partial<ExecutionContext>;
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
        clerkUser: {
          userId: 'test-user-id',
          sessionId: 'test-session-id',
          claims: {
            public_metadata: {
              role: UserRole.ADMIN,
            },
          },
        },
      };

      mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest as any,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };
    });

    it('should throw ForbiddenException when no roles are required (fail-safe)', () => {
      mockReflector.getAllAndOverride.mockReturnValue(null);

      expect(() => {
        guard.canActivate(mockExecutionContext as ExecutionContext);
      }).toThrow(ForbiddenException);
      expect(() => {
        guard.canActivate(mockExecutionContext as ExecutionContext);
      }).toThrow('Access denied: No role requirements specified for this endpoint.');
    });

    it('should throw ForbiddenException when empty roles array is provided', () => {
      mockReflector.getAllAndOverride.mockReturnValue([]);

      expect(() => {
        guard.canActivate(mockExecutionContext as ExecutionContext);
      }).toThrow(ForbiddenException);
    });

    it('should call reflector with correct parameters', () => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      guard.canActivate(mockExecutionContext as ExecutionContext);

      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
        ROLES_KEY,
        [mockExecutionContext.getHandler(), mockExecutionContext.getClass()]
      );
    });
  });

  describe('User Authentication Validation', () => {
    let mockExecutionContext: Partial<ExecutionContext>;

    beforeEach(() => {
      mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({}) as any,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };
    });

    it('should throw InternalServerErrorException when user is missing', () => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      expect(() => {
        guard.canActivate(mockExecutionContext as ExecutionContext);
      }).toThrow(InternalServerErrorException);
      expect(() => {
        guard.canActivate(mockExecutionContext as ExecutionContext);
      }).toThrow('User authentication data is not available.');
    });

    it('should throw InternalServerErrorException when user is null', () => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      
      const mockNullUserContext: Partial<ExecutionContext> = {
        switchToHttp: () => ({
          getRequest: () => ({ clerkUser: null }) as any,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };

      expect(() => {
        guard.canActivate(mockNullUserContext as ExecutionContext);
      }).toThrow(InternalServerErrorException);
    });
  });

  describe('Role Extraction Logic', () => {
    let mockExecutionContext: Partial<ExecutionContext>;

    beforeEach(() => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    });

    it('should extract role from single role format (current format)', () => {
      const mockRequest = {
        clerkUser: {
          userId: 'test-user-id',
          sessionId: 'test-session-id',
          claims: {
            public_metadata: {
              role: UserRole.ADMIN,
            },
          },
        },
      };

      mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest as any,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };

      const result = guard.canActivate(mockExecutionContext as ExecutionContext);
      expect(result).toBe(true);
    });

    it('should extract roles from array format (future support)', () => {
      const mockRequest = {
        clerkUser: {
          userId: 'test-user-id',
          sessionId: 'test-session-id',
          claims: {
            public_metadata: {
              roles: [UserRole.ADMIN, UserRole.USER],
            },
          },
        },
      };

      mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest as any,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };

      const result = guard.canActivate(mockExecutionContext as ExecutionContext);
      expect(result).toBe(true);
    });

    it('should prioritize roles array over single role when both exist', () => {
      const mockRequest = {
        clerkUser: {
          userId: 'test-user-id',
          sessionId: 'test-session-id',
          claims: {
            public_metadata: {
              role: UserRole.USER, // This should be ignored
              roles: [UserRole.ADMIN], // This should be used
            },
          },
        },
      };

      mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest as any,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };

      const result = guard.canActivate(mockExecutionContext as ExecutionContext);
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user has no publicMetadata', () => {
      const mockRequest = {
        clerkUser: {
          userId: 'test-user-id',
          sessionId: 'test-session-id',
          claims: {
            // No public_metadata
          },
        },
      };

      mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest as any,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };

      expect(() => {
        guard.canActivate(mockExecutionContext as ExecutionContext);
      }).toThrow(ForbiddenException);
      expect(() => {
        guard.canActivate(mockExecutionContext as ExecutionContext);
      }).toThrow('You have not been assigned any roles.');
    });

    it('should throw ForbiddenException when user has publicMetadata but no role or roles', () => {
      const mockRequest = {
        clerkUser: {
          userId: 'test-user-id',
          sessionId: 'test-session-id',
          claims: {
            public_metadata: {
              // Has public_metadata but no role or roles properties
              someOtherProperty: 'value',
            },
          },
        },
      };

      mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest as any,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };

      expect(() => {
        guard.canActivate(mockExecutionContext as ExecutionContext);
      }).toThrow(ForbiddenException);
      expect(() => {
        guard.canActivate(mockExecutionContext as ExecutionContext);
      }).toThrow('You have not been assigned any roles.');
    });

    it('should return empty array when extractUserRoles is called with publicMetadata but no role/roles', () => {
      // Test the private method indirectly by accessing it through reflection
      const clerkUser = {
        userId: 'test-user-id',
        sessionId: 'test-session-id',
        claims: {
          public_metadata: {
            // Has public_metadata but no role or roles properties
            someOtherProperty: 'value',
          },
        },
      };

      // Access private method using bracket notation
      const result = (guard as any).extractUserRoles(clerkUser);
      expect(result).toEqual([]);
    });
  });

  describe('RolesAny Decorator Tests', () => {
    let mockExecutionContext: Partial<ExecutionContext>;
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
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

      mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest as any,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };
    });

    it('should allow access when user has one of the required roles (RolesAny)', () => {
      // Setup: User has USER role, endpoint requires USER or ADMIN (ANY logic)
      mockReflector.getAllAndOverride
        .mockReturnValueOnce(undefined) // ROLES_ALL_KEY
        .mockReturnValueOnce([UserRole.USER, UserRole.ADMIN]) // ROLES_ANY_KEY
        .mockReturnValueOnce(undefined); // ROLES_KEY

      const result = guard.canActivate(mockExecutionContext as ExecutionContext);

      expect(result).toBe(true);
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledTimes(3);
    });

    it('should deny access when user does not have any of the required roles (RolesAny)', () => {
      // Setup: User has USER role, endpoint requires ADMIN or SHIPPER (ANY logic)
      mockRequest.clerkUser.claims.public_metadata.role = UserRole.USER;
      mockReflector.getAllAndOverride
        .mockReturnValueOnce(undefined) // ROLES_ALL_KEY
        .mockReturnValueOnce([UserRole.ADMIN, UserRole.SHIPPER]) // ROLES_ANY_KEY
        .mockReturnValueOnce(undefined); // ROLES_KEY

      expect(() => {
        guard.canActivate(mockExecutionContext as ExecutionContext);
      }).toThrow(ForbiddenException);
    });
  });

  describe('RolesAll Decorator Tests', () => {
    let mockExecutionContext: Partial<ExecutionContext>;
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
        clerkUser: {
          userId: 'test-user-id',
          sessionId: 'test-session-id',
          claims: {
            public_metadata: {
              roles: [UserRole.USER, UserRole.ADMIN], // User has multiple roles
            },
          },
        },
      };

      mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest as any,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };
    });

    it('should allow access when user has all required roles (RolesAll)', () => {
      // Setup: User has USER and ADMIN roles, endpoint requires both (ALL logic)
      mockReflector.getAllAndOverride
        .mockReturnValueOnce([UserRole.USER, UserRole.ADMIN]) // ROLES_ALL_KEY
        .mockReturnValueOnce(undefined) // ROLES_ANY_KEY
        .mockReturnValueOnce(undefined); // ROLES_KEY

      const result = guard.canActivate(mockExecutionContext as ExecutionContext);

      expect(result).toBe(true);
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledTimes(3);
    });

    it('should deny access when user does not have all required roles (RolesAll)', () => {
      // Setup: User has USER and ADMIN roles, endpoint requires USER, ADMIN, and SHIPPER (ALL logic)
      mockReflector.getAllAndOverride
        .mockReturnValueOnce([UserRole.USER, UserRole.ADMIN, UserRole.SHIPPER]) // ROLES_ALL_KEY
        .mockReturnValueOnce(undefined) // ROLES_ANY_KEY
        .mockReturnValueOnce(undefined); // ROLES_KEY

      expect(() => {
        guard.canActivate(mockExecutionContext as ExecutionContext);
      }).toThrow(ForbiddenException);
    });
  });

  describe('Legacy Roles Decorator Tests', () => {
    let mockExecutionContext: Partial<ExecutionContext>;
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
        clerkUser: {
          userId: 'test-user-id',
          sessionId: 'test-session-id',
          claims: {
            public_metadata: {
              role: UserRole.ADMIN,
            },
          },
        },
      };

      mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest as any,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };
    });

    it('should use ALL logic for legacy @Roles decorator', () => {
      // Setup: User has ADMIN role, legacy @Roles requires ADMIN and USER (ALL logic)
      mockRequest.clerkUser.claims.public_metadata.roles = [UserRole.ADMIN]; // Only ADMIN
      mockReflector.getAllAndOverride
        .mockReturnValueOnce(undefined) // ROLES_ALL_KEY
        .mockReturnValueOnce(undefined) // ROLES_ANY_KEY
        .mockReturnValueOnce([UserRole.ADMIN, UserRole.USER]); // ROLES_KEY (legacy)

      expect(() => {
        guard.canActivate(mockExecutionContext as ExecutionContext);
      }).toThrow(ForbiddenException);
    });

    it('should allow access when user has all roles required by legacy decorator', () => {
      // Setup: User has both ADMIN and USER roles, legacy @Roles requires both
      mockRequest.clerkUser.claims.public_metadata.roles = [UserRole.ADMIN, UserRole.USER];
      mockReflector.getAllAndOverride
        .mockReturnValueOnce(undefined) // ROLES_ALL_KEY
        .mockReturnValueOnce(undefined) // ROLES_ANY_KEY
        .mockReturnValueOnce([UserRole.ADMIN, UserRole.USER]); // ROLES_KEY (legacy)

      const result = guard.canActivate(mockExecutionContext as ExecutionContext);

      expect(result).toBe(true);
    });
  });
});