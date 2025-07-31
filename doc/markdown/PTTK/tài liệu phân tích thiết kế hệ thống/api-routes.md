# Báo Cáo API Route Của Hệ Thống Website Bán Giày Trực Tuyến

## Mục lục

1. API Route Của Các Featured Module
    1.1. User Module (Quản lý người dùng)
    1.2. Product Module (Quản lý sản phẩm)
    1.3. Cart Module (Giỏ hàng)
    1.4. Order Module (Đơn hàng)
    1.5. Checkout Module (Thanh toán)
    1.6. Promotion Module (Khuyến mãi)
    1.7. Notification Module (Thông báo)
    1.8. Wishlist Module (Danh sách yêu thích)
    1.9. Feedback Module (Phản hồi)
    1.10. Analytics Module (Thống kê)
    1.11. Collection Module (Bộ sưu tập)
    1.12. Auth Module (Xác thực với Clerk)
    1.13. Shipper Integration Module (Tích hợp vận chuyển)
    1.14. Stripe Payment Gateway Module (Cổng thanh toán Stripe)
2. API Route Của Các Infrastructure Module
    2.1. RBAC Module (Phân quyền chi tiết)
    2.2. Email Service Module (Dịch vụ gửi email)
    2.3. File Storage Module (Lưu trữ tệp)
    2.4. Search Module (Tìm kiếm)
    2.5. Webhook Handler Module (Xử lý webhook)
3. Tổng Hợp Số Lượng API
4. Chú thích API Route
5. Phân Tích Phân Loại API
    5.1. Phân Loại Theo Đối Tượng Sử Dụng
    5.2. Phân Loại Theo Phương Thức HTTP
6. Kết luận

Tài liệu này liệt kê toàn bộ các API Route được sử dụng trong hệ thống website bán giày trực tuyến, được phân loại theo các module chức năng. API Route được thiết kế để đáp ứng các yêu cầu chức năng (Functional Requirements - FR) từ tài liệu SRS.

## 1. API Route Của Các Featured Module

### 1.1. User Module (Quản lý người dùng)

**Table 1. API Endpoints cho User:**

| API Route                 | Mô tả chức năng                                     |
| :------------------------ | :-------------------------------------------------- |
| `GET /users/:id`          | Lấy thông tin người dùng (người dùng chỉ có thể xem thông tin của chính họ) |
| `PUT /users/:id`          | Cập nhật thông tin người dùng (người dùng chỉ có thể cập nhật thông tin của chính họ) |
| `POST /users/password/reset` | Yêu cầu đặt lại mật khẩu                            |
| `PUT /users/password`     | Cập nhật mật khẩu                                   |

**Table 2. API Endpoints cho Admin:**

| API Route             | Mô tả chức năng                      |
| :-------------------- | :------------------------------------ |
| `GET /users`          | Lấy danh sách tất cả người dùng      |
| `GET /users/:id`      | Lấy thông tin của bất kỳ người dùng  |
| `PUT /users/:id`      | Cập nhật thông tin của bất kỳ người dùng |
| `DELETE /users/:id`   | Xóa người dùng                        |
| `POST /users/roles`   | Phân quyền người dùng                 |

### 1.2. Product Module (Quản lý sản phẩm)

**Table 3. API Endpoints cho User:**

| API Route                     | Mô tả chức năng                                     |
| :---------------------------- | :-------------------------------------------------- |
| `GET /products`               | Lấy danh sách sản phẩm                              |
| `GET /products/:id`           | Lấy chi tiết sản phẩm                               |
| `GET /products/search`        | Tìm kiếm sản phẩm                                   |
| `GET /products/filter`        | Lọc sản phẩm theo tiêu chí                          |
| `POST /products/:id/reviews`  | Đánh giá sản phẩm (cho người dùng đã mua sản phẩm) |
| `GET /products/:id/reviews`   | Lấy đánh giá của sản phẩm                           |
| `GET /products/categories`    | Lấy danh sách danh mục sản phẩm                     |

**Table 4. API Endpoints cho Admin:**

| API Route                         | Mô tả chức năng                  |
| :-------------------------------- | :-------------------------------- |
| `POST /products`                  | Thêm sản phẩm mới                 |
| `PUT /products/:id`               | Sửa thông tin sản phẩm            |
| `DELETE /products/:id`            | Xóa sản phẩm                      |
| `GET /products/:id/reviews/manage` | Quản lý đánh giá của sản phẩm     |
| `DELETE /products/:id/reviews/:reviewId` | Xóa đánh giá không phù hợp        |
| `POST /products/categories`       | Thêm danh mục sản phẩm            |
| `PUT /products/categories/:id`    | Cập nhật danh mục sản phẩm        |
| `DELETE /products/categories/:id` | Xóa danh mục sản phẩm             |

### 1.3. Cart Module (Giỏ hàng)

**Table 5. API Endpoints cho User:**

| API Route             | Mô tả chức năng                       |
| :-------------------- | :------------------------------------- |
| `POST /cart`          | Thêm sản phẩm vào giỏ hàng           |
| `DELETE /cart/:itemId` | Xóa sản phẩm khỏi giỏ hàng            |
| `PUT /cart/:itemId`   | Cập nhật số lượng sản phẩm trong giỏ hàng |
| `GET /cart`           | Lấy thông tin giỏ hàng                |
| `POST /cart/checkout` | Mua hàng từ giỏ hàng                 |
| `DELETE /cart`        | Xóa toàn bộ giỏ hàng                  |

**Table 6. API Endpoints cho Admin:**

| API Route                 | Mô tả chức năng                                     |
| :------------------------ | :-------------------------------------------------- |
| `GET /cart/users/:userId` | Xem giỏ hàng của người dùng cụ thể                 |
| `GET /cart/analytics`     | Xem phân tích về sản phẩm trong giỏ hàng (abandoned carts) |

### 1.4. Order Module (Đơn hàng)

**Table 7. API Endpoints cho User:**

| API Route                     | Mô tả chức năng                                     |
| :---------------------------- | :-------------------------------------------------- |
| `POST /orders`                | Tạo đơn hàng mới                                    |
| `GET /orders/:id`             | Lấy thông tin chi tiết đơn hàng của chính mình      |
| `GET /orders`                 | Lấy danh sách đơn hàng của chính mình               |
| `PUT /orders/:id/confirm-delivery` | Xác nhận đã nhận hàng                               |
| `DELETE /orders/:id`          | Hủy đơn hàng (chỉ với đơn hàng chưa xử lý)          |
| `POST /orders/:id/refund`     | Yêu cầu hoàn tiền                                   |
| `GET /orders/history`         | Xem lịch sử đơn hàng của chính mình                 |

**Table 8. API Endpoints cho Admin:**

| API Route                     | Mô tả chức năng                                     |
| :---------------------------- | :-------------------------------------------------- |
| `GET /orders/all`             | Lấy danh sách tất cả đơn hàng                       |
| `GET /orders/:id`             | Lấy thông tin chi tiết của bất kỳ đơn hàng          |
| `PUT /orders/:id/status`      | Cập nhật trạng thái đơn hàng                        |
| `PUT /orders/:id`             | Cập nhật thông tin đơn hàng                         |
| `POST /orders/:id/process-refund` | Xử lý yêu cầu hoàn tiền                            |
| `GET /orders/analytics`       | Xem phân tích và thống kê đơn hàng                  |
| `GET /orders/export`          | Xuất dữ liệu đơn hàng                               |

### 1.5. Checkout Module (Thanh toán)

**Table 9. API Endpoints cho User:**

| API Route                     | Mô tả chức năng                                     |
| :---------------------------- | :-------------------------------------------------- |
| `POST /checkout`              | Tạo thanh toán                                      |
| `POST /checkout/confirm`      | Xác nhận thanh toán                                 |
| `POST /checkout/cancel`       | Hủy thanh toán                                      |
| `GET /checkout/status`        | Lấy trạng thái thanh toán của giao dịch hiện tại    |
| `GET /checkout/history`       | Lấy lịch sử thanh toán của chính mình               |
| `GET /checkout/invoice/:id`   | Lấy hóa đơn thanh toán của chính mình               |
| `GET /checkout/methods`       | Lấy danh sách phương thức thanh toán                |
| `POST /checkout/verify`       | Xác minh thông tin thanh toán trước khi hoàn tất    |
| `GET /checkout/:id`           | Lấy thông tin chi tiết giao dịch thanh toán của chính mình |

**Table 10. API Endpoints cho Admin:**

| API Route                     | Mô tả chức năng                                     |
| :---------------------------- | :-------------------------------------------------- |
| `GET /checkout/transactions`  | Xem danh sách tất cả giao dịch thanh toán          |
| `GET /checkout/transactions/:id` | Xem chi tiết giao dịch thanh toán cụ thể           |
| `POST /checkout/callback`     | Nhận callback từ dịch vụ thanh toán (webhook endpoint) |
| `POST /checkout/methods`      | Thêm phương thức thanh toán mới                     |
| `PUT /checkout/methods/:id`   | Cập nhật phương thức thanh toán                     |
| `DELETE /checkout/methods/:id` | Vô hiệu hóa phương thức thanh toán                  |
| `GET /checkout/analytics`     | Xem phân tích và thống kê thanh toán                |

### 1.6. Promotion Module (Khuyến mãi)

**Table 11. API Endpoints cho User:**

| API Route                 | Mô tả chức năng                      |
| :------------------------ | :------------------------------------ |
| `POST /promotions/apply`  | Áp dụng mã giảm giá                  |
| `GET /promotions`         | Lấy danh sách khuyến mãi công khai   |
| `GET /promotions/:id`     | Lấy chi tiết khuyến mãi công khai    |
| `GET /promotions/validate` | Kiểm tra tính hợp lệ của mã giảm giá |
| `GET /promotions/active`  | Lấy danh sách khuyến mãi đang hoạt động |

**Table 12. API Endpoints cho Admin:**

| API Route                     | Mô tả chức năng                                     |
| :---------------------------- | :-------------------------------------------------- |
| `POST /promotions`            | Tạo khuyến mãi mới                                  |
| `PUT /promotions/:id`         | Sửa thông tin khuyến mãi                            |
| `DELETE /promotions/:id`      | Xóa khuyến mãi                                      |
| `GET /promotions/all`         | Lấy tất cả khuyến mãi bao gồm các khuyến mãi riêng tư |
| `GET /promotions/analytics`   | Xem số liệu phân tích về hiệu quả khuyến mãi       |
| `POST /promotions/batch`      | Tạo nhiều khuyến mãi cùng lúc                       |
| `PUT /promotions/:id/status`  | Cập nhật trạng thái khuyến mãi (bật/tắt)           |

### 1.7. Notification Module (Thông báo)

**Table 13. API Endpoints cho User:**

| API Route                     | Mô tả chức năng                                     |
| :---------------------------- | :-------------------------------------------------- |
| `GET /notifications`          | Lấy danh sách thông báo của mình                   |
| `GET /notifications/:id`      | Xem chi tiết thông báo của mình                    |
| `PUT /notifications/:id/read` | Đánh dấu thông báo đã đọc                          |
| `PUT /notifications/read-all` | Đánh dấu tất cả thông báo đã đọc                   |
| `DELETE /notifications/:id`   | Xóa thông báo của mình                             |
| `GET /notifications/settings` | Lấy cài đặt thông báo của mình                     |
| `PUT /notifications/settings` | Cập nhật cài đặt thông báo của mình                |

**Table 14. API Endpoints cho Admin:**

| API Route                     | Mô tả chức năng                      |
| :---------------------------- | :------------------------------------ |
| `POST /notifications`         | Gửi thông báo tới người dùng         |
| `GET /notifications/all`      | Lấy tất cả thông báo trong hệ thống  |
| `POST /notifications/bulk`    | Gửi thông báo hàng loạt              |
| `GET /notifications/stats`    | Xem thống kê về thông báo            |
| `GET /notifications/templates` | Lấy danh sách mẫu thông báo          |
| `POST /notifications/templates` | Tạo mẫu thông báo mới                |
| `PUT /notifications/templates/:id` | Chỉnh sửa mẫu thông báo              |

### 1.8. Wishlist Module (Danh sách yêu thích)

**Table 15. API Endpoints cho User:**

| API Route                     | Mô tả chức năng                                     |
| :---------------------------- | :-------------------------------------------------- |
| `POST /wishlist`              | Thêm sản phẩm vào wishlist                         |
| `DELETE /wishlist/:itemId`    | Xóa sản phẩm khỏi wishlist                         |
| `GET /wishlist`               | Lấy danh sách wishlist của mình                    |
| `GET /wishlist/count`         | Lấy số lượng sản phẩm trong wishlist của mình      |
| `POST /wishlist/move-to-cart/:itemId` | Di chuyển sản phẩm từ wishlist vào giỏ hàng        |

**Table 16. API Endpoints cho Admin:**

| API Route                     | Mô tả chức năng                                     |
| :---------------------------- | :-------------------------------------------------- |
| `GET /wishlist/users/:userId` | Lấy danh sách wishlist của người dùng cụ thể       |
| `GET /wishlist/analytics`     | Xem phân tích về sản phẩm được thêm vào wishlist   |
| `GET /wishlist/popular`       | Xem các sản phẩm phổ biến trong wishlist           |

### 1.9. Feedback Module (Phản hồi)

**Table 17. API Endpoints cho User:**

| API Route                     | Mô tả chức năng                      |
| :---------------------------- | :------------------------------------ |
| `POST /feedback`              | Gửi phản hồi                         |
| `GET /feedback`               | Lấy danh sách phản hồi của mình      |
| `GET /feedback/:id`           | Xem chi tiết phản hồi của mình       |
| `PUT /feedback/:id`           | Cập nhật phản hồi của mình           |
| `DELETE /feedback/:id`        | Xóa phản hồi của mình                |
| `POST /messages`              | Nhắn tin với quản trị viên           |
| `GET /messages/:conversationId` | Lấy tin nhắn của cuộc trò chuyện của mình |
| `GET /messages`               | Lấy danh sách cuộc trò chuyện của mình |

**Table 18. API Endpoints cho Admin:**

| API Route                     | Mô tả chức năng                                     |
| :---------------------------- | :-------------------------------------------------- |
| `GET /feedback/all`           | Lấy tất cả phản hồi của người dùng                  |
| `GET /feedback/users/:userId` | Lấy tất cả phản hồi của một người dùng cụ thể      |
| `PUT /feedback/:id/status`    | Cập nhật trạng thái xử lý phản hồi                 |
| `GET /feedback/categories`    | Lấy danh sách phân loại phản hồi                   |
| `GET /messages/all`           | Lấy tất cả cuộc trò chuyện                         |
| `PUT /messages/:conversationId/status` | Cập nhật trạng thái của cuộc trò chuyện            |
| `GET /feedback/analytics`     | Xem phân tích về phản hồi người dùng               |

### 1.10. Analytics Module (Thống kê)

**Table 19. API Endpoints cho User:**

| API Route                     | Mô tả chức năng                                     |
| :---------------------------- | :-------------------------------------------------- |
| `GET /analytics/personal`     | Lấy dữ liệu phân tích cá nhân (lịch sử mua hàng, sản phẩm đã xem) |
| `GET /analytics/recommendations` | Nhận gợi ý sản phẩm dựa trên lịch sử mua hàng      |

**Table 20. API Endpoints cho Admin:**

| API Route                     | Mô tả chức năng                      |
| :---------------------------- | :------------------------------------ |
| `GET /analytics`              | Lấy dữ liệu thống kê tổng hợp        |
| `GET /analytics/products`     | Thống kê theo sản phẩm                |
| `GET /analytics/categories`   | Thống kê theo danh mục                |
| `GET /analytics/revenue`      | Thống kê doanh thu                    |
| `GET /analytics/customers`    | Thống kê khách hàng                   |
| `GET /analytics/promotions`   | Thống kê hiệu quả khuyến mãi         |
| `GET /analytics/dashboard`    | Dữ liệu tổng quan cho dashboard       |
| `GET /analytics/export`       | Xuất báo cáo phân tích                |
| `POST /analytics/segments`    | Tạo phân đoạn khách hàng cho marketing |

### 1.11. Collection Module (Bộ sưu tập)

**Table 21. API Endpoints cho User:**

| API Route                     | Mô tả chức năng                      |
| :---------------------------- | :------------------------------------ |
| `GET /collections`            | Lấy danh sách bộ sưu tập công khai   |
| `GET /collections/:id`        | Lấy chi tiết bộ sưu tập              |
| `GET /collections/:id/products` | Lấy danh sách sản phẩm trong bộ sưu tập |

**Table 22. API Endpoints cho Admin:**

| API Route                     | Mô tả chức năng                                     |
| :---------------------------- | :-------------------------------------------------- |
| `POST /collections`           | Tạo bộ sưu tập mới                                  |
| `PUT /collections/:id`        | Cập nhật thông tin bộ sưu tập                       |
| `DELETE /collections/:id`     | Xóa bộ sưu tập                                      |
| `POST /collections/:id/products` | Thêm sản phẩm vào bộ sưu tập                       |
| `DELETE /collections/:id/products/:productId` | Xóa sản phẩm khỏi bộ sưu tập                       |
| `PUT /collections/:id/status` | Cập nhật trạng thái bộ sưu tập (hiển thị/ẩn)       |
| `GET /collections/analytics`  | Xem phân tích về hiệu quả của bộ sưu tập           |

### 1.12. Auth Module (Xác thực với Clerk)

**Table 23. API Endpoints cho User:**

| API Route                 | Mô tả chức năng                                     |
| :------------------------ | :-------------------------------------------------- |
| `GET /auth/callback`      | Callback URL cho OAuth providers (Google, Facebook, etc.) |
| `GET /auth/me`            | Lấy thông tin người dùng hiện tại                   |
| `POST /auth/sign-out`     | Đăng xuất                                           |
| `GET /auth/session`       | Kiểm tra phiên hiện tại                             |
| `POST /auth/refresh-token` | Làm mới token                                       |
| `GET /auth/jwt`           | Lấy JWT token cho client                            |
| `GET /auth/verify/:token` | Xác minh email từ liên kết email                   |

**Table 24. API Endpoints cho Admin:**

| API Route                     | Mô tả chức năng                                     |
| :---------------------------- | :-------------------------------------------------- |
| `GET /auth/users`             | Xem danh sách tất cả người dùng trong hệ thống      |
| `GET /auth/users/:id`         | Xem thông tin chi tiết người dùng                   |
| `PUT /auth/users/:id/status`  | Thay đổi trạng thái tài khoản (kích hoạt/vô hiệu hóa) |
| `GET /auth/sessions`          | Xem danh sách phiên đăng nhập hiện tại              |
| `DELETE /auth/sessions/:sessionId` | Xóa phiên đăng nhập cụ thể                         |
| `GET /auth/security-logs`     | Xem nhật ký bảo mật                                 |

### 1.13. Shipper Integration Module (Tích hợp vận chuyển)

**Table 25. API Endpoints cho User:**

| API Route                     | Mô tả chức năng                                     |
| :---------------------------- | :-------------------------------------------------- |
| `GET /shipper/tracking/:orderId` | Lấy thông tin theo dõi đơn hàng của mình           |
| `GET /shipper/providers`      | Lấy danh sách đơn vị vận chuyển hỗ trợ             |
| `POST /shipper/calculate-fee` | Tính phí vận chuyển cho đơn hàng                   |

**Table 26. API Endpoints cho Admin:**

| API Route                     | Mô tả chức năng                                     |
| :---------------------------- | :-------------------------------------------------- |
| `POST /shipper/update-status` | Cập nhật trạng thái từ đơn vị vận chuyển           |
| `POST /webhooks/shipper`      | Xử lý webhook từ đối tác vận chuyển                |
| `GET /shipper/orders`         | Lấy danh sách đơn hàng cần giao                    |
| `PUT /shipper/orders/:id/status` | Cập nhật trạng thái đơn hàng                       |
| `GET /shipper/analytics`      | Xem phân tích về hiệu quả vận chuyển               |
| `POST /shipper/providers`     | Thêm đơn vị vận chuyển mới                         |
| `PUT /shipper/providers/:id`  | Cập nhật thông tin đơn vị vận chuyển               |

**Table 27. API Endpoints cho Shipper:**

| API Route                     | Mô tả chức năng                                     |
| :---------------------------- | :-------------------------------------------------- |
| `GET /shipper/orders/assigned` | Lấy danh sách đơn hàng được phân công              |
| `PUT /shipper/orders/:id/status` | Cập nhật trạng thái đơn hàng                       |
| `POST /shipper/delivery-proof/:orderId` | Tải lên bằng chứng giao hàng                       |
| `POST /shipper/issues/:orderId` | Báo cáo vấn đề trong quá trình giao hàng           |

### 1.14. Stripe Payment Gateway Module (Cổng thanh toán Stripe)

**Table 28. API Endpoints cho User:**

| API Route                     | Mô tả chức năng                                     |
| :---------------------------- | :-------------------------------------------------- |
| `POST /stripe/payment-intent` | Tạo intent thanh toán                               |
| `POST /stripe/confirm-payment` | Xác nhận thanh toán                                 |
| `GET /stripe/payment-status/:id` | Kiểm tra trạng thái thanh toán                     |
| `POST /stripe/payment-methods` | Thêm phương thức thanh toán mới                     |
| `GET /stripe/payment-methods` | Lấy danh sách phương thức thanh toán đã lưu        |
| `DELETE /stripe/payment-methods/:id` | Xóa phương thức thanh toán đã lưu                  |
| `POST /stripe/setup-intent`   | Tạo intent lưu thông tin thẻ an toàn                |


