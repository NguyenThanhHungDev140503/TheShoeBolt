# Phân Tích Kiến Trúc: ClerkModule Admin Authentication Implementation

## Tóm Tắt Phân Tích

Sau khi phân tích chi tiết ClerkModule và các thành phần liên quan, tôi đã xác định được một số vấn đề kiến trúc quan trọng trong việc triển khai admin authentication. Hiện tại có sự trùng lặp và phân tán logic xác thực giữa các tầng khác nhau.

## Tình Trạng Hiện Tại

### 1. Cấu Trúc ClerkModule
```typescript
// src/modules/clerk/clerk.module.ts
@Module({})
export class ClerkModule {
  static forRoot(options: ClerkModuleOptions): DynamicModule {
    return {
      providers: [
        ClerkSessionService,
        ClerkAuthGuard,
        AdminGuard,        // ❌ Vấn đề: Admin logic trong infrastructure layer
      ],
      exports: [ClerkSessionService, ClerkAuthGuard, AdminGuard],
      global: true,
    };
  }
}
```

### 2. Trùng Lặp Logic Admin Authentication

**AdminGuard trong ClerkModule:**
```typescript
// src/modules/clerk/guards/admin.guard.ts
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Kiểm tra xem request có thông tin user không (phải qua ClerkAuthGuard trước)
    if (!request.user) {
      throw new ForbiddenException('User information not found');
    }
    // Lấy role từ Clerk's publicMetadata
    const userRole = request.user.publicMetadata?.role || UserRole.USER;
    
    // Chỉ cho phép ADMIN truy cập
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin role required');
    }
    return true;
  }
}
```

**RolesGuard trong AuthModule:**
```typescript
// src/modules/auth/guards/roles.guard.ts
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

### 3. Sự Nhầm Lẫn Trong Sử Dụng

**AdminController sử dụng cả hai cách (hiện tại đang dùng RolesGuard, là đúng):**
```typescript
// src/modules/admin/admin.controller.ts
@UseGuards(ClerkAuthGuard, RolesGuard)  // ✅ Đúng cách
@Roles(UserRole.ADMIN)
export class AdminController {
  // implementation
}
```

**Có thể sử dụng AdminOnly decorator (không nên):**
```typescript
// src/modules/clerk/decorators/admin-only.decorator.ts
export function AdminOnly() {
  return applyDecorators(
    UseGuards(AdminGuard),  // ❌ Logic business trong infrastructure
    // swagger decorators
  );
}
```

## Vấn Đề Kiến Trúc Được Xác Định

### 1. **Violation of Separation of Concerns (Vi phạm Tách biệt Trách nhiệm)**
- <u>**Vấn đề**: [`AdminGuard`](src/modules/clerk/guards/admin.guard.ts:5) trong [`ClerkModule`](src/modules/clerk/clerk.module.ts:14) chứa business logic (kiểm tra vai trò người dùng).</u>
- **Hậu quả**: Tầng infrastructure (Clerk) đang xử lý các quy tắc nghiệp vụ. Điều này làm giảm tính module hóa và tăng sự phụ thuộc.
- **Nguyên tắc bị vi phạm**: Single Responsibility Principle (Nguyên tắc Đơn trách nhiệm).

### 2. **Coupling Giữa Infrastructure và Business Logic (Liên kết chặt chẽ giữa Hạ tầng và Logic Nghiệp vụ)**
- <u>**Vấn đề**: [`ClerkModule`](src/modules/clerk/clerk.module.ts:14) export [`AdminGuard`](src/modules/clerk/guards/admin.guard.ts:5), tạo ra sự phụ thuộc từ logic nghiệp vụ ví dụ auth service vào một thành phần cụ thể của tầng infrastructure.</u>
- **Hậu quả**: Khó khăn khi muốn thay đổi nhà cung cấp xác thực (authentication provider) trong tương lai mà không ảnh hưởng đến business logic.
- **Nguyên tắc bị vi phạm**: Dependency Inversion Principle (Nguyên tắc Đảo ngược Phụ thuộc).

### 3. **Code Duplication (Trùng lặp Mã)** 
- **Vấn đề**: Logic kiểm tra vai trò người dùng bị trùng lặp giữa [`AdminGuard`](src/modules/clerk/guards/admin.guard.ts:5) và [`RolesGuard`](src/modules/auth/guards/roles.guard.ts:6). Nên để cho RoleGuard trong tầng bussiness check Role cho tất cả các User role (shipper, admin, user)
- **Hậu quả**: Tăng chi phí bảo trì, rủi ro không nhất quán khi cập nhật logic.
- **Nguyên tắc bị vi phạm**: DRY (Don't Repeat Yourself - Đừng Lặp lại Chính mình).

### 4. **Architectural Layer Confusion (Nhầm lẫn về Tầng Kiến trúc)**
- **Hậu quả**: Gây nhầm lẫn cho nhà phát triển, dẫn đến các mẫu sử dụng không nhất quán trong toàn bộ ứng dụng.

## Phân Loại Theo Architectural Layers (Tầng Kiến Trúc)

### Infrastructure Layer (Tầng Hạ tầng - ClerkModule)
**Nên chứa:**
- ✅ Xác thực token (ví dụ: [`ClerkAuthGuard`](src/modules/clerk/guards/clerk-auth.guard.ts:10))
- ✅ Quản lý session (ví dụ: [`ClerkSessionService`](src/modules/clerk/clerk.session.service.ts:6))
- ✅ Tích hợp với API bên ngoài (Clerk)
- ✅ Authentication (Xác thực - bạn là ai?)

**Không nên chứa:**
- ❌ Logic nghiệp vụ liên quan đến vai trò (ví dụ: [`AdminGuard`](src/modules/clerk/guards/admin.guard.ts:5) hiện tại)
- ❌ Quyết định phân quyền (authorization - bạn được làm gì?)
- ❌ Định nghĩa vai trò cụ thể của nghiệp vụ

### Domain/Application Layer (Tầng Miền/Ứng dụng - AuthModule)
**Nên chứa:**
- ✅ Phân quyền dựa trên vai trò (ví dụ: [`RolesGuard`](src/modules/auth/guards/roles.guard.ts:6))
- ✅ Logic phân quyền cụ thể theo nghiệp vụ
- ✅ Định nghĩa vai trò và các chính sách liên quan (ví dụ: [`UserRole`](src/modules/users/entities/user.entity.ts:11))
- ✅ Authorization (Phân quyền - bạn được làm gì?)

## Khuyến Nghị Refactoring

### 1. **Loại Bỏ AdminGuard Khỏi ClerkModule**
- Xóa file [`src/modules/clerk/guards/admin.guard.ts`](src/modules/clerk/guards/admin.guard.ts).
- Cập nhật [`ClerkModule`](src/modules/clerk/clerk.module.ts:14) để không cung cấp và export `AdminGuard`.
- Xóa file [`src/modules/clerk/decorators/admin-only.decorator.ts`](src/modules/clerk/decorators/admin-only.decorator.ts) vì nó phụ thuộc vào `AdminGuard`.

**[`ClerkModule`](src/modules/clerk/clerk.module.ts:14) sau khi refactor:**
```typescript
// src/modules/clerk/clerk.module.ts
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClerkSessionService } from './clerk.session.service';
import { ClerkController } from './clerk.controller';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
// AdminGuard đã bị xóa

export interface ClerkModuleOptions {
  secretKey: string;
  publishableKey: string;
}

@Module({})
export class ClerkModule {
  static forRoot(options: ClerkModuleOptions): DynamicModule {
    return {
      module: ClerkModule,
      controllers: [ClerkController],
      providers: [
        {
          provide: 'CLERK_OPTIONS',
          useValue: options,
        },
        ClerkSessionService,
        ClerkAuthGuard, // Chỉ còn ClerkAuthGuard
      ],
      // Chỉ export các thành phần thuần túy của infrastructure
      exports: [ClerkSessionService, ClerkAuthGuard, 'CLERK_OPTIONS'],
      global: true,
    };
  }

  static forRootAsync(): DynamicModule {
    return {
      module: ClerkModule,
      imports: [ConfigModule],
      controllers: [ClerkController],
      providers: [
        {
          provide: 'CLERK_OPTIONS',
          useFactory: (configService: ConfigService): ClerkModuleOptions => ({
            secretKey: configService.get<string>('CLERK_SECRET_KEY'),
            publishableKey: configService.get<string>('CLERK_PUBLISHABLE_KEY'),
          }),
          inject: [ConfigService],
        },
        ClerkSessionService,
        ClerkAuthGuard,
      ],
      exports: [ClerkSessionService, ClerkAuthGuard, 'CLERK_OPTIONS'],
      global: true,
    };
  }
}
```

### 2. **Sử Dụng Nhất Quán RolesGuard và Roles Decorator từ AuthModule**
- [`AuthModule`](src/modules/auth/auth.module.ts) nên là nơi duy nhất chịu trách nhiệm về logic phân quyền dựa trên vai trò.
- [`RolesGuard`](src/modules/auth/guards/roles.guard.ts:6) và [`Roles` decorator](src/modules/auth/decorators/roles.decorator.ts:4) đã được triển khai đúng cách và nên được sử dụng cho tất cả các trường hợp cần phân quyền, bao gồm cả admin.

**Ví dụ sử dụng trong [`AdminController`](src/modules/admin/admin.controller.ts:14):**
```typescript
// src/modules/admin/admin.controller.ts
import { Controller, Get, Post, Body, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../clerk/guards/clerk-auth.guard'; // Từ ClerkModule (Infrastructure)
import { RolesGuard } from '../auth/guards/roles.guard';         // Từ AuthModule (Application/Domain)
import { Roles } from '../auth/decorators/roles.decorator';       // Từ AuthModule (Application/Domain)
import { UserRole } from '../users/entities/user.entity';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(ClerkAuthGuard, RolesGuard) // ClerkAuthGuard xác thực, RolesGuard phân quyền
@Roles(UserRole.ADMIN)                 // Chỉ định vai trò ADMIN được phép
@ApiBearerAuth()
export class AdminController {
  // ...
}
```
Cách sử dụng này là đúng đắn và nên được duy trì.

### 3. **Đảm Bảo Logic Lấy Vai Trò Nhất Quán**
- Cả [`AdminGuard`](src/modules/clerk/guards/admin.guard.ts:5) (sẽ bị xóa) và [`RolesGuard`](src/modules/auth/guards/roles.guard.ts:6) đều lấy thông tin vai trò từ `request.user.publicMetadata?.role`. Điều này là tốt và nên được duy trì trong [`RolesGuard`](src/modules/auth/guards/roles.guard.ts:6).
- Đảm bảo rằng `publicMetadata.role` được thiết lập một cách đáng tin cậy trong Clerk dashboard hoặc thông qua API của Clerk khi người dùng được tạo hoặc cập nhật.

## Lợi Ích Của Việc Refactoring

- **Cải thiện Separation of Concerns**: Logic nghiệp vụ (phân quyền) được tách biệt hoàn toàn khỏi logic hạ tầng (xác thực).
- **Giảm Coupling**: Business logic không còn phụ thuộc trực tiếp vào các thành phần phân quyền cụ thể của ClerkModule.
- **Loại bỏ Code Duplication**: Chỉ còn một cơ chế duy nhất (`RolesGuard`) để xử lý phân quyền dựa trên vai trò.
- **Tăng tính Bảo trì và Mở rộng**: Dễ dàng hơn trong việc cập nhật logic phân quyền hoặc thay đổi nhà cung cấp xác thực trong tương lai.
- **Kiến trúc Rõ ràng hơn**: Các nhà phát triển sẽ có một cách tiếp cận nhất quán và rõ ràng để xử lý xác thực và phân quyền.

## Kết Luận

Việc triển khai admin authentication hiện tại trong ClerkModule có một số vấn đề về kiến trúc, chủ yếu là do việc đặt business logic (kiểm tra vai trò admin) vào trong infrastructure layer. Bằng cách loại bỏ `AdminGuard` và `AdminOnly` decorator khỏi ClerkModule và sử dụng nhất quán `RolesGuard` và `Roles` decorator từ AuthModule, chúng ta có thể đạt được một kiến trúc sạch sẽ hơn, dễ bảo trì hơn và tuân thủ tốt hơn các nguyên tắc thiết kế phần mềm.