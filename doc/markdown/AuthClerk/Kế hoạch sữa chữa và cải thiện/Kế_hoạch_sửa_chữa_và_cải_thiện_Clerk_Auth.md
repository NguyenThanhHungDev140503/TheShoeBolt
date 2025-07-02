# Kế hoạch Hành động Kỹ thuật Chi tiết - Cải thiện Module Clerk & Auth

**Người soạn thảo:** Senior Tech Lead
**Ngày:** {{CURRENT_DATE}}
**Báo cáo tham chiếu:** [Clerk_Auth_Review_Report.md](./Clerk_Auth_Review_Report.md)

## 1. Mục tiêu

Tài liệu này trình bày kế hoạch hành động kỹ thuật chi tiết nhằm khắc phục triệt để các vấn đề đã được xác định trong báo cáo đánh giá module `clerk` và `auth`. Kế hoạch được cấu trúc để đội ngũ phát triển có thể triển khai ngay lập tức, đảm bảo nâng cao tính bảo mật, hiệu năng, và khả năng bảo trì của hệ thống xác thực.

## 2. Danh sách Vấn đề và Thứ tự Ưu tiên

Dựa trên phân tích báo cáo, các vấn đề được nhóm và sắp xếp theo mức độ ưu tiên như sau:

**Giai đoạn 1: Khắc phục Lỗ hổng Bảo mật & Tuân thủ (Ưu tiên: CRITICAL)**
1.  **Vấn đề #1, #2:** Sử dụng SDK Deprecated và Thiếu Provider Pattern.
2.  **Vấn đề #3:** Thiếu JWT Key cho Networkless Authentication.
3.  **Vấn đề #4:** Sử dụng Sai Phương thức Xác thực trong Guard.
4.  **Vấn đề #7:** Logic Role Checking Không An toàn (Lỗi Fail-Safe).
5.  **Vấn đề #16:** Logic Phân quyền Multiple Roles Không Chính xác (Lỗi AND/OR).

**Giai đoạn 2: Cải thiện Chức năng và Bảo mật Lõi (Ưu tiên: HIGH)**
6.  **Vấn đề #6:** Xử lý Lỗi Không Đầy đủ (Insufficient Error Handling).
7.  **Vấn đề #8:** Thiếu Xác thực Dữ liệu Đầu vào (Input Validation).
8.  **Vấn đề #10:** Thiếu Giới hạn Tần suất Truy cập (Rate Limiting).
9.  **Vấn đề #5:** Thiếu Triển khai Webhook.

**Giai đoạn 3: Nâng cao Chất lượng và Kiểm thử (Ưu tiên: MEDIUM)**
10. **Vấn đề #11:** Độ bao phủ Kiểm thử Thấp.
11. **Vấn đề #12:** Thiếu Xác thực Cấu hình Môi trường.
12. **Vấn đề #9:** Định dạng Phản hồi Không nhất quán.

**Giai đoạn 4: Tối ưu Kiến trúc và Tài liệu (Ưu tiên: LOW)**
13. **Vấn đề #15:** Kiến trúc Module Không nhất quán.
14. **Vấn đề #13:** Thiếu Giám sát và Quan sát (Monitoring & Observability).
15. **Vấn đề #14:** Thiếu Tài liệu Hóa (Documentation).

---

## 3. Kế hoạch Chi tiết

### **Giai đoạn 1: Khắc phục Lỗ hổng Bảo mật & Tuân thủ (CRITICAL)**

#### **Vấn đề 1.1: (Tổng hợp #1, #2) Nâng cấp SDK và Áp dụng Provider Pattern**

*   **Tóm tắt:** Hệ thống đang sử dụng SDK `@clerk/clerk-sdk-node` đã lỗi thời và không áp dụng ClerkClient Provider Pattern, vi phạm các khuyến nghị chính thức và tiềm ẩn rủi ro bảo mật.
*   **Phân tích Nguyên nhân Gốc rễ:**
    *   Việc triển khai ban đầu có thể đã dựa trên các tài liệu cũ hoặc ví dụ không chính thức.
    *   Thiếu nhận thức về việc `@clerk/clerk-sdk-node` đã bị deprecate.
    *   Không tận dụng được hệ thống Dependency Injection (DI) của NestJS, dẫn đến việc import trực tiếp `clerkClient`.
*   **Giải pháp Kỹ thuật:**
    1.  **Gỡ bỏ SDK cũ và cài đặt SDK mới:**
        ```bash
        npm uninstall @clerk/clerk-sdk-node
        npm install @clerk/backend
        ```
    2.  **Tạo ClerkClient Provider:** Tạo một file provider chuyên dụng để khởi tạo `ClerkClient` và tích hợp vào hệ thống DI của NestJS.
        ```typescript
        // src/modules/Infrastructure/clerk/providers/clerk-client.provider.ts
        import { Provider } from '@nestjs/common';
        import { ConfigService } from '@nestjs/config';
        import { ClerkClient, createClerkClient } from '@clerk/backend';

        export const CLERK_CLIENT = 'ClerkClient';

        export const ClerkClientProvider: Provider = {
          provide: CLERK_CLIENT,
          useFactory: (configService: ConfigService): ClerkClient => {
            const secretKey = configService.get<string>('CLERK_SECRET_KEY');
            if (!secretKey) {
              throw new Error('CLERK_SECRET_KEY is not set in environment variables.');
            }
            return createClerkClient({ secretKey });
          },
          inject: [ConfigService],
        };
        ```
    3.  **Cập nhật `clerk.module.ts`:**
        ```typescript
        // src/modules/Infrastructure/clerk/clerk.module.ts
        import { Module } from '@nestjs/common';
        import { ConfigModule } from '@nestjs/config';
        import { ClerkClientProvider } from './providers/clerk-client.provider';
        import { ClerkSessionService } from './clerk.session.service';
        import { ClerkAuthGuard } from './guards/clerk-auth.guard';
        // ...

        @Module({
          imports: [ConfigModule],
          providers: [ClerkClientProvider, ClerkSessionService, ClerkAuthGuard],
          exports: [ClerkSessionService, ClerkAuthGuard, ClerkClientProvider.provide],
        })
        export class ClerkModule {}
        ```
    4.  **Inject `ClerkClient` vào `ClerkSessionService`:**
        ```typescript
        // src/modules/Infrastructure/clerk/clerk.session.service.ts
        import { Inject, Injectable } from '@nestjs/common';
        import { ClerkClient } from '@clerk/backend';
        import { CLERK_CLIENT } from './providers/clerk-client.provider';

        @Injectable()
        export class ClerkSessionService {
          constructor(@Inject(CLERK_CLIENT) private readonly clerkClient: ClerkClient) {}
          // ... các phương thức sử dụng this.clerkClient
        }
        ```
*   **Kế hoạch Kiểm thử:**
    *   **Unit Test:**
        *   Mock `ClerkClientProvider` để kiểm tra `ClerkModule` khởi tạo thành công.
        *   Kiểm tra `ClerkSessionService` nhận được `clerkClient` instance qua DI.
        *   Kiểm tra Provider ném lỗi nếu `CLERK_SECRET_KEY` không tồn tại.
    *   **Integration Test:**
        *   Thực hiện một yêu cầu API đến một endpoint được bảo vệ bởi `ClerkAuthGuard`.
        *   Xác minh rằng Guard có thể truy cập `clerkClient` và thực hiện xác thực thành công.

---
#### **Vấn đề 1.2: (Vấn đề #3) Kích hoạt Networkless Authentication**

*   **Tóm tắt:** Hệ thống không sử dụng `jwtKey`, khiến mọi yêu cầu xác thực token đều phải thực hiện một cuộc gọi mạng đến API của Clerk, gây ảnh hưởng đến hiệu năng và độ tin cậy.
*   **Phân tích Nguyên nhân Gốc rễ:** Thiếu sót trong cấu hình ban đầu, bỏ qua một tùy chọn quan trọng giúp tối ưu hiệu năng được Clerk cung cấp.
*   **Giải pháp Kỹ thuật:**
    1.  **Thêm `CLERK_JWT_KEY` vào file môi trường:**
        ```env
        # .env
        CLERK_JWT_KEY=-----BEGIN PUBLIC KEY-----\nYOUR_JWT_PUBLIC_KEY\n-----END PUBLIC KEY-----
        ```
    2.  **Cập nhật `ClerkClientProvider` để sử dụng `jwtKey`:**
        ```typescript
        // src/modules/Infrastructure/clerk/providers/clerk-client.provider.ts
        // ...
        export const ClerkClientProvider: Provider = {
          provide: CLERK_CLIENT,
          useFactory: (configService: ConfigService): ClerkClient => {
            const secretKey = configService.get<string>('CLERK_SECRET_KEY');
            const jwtKey = configService.get<string>('CLERK_JWT_KEY'); // Thêm dòng này

            if (!secretKey) {
              throw new Error('CLERK_SECRET_KEY is not set.');
            }
            if (!jwtKey) {
                throw new Error('CLERK_JWT_KEY is not set for networkless authentication.');
            }

            return createClerkClient({ secretKey, jwtKey }); // Cập nhật tại đây
          },
          inject: [ConfigService],
        };
        ```
*   **Kế hoạch Kiểm thử:**
    *   **Unit Test:**
        *   Kiểm tra `ClerkClientProvider` ném lỗi nếu `CLERK_JWT_KEY` bị thiếu.
        *   Mock `createClerkClient` và xác minh rằng nó được gọi với cả `secretKey` và `jwtKey`.
    *   **Integration Test:**
        *   Tạo một integration test cho `ClerkAuthGuard`.
        *   Sử dụng một JWT hợp lệ và xác minh rằng việc xác thực thành công mà không cần gọi ra bên ngoài (có thể dùng `nock` hoặc `jest.spyOn` để chặn các cuộc gọi mạng).

---

#### **Vấn đề 1.3: (Vấn đề #4) Sử dụng `authenticateRequest` trong Guard**

*   **Tóm tắt:** `ClerkAuthGuard` đang tự phân tích token và gọi `verifyToken`, thay vì sử dụng hàm `authenticateRequest` được Clerk tối ưu hóa cho môi trường server-side và middleware.
*   **Phân tích Nguyên nhân Gốc rễ:** Lựa chọn phương thức xác thực không phù hợp với ngữ cảnh sử dụng (Guard/Middleware), có thể do hiểu sai tài liệu hoặc dựa trên các ví dụ cũ.
*   **Giải pháp Kỹ thuật:** Tái cấu trúc `ClerkAuthGuard` để sử dụng `authenticateRequest`.
    ```typescript
    // src/modules/Infrastructure/clerk/guards/clerk-auth.guard.ts
    import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
    import { Request } from 'express';
    import { ClerkClient, authenticateRequest } from '@clerk/backend';
    import { CLERK_CLIENT } from '../providers/clerk-client.provider';
    import { ConfigService } from '@nestjs/config';

    @Injectable()
    export class ClerkAuthGuard implements CanActivate {
      private readonly logger = new Logger(ClerkAuthGuard.name);

      constructor(
        @Inject(CLERK_CLIENT) private readonly clerkClient: ClerkClient,
        private readonly configService: ConfigService
      ) {}

      async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        
        try {
          const authResult = await authenticateRequest({
            request,
            secretKey: this.configService.get('CLERK_SECRET_KEY'),
            jwtKey: this.configService.get('CLERK_JWT_KEY'),
          });

          if (!authResult.toAuth().userId) {
            throw new UnauthorizedException('User not authenticated.');
          }
          
          // Gắn thông tin auth vào request để các phần khác có thể sử dụng
          (request as any).auth = authResult.toAuth();
          
          return true;
        } catch (error) {
          this.logger.error(`Authentication failed: ${error.message}`, error.stack);
          throw new UnauthorizedException('Authentication failed.');
        }
      }
    }
    ```
*   **Kế hoạch Kiểm thử:**
    *   **Unit Test:**
        *   Mock `authenticateRequest` và kiểm tra các trường hợp: thành công, thất bại, ném lỗi.
        *   Kiểm tra `auth` object được gắn vào `request` khi thành công.
    *   **Integration Test:**
        *   Gửi request với header `Authorization` chứa token hợp lệ, mong đợi `2xx` status.
        *   Gửi request với header `Authorization` chứa token không hợp lệ, mong đợi `401 Unauthorized`.
        *   Gửi request không có header `Authorization`, mong đợi `401 Unauthorized`.

---
#### **Vấn đề 1.4: (Vấn đề #7) Sửa Lỗi Logic Role Checking (Fail-Safe)**

*   **Tóm tắt:** `RolesGuard` trả về `true` (cho phép truy cập) khi một endpoint không có decorator `@Roles`, vi phạm nguyên tắc fail-safe (mặc định từ chối).
*   **Phân tích Nguyên nhân Gốc rễ:** Lỗi logic cơ bản trong thiết kế của Guard, không xử lý trường hợp không có yêu cầu về vai trò một cách an toàn.
*   **Giải pháp Kỹ thuật:** Thay đổi logic để mặc định từ chối truy cập nếu không có vai trò nào được yêu cầu.
    ```typescript
    // src/modules/auth/guards/roles.guard.ts
    import { ROLES_KEY } from '../decorators/roles.decorator';
    // ...
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      // ✅ Sửa lỗi: Mặc định từ chối nếu không có vai trò nào được định nghĩa
      if (!requiredRoles || requiredRoles.length === 0) {
        // Trả về false để từ chối truy cập theo nguyên tắc fail-safe.
        return false; 
      }

      const { auth } = context.switchToHttp().getRequest();
      if (!auth || !auth.userId) {
        throw new UnauthorizedException('User not authenticated.');
      }

      const userRoles = auth.sessionClaims?.public_metadata?.roles || [];
      const hasPermission = requiredRoles.every((role) => userRoles.includes(role));

      if (!hasPermission) {
          throw new ForbiddenException('Insufficient permissions.');
      }
      
      return true;
    }
    // ...
    ```
*   **Kế hoạch Kiểm thử:**
    *   **Unit Test:**
        *   Kiểm tra `canActivate` trả về `false` khi `reflector` trả về `undefined` hoặc mảng rỗng.
        *   Kiểm tra `canActivate` tiếp tục xử lý khi `reflector` trả về một mảng vai trò.
    *   **Integration Test:**
        *   Tạo một endpoint controller test không có decorator `@Roles`.
        *   Gọi API đến endpoint đó và xác minh nhận được `403 Forbidden`.

---
#### **Vấn đề 1.5: (Vấn đề #16) Sửa Lỗi Logic Phân quyền Multiple Roles**

*   **Tóm tắt:** Logic kiểm tra vai trò đang sử dụng điều kiện `OR` (`some`), cho phép truy cập nếu người dùng có chỉ một trong nhiều vai trò yêu cầu, thay vì yêu cầu TẤT CẢ.
*   **Phân tích Nguyên nhân Gốc rễ:** Sử dụng sai phương thức lặp mảng (`some` thay vì `every`) cho logic ủy quyền.
*   **Giải pháp Kỹ thuật:** Thay đổi logic thành `every` để yêu cầu tất cả các vai trò.
    ```typescript
    // src/modules/auth/guards/roles.guard.ts
    // ...
    async canActivate(context: ExecutionContext): Promise<boolean> {
      // ... (logic lấy requiredRoles và auth object như trên)

      const userRoles = auth.sessionClaims?.public_metadata?.roles || [];
      
      // ✅ Sửa lỗi: Sử dụng 'every' để yêu cầu TẤT CẢ các vai trò
      const hasPermission = requiredRoles.every((role) => userRoles.includes(role));

      if (!hasPermission) {
          throw new ForbiddenException('Insufficient permissions.');
      }
      
      return true;
    }
    ```
*   **Kế hoạch Kiểm thử:**
    *   **Unit Test:**
        *   Test `RolesGuard` với decorator `@Roles('ADMIN', 'MANAGER')`: user có `[ADMIN, MANAGER]` -> pass; user có `[ADMIN]` -> fail.
    *   **Integration Test:**
        *   Tạo endpoint với `@Roles('admin', 'super-user')`.
        *   Test với user chỉ có role `admin` -> mong đợi `403 Forbidden`.
        *   Test với user có cả `admin` và `super-user` -> mong đợi `200 OK`.

---
*Ghi chú: Các giai đoạn 2, 3, 4 sẽ được lên kế hoạch chi tiết sau khi hoàn tất Giai đoạn 1.*

## 4. Definition of Done (DoD)

Toàn bộ kế hoạch được xem là **Hoàn thành** khi tất cả các điều kiện sau được thỏa mãn:

1.  **Mã nguồn:** Tất cả các giải pháp kỹ thuật đã được triển khai và merge vào nhánh `main`.
2.  **Kiểm thử:**
    *   Tất cả các ca kiểm thử (Unit & Integration) được viết và pass.
    *   Độ bao phủ mã nguồn (code coverage) cho các module đã sửa đổi đạt **trên 90%**.
3.  **CI/CD:** Pipeline CI/CD chạy thành công cho các thay đổi đã được merge.
4.  **Tài liệu:**
    *   Tài liệu `README.md` của dự án được cập nhật (nếu cần).
    *   Các comment JSDoc/TSDoc được thêm vào cho các hàm và logic phức tạp mới.
5.  **Review:** Mã nguồn đã được review và phê duyệt bởi ít nhất một Senior Developer khác.
6.  **Xác minh:** Các vấn đề được liệt kê trong báo cáo gốc đã được xác minh là đã được khắc phục trên môi trường Staging. 