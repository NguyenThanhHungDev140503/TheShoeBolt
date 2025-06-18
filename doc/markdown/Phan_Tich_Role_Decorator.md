# Phân tích Role Decorator trong dự án TheShoeBolt

## 1. Định nghĩa Role Decorator

Role Decorator được định nghĩa trong file `src/modules/auth/decorators/roles.decorator.ts`:

```typescript
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
```

Decorator này sử dụng hàm `SetMetadata` của NestJS để gắn metadata 'roles' vào route handler hoặc controller. Nó nhận một hoặc nhiều tham số thuộc enum `UserRole` và lưu trữ chúng vào metadata.

## 2. Các vị trí sử dụng Role Decorator

Role Decorator được sử dụng tại các vị trí sau:

### 2.1. Trong module Auth

**File: src/modules/auth/auth.controller.ts**
```typescript
@UseGuards(ClerkAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Get('admin-only')
```

Endpoint này chỉ cho phép người dùng có vai trò ADMIN truy cập.

### 2.2. Trong module Clerk

**File: src/modules/clerk/clerk.controller.ts**
```typescript
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
@Get('admin/users/:userId/sessions')
```

```typescript
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
@Delete('admin/users/:userId/sessions')
```

Hai endpoint này trong ClerkController yêu cầu vai trò ADMIN để truy cập các chức năng quản lý phiên của người dùng khác.

### 2.3. Trong module Admin

**File: src/modules/admin/admin.controller.ts**
```typescript
@Controller('admin')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  // ...
}
```

Toàn bộ AdminController được bảo vệ bởi RolesGuard và yêu cầu vai trò ADMIN. Điều này có nghĩa là tất cả các endpoint trong controller này đều chỉ dành cho admin.

## 3. Cách Role Decorator hoạt động

Role Decorator hoạt động kết hợp với RolesGuard:

### 3.1. RolesGuard

**File: src/modules/auth/guards/roles.guard.ts**
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    // Get role from Clerk's publicMetadata
    const userRole = user.publicMetadata?.role || UserRole.USER;
    
    return requiredRoles.some((role) => userRole === role);
  }
}
```

Luồng hoạt động:
1. RolesGuard sử dụng Reflector để lấy metadata 'roles' từ route handler hoặc controller
2. Nếu không có roles được chỉ định, guard cho phép truy cập
3. Lấy thông tin vai trò của người dùng từ `user.publicMetadata?.role` (được thiết lập bởi ClerkAuthGuard)
4. Nếu không có vai trò, mặc định là UserRole.USER
5. Kiểm tra xem vai trò của người dùng có nằm trong danh sách vai trò yêu cầu không

## 4. Loại vai trò được sử dụng

Dự án sử dụng enum `UserRole` được định nghĩa trong `src/modules/users/entities/user.entity.ts`:

```typescript
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}
```

Hiện tại hệ thống chỉ có 2 vai trò:
- ADMIN: Quản trị viên hệ thống, có quyền truy cập vào các chức năng quản lý
- USER: Người dùng thông thường

## 5. Tích hợp với Clerk

Vai trò của người dùng được lưu trữ trong `publicMetadata` của Clerk. Khi người dùng đăng nhập qua Clerk, ClerkAuthGuard sẽ lấy thông tin người dùng từ Clerk và gắn vào request object. RolesGuard sau đó sẽ kiểm tra vai trò từ `user.publicMetadata?.role`.

## 6. Các tài liệu và hướng dẫn

Trong các tài liệu của dự án cũng có đề cập đến việc sử dụng Role Decorator:

- **clerk-integration-guide.md**
- **clerk-integration-implementation-report.adoc**
- **gap-analysis-implementation-guide.md**
- **implementation-tasks-breakdown.md**

Các tài liệu này chứa hướng dẫn và ví dụ về cách sử dụng Role Decorator trong dự án.

## 7. Kết luận

Role Decorator trong dự án TheShoeBolt được sử dụng để phân quyền truy cập vào các endpoint hoặc controller. Nó hoạt động kết hợp với RolesGuard để kiểm tra vai trò của người dùng từ Clerk. Hiện tại, hệ thống chỉ hỗ trợ hai vai trò: ADMIN và USER.

Role Decorator được áp dụng chủ yếu cho các chức năng quản trị và các endpoint nhạy cảm cần kiểm soát quyền truy cập. Việc tích hợp với Clerk giúp quản lý vai trò người dùng một cách hiệu quả và bảo mật.