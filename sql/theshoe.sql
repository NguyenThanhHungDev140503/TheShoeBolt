-- Kích hoạt extension unaccent nếu chưa có
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Tạo bảng User
CREATE TABLE "User" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    sodienthoai VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng Role
CREATE TABLE "Role" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng UserRole
CREATE TABLE "UserRole" (
    user_id UUID,
    role_id UUID,
    PRIMARY KEY (user_id, role_id),
    user_id UUID REFERENCES "User"(id),
    role_id UUID REFERENCES "Role"(id)
);

-- Tạo bảng Category
CREATE TABLE "Category" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng Product
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

-- Tạo bảng DiscountCode
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

-- Tạo bảng Order
CREATE TABLE "Order" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES "User"(id),
    status VARCHAR(20) CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL,
    discount_code_id UUID REFERENCES "DiscountCode"(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng OrderDetail
CREATE TABLE "OrderDetail" (
    order_id UUID,
    product_id UUID,
    quantity INT,
    price_at_purchase DECIMAL(10,2),
    PRIMARY KEY (order_id, product_id),
    order_id UUID REFERENCES "Order"(id),
    product_id UUID REFERENCES "Product"(id)
);

-- Tạo bảng Address
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

-- Tạo bảng Payment
CREATE TABLE "Payment" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES "Order"(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method VARCHAR(50) CHECK (method IN ('credit_card', 'ewallet', 'cash')),
    status VARCHAR(20) CHECK (status IN ('success', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng Shipping
CREATE TABLE "Shipping" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES "Order"(id) NOT NULL,
    address_id UUID REFERENCES "Address"(id) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'shipping', 'delivered')),
    shipper_id UUID REFERENCES "User"(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng Promotion
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

-- Tạo bảng Review
CREATE TABLE "Review" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES "Product"(id) NOT NULL,
    user_id UUID REFERENCES "User"(id) NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng Wishlist
CREATE TABLE "Wishlist" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES "User"(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng Cart
CREATE TABLE "Cart" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES "User"(id) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng trung gian CartItem (N:M)
CREATE TABLE "CartItem" (
    cart_id UUID REFERENCES "Cart"(id),
    product_id UUID REFERENCES "Product"(id),
    quantity INT NOT NULL,
    PRIMARY KEY (cart_id, product_id)
);

-- Bảng trung gian PromotionProduct (N:M)
CREATE TABLE "PromotionProduct" (
    promotion_id UUID REFERENCES "Promotion"(id),
    product_id UUID REFERENCES "Product"(id),
    PRIMARY KEY (promotion_id, product_id)
);

-- Tạo bảng Permission
CREATE TABLE "Permission" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng trung gian RolePermission (N:M)
CREATE TABLE "RolePermission" (
    role_id UUID REFERENCES "Role"(id),
    permission_id UUID REFERENCES "Permission"(id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE OR REPLACE PROCEDURE sp_update_order_status(
    p_order_id UUID,
    p_new_status VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Từ 1. Stored Procedures (SP) Hợp Lệ trong file đã cung cấp hãy viết plsql trong postgres
    -- Kiểm tra xem trạng thái mới có hợp lệ không (tùy chọn, có thể thêm kiểm tra dựa trên CHECK constraint)
    IF p_new_status NOT IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled') THEN
        RAISE EXCEPTION 'Trạng thái đơn hàng không hợp lệ: %', p_new_status;
    END IF;

    UPDATE "Order"
    SET status = p_new_status,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy đơn hàng với ID: %', p_order_id;
    END IF;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_remove_from_cart(
    p_cart_id UUID,
    p_product_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM "CartItem"
    WHERE cart_id = p_cart_id AND product_id = p_product_id;

    IF NOT FOUND THEN
        RAISE WARNING 'Không tìm thấy sản phẩm (ID: %) trong giỏ hàng (ID: %)', p_product_id, p_cart_id;
    END IF;

    -- Cập nhật thời gian updated_at cho giỏ hàng (tùy chọn)
    UPDATE "Cart"
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = p_cart_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_add_address(
    p_user_id UUID,
    p_street VARCHAR(255),
    p_city VARCHAR(100),
    p_postal_code VARCHAR(20),
    p_is_default BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Kiểm tra user tồn tại
    IF NOT EXISTS (SELECT 1 FROM "User" WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'Người dùng không tồn tại';
    END IF;

    IF p_is_default THEN
        UPDATE "Address"
        SET is_default = false
        WHERE user_id = p_user_id;
    END IF;

    INSERT INTO "Address" (user_id, street, city, postal_code, is_default)
    VALUES (p_user_id, p_street, p_city, p_postal_code, p_is_default);
END;
$$;

CREATE OR REPLACE PROCEDURE sp_set_default_address(
    p_user_id UUID,
    p_address_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Bỏ cờ mặc định cho tất cả địa chỉ khác của người dùng
    UPDATE "Address"
    SET is_default = false,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id AND id <> p_address_id AND is_default = true;

    -- Đặt cờ mặc định cho địa chỉ được chỉ định
    UPDATE "Address"
    SET is_default = true,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_address_id AND user_id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy địa chỉ với ID: % cho người dùng ID: %', p_address_id, p_user_id;
    END IF;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_create_payment(
    p_order_id UUID,
    p_amount DECIMAL(10,2),
    p_method VARCHAR(50),
    p_status VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Kiểm tra giá trị hợp lệ cho method và status (tùy chọn, có thể thêm kiểm tra dựa trên CHECK constraint)
    IF p_method NOT IN ('credit_card', 'ewallet', 'cash') THEN
        RAISE EXCEPTION 'Phương thức thanh toán không hợp lệ: %', p_method;
    END IF;
    IF p_status NOT IN ('success', 'failed') THEN
        RAISE EXCEPTION 'Trạng thái thanh toán không hợp lệ: %', p_status;
    END IF;

    INSERT INTO "Payment" (order_id, amount, method, status)
    VALUES (p_order_id, p_amount, p_method, p_status);
END;
$$;

CREATE OR REPLACE PROCEDURE sp_update_payment_status(
    p_payment_id UUID,
    p_new_status VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Kiểm tra giá trị hợp lệ cho status (tùy chọn)
    IF p_new_status NOT IN ('success', 'failed') THEN
        RAISE EXCEPTION 'Trạng thái thanh toán không hợp lệ: %', p_new_status;
    END IF;

    UPDATE "Payment"
    SET status = p_new_status
    -- Không cập nhật updated_at vì bảng Payment không có trường này, chỉ có created_at
    WHERE id = p_payment_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy thanh toán với ID: %', p_payment_id;
    END IF;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_assign_shipper(
    p_order_id UUID,
    p_shipper_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Kiểm tra shipper có role phù hợp
    IF NOT EXISTS (
        SELECT 1 FROM "UserRole" ur
        JOIN "Role" r ON ur.role_id = r.id
        WHERE ur.user_id = p_shipper_id AND r.name = 'shipper'
    ) THEN
        RAISE EXCEPTION 'Người dùng không phải shipper';
    END IF;

    UPDATE "Shipping"
    SET shipper_id = p_shipper_id
    WHERE order_id = p_order_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_update_shipping_status(
    p_shipping_id UUID,
    p_new_status VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Kiểm tra giá trị hợp lệ cho status (tùy chọn)
    IF p_new_status NOT IN ('pending', 'shipping', 'delivered') THEN
        RAISE EXCEPTION 'Trạng thái giao hàng không hợp lệ: %', p_new_status;
    END IF;

    UPDATE "Shipping"
    SET status = p_new_status,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_shipping_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy bản ghi giao hàng với ID: %', p_shipping_id;
    END IF;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_register_user(
    p_name VARCHAR(100),
    p_email VARCHAR(255),
    p_sodienthoai VARCHAR(20),
    p_hashed_password VARCHAR(255) -- Nhận mật khẩu đã được mã hóa
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_new_user_id UUID;
BEGIN
    -- Kiểm tra email và số điện thoại đã tồn tại chưa (có thể xử lý lỗi UNIQUE constraint)
    IF EXISTS (SELECT 1 FROM "User" WHERE email = p_email) THEN
        RAISE EXCEPTION 'Email đã tồn tại: %', p_email;
    END IF;
    IF EXISTS (SELECT 1 FROM "User" WHERE sodienthoai = p_sodienthoai) THEN
        RAISE EXCEPTION 'Số điện thoại đã tồn tại: %', p_sodienthoai;
    END IF;

    INSERT INTO "User" (name, email, sodienthoai, password)
    VALUES (p_name, p_email, p_sodienthoai, p_hashed_password)
    RETURNING id INTO v_new_user_id;

    -- Có thể trả về ID người dùng mới nếu cần
    -- RAISE NOTICE 'Đã đăng ký người dùng mới với ID: %', v_new_user_id;

    -- Tự động tạo giỏ hàng cho người dùng mới
    INSERT INTO "Cart" (user_id) VALUES (v_new_user_id);
    -- Tự động tạo danh sách yêu thích cho người dùng mới
    INSERT INTO "Wishlist" (user_id) VALUES (v_new_user_id);

END;
$$;

CREATE OR REPLACE PROCEDURE sp_update_user_profile(
    p_user_id UUID,
    p_name VARCHAR(100)
    -- Có thể thêm các trường khác cần cập nhật nếu muốn, ví dụ: avatar_url,...
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE "User"
    SET name = p_name,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy người dùng với ID: %', p_user_id;
    END IF;
END;
$$;


CREATE OR REPLACE FUNCTION fn_check_stock(
    p_product_id UUID,
    p_requested_quantity INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_stock INT;
BEGIN
    SELECT stock_quantity INTO v_current_stock
    FROM "Product"
    WHERE id = p_product_id;

    IF NOT FOUND THEN
        -- Xử lý trường hợp không tìm thấy sản phẩm (có thể trả về FALSE hoặc raise exception)
        RETURN FALSE;
        -- RAISE EXCEPTION 'Không tìm thấy sản phẩm với ID: %', p_product_id;
    END IF;

    RETURN v_current_stock >= p_requested_quantity;
END;
$$;

-- Cách sử dụng ví dụ:
-- SELECT fn_check_stock('your-product-uuid', 5);

CREATE OR REPLACE FUNCTION fn_search_products(
    p_search_term TEXT DEFAULT NULL,         -- Từ khóa tìm kiếm trong tên hoặc mô tả
    p_category_id UUID DEFAULT NULL,         -- Lọc theo ID danh mục
    p_min_price DECIMAL(10, 2) DEFAULT NULL, -- Giá tối thiểu
    p_max_price DECIMAL(10, 2) DEFAULT NULL  -- Giá tối đa
)
RETURNS SETOF "Product" -- Trả về một tập hợp các dòng từ bảng Product
LANGUAGE sql STABLE -- STABLE vì nó không sửa đổi dữ liệu và luôn trả về kết quả giống nhau cho cùng input trong một transaction
AS $$
SELECT *
FROM "Product"
WHERE
    (p_search_term IS NULL OR name ILIKE '%' || p_search_term || '%' OR description ILIKE '%' || p_search_term || '%')
AND
    (p_category_id IS NULL OR category_id = p_category_id)
AND
    (p_min_price IS NULL OR price >= p_min_price)
AND
    (p_max_price IS NULL OR price <= p_max_price)
ORDER BY created_at DESC; -- Sắp xếp theo sản phẩm mới nhất (tùy chọn)
$$;

-- Cách sử dụng ví dụ:
-- SELECT * FROM fn_search_products(p_search_term := 'áo', p_max_price := 500.00);
-- SELECT * FROM fn_search_products(p_category_id := 'your-category-uuid');
-- SELECT * FROM fn_search_products(p_min_price := 100.00, p_max_price := 200.00);

-- Tạo các index

-- Bảng Order
CREATE INDEX idx_order_user ON "Order" (user_id);
CREATE INDEX idx_order_discount_code ON "Order" (discount_code_id);
CREATE INDEX idx_order_status ON "Order" (status);
CREATE INDEX idx_order_created_at ON "Order" (created_at);

-- Bảng Product
CREATE INDEX idx_product_category ON "Product" (category_id);

-- Bảng Address
CREATE INDEX idx_address_user ON "Address" (user_id);

-- Bảng Payment
CREATE INDEX idx_payment_order ON "Payment" (order_id);

-- Bảng Shipping
CREATE INDEX idx_shipping_order ON "Shipping" (order_id);
CREATE INDEX idx_shipping_address ON "Shipping" (address_id);
CREATE INDEX idx_shipping_shipper ON "Shipping" (shipper_id);

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

-- Thêm các index mới
-- Address
CREATE INDEX idx_address_user_default ON "Address" (user_id, is_default);

-- Payment
CREATE INDEX idx_payment_status ON "Payment" (status);

-- Shipping
CREATE INDEX idx_shipping_status ON "Shipping" (status);
CREATE INDEX idx_shipping_shipper_status ON "Shipping" (shipper_id, status);

-- DiscountCode
CREATE INDEX idx_discountcode_dates ON "DiscountCode" (start_date, end_date);

-- Promotion
CREATE INDEX idx_promotion_dates ON "Promotion" (start_date, end_date);

-- UserRole
CREATE INDEX idx_userrole_composite ON "UserRole" (user_id, role_id);

-- Tạo các index cho truy vấn thường xuyên

-- User:
-- Index cho vai trò (role) thông qua bảng UserRole
-- Tạo index cho user_id (đã là một phần của PK tổ hợp, nhưng có thể cần index riêng)
CREATE INDEX idx_userrole_user ON "UserRole" (user_id);

-- Tạo index cho role_id để tối ưu truy vấn lọc theo vai trò
CREATE INDEX idx_userrole_role ON "UserRole" (role_id);

-- 3. Composite index cho cả user_id và role_id (nếu cần truy vấn kết hợp)
CREATE INDEX idx_userrole_user_role ON "UserRole" (user_id, role_id);

-- Product:

-- 1. Tạo Full-Text Index cho cột name (và description nếu cần tìm kiếm cả mô tả)
-- Sử dụng GIN index với cấu hình 'simple' để hỗ trợ tìm kiếm đa ngôn ngữ (bao gồm tiếng Việt cơ bản)
CREATE INDEX idx_product_name_fts ON "Product"
USING GIN (to_tsvector(to_tsvector('vietnamese_unaccent', name) || ' ' || COALESCE(to_tsvector('vietnamese_unaccent', name), '')))
WHERE description IS NOT NULL; -- Chỉ index nếu description tồn tại (tùy chọn)

-- 2. Index cho khóa ngoại category_id
CREATE INDEX idx_product_category ON "Product" (category_id);

-- 3. Index cho cột price (B-tree phù hợp cho khoảng giá)
CREATE INDEX idx_product_price ON "Product" (price);

-- 4. Index cho cột stock_quantity (kiểm tra tồn kho nhanh)
CREATE INDEX idx_product_stock ON "Product" (stock_quantity);

-- 5. Composite Index cho các truy vấn phức tạp (Ví dụ: lọc theo danh mục và giá)
CREATE INDEX idx_product_category_price ON "Product" (category_id, price);

-- Category:
-- Index cho cột name để tìm kiếm/lọc (Tối ưu cho tìm kiếm text tiếng Việt với unaccent)
-- Index này giả định configuration 'vietnamese_unaccent' hoặc tương tự đã tồn tại, hoặc sử dụng unaccent trực tiếp.
CREATE INDEX idx_category_name_fts ON "Category" USING GIN (to_tsvector('vietnamese_unaccent', name)); -- Sử dụng unaccent trực tiếp

-- Các Prepare Statement cần thiết 

-- Kích hoạt extension unaccent nếu chưa có
-- (Đã có trong DDL cung cấp, chỉ để tham khảo)
-- CREATE EXTENSION IF NOT EXISTS unaccent;

----------------------------------------------------------------------
-- 1. Truy vấn thông tin Người Dùng
----------------------------------------------------------------------

-- Mục đích: Lấy thông tin người dùng bằng ID, Email, hoặc Số điện thoại.
-- Tần suất: Rất cao.
-- Tham số: $1: user_id (UUID), $2: email (VARCHAR), $3: sodienthoai (VARCHAR)
-- Cách dùng: Truyền giá trị cho tiêu chí cần tìm và NULL cho các tiêu chí còn lại.
PREPARE get_user_by_identity (UUID, VARCHAR, VARCHAR) AS
    SELECT id, name, email, sodienthoai, password, created_at, updated_at -- Luôn lấy password
    FROM "User"
    WHERE
        ($1 IS NOT NULL AND id = $1) OR          -- Nếu $1 (id) được cung cấp, tìm theo id
        ($2 IS NOT NULL AND email = $2) OR       -- Nếu $2 (email) được cung cấp, tìm theo email
        ($3 IS NOT NULL AND sodienthoai = $3)    -- Nếu $3 (sodienthoai) được cung cấp, tìm theo số điện thoại
    LIMIT 1; -- Vì id, email, sodienthoai là UNIQUE, chỉ cần lấy 1 bản ghi.

----------------------------------------------------------------------
-- 2. Truy vấn lấy thông tin Sản Phẩm
----------------------------------------------------------------------

-- Purpose: Search products with flexible filtering and pagination
-- Frequency: High (product searches)
-- Parameters:
--   p_search_term: Text to search in name/description (NULL to skip)
--   p_category_id: Filter by category ID (NULL for all categories)
--   p_min_price: Minimum price filter (NULL to disable)
--   p_max_price: Maximum price filter (NULL to disable)
--   p_limit: Results per page (NULL for no limit)
--   p_offset: Pagination offset (NULL starts from 0)
-- Returns: Matching products sorted by creation date (newest first)
-- Notes: Uses unaccent for diacritic-insensitive search
PREPARE search_products (TEXT, UUID, DECIMAL, DECIMAL, INT, INT) AS
    SELECT *
    FROM "Product"
    WHERE
        ($1 IS NULL OR
         to_tsvector('vietnamese_unaccent', name) @@ to_tsquery('simple', unaccent($1)) OR
         to_tsvector('vietnamese_unaccent', description) @@ to_tsquery('simple', unaccent($1)))
    AND ($2 IS NULL OR category_id = $2)
    AND ($3 IS NULL OR price >= $3)
    AND ($4 IS NULL OR price <= $4)
    ORDER BY created_at DESC
    LIMIT COALESCE($5, 1000) -- Default limit if NULL
    OFFSET COALESCE($6, 0);  -- Default offset if NULL

-- Purpose: Update product stock quantity (increase/decrease)
-- Frequency: High (on purchases, cancellations, restocks)
-- Parameters:
--   p_product_id: Product to update
--   p_quantity_change: Positive to add stock, negative to remove
-- Returns: Updated product info including new stock level
-- Throws: If product not found or stock would go negative
PREPARE update_product_stock (UUID, INT) AS
    UPDATE "Product"
    SET stock_quantity = stock_quantity + $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    AND (stock_quantity + $2) >= 0 -- Prevent negative stock
    RETURNING 
        id, 
        name, 
        stock_quantity AS new_quantity,
        price,
        category_id;

-- Purpose: Get reviews for a product with filtering options
-- Frequency: High (product detail views)
-- Parameters:
--   p_product_id: Product to get reviews for
--   p_min_rating: Minimum rating to include (NULL for all)
--   p_limit: Results per page (NULL for no limit)
--   p_offset: Pagination offset (NULL starts from 0)
-- Returns: Reviews with user info, sorted newest first
PREPARE get_product_reviews (UUID, INT, INT, INT) AS
    SELECT 
        r.id, 
        r.rating, 
        r.comment, 
        r.created_at, 
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email
    FROM "Review" r
    JOIN "User" u ON r.user_id = u.id
    WHERE 
        r.product_id = $1
        AND ($2 IS NULL OR r.rating >= $2)
    ORDER BY r.created_at DESC
    LIMIT COALESCE($3, 20) -- Default to 20 reviews per page
    OFFSET COALESCE($4, 0); -- Default to first page

----------------------------------------------------------------------
-- 3. Truy vấn Lấy Đơn Hàng Theo Trạng Thái
----------------------------------------------------------------------

PREPARE get_orders_by_status (UUID, VARCHAR, INT, INT) AS
    SELECT 
        id, 
        user_id, 
        status, 
        total_amount,
        created_at,
        updated_at
    FROM "Order"
    WHERE
        (user_id = $1 OR $1 IS NULL) -- $1 is NULL for admin queries
    AND status = $2
    ORDER BY created_at DESC
    LIMIT $3 OFFSET $4; -- Added pagination support

----------------------------------------------------------------------
-- 3.1. Xử lý Đơn hàng (Order Processing)
----------------------------------------------------------------------

-- Tạo đơn hàng mới (Giả sử discount code có thể là NULL)
PREPARE create_order (UUID, VARCHAR, DECIMAL, UUID) AS
    WITH inserted_order AS (
        INSERT INTO "Order" (user_id, status, total_amount, discount_code_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    )
    SELECT id FROM inserted_order;

-- Thêm chi tiết đơn hàng
PREPARE add_order_detail (UUID, UUID, INT, DECIMAL) AS
    INSERT INTO "OrderDetail" (order_id, product_id, quantity, price_at_purchase)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (order_id, product_id) 
    DO UPDATE SET 
        quantity = EXCLUDED.quantity,
        price_at_purchase = EXCLUDED.price_at_purchase;

-- Lấy các đơn hàng của một người dùng cụ thể
PREPARE get_user_orders (UUID, INT, INT) AS
    SELECT 
        o.id, 
        o.status, 
        o.total_amount, 
        o.created_at,
        COUNT(od.*) AS item_count,
        MIN(p.name) AS sample_product_name
    FROM "Order" o
    LEFT JOIN "OrderDetail" od ON o.id = od.order_id
    LEFT JOIN "Product" p ON od.product_id = p.id
    WHERE o.user_id = $1
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT $2 OFFSET $3;

-- Lấy thông tin cơ bản của một đơn hàng
PREPARE get_order_info (UUID) AS
    SELECT 
        o.*,
        u.name AS user_name,
        u.email AS user_email,
        dc.code AS discount_code
    FROM "Order" o
    LEFT JOIN "User" u ON o.user_id = u.id
    LEFT JOIN "DiscountCode" dc ON o.discount_code_id = dc.id
    WHERE o.id = $1;

-- Lấy các sản phẩm (chi tiết) trong một đơn hàng
PREPARE get_order_details (UUID) AS
    SELECT 
        od.product_id, 
        od.quantity, 
        od.price_at_purchase, 
        p.name AS product_name,
        p.price AS current_price,
        (od.price_at_purchase * od.quantity) AS line_total,
    FROM "OrderDetail" od
    JOIN "Product" p ON od.product_id = p.id
    WHERE od.order_id = $1
    ORDER BY p.name;

----------------------------------------------------------------------
-- 4. Optimized Cart Operations
----------------------------------------------------------------------

-- Purpose: Add/update item in cart with stock validation
-- Parameters: 
--   $1: cart_id UUID
--   $2: product_id UUID  
--   $3: quantity INT (positive to add, negative to remove)
-- Returns: Updated cart item info
-- Notes: Uses advisory lock to prevent race conditions
PREPARE add_or_update_cart_item (UUID, UUID, INT) AS
WITH locked_product AS (
    SELECT id, stock_quantity 
    FROM "Product"
    WHERE id = $2
    FOR UPDATE -- Lock product row
),
validation AS (
    SELECT 
        $3 > 0 AS is_adding, -- Lớn hơn 0 là tăng số lượng
        ($3 > 0 AND p.stock_quantity >= $3) AS has_stock, -- Kiểm tra tồn kho
        (ci.quantity + $3) >= 0 AS valid_quantity -- Số lượng sp trong giỏ hợp lệ
    FROM locked_product p
    LEFT JOIN "CartItem" ci ON ci.cart_id = $1 AND ci.product_id = $2
)
INSERT INTO "CartItem" (cart_id, product_id, quantity)
SELECT $1, $2, $3
FROM validation v
WHERE (v.is_adding AND v.has_stock) OR (NOT v.is_adding AND v.valid_quantity)
ON CONFLICT (cart_id, product_id) 
DO UPDATE SET quantity = "CartItem".quantity + $3
RETURNING cart_id, product_id, quantity;

-- Purpose: Remove item from cart completely
-- Parameters:
--   $1: cart_id UUID
--   $2: product_id UUID
-- Returns: Count of removed items
PREPARE remove_cart_item (UUID, UUID) AS
DELETE FROM "CartItem"
WHERE cart_id = $1 AND product_id = $2
RETURNING 1; -- Return count for confirmation

-- Purpose: Get cart contents with extended product info
-- Parameters:
--   $1: cart_id UUID
--   $2: limit INT (pagination)
--   $3: offset INT (pagination)  
-- Returns: Cart items with product details and availability
PREPARE get_cart_items (UUID, INT, INT) AS
SELECT 
    ci.product_id, 
    ci.quantity,
    p.name,
    p.price,
    p.stock_quantity,
    (p.stock_quantity >= ci.quantity) AS in_stock,
    (p.price * ci.quantity) AS line_total
FROM "CartItem" ci
JOIN "Product" p ON ci.product_id = p.id
WHERE ci.cart_id = $1
ORDER BY p.name
LIMIT $2 OFFSET $3;

-- Purpose: Get cart summary (total items, total value)
-- Parameters:
--   $1: cart_id UUID
-- Returns: Cart metadata
PREPARE get_cart_summary (UUID) AS
SELECT 
    COUNT(ci.*) AS item_count,
    SUM(ci.quantity) AS total_quantity,
    SUM(ci.quantity * p.price) AS subtotal,
    MIN(p.stock_quantity >= ci.quantity) AS all_in_stock
FROM "CartItem" ci
JOIN "Product" p ON ci.product_id = p.id
WHERE ci.cart_id = $1;


----------------------------------------------------------------------
-- 5. Truy vấn Kiểm Tra Tồn Kho
----------------------------------------------------------------------

PREPARE check_stock (UUID, INT) AS
    SELECT stock_quantity >= $2 AS is_available
    FROM "Product"
    WHERE id = $1;

----------------------------------------------------------------------
-- 6. Truy vấn Cập Nhật Trạng Thái Đơn Hàng (Giống Procedure sp_update_order_status)
----------------------------------------------------------------------

PREPARE update_order_status (UUID, VARCHAR) AS
    UPDATE "Order"
    SET status = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1;

----------------------------------------------------------------------
-- 7. Truy vấn Áp Dụng Mã Giảm Giá
----------------------------------------------------------------------

PREPARE apply_discount_code (VARCHAR, DECIMAL) AS
    UPDATE "DiscountCode"
    SET uses_count = uses_count + 1
    WHERE
        code = $1
    AND CURRENT_DATE BETWEEN start_date AND end_date
    AND (max_uses IS NULL OR uses_count < max_uses)
    AND (min_order_value IS NULL OR $2 >= min_order_value)
    RETURNING discount_percentage; -- Trả về % giảm giá nếu thành công

----------------------------------------------------------------------
-- 8. Truy vấn Lấy Địa Chỉ Mặc Định Của Người Dùng
----------------------------------------------------------------------

PREPARE get_default_address (UUID) AS
    SELECT *
    FROM "Address"
    WHERE user_id = $1 AND is_default = TRUE;

----------------------------------------------------------------------
-- 9. Truy vấn Thống Kê Sản Phẩm Bán Chạy
----------------------------------------------------------------------

PREPARE get_top_selling_products (UUID, DATE, DATE) AS
    SELECT p.id, p.name, SUM(od.quantity) AS total_sold
    FROM "OrderDetail" od
    JOIN "Product" p ON od.product_id = p.id
    JOIN "Order" o ON od.order_id = o.id
    WHERE
        ($1 IS NULL OR p.category_id = $1) -- $1 là category_id, NULL nếu không lọc
    AND o.created_at::date BETWEEN $2 AND $3 -- So sánh ngày
    GROUP BY p.id, p.name -- Group by cả id và name
    ORDER BY total_sold DESC
    LIMIT 10; -- Lấy top 10 sản phẩm

----------------------------------------------------------------------
-- 10. Truy vấn Đăng Ký Người Dùng Mới
----------------------------------------------------------------------
-- Lưu ý: Việc tạo Cart và Wishlist thường phức tạp hơn và được xử lý tốt hơn bằng PROCEDURE
-- như sp_register_user đã cung cấp. Tuy nhiên, nếu chỉ cần PREPARE cho việc insert User:
PREPARE register_user_basic (VARCHAR, VARCHAR, VARCHAR, VARCHAR) AS
    INSERT INTO "User" (name, email, sodienthoai, "password") -- Quote "password"
    VALUES ($1, $2, $3, $4) -- $4 là mật khẩu đã hash
    RETURNING id;
-- Sau khi EXECUTE cái này, cần gọi logic khác (hoặc trigger) để tạo Cart/Wishlist.


-- Đừng quên giải phóng các prepared statement khi không cần thiết (ví dụ khi đóng kết nối session)
-- DEALLOCATE get_user_by_id;
-- DEALLOCATE ALL;

