import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/modules/users/entities/user.entity';
import { 
  Roles, 
  RolesAny, 
  RolesAll, 
  ROLES_KEY, 
  ROLES_ANY_KEY, 
  ROLES_ALL_KEY 
} from 'src/modules/auth/decorators/roles.decorator';

describe('Roles Decorators', () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
  });

  describe('Constants Export', () => {
    it('should export correct metadata keys', () => {
      expect(ROLES_KEY).toBe('roles');
      expect(ROLES_ANY_KEY).toBe('roles_any');
      expect(ROLES_ALL_KEY).toBe('roles_all');
    });
  });

  describe('@Roles Decorator (Legacy)', () => {
    it('should set metadata with ROLES_KEY', () => {
      // Create a test class with the decorator
      @Roles(UserRole.ADMIN, UserRole.USER)
      class TestController {
        testMethod() {}
      }

      const metadata = reflector.get(ROLES_KEY, TestController);
      expect(metadata).toEqual([UserRole.ADMIN, UserRole.USER]);
    });

    it('should work with single role', () => {
      @Roles(UserRole.ADMIN)
      class TestController {
        testMethod() {}
      }

      const metadata = reflector.get(ROLES_KEY, TestController);
      expect(metadata).toEqual([UserRole.ADMIN]);
    });

    it('should work with empty roles array', () => {
      @Roles()
      class TestController {
        testMethod() {}
      }

      const metadata = reflector.get(ROLES_KEY, TestController);
      expect(metadata).toEqual([]);
    });

    it('should work on methods', () => {
      class TestController {
        @Roles(UserRole.SHIPPER)
        testMethod() {}
      }

      const metadata = reflector.get(ROLES_KEY, TestController.prototype.testMethod);
      expect(metadata).toEqual([UserRole.SHIPPER]);
    });
  });

  describe('@RolesAny Decorator', () => {
    it('should set metadata with ROLES_ANY_KEY', () => {
      @RolesAny(UserRole.ADMIN, UserRole.SHIPPER)
      class TestController {
        testMethod() {}
      }

      const metadata = reflector.get(ROLES_ANY_KEY, TestController);
      expect(metadata).toEqual([UserRole.ADMIN, UserRole.SHIPPER]);
    });

    it('should work with single role', () => {
      @RolesAny(UserRole.USER)
      class TestController {
        testMethod() {}
      }

      const metadata = reflector.get(ROLES_ANY_KEY, TestController);
      expect(metadata).toEqual([UserRole.USER]);
    });

    it('should work on methods', () => {
      class TestController {
        @RolesAny(UserRole.ADMIN, UserRole.USER)
        testMethod() {}
      }

      const metadata = reflector.get(ROLES_ANY_KEY, TestController.prototype.testMethod);
      expect(metadata).toEqual([UserRole.ADMIN, UserRole.USER]);
    });

    it('should work with all available roles', () => {
      @RolesAny(UserRole.ADMIN, UserRole.USER, UserRole.SHIPPER)
      class TestController {
        testMethod() {}
      }

      const metadata = reflector.get(ROLES_ANY_KEY, TestController);
      expect(metadata).toEqual([UserRole.ADMIN, UserRole.USER, UserRole.SHIPPER]);
    });
  });

  describe('@RolesAll Decorator', () => {
    it('should set metadata with ROLES_ALL_KEY', () => {
      @RolesAll(UserRole.ADMIN, UserRole.SHIPPER)
      class TestController {
        testMethod() {}
      }

      const metadata = reflector.get(ROLES_ALL_KEY, TestController);
      expect(metadata).toEqual([UserRole.ADMIN, UserRole.SHIPPER]);
    });

    it('should work with single role', () => {
      @RolesAll(UserRole.ADMIN)
      class TestController {
        testMethod() {}
      }

      const metadata = reflector.get(ROLES_ALL_KEY, TestController);
      expect(metadata).toEqual([UserRole.ADMIN]);
    });

    it('should work on methods', () => {
      class TestController {
        @RolesAll(UserRole.ADMIN, UserRole.USER, UserRole.SHIPPER)
        testMethod() {}
      }

      const metadata = reflector.get(ROLES_ALL_KEY, TestController.prototype.testMethod);
      expect(metadata).toEqual([UserRole.ADMIN, UserRole.USER, UserRole.SHIPPER]);
    });

    it('should work with empty roles array', () => {
      @RolesAll()
      class TestController {
        testMethod() {}
      }

      const metadata = reflector.get(ROLES_ALL_KEY, TestController);
      expect(metadata).toEqual([]);
    });
  });

  describe('Decorator Combination Tests', () => {
    it('should allow multiple decorators on same class', () => {
      @Roles(UserRole.USER)
      @RolesAny(UserRole.ADMIN, UserRole.SHIPPER)
      @RolesAll(UserRole.ADMIN, UserRole.USER)
      class TestController {
        testMethod() {}
      }

      const rolesMetadata = reflector.get(ROLES_KEY, TestController);
      const rolesAnyMetadata = reflector.get(ROLES_ANY_KEY, TestController);
      const rolesAllMetadata = reflector.get(ROLES_ALL_KEY, TestController);

      expect(rolesMetadata).toEqual([UserRole.USER]);
      expect(rolesAnyMetadata).toEqual([UserRole.ADMIN, UserRole.SHIPPER]);
      expect(rolesAllMetadata).toEqual([UserRole.ADMIN, UserRole.USER]);
    });

    it('should allow different decorators on class and method', () => {
      @RolesAny(UserRole.USER)
      class TestController {
        @RolesAll(UserRole.ADMIN, UserRole.SHIPPER)
        testMethod() {}
      }

      const classMetadata = reflector.get(ROLES_ANY_KEY, TestController);
      const methodMetadata = reflector.get(ROLES_ALL_KEY, TestController.prototype.testMethod);

      expect(classMetadata).toEqual([UserRole.USER]);
      expect(methodMetadata).toEqual([UserRole.ADMIN, UserRole.SHIPPER]);
    });
  });

  describe('Type Safety Tests', () => {
    it('should only accept UserRole enum values', () => {
      // This test verifies TypeScript compilation - if it compiles, the types are correct
      @Roles(UserRole.ADMIN)
      @RolesAny(UserRole.USER, UserRole.SHIPPER)
      @RolesAll(UserRole.ADMIN, UserRole.USER, UserRole.SHIPPER)
      class TestController {
        @Roles(UserRole.USER)
        @RolesAny(UserRole.ADMIN)
        @RolesAll(UserRole.SHIPPER)
        testMethod() {}
      }

      // If this test runs, it means TypeScript compilation succeeded
      expect(TestController).toBeDefined();
    });
  });
});
