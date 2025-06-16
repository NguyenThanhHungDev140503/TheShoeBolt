# TheShoeBolt Project Brief

## Mục Tiêu Dự Án

TheShoeBolt là một nền tảng thương mại điện tử chuyên về giày dép, được xây dựng với NestJS framework. Dự án nhằm tạo ra một hệ thống bán hàng trực tuyến hoàn chỉnh với các tính năng hiện đại, khả năng mở rộng cao, và tích hợp các dịch vụ bên thứ ba để tối ưu hóa vận hành.

## Tầm Nhìn

Trở thành một platform e-commerce giày dép hàng đầu với:
- Trải nghiệm người dùng mượt mà và cá nhân hóa.
- Hệ thống quản lý đơn hàng, tồn kho và vận chuyển hiệu quả.
- Tích hợp thanh toán đa dạng và an toàn.
- Khả năng tìm kiếm thông minh và chính xác.
- Hỗ trợ khách hàng real-time và quản lý phản hồi chuyên nghiệp.
- Hệ thống báo cáo, thống kê chi tiết hỗ trợ ra quyết định kinh doanh.

## Phạm Vi Dự Án

### Core Features
- **Quản lý sản phẩm**: Catalog giày với thông tin chi tiết, hình ảnh, size, màu sắc, chất liệu, danh mục, bộ sưu tập.
- **Hệ thống người dùng**: Đăng ký, đăng nhập, quản lý hồ sơ, lịch sử mua hàng, địa chỉ.
- **Giỏ hàng & thanh toán**: Shopping cart, quy trình thanh toán an toàn với nhiều phương thức (Stripe).
- **Quản trị viên**: Admin dashboard cho quản lý toàn diện (sản phẩm, đơn hàng, người dùng, khuyến mãi, thống kê, phân quyền).
- **Tìm kiếm**: Tích hợp Elasticsearch cho trải nghiệm tìm kiếm nâng cao và gợi ý.
- **Chat support**: Hỗ trợ khách hàng real-time qua WebSocket.
- **Email service**: Thông báo (đơn hàng, wishlist, đặt lại mật khẩu), chiến dịch marketing (tích hợp Resend).
- **Queue system**: Xử lý các tác vụ nền (gửi email, cập nhật tồn kho).
- **Khuyến mãi & Mã giảm giá**: Tạo và quản lý các chương trình khuyến mãi, mã giảm giá linh hoạt.
- **Wishlist & Yêu thích**: Cho phép người dùng lưu sản phẩm quan tâm.
- **Đánh giá & Phản hồi**: Người dùng đánh giá sản phẩm, gửi phản hồi cho quản trị viên.
- **Quản lý Vận chuyển**: Tích hợp với các đơn vị vận chuyển, theo dõi đơn hàng.

### Technical Scope
- **Backend**: NestJS với TypeScript.
- **Database**: PostgreSQL (chính), có thể cân nhắc MongoDB cho một số dữ liệu phi cấu trúc, Redis cho caching, Elasticsearch cho tìm kiếm.
- **Authentication**: Clerk (quản lý người dùng, phiên, JWT, MFA, social logins) tích hợp với NestJS RBAC (Role-Based Access Control).
- **Real-time**: WebSocket cho chat và notifications.
- **Infrastructure**: Docker containerization.
- **Monitoring**: Health checks, logging chi tiết và tập trung.
- **Payment Gateway**: Tích hợp Stripe.
- **Email Service**: Tích hợp Resend.
- **API Design**: RESTful API theo chuẩn OpenAPI.

## Người Dùng Mục Tiêu

1.  **Khách hàng cuối**: Người mua giày trực tuyến, tìm kiếm sự đa dạng, tiện lợi và trải nghiệm mua sắm tốt.
2.  **Admin**: Quản lý cửa hàng, sản phẩm, đơn hàng, người dùng, khuyến mãi, phân tích dữ liệu kinh doanh.
3.  **Shipper**: Nhân viên giao hàng, cập nhật trạng thái giao hàng.
4.  **Support staff**: Hỗ trợ khách hàng qua chat, xử lý phản hồi.
5.  **Nhà phát triển**: Bảo trì và mở rộng hệ thống.

## Tiêu Chí Thành Công

- Platform ổn định với uptime > 99.5%.
- Thời gian phản hồi của API < 200ms cho 95% các request quan trọng.
- Hỗ trợ đồng thời ít nhất 100 người dùng mà không suy giảm hiệu năng.
- Tỷ lệ chuyển đổi (conversion rate) đạt mục tiêu kinh doanh.
- Mức độ hài lòng của khách hàng cao (đo bằng khảo sát, đánh giá).
- Giảm thời gian xử lý đơn hàng và quản lý hệ thống cho admin.
- Đảm bảo an toàn dữ liệu người dùng và giao dịch theo tiêu chuẩn PCI DSS (nếu áp dụng trực tiếp).

## Ràng Buộc & Giả Định

### Technical Constraints
- Sử dụng NestJS framework và TypeScript là ngôn ngữ chính cho backend.
- Docker cho containerization và deployment.
- Kiến trúc cơ sở dữ liệu quan hệ (PostgreSQL) là chủ đạo, có thể bổ sung NoSQL khi cần.
- Tích hợp bắt buộc với Clerk (xác thực), Stripe (thanh toán), Resend (email).

### Business Constraints
- Tập trung vào thị trường giày dép trực tuyến.
- Mô hình kinh doanh B2C là chính.
- Ưu tiên trải nghiệm người dùng trên các thiết bị (responsive design).

## Timeline & Milestones

Dự án được phát triển theo các phase:
1.  **MVP Phase**: Các chức năng cốt lõi của e-commerce (quản lý sản phẩm, người dùng, giỏ hàng, đặt hàng, thanh toán cơ bản). Tích hợp Clerk, Stripe, Resend ở mức cơ bản.
2.  **Enhancement Phase**: Các tính năng nâng cao (tìm kiếm Elasticsearch, chat, khuyến mãi phức tạp, quản lý wishlist, đánh giá, phân quyền chi tiết RBAC, thống kê cơ bản).
3.  **Scale Phase**: Tối ưu hóa hiệu suất (caching, prepared statements, tối ưu CSDL), hoàn thiện dashboard admin, tích hợp vận chuyển, xử lý lỗi tập trung, logging nâng cao.
4.  **Growth Phase**: Công cụ marketing, gợi ý sản phẩm, mở rộng API cho các đối tác tiềm năng, cân nhắc ứng dụng di động.