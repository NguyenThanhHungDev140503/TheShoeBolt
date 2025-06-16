# TheShoeBolt System Patterns & Architecture

## Kiến Trúc Tổng Quan

### Architecture Style
**Modular Monolith với Microservices Readiness**

Dự án sử dụng NestJS module system để tạo ra các ranh giới rõ ràng giữa các domain nghiệp vụ, chuẩn bị cho khả năng tách thành microservices trong tương lai nếu cần thiết. Kiến trúc tập trung vào việc phân tách các mối quan tâm (separation of concerns) và khả năng bảo trì cao.

### High-Level Architecture

```mermaid
graph TD
    subgraph Client Tier
        WebApp[Web Client (React/Next.js)]
        MobileApp[Mobile App (React Native/Flutter) - Tương lai]
        AdminPanel[Admin Panel (React/Next.js)]
    end

    subgraph API Gateway Tier
        APIGateway(API Gateway - NestJS App)
    end

    subgraph Application Tier - NestJS Backend
        subgraph Business Logic Modules
            UsersModule[User Module]
            ProductModule[Product Module]
            CartModule[Cart Module]
            OrderModule[Order Module]
            CheckoutModule[Checkout Module]
            PromotionModule[Promotion Module]
            NotificationModule[Notification Module]
            WishlistModule[Wishlist Module]
            FeedbackModule[Feedback Module]
            AnalyticsModule[Analytics Module]
            CollectionModule[Collection Module]
        end

        subgraph Integration Modules
            AuthModule[Auth Module (Clerk)]
            ShipperIntegrationModule[Shipper Integration Module]
            StripePaymentModule[Stripe Payment Gateway Module]
        end

        subgraph Infrastructure Support Modules
            RBACModule[RBAC Module]
            GlobalErrorHandlingModule[Global Error Handling]
            DatabaseModule[Database Module]
            EmailServiceModule[Email Service (Resend)]
            LoggingModule[Logging Module]
            CacheModule[Cache Module (Redis)]
            FileStorageModule[File Storage (S3/Cloudinary)]
            SearchModule[Search Module (Elasticsearch)]
            MessageQueueModule[Message Queue (RabbitMQ/Kafka)]
            WebhookHandlerModule[Webhook Handler Module]
        end
    end

    subgraph Data Tier
        PostgreSQL[(PostgreSQL - Primary)]
        MongoDB[(MongoDB - Chat, Logs - Cân nhắc)]
        Redis[(Redis - Cache, Sessions)]
        Elasticsearch[(Elasticsearch - Search Index)]
    end

    subgraph External Services
        ClerkService[Clerk Auth Service]
        StripeService[Stripe Payment Service]
        ResendService[Resend Email Service]
        ShippingService[Shipping Partner APIs]
        CloudStorageService[Cloud File Storage]
    end

    WebApp --> APIGateway
    MobileApp --> APIGateway
    AdminPanel --> APIGateway

    APIGateway --> BusinessLogicModules
    APIGateway --> IntegrationModules

    BusinessLogicModules --> InfrastructureSupportModules
    IntegrationModules --> InfrastructureSupportModules
    InfrastructureSupportModules --> DataTier
    BusinessLogicModules --> DataTier

    IntegrationModules --> ClerkService
    IntegrationModules --> StripeService
    InfrastructureSupportModules --> ResendService
    IntegrationModules --> ShippingService
    InfrastructureSupportModules --> CloudStorageService
    InfrastructureSupportModules --> Elasticsearch
    InfrastructureSupportModules --> Redis
    InfrastructureSupportModules --> MongoDB
    InfrastructureSupportModules --> PostgreSQL
```

## Core Design Patterns

### 1. Module Pattern (NestJS)
Tổ chức code theo các domain nghiệp vụ và chức năng hạ tầng. Mỗi module đóng gói controllers, services, providers, và DTOs liên quan.
*   **Business Modules**: `UserModule`, `ProductModule`, `OrderModule`, `CartModule`, `CheckoutModule`, `PromotionModule`, `NotificationModule`, `WishlistModule`, `FeedbackModule`, `AnalyticsModule`, `CollectionModule`.
*   **Integration Modules**: `AuthModule` (tích hợp Clerk), `ShipperIntegrationModule`, `StripePaymentModule`.
*   **Infrastructure Modules**: `RBACModule`, `GlobalErrorHandlingModule`, `DatabaseModule`, `EmailServiceModule` (tích hợp Resend), `LoggingModule`, `CacheModule`, `FileStorageModule`, `SearchModule`, `MessageQueueModule`, `WebhookHandlerModule`.

### 2. Multi-Database Pattern
Sử dụng cơ sở dữ liệu phù hợp cho từng loại dữ liệu và mục đích:
*   **PostgreSQL**: Dữ liệu quan hệ chính (người dùng, sản phẩm, đơn hàng).
*   **MongoDB (Cân nhắc)**: Dữ liệu phi cấu trúc như tin nhắn chat, logs.
*   **Redis**: Caching, quản lý session, dữ liệu real-time.
*   **Elasticsearch**: Indexing cho tìm kiếm nâng cao, analytics.

### 3. Controller-Service-Repository Pattern
Phân lớp kiến trúc rõ ràng:
*   **Controller**: Xử lý HTTP requests, gọi services.
*   **Service**: Chứa business logic, điều phối hoạt động.
*   **Repository (TypeORM)**: Truy cập và thao tác dữ liệu.

### 4. DTO (Data Transfer Object) Pattern
Sử dụng DTOs với `class-validator` và `class-transformer` để đảm bảo tính hợp lệ và an toàn kiểu cho dữ liệu đầu vào/ra của API.

### 5. Guard Pattern (NestJS)
*   **`ClerkAuthGuard`**: Xác thực JWT token từ Clerk, gắn thông tin người dùng vào request.
*   **`RolesGuard`**: Kiểm tra vai trò người dùng (lấy từ `publicMetadata` của Clerk) để phân quyền truy cập (RBAC).

### 6. WebSocket Gateway Pattern
Sử dụng cho các tính năng real-time như chat (`ChatGateway`) và thông báo.

### 7. Interceptor Pattern (NestJS)
*   **`LoggingInterceptor`**: Ghi log request/response.
*   **`TransformInterceptor`**: Chuẩn hóa cấu trúc response trả về cho client.
*   **`CacheInterceptor`**: Tự động cache các response từ API.

### 8. Filter Pattern (NestJS)
*   **`AllExceptionsFilter`**: Bắt và xử lý tất cả các lỗi một cách tập trung, trả về response lỗi chuẩn hóa.

## Data Flow Patterns

### 1. Request-Response Flow (API)
`Client Request` → `API Gateway` → `ClerkAuthGuard` (Xác thực Token) → `RolesGuard` (Kiểm tra Quyền) → `Controller` → `ValidationPipe` (DTO Validation) → `Service` (Business Logic) → `Repository` → `Database (PostgreSQL/MongoDB)`
`Client Response` ← `TransformInterceptor` ← `Service` ← `Repository`

### 2. Real-time Communication Flow (WebSocket)
`Client WebSocket Connect` → `ChatGateway` (Xác thực qua Guard) → `Service`
`Client Emit Event` → `ChatGateway` → `Service` → (Optional: `Redis Pub/Sub`) → `Broadcast to relevant Clients`

### 3. Background Processing Flow (Message Queue)
`API Request (e.g., Place Order)` → `Service` → `MessageQueueModule.addJob('email-queue', {data})` → `Immediate HTTP Response to Client`
`Worker Process (EmailProcessor)` ← `MessageQueue ('email-queue')` → `EmailServiceModule.sendEmail()` → `ResendService`

### 4. Webhook Handling Flow
`External Service (Stripe, Clerk, Resend, Shipper) Event` → `WebhookHandlerModule (POST /webhooks/*)` → `Signature Verification` → (Optional: `MessageQueueModule.addJob('webhook-process-queue', {payload})`) → `Relevant Service (e.g., OrderService, AuthService)` → `Business Logic Update`

## Security Patterns

### 1. Clerk Authentication & Authorization Strategy
*   **Authentication**: Clerk quản lý toàn bộ quy trình đăng ký, đăng nhập, MFA, social logins. Backend NestJS sử dụng `ClerkAuthGuard` để xác thực JWT do Clerk cấp.
*   **Authorization (RBAC)**: `RolesGuard` kiểm tra vai trò được lưu trong `publicMetadata` của người dùng trên Clerk để cho phép hoặc từ chối truy cập tài nguyên.

### 2. Input Validation
Sử dụng `ValidationPipe` toàn cục với DTOs để đảm bảo dữ liệu đầu vào hợp lệ.

### 3. Prepared Statements & ORM Security
TypeORM giúp giảm thiểu nguy cơ SQL Injection. Sử dụng prepared statements cho các truy vấn phức tạp hoặc trực tiếp (nếu có).

### 4. Webhook Security
Xác minh chữ ký (signature verification) cho tất cả các webhook nhận được từ bên thứ ba.

## Error Handling Patterns

### 1. Global Exception Filter (`AllExceptionsFilter`)
Bắt tất cả các `HttpException` và các lỗi không xác định, chuẩn hóa response lỗi, ghi log chi tiết.

### 2. Custom Business Exceptions
Định nghĩa các exception cụ thể cho từng trường hợp nghiệp vụ (ví dụ: `ProductNotFoundException`, `InsufficientStockException`) kế thừa từ `HttpException`.

## Performance Patterns

### 1. Caching Strategy (Redis)
*   Cache các dữ liệu thường xuyên truy cập (thông tin sản phẩm, danh mục, bộ sưu tập).
*   Sử dụng `CacheInterceptor` của NestJS hoặc custom logic trong services.

### 2. Database Optimization
*   **Indexing**: Tạo index cho các cột thường xuyên được sử dụng trong điều kiện `WHERE`, `JOIN`, `ORDER BY` (tham khảo "Báo cáo Phân tích Cột Dữ liệu Tiềm năng cho Indexing.pdf").
*   **Prepared Statements**: Sử dụng cho các truy vấn lặp đi lặp lại để giảm thời gian parse và plan (tham khảo "Báo cáo Đề xuất Prepared Statements cho Hệ thống TheShoe.pdf").
*   **Connection Pooling**: Cấu hình TypeORM để sử dụng connection pooling hiệu quả.

### 3. Asynchronous Processing (Message Queues)
Sử dụng hàng đợi (RabbitMQ/Kafka) cho các tác vụ tốn thời gian hoặc không cần xử lý ngay lập tức (gửi email, xử lý đơn hàng phức tạp, cập nhật index tìm kiếm).

## Monitoring & Observability Patterns

### 1. Health Checks (`HealthController`)
Cung cấp endpoint `/health` để kiểm tra tình trạng của ứng dụng và các dịch vụ phụ thuộc (database, cache, external services).

### 2. Structured Logging (`LoggingInterceptor`, `Pino`/`Winston`)
Ghi log có cấu trúc (JSON format) cho tất cả request, response, lỗi và các sự kiện quan trọng. Tích hợp context (request ID, user ID).

### 3. Metrics Collection (Prometheus/Grafana - Cân nhắc)
Thu thập các metrics về hiệu suất (API latency, error rates, resource usage) để theo dõi và cảnh báo.

## Deployment Patterns

### 1. Containerization (Docker, Docker Compose)
Đóng gói ứng dụng và các dependencies vào Docker containers để đảm bảo tính nhất quán giữa các môi trường.

### 2. Environment Configuration (`ConfigModule` của NestJS)
Quản lý cấu hình theo môi trường (development, staging, production) sử dụng file `.env`.

### 3. Database Migrations (TypeORM Migrations)
Quản lý thay đổi schema cơ sở dữ liệu một cách có phiên bản và tự động.

## Integration Patterns

### 1. External API Integration (HTTP Module của NestJS)
Sử dụng `HttpModule` (dựa trên Axios) để tương tác với các API của bên thứ ba (Clerk, Stripe, Resend, Shipping Partners).

### 2. Event-Driven Communication (NestJS EventEmitter / Message Queues)
Sử dụng `EventEmitterModule` cho các event nội bộ trong ứng dụng, hoặc message queues cho giao tiếp bất đồng bộ giữa các module/services.

### 3. File Upload Pattern (Multer)
Tích hợp Multer để xử lý việc tải lên tệp tin (hình ảnh sản phẩm), sau đó lưu trữ trên dịch vụ cloud (S3, Cloudinary).

Các patterns này tạo ra một hệ thống có tính:
-   **Maintainability**: Phân tách rõ ràng các mối quan tâm, dễ hiểu và sửa đổi.
-   **Scalability**: Kiến trúc module và việc sử dụng message queues, caching hỗ trợ mở rộng.
-   **Reliability**: Xử lý lỗi tập trung, health checks, logging đảm bảo độ tin cậy.
-   **Security**: Nhiều lớp bảo vệ từ xác thực, phân quyền đến validation.
-   **Performance**: Tối ưu hóa CSDL, caching, xử lý bất đồng bộ.