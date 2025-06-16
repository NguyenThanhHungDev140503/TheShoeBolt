# TheShoeBolt Technical Context

## Technology Stack

### Backend Core
-   **Framework**: NestJS 10.x (TypeScript)
-   **Language**: TypeScript 5.x
-   **Runtime**: Node.js 18+ (hoặc LTS mới nhất)
-   **Package Manager**: npm (hoặc yarn tùy theo sở thích team)
-   **Authentication & User Management**: Clerk (SaaS) - `@clerk/clerk-sdk-node`, `@clerk/clerk-js` (cho frontend nếu cần).

### Databases & Storage

#### Primary Relational Database
-   **PostgreSQL 14+**: Lưu trữ dữ liệu có cấu trúc chính.
    -   Thông tin người dùng (đồng bộ một phần từ Clerk, ví dụ: `clerk_user_id`, `email`, `custom_metadata` liên quan đến ứng dụng).
    -   Danh mục sản phẩm chi tiết (tên, mô tả, giá, thuộc tính, biến thể size/màu).
    -   Quản lý đơn hàng và lịch sử giao dịch.
    -   Theo dõi tồn kho chi tiết theo từng biến thể sản phẩm.
    -   Địa chỉ người dùng, thông tin vận chuyển.
    -   Dữ liệu khuyến mãi, mã giảm giá.
    -   Đánh giá sản phẩm, bộ sưu tập.
-   **ORM**: TypeORM

#### Document Database (Cân nhắc cho các trường hợp cụ thể)
-   **MongoDB (Cân nhắc)**: Cho dữ liệu phi cấu trúc hoặc thay đổi thường xuyên.
    -   Tin nhắn chat và lịch sử hội thoại.
    -   Logs hoạt động chi tiết của người dùng và hệ thống.
    -   Nội dung đánh giá, bình luận (nếu cần schema linh hoạt hơn).
-   **ODM**: Mongoose (nếu sử dụng MongoDB).

#### Caching Layer
-   **Redis**: Caching hiệu suất cao.
    -   Cache các API response thường xuyên truy cập (danh sách sản phẩm, danh mục).
    -   Lưu trữ tạm thời giỏ hàng của khách vãng lai.
    -   Quản lý rate limiting cho API.
    -   Có thể hỗ trợ WebSocket connection management hoặc Pub/Sub cho real-time.

#### Search Engine
-   **Elasticsearch**: Cho các tính năng tìm kiếm nâng cao và analytics.
    -   Index dữ liệu sản phẩm để tìm kiếm full-text, tìm kiếm theo nhiều thuộc tính, gợi ý, tự động hoàn thành.
    -   Phân tích hành vi người dùng liên quan đến tìm kiếm.
    -   Hỗ trợ thống kê và báo cáo nghiệp vụ.

#### File Storage
-   **Cloud Storage (AWS S3, Google Cloud Storage, hoặc Cloudinary)**: Lưu trữ hình ảnh sản phẩm, avatar người dùng, và các tệp tin khác.

### Communication & Integration

#### Real-time Communication
-   **WebSocket (Socket.IO hoặc thư viện WebSocket gốc của NestJS)**:
    -   Chat hỗ trợ khách hàng.
    -   Thông báo real-time (trạng thái đơn hàng, khuyến mãi mới).

#### Message Queuing (Xử lý tác vụ nền)
-   **RabbitMQ hoặc Kafka (Cân nhắc tùy độ phức tạp)**:
    -   Gửi email (thông báo đơn hàng, marketing) một cách bất đồng bộ.
    -   Xử lý các quy trình thanh toán phức tạp.
    -   Cập nhật tồn kho sau khi đặt hàng/hủy hàng.
    -   Xử lý dữ liệu analytics.
    -   Xử lý webhook từ các dịch vụ bên thứ ba.

#### External Service Integrations
-   **Payment Gateway**: Stripe (chính), có thể cân nhắc VNPay cho thị trường Việt Nam.
-   **Email Service**: Resend.
-   **Shipping Service APIs**: Tích hợp API của các đối tác vận chuyển để lấy giá, tạo vận đơn, theo dõi.
-   **Authentication Service**: Clerk.

### Development & DevOps

#### Containerization
-   **Docker & Docker Compose**: Chuẩn hóa môi trường phát triển, staging và production. Multi-stage Docker builds để tối ưu image size.

#### Database Management
-   **TypeORM**: ORM chính cho PostgreSQL, quản lý migrations, entities, repositories.
-   **Mongoose**: ODM nếu sử dụng MongoDB.

#### Configuration Management
-   **NestJS ConfigModule (`@nestjs/config`)**: Quản lý biến môi trường (`.env` files) cho các môi trường khác nhau (development, staging, production).

#### API Documentation
-   **Swagger (OpenAPI)**: Tự động tạo tài liệu API từ code (sử dụng `@nestjs/swagger`).

#### Testing
-   **Jest**: Framework chính cho unit tests và integration tests.
-   **Supertest**: Cho E2E testing các API endpoints.
-   **Code Coverage**: Đặt mục tiêu >80%.

## Architecture Decisions

### Database Strategy: Multi-Database Approach
Sử dụng cơ sở dữ liệu phù hợp nhất cho từng loại dữ liệu và yêu cầu truy cập để tối ưu hiệu suất và khả năng mở rộng.
-   **PostgreSQL**: Cho dữ liệu quan hệ, yêu cầu ACID, join phức tạp.
-   **MongoDB (Cân nhắc)**: Cho dữ liệu linh hoạt, ghi nhiều, đọc nhanh các document đơn lẻ.
-   **Redis**: Cho caching tốc độ cao, dữ liệu tạm thời.
-   **Elasticsearch**: Cho tìm kiếm full-text, analytics.

### Authentication & Authorization Strategy: Clerk + RBAC
-   **Clerk**: Là Identity Provider (IdP) chính, xử lý toàn bộ vòng đời người dùng (đăng ký, đăng nhập, MFA, social login, quản lý phiên). Backend NestJS sẽ xác thực JWT do Clerk cung cấp thông qua `ClerkAuthGuard`.
-   **Local User Data Sync**: Dữ liệu người dùng cơ bản (ID Clerk, email, và metadata cần thiết cho ứng dụng) có thể được đồng bộ vào bảng `User` trong PostgreSQL. Việc đồng bộ này được thực hiện thông qua Clerk Webhooks (ví dụ: `user.created`, `user.updated`). Bảng `User` cục bộ sẽ có cột `clerkUserId` để liên kết.
-   **RBAC (Role-Based Access Control)**: Vai trò người dùng (ví dụ: `customer`, `admin`, `shipper`) được lưu trữ trong `publicMetadata` của đối tượng User trên Clerk. `RolesGuard` trong NestJS sẽ đọc thông tin vai trò này từ `request.auth.claims.public_metadata.roles` (sau khi `ClerkAuthGuard` xác thực thành công) để phân quyền truy cập API. Các quyền chi tiết (permissions) có thể được quản lý trong CSDL cục bộ và liên kết với vai trò từ Clerk nếu cần độ chi tiết cao hơn.

### Scalability Approach: Modular Monolith, sẵn sàng cho Microservices
-   **Hiện tại**: Phát triển dưới dạng Modular Monolith với NestJS. Các module được thiết kế độc lập, giao tiếp qua services hoặc events nội bộ.
-   **Tương lai**: Nếu cần, các module có thể được tách thành các microservices riêng biệt. Giao tiếp giữa các services có thể dùng HTTP API hoặc Message Queues. Mỗi service có thể có database riêng (Database per service pattern).

## Development Environment

### Local Development Setup
-   Node.js 18+
-   npm/yarn
-   Docker & Docker Compose
-   PostgreSQL 14+ (qua Docker)
-   Redis (qua Docker)
-   Elasticsearch (qua Docker - tùy chọn)
-   MongoDB (qua Docker - tùy chọn)

### Environment Configuration (`.env` files)
Quản lý các biến môi trường cho:
-   Thông tin kết nối Databases (PostgreSQL, MongoDB, Redis, Elasticsearch).
-   Khóa API cho Clerk (Secret Key, Publishable Key, Webhook Secret).
-   Khóa API cho các dịch vụ bên ngoài (Resend, Stripe, Shipping partners).
-   Cấu hình ứng dụng (Port, App URL, Node Env).
-   Feature flags.

### Docker Compose Services
Cấu hình `docker-compose.yml` để khởi chạy các services cần thiết cho môi trường dev: `app` (NestJS), `postgres`, `redis`, (tùy chọn `mongodb`, `elasticsearch`).

## Technical Constraints & Decisions

### Performance Requirements
-   API response time trung bình < 200ms (cho 95% percentile).
-   Khả năng chịu tải > 100 người dùng đồng thời (MVP), mục tiêu > 1000 requests/giây.
-   Tối ưu hóa truy vấn CSDL: sử dụng indexing, prepared statements.
-   Caching hiệu quả cho các dữ liệu nóng.

### Security Constraints
-   Tuân thủ OWASP Top 10.
-   Mã hóa dữ liệu nhạy cảm (at rest và in transit).
-   Bảo vệ chống các tấn công phổ biến (XSS, CSRF, SQL Injection - giảm thiểu qua ORM và validation).
-   Xác thực đầu vào (Input Validation) nghiêm ngặt sử dụng DTOs và `class-validator`.
-   Quản lý session an toàn (Clerk xử lý).
-   Rate limiting cho API.

### Monitoring & Observability
-   **Logging**: Sử dụng thư viện logging có cấu trúc (ví dụ: Pino, Winston) tích hợp với NestJS Logger. Ghi log request/response, lỗi, các sự kiện quan trọng.
-   **Health Checks**: Endpoint `/health` để kiểm tra tình trạng ứng dụng và các dependencies.
-   **Error Tracking**: Tích hợp dịch vụ theo dõi lỗi (ví dụ: Sentry - cân nhắc).

### Development Workflow
-   **Version Control**: Git (Github/Gitlab).
-   **Code Quality**: ESLint, Prettier.
-   **Testing**: Unit tests, Integration tests, E2E tests với Jest. Mục tiêu code coverage > 80%.
-   **CI/CD**: Github Actions / Gitlab CI / Jenkins (cân nhắc) để tự động hóa build, test, deploy.
-   **Database Migrations**: TypeORM migrations.

## Integration Architecture

### External Service Integration
-   **Clerk**: Xác thực và quản lý người dùng.
-   **Stripe**: Xử lý thanh toán. Webhook để cập nhật trạng thái giao dịch.
-   **Resend**: Gửi email giao dịch và marketing. Webhook để theo dõi trạng thái email.
-   **Shipping Partners**: API để lấy giá cước, tạo vận đơn, theo dõi. Webhook để cập nhật trạng thái giao hàng.
-   **Cloud Storage**: Lưu trữ file.

### API Design Principles
-   **RESTful API**: Thiết kế API theo chuẩn REST.
-   **Versioning**: API versioning qua URL (ví dụ: `/api/v1/...`).
-   **Documentation**: Swagger (OpenAPI) tự động tạo từ code.
-   **Error Handling**: Chuẩn hóa mã lỗi và thông điệp lỗi.

Công nghệ và kiến trúc này được lựa chọn để đảm bảo hệ thống TheShoeBolt có khả năng mở rộng, bảo trì, hiệu suất cao, an toàn và mang lại trải nghiệm tốt cho cả người dùng cuối và đội ngũ phát triển.