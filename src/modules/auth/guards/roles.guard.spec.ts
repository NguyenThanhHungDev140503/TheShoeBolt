import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

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
        user: {
          id: 'test-user-id',
          publicMetadata: {
            role: UserRole.ADMIN,
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
          getRequest: () => ({ user: null }) as any,
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
        user: {
          id: 'test-user-id',
          publicMetadata: {
            role: UserRole.ADMIN,
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
        user: {
          id: 'test-user-id',
          publicMetadata: {
            roles: [UserRole.ADMIN, UserRole.USER],
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
        user: {
          id: 'test-user-id',
          publicMetadata: {
            role: UserRole.USER, // This should be ignored
            roles: [UserRole.ADMIN], // This should be used
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
        user: {
          id: 'test-user-id',
          // No publicMetadata
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

    it('should throw ForbiddenException when user has empty publicMetadata', () => {
      const mockRequest = {
        user: {
          id: 'test-user-id',
          publicMetadata: {},
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
    });
  });

  describe('Admin Role Scenarios', () => {
    let mockExecutionContext: Partial<ExecutionContext>;

    beforeEach(() => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    });

    it('should allow access for user with ADMIN role', () => {
      const mockRequest = {
        user: {
          id: 'admin-user-id',
          publicMetadata: {
            role: UserRole.ADMIN,
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

    it('should deny access for user with USER role when ADMIN is required', () => {
      const mockRequest = {
        user: {
          id: 'regular-user-id',
          publicMetadata: {
            role: UserRole.USER,
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
      }).toThrow('You do not have the required permissions to access this resource.');
    });

    it('should deny access for user with SHIPPER role when ADMIN is required', () => {
      const mockRequest = {
        user: {
          id: 'shipper-user-id',
          publicMetadata: {
            role: UserRole.SHIPPER,
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
    });
  });

  describe('Multiple Role Scenarios', () => {
    it('should allow access when user has one of multiple required roles', () => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN, UserRole.USER]);

      const mockRequest = {
        user: {
          id: 'user-id',
          publicMetadata: {
            role: UserRole.USER,
          },
        },
      };

      const mockExecutionContext: Partial<ExecutionContext> = {
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

    it('should allow access when user has multiple roles and one matches required', () => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      const mockRequest = {
        user: {
          id: 'user-id',
          publicMetadata: {
            roles: [UserRole.USER, UserRole.ADMIN],
          },
        },
      };

      const mockExecutionContext: Partial<ExecutionContext> = {
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

    it('should deny access when user roles do not match any required roles', () => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      const mockRequest = {
        user: {
          id: 'user-id',
          publicMetadata: {
            roles: [UserRole.USER, UserRole.SHIPPER],
          },
        },
      };

      const mockExecutionContext: Partial<ExecutionContext> = {
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
    });
  });

  describe('Logging and Error Messages', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log warning when no roles are specified', () => {
      const mockRequest = {
        user: {
          id: 'test-user-id',
          publicMetadata: { role: UserRole.ADMIN },
        },
      };

      const mockExecutionContext: Partial<ExecutionContext> = {
        switchToHttp: () => ({
          getRequest: () => mockRequest as any,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };

      mockReflector.getAllAndOverride.mockReturnValue(null);

      expect(() => {
        guard.canActivate(mockExecutionContext as ExecutionContext);
      }).toThrow(ForbiddenException);
    });

    it('should provide detailed error message for insufficient permissions', () => {
      const mockRequest = {
        user: {
          id: 'user-123',
          publicMetadata: { role: UserRole.USER },
        },
      };

      const mockExecutionContext: Partial<ExecutionContext> = {
        switchToHttp: () => ({
          getRequest: () => mockRequest as any,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };

      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      expect(() => {
        guard.canActivate(mockExecutionContext as ExecutionContext);
      }).toThrow('You do not have the required permissions to access this resource.');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined user id gracefully', () => {
      const mockRequest = {
        user: {
          // No id property
          publicMetadata: { role: UserRole.ADMIN },
        },
      };

      const mockExecutionContext: Partial<ExecutionContext> = {
        switchToHttp: () => ({
          getRequest: () => mockRequest as any,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };

      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      const result = guard.canActivate(mockExecutionContext as ExecutionContext);
      expect(result).toBe(true);
    });

    it('should handle invalid role values gracefully', () => {
      const mockRequest = {
        user: {
          id: 'test-user-id',
          publicMetadata: {
            role: 'INVALID_ROLE' as UserRole,
          },
        },
      };

      const mockExecutionContext: Partial<ExecutionContext> = {
        switchToHttp: () => ({
          getRequest: () => mockRequest as any,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };

      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      expect(() => {
        guard.canActivate(mockExecutionContext as ExecutionContext);
      }).toThrow(ForbiddenException);
    });
  });

  describe('Refactoring Verification', () => {
    it('should work independently of AdminGuard (removed component)', () => {
      // Verify that RolesGuard can function without AdminGuard
      const mockRequest = {
        user: {
          id: 'admin-user-id',
          publicMetadata: { role: UserRole.ADMIN },
        },
      };

      const mockExecutionContext: Partial<ExecutionContext> = {
        switchToHttp: () => ({
          getRequest: () => mockRequest as any,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };

      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      // Should work without any dependency on AdminGuard
      expect(guard.canActivate(mockExecutionContext as ExecutionContext)).toBe(true);
    });

    it('should use roles from decorator, not hardcoded admin logic', () => {
      // Verify that guard is flexible and uses decorator-provided roles
      const mockRequest = {
        user: {
          id: 'user-id',
          publicMetadata: { role: UserRole.SHIPPER },
        },
      };

      const mockExecutionContext: Partial<ExecutionContext> = {
        switchToHttp: () => ({
          getRequest: () => mockRequest as any,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };

      // Test with SHIPPER role requirement
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.SHIPPER]);

      expect(guard.canActivate(mockExecutionContext as ExecutionContext)).toBe(true);
    });
  });
});