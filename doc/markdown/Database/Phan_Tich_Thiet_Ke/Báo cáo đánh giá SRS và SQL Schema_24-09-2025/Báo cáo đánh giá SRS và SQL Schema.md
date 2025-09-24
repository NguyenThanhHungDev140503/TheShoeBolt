
# Báo cáo đánh giá SRS và SQL Schema

## 1. Giới thiệu

Báo cáo này đánh giá mức độ phù hợp của lược đồ cơ sở dữ liệu SQL (`theshoe.sql`) với các yêu cầu chức năng được nêu trong tài liệu Đặc tả Yêu cầu Phần mềm (SRS) cho Website Thương mại điện tử Giày (`SoftwareRequirementSpecification(SRS)forShoeE-commerceWebsite.md`). Các tính năng liên quan đến thông báo (notification) và tin nhắn (message) sẽ được loại trừ khỏi phạm vi đánh giá này.

## 2. Phân tích Yêu cầu Chức năng (SRS) và Đối sánh với SQL Schema

Chúng tôi sẽ đi qua từng yêu cầu chức năng (FR) trong tài liệu SRS và đánh giá khả năng hỗ trợ của lược đồ SQL hiện có.




### FR-001: Đăng ký người dùng

*   **Yêu cầu:** Người dùng có thể đăng ký tài khoản bằng email, số điện thoại, tài khoản google; Sử dụng Clerk.
*   **Đánh giá SQL:** Bảng `User` có các trường `email`, `sodienthoai`, `password` để lưu thông tin đăng ký cơ bản. Bảng `ExternalIdentity` với các trường `provider` (ví dụ: 'google') và `external_id` hỗ trợ việc đăng ký/đăng nhập qua tài khoản Google (hoặc các nhà cung cấp bên ngoài khác) thông qua Clerk. Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.




### FR-002: Đăng nhập

*   **Yêu cầu:** Hỗ trợ đăng nhập bằng mật khẩu và tài khoản google.
*   **Đánh giá SQL:** Bảng `User` lưu trữ `email` và `password` cho đăng nhập truyền thống. Bảng `ExternalIdentity` hỗ trợ đăng nhập qua các nhà cung cấp bên ngoài như Google. Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.




### FR-003: Duyệt danh mục sản phẩm

*   **Yêu cầu:** Hiển thị danh mục sản phẩm một cách trực quan, cho phép người dùng dễ dàng duyệt qua các sản phẩm.
*   **Đánh giá SQL:** Bảng `Category` và `Product` với khóa ngoại `category_id` cho phép tổ chức và duyệt sản phẩm theo danh mục. Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.




### FR-004: Hiển thị chi tiết sản phẩm

*   **Yêu cầu:** Hiển thị đầy đủ thông tin về sản phẩm như: hình ảnh, mô tả, giá cả, kích cỡ, màu sắc, v.v.
*   **Đánh giá SQL:** Bảng `Product` chứa các trường như `name`, `description`, `price`, `stock_price`, `weight`, `dimensions`, `attributes` (JSONB có thể lưu kích cỡ, màu sắc). Bảng `ProductImage` lưu trữ `image_url` liên quan đến sản phẩm. Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.




### FR-005: Tìm kiếm sản phẩm cơ bản

*   **Yêu cầu:** Người dùng có thể tìm kiếm sản phẩm theo tên.
*   **Đánh giá SQL:** Bảng `Product` có trường `name` và có thể sử dụng các chỉ mục (ví dụ: `idx_product_name` nếu có, hoặc tìm kiếm toàn văn với `unaccent` extension) để hỗ trợ tìm kiếm theo tên. Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.




### FR-006: Tìm kiếm sản phẩm nâng cao

*   **Yêu cầu:** Người dùng có thể tìm kiếm sản phẩm theo danh mục (category), loại (tag), giá cả, collection.
*   **Đánh giá SQL:**
    *   `Category` và `Product` (qua `category_id`) hỗ trợ tìm kiếm theo danh mục.
    *   `Product` có trường `price` hỗ trợ tìm kiếm theo giá cả.
    *   `Collection` và `CollectionProduct` hỗ trợ tìm kiếm theo collection.
    *   `Product` có trường `attributes` (JSONB) có thể lưu trữ các thuộc tính như tag. `idx_product_attributes` (GIN index) hỗ trợ tìm kiếm hiệu quả trên JSONB. Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.




### FR-007: Lọc sản phẩm

*   **Yêu cầu:** Người dùng có thể lọc sản phẩm theo loại (category), collection, giá cả, kích thước, màu sắc, chất liệu, tag (men, women, sale, new).
*   **Đánh giá SQL:**
    *   `Category` và `Product` (qua `category_id`) hỗ trợ lọc theo loại.
    *   `Collection` và `CollectionProduct` hỗ trợ lọc theo collection.
    *   `Product` có trường `price` hỗ trợ lọc theo giá cả.
    *   `Product` có trường `attributes` (JSONB) có thể lưu trữ kích thước, màu sắc, chất liệu, tag. `idx_product_attributes` (GIN index) hỗ trợ lọc hiệu quả trên JSONB. Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.




### FR-008: Giỏ hàng

*   **Yêu cầu:** Người dùng có thể thêm/xóa sản phẩm vào giỏ hàng.
*   **Đánh giá SQL:** Bảng `Cart` và `CartItem` được thiết kế để lưu trữ thông tin giỏ hàng và các sản phẩm trong giỏ hàng. Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.




### FR-009: Wishlist

*   **Yêu cầu:** Người dùng có thể đăng ký nhận thông báo về các sản phẩm chuẩn bị về; Dùng Resend để gửi email thông báo.
*   **Đánh giá SQL:** Bảng `Wishlist` và `WishlistItem` được thiết kế để lưu trữ danh sách sản phẩm yêu thích của người dùng. Phần "nhận thông báo" được loại trừ khỏi phạm vi đánh giá SQL. Điều này đáp ứng yêu cầu lưu trữ dữ liệu wishlist.
*   **Trạng thái:** Đã đáp ứng (phần lưu trữ dữ liệu).




### FR-010: Danh sách yêu thích (Favorites)

*   **Yêu cầu:** Người dùng có thể thêm sản phẩm vào danh mục yêu thích.
*   **Đánh giá SQL:** Bảng `Favourite` được thiết kế để lưu trữ các sản phẩm yêu thích của người dùng (`user_id`, `product_id`). Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.




### FR-011: Đánh giá sản phẩm

*   **Yêu cầu:** Người dùng có thể đánh giá và viết nhận xét về sản phẩm đã mua.
*   **Đánh giá SQL:** Bảng `Review` với các trường `product_id`, `user_id`, `rating`, `comment` hỗ trợ đầy đủ chức năng này. Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.




### FR-012: Áp dụng khuyến mãi

*   **Yêu cầu:** Người dùng có thể áp dụng các chương trình khuyến mãi, mã giảm giá khi mua hàng.
*   **Đánh giá SQL:** Bảng `DiscountCode` và `Promotion` được thiết kế để quản lý mã giảm giá và chương trình khuyến mãi. Bảng `Order` có trường `discount_code_id` để liên kết với mã giảm giá đã áp dụng. Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.




### FR-013: Áp dụng nhiều mã giảm giá

*   **Yêu cầu:** Hệ thống hỗ trợ áp dụng nhiều mã giảm giá cùng lúc cho một đơn hàng.
*   **Đánh giá SQL:** Hiện tại, bảng `Order` chỉ có một trường `discount_code_id`, cho phép liên kết với *một* mã giảm giá duy nhất. Để hỗ trợ nhiều mã giảm giá, cần có một bảng trung gian (`OrderDiscountCode` chẳng hạn) liên kết `Order` với nhiều `DiscountCode`. Do đó, yêu cầu này **chưa được đáp ứng** trực tiếp bởi lược đồ hiện tại.
*   **Trạng thái:** Chưa đáp ứng.




### FR-014: Thanh toán

*   **Yêu cầu:** Hỗ trợ thanh toán bằng thẻ tín dụng, ví điện tử, tiền mặt; Dùng Stripe để hỗ trợ thanh toán online.
*   **Đánh giá SQL:** Bảng `PaymentMethod` quản lý các phương thức thanh toán (`code`, `name`, `provider`). Bảng `Payment` lưu trữ thông tin giao dịch thanh toán chi tiết (`order_id`, `payment_method_id`, `amount`, `status`, `provider_txn_id`). Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.




### FR-015: Theo dõi đơn hàng

*   **Yêu cầu:** Người dùng có thể theo dõi trạng thái đơn hàng, lịch sử đơn hàng.
*   **Đánh giá SQL:** Bảng `Order` có trường `status` để theo dõi trạng thái hiện tại. Bảng `OrderStatusHistory` lưu trữ lịch sử thay đổi trạng thái của đơn hàng, bao gồm `old_status`, `new_status`, `changed_at`. Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.




### FR-016: Quản lý đơn hàng

*   **Yêu cầu:** Người dùng có thể kiểm tra các đơn hàng đã mua, đã hủy, đang giao, chờ xác nhận.
*   **Đánh giá SQL:** Bảng `Order` với trường `status` (`pending`, `processing`, `shipped`, `delivered`, `cancelled`) cho phép lọc và kiểm tra các đơn hàng theo trạng thái. Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.




### FR-017: Nhận thông báo

*   **Yêu cầu:** Người dùng xem thông báo từ hệ thống.
*   **Đánh giá SQL:** Yêu cầu này đã được loại trừ khỏi phạm vi đánh giá theo yêu cầu của người dùng (dùng dịch vụ riêng cho notification).
*   **Trạng thái:** Loại trừ.




### FR-018: Nhắn tin với quản trị viên

*   **Yêu cầu:** Người dùng gửi tin nhắn cho quản trị viên.
*   **Đánh giá SQL:** Yêu cầu này đã được loại trừ khỏi phạm vi đánh giá theo yêu cầu của người dùng (dùng MongoDB cho message).
*   **Trạng thái:** Loại trừ.




### FR-019: Không cần đăng nhập khi mua hàng

*   **Yêu cầu:** Người dùng có thể mua hàng với tư cách khách vãng lai.
*   **Đánh giá SQL:** Bảng `Order` có các trường `guest_email`, `guest_phone`, `contact_name`, `contact_phone`, `contact_address`, `contact_email` cho phép lưu trữ thông tin của khách vãng lai mà không cần `user_id`. Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.




### FR-020: Mua hàng từ trang sản phẩm

*   **Yêu cầu:** Người dùng có thể mua hàng trực tiếp từ trang chi tiết sản phẩm.
*   **Đánh giá SQL:** Chức năng này liên quan đến luồng nghiệp vụ và giao diện người dùng hơn là cấu trúc cơ sở dữ liệu. Tuy nhiên, các bảng `Cart`, `CartItem`, `Order`, `OrderDetail` đã có sẵn để hỗ trợ việc thêm sản phẩm vào giỏ hàng và tạo đơn hàng từ đó. Điều này gián tiếp đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng (về mặt dữ liệu).




### FR-021: Mua hàng từ trang giỏ hàng

*   **Yêu cầu:** Người dùng có thể mua hàng từ trang giỏ hàng.
*   **Đánh giá SQL:** Tương tự FR-020, chức năng này liên quan đến luồng nghiệp vụ. Các bảng `Cart`, `CartItem`, `Order`, `OrderDetail` hỗ trợ việc chuyển đổi giỏ hàng thành đơn hàng. Điều này gián tiếp đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng (về mặt dữ liệu).




### FR-022: Xác nhận giao hàng

*   **Yêu cầu:** Shipper xác nhận đã giao hàng thành công.
*   **Đánh giá SQL:** Bảng `Shipping` có trường `status` (`pending`, `shipping`, `delivered`) và `shipper_id` để theo dõi và cập nhật trạng thái giao hàng bởi shipper. Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.




### FR-023: Quản trị sản phẩm

*   **Yêu cầu:** Admin có thể thêm, sửa, xóa sản phẩm.
*   **Đánh giá SQL:** Bảng `Product` lưu trữ thông tin sản phẩm. Các thao tác thêm, sửa, xóa sẽ được thực hiện trực tiếp trên bảng này. Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.




### FR-024: Quản lý danh mục sản phẩm

*   **Yêu cầu:** Admin có thể thêm sửa xóa danh mục sản phẩm như: sport, casual, giày da, giày lười.
*   **Đánh giá SQL:** Bảng `Category` được thiết kế để lưu trữ các danh mục sản phẩm. Các thao tác thêm, sửa, xóa sẽ được thực hiện trực tiếp trên bảng này. Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.




### FR-025: Quản lý đơn hàng (Admin)

*   **Yêu cầu:** Admin có thể xem các đơn hàng trong một khoảng thời gian, xem chi tiết một đơn hàng, đánh dấu đơn hàng đã xử lý hoặc chưa xử lý.
*   **Đánh giá SQL:** Bảng `Order` và `OrderDetail` lưu trữ thông tin đơn hàng và chi tiết. Trường `status` trong bảng `Order` cho phép quản lý trạng thái đơn hàng. Bảng `OrderStatusHistory` cung cấp lịch sử thay đổi trạng thái. Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.




### FR-026: Quản lý người dùng

*   **Yêu cầu:** Admin có thể tạo các tài khoản cho shipper.
*   **Đánh giá SQL:** Bảng `User` lưu trữ thông tin người dùng. Bảng `Role` và `UserRole` cho phép gán vai trò (ví dụ: 'shipper') cho người dùng. Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.




### FR-027: Quản lý quyền người dùng

*   **Yêu cầu:** Admin có thể cấp quyền cho các tài khoản người dùng một cách linh động.
*   **Đánh giá SQL:** Bảng `Role`, `Permission`, và `RolePermission` cùng với `UserRole` tạo thành một hệ thống phân quyền dựa trên vai trò (RBAC). Điều này cho phép quản trị viên gán các quyền cụ thể cho các vai trò, và gán vai trò cho người dùng một cách linh động. Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.




### FR-028: Thống kê theo loại sản phẩm

*   **Yêu cầu:** Admin xem biểu đồ lợi nhuận của một loại giày trong một khoảng thời gian.
*   **Đánh giá SQL:** Bảng `Product` liên kết với `Category` và `OrderDetail` (qua `product_id`) cho phép truy vấn dữ liệu bán hàng theo danh mục sản phẩm. Từ `OrderDetail` có thể tính toán doanh thu và lợi nhuận. Điều này đáp ứng yêu cầu về dữ liệu thô để thống kê.
*   **Trạng thái:** Đã đáp ứng (về mặt dữ liệu).




### FR-029: Thống kê tổng thể

*   **Yêu cầu:** Admin xem biểu đồ lợi nhuận của toàn bộ trang web trong một khoảng thời gian.
*   **Đánh giá SQL:** Bảng `Order` và `OrderDetail` chứa tất cả thông tin cần thiết để tính toán tổng doanh thu và lợi nhuận của toàn bộ trang web trong một khoảng thời gian nhất định. Điều này đáp ứng yêu cầu về dữ liệu thô để thống kê.
*   **Trạng thái:** Đã đáp ứng (về mặt dữ liệu).




### FR-030: Thống kê sản phẩm bán chạy

*   **Yêu cầu:** Admin xem thống kê sản phẩm bán chạy theo khoảng thời gian.
*   **Đánh giá SQL:** Bảng `OrderDetail` lưu trữ số lượng sản phẩm (`quantity`) đã bán cho mỗi đơn hàng. Bằng cách tổng hợp dữ liệu từ `OrderDetail` và `Order` (với `created_at`), có thể xác định các sản phẩm bán chạy nhất trong một khoảng thời gian. Điều này đáp ứng yêu cầu về dữ liệu thô để thống kê.
*   **Trạng thái:** Đã đáp ứng (về mặt dữ liệu).




### FR-031: Quản lý khuyến mãi

*   **Yêu cầu:** Admin có thể tạo, sửa, xóa chương trình khuyến mãi.
*   **Đánh giá SQL:** Bảng `Promotion` được thiết kế để quản lý các chương trình khuyến mãi, bao gồm `name`, `description`, `discount_percentage`, `start_date`, `end_date`. Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.




### FR-032: Quản lý mã giảm giá

*   **Yêu cầu:** Admin có thể tạo, sửa, xóa mã giảm giá.
*   **Đánh giá SQL:** Bảng `DiscountCode` được thiết kế để quản lý các mã giảm giá, bao gồm `code`, `discount_type`, `discount_percentage`, `max_uses`, `start_date`, `end_date`. Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.




### FR-033: Dashboard theo dõi

*   **Yêu cầu:** Admin xem báo cáo hiệu quả của từng chương trình khuyến mãi, bao gồm số lượng đơn hàng tạo ra, doanh thu tăng thêm, số lượt sử dụng.
*   **Đánh giá SQL:** Bảng `Promotion` và `DiscountCode` lưu trữ thông tin khuyến mãi/mã giảm giá. Bảng `Order` và `DiscountCodeUses` liên kết các đơn hàng với mã giảm giá đã sử dụng. Từ các bảng này, có thể tổng hợp dữ liệu để tạo báo cáo hiệu quả. Điều này đáp ứng yêu cầu về dữ liệu thô để thống kê.
*   **Trạng thái:** Đã đáp ứng (về mặt dữ liệu).




### FR-034: Phản hồi khách hàng

*   **Yêu cầu:** Admin xem, xử lý phản hồi từ khách hàng.
*   **Đánh giá SQL:** Bảng `Feedback` được thiết kế để lưu trữ các phản hồi từ khách hàng, bao gồm `user_id`, `subject`, `content`, `status`, `admin_response`. Điều này đáp ứng yêu cầu.
*   **Trạng thái:** Đã đáp ứng.





## 3. Tóm tắt và Kết luận

### 3.1. Các tính năng đã đáp ứng

Nhìn chung, lược đồ cơ sở dữ liệu SQL đã cung cấp một nền tảng vững chắc để hỗ trợ phần lớn các yêu cầu chức năng được nêu trong tài liệu SRS. Các tính năng cốt lõi của một website thương mại điện tử như quản lý người dùng, sản phẩm, giỏ hàng, đơn hàng, thanh toán, đánh giá, yêu thích, khuyến mãi và quản trị đều đã được thiết kế đầy đủ trong lược đồ.

### 3.2. Các tính năng chưa đáp ứng hoặc cần xem xét thêm

*   **FR-013: Áp dụng nhiều mã giảm giá:** Lược đồ hiện tại chỉ cho phép một mã giảm giá duy nhất cho mỗi đơn hàng thông qua trường `discount_code_id` trong bảng `Order`. Để hỗ trợ nhiều mã giảm giá, cần tạo một bảng trung gian (`OrderDiscountCode`) để liên kết một đơn hàng với nhiều mã giảm giá.

### 3.3. Các tính năng được loại trừ

Theo yêu cầu, các tính năng liên quan đến thông báo (notification) và tin nhắn (message) đã được loại trừ khỏi phạm vi đánh giá này, vì chúng sẽ được xử lý bằng các dịch vụ riêng biệt (notification) hoặc cơ sở dữ liệu NoSQL (message).

### 3.4. Đề xuất cải tiến

Để đáp ứng hoàn toàn yêu cầu FR-013, cần sửa đổi lược đồ SQL bằng cách thêm một bảng trung gian cho phép liên kết nhiều mã giảm giá với một đơn hàng. Cụ thể:

*   **Tạo bảng `OrderDiscountCode`:**
    ```sql
    CREATE TABLE "OrderDiscountCode" (
        order_id UUID REFERENCES "Order"(id),
        discount_code_id UUID REFERENCES "DiscountCode"(id),
        PRIMARY KEY (order_id, discount_code_id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```
*   **Xóa trường `discount_code_id` khỏi bảng `Order`** (hoặc thay đổi mục đích sử dụng nếu có).

## 4. Kết luận

Với một số điều chỉnh nhỏ như đề xuất ở trên, lược đồ cơ sở dữ liệu SQL hiện tại sẽ hoàn toàn đáp ứng được tất cả các yêu cầu chức năng của SRS, ngoại trừ các tính năng đã được loại trừ. Cấu trúc bảng được thiết kế tốt, có tính mở rộng và hỗ trợ tốt cho các nghiệp vụ của một hệ thống thương mại điện tử giày.


