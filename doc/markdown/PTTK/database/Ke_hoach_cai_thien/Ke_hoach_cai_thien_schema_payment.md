# Kế hoạch Cải thiện Schema Payment - Triển khai Phương án B

**Người thực hiện:** Augment Agent  
**Ngày thực hiện:** 18/01/2025  
**Người giám sát:** default_user  

## Tóm tắt Báo cáo

Kế hoạch này triển khai khuyến nghị "Phương án B - tách bảng PaymentMethod và PaymentDetail" từ báo cáo phân tích schema Payment. Mục tiêu là cải thiện tính mở rộng, chuẩn hóa database, và hỗ trợ các phương thức thanh toán mới (Stripe, VNPay, MoMo) với metadata riêng biệt.

**Lợi ích chính:**
- Dễ dàng thêm phương thức thanh toán mới
- Lưu trữ metadata riêng cho từng provider
- Chuẩn hóa database theo 3NF
- Hỗ trợ báo cáo và phân tích chi tiết
- Quản lý phí giao dịch và refund

**Timeline ước tính:** 3-4 ngày làm việc

## Nội dung Kế hoạch

### Phase 1: Tạo Bảng PaymentMethod Mới

#### Mục tiêu
Tạo bảng master để quản lý các phương thức thanh toán với thông tin provider và phí giao dịch.

#### Code SQL thực hiện

```sql
-- Bảng master: PaymentMethod
CREATE TABLE "PaymentMethod" (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(30) UNIQUE NOT NULL,  -- stripe, vnpay, cod, momo...
    name        VARCHAR(100) NOT NULL,
    provider    VARCHAR(50),                  -- Stripe, VNPay, MoMo...
    fee_percent NUMERIC(5,2) DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Thêm comment cho bảng
COMMENT ON TABLE "PaymentMethod" IS 'Bảng master quản lý các phương thức thanh toán';
COMMENT ON COLUMN "PaymentMethod".code IS 'Mã định danh duy nhất cho phương thức (stripe, vnpay, cod, momo)';
COMMENT ON COLUMN "PaymentMethod".fee_percent IS 'Phần trăm phí giao dịch của provider';
```

#### Checklist
- [ ] Tạo bảng PaymentMethod
- [ ] Kiểm tra constraints và indexes
- [ ] Thêm comments cho documentation
- [ ] Verify bảng được tạo thành công

#### Kiểm tra và Validation

```sql
-- Kiểm tra bảng được tạo
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'PaymentMethod';

-- Kiểm tra constraints
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'PaymentMethod';
```

**Timeline:** 0.5 ngày

---

### Phase 2: Sửa đổi Bảng Payment

#### Mục tiêu
Thay thế schema Payment hiện tại với thiết kế mới hỗ trợ foreign key đến PaymentMethod và các trường metadata.

#### Code SQL thực hiện

```sql
-- Backup dữ liệu hiện tại (nếu có)
CREATE TABLE "Payment_backup" AS SELECT * FROM "Payment";

-- Xóa bảng Payment cũ
DROP TABLE IF EXISTS "Payment" CASCADE;

-- Tạo bảng Payment mới theo schema đề xuất
CREATE TABLE "Payment" (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id         UUID NOT NULL REFERENCES "Order"(id),
    -- Liên kết với phương thức 
    payment_method_id UUID NOT NULL REFERENCES "PaymentMethod"(id),
    
    -- Thông tin thanh toán
    amount           NUMERIC(10,2) NOT NULL,
    currency         VARCHAR(3) DEFAULT 'VND',
    -- Trạng thái
    status           VARCHAR(20) CHECK (status IN ('success','failed','pending','refunded')),
    failure_reason   TEXT,
    refunded_amount  NUMERIC(10,2) DEFAULT 0,
    
    -- Dữ liệu riêng của provider
    provider_txn_id  VARCHAR(255),         -- stripe_payment_intent_id, vnp_txn_ref...
    provider_fee     NUMERIC(10,2),        -- phí giao dịch
    metadata         JSONB,                -- lưu thêm thông tin động
    
    -- Audit
    paid_at          TIMESTAMP,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted       BOOLEAN   DEFAULT FALSE,
    idempotency_key  UUID UNIQUE
);

-- Thêm comments
COMMENT ON TABLE "Payment" IS 'Bảng detail lưu trữ thông tin thanh toán chi tiết';
COMMENT ON COLUMN "Payment".provider_txn_id IS 'ID giao dịch từ provider (stripe_payment_intent_id, vnp_txn_ref, etc.)';
COMMENT ON COLUMN "Payment".metadata IS 'Dữ liệu JSON lưu thông tin bổ sung của provider';
COMMENT ON COLUMN "Payment".idempotency_key IS 'Key đảm bảo tính idempotent cho API calls';
```

#### Checklist
- [ ] Backup dữ liệu cũ (nếu có)
- [ ] Drop bảng Payment cũ
- [ ] Tạo bảng Payment mới
- [ ] Kiểm tra foreign key constraints
- [ ] Verify các trường mới được tạo đúng

#### Kiểm tra và Validation

```sql
-- Kiểm tra structure bảng mới
\d "Payment"

-- Kiểm tra foreign key constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='Payment';

-- Test insert một record mẫu
INSERT INTO "PaymentMethod"(code, name, provider) VALUES ('test', 'Test Method', 'Test');
INSERT INTO "Payment"(order_id, payment_method_id, amount, status) 
SELECT 
    (SELECT id FROM "Order" LIMIT 1),
    (SELECT id FROM "PaymentMethod" WHERE code = 'test'),
    100.00,
    'pending';
```

**Timeline:** 1 ngày

---

### Phase 3: Tạo Index theo Đề xuất

#### Mục tiêu
Tạo các index cần thiết để tối ưu hiệu suất truy vấn cho bảng Payment mới.

#### Code SQL thực hiện

```sql
-- Index cho bảng Payment
CREATE INDEX idx_payment_order        ON "Payment"(order_id);
CREATE INDEX idx_payment_method       ON "Payment"(payment_method_id);
CREATE INDEX idx_payment_status       ON "Payment"(status);
CREATE INDEX idx_payment_provider_txn ON "Payment"(provider_txn_id);
CREATE INDEX idx_payment_paid_at       ON "Payment"(paid_at);
CREATE INDEX idx_payment_idempotency   ON "Payment"(idempotency_key)
    WHERE idempotency_key IS NOT NULL;
CREATE INDEX idx_payment_metadata ON "Payment"
    USING GIN (metadata);

-- Index cho bảng PaymentMethod
CREATE INDEX idx_payment_method_code ON "PaymentMethod"(code);
CREATE INDEX idx_payment_method_active ON "PaymentMethod"(is_active);

-- Composite indexes cho reporting
CREATE INDEX idx_payment_status_paid_at ON "Payment"(status, paid_at);
CREATE INDEX idx_payment_method_status ON "Payment"(payment_method_id, status);
```

#### Checklist
- [ ] Tạo tất cả indexes cho bảng Payment
- [ ] Tạo indexes cho bảng PaymentMethod
- [ ] Tạo composite indexes cho reporting
- [ ] Kiểm tra hiệu suất với EXPLAIN

#### Kiểm tra và Validation

```sql
-- Kiểm tra tất cả indexes được tạo
SELECT indexname, tablename, indexdef 
FROM pg_indexes 
WHERE tablename IN ('Payment', 'PaymentMethod')
ORDER BY tablename, indexname;

-- Test hiệu suất với EXPLAIN
EXPLAIN ANALYZE SELECT * FROM "Payment" WHERE order_id = gen_random_uuid();
EXPLAIN ANALYZE SELECT * FROM "Payment" WHERE status = 'success';
EXPLAIN ANALYZE SELECT * FROM "Payment" WHERE provider_txn_id = 'test_txn_123';
```

**Timeline:** 0.5 ngày

---

### Phase 4: Dữ liệu Seed cho PaymentMethod

#### Mục tiêu
Insert dữ liệu mẫu cho các phương thức thanh toán phổ biến theo đề xuất từ báo cáo.

#### Code SQL thực hiện

```sql
-- Dữ liệu seed cho PaymentMethod
INSERT INTO "PaymentMethod"(code, name, provider, fee_percent) VALUES
  ('stripe', 'Stripe - Credit Card', 'Stripe', 2.9),
  ('vnpay',  'VNPay - Bank Transfer', 'VNPay', 1.1),
  ('cod',    'Cash on Delivery', 'Internal', 0),
  ('momo',   'MoMo Wallet', 'MoMo', 1.5),
  ('zalopay', 'ZaloPay Wallet', 'ZaloPay', 1.8),
  ('credit_card', 'Credit Card (Generic)', 'Internal', 0),
  ('ewallet', 'E-Wallet (Generic)', 'Internal', 0),
  ('cash', 'Cash Payment', 'Internal', 0),
  ('bank_transfer', 'Bank Transfer', 'Internal', 0),
  ('paypal', 'PayPal', 'PayPal', 3.4);

-- Verify dữ liệu được insert
SELECT code, name, provider, fee_percent, is_active 
FROM "PaymentMethod" 
ORDER BY provider, name;
```

#### Checklist
- [ ] Insert dữ liệu seed cho PaymentMethod
- [ ] Verify tất cả records được tạo
- [ ] Kiểm tra không có duplicate codes
- [ ] Test foreign key relationship

#### Kiểm tra và Validation

```sql
-- Kiểm tra số lượng records
SELECT COUNT(*) as total_methods FROM "PaymentMethod";

-- Kiểm tra unique constraint
SELECT code, COUNT(*) 
FROM "PaymentMethod" 
GROUP BY code 
HAVING COUNT(*) > 1;

-- Test relationship với Payment
INSERT INTO "Payment"(
    order_id, 
    payment_method_id, 
    amount, 
    status
) SELECT 
    (SELECT id FROM "Order" LIMIT 1),
    id,
    50.00,
    'pending'
FROM "PaymentMethod" 
WHERE code = 'stripe';
```

**Timeline:** 0.5 ngày

---

### Phase 5: Cập nhật Stored Procedures

#### Mục tiêu
Cập nhật các stored procedures hiện có để tương thích với schema mới.

#### Code SQL thực hiện

```sql
-- Cập nhật sp_create_payment
CREATE OR REPLACE PROCEDURE sp_create_payment(
    p_order_id UUID,
    p_payment_method_code VARCHAR(30),
    p_amount DECIMAL(10,2),
    p_status VARCHAR(20) DEFAULT 'pending',
    p_provider_txn_id VARCHAR(255) DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL,
    p_idempotency_key UUID DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_payment_method_id UUID;
BEGIN
    -- Lấy payment_method_id từ code
    SELECT id INTO v_payment_method_id 
    FROM "PaymentMethod" 
    WHERE code = p_payment_method_code AND is_active = TRUE;
    
    IF v_payment_method_id IS NULL THEN
        RAISE EXCEPTION 'Phương thức thanh toán không hợp lệ hoặc không hoạt động: %', p_payment_method_code;
    END IF;

    -- Kiểm tra trạng thái hợp lệ
    IF p_status NOT IN ('success', 'failed', 'pending', 'refunded') THEN
        RAISE EXCEPTION 'Trạng thái thanh toán không hợp lệ: %', p_status;
    END IF;

    -- Kiểm tra idempotency key nếu có
    IF p_idempotency_key IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM "Payment" WHERE idempotency_key = p_idempotency_key) THEN
            RAISE EXCEPTION 'Idempotency key đã tồn tại: %', p_idempotency_key;
        END IF;
    END IF;

    INSERT INTO "Payment" (
        order_id, 
        payment_method_id, 
        amount, 
        status, 
        provider_txn_id, 
        metadata,
        paid_at,
        idempotency_key
    )
    VALUES (
        p_order_id, 
        v_payment_method_id, 
        p_amount, 
        p_status, 
        p_provider_txn_id, 
        p_metadata,
        CASE WHEN p_status = 'success' THEN CURRENT_TIMESTAMP ELSE NULL END,
        p_idempotency_key
    );
END;
$$;

-- Cập nhật sp_update_payment_status
CREATE OR REPLACE PROCEDURE sp_update_payment_status(
    p_payment_id UUID,
    p_new_status VARCHAR(20),
    p_failure_reason TEXT DEFAULT NULL,
    p_provider_txn_id VARCHAR(255) DEFAULT NULL,
    p_provider_fee NUMERIC(10,2) DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Kiểm tra trạng thái hợp lệ
    IF p_new_status NOT IN ('success', 'failed', 'pending', 'refunded') THEN
        RAISE EXCEPTION 'Trạng thái thanh toán không hợp lệ: %', p_new_status;
    END IF;

    UPDATE "Payment"
    SET status = p_new_status,
        failure_reason = CASE WHEN p_new_status = 'failed' THEN p_failure_reason ELSE failure_reason END,
        provider_txn_id = COALESCE(p_provider_txn_id, provider_txn_id),
        provider_fee = COALESCE(p_provider_fee, provider_fee),
        metadata = CASE WHEN p_metadata IS NOT NULL THEN p_metadata ELSE metadata END,
        paid_at = CASE WHEN p_new_status = 'success' AND paid_at IS NULL THEN CURRENT_TIMESTAMP ELSE paid_at END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_payment_id AND is_deleted = FALSE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy thanh toán với ID: %', p_payment_id;
    END IF;
END;
$$;
```

#### Checklist
- [ ] Cập nhật sp_create_payment
- [ ] Cập nhật sp_update_payment_status
- [ ] Test các procedures với dữ liệu mẫu
- [ ] Kiểm tra error handling

#### Kiểm tra và Validation

```sql
-- Test sp_create_payment
CALL sp_create_payment(
    (SELECT id FROM "Order" LIMIT 1),
    'stripe',
    100.50,
    'pending',
    'pi_test_123',
    '{"customer_id": "cus_test_123"}'::jsonb
);

-- Test sp_update_payment_status
CALL sp_update_payment_status(
    (SELECT id FROM "Payment" LIMIT 1),
    'success',
    NULL,
    'pi_test_123_confirmed',
    2.90
);

-- Verify kết quả
SELECT * FROM "Payment" ORDER BY created_at DESC LIMIT 5;
```

**Timeline:** 1 ngày

---

### Phase 6: Cập nhật Prepared Statements

#### Mục tiêu
Cập nhật các prepared statements để tương thích với schema mới và hỗ trợ JOIN với PaymentMethod.

#### Code SQL thực hiện

```sql
-- Cập nhật prepared statements cho payment
PREPARE get_payment_by_order (UUID) AS
    SELECT p.id, p.order_id, p.amount, p.currency, p.status, 
           p.failure_reason, p.refunded_amount, p.provider_txn_id, 
           p.provider_fee, p.metadata, p.paid_at, p.created_at,
           pm.code as method_code, pm.name as method_name, pm.provider
    FROM "Payment" p
    JOIN "PaymentMethod" pm ON p.payment_method_id = pm.id
    WHERE p.order_id = $1 AND p.is_deleted = FALSE;

PREPARE get_payment_by_id (UUID) AS
    SELECT p.id, p.order_id, p.amount, p.currency, p.status, 
           p.failure_reason, p.refunded_amount, p.provider_txn_id, 
           p.provider_fee, p.metadata, p.paid_at, p.created_at,
           pm.code as method_code, pm.name as method_name, pm.provider
    FROM "Payment" p
    JOIN "PaymentMethod" pm ON p.payment_method_id = pm.id
    WHERE p.id = $1 AND p.is_deleted = FALSE;

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
      AND p.is_deleted = FALSE
    GROUP BY pm.id, pm.name, pm.provider
    ORDER BY total_amount DESC;

-- Prepared statement cho order với payment info
PREPARE get_order_with_payment (UUID) AS
    SELECT o.id, o.user_id, o.status, o.total_amount, o.created_at,
           p.id as payment_id, p.amount as payment_amount, p.status as payment_status,
           pm.name as payment_method, pm.provider as payment_provider
    FROM "Order" o
    LEFT JOIN "Payment" p ON o.id = p.order_id AND p.is_deleted = FALSE
    LEFT JOIN "PaymentMethod" pm ON p.payment_method_id = pm.id
    WHERE o.id = $1;

-- Tìm kiếm payments theo provider transaction ID
PREPARE get_payment_by_provider_txn (VARCHAR) AS
    SELECT p.id, p.order_id, p.amount, p.status, p.provider_txn_id,
           pm.code, pm.provider
    FROM "Payment" p
    JOIN "PaymentMethod" pm ON p.payment_method_id = pm.id
    WHERE p.provider_txn_id = $1 AND p.is_deleted = FALSE;
```

#### Checklist
- [ ] Cập nhật tất cả prepared statements
- [ ] Test các statements với dữ liệu mẫu
- [ ] Kiểm tra performance với EXPLAIN
- [ ] Verify JOIN operations hoạt động đúng

#### Kiểm tra và Validation

```sql
-- Test các prepared statements
EXECUTE get_active_payment_methods;
EXECUTE get_payment_by_order((SELECT id FROM "Order" LIMIT 1));
EXECUTE payment_revenue_report('2025-01-01', '2025-12-31');

-- Kiểm tra performance
EXPLAIN ANALYZE EXECUTE get_payment_by_order((SELECT id FROM "Order" LIMIT 1));
```

**Timeline:** 0.5 ngày

---

### Phase 7: Thêm Stored Procedures Mới

#### Mục tiêu
Thêm các stored procedures mới để hỗ trợ refund và reporting theo yêu cầu nghiệp vụ.

#### Code SQL thực hiện

```sql
-- Procedure để xử lý refund
CREATE OR REPLACE PROCEDURE sp_process_refund(
    p_payment_id UUID,
    p_refund_amount NUMERIC(10,2),
    p_reason TEXT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_amount NUMERIC(10,2);
    v_current_refunded NUMERIC(10,2);
BEGIN
    -- Lấy thông tin payment hiện tại
    SELECT amount, refunded_amount INTO v_current_amount, v_current_refunded
    FROM "Payment"
    WHERE id = p_payment_id AND status = 'success' AND is_deleted = FALSE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy thanh toán hợp lệ với ID: %', p_payment_id;
    END IF;
    
    -- Kiểm tra số tiền refund
    IF (v_current_refunded + p_refund_amount) > v_current_amount THEN
        RAISE EXCEPTION 'Số tiền hoàn trả vượt quá số tiền thanh toán';
    END IF;
    
    -- Cập nhật payment
    UPDATE "Payment"
    SET refunded_amount = v_current_refunded + p_refund_amount,
        status = CASE 
            WHEN (v_current_refunded + p_refund_amount) = v_current_amount THEN 'refunded'
            ELSE status
        END,
        failure_reason = COALESCE(p_reason, failure_reason),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_payment_id;
    
    RAISE NOTICE 'Refund processed: % for payment %', p_refund_amount, p_payment_id;
END;
$$;

-- Function để lấy thống kê payment
CREATE OR REPLACE FUNCTION fn_get_payment_stats(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    payment_method VARCHAR(100),
    provider VARCHAR(50),
    total_transactions BIGINT,
    total_amount NUMERIC(12,2),
    total_fees NUMERIC(12,2),
    success_rate NUMERIC(5,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pm.name as payment_method,
        pm.provider,
        COUNT(p.id) as total_transactions,
        SUM(p.amount) as total_amount,
        SUM(COALESCE(p.provider_fee, 0)) as total_fees,
        ROUND(
            (COUNT(CASE WHEN p.status = 'success' THEN 1 END) * 100.0 / COUNT(p.id)), 
            2
        ) as success_rate
    FROM "Payment" p
    JOIN "PaymentMethod" pm ON p.payment_method_id = pm.id
    WHERE p.is_deleted = FALSE
      AND (p_start_date IS NULL OR p.paid_at::DATE >= p_start_date)
      AND (p_end_date IS NULL OR p.paid_at::DATE <= p_end_date)
    GROUP BY pm.id, pm.name, pm.provider
    ORDER BY total_amount DESC;
END;
$$;

-- Function để tính tổng doanh thu theo provider
CREATE OR REPLACE FUNCTION fn_get_provider_revenue(
    p_provider VARCHAR(50),
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    provider VARCHAR(50),
    total_revenue NUMERIC(12,2),
    total_fees NUMERIC(12,2),
    net_revenue NUMERIC(12,2),
    transaction_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pm.provider,
        SUM(p.amount) as total_revenue,
        SUM(COALESCE(p.provider_fee, 0)) as total_fees,
        SUM(p.amount - COALESCE(p.provider_fee, 0)) as net_revenue,
        COUNT(p.id) as transaction_count
    FROM "Payment" p
    JOIN "PaymentMethod" pm ON p.payment_method_id = pm.id
    WHERE p.status = 'success' 
      AND p.is_deleted = FALSE
      AND pm.provider = p_provider
      AND (p_start_date IS NULL OR p.paid_at::DATE >= p_start_date)
      AND (p_end_date IS NULL OR p.paid_at::DATE <= p_end_date)
    GROUP BY pm.provider;
END;
$$;

-- Procedure để deactivate payment method
CREATE OR REPLACE PROCEDURE sp_toggle_payment_method(
    p_method_code VARCHAR(30),
    p_is_active BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE "PaymentMethod"
    SET is_active = p_is_active,
        created_at = CURRENT_TIMESTAMP  -- Update timestamp for audit
    WHERE code = p_method_code;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy phương thức thanh toán với code: %', p_method_code;
    END IF;
    
    RAISE NOTICE 'Payment method % set to active: %', p_method_code, p_is_active;
END;
$$;
```

#### Checklist
- [ ] Tạo sp_process_refund procedure
- [ ] Tạo fn_get_payment_stats function
- [ ] Tạo fn_get_provider_revenue function
- [ ] Tạo sp_toggle_payment_method procedure
- [ ] Test tất cả procedures/functions mới

#### Kiểm tra và Validation

```sql
-- Test refund procedure
CALL sp_process_refund(
    (SELECT id FROM "Payment" WHERE status = 'success' LIMIT 1),
    25.00,
    'Customer request'
);

-- Test payment stats function
SELECT * FROM fn_get_payment_stats('2025-01-01', '2025-12-31');

-- Test provider revenue function
SELECT * FROM fn_get_provider_revenue('Stripe', '2025-01-01', '2025-12-31');

-- Test toggle payment method
CALL sp_toggle_payment_method('stripe', FALSE);
CALL sp_toggle_payment_method('stripe', TRUE);
```

**Timeline:** 1 ngày

---

## Task Management

### Thứ tự Ưu tiên

| Priority | Phase | Task | Dependencies | Timeline |
|----------|-------|------|--------------|----------|
| 1 | Phase 1 | Tạo bảng PaymentMethod | None | 0.5 ngày |
| 2 | Phase 4 | Insert dữ liệu seed | Phase 1 | 0.5 ngày |
| 3 | Phase 2 | Sửa đổi bảng Payment | Phase 1, 4 | 1 ngày |
| 4 | Phase 3 | Tạo indexes | Phase 2 | 0.5 ngày |
| 5 | Phase 5 | Cập nhật stored procedures | Phase 2, 3 | 1 ngày |
| 6 | Phase 6 | Cập nhật prepared statements | Phase 5 | 0.5 ngày |
| 7 | Phase 7 | Thêm procedures mới | Phase 5, 6 | 1 ngày |

### Critical Path
Phase 1 → Phase 4 → Phase 2 → Phase 3 → Phase 5 → Phase 6 → Phase 7

### Risk Mitigation
- **Backup dữ liệu** trước khi thực hiện Phase 2
- **Test từng phase** trước khi chuyển sang phase tiếp theo
- **Rollback plan** cho mỗi phase nếu có lỗi

## Kiểm tra Tổng thể và Validation

### Final Integration Test

```sql
-- Test workflow hoàn chỉnh
DO $$
DECLARE
    v_order_id UUID;
    v_payment_id UUID;
BEGIN
    -- Tạo order mẫu (giả sử đã có)
    SELECT id INTO v_order_id FROM "Order" LIMIT 1;
    
    -- Test tạo payment
    CALL sp_create_payment(
        v_order_id,
        'stripe',
        150.00,
        'pending',
        'pi_test_integration_123',
        '{"customer_id": "cus_integration_test"}'::jsonb
    );
    
    -- Lấy payment vừa tạo
    SELECT id INTO v_payment_id 
    FROM "Payment" 
    WHERE provider_txn_id = 'pi_test_integration_123';
    
    -- Test update status
    CALL sp_update_payment_status(
        v_payment_id,
        'success',
        NULL,
        'pi_test_integration_123_confirmed',
        4.35
    );
    
    -- Test refund
    CALL sp_process_refund(v_payment_id, 50.00, 'Partial refund test');
    
    RAISE NOTICE 'Integration test completed successfully';
END;
$$;

-- Verify final state
SELECT 
    p.id,
    p.amount,
    p.status,
    p.refunded_amount,
    pm.name as payment_method,
    pm.provider
FROM "Payment" p
JOIN "PaymentMethod" pm ON p.payment_method_id = pm.id
WHERE p.provider_txn_id LIKE 'pi_test_integration%';
```

### Performance Validation

```sql
-- Test performance của các truy vấn chính
EXPLAIN ANALYZE SELECT * FROM "Payment" p 
JOIN "PaymentMethod" pm ON p.payment_method_id = pm.id 
WHERE p.status = 'success' 
AND p.paid_at >= CURRENT_DATE - INTERVAL '30 days';

-- Test reporting query performance
EXPLAIN ANALYZE SELECT * FROM fn_get_payment_stats(
    CURRENT_DATE - INTERVAL '30 days', 
    CURRENT_DATE
);
```

## Kết luận

Kế hoạch cải thiện schema Payment này triển khai đầy đủ khuyến nghị "Phương án B" từ báo cáo phân tích, mang lại những lợi ích quan trọng:

### Thành tựu chính
- ✅ **Tính mở rộng cao**: Dễ dàng thêm phương thức thanh toán mới
- ✅ **Chuẩn hóa database**: Tuân thủ 3NF, tránh dữ liệu lặp lại
- ✅ **Metadata linh hoạt**: Hỗ trợ lưu trữ thông tin riêng cho từng provider
- ✅ **Báo cáo chi tiết**: Phân tích doanh thu, phí giao dịch theo provider
- ✅ **Quản lý refund**: Hỗ trợ hoàn tiền một phần và toàn bộ
- ✅ **Audit trail**: Theo dõi lịch sử thay đổi payment

### Tương thích hệ thống
- Duy trì mối quan hệ với bảng Order
- Không ảnh hưởng đến các module khác
- Hỗ trợ idempotency cho API calls
- Tối ưu hiệu suất với indexes phù hợp

### Next Steps
1. **Triển khai theo phases** đã định nghĩa
2. **Update application code** để sử dụng schema mới
3. **Implement API endpoints** cho payment methods management
4. **Setup monitoring** cho payment transactions
5. **Documentation update** cho developers

Kế hoạch này đảm bảo hệ thống thanh toán sẵn sàng cho việc tích hợp Stripe, VNPay và các provider khác trong tương lai, đồng thời cung cấp nền tảng vững chắc cho các tính năng báo cáo và phân tích doanh thu.