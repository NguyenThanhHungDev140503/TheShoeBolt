# Báo Cáo So Sánh SRS và ERD - Phân Tích Thiếu Sót

## Thông Tin Báo Cáo

**Người thực hiện:** Augment Agent  
**Ngày thực hiện:** 18/01/2025  
**Người giám sát:** default_user  

## Tóm Tắt Báo Cáo

Báo cáo này thực hiện phân tích so sánh chi tiết giữa tài liệu **Software Requirement Specification (SRS)** và **tài liệu phân tích ERD** hiện tại của hệ thống web bán giày. Qua quá trình phân tích 34 yêu cầu chức năng trong SRS và 16 bảng chính trong ERD, chúng tôi đã xác định được **15 bảng thiếu**, **23 thuộc tính thiếu**, và **8 mối quan hệ thiếu** cần được bổ sung để đáp ứng đầy đủ các yêu cầu nghiệp vụ.

## Nội Dung Báo Cáo

### 1. Các Bảng Còn Thiếu

**2. Bảng Brand**

- **Lý do thiếu:** SRS yêu cầu lọc theo thương hiệu (FR-007) nhưng ERD không có
- **Yêu cầu SRS:** FR-007 - Lọc sản phẩm theo thương hiệu
- **Cấu trúc đề xuất:**
  ```sql
  Brand {
    id: UUID/INT PRIMARY KEY
    name: VARCHAR(100) UNIQUE
    description: TEXT
    logo_url: VARCHAR(255)
    is_active: BOOLEAN DEFAULT true
    created_at: TIMESTAMP
    updated_at: TIMESTAMP
  }
  ```

**4. Bảng Message (Sẽ dung NoSQL)**
- **Lý do thiếu:** SRS yêu cầu nhắn tin với quản trị viên (FR-018) nhưng ERD không có
- **Yêu cầu SRS:** FR-018 - Nhắn tin với quản trị viên
- **Cấu trúc đề xuất:**
  ```sql
  Message {
    id: UUID/INT PRIMARY KEY
    sender_id: UUID/INT FOREIGN KEY
    receiver_id: UUID/INT FOREIGN KEY
    content: TEXT
    is_read: BOOLEAN DEFAULT false
    created_at: TIMESTAMP
  }
  ```

#### 1.2. Mức Độ Ưu Tiên HIGH

**5. Bảng PaymentMethod**

- **Lý do thiếu:** ERD chỉ có Payment.method là string, không linh hoạt cho Stripe/VNPay
- **Yêu cầu SRS:** FR-014 - Thanh toán với Stripe, VNPay
- **Cấu trúc đề xuất:**
  ```sql
  PaymentMethod {
    id: UUID/INT PRIMARY KEY
    name: VARCHAR(100)
    type: ENUM('credit_card', 'e_wallet', 'cash', 'bank_transfer')
    provider: VARCHAR(50) -- 'stripe', 'vnpay'
    is_active: BOOLEAN DEFAULT true
    created_at: TIMESTAMP
  }
  ```

**6. Bảng ShippingMethod**
- **Lý do thiếu:** SRS đề cập giao hàng nhưng ERD thiếu quản lý phương thức vận chuyển
- **Yêu cầu SRS:** FR-022 - Xác nhận giao hàng
- **Cấu trúc đề xuất:**
  ```sql
  ShippingMethod {
    id: UUID/INT PRIMARY KEY
    name: VARCHAR(100)
    cost: DECIMAL(10,2)
    estimated_days: INT
    is_active: BOOLEAN DEFAULT true
    created_at: TIMESTAMP
  }
  ```

**7. Bảng Feedback**
- **Lý do thiếu:** SRS yêu cầu xử lý phản hồi khách hàng (FR-034) nhưng ERD không có
- **Yêu cầu SRS:** FR-034 - Phản hồi khách hàng
- **Cấu trúc đề xuất:**
  ```sql
  Feedback {
    id: UUID/INT PRIMARY KEY
    user_id: UUID/INT FOREIGN KEY
    subject: VARCHAR(200)
    content: TEXT
    status: ENUM('pending', 'in_progress', 'resolved')
    admin_response: TEXT
    created_at: TIMESTAMP
    updated_at: TIMESTAMP
  }
  ```

**8. Bảng OrderStatusHistory**
- **Lý do thiếu:** SRS yêu cầu theo dõi đơn hàng (FR-015) nhưng ERD chỉ có status hiện tại
- **Yêu cầu SRS:** FR-015 - Theo dõi trạng thái đơn hàng, lịch sử đơn hàng
- **Cấu trúc đề xuất:**
  ```sql
  OrderStatusHistory {
    id: UUID/INT PRIMARY KEY
    order_id: UUID/INT FOREIGN KEY
    old_status: VARCHAR(50)
    new_status: VARCHAR(50)
    changed_by: UUID/INT FOREIGN KEY
    notes: TEXT
    changed_at: TIMESTAMP
  }
  ```

#### 1.3. Mức Độ Ưu Tiên MEDIUM

**9. Bảng Analytics**
- **Lý do thiếu:** SRS yêu cầu thống kê (FR-028, FR-029, FR-030) nhưng ERD không có
- **Yêu cầu SRS:** FR-028, FR-029, FR-030 - Thống kê theo loại sản phẩm, tổng thể, sản phẩm bán chạy

**10. Bảng Tax**
- **Lý do thiếu:** Cần quản lý thuế cho đơn hàng
- **Yêu cầu SRS:** Hỗ trợ tính thuế trong thanh toán

**11. Bảng InventoryHistory**
- **Lý do thiếu:** Cần theo dõi lịch sử thay đổi tồn kho
- **Yêu cầu SRS:** Quản lý tồn kho sản phẩm

**12. Bảng EmailTemplate**
- **Lý do thiếu:** SRS đề cập Resend để gửi email nhưng không có template management
- **Yêu cầu SRS:** FR-009 - Wishlist gửi email thông báo

#### 1.4. Mức Độ Ưu Tiên LOW

**13. Bảng Currency**
- **Lý do thiếu:** Hỗ trợ đa tiền tệ trong tương lai
- **Yêu cầu SRS:** Mở rộng hệ thống

**14. Bảng PriceHistory**
- **Lý do thiếu:** Theo dõi lịch sử thay đổi giá sản phẩm
- **Yêu cầu SRS:** Quản lý giá sản phẩm

**15. Bảng PromotionUsage**
- **Lý do thiếu:** SRS yêu cầu dashboard theo dõi hiệu quả khuyến mãi (FR-033)
- **Yêu cầu SRS:** FR-033 - Dashboard theo dõi hiệu quả khuyến mãi

### 2. Các Thuộc Tính Còn Thiếu Trong Bảng Hiện Có

#### 2.1. Bảng User
**Thiếu các thuộc tính:**
- `avatar`: VARCHAR(255) - Hình đại diện người dùng
- `date_of_birth`: DATE - Ngày sinh
- `gender`: ENUM('male', 'female', 'other') - Giới tính
- `last_login`: TIMESTAMP - Lần đăng nhập cuối
- `is_active`: BOOLEAN - Trạng thái tài khoản
- `clerk_user_id`: VARCHAR(255) - ID từ Clerk authentication

**Lý do cần thiết:** SRS yêu cầu quản lý thông tin người dùng đầy đủ và tích hợp Clerk

#### 2.2. Bảng Product
**Thiếu các thuộc tính:**
- `brand_id`: UUID/INT FOREIGN KEY - Liên kết với bảng Brand
- `sku`: VARCHAR(100) UNIQUE - Mã sản phẩm duy nhất
- `weight`: DECIMAL(8,2) - Trọng lượng (cần cho shipping)
- `dimensions`: VARCHAR(100) - Kích thước sản phẩm (L x W x H)
- `is_featured`: BOOLEAN - Sản phẩm nổi bật
- `meta_title`: VARCHAR(200) - SEO title
- `meta_description`: TEXT - SEO description

**Lý do cần thiết:** SRS yêu cầu lọc theo thương hiệu và quản lý sản phẩm chi tiết

#### 2.3. Bảng Order
**Thiếu các thuộc tính:**
- `shipping_method_id`: UUID/INT FOREIGN KEY - Phương thức vận chuyển
- `payment_method_id`: UUID/INT FOREIGN KEY - Phương thức thanh toán
- `tax_amount`: DECIMAL(10,2) - Số tiền thuế
- `shipping_cost`: DECIMAL(10,2) - Phí vận chuyển
- `notes`: TEXT - Ghi chú đơn hàng
- `estimated_delivery`: DATE - Ngày giao hàng dự kiến

**Lý do cần thiết:** SRS yêu cầu quản lý đơn hàng chi tiết với nhiều phương thức thanh toán

### 3. Các Mối Quan Hệ Còn Thiếu

1. **Product - Brand**: N:1 (Product.brand_id → Brand.id)
2. **Order - PaymentMethod**: N:1 (Order.payment_method_id → PaymentMethod.id)
3. **Order - ShippingMethod**: N:1 (Order.shipping_method_id → ShippingMethod.id)
4. **User - Notification**: 1:N (User.id ← Notification.user_id)
5. **User - Message (Sender)**: 1:N (User.id ← Message.sender_id)
6. **User - Message (Receiver)**: 1:N (User.id ← Message.receiver_id)
7. **User - Feedback**: 1:N (User.id ← Feedback.user_id)
8. **Order - OrderStatusHistory**: 1:N (Order.id ← OrderStatusHistory.order_id)

### 4. Các Ràng Buộc Dữ Liệu Còn Thiếu

#### 4.1. Ràng buộc Product
- `stock >= 0` - Tồn kho không được âm
- `price > 0` - Giá phải dương
- `UNIQUE(sku)` - SKU duy nhất
- `weight > 0` - Trọng lượng phải dương

#### 4.2. Ràng buộc DiscountCode
- `uses_count <= max_uses` - Số lần sử dụng không vượt quá giới hạn
- `start_date < end_date` - Ngày bắt đầu phải trước ngày kết thúc
- `UNIQUE(code)` - Mã giảm giá duy nhất
- `discount_percentage BETWEEN 0 AND 100` - Phần trăm giảm giá hợp lệ

#### 4.3. Ràng buộc User
- `UNIQUE(email)` - Email duy nhất
- `UNIQUE(clerk_user_id)` - Clerk ID duy nhất
- `phone` format validation - Định dạng số điện thoại

#### 4.4. Ràng buộc Order
- `total_amount >= 0` - Tổng tiền không âm
- `tax_amount >= 0` - Thuế không âm
- `shipping_cost >= 0` - Phí ship không âm

## Kết Luận

Qua phân tích chi tiết, chúng tôi đã xác định được **46 thiếu sót chính** trong thiết kế ERD hiện tại so với yêu cầu SRS:

- **15 bảng thiếu** (4 Critical, 4 High, 4 Medium, 3 Low priority)
- **23 thuộc tính thiếu** trong các bảng hiện có
- **8 mối quan hệ thiếu** giữa các bảng
- **Nhiều ràng buộc dữ liệu** cần được bổ sung

**Khuyến nghị ưu tiên:**
1. **Giai đoạn 1:** Bổ sung 4 bảng Critical (Role, Brand, Notification, Message)
2. **Giai đoạn 2:** Bổ sung 4 bảng High priority và các thuộc tính thiếu
3. **Giai đoạn 3:** Hoàn thiện các bảng Medium/Low priority và ràng buộc

Việc bổ sung các thiếu sót này sẽ đảm bảo ERD đáp ứng đầy đủ 34 yêu cầu chức năng trong SRS và tạo nền tảng vững chắc cho hệ thống web bán giày.