# Phân tích ERD hệ thống web bán giày

## 1. Giới thiệu

Tài liệu này trình bày phân tích thiết kế Cơ sở dữ liệu của hệ thống web bán giày, sử dụng mô hình Thực thể - Quan hệ (ERD).

## 2. Phân tích ERD

### 2.1. Bước 1: Xác định tập thực thể

Tập thực thể đầy đủ của hệ thống bao gồm:

1.  **User (Người dùng)**: Đại diện cho các vai trò như "khách hàng", "quản trị viên", "shipper".
2.  **Permission (Quyền)**: Đại diện cho các quyền truy cập như "xem sản phẩm", "quản lý đơn hàng".
3.  **Product (Sản phẩm)**: Đại diện cho sản phẩm trong hệ thống.
4.  **Category (Danh mục)**: Phân loại sản phẩm.
5.  **Order (Đơn hàng)**: Thông tin về đơn hàng của người dùng.
6.  **Cart (Giỏ hàng)**: Giỏ hàng của người dùng.
7.  **Address (Địa chỉ)**: Địa chỉ giao hàng hoặc thông tin liên hệ của người dùng.
8.  **Checkout (Thanh toán)**: Thông tin thanh toán của đơn hàng.
9.  **Shipping (Giao hàng)**: Thông tin vận chuyển liên quan đến đơn hàng.
10. **Promotion (Khuyến mãi)**: Các chương trình khuyến mãi.
11. **DiscountCode (Mã giảm giá)**: Mã giảm giá áp dụng cho đơn hàng.
12. **Review (Đánh giá)**: Đánh giá của người dùng về sản phẩm.
13. **Wishlist (Danh sách mong muốn)**: Danh sách sản phẩm người dùng muốn nhận thông báo.
14. **ProductImage (Hình ảnh sản phẩm)**: Lưu trữ hình ảnh của sản phẩm.
15. **Collection (Bộ sưu tập)**: Đại diện cho các bộ sưu tập sản phẩm (VD: mùa hè, mùa đông).
16. **Favourite (Yêu thích)**: Danh sách sản phẩm yêu thích của người dùng.

### 2.2. Bước 2: Xác định mối quan hệ

*   **User - Role**: Một người dùng có thể có nhiều vai trò, một vai trò có thể được gán cho nhiều người dùng (N:M). Cần bảng trung gian **UserRole**.
*   **Role - Permission**: Một vai trò có thể có nhiều quyền, một quyền có thể được gán cho nhiều vai trò (N:M). Cần bảng trung gian **RolePermission**.
*   **User - Address**: Một người dùng có thể có nhiều địa chỉ (1:N).
*   **User - Order**: Một người dùng có thể đặt nhiều đơn hàng (1:N). Lưu ý: Đơn hàng của khách vãng lai sẽ có user_id = NULL.
*   **User - Cart**: Một người dùng có một giỏ hàng (1:1).
*   **User - Wishlist**: Một người dùng có một danh sách mong muốn (1:1).
*   **User - Favourite**: Một người dùng có thể có nhiều sản phẩm yêu thích (1:N).
*   **Product - Category**: Một sản phẩm thuộc một danh mục, một danh mục có thể chứa nhiều sản phẩm (1:N).
*   **Product - Review**: Một sản phẩm có thể có nhiều đánh giá, một đánh giá thuộc về một sản phẩm (1:N).
*   **Product - ProductImage**: Một sản phẩm có thể có nhiều hình ảnh, một hình ảnh thuộc về một sản phẩm (1:N).
*   **Product - Favourite**: Một sản phẩm có thể được nhiều người yêu thích, một mục yêu thích thuộc về một sản phẩm (1:N).
*   **Collection - Product**: Một bộ sưu tập có thể chứa nhiều sản phẩm, một sản phẩm có thể thuộc nhiều bộ sưu tập (N:M). Cần bảng trung gian **CollectionProduct**.
*   **Order - Product**: Một đơn hàng có thể chứa nhiều sản phẩm, một sản phẩm có thể xuất hiện trong nhiều đơn hàng (N:M). Cần bảng trung gian **OrderDetail**.
*   **Order - DiscountCode**: Một đơn hàng có thể sử dụng một hoặc nhiều mã giảm giá, một mã giảm giá có thể được sử dụng cho nhiều đơn hàng (N:M). Cần bảng trung gian **DiscountCodeUses**.
*   **Order - Address**: Một đơn hàng có thể có một địa chỉ giao hàng, một địa chỉ có thể được sử dụng cho nhiều đơn hàng (1:N).
*   **Wishlist - Product**: Một danh sách mong muốn có thể chứa nhiều sản phẩm, một sản phẩm có thể nằm trong nhiều danh sách mong muốn (N:M). Cần bảng trung gian **WishlistItem**.

Ghi chú về Review: - Để đảm bảo rằng chỉ những người dùng đã mua sản phẩm mới có thể đánh giá, logic kiểm tra sẽ được thực hiện trong ứng dụng bằng cách kiểm tra lịch sử mua hàng của người dùng (qua Order và OrderDetail) trước khi cho phép viết đánh giá. Không cần thêm mối quan hệ trực tiếp giữa Review và Order trong ERD.

### 2.3. Bước 3: Xác định thuộc tính cho thực thể

*   **Product**:
    *   `id` (PK): Mã sản phẩm.
    *   `category_id` (FK): Mã danh mục.
    *   `name`: Tên sản phẩm.
    *   `description`: Mô tả.
    *   `price`: Giá sản phẩm.
    *   `stock`: Số lượng tồn kho.
    *   `tags`: Danh sách tag (VD: men, women, sale, new).
    *   `color`: Màu sắc.
    *   `size`: Kích thước.
    *   `material`: Chất liệu.
    *   `created_at`: Thời gian tạo.
    *   `updated_at`: Thời gian cập nhật.
*   **Category**:
    *   `id` (PK): Mã danh mục.
    *   `name`: Tên danh mục.
    *   `description`: Mô tả.
    *   `created_at`: Thời gian tạo.
    *   `updated_at`: Thời gian cập nhật.
*   **Order**:
    *   `id` (PK): Mã đơn hàng.
    *   `user_id` (FK, nullable): Mã người dùng (NULL nếu là khách vãng lai).
    *   `status`: Trạng thái (chờ xử lý, đang giao, đã giao, đã hủy).
    *   `total_amount`: Tổng tiền.
    *   `discount_code_id` (FK, nullable): Mã giảm giá (nếu có).
    *   `contact_name`: Tên liên hệ (cho khách vãng lai).
    *   `contact_phone`: Số điện thoại (cho khách vãng lai).
    *   `contact_address`: Địa chỉ (cho khách vãng lai).
    *   `contact_email`: Email (cho khách vãng lai).
    *   `created_at`: Thời gian tạo.
    *   `updated_at`: Thời gian cập nhật.
*   **Cart**:
    *   `id` (PK): Mã giỏ hàng.
    *   `user_id` (FK): Mã người dùng.
    *   `created_at`: Thời gian tạo.
    *   `updated_at`: Thời gian cập nhật.
*   **Address**:
    *   `id` (PK): Mã địa chỉ.
    *   `user_id` (FK): Mã người dùng.
    *   `street`: Đường.
    *   `city`: Thành phố.
    *   `state`: Tỉnh/Bang.
    *   `postal_code`: Mã bưu điện.
    *   `country`: Quốc gia.
    *   `is_default`: Địa chỉ mặc định (true/false).
    *   `created_at`: Thời gian tạo.
    *   `updated_at`: Thời gian cập nhật.
*   **Checkout**:
    *   `id` (PK): Mã thanh toán.
    *   `order_id` (FK): Mã đơn hàng.
    *   `amount`: Số tiền thanh toán.
    *   `method`: Phương thức (thẻ tín dụng, ví điện tử, tiền mặt).
    *   `status`: Trạng thái (thành công, thất bại).
    *   `created_at`: Thời gian tạo.
    *   `updated_at`: Thời gian cập nhật.
*   **Shipping**:
    *   `id` (PK): Mã giao hàng.
    *   `order_id` (FK): Mã đơn hàng.
    *   `address_id` (FK): Mã địa chỉ giao hàng.
    *   `status`: Trạng thái (chờ giao, đang giao, đã giao).
    *   `shipper_id` (FK, nullable): Mã shipper (liên kết đến User).
    *   `created_at`: Thời gian tạo.
    *   `updated_at`: Thời gian cập nhật.
*   **Promotion**:
    *   `id` (PK): Mã khuyến mãi.
    *   `name`: Tên chương trình.
    *   `description`: Mô tả.
    *   `discount_percentage`: Phần trăm giảm giá.
    *   `start_date`: Ngày bắt đầu.
    *   `end_date`: Ngày kết thúc.
    *   `created_at`: Thời gian tạo.
    *   `updated_at`: Thời gian cập nhật.
*   **DiscountCode**:
    *   `id` (PK): Mã giảm giá.
    *   `code` (UK): Mã duy nhất.
    *   `discount_type`: Loại giảm giá (phần trăm, số tiền).
    *   `discount_percentage`: Phần trăm giảm giá.
    *   `max_uses`: Số lần sử dụng tối đa.
    *   `uses_count`: Số lần đã sử dụng.
    *   `min_order_value`: Giá trị đơn hàng tối thiểu.
    *   `start_date`: Ngày bắt đầu.
    *   `end_date`: Ngày kết thúc.
    *   `created_at`: Thời gian tạo.
    *   `updated_at`: Thời gian cập nhật.
*   **Review**:
    *   `id` (PK): Mã đánh giá.
    *   `product_id` (FK): Mã sản phẩm.
    *   `user_id` (FK): Mã người dùng.
    *   `rating`: Điểm đánh giá.
    *   `comment`: Bình luận.
    *   `created_at`: Thời gian tạo.
    *   `updated_at`: Thời gian cập nhật.
*   **Wishlist**:
    *   `id` (PK): Mã danh sách mong muốn.
    *   `user_id` (FK): Mã người dùng.
    *   `created_at`: Thời gian tạo.
    *   `updated_at`: Thời gian cập nhật.
*   **WishlistItem**:
    *   `wishlist_id` (PK, FK): Mã danh sách mong muốn.
    *   `product_id` (PK, FK): Mã sản phẩm.
*   **ProductImage**:
    *   `id` (PK): Mã hình ảnh.
    *   `product_id` (FK): Mã sản phẩm.
    *   `image_url`: Đường dẫn hình ảnh.
    *   `is_primary`: Hình ảnh chính (true/false).
    *   `created_at`: Thời gian tạo.
    *   `updated_at`: Thời gian cập nhật.
*   **Collection**:
    *   `id` (PK): Mã bộ sưu tập.
    *   `name`: Tên bộ sưu tập.
    *   `description`: Mô tả.
    *   `created_at`: Thời gian tạo.
    *   `updated_at`: Thời gian cập nhật.
*   **Favourite**:
    *   `id` (PK): Mã yêu thích.
    *   `user_id` (FK): Mã người dùng.
    *   `product_id` (FK): Mã sản phẩm.
    *   `created_at`: Thời gian tạo.

▪ **Bảng trung gian**:

*   **OrderDetail**:
    *   `order_id` (PK, FK): Mã đơn hàng.
    *   `product_id` (PK, FK): Mã sản phẩm.
    *   `quantity`: Số lượng.
    *   `price_at_purchase`: Giá tại thời điểm mua.
*   **CartItem**:
    *   `cart_id` (PK, FK): Mã giỏ hàng.
    *   `product_id` (PK, FK): Mã sản phẩm.
    *   `quantity`: Số lượng.
*   **PromotionProduct**:
    *   `promotion_id` (PK, FK): Mã khuyến mãi.
    *   `product_id` (PK, FK): Mã sản phẩm.
*   **UserRole**:
    *   `user_id` (PK, FK): Mã người dùng.
    *   `role_id` (PK, FK): Mã vai trò.
*   **RolePermission**:
    *   `role_id` (PK, FK): Mã vai trò.
    *   `permission_id` (PK, FK): Mã quyền.
*   **DiscountCodeUses**:
    *   `discount_code_id` (PK, FK): Mã giảm giá.
    *   `order_id` (PK, FK): Mã đơn hàng.
    *   `used_at`: Thời gian sử dụng.
*   **WishlistItem**:
    *   `wishlist_id` (PK, FK): Mã danh sách mong muốn.
    *   `product_id` (PK, FK): Mã sản phẩm.
*   **CollectionProduct**:
    *   `collection_id` (PK, FK): Mã bộ sưu tập.
    *   `product_id` (PK, FK): Mã sản phẩm.

### 2.4. Bước 4: Quyết định miền giá trị cho thuộc tính

*   **Product**:
    *   `id`: UUID hoặc INT AUTO_INCREMENT.
    *   `category_id`: UUID hoặc INT.
    *   `name`: VARCHAR(100).
    *   `description`: TEXT.
    *   `price`: DECIMAL.
    *   `stock`: INT.
    *   `tags`: VARCHAR(255) hoặc JSON.
    *   `color`: VARCHAR(50).
    *   `size`: VARCHAR(50).
    *   `material`: VARCHAR(100).
    *   `created_at`, `updated_at`: TIMESTAMP.
*   **Role**:
    *   `id`: UUID hoặc INT AUTO_INCREMENT.
    *   `name`: VARCHAR(50).
    *   `description`: TEXT.
    *   `created_at`, `updated_at`: TIMESTAMP.
*   **Permission**:
    *   `id`: UUID hoặc INT AUTO_INCREMENT.
    *   `name`: VARCHAR(50).
    *   `description`: TEXT.
    *   `created_at`, `updated_at`: TIMESTAMP.
*   **UserRole**:
    *   `user_id`: UUID hoặc INT (tương ứng với User.id).
    *   `role_id`: UUID hoặc INT (tương ứng với Role.id).
*   **RolePermission**:
    *   `role_id`: UUID hoặc INT (tương ứng với Role.id).
    *   `permission_id`: UUID hoặc INT (tương ứng với Permission.id).
*   **DiscountCodeUses**:
    *   `discount_code_id`: UUID hoặc INT (tương ứng với DiscountCode.id).
    *   `order_id`: UUID hoặc INT (tương ứng với Order.id).
    *   `used_at`: TIMESTAMP.
*   **WishlistItem**:
    *   `wishlist_id`: UUID hoặc INT (tương ứng với Wishlist.id).
    *   `product_id`: UUID hoặc INT (tương ứng với Product.id).
*   **ProductImage**:
    *   `id`: UUID hoặc INT AUTO_INCREMENT.
    *   `product_id`: UUID hoặc INT (tương ứng với Product.id).
    *   `image_url`: VARCHAR(255).
    *   `is_primary`: BOOLEAN.
    *   `created_at`, `updated_at`: TIMESTAMP.
*   **Collection**:
    *   `id`: UUID hoặc INT AUTO_INCREMENT.
    *   `name`: VARCHAR(100).
    *   `description`: TEXT.
    *   `created_at`, `updated_at`: TIMESTAMP.
*   **Favourite**:
    *   `id`: UUID hoặc INT AUTO_INCREMENT.
    *   `user_id`: UUID hoặc INT (tương ứng với User.id).
    *   `product_id`: UUID hoặc INT (tương ứng với Product.id).
    *   `created_at`: TIMESTAMP.
*   **CollectionProduct**:
    *   `collection_id`: UUID hoặc INT (tương ứng với Collection.id).
    *   `product_id`: UUID hoặc INT (tương ứng với Product.id).
*   **Các thuộc tính khác**:
    *   `id`: UUID hoặc INT AUTO_INCREMENT.
    *   `name`, `description`, `street`, `city`, `state`, `country`, `comment`: VARCHAR.
    *   `email`, `code`: VARCHAR (ràng buộc unique).
    *   `password`: VARCHAR (mã hóa).
    *   `role`, `status`, `method`: ENUM hoặc VARCHAR.
    *   `price`, `total_amount`, `amount`, `discount_percentage`, `min_order_value`: DECIMAL.
    *   `quantity`, `stock`, `max_uses`, `uses_count`, `rating`: INT.
    *   `is_default`: BOOLEAN.
    *   `created_at`, `updated_at`, `start_date`, `end_date`: TIMESTAMP.
    *   `postal_code`: VARCHAR.

### 2.5. Bước 5: Xác định thuộc tính khóa

*   **Product**: Khóa chính: `id`, khóa ngoại: `category_id` → `Category.id`.
*   **Role**: Khóa chính: `id`.
*   **Permission**: Khóa chính: `id`.
*   **UserRole**: Khóa chính tổ hợp: (`user_id`, `role_id`), khóa ngoại: `user_id` → `User.id`, `role_id` → `Role.id`.
*   **RolePermission**: Khóa chính tổ hợp: (`role_id`, `permission_id`), khóa ngoại: `role_id` → `Role.id`, `permission_id` → `Permission.id`.
*   **User**: Khóa chính: `id`.
*   **Category**: Khóa chính: `id`.
*   **Order**: Khóa chính: `id`, khóa ngoại: `user_id` → `User.id`.
*   **Cart**: Khóa chính: `id`, khóa ngoại: `user_id` → `User.id`.
*   **Address**: Khóa chính: `id`, khóa ngoại: `user_id` → `User.id`.
*   **Checkout**: Khóa chính: `id`, khóa ngoại: `order_id` → `Order.id`.
*   **Shipping**: Khóa chính: `id`, khóa ngoại: `order_id` → `Order.id`.
*   **Promotion**: Khóa chính: `id`.
*   **DiscountCode**: Khóa chính: `id`.
*   **DiscountCodeUses**: Khóa chính tổ hợp: (`discount_code_id`, `order_id`), khóa ngoại: `discount_code_id` → `DiscountCode.id`, `order_id` → `Order.id`.
*   **Review**: Khóa chính: `id`, khóa ngoại: `user_id` → `User.id`, `product_id` → `Product.id`.
*   **Wishlist**: Khóa chính: `id`, khóa ngoại: `user_id` → `User.id`.
*   **WishlistItem**: Khóa chính tổ hợp: (`wishlist_id`, `product_id`), khóa ngoại: `wishlist_id` → `Wishlist.id`, `product_id` → `Product.id`.
*   **ProductImage**: Khóa chính: `id`, khóa ngoại: `product_id` → `Product.id`.
*   **Collection**: Khóa chính: `id`.
*   **Favourite**: Khóa chính: `id`, khóa ngoại: `user_id` → `User.id`, `product_id` → `Product.id`.
*   **CollectionProduct**: Khóa chính tổ hợp: (`collection_id`, `product_id`), khóa ngoại: `collection_id` → `Collection.id`, `product_id` → `Product.id`.

### 2.6. Bước 6: Xác định ràng buộc (tỉ số, min-max, ràng buộc tham gia)

*   **User - Role** (qua UserRole):
    *   Tỉ số: N:M.
    *   Min-max: (0, N) cho User, (0, N) cho Role.
*   **Role - Permission** (qua RolePermission):
    *   Tỉ số: N:M.
    *   Min-max: (0, N) cho Role, (0, N) cho Permission.
*   **User - Address**:
    *   Tỉ số: 1:N.
    *   Min-max: Một người dùng có thể có 0 hoặc nhiều địa chỉ, một địa chỉ thuộc về đúng 1 người dùng.
*   **User - Order**:
    *   Tỉ số: 1:N.
    *   Min-max: Một người dùng có thể có 0 hoặc nhiều đơn hàng, một đơn hàng thuộc về 0 hoặc 1 người dùng (0 nếu là khách vãng lai).
*   **User - Cart**:
    *   Tỉ số: 1:1.
    *   Min-max: Một người dùng có đúng 1 giỏ hàng, một giỏ hàng thuộc về đúng 1 người dùng.
*   **User - Wishlist**:
    *   Tỉ số: 1:1.
    *   Min-max: Một người dùng có đúng 1 danh sách mong muốn, một danh sách thuộc về đúng 1 người dùng.
*   **User - Favourite**:
    *   Tỉ số: 1:N.
    *   Min-max: Một người dùng có thể có 0 hoặc nhiều sản phẩm yêu thích, một mục yêu thích thuộc về đúng 1 người dùng.
*   **Product - Category**:
    *   Tỉ số: N:1.
    *   Min-max: Một sản phẩm thuộc về đúng 1 danh mục, một danh mục có thể có 0 hoặc nhiều sản phẩm.
*   **Product - Review**:
    *   Tỉ số: 1:N.
    *   Min-max: Một sản phẩm có thể có 0 hoặc nhiều đánh giá, một đánh giá thuộc về đúng 1 sản phẩm.
*   **Product - ProductImage**:
    *   Tỉ số: 1:N.
    *   Min-max: Một sản phẩm có thể có 0 hoặc nhiều hình ảnh, một hình ảnh thuộc về đúng 1 sản phẩm.
*   **Product - Favourite**:
    *   Tỉ số: 1:N.
    *   Min-max: Một sản phẩm có thể được 0 hoặc nhiều người yêu thích, một mục yêu thích thuộc về đúng 1 sản phẩm.
*   **Collection - Product** (qua CollectionProduct):
    *   Tỉ số: N:M.
    *   Min-max: Một bộ sưu tập có thể chứa 0 hoặc nhiều sản phẩm, một sản phẩm có thể thuộc 0 hoặc nhiều bộ sưu tập.
*   **Order - Product**:
    *   Tỉ số: N:M (qua OrderDetail).
    *   Min-max: Một đơn hàng có thể chứa 1 hoặc nhiều sản phẩm, một sản phẩm có thể xuất hiện trong 0 hoặc nhiều đơn hàng.
*   **Order - Checkout**:
    *   Tỉ số: 1:1.
    *   Min-max: Một đơn hàng có đúng 1 thanh toán, một thanh toán thuộc về đúng 1 đơn hàng.
*   **Order - Shipping**:
    *   Tỉ số: 1:N.
    *   Min-max: Một đơn hàng có thể có 0 hoặc nhiều lô giao hàng, một lô giao hàng thuộc về đúng 1 đơn hàng.
*   **Cart - Product**:
    *   Tỉ số: N:M (qua CartItem).
    *   Min-max: Một giỏ hàng có thể chứa 0 hoặc nhiều sản phẩm, một sản phẩm có thể xuất hiện trong 0 hoặc nhiều giỏ hàng.
*   **Promotion - Product**:
    *   Tỉ số: N:M (qua PromotionProduct).
    *   Min-max: Một chương trình khuyến mãi áp dụng cho 0 hoặc nhiều sản phẩm, một sản phẩm có thể thuộc 0 hoặc nhiều chương trình khuyến mãi.
*   **DiscountCode - Order**:
    *   Tỉ số: N:M.
    *   Min-max: Một mã giảm giá có thể được dùng cho 0 hoặc nhiều đơn hàng, một đơn hàng dùng 0 hoặc nhiều mã giảm giá.
*   **Wishlist - Product**:
    *   Tỉ số: N:M (qua WishlistItem).
    *   Min-max: Một danh sách mong muốn có thể chứa 0 hoặc nhiều sản phẩm, một sản phẩm có thể nằm trong 0 hoặc nhiều danh sách mong muốn.


## ERD hệ thống

```mermaid
erDiagram
    %% Core User Management
    User {
        string id PK
        string username
        string email
        string password
        string full_name
        string phone
        timestamp created_at
        timestamp updated_at
    }
    
    Role {
        string id PK
        string name
        string description
        timestamp created_at
        timestamp updated_at
    }
    
    Permission {
        string id PK
        string name
        string description
        timestamp created_at
        timestamp updated_at
    }
    
    UserRole {
        string user_id PK,FK
        string role_id PK,FK
    }
    
    RolePermission {
        string role_id PK,FK
        string permission_id PK,FK
    }
    
    %% Product Management
    Product {
        string id PK
        string category_id FK
        string name
        text description
        decimal price
        int stock
        string tags
        string color
        string size
        string material
        timestamp created_at
        timestamp updated_at
    }
    
    Category {
        string id PK
        string name
        text description
        timestamp created_at
        timestamp updated_at
    }
    
    ProductImage {
        string id PK
        string product_id FK
        string image_url
        boolean is_primary
        timestamp created_at
        timestamp updated_at
    }
    
    Collection {
        string id PK
        string name
        text description
        timestamp created_at
        timestamp updated_at
    }
    
    CollectionProduct {
        string collection_id PK,FK
        string product_id PK,FK
    }
    
    %% Order Management
    Order {
        string id PK
        string user_id FK "nullable"
        string status
        decimal total_amount
        string discount_code_id FK "nullable"
        string contact_name "for guest"
        string contact_phone "for guest"
        string contact_address "for guest"
        string contact_email "for guest"
        timestamp created_at
        timestamp updated_at
    }
    
    OrderDetail {
        string order_id PK,FK
        string product_id PK,FK
        int quantity
        decimal price_at_purchase
    }
    
    %% Shopping Cart
    Cart {
        string id PK
        string user_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    CartItem {
        string cart_id PK,FK
        string product_id PK,FK
        int quantity
    }
    
    %% Address Management
    Address {
        string id PK
        string user_id FK
        string street
        string city
        string state
        string postal_code
        string country
        boolean is_default
        timestamp created_at
        timestamp updated_at
    }
    
    %% Payment & Shipping
    Checkout {
        string id PK
        string order_id FK
        decimal amount
        string method
        string status
        timestamp created_at
        timestamp updated_at
    }
    
    Shipping {
        string id PK
        string order_id FK
        string address_id FK
        string status
        string shipper_id FK "nullable"
        timestamp created_at
        timestamp updated_at
    }
    
    %% Promotions & Discounts
    Promotion {
        string id PK
        string name
        text description
        decimal discount_percentage
        timestamp start_date
        timestamp end_date
        timestamp created_at
        timestamp updated_at
    }
    
    PromotionProduct {
        string promotion_id PK,FK
        string product_id PK,FK
    }
    
    DiscountCode {
        string id PK
        string code UK
        string discount_type
        decimal discount_percentage
        int max_uses
        int uses_count
        decimal min_order_value
        timestamp start_date
        timestamp end_date
        timestamp created_at
        timestamp updated_at
    }
    
    DiscountCodeUses {
        string discount_code_id PK,FK
        string order_id PK,FK
        timestamp used_at
    }
    
    %% Reviews & Wishlist
    Review {
        string id PK
        string product_id FK
        string user_id FK
        int rating
        text comment
        timestamp created_at
        timestamp updated_at
    }
    
    Wishlist {
        string id PK
        string user_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    WishlistItem {
        string wishlist_id PK,FK
        string product_id PK,FK
    }
    
    Favourite {
        string id PK
        string user_id FK
        string product_id FK
        timestamp created_at
    }
    
    %% Relationships
    %% User Management Relationships
    User ||--o{ UserRole : "has roles"
    Role ||--o{ UserRole : "assigned to users"
    Role ||--o{ RolePermission : "has permissions"
    Permission ||--o{ RolePermission : "granted to roles"
    
    %% User to Other Entities
    User ||--o{ Address : "has addresses"
    User ||--o| Order : "places orders"
    User ||--|| Cart : "has cart"
    User ||--|| Wishlist : "has wishlist"
    User ||--o{ Favourite : "has favourites"
    User ||--o{ Review : "writes reviews"
    
    %% Product Relationships
    Category ||--o{ Product : "contains products"
    Product ||--o{ ProductImage : "has images"
    Product ||--o{ Review : "receives reviews"
    Product ||--o{ Favourite : "favorited by users"
    
    %% Collection Relationships
    Collection ||--o{ CollectionProduct : "contains products"
    Product ||--o{ CollectionProduct : "belongs to collections"
    
    %% Order Relationships
    Order ||--o{ OrderDetail : "contains items"
    Product ||--o{ OrderDetail : "ordered in orders"
    Order ||--|| Checkout : "has payment"
    Order ||--o{ Shipping : "has shipments"
    Address ||--o{ Shipping : "delivery address"
    User ||--o{ Shipping : "shipper"
    
    %% Cart Relationships
    Cart ||--o{ CartItem : "contains items"
    Product ||--o{ CartItem : "added to carts"
    
    %% Promotion Relationships
    Promotion ||--o{ PromotionProduct : "applies to products"
    Product ||--o{ PromotionProduct : "has promotions"
    
    %% Discount Code Relationships
    DiscountCode ||--o{ DiscountCodeUses : "used in orders"
    Order ||--o{ DiscountCodeUses : "uses discount codes"
    
    %% Wishlist Relationships
    Wishlist ||--o{ WishlistItem : "contains items"
    Product ||--o{ WishlistItem : "in wishlists"
```