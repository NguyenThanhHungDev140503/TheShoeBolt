-- Schema cho database theshoe (Đã sửa lỗi)

-- EXTENSION
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Bảng User
CREATE TABLE "User" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    sodienthoai VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Role
CREATE TABLE "Role" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng UserRole
CREATE TABLE "UserRole" (
    user_id UUID,
    role_id UUID,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES "User"(id),
    FOREIGN KEY (role_id) REFERENCES "Role"(id)
);

-- Bảng Category
CREATE TABLE "Category" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Product
CREATE TABLE "Product" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    stock_price DECIMAL(10,2) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL,
    category_id UUID REFERENCES "Category"(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng DiscountCode
CREATE TABLE "DiscountCode" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    discount_percentage DECIMAL(5,2) NOT NULL,
    max_uses INT NOT NULL,
    uses_count INT DEFAULT 0,
    min_order_value DECIMAL(10,2),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

-- Bảng Order
CREATE TABLE "Order" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES "User"(id),
    status VARCHAR(20) CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL,
    discount_code_id UUID REFERENCES "DiscountCode"(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng OrderDetail
CREATE TABLE "OrderDetail" (
    order_id UUID,
    product_id UUID,
    quantity INT,
    price_at_purchase DECIMAL(10,2),
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES "Order"(id),
    FOREIGN KEY (product_id) REFERENCES "Product"(id)
);

-- Bảng Address
CREATE TABLE "Address" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES "User"(id) NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng PaymentMethod
CREATE TABLE "PaymentMethod" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(50),
    fee_percent NUMERIC(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Payment 
CREATE TABLE "Payment" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES "Order"(id) NOT NULL,
    payment_method_id UUID REFERENCES "PaymentMethod"(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'processing', 'success', 'failed', 'cancelled', 'refunded')) DEFAULT 'pending',
    provider_txn_id VARCHAR(255),
    provider_fee DECIMAL(10,2) DEFAULT 0,
    metadata JSONB,
    paid_at TIMESTAMP,
    idempotency_key UUID UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Shipping
CREATE TABLE "Shipping" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES "Order"(id) NOT NULL,
    address_id UUID REFERENCES "Address"(id) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'shipping', 'delivered')),
    shipper_id UUID REFERENCES "User"(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Promotion
CREATE TABLE "Promotion" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    discount_percentage DECIMAL(5,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Review
CREATE TABLE "Review" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES "Product"(id) NOT NULL,
    user_id UUID REFERENCES "User"(id) NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Wishlist
CREATE TABLE "Wishlist" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES "User"(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Cart
CREATE TABLE "Cart" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES "User"(id) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng CartItem
CREATE TABLE "CartItem" (
    cart_id UUID REFERENCES "Cart"(id),
    product_id UUID REFERENCES "Product"(id),
    quantity INT NOT NULL,
    PRIMARY KEY (cart_id, product_id)
);

-- Bảng PromotionProduct
CREATE TABLE "PromotionProduct" (
    promotion_id UUID REFERENCES "Promotion"(id),
    product_id UUID REFERENCES "Product"(id),
    PRIMARY KEY (promotion_id, product_id)
);

-- Bảng Permission
CREATE TABLE "Permission" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng RolePermission
CREATE TABLE "RolePermission" (
    role_id UUID REFERENCES "Role"(id),
    permission_id UUID REFERENCES "Permission"(id),
    PRIMARY KEY (role_id, permission_id)
);

-- INDEXES

-- Bảng Order
CREATE INDEX idx_order_user ON "Order" (user_id);
CREATE INDEX idx_order_discount_code ON "Order" (discount_code_id);
CREATE INDEX idx_order_status ON "Order" (status);
CREATE INDEX idx_order_created_at ON "Order" (created_at);

-- Bảng Product
CREATE INDEX idx_product_category ON "Product" (category_id);
CREATE INDEX idx_product_price ON "Product" (price);
CREATE INDEX idx_product_stock ON "Product" (stock_quantity);
CREATE INDEX idx_product_category_price ON "Product" (category_id, price);

-- Bảng Address
CREATE INDEX idx_address_user ON "Address" (user_id);
CREATE INDEX idx_address_user_default ON "Address" (user_id, is_default);

-- Bảng Payment
CREATE INDEX idx_payment_order ON "Payment" (order_id);
CREATE INDEX idx_payment_status ON "Payment" (status);
CREATE INDEX idx_payment_method ON "Payment"(payment_method_id);
CREATE INDEX idx_payment_provider_txn ON "Payment"(provider_txn_id);
CREATE INDEX idx_payment_paid_at ON "Payment"(paid_at);
CREATE INDEX idx_payment_idempotency ON "Payment"(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX idx_payment_metadata ON "Payment" USING GIN (metadata);
CREATE INDEX idx_payment_status_paid_at ON "Payment"(status, paid_at);
CREATE INDEX idx_payment_method_status ON "Payment"(payment_method_id, status);

-- Bảng PaymentMethod
CREATE INDEX idx_payment_method_code ON "PaymentMethod"(code);
CREATE INDEX idx_payment_method_active ON "PaymentMethod"(is_active);

-- Bảng Shipping
CREATE INDEX idx_shipping_order ON "Shipping" (order_id);
CREATE INDEX idx_shipping_address ON "Shipping" (address_id);
CREATE INDEX idx_shipping_shipper ON "Shipping" (shipper_id);
CREATE INDEX idx_shipping_status ON "Shipping" (status);
CREATE INDEX idx_shipping_shipper_status ON "Shipping" (shipper_id, status);

-- Bảng Review
CREATE INDEX idx_review_product ON "Review" (product_id);
CREATE INDEX idx_review_user ON "Review" (user_id);

-- Bảng Wishlist
CREATE INDEX idx_wishlist_user ON "Wishlist" (user_id);

-- Bảng Cart
CREATE INDEX idx_cart_user ON "Cart" (user_id);

-- Bảng OrderDetail
CREATE INDEX idx_orderdetail_product ON "OrderDetail" (product_id);

-- Bảng CartItem
CREATE INDEX idx_cartitem_cart ON "CartItem" (cart_id);
CREATE INDEX idx_cartitem_product ON "CartItem" (product_id);

-- Bảng PromotionProduct
CREATE INDEX idx_promotionproduct_promotion ON "PromotionProduct" (promotion_id);
CREATE INDEX idx_promotionproduct_product ON "PromotionProduct" (product_id);

-- Bảng DiscountCode
CREATE INDEX idx_discountcode_dates ON "DiscountCode" (start_date, end_date);

-- Bảng Promotion
CREATE INDEX idx_promotion_dates ON "Promotion" (start_date, end_date);

-- Bảng UserRole
CREATE INDEX idx_userrole_composite ON "UserRole" (user_id, role_id);
CREATE INDEX idx_userrole_user ON "UserRole" (user_id);
CREATE INDEX idx_userrole_role ON "UserRole" (role_id);

-- Comments cho bảng PaymentMethod
COMMENT ON TABLE "PaymentMethod" IS 'Bảng master quản lý các phương thức thanh toán';
COMMENT ON COLUMN "PaymentMethod".code IS 'Mã định danh duy nhất cho phương thức (stripe, vnpay, cod, momo)';
COMMENT ON COLUMN "PaymentMethod".name IS 'Tên hiển thị của phương thức thanh toán';
COMMENT ON COLUMN "PaymentMethod".provider IS 'Nhà cung cấp dịch vụ thanh toán (Stripe, VNPay, MoMo...)';
COMMENT ON COLUMN "PaymentMethod".fee_percent IS 'Phần trăm phí giao dịch của provider';
COMMENT ON COLUMN "PaymentMethod".is_active IS 'Trạng thái kích hoạt của phương thức thanh toán';

-- Comments cho bảng Payment
COMMENT ON TABLE "Payment" IS 'Bảng detail lưu trữ thông tin thanh toán chi tiết';
COMMENT ON COLUMN "Payment".provider_txn_id IS 'ID giao dịch từ provider (stripe_payment_intent_id, vnp_txn_ref, etc.)';
COMMENT ON COLUMN "Payment".provider_fee IS 'Phí giao dịch thực tế từ provider';
COMMENT ON COLUMN "Payment".metadata IS 'Dữ liệu JSON lưu thông tin bổ sung của provider';
COMMENT ON COLUMN "Payment".paid_at IS 'Thời điểm thanh toán được xác nhận thành công';
COMMENT ON COLUMN "Payment".idempotency_key IS 'Key đảm bảo tính idempotent cho API calls';

-- Cập nhật prepared statements cho payment
PREPARE get_payment_by_order (UUID) AS
    SELECT p.id, p.order_id, p.amount, p.status, 
           p.provider_txn_id, p.provider_fee, p.metadata, p.paid_at, p.created_at,
           pm.code as method_code, pm.name as method_name, pm.provider
    FROM "Payment" p
    JOIN "PaymentMethod" pm ON p.payment_method_id = pm.id
    WHERE p.order_id = $1;

PREPARE get_payment_by_id (UUID) AS
    SELECT p.id, p.order_id, p.amount, p.status, 
           p.provider_txn_id, p.provider_fee, p.metadata, p.paid_at, p.created_at,
           pm.code as method_code, pm.name as method_name, pm.provider
    FROM "Payment" p
    JOIN "PaymentMethod" pm ON p.payment_method_id = pm.id
    WHERE p.id = $1;

PREPARE get_active_payment_methods AS
    SELECT id, code, name, provider, fee_percent, is_active
    FROM "PaymentMethod"
    WHERE is_active = TRUE
    ORDER BY name;

-- Báo cáo doanh thu theo phương thức thanh toán
PREPARE payment_revenue_report (DATE, DATE) AS
    SELECT pm.name as payment_method,
           pm.provider,
           COUNT(p.id) as transaction_count,
           SUM(p.amount) as total_amount,
           SUM(p.provider_fee) as total_fees,
           SUM(p.amount - COALESCE(p.provider_fee, 0)) as net_revenue
    FROM "Payment" p
    JOIN "PaymentMethod" pm ON p.payment_method_id = pm.id
    WHERE p.status = 'success' 
      AND p.paid_at::DATE BETWEEN $1 AND $2
    GROUP BY pm.id, pm.name, pm.provider
    ORDER BY total_amount DESC;

-- Prepared statement cho order với payment info
PREPARE get_order_with_payment (UUID) AS
    SELECT o.id, o.user_id, o.status, o.total_amount, o.created_at,
           p.id as payment_id, p.amount as payment_amount, p.status as payment_status,
           pm.name as payment_method, pm.provider as payment_provider
    FROM "Order" o
    LEFT JOIN "Payment" p ON o.id = p.order_id
    LEFT JOIN "PaymentMethod" pm ON p.payment_method_id = pm.id
    WHERE o.id = $1;

-- Tìm kiếm payments theo provider transaction ID
PREPARE get_payment_by_provider_txn (VARCHAR) AS
    SELECT p.id, p.order_id, p.amount, p.status, p.provider_txn_id,
           pm.code, pm.provider
    FROM "Payment" p
    JOIN "PaymentMethod" pm ON p.payment_method_id = pm.id
    WHERE p.provider_txn_id = $1;