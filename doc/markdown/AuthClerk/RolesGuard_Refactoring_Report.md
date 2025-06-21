# Báo Cáo Tái Cấu Trúc RolesGuard - Phân Tích và Cải Tiến Bảo mật

**Tác giả:** AI Expert Developer
**Ngày:** 2025-06-21
**Phiên bản:** 1.0

## 1. Tóm tắt Nhiệm vụ

Báo cáo này trình bày quá trình phân tích sâu và tái cấu trúc hoàn toàn file `src/modules/auth/guards/roles.guard.ts` trong dự án TheShoeBolt. Mục tiêu chính là giải quyết các lỗi logic nghiêm trọng, lỗ hổng bảo mật, và cải thiện chất lượng mã nguồn theo các best practices của NestJS và TypeScript.

---

## 2. Chi tiết Triển khai Mã nguồn

### 2.1. Phân Tích File Gốc

Phiên bản ban đầu của `roles.guard.ts` chứa nhiều vấn đề tiềm ẩn:

- **Lỗ hổng Fail-Open**: Mặc định cho phép truy cập nếu không có decorator `@Roles`.
- **Hạn chế vai trò**: Chỉ hỗ trợ một vai trò duy nhất cho mỗi người dùng.
- **Thiếu kiểm tra phòng vệ**: Dễ gây ra lỗi 500 nếu `request.user` không tồn tại.
- **Xử lý lỗi kém**: Không cung cấp thông điệp lỗi rõ ràng.

### 2.2. Mã nguồn đã Tái cấu trúc

#### `src/modules/auth/decorators/roles.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

// Export constant để tránh magic strings và đảm bảo tính nhất quán
export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```
*   **Giải thích**: Thêm hằng số `ROLES_KEY` để loại bỏ "magic string" và đảm bảo tính nhất quán khi sử dụng metadata key trong `RolesGuard`.

    *   Tạo một custom decorator `@Roles(...roles)` để **gán các role cho controller hoặc method**.
    *   `SetMetadata(ROLES_KEY, roles)` sẽ **gắn metadata** `"roles"` với giá trị là mảng các role đã truyền vào.
    *   Kiểu xử lý: `@Roles(UserRole.ADMIN, UserRole.USER)` – khai báo role được phép truy cập route này.

*   Ví dụ sử dụng:

    *   ```ts
        @Post()
          @Roles(UserRole.ADMIN) // Chỉ admin mới được tạo user
          createUser(@Body() createUserDto: any) {
            return this.usersService.create(createUserDto);
          }
        }
        ```

#### `src/modules/auth/guards/roles.guard.ts`

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

// Định nghĩa một kiểu cho payload của người dùng từ Clerk để tăng tính an toàn về kiểu
interface ClerkUserPayload {
  publicMetadata?: {
    role?: UserRole; // Hỗ trợ vai trò đơn lẻ như hiện tại
    roles?: UserRole[]; // Hỗ trợ mảng các vai trò cho tương lai
  };
  id?: string;
  emailAddresses?: Array<{ emailAddress: string }>;
}

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      this.logger.warn('RolesGuard được áp dụng cho endpoint không có @Roles decorator. Từ chối truy cập theo nguyên tắc fail-safe.');
      throw new ForbiddenException('Access denied: No role requirements specified for this endpoint.');
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as ClerkUserPayload;

    if (!user) {
      this.logger.error('User object is missing in RolesGuard. Ensure an authentication guard runs before it.');
      throw new InternalServerErrorException('User authentication data is not available.');
    }

    const userRoles = this.extractUserRoles(user);

    if (!userRoles || userRoles.length === 0) {
      this.logger.warn(`User ${user.id || 'unknown'} không có vai trò nào được gán.`);
      throw new ForbiddenException('You have not been assigned any roles.');
    }

    const hasPermission = this.matchRoles(requiredRoles, userRoles);

    if (!hasPermission) {
      this.logger.warn(`User ${user.id || 'unknown'} với roles [${userRoles.join(', ')}] không có quyền truy cập endpoint yêu cầu roles [${requiredRoles.join(', ')}].`);
      throw new ForbiddenException('You do not have the required permissions to access this resource.');
    }

    this.logger.debug(`User ${user.id || 'unknown'} được phép truy cập với roles [${userRoles.join(', ')}].`);
    return true;
  }

  private extractUserRoles(user: ClerkUserPayload): UserRole[] {
    if (!user.publicMetadata) {
      return [];
    }
    if (user.publicMetadata.roles && Array.isArray(user.publicMetadata.roles)) {
      return user.publicMetadata.roles;
    }
    if (user.publicMetadata.role) {
      return [user.publicMetadata.role];
    }
    return [];
  }

  private matchRoles(requiredRoles: UserRole[], userRoles: UserRole[]): boolean {
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
```
*   **Giải thích**: Phiên bản này mạnh mẽ hơn rất nhiều, áp dụng nguyên tắc "fail-safe", kiểm tra phòng vệ, xử lý lỗi rõ ràng, hỗ trợ nhiều vai trò trong tương lai và tích hợp logging để giám sát.

---

## 3. Kiểm thử

- **Kiểm thử Đơn vị (Unit Test)**: Cần viết các unit test cho `RolesGuard` để kiểm tra các kịch bản:
    - Người dùng có vai trò hợp lệ.
    - Người dùng không có vai trò yêu cầu.
    - Người dùng không có vai trò nào.
    - `request.user` không tồn tại.
    - Endpoint không yêu cầu vai trò nào.
- **Kiểm thử Tích hợp (Integration Test)**: Cần kiểm tra luồng hoàn chỉnh từ request -> `ClerkAuthGuard` -> `RolesGuard` để đảm bảo chúng hoạt động chính xác cùng nhau.

---

## 4. Thách thức và Giải pháp

- **Thách thức**: Lỗ hổng bảo mật "fail-open" là rủi ro lớn nhất.
- **Giải pháp**: Thay đổi logic để áp dụng nguyên tắc "fail-safe", yêu cầu mọi endpoint phải có decorator `@Roles` một cách tường minh nếu sử dụng `RolesGuard`.

- **Thách thức**: Hỗ trợ cấu trúc vai trò hiện tại của Clerk (`role`) và cấu trúc trong tương lai (`roles`).
- **Giải pháp**: Tạo phương thức `extractUserRoles` để xử lý cả hai trường hợp, đảm bảo tính tương thích ngược và khả năng mở rộng.

---

## 5. Cải tiến và Tối ưu hóa

- **Bảo mật**: Vá lỗ hổng "fail-open", thêm kiểm tra phòng vệ.
- **Khả năng bảo trì**: Mã nguồn được chia thành các phương thức nhỏ, dễ đọc và dễ hiểu hơn.
- **Khả năng mở rộng**: Sẵn sàng hỗ trợ hệ thống đa vai trò mà không cần thay đổi lớn.
- **Gỡ lỗi**: Tích hợp `Logger` của NestJS để cung cấp thông tin chi tiết khi có lỗi hoặc hành vi bất thường.

---

## 6. Công cụ và Công nghệ Sử dụng

- **Ngôn ngữ**: TypeScript 5.x
- **Framework**: NestJS 10.x
- **Công cụ**:
    - `@nestjs/core`: `Reflector` để đọc metadata.
    - `@nestjs/common`: `Logger`, `ForbiddenException`, `InternalServerErrorException`.