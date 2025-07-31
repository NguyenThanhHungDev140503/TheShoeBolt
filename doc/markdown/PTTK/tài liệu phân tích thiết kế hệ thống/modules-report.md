# Báo Cáo Các Module Cần Thiết Cho Dự Án BE Website Bán Giày Trực Tuyến

## Table of Contents

1. Các Bussiness Module Cần Thiết
    1.1. Module Người Dùng (User Module)
    1.2. Module Sản Phẩm (Product Module)
    1.3. Module Giỏ Hàng (Cart Module)
    1.4. Module Đơn Hàng (Order Module)
    1.5. Module Thanh Toán (Checkout Module)
    1.6. Module Khuyến Mãi (Promotion Module)
    1.7. Module Thông Báo (Notification Module)
    1.8. Module Wishlist (Wishlist Module)
    1.9. Module Thống Kê (Analytics Module)
    1.10. Module Quản Lý Collection (Collection Module)
    1.11. Module Xác Thực (Auth Module với Clerk)
    1.12. Module Tích Hợp Shipper (Shipper Integration Module)
2. Các Infrastructure Modules Cần Thiết
    2.1. Module Phân Quyền Chi Tiết (RBAC Module) [MỚI]
    2.2. Module Xử Lý Lỗi Tập Trung (Global Error Handling Module) [MỚI]
    2.3. Module Cơ Sở Dữ Liệu (Database Module)
    2.4. Module Gửi Email (Email Service Module)
    2.5. Module Ghi Log (Logging Module)
    2.6. Module Bộ Đệm (Cache Module)
    2.7. Module Lưu Trữ Tệp (File Storage Module)
    2.8. Module Tìm Kiếm (Search Module)
    2.9. Module Hàng Đợi Tin Nhắn (Message Queue Module)
    2.10. Module Cổng API (API Gateway Module)
    2.11. Module Xử Lý Webhook (Webhook Handler Module)
    2.12. Module Thanh Toán Stripe (Stripe Payment Gateway Module)
3. Liên Kết Giữa Các Module
4. Tổng Kết

Dựa trên tài liệu SRS (Software Requirement Specification) của website bán giày trực tuyến, báo cáo này liệt kê các module cần thiết để phát triển backend (BE) sử dụng framework NestJS. Các module được thiết kế để đáp ứng các yêu cầu chức năng (Functional Requirements - FR) và hỗ trợ hệ thống vận hành hiệu quả.

## 1. Các Bussiness Module Cần Thiết

### 1.1. Module Người Dùng (User Module)

**Chức năng chính**

* Đăng ký người dùng (FR-001)
* Đăng nhập (FR-002)
* Quản lý tài khoản người dùng (FR-026, FR-027)
* Phân quyền người dùng (FR-027)

**API**

* `GET /users/:id` - Lấy thông tin người dùng
* `PUT /users/:id` - Cập nhật thông tin người dùng
* `POST /users/roles` - Phân quyền người dùng
* `GET /users` - Lấy danh sách người dùng (cho admin)
* `DELETE /users/:id` - Xóa người dùng
* `POST /users/password/reset` - Yêu cầu đặt lại mật khẩu
* `PUT /users/password` - Cập nhật mật khẩu

### 1.2. Module Sản Phẩm (Product Module)

**Chức năng chính**

* Quản lý sản phẩm (FR-023)
* Quản lý danh mục sản phẩm (FR-024)
* Tìm kiếm sản phẩm (FR-005, FR-006)
* Lọc sản phẩm (FR-007)
* Đánh giá sản phẩm (FR-011)

**API**

* `POST /products` - Thêm sản phẩm
* `PUT /products/:id` - Sửa sản phẩm
* `DELETE /products/:id` - Xóa sản phẩm
* `GET /products` - Lấy danh sách sản phẩm
* `GET /products/:id` - Lấy chi tiết sản phẩm
* `GET /products/search` - Tìm kiếm sản phẩm
* `GET /products/filter` - Lọc sản phẩm
* `POST /products/:id/reviews` - Đánh giá sản phẩm
* `GET /products/:id/reviews` - Lấy đánh giá của sản phẩm
* `GET /products/categories` - Lấy danh sách danh mục sản phẩm
* `POST /products/categories` - Thêm danh mục sản phẩm
* `PUT /products/categories/:id` - Cập nhật danh mục sản phẩm
* `DELETE /products/categories/:id` - Xóa danh mục sản phẩm

### 1.3. Module Giỏ Hàng (Cart Module)

**Chức năng chính**

* Thêm/xóa sản phẩm trong giỏ hàng (FR-008)

**API**

* `POST /cart` - Thêm sản phẩm vào giỏ hàng
* `DELETE /cart/:itemId` - Xóa sản phẩm khỏi giỏ hàng
* `PUT /cart/:itemId` - Cập nhật số lượng sản phẩm trong giỏ hàng
* `GET /cart` - Lấy thông tin giỏ hàng
* `DELETE /cart` - Xóa toàn bộ giỏ hàng

### 1.4. Module Đơn Hàng (Order Module)

**Chức năng chính**

* Đặt hàng và thanh toán (FR-014)
* Theo dõi đơn hàng (FR-015, FR-016)
* Quản lý đơn hàng (FR-025)
* Xác nhận giao hàng (FR-022)

**API**

* `POST /orders` - Tạo đơn hàng
* `GET /orders/:id` - Lấy thông tin đơn hàng
* `GET /orders` - Lấy danh sách đơn hàng của người dùng
* `PUT /orders/:id/status` - Cập nhật trạng thái đơn hàng
* `PUT /orders/:id/confirm-delivery` - Xác nhận giao hàng
* `PUT /orders/:id` - Cập nhật thông tin đơn hàng
* `DELETE /orders/:id` - Hủy đơn hàng
* `GET /orders/history` - Xem lịch sử đơn hàng

### 1.5. Module Thanh Toán (Checkout Module)

**Chức năng chính**

* Thanh toán trực tuyến (FR-014)
* Tích hợp với Stripe để xử lý thanh toán an toàn
* Lưu trữ và quản lý thông tin giao dịch

**API**

* `POST /checkout` - Tạo thanh toán
* `POST /checkout/confirm` - Xác nhận thanh toán
* `POST /checkout/cancel` - Hủy thanh toán
* `GET /checkout/status` - Lấy trạng thái thanh toán
* `POST /checkout/callback` - Nhận callback từ dịch vụ thanh toán
* `GET /checkout/history` - Lấy lịch sử thanh toán
* `GET /checkout/invoice/:id` - Lấy hóa đơn thanh toán
* `GET /checkout/methods` - Lấy danh sách phương thức thanh toán
* `POST /checkout/verify` - Xác minh thông tin thanh toán trước khi hoàn tất
* `GET /checkout/:id` - Lấy thông tin chi tiết một giao dịch thanh toán

### 1.6. Module Khuyến Mãi (Promotion Module)

**Chức năng chính**

* Áp dụng khuyến mãi (FR-012, FR-013)
* Quản lý khuyến mãi (FR-031, FR-032)

**API**

* `POST /promotions/apply` - Áp dụng mã giảm giá
* `POST /promotions` - Tạo khuyến mãi
* `PUT /promotions/:id` - Sửa khuyến mãi
* `DELETE /promotions/:id` - Xóa khuyến mãi
* `GET /promotions` - Lấy danh sách khuyến mãi
* `GET /promotions/:id` - Lấy chi tiết khuyến mãi
* `GET /promotions/active` - Lấy danh sách khuyến mãi đang hoạt động

### 1.7. Module Thông Báo (Notification Module)

**Chức năng chính**

* Nhận thông báo (FR-017)
* Gửi email thông báo (FR-009)

**API**

* `POST /notifications` - Gửi thông báo
* `GET /notifications` - Lấy danh sách thông báo
* `GET /notifications/:id` - Xem chi tiết thông báo
* `PUT /notifications/:id/read` - Đánh dấu thông báo đã đọc
* `PUT /notifications/read-all` - Đánh dấu tất cả thông báo đã đọc
* `DELETE /notifications/:id` - Xóa thông báo
* `GET /notifications/settings` - Lấy cài đặt thông báo
* `PUT /notifications/settings` - Cập nhật cài đặt thông báo

### 1.8. Module Wishlist (Wishlist Module)

**Chức năng chính**

* Đăng ký wishlist (FR-009)
* Quản lý danh sách yêu thích (FR-010)

**API**

* `POST /wishlist` - Thêm vào wishlist
* `DELETE /wishlist/:itemId` - Xóa khỏi wishlist
* `GET /wishlist` - Lấy danh sách wishlist
* `POST /wishlist/move-to-cart/:itemId` - Di chuyển sản phẩm từ wishlist vào giỏ hàng

### 1.9. Module Thống Kê (Analytics Module)

**Chức năng chính**

* Thống kê theo loại sản phẩm (FR-028)
* Thống kê tổng thể (FR-029)
* Thống kê sản phẩm bán chạy (FR-030)
* Dashboard theo dõi khuyến mãi (FR-033)

**API**

* `GET /analytics` - Lấy dữ liệu thống kê
* `GET /analytics/products` - Thống kê theo sản phẩm
* `GET /analytics/categories` - Thống kê theo danh mục
* `GET /analytics/revenue` - Thống kê doanh thu
* `GET /analytics/customers` - Thống kê khách hàng
* `GET /analytics/promotions` - Thống kê hiệu quả khuyến mãi
* `GET /analytics/dashboard` - Dữ liệu tổng quan cho dashboard

### 1.10. Module Quản Lý Collection (Collection Module)

**Chức năng chính**

* Tạo, sửa, xóa collection (ví dụ: "Giày thể thao mùa hè", "Bộ sưu tập Limited Edition").
* Liên kết sản phẩm với collection (FR-006, FR-007).

**API**

* `POST /collections` - Tạo collection
* `PUT /collections/:id` - Cập nhật collection
* `DELETE /collections/:id` - Xóa collection
* `GET /collections` - Lấy danh sách collection
* `GET /collections/:id` - Lấy chi tiết collection
* `POST /collections/:id/products` - Thêm sản phẩm vào collection
* `GET /collections/:id/products` - Lấy danh sách sản phẩm trong collection
* `DELETE /collections/:id/products/:productId` - Xóa sản phẩm khỏi collection

### 1.11. Module Xác Thực (Auth Module với Clerk)

**Chức năng chính**

* Xác thực người dùng thông qua Clerk (FR-001, FR-002)
* Hỗ trợ nhiều phương thức xác thực: email/password, social login (Google, Facebook), magic links
* Quản lý phiên đăng nhập an toàn với JWT
* Bảo mật hai lớp (2FA)
* Xác thực không cần mật khẩu (passwordless authentication)
* Đồng bộ dữ liệu người dùng từ Clerk với cơ sở dữ liệu ứng dụng
* Kiểm soát trạng thái đăng nhập và phiên làm việc
* Xác minh email và số điện thoại người dùng

**API**

* `GET /auth/callback` - Callback URL cho OAuth providers
* `GET /auth/me` - Lấy thông tin người dùng hiện tại
* `POST /auth/sign-out` - Đăng xuất
* `GET /auth/session` - Kiểm tra phiên hiện tại
* `POST /auth/refresh-token` - Làm mới token
* `POST /auth/webhook` - Xử lý webhook từ Clerk
* `GET /auth/jwt` - Lấy JWT token cho client

#### 1.11.1. Chi tiết tích hợp Clerk

Clerk là một giải pháp xác thực (authentication) và quản lý người dùng toàn diện được triển khai theo mô hình SaaS (Software as a Service). Hệ thống sử dụng Clerk để:

1. Đăng nhập và đăng ký:
    * Thay thế hoàn toàn cho /auth/login và /auth/register truyền thống
    * Đăng nhập bằng email/mật khẩu
    * Đăng nhập bằng mạng xã hội (Google, GitHub, Facebook…)
    * Magic links (đăng nhập qua email không cần mật khẩu)
    * Đăng nhập bằng số điện thoại (SMS OTP)
2. Quản lý hồ sơ người dùng:
    * Lưu trữ thông tin cá nhân an toàn
    * Xác minh email và số điện thoại
    * Avatar và thông tin hiển thị
3. Bảo mật nâng cao:
    * Xác thực hai yếu tố (2FA)
    * Phát hiện thiết bị đáng ngờ
    * Phân tích rủi ro dựa trên hành vi đăng nhập
    * Thay thế hoàn toàn cho các chức năng quên/đặt lại mật khẩu
4. Quản lý phiên đăng nhập:
    * JWT được ký bởi Clerk
    * Theo dõi phiên đang hoạt động
    * Hủy phiên từ xa
    * Làm mới token tự động
5. Tích hợp hệ thống:
    * Webhook cho các sự kiện người dùng
    * API để đồng bộ hóa dữ liệu người dùng
    * Tùy chỉnh luồng đăng ký/đăng nhập

Với việc tích hợp Clerk, hệ thống không cần phải lo lắng về các vấn đề phức tạp như lưu trữ mật khẩu an toàn, quản lý token, phục hồi mật khẩu, phòng chống tấn công brute force, v.v.

### 1.12. Module Tích Hợp Shipper (Shipper Integration Module)

**Chức năng chính**

* Tích hợp API với đơn vị vận chuyển (FR-022)
* Xử lý webhook cập nhật trạng thái giao hàng

**API**

* `GET /shipper/tracking` - Lấy thông tin theo dõi đơn hàng
* `GET /shipper/orders` - Lấy danh sách đơn hàng cần giao (cho shipper)
* `PUT /shipper/orders/:id/status` - Cập nhật trạng thái đơn hàng (cho shipper)

## 2. Các Infrastructure Modules Cần Thiết

### 2.1. Module Phân Quyền Chi Tiết (RBAC Module) [MỚI]

**Chức năng chính**

* Quản lý phân quyền theo Role-Based Access Control (FR-027)
* Định nghĩa role (admin, shipper, customer) và permissions
* Kiểm tra quyền truy cập API

**API**

* `POST /rbac/roles` - Tạo role mới
* `POST /rbac/assign-role` - Gán role cho người dùng
* `GET /rbac/permissions` - Lấy danh sách quyền theo role
* `GET /rbac/roles` - Lấy danh sách role
* `GET /rbac/roles/:id` - Lấy chi tiết role
* `PUT /rbac/roles/:id` - Cập nhật role
* `DELETE /rbac/roles/:id` - Xóa role
* `POST /rbac/permissions` - Tạo quyền mới
* `GET /rbac/permissions/:id` - Lấy chi tiết quyền
* `PUT /rbac/permissions/:id` - Cập nhật quyền
* `DELETE /rbac/permissions/:id` - Xóa quyền
* `POST /rbac/assign-permission` - Gán quyền cho role

### 2.2. Module Xử Lý Lỗi Tập Trung (Global Error Handling Module) [MỚI]

**Chức năng chính**

* Bắt và xử lý lỗi toàn hệ thống
* Trả về response thân thiện
* Tích hợp với Logging Module

**API**

* Không có API công khai, hoạt động tự động khi có lỗi.

### 2.3. Module Cơ Sở Dữ Liệu (Database Module)

**Chức năng chính**

* Quản lý kết nối và tương tác với cơ sở dữ liệu (PostgresSQL)
* Hỗ trợ ORM (Object-Relational Mapping) để làm việc với dữ liệu

**API**

* Không có API công khai, được sử dụng nội bộ bởi các module khác

### 2.4. Module Gửi Email (Email Service Module)

**Chức năng chính**

* Gửi email thông báo (FR-009)

**API**

* `POST /email/send` - Gửi email
* `GET /email/templates` - Lấy danh sách mẫu email
* `POST /email/templates` - Tạo mẫu email mới
* `PUT /email/templates/:id` - Cập nhật mẫu email
* `GET /email/logs` - Xem lịch sử gửi email

### 2.5. Module Ghi Log (Logging Module)

**Chức năng chính**

* Ghi log các hoạt động của hệ thống
* Hỗ trợ debug và theo dõi lỗi

**API**

* Không có API công khai, được sử dụng nội bộ

### 2.6. Module Bộ Đệm (Cache Module)

**Chức năng chính**

* Lưu trữ dữ liệu thường xuyên truy cập để cải thiện hiệu suất
* Sử dụng Redis hoặc dịch vụ tương tự

**API**

* Không có API công khai, được sử dụng nội bộ bởi các module khác

### 2.7. Module Lưu Trữ Tệp (File Storage Module)

**Chức năng chính**

* Quản lý hình ảnh sản phẩm và các tệp tin khác
* Sử dụng dịch vụ lưu trữ đám mây như AWS S3 hoặc Google Cloud Storage

**API**

* `POST /files/upload` - Tải lên tệp tin
* `GET /files/:id` - Lấy tệp tin
* `DELETE /files/:id` - Xóa tệp tin
* `PUT /files/:id` - Cập nhật thông tin tệp tin
* `GET /files` - Lấy danh sách tệp tin

### 2.8. Module Tìm Kiếm (Search Module)

**Chức năng chính**

* Hỗ trợ tính năng tìm kiếm nâng cao (FR-006)
* Sử dụng Elasticsearch hoặc dịch vụ tương tự

**API**

* `GET /search` - Tìm kiếm sản phẩm
* `GET /search/suggestions` - Lấy gợi ý tìm kiếm
* `GET /search/advanced` - Tìm kiếm nâng cao với nhiều tiêu chí
* `POST /search/index` - Đánh chỉ mục cho dữ liệu mới

### 2.9. Module Hàng Đợi Tin Nhắn (Message Queue Module)

**Chức năng chính**

* Xử lý các tác vụ bất đồng bộ như gửi email, xử lý đơn hàng
* Sử dụng RabbitMQ hoặc Kafka

**API**

* Không có API công khai, được sử dụng nội bộ

### 2.10. Module Cổng API (API Gateway Module)

**Chức năng chính**

* Quản lý và bảo vệ các API
* Sử dụng NestJS Gateway hoặc dịch vụ bên ngoài

**API**

* Không có API công khai, được sử dụng để định tuyến và bảo mật các API

### 2.11. Module Xử Lý Webhook (Webhook Handler Module)

**Chức năng chính**

* Nhận và xử lý webhook từ các dịch vụ bên thứ ba (Stripe, Resend).
* Xác thực chữ ký webhook để đảm bảo an toàn.
* Chuyển tiếp sự kiện từ webhook đến các module liên quan

**API**

* `POST /webhooks/stripe` - Xử lý webhook từ Stripe (thanh toán)
* `POST /webhooks/resend` - Xử lý webhook từ Resend (trạng thái email)
* `GET /webhooks/logs` - Xem log webhook
* `POST /webhooks/register` - Đăng ký endpoint mới cho webhook
* `PUT /webhooks/settings` - Cấu hình xử lý webhook

Lưu ý: Webhook từ Clerk được xử lý trực tiếp bởi Auth Module.

## 3. Liên Kết Giữa Các Module

Các module trong hệ thống được thiết kế để hoạt động độc lập nhưng vẫn có sự liên kết chặt chẽ để đảm bảo luồng dữ liệu và chức năng liền mạch. Dưới đây là một số ví dụ về mối liên kết giữa các module:

*   **User Module** và **Auth Module**: User Module quản lý thông tin người dùng, trong khi Auth Module (sử dụng Clerk) xử lý việc xác thực và ủy quyền. Khi người dùng đăng nhập qua Auth Module, thông tin xác thực sẽ được chuyển đến User Module để truy xuất hoặc cập nhật hồ sơ người dùng.

*   **Product Module** và **Cart Module**: Product Module cung cấp thông tin về sản phẩm. Khi người dùng thêm sản phẩm vào giỏ hàng, Cart Module sẽ tương tác với Product Module để lấy chi tiết sản phẩm và đảm bảo tính hợp lệ của sản phẩm.

*   **Cart Module** và **Order Module**: Khi người dùng hoàn tất giỏ hàng, Cart Module sẽ chuyển thông tin giỏ hàng sang Order Module để tạo đơn hàng mới. Order Module sau đó sẽ xử lý các bước tiếp theo như tính toán tổng tiền, áp dụng khuyến mãi, và cập nhật trạng thái đơn hàng.

*   **Order Module** và **Checkout Module**: Order Module sẽ gửi thông tin đơn hàng đến Checkout Module để xử lý thanh toán. Checkout Module sẽ tích hợp với các cổng thanh toán (ví dụ: Stripe) để thực hiện giao dịch và sau đó thông báo lại trạng thái thanh toán cho Order Module.

*   **Promotion Module** và **Order Module/Checkout Module**: Promotion Module quản lý các mã khuyến mãi và quy tắc giảm giá. Khi người dùng áp dụng mã giảm giá, Order Module hoặc Checkout Module sẽ gọi Promotion Module để xác thực mã và tính toán lại tổng giá trị đơn hàng.

*   **Notification Module** và các module khác: Notification Module được sử dụng bởi nhiều module khác (ví dụ: Order Module, User Module) để gửi thông báo cho người dùng về trạng thái đơn hàng, cập nhật tài khoản, hoặc các sự kiện quan trọng khác.

*   **Analytics Module** và các module khác: Analytics Module thu thập dữ liệu từ hầu hết các module khác (User, Product, Order, Promotion, v.v.) để cung cấp các báo cáo và thống kê về hoạt động của hệ thống, giúp quản trị viên đưa ra quyết định kinh doanh.

*   **Shipper Integration Module** và **Order Module**: Shipper Integration Module tương tác với các dịch vụ vận chuyển bên ngoài để theo dõi đơn hàng. Nó sẽ cập nhật trạng thái vận chuyển cho Order Module, giúp người dùng và quản trị viên theo dõi quá trình giao hàng.

*   **RBAC Module** và tất cả các module có API: RBAC Module đóng vai trò quan trọng trong việc kiểm soát quyền truy cập. Mỗi khi có yêu cầu API đến bất kỳ module nào, RBAC Module sẽ được gọi để xác minh xem người dùng có quyền thực hiện hành động đó hay không.

*   **Global Error Handling Module** và tất cả các module: Module này sẽ bắt và xử lý tất cả các lỗi phát sinh trong hệ thống, đảm bảo rằng người dùng nhận được thông báo lỗi thân thiện và các lỗi được ghi log đầy đủ để phục vụ việc debug.

*   **Database Module** và tất cả các module cần lưu trữ dữ liệu: Database Module cung cấp giao diện để các module khác tương tác với cơ sở dữ liệu, đảm bảo tính nhất quán và toàn vẹn của dữ liệu.

*   **Email Service Module** và các module cần gửi email: Module này được sử dụng bởi các module như User Module (để gửi email xác minh tài khoản, đặt lại mật khẩu), Order Module (để gửi xác nhận đơn hàng), và Notification Module (để gửi thông báo email).

*   **Logging Module** và tất cả các module: Logging Module được tích hợp vào toàn bộ hệ thống để ghi lại các sự kiện quan trọng, lỗi, và hoạt động của người dùng, hỗ trợ việc giám sát và khắc phục sự cố.

*   **Cache Module** và các module cần cải thiện hiệu suất: Cache Module được sử dụng bởi các module thường xuyên truy xuất dữ liệu (ví dụ: Product Module, Analytics Module) để lưu trữ tạm thời các dữ liệu này, giảm tải cho cơ sở dữ liệu và tăng tốc độ phản hồi.

*   **File Storage Module** và các module cần lưu trữ tệp: Module này được sử dụng bởi Product Module (để lưu trữ hình ảnh sản phẩm), User Module (để lưu trữ ảnh đại diện người dùng), và các module khác cần quản lý tệp tin.

*   **Search Module** và Product Module/Collection Module: Search Module cung cấp khả năng tìm kiếm nâng cao cho Product Module và Collection Module, giúp người dùng dễ dàng tìm thấy sản phẩm và bộ sưu tập mong muốn.

*   **Message Queue Module** và các module cần xử lý bất đồng bộ: Module này được sử dụng để xử lý các tác vụ nặng hoặc tốn thời gian một cách bất đồng bộ (ví dụ: gửi email hàng loạt, xử lý đơn hàng phức tạp), giúp hệ thống phản hồi nhanh hơn.

*   **API Gateway Module** và tất cả các API: API Gateway Module đóng vai trò là điểm truy cập duy nhất cho tất cả các API, cung cấp các chức năng như định tuyến, bảo mật, giới hạn tốc độ, và giám sát API.

*   **Webhook Handler Module** và các module tích hợp bên thứ ba: Module này nhận và xử lý các webhook từ các dịch vụ bên ngoài (ví dụ: Stripe, Resend), sau đó chuyển tiếp thông tin đến các module liên quan để xử lý tiếp.

## 4. Tổng Kết

Báo cáo này đã trình bày chi tiết các module cần thiết cho dự án backend website bán giày trực tuyến, bao gồm cả các module nghiệp vụ và module hạ tầng. Mỗi module được thiết kế với các chức năng và API rõ ràng, đồng thời có sự liên kết chặt chẽ với nhau để tạo thành một hệ thống hoạt động hiệu quả và mạnh mẽ. Việc áp dụng các module này sẽ giúp đảm bảo tính mở rộng, bảo trì và hiệu suất của hệ thống trong tương lai.

