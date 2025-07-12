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
            publishableKey: configService.get<string>('CLERK_PUBLISHABLE_KEY'),
            secretKey: configService.get<string>('CLERK_SECRET_KEY'),
            if (!secretKey) {
              throw new Error('CLERK_SECRET_KEY is not set in environment variables.');
            }
            if (!publishableKey) {
                throw new Error('CLERK_PUBLISHABLE_KEY is not set in environment variables.');
            }
            return createClerkClient({ secretKey, publishableKey });
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
    2.  **Cập nhật  để sử dụng `jwtKey`:**
        
        ```typescript
         const jwtKey = this.configService.get('CLERK_JWT_KEY');
         if (!jwtKey) {
            throw new Error('CLERK_JWT_KEY is not set in environment variables.');
          }
             try {
              const { sessionId, userId, orgId, claims } = await authenticateRequest({
                headers: request.headers,
                cookies: request.cookies,
              }, {
                jwtKey: jwtKey,
                secretKey: this.configService.get('CLERK_SECRET_KEY'),
                authorizedParties: [this.configService.get('CLERK_FRONTEND_API_URL')],
              });
        
              if (!userId) {
                throw new UnauthorizedException('User not authenticated');
              }
        
              // Attach user info to request
              request['clerkUser'] = { sessionId, userId, orgId, claims };
              return true;
            } catch (error) {
              throw new UnauthorizedException('Authentication failed');
            }
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
        
        const jwtKey = this.configService.get('CLERK_JWT_KEY');
         try {
          const { sessionId, userId, orgId, claims } = await authenticateRequest({
            headers: request.headers,
            cookies: request.cookies,
          }, {
            jwtKey: jwtKey,
            secretKey: this.configService.get('CLERK_SECRET_KEY'),
            authorizedParties: [this.configService.get('CLERK_FRONTEND_API_URL')],
          });
    
          if (!userId) {
            throw new UnauthorizedException('User not authenticated');
          }
    
          // Attach user info to request
          request['clerkUser'] = { sessionId, userId, orgId, claims };
          return true;
        } catch (error) {
          throw new UnauthorizedException('Authentication failed');
        }
      }
    }
    ```
*   **Kế hoạch Kiểm thử:**
    *   **Unit Test:**
        *   Mock `authenticateRequest` và kiểm tra các trường hợp: thành công, thất bại, ném lỗi.
        *   Kiểm tra `clerkUser` object được gắn vào `request` khi thành công.
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
    
      const { clerkUser } = context.switchToHttp().getRequest();
      if (!clerkUser || !clerkUser.userId) {
        this.logger.warn('Access denied: No roles specified for protected endpoint');
        throw new UnauthorizedException('User not authenticated.');
      }
    
      const userRoles = clerkUser.claims?.public_metadata?.roles || [];
      
      if (!userRoles) {
        this.logger.warn(`Access denied: User ${user.id} has no publicMetadata`);
        throw new ForbiddenException('Access denied: User metadata not found');
      }
    
      const hasPermission = requiredRoles.every((role) => userRoles.includes(role));
    
      if (!hasPermission) {
          this.logger.warn(`Access denied: User ${user.id} with role ${userRole} attempted to access endpoint requiring roles: ${requiredRoles.join(', ')}`);
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
    
    
    
    // Tạo 2 decorator riêng:
    @RolesAny(UserRole.ADMIN, UserRole.MODERATOR) // OR logic
    @RolesAll(UserRole.ADMIN, UserRole.FINANCE_MANAGER) // AND logic
    ```
*   **Kế hoạch Kiểm thử:**
    *   **Unit Test:**
        *   Test `RolesGuard` với decorator `@RolesAll('ADMIN', 'CUSTOMER')`: user có `[ADMIN, CUSTOMER]` -> pass; user có `[ADMIN]` -> fail.
        *   Test `RolesGuard` với decorator `@RolesAny('ADMIN', 'CUSTOMER')`: user có `[ADMIN, CUSTOMER]` -> pass; user có `[ADMIN]` -> pass.
    *   **Integration Test:**
        *   Tạo endpoint với `@RolesAll('admin', 'customer')`.
        *   Test với user chỉ có role `admin` -> mong đợi `403 Forbidden`.
        *   Test với user có cả `admin` và `customer` -> mong đợi `200 OK`.

---
*Ghi chú: Các giai đoạn 2, 3, 4 sẽ được lên kế hoạch chi tiết sau khi hoàn tất Giai đoạn 1.*

### **Giai đoạn 2: Cải thiện Chức năng và Bảo mật Lõi (HIGH)**

#### **Vấn đề 2.1: (Vấn đề #6) Xử lý Lỗi Không Đầy đủ**

*   **Tóm tắt:** Việc xử lý lỗi hiện tại quá chung chung, thường chỉ trả về `UnauthorizedException` mà không ghi lại chi tiết lỗi hoặc phân biệt các loại lỗi khác nhau từ Clerk, gây khó khăn cho việc gỡ lỗi và có thể làm lộ thông tin nhạy cảm.
*   **Phân tích Nguyên nhân Gốc rễ:** Thiếu một chiến lược xử lý lỗi toàn diện. Mã nguồn hiện tại tập trung vào "happy path" mà bỏ qua các trường hợp lỗi khác nhau có thể xảy ra khi tương tác với API bên ngoài.
*   **Giải pháp Kỹ thuật:**
    1.  **Sử dụng Logger của NestJS:** Đảm bảo mỗi service tương tác với Clerk đều có một instance của `Logger` để ghi lại thông tin chi tiết.
    2.  **Triển khai Bắt lỗi Cụ thể:** Trong các khối `try...catch`, kiểm tra đối tượng `error` trả về từ Clerk. Phân biệt các mã trạng thái phổ biến (401, 403, 404) và trả về các exception tương ứng của NestJS (`UnauthorizedException`, `ForbiddenException`, `NotFoundException`).
    3.  **Ghi Log Chi tiết:** Trước khi ném ra một exception mới, ghi lại lỗi gốc ở mức `error` kèm theo `stack trace` để phục vụ việc gỡ lỗi.
    4.  **Tái cấu trúc `ClerkSessionService`:** Áp dụng mẫu xử lý lỗi này cho tất cả các phương thức có tương tác với Clerk API.
    ```typescript
    // src/modules/Infrastructure/clerk/clerk.session.service.ts
    import { Inject, Injectable, Logger, NotFoundException, ForbiddenException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
    import { ClerkClient } from '@clerk/backend';
    import { CLERK_CLIENT } from './providers/clerk-client.provider';
    
    @Injectable()
    export class ClerkSessionService {
      private readonly logger = new Logger(ClerkSessionService.name);
    
      constructor(@Inject(CLERK_CLIENT) private readonly clerkClient: ClerkClient) {}
    
      async getSessionList(userId: string): Promise<Session[]> {
        try {
          this.logger.debug(`Attempting to get sessions for user: ${userId}`);
          const sessions = await this.clerkClient.sessions.getSessionList({ userId });
          this.logger.debug(`Successfully found ${sessions.length} sessions for user: ${userId}`);
          return sessions;
        } catch (error) {
          this.logger.error(`Failed to get sessions for user ${userId}:`, error.stack);
    
          // Kiểm tra error format từ Clerk API - có thể là error.status hoặc error.response?.status
          const statusCode = error.status || error.response?.status || error.statusCode;
    
          if (statusCode === 404) {
            throw new NotFoundException(`User with ID ${userId} not found.`);
          }
          if (statusCode === 403) {
            throw new ForbiddenException(`Access denied to retrieve sessions for user ${userId}.`);
          }
          if (statusCode === 401) {
            throw new UnauthorizedException(`Authentication failed for user ${userId}.`);
          }
    
          // Log chi tiết error để debugging
          this.logger.error(`Unexpected error details:`, {
            message: error.message,
            status: statusCode,
            response: error.response?.data,
            stack: error.stack
          });
    
          throw new InternalServerErrorException('An unexpected error occurred while retrieving user sessions.');
        }
      }
    
      async revokeSession(sessionId: string) {
        try {
          this.logger.debug(`Attempting to revoke session: ${sessionId}`);
          const revokedSession = await this.clerkClient.sessions.revokeSession(sessionId);
          this.logger.debug(`Successfully revoked session: ${sessionId}`);
          return revokedSession;
        } catch (error) {
          this.logger.error(`Failed to revoke session ${sessionId}:`, error.stack);
    
          const statusCode = error.status || error.response?.status || error.statusCode;
    
          if (statusCode === 404) {
            throw new NotFoundException(`Session with ID ${sessionId} not found.`);
          }
          if (statusCode === 403) {
            throw new ForbiddenException(`Access denied to revoke session ${sessionId}.`);
          }
          if (statusCode === 401) {
            throw new UnauthorizedException(`Authentication failed for session ${sessionId}.`);
          }
    
          this.logger.error(`Unexpected error details:`, {
            message: error.message,
            status: statusCode,
            response: error.response?.data,
            stack: error.stack
          });
    
          throw new InternalServerErrorException('An unexpected error occurred while revoking session.');
        }
      }
    
      // Áp dụng mô hình try-catch tương tự cho tất cả các phương thức khác
    }
    ```
*   **Kế hoạch Kiểm thử:**
    *   **Unit Test:**
        *   Mock `clerkClient.sessions.getSessionList` để ném ra một lỗi mô phỏng từ Clerk với `status: 404`. Xác minh rằng service ném ra `NotFoundException` và log lỗi.
        *   Mock phương thức để ném ra lỗi với `status: 403`. Xác minh rằng `ForbiddenException` được ném ra và log lỗi.
        *   Mock phương thức để ném ra một `Error` chung. Xác minh rằng `InternalServerErrorException` được ném ra và log lỗi.
        *   Trong mọi trường hợp lỗi, xác minh rằng `logger.error` đã được gọi với thông báo lỗi và stack trace.

---

#### **Vấn đề 2.2: (Vấn đề #8) Thiếu Xác thực Dữ liệu Đầu vào**

* **Tóm tắt:** Các controller endpoint chấp nhận tham số như `userId` và `sessionId` trực tiếp mà không qua xác thực, tạo ra các rủi ro bảo mật (ví dụ: injection) và ảnh hưởng đến tính toàn vẹn dữ liệu.

* **Phân tích Nguyên nhân Gốc rễ:** Chưa tận dụng các tính năng xác thực sẵn có của NestJS như `class-validator` và `ValidationPipe`.

*   **Giải pháp Kỹ thuật:**
    1.  **Kích hoạt `ValidationPipe` Toàn cục:** Trong file `main.ts`, cấu hình `ValidationPipe` để tự động xác thực tất cả DTOs đầu vào.
        ```typescript
        // src/main.ts
        import { ValidationPipe } from '@nestjs/common';
        async function bootstrap() {
          const app = await NestFactory.create(AppModule);
          app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
          }));
          //...
          await app.listen(process.env.PORT || 3000);
        }
        bootstrap();
        ```
    2.  **Tạo DTO cho Tham số Đường dẫn:** Xây dựng các class DTO riêng cho các tham số để áp dụng các quy tắc xác thực.
        ```typescript
        // src/modules/Infrastructure/clerk/dto/clerk-params.dto.ts
        import { IsString, Matches, IsNotEmpty } from 'class-validator';
        
        export class SessionIdParamDto {
          @IsString()
          @IsNotEmpty()
          @Matches(/^sess_[a-zA-Z0-9]+$/, { message: 'Invalid session ID format.' })
          sessionId: string;
        }
        
        export class UserIdParamDto {
          @IsString()
          @IsNotEmpty()
          @Matches(/^user_[a-zA-Z0-9]+$/, { message: 'Invalid user ID format.' })
          userId: string;
        }
        ```
    3.  **Áp dụng DTO trong Controller:** Sử dụng các DTO đã tạo trong các phương thức của controller.
        ```typescript
        // src/modules/Infrastructure/clerk/clerk.controller.ts
        import { Controller, Delete, Get, Param } from '@nestjs/common';
        import { SessionIdParamDto, UserIdParamDto } from './dto/clerk-params.dto';
        // ...
        
        @Controller('clerk')
        export class ClerkController {
          // ...
          @Delete('sessions/:sessionId')
          async revokeSession(@Param() params: SessionIdParamDto) {
            // ...
          }
        
          @Get('admin/users/:userId/sessions')
          async getAnyUserSessions(@Param() params: UserIdParamDto) {
            // ...
          }
        }
        ```
    
*   **Kế hoạch Kiểm thử:**
    *   **Unit Test:**
        *   ClerkController Logic Test:
            *   should call clerkSessionService.revokeSession with valid sessionId
            *   should handle service errors properly
            *   revokeAllUserSessions
        *   DTO Validation Test:
            *   SessionIdParamDto Validation
                *   should reject invalid sessionId format (missing sess_ prefix)
                *   should reject sessionId with invalid characters
                *   should reject empty sessionId
                *   should accept valid sessionId format (sess_xxx)
            *   UserIdParamDto Validation
                *   Tương  tự với phần trên
        *   Kiểm tra DTO Classes Implementation
            *   should have SessionIdParamDto with proper validation rules
            *   should have UserIdParamDto with proper validation rules
        *   Kiểm tra ValidationPipe Configuration
            *   should have ValidationPipe configured globally in test environment
        *    Security Risk Assessment - Validation Protection
            *   ....

---

#### **Vấn đề 2.3: (Vấn đề #10) Thiếu Giới hạn Tần suất Truy cập (Rate Limiting)**

*   **Tóm tắt:** Các endpoint nhạy cảm thiếu cơ chế rate limiting, khiến chúng có nguy cơ bị tấn công DoS hoặc brute-force.
*   **Phân tích Nguyên nhân Gốc rễ:** Việc tăng cường bảo mật như rate limiting đã bị bỏ qua trong quá trình phát triển ban đầu.
*   **Giải pháp Kỹ thuật:**
    1.  **Cài đặt và Cấu hình `nestjs-throttler`:**
        ```bash
        # Dependency đã có trong package.json: "@nestjs/throttler": "^5.0.1"
        # Không cần cài đặt thêm
        ```
    2.  **Import và Cấu hình `ThrottlerModule`:** Trong `app.module.ts`, thiết lập giới hạn mặc định và đăng ký `ThrottlerGuard` trên toàn cục.
        ```typescript
        // src/app.module.ts
        import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
        import { APP_GUARD } from '@nestjs/core';
        
        @Module({
          imports: [
            // ... existing imports
            ThrottlerModule.forRoot([{
              name: 'default',
              ttl: 60000, // 1 phút (60 giây)
              limit: 20,  // 20 yêu cầu mỗi phút
            }]),
            // ... other imports
          ],
          providers: [
            // ... existing providers
            {
              provide: APP_GUARD,
              useClass: ThrottlerGuard,
            },
            // ... other providers
          ],
        })
        export class AppModule {}
        ```
    3.  **Tùy chỉnh Giới hạn cho Endpoint Cụ thể:** Áp dụng giới hạn chặt chẽ hơn cho các endpoint đặc biệt nhạy cảm.
        ```typescript
        // src/modules/Infrastructure/clerk/clerk.controller.ts
        import { Throttle } from '@nestjs/throttler';
        import { SessionIdParamDto, UserIdParamDto } from './dto/clerk-params.dto';
        
        @Controller('clerk')
        @UseGuards(ClerkAuthGuard) // Existing guard
        export class ClerkController {
        
          @Delete('sessions/:sessionId')
          @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 yêu cầu/phút cho sensitive operations
          @HttpCode(HttpStatus.NO_CONTENT)
          async revokeSession(@Param() params: SessionIdParamDto) {
            await this.clerkSessionService.revokeSession(params.sessionId);
            return;
          }
        
          @Delete('sessions')
          @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 yêu cầu/phút cho revoke all
          @HttpCode(HttpStatus.NO_CONTENT)
          async revokeAllSessions(@Request() req) {
            await this.clerkSessionService.revokeAllUserSessions(req.user.id);
            return;
          }
        
          @Delete('admin/users/:userId/sessions')
          @UseGuards(ClerkAuthGuard, RolesGuard)
          @Roles(UserRole.ADMIN)
          @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 yêu cầu/phút cho admin operations
          @HttpCode(HttpStatus.NO_CONTENT)
          async revokeAllUserSessions(@Param() params: UserIdParamDto) {
            await this.clerkSessionService.revokeAllUserSessions(params.userId);
            return;
          }
        }
        ```
*   **Kế hoạch Kiểm thử:**
    *   **E2E Test:**
        *   Thiết lập giới hạn thấp cho một endpoint test (ví dụ: 2 yêu cầu/10 giây).
        *   Gửi 3 yêu cầu liên tiếp đến endpoint đó.
        *   Xác minh rằng 2 yêu cầu đầu tiên nhận được phản hồi khác `429`.
        *   Xác minh rằng yêu cầu thứ 3 nhận được lỗi `429 Too Many Requests`.
        *   Đợi hết thời gian `ttl` và gửi lại yêu cầu, xác minh rằng nó thành công.

---

#### **Vấn đề 2.4: (Vấn đề #5) Thiếu Triển khai Webhook**

*   **Tóm tắt:** Hệ thống thiếu webhook handler để đồng bộ dữ liệu người dùng từ Clerk theo thời gian thực, có thể dẫn đến sự không nhất quán giữa cơ sở dữ liệu cục bộ và Clerk.
*   **Phân tích Nguyên nhân Gốc rễ:** Tính năng đồng bộ thời gian thực chưa được triển khai, có thể do không nằm trong phạm vi của MVP ban đầu.
*   **Giải pháp Kỹ thuật:**
    1.  **Cài đặt các thư viện cần thiết:**
        ```bash
        npm install svix raw-body
        npm install --save-dev @types/raw-body
        ```
    2.  **Cấu hình Raw Body Parser:** Cần có `rawBody` để xác thực chữ ký webhook. Merge với existing setup trong `main.ts`.
        ```typescript
        // src/main.ts
        import { NestFactory } from '@nestjs/core';
        import { ValidationPipe, Logger } from '@nestjs/common';
        import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
        import { ConfigService } from '@nestjs/config';
        import * as helmet from 'helmet';
        import * as compression from 'compression';
        import * as express from 'express';
        import { AppModule } from './app.module';
        import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
        import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
        import { TransformInterceptor } from './common/interceptors/transform.interceptor';
        
        async function bootstrap() {
          const app = await NestFactory.create(AppModule);
          const configService = app.get(ConfigService);
          const logger = new Logger('Bootstrap');
        
          // Security middleware
          app.use(helmet());
          app.use(compression());
        
          // Global prefix
          app.setGlobalPrefix('api/v1');
        
          // CORS configuration
          app.enableCors({
            origin: configService.get('CORS_ORIGIN') || 'http://localhost:3000',
            credentials: true,
          });
        
          // ✅ WEBHOOK RAW BODY PARSER - Chỉ cho webhook endpoints
          app.use('/api/v1/webhooks/clerk', express.raw({ type: 'application/json' }));
        
          // Global pipes (existing)
          app.useGlobalPipes(
            new ValidationPipe({
              whitelist: true,
              forbidNonWhitelisted: true,
              transform: true,
              transformOptions: {
                enableImplicitConversion: true,
              },
            }),
          );
        
          // Global filters and interceptors (existing)
          app.useGlobalFilters(new AllExceptionsFilter());
          app.useGlobalInterceptors(new LoggingInterceptor());
          app.useGlobalInterceptors(new TransformInterceptor());
        
          // Swagger documentation (existing)
          if (configService.get('NODE_ENV') !== 'production') {
            const config = new DocumentBuilder()
              .setTitle('NestJS Backend API')
              .setDescription('Robust backend system with PostgreSQL, Redis, RabbitMQ, Stripe, and Resend')
              .setVersion('1.0')
              .addBearerAuth()
              .addTag('Authentication')
              .addTag('Users')
              .addTag('Payments')
              .addTag('Emails')
              .addTag('Webhooks')
              .build();
        
            const document = SwaggerModule.createDocument(app, config);
            SwaggerModule.setup('api/docs', app, document);
          }
        
          const port = configService.get('PORT') || 3000;
          await app.listen(port);
          logger.log(`Application is running on: http://localhost:${port}`);
        }
        bootstrap();
        ```
    3.  **Tạo Webhook Module và Controller:**
        ```typescript
        // src/modules/webhooks/webhooks.module.ts
        import { Module } from '@nestjs/common';
        import { ConfigModule } from '@nestjs/config';
        import { ClerkWebhookController } from './clerk-webhook.controller';
        import { UsersModule } from '../users/users.module';
        
        @Module({
          imports: [ConfigModule, UsersModule],
          controllers: [ClerkWebhookController],
        })
        export class WebhooksModule {}
        ```

        ```typescript
        // src/modules/webhooks/clerk-webhook.controller.ts
        import { Controller, Post, Req, Res, Headers, BadRequestException, Logger, HttpStatus } from '@nestjs/common';
        import { Request, Response } from 'express';
        import { Webhook } from 'svix';
        import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
        import { EnvConfigService } from '../../config/env.config';
        import { UsersService } from '../users/users.service';
        
        @ApiTags('Webhooks')
        @Controller('webhooks')
        export class ClerkWebhookController {
          private readonly logger = new Logger(ClerkWebhookController.name);
        
          constructor(
            private readonly envConfig: EnvConfigService,
            private readonly usersService: UsersService,
          ) {}
        
          @Post('clerk')
          @ApiOperation({ summary: 'Handle Clerk webhook events' })
          @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
          @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
          async handleClerkWebhook(@Headers() headers, @Req() req: Request, @Res() res: Response) {
            const webhookSecret = this.envConfig.clerk.webhookSecret;
            if (!webhookSecret) {
              this.logger.error('Clerk webhook secret is not configured.');
              return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                error: 'Webhook secret not configured'
              });
            }
        
            try {
              // Get raw body from express.raw() middleware
              const payload = req.body;
              const payloadString = payload.toString();
        
              const svixHeaders = {
                'svix-id': headers['svix-id'] as string,
                'svix-timestamp': headers['svix-timestamp'] as string,
                'svix-signature': headers['svix-signature'] as string,
              };
        
              // Verify webhook signature
              const wh = new Webhook(webhookSecret);
              const evt = wh.verify(payloadString, svixHeaders) as any;
        
              this.logger.log(`Webhook event received: ${evt.type} for ${evt.data?.id || 'unknown'}`);
        
              // Process webhook events
              switch (evt.type) {
                case 'user.created':
                  await this.handleUserCreated(evt.data);
                  break;
                case 'user.updated':
                  await this.handleUserUpdated(evt.data);
                  break;
                case 'user.deleted':
                  await this.handleUserDeleted(evt.data);
                  break;
                case 'session.created':
                  await this.handleSessionCreated(evt.data);
                  break;
                case 'session.ended':
                  await this.handleSessionEnded(evt.data);
                  break;
                default:
                  this.logger.warn(`Unhandled webhook event type: ${evt.type}`);
              }
        
              return res.status(HttpStatus.OK).json({
                success: true,
                message: 'Webhook processed successfully',
                eventType: evt.type
              });
        
            } catch (err) {
              this.logger.error('Error processing Clerk webhook:', {
                error: err.message,
                stack: err.stack,
                headers: headers
              });
        
              return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                error: 'Webhook signature verification failed'
              });
            }
          }
        
          private async handleUserCreated(userData: any) {
            try {
              this.logger.debug(`Processing user.created for user: ${userData.id}`);
              await this.usersService.syncUserFromClerk(userData);
              this.logger.log(`Successfully synced new user: ${userData.id}`);
            } catch (error) {
              this.logger.error(`Failed to sync user.created for ${userData.id}:`, error);
              throw error;
            }
          }
        
          private async handleUserUpdated(userData: any) {
            try {
              this.logger.debug(`Processing user.updated for user: ${userData.id}`);
              await this.usersService.updateUserFromClerk(userData);
              this.logger.log(`Successfully updated user: ${userData.id}`);
            } catch (error) {
              this.logger.error(`Failed to sync user.updated for ${userData.id}:`, error);
              throw error;
            }
          }
        
          private async handleUserDeleted(userData: any) {
            try {
              this.logger.debug(`Processing user.deleted for user: ${userData.id}`);
              await this.usersService.deleteUser(userData.id);
              this.logger.log(`Successfully deleted user: ${userData.id}`);
            } catch (error) {
              this.logger.error(`Failed to sync user.deleted for ${userData.id}:`, error);
              throw error;
            }
          }
        
          private async handleSessionCreated(sessionData: any) {
            try {
              this.logger.debug(`Processing session.created for session: ${sessionData.id}`);
              // Implement session tracking logic if needed
              this.logger.log(`Session created: ${sessionData.id} for user: ${sessionData.user_id}`);
            } catch (error) {
              this.logger.error(`Failed to process session.created for ${sessionData.id}:`, error);
            }
          }
        
          private async handleSessionEnded(sessionData: any) {
            try {
              this.logger.debug(`Processing session.ended for session: ${sessionData.id}`);
              // Implement session cleanup logic if needed
              this.logger.log(`Session ended: ${sessionData.id} for user: ${sessionData.user_id}`);
            } catch (error) {
              this.logger.error(`Failed to process session.ended for ${sessionData.id}:`, error);
            }
          }
        }
        ```
    4.  **Cập nhật `app.module.ts`:** Import WebhooksModule vào AppModule.
        ```typescript
        // src/app.module.ts
        import { Module } from '@nestjs/common';
        // ... other imports
        import { WebhooksModule } from './modules/webhooks/webhooks.module';
        
        @Module({
          imports: [
            // ... existing imports
            WebhooksModule,
            // ... other imports
          ],
          // ... rest of module configuration
        })
        export class AppModule {}
        ```
    5.  **Cập nhật Environment Configuration:** Thêm CLERK_WEBHOOK_SECRET vào env validation.
        ```typescript
        // src/config/env.validation.ts
        export class EnvironmentVariables {
          // ... existing properties
        
          @IsString()
          @IsNotEmpty()
          CLERK_WEBHOOK_SECRET: string;
        
          // ... other properties
        }
        ```
    6.  **Cập nhật `UsersService`:** Thêm các phương thức để xử lý logic đồng bộ dữ liệu từ Clerk vào CSDL cục bộ.
        ```typescript
        // src/modules/users/users.service.ts
        import { Injectable, Logger, NotFoundException } from '@nestjs/common';
        // ... other imports
        
        @Injectable()
        export class UsersService {
          private readonly logger = new Logger(UsersService.name);
        
          // ... existing methods
        
          /**
           * Sync user data from Clerk webhook
           */
          async syncUserFromClerk(clerkUserData: any): Promise<void> {
            try {
              this.logger.debug(`Syncing user from Clerk: ${clerkUserData.id}`);
        
              const userData = {
                clerkId: clerkUserData.id,
                email: clerkUserData.email_addresses?.[0]?.email_address,
                firstName: clerkUserData.first_name,
                lastName: clerkUserData.last_name,
                profileImageUrl: clerkUserData.profile_image_url,
                publicMetadata: clerkUserData.public_metadata,
                privateMetadata: clerkUserData.private_metadata,
                createdAt: new Date(clerkUserData.created_at),
                updatedAt: new Date(clerkUserData.updated_at),
              };
        
              // Check if user already exists
              const existingUser = await this.findByClerkId(clerkUserData.id);
        
              if (existingUser) {
                this.logger.warn(`User ${clerkUserData.id} already exists, updating instead`);
                await this.updateUserFromClerk(clerkUserData);
                return;
              }
        
              // Create new user
              await this.create(userData);
              this.logger.log(`Successfully synced new user: ${clerkUserData.id}`);
        
            } catch (error) {
              this.logger.error(`Failed to sync user from Clerk: ${clerkUserData.id}`, error);
              throw error;
            }
          }
        
          /**
           * Update user data from Clerk webhook
           */
          async updateUserFromClerk(clerkUserData: any): Promise<void> {
            try {
              this.logger.debug(`Updating user from Clerk: ${clerkUserData.id}`);
        
              const existingUser = await this.findByClerkId(clerkUserData.id);
              if (!existingUser) {
                this.logger.warn(`User ${clerkUserData.id} not found, creating instead`);
                await this.syncUserFromClerk(clerkUserData);
                return;
              }
        
              const updateData = {
                email: clerkUserData.email_addresses?.[0]?.email_address,
                firstName: clerkUserData.first_name,
                lastName: clerkUserData.last_name,
                profileImageUrl: clerkUserData.profile_image_url,
                publicMetadata: clerkUserData.public_metadata,
                privateMetadata: clerkUserData.private_metadata,
                updatedAt: new Date(clerkUserData.updated_at),
              };
        
              await this.update(existingUser.id, updateData);
              this.logger.log(`Successfully updated user: ${clerkUserData.id}`);
        
            } catch (error) {
              this.logger.error(`Failed to update user from Clerk: ${clerkUserData.id}`, error);
              throw error;
            }
          }
        
          /**
           * Delete user from Clerk webhook
           */
          async deleteUser(clerkUserId: string): Promise<void> {
            try {
              this.logger.debug(`Deleting user from Clerk webhook: ${clerkUserId}`);
        
              const existingUser = await this.findByClerkId(clerkUserId);
              if (!existingUser) {
                this.logger.warn(`User ${clerkUserId} not found for deletion`);
                return;
              }
        
              await this.remove(existingUser.id);
              this.logger.log(`Successfully deleted user: ${clerkUserId}`);
        
            } catch (error) {
              this.logger.error(`Failed to delete user from Clerk: ${clerkUserId}`, error);
              throw error;
            }
          }
        
          /**
           * Find user by Clerk ID
           */
          async findByClerkId(clerkId: string): Promise<any> {
            // Implementation depends on your database setup
            // This is a placeholder - adjust according to your User entity
            return await this.userRepository.findOne({ where: { clerkId } });
          }
        }
        ```
*   **Kế hoạch Kiểm thử:**
    
    *   **Unit Test:**
        *   Mock `Webhook.verify` để trả về một payload sự kiện mẫu. Kiểm tra controller gọi đúng phương thức của `usersService`.
        *   Mock `Webhook.verify` để ném ra lỗi. Xác minh controller ném ra `BadRequestException`.
        *   Unit test các phương thức đồng bộ mới trong `UsersService`.
    *   **Integration Test (Manual):**
        *   Trong môi trường Staging, thực hiện các hành động (tạo, cập nhật, xóa user) trên Clerk Dashboard và xác minh rằng webhook được kích hoạt và dữ liệu trong CSDL của ứng dụng được cập nhật chính xác thông qua việc kiểm tra log và database.

---
*Ghi chú: Các giai đoạn 3, 4 sẽ được lên kế hoạch chi tiết sau khi hoàn tất Giai đoạn 2.*

### **Giai đoạn 3: Nâng cao Chất lượng và Kiểm thử (MEDIUM)**

#### **✅ TRẠNG THÁI CẬP NHẬT: 2/3 vấn đề đã HOÀN THÀNH, 1 vấn đề cần cải thiện**

---

#### **Vấn đề 3.1: (Vấn đề #11) Cải thiện Độ bao phủ Kiểm thử** *(Cập nhật: ĐANG TIẾN TRIỂN)*

*   **Trạng thái hiện tại:**
    *   ✅ Jest configuration đã được thiết lập hoàn chỉnh
    *   ✅ Test infrastructure đã sẵn sàng với multiple test types
    *   ✅ 75/75 unit và component tests PASS
    *   ✅ Code coverage hiện tại: 75.1% statements, 71.69% branches
    *   ❌ E2E tests gặp compilation errors (TypeScript issues)
    *   ❌ Một số modules có coverage thấp (clerk.session.service.ts: 13.46%)

*   **Cập nhật Phân tích:** Dự án đã có test infrastructure vững chắc nhưng cần cải thiện coverage cho một số modules quan trọng và sửa E2E test issues.

*   **Giải pháp Kỹ thuật đã triển khai:**
    1.  **✅ Jest Configuration hoàn chỉnh:**
        ```json
        // package.json - ĐÃ CÓ
        "scripts": {
          "test:unit": "jest --config test/jest-unit.json",
          "test:watch": "jest --watch --config test/jest-unit.json",
          "test:cov": "jest --coverage --config test/jest-unit.json",
          "test:e2e": "jest --config test/jest-e2e.json",
          "test:component": "jest --config test/jest-component.json",
          "test:all": "npm run test && npm run test:component && npm run test:e2e"
        }
        ```
    2.  **✅ Unit Tests đã được triển khai:** Dự án đã có comprehensive unit tests cho Guards và Services:

        **Hiện có:**
        - `src/modules/Infrastructure/clerk/guards/clerk-auth.guard.spec.ts` - ✅ Đã có
        - `src/modules/auth/guards/roles.guard.spec.ts` - ✅ Đã có
        - `src/modules/Infrastructure/clerk/clerk.session.service.spec.ts` - ✅ Đã có
        - Component tests trong `test/component/` - ✅ Đã có

        **Cần cải thiện:**
        ```typescript
        // Cần tăng coverage cho clerk.session.service.ts (hiện tại chỉ 13.46%)
        // Đặc biệt các methods: getUser(), getSession(), verifyTokenAndGetAuthData()

        // Ví dụ test case cần thêm:
        describe('ClerkSessionService - Missing Coverage', () => {
          it('should handle getUser with invalid userId', async () => {
            // Test error handling cho invalid user ID
          });

          it('should handle network timeout in getSession', async () => {
            // Test timeout scenarios
          });

          it('should validate JWT token format in verifyTokenAndGetAuthData', async () => {
            // Test JWT validation edge cases
          });
        });
        ```

    3.  **❌ E2E Tests cần sửa chữa:** Hiện tại E2E tests gặp compilation errors:

        **Vấn đề hiện tại:**
        ```bash
        # E2E test failures do TypeScript compilation errors:
        # - amqplib type definitions issues trong queues.service.ts
        # - Không liên quan trực tiếp đến Clerk/Auth modules
        ```

        **✅ Component Tests đã hoạt động tốt:**
        ```typescript
        // test/component/ - ĐÃ CÓ VÀ HOẠT ĐỘNG
        // 35 component tests PASS covering:
        // - Authentication flows
        // - Authorization scenarios
        // - Error handling
        // - Role-based access control
        ```

        **Cần làm:**
        ```typescript
        // 1. Sửa E2E compilation errors (không liên quan Clerk)
        // 2. Thêm E2E tests cho Clerk endpoints:

        describe('Clerk E2E Tests', () => {
          it('should handle full authentication flow', async () => {
            // Test complete auth flow từ token validation đến response
          });

          it('should test admin endpoints with proper authorization', async () => {
            // Test admin-only endpoints với real HTTP requests
          });
        });
        ```

    4.  **✅ Code Coverage Targets đã được thiết lập:**
        - Hiện tại: 75.1% statements, 71.69% branches
        - Mục tiêu: Nâng lên 85%+ cho Clerk/Auth modules
        - CI/CD integration: Cần thiết lập coverage gates

*   **Kế hoạch Kiểm thử cập nhật:**
    *   **Ưu tiên cao:**
        *   Tăng coverage cho `clerk.session.service.ts` từ 13.46% lên 85%+
        *   Sửa E2E compilation errors (amqplib types)
        *   Thêm missing test cases cho security-critical methods
    *   **Definition of Done (cập nhật):**
        *   ✅ Unit tests cho `RolesGuard` - ĐÃ HOÀN THÀNH
        *   ❌ Cần hoàn thiện unit tests cho `ClerkSessionService` (coverage thấp)
        *   ❌ Sửa E2E test compilation errors
        *   ❌ Đạt 85%+ coverage cho tất cả Clerk/Auth modules

---

#### **✅ Vấn đề 3.2: (Vấn đề #12) Environment Validation - HOÀN THÀNH**

*   **Trạng thái:** ✅ **ĐÃ TRIỂN KHAI THÀNH CÔNG** (03/07/2025)
*   **Tóm tắt triển khai:** Hệ thống Environment Validation đã được triển khai hoàn chỉnh với comprehensive validation cho tất cả environment variables.

*   **✅ Đã triển khai:**
    1.  **Environment Validation System hoàn chỉnh:**
        ```typescript
        // src/config/env.validation.ts - ĐÃ CÓ
        export class EnvironmentVariables {
          @IsString()
          @Length(32, 512)
          @Matches(/^sk_/, { message: 'CLERK_SECRET_KEY must start with sk_' })
          CLERK_SECRET_KEY: string;

          @IsString()
          @IsNotEmpty()
          CLERK_PUBLISHABLE_KEY: string;

          @IsString()
          @IsNotEmpty()
          CLERK_JWT_KEY: string;

          // + 20+ other environment variables với comprehensive validation
        }
        ```

    2.  **✅ Integrated vào AppModule:**
        ```typescript
        // src/app.module.ts - ĐÃ ĐƯỢC ÁP DỤNG
        ConfigModule.forRoot({
          isGlobal: true,
          validate: validateEnvironment, // ✅ Đã được áp dụng
        })
        ```

*   **✅ Kết quả kiểm thử đã hoàn thành:**
    *   **27 test cases** với **100% coverage**
    *   **Type-safe configuration** với EnvConfigService
    *   **Comprehensive error handling** với detailed error messages
    *   **Production-ready** với backward compatibility

*   **✅ Tài liệu:** `doc/markdown/AuthClerk/Kế hoạch sữa chữa và cải thiện 2/7/Environment-Validation-Implementation-Report.md`

---

#### **✅ Vấn đề 3.3: (Vấn đề #9) API Response Format - HOÀN THÀNH**

*   **Trạng thái:** ✅ **ĐÃ TRIỂN KHAI THÀNH CÔNG**
*   **Tóm tắt triển khai:** Hệ thống chuẩn hóa API response đã được triển khai và áp dụng globally.

*   **✅ Đã triển khai:**
    1.  **✅ Transform Interceptor đã được tạo:**
        ```typescript
        // src/common/interceptors/transform.interceptor.ts - ĐÃ CÓ
        export interface Response<T> {
          data: T;
          statusCode: number;
          timestamp: string;
        }

        @Injectable()
        export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
          intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
            const statusCode = context.switchToHttp().getResponse().statusCode;

            return next.handle().pipe(
              map(data => ({
                data,
                statusCode,
                timestamp: new Date().toISOString(),
              })),
            );
          }
        }
        ```

    2.  **✅ Global Application đã được áp dụng:**
        ```typescript
        // src/main.ts - ĐÃ ĐƯỢC ÁP DỤNG
        app.useGlobalInterceptors(new TransformInterceptor()); // ✅ Line 49
        ```

*   **✅ Response Format hiện tại:**
    ```json
    {
      "data": { /* actual response data */ },
      "statusCode": 200,
      "timestamp": "2025-01-15T10:30:00.000Z"
    }
    ```

*   **✅ Kết quả:** Tất cả API endpoints hiện tại đều trả về consistent response format, giúp client dễ dàng xử lý.

---
*Ghi chú: Giai đoạn 4 sẽ được lên kế hoạch chi tiết sau khi hoàn tất Giai đoạn 3.*

### **Giai đoạn 4: Tối ưu Kiến trúc và Tài liệu (LOW)**

#### **Vấn đề 4.1: (Vấn đề #15) Kiến trúc Module Không nhất quán**

*   **Tóm tắt:** Hiện tại có sự chồng chéo về trách nhiệm giữa `ClerkModule` (được định vị là infrastructure) và `AuthModule` (application). `ClerkModule` nên chỉ tập trung vào việc cung cấp các khối xây dựng cơ bản để tương tác với Clerk, trong khi `AuthModule` nên xử lý logic nghiệp vụ về phân quyền (authorization).
*   **Phân tích Nguyên nhân Gốc rễ:** Sự phân chia trách nhiệm giữa các lớp (layer) chưa được thực thi một cách nghiêm ngặt trong quá trình phát triển, dẫn đến logic nghiệp vụ bị rò rỉ vào lớp cơ sở hạ tầng.
*   **Giải pháp Kỹ thuật:**
    1.  **Xác định lại vai trò:**
        *   `ClerkModule`: Cung cấp `ClerkClient`, `ClerkAuthGuard` (chỉ xác thực token, không phân quyền), và `ClerkSessionService` (chỉ tương tác API Clerk). Nó **export** các thành phần này.
        *   `AuthModule`: **Import** `ClerkModule`. Chứa `RolesGuard` (sử dụng `ClerkAuthGuard` và xử lý logic phân quyền), và `AuthService` (logic nghiệp vụ liên quan đến người dùng).
    2.  **Tái cấu trúc `ClerkModule`:**
        ```typescript
        // src/modules/Infrastructure/clerk/clerk.module.ts
        import { Global, Module } from '@nestjs/common';
        // ... (các imports khác)
        
        @Global() // Biến ClerkModule thành global để các module khác có thể inject mà không cần import
        @Module({
          imports: [ConfigModule],
          providers: [ClerkClientProvider, ClerkSessionService, ClerkAuthGuard],
          exports: [ClerkSessionService, ClerkAuthGuard, CLERK_CLIENT], // Chỉ export những gì cần thiết
        })
        export class ClerkModule {}
        ```
    3.  **Tái cấu trúc `AuthModule`:**
        ```typescript
        // src/modules/auth/auth.module.ts
        import { Module } from '@nestjs/common';
        import { RolesGuard } from './guards/roles.guard';
        import { AuthService } from './auth.service';
        // ClerkModule không cần import ở đây nữa vì đã là Global
        
        @Module({
          providers: [AuthService, RolesGuard],
          exports: [AuthService, RolesGuard],
        })
        export class AuthModule {}
        ```
    4.  **Cập nhật `AppModule`:** Import `ClerkModule` và `AuthModule`.
        ```typescript
        // src/app.module.ts
        // ...
        import { ClerkModule } from './modules/Infrastructure/clerk/clerk.module';
        import { AuthModule } from './modules/auth/auth.module';
        
        @Module({
          imports: [
            // ... các modules khác
            ClerkModule,
            AuthModule,
          ],
          // ...
        })
        export class AppModule {}
        ```
*   **Kế hoạch Kiểm thử:**
    *   **Tái cấu trúc (Refactoring):** Bản chất của nhiệm vụ này là tái cấu trúc.
    *   **Kiểm thử Hồi quy (Regression Testing):** Chạy lại toàn bộ bộ kiểm thử (unit, integration, e2e) đã có để đảm bảo rằng việc thay đổi cấu trúc không phá vỡ bất kỳ chức năng nào. Các bài kiểm thử hiện có phải pass 100%.

---

#### **Vấn đề 4.2: (Vấn đề #13) Thiếu Giám sát và Quan sát (Monitoring & Observability)**

*   **Tóm tắt:** Hệ thống thiếu các công cụ để theo dõi hiệu suất và các lỗi của luồng xác thực, gây khó khăn trong việc phát hiện các vấn đề tiềm ẩn hoặc các mẫu tấn công.
*   **Phân tích Nguyên nhân Gốc rễ:** Các yếu tố về vận hành (operations) và giám sát (monitoring) thường được xem là có độ ưu tiên thấp và bị bỏ qua trong giai đoạn đầu.
*   **Giải pháp Kỹ thuật:**
    1.  **Tích hợp Prometheus:** Sử dụng `prom-client` để tạo và theo dõi các metric tùy chỉnh.
        ```bash
        npm install prom-client
        ```
    2.  **Tạo Metrics Service:** Xây dựng một service chuyên dụng để quản lý các metric.
        ```typescript
        // src/modules/metrics/metrics.service.ts
        import { Injectable } from '@nestjs/common';
        import { Counter, Histogram, register } from 'prom-client';
        
        @Injectable()
        export class MetricsService {
          public readonly authAttempts = new Counter({
            name: 'theshoebolt_auth_attempts_total',
            help: 'Total number of authentication attempts.',
            labelNames: ['status', 'guard'], // success, failure
          });
        
          public readonly authDuration = new Histogram({
            name: 'theshoebolt_auth_duration_seconds',
            help: 'Authentication duration in seconds.',
            labelNames: ['guard'],
          });
        
          constructor() {
            register.registerMetric(this.authAttempts);
            register.registerMetric(this.authDuration);
          }
        }
        ```
    3.  **Inject và Sử dụng MetricsService:** Cập nhật các guard để ghi lại metric.
        ```typescript
        // src/modules/Infrastructure/clerk/guards/clerk-auth.guard.ts
        // ...
        import { MetricsService } from '../../../metrics/metrics.service';
        
        export class ClerkAuthGuard implements CanActivate {
          constructor(
            //...
            private readonly metricsService: MetricsService,
          ) {}
        
          async canActivate(context: ExecutionContext): Promise<boolean> {
            const end = this.metricsService.authDuration.startTimer({ guard: 'clerk' });
            try {
              //... logic xác thực
              this.metricsService.authAttempts.inc({ status: 'success', guard: 'clerk' });
              return true;
            } catch (error) {
              this.metricsService.authAttempts.inc({ status: 'failure', guard: 'clerk' });
              throw error;
            } finally {
              end();
            }
          }
        }
        ```
    4.  **Tạo Endpoint `/metrics`:**
        ```typescript
        // src/modules/metrics/metrics.controller.ts
        import { Controller, Get, Res } from '@nestjs/common';
        import { register } from 'prom-client';
        import { Response } from 'express';
        
        @Controller('metrics')
        export class MetricsController {
          @Get()
          async getMetrics(@Res() res: Response) {
            res.set('Content-Type', register.contentType);
            res.end(await register.metrics());
          }
        }
        ```
*   **Kế hoạch Kiểm thử:**
    *   **Unit Test:**
        *   Kiểm tra `MetricsService` khởi tạo các metric đúng cách.
        *   Kiểm tra trong `ClerkAuthGuard`, các phương thức `inc` và `startTimer` của metric được gọi đúng lúc.
    *   **E2E Test:**
        *   Gọi một vài API được bảo vệ.
        *   Sau đó, gọi API `GET /metrics`.
        *   Xác minh rằng nội dung trả về chứa tên các metric đã định nghĩa (`theshoebolt_auth_attempts_total`) và giá trị của chúng đã được cập nhật.

---

#### **Vấn đề 4.3: (Vấn đề #14) Thiếu Tài liệu Hóa (Documentation)**

*   **Tóm tắt:** Thiếu các bình luận mã nguồn (JSDoc/TSDoc) và tài liệu API, gây khó khăn cho việc bảo trì và onboarding thành viên mới.
*   **Phân tích Nguyên nhân Gốc rễ:** Viết tài liệu là một công việc thường bị trì hoãn hoặc bỏ qua để ưu tiên cho việc hoàn thành tính năng.
*   **Giải pháp Kỹ thuật:**
    1.  **Áp dụng Quy ước JSDoc/TSDoc:** Duyệt qua các file đã được sửa đổi trong các giai đoạn trước và thêm các khối bình luận chi tiết cho:
        *   Mục đích của các class (đặc biệt là services và guards).
        *   Mô tả, tham số (`@param`), và giá trị trả về (`@returns`) cho các phương thức public phức tạp.
        *   Ví dụ sử dụng (`@example`) cho các hàm quan trọng.
    2.  **Tích hợp Swagger:** Sử dụng `@nestjs/swagger` để tự động tạo tài liệu API tương tác.
        ```bash
        npm install @nestjs/swagger swagger-ui-express
        ```
    3.  **Cấu hình Swagger trong `main.ts`:**
        ```typescript
        // src/main.ts
        import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
        
        async function bootstrap() {
          const app = await NestFactory.create(AppModule);
          
          const config = new DocumentBuilder()
            .setTitle('TheShoeBolt API')
            .setDescription('API documentation for TheShoeBolt application')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
          const document = SwaggerModule.createDocument(app, config);
          SwaggerModule.setup('api-docs', app, document);
        
          // ...
          await app.listen(3000);
        }
        ```
    4.  **Trang trí (Decorate) DTOs và Controllers:** Sử dụng các decorator như `@ApiProperty()`, `@ApiOperation()`, `@ApiResponse()` để làm phong phú thêm tài liệu Swagger.
*   **Kế hoạch Kiểm thử:**
    *   **Kiểm tra Thủ công:**
        *   Chạy ứng dụng và truy cập vào đường dẫn `/api-docs`.
        *   Xác minh rằng giao diện Swagger UI hiển thị chính xác.
        *   Kiểm tra một vài endpoint để đảm bảo mô tả, tham số, và các phản hồi mẫu được hiển thị đúng như đã định nghĩa bằng decorator.
        *   Thực hiện một yêu cầu API thử nghiệm trực tiếp từ Swagger UI.

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