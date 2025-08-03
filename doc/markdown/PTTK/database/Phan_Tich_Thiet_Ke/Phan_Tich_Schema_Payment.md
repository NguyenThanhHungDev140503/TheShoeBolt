# Báo cáo phân tích & khuyến nghị thiết kế bảng **Payment**

---

## 1. Hiện trạng thiết kế bảng **Payment**

| Trường        | Kiểu dữ liệu        | Ràng buộc / Giá trị cho phép                      |
|---------------|---------------------|---------------------------------------------------|
| `id`          | `UUID`              | PK                                                |
| `order_id`    | `UUID`              | FK → `Order(id)`                                  |
| `amount`      | `DECIMAL(10,2)`     | NOT NULL                                          |
| `method`      | `VARCHAR(50)`       | `CHECK (method IN ('credit_card','ewallet','cash'))` |
| `status`      | `VARCHAR(20)`       | `CHECK (status IN ('success','failed'))`          |
| `created_at`  | `TIMESTAMP`         | `DEFAULT CURRENT_TIMESTAMP`                       |

**Phương thức được hỗ trợ hiện tại**
- credit_card
- ewallet
- cash

---

## 2. Yêu cầu nghiệp vụ (SRS)

### 2.1 Functional Requirements liên quan đến thanh toán

| ID     | Mô tả ngắn gọn | Chi tiết |
|--------|----------------|----------|
| FR-014 | Thanh toán     | “Hỗ trợ thanh toán bằng thẻ tín dụng, ví điện tử, tiền mặt; Dùng Stripe để hỗ trợ thanh toán online.” |
| FR-015 | Theo dõi đơn hàng | Trạng thái đơn hàng phải phản ánh được trạng thái thanh toán. |
| FR-033 | Dashboard khuyến mãi | Cần thống kê “doanh thu tăng thêm” → phụ thuộc vào dữ liệu thanh toán. |

### 2.2 Các phương thức thanh toán dự kiến mở rộng

| Phương thức        | Thuộc tính bổ sung thường cần quản lý |
|--------------------|----------------------------------------|
| Stripe (Credit card) | `stripe_payment_intent_id`, `stripe_charge_id`, `fee` |
| VNPay (Bank transfer) | `vnp_txn_ref`, `vnp_response_code`, `bank_code`, `fee` |
| MoMo / ZaloPay (Wallet) | `partner_trans_id`, `signature`, `fee`, `error_code` |
| COD (Cash)            | `note`, `change_amount`, `delivery_fee` |

---

## 3. So sánh hai phương án

| Tiêu chí | Phương án A (giữ nguyên) | Phương án B (tách bảng) |
|----------|--------------------------|-------------------------|
| **Tính mở rộng** | Khó: mỗi phương thức mới cần sửa `CHECK` và có thể thêm cột. | Dễ: thêm bản ghi vào bảng `PaymentMethod`. |
| **Lưu thuộc tính riêng** | Bất khả thi (phải lưu thêm JSON hoặc thêm nhiều cột NULL). | Trực tiếp: tạo bảng con hoặc JSONB. |
| **Chuẩn hóa (3NF)** | Vi phạm: cột `method` chứa dữ liệu lặp lại. | Đạt: tách riêng master-detail. |
| **Phức tạp truy vấn** | Đơn giản, 1 bảng. | Phải JOIN thêm 1 lần. |
| **Bảo trì** | Khó khăn khi sửa enum. | Đơn giản: INSERT/UPDATE. |
| **Báo cáo & phân tích** | Giới hạn: không có metadata riêng cho từng phương thức. | Linh hoạt: có thể phân tích theo `fee`, `provider`, v.v. |

---

## 4. Khuyến nghị

> **Khuyến nghị: Áp dụng Phương án B – tách bảng `PaymentMethod` và `PaymentDetail`.**

### 4.1 Lý do chính

1. **Tương lai mở rộng**: Yêu cầu hiện tại chỉ có 3 phương thức, nhưng SRS mở đường cho Stripe và VNPay. Việc hard-code enum sẽ gây khó khăn khi cần thêm Apple Pay, PayPal, v.v.
2. **Lưu trữ metadata riêng**: Stripe cần `payment_intent_id`, VNPay cần `vnp_txn_ref`, COD cần `change_amount`. Việc lưu chung trong 1 bảng dẫn đến nhiều cột NULL dư thừa.
3. **Chuẩn hóa CSDL**: Tránh vi phạm 2NF/3NF do dữ liệu lặp lại trong enum.
4. **Báo cáo**: Admin dashboard (FR-033) yêu cầu phân tích hiệu quả từng phương thức (doanh thu, phí giao dịch) → cần bảng phụ.

---

### 4.2 Schema chi tiết đề xuất

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

-- Bảng detail: Payment
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

-- Index
CREATE INDEX idx_payment_order        ON "Payment"(order_id);
CREATE INDEX idx_payment_method       ON "Payment"(payment_method_id);
CREATE INDEX idx_payment_status       ON "Payment"(status);
CREATE INDEX idx_payment_provider_txn ON "Payment"(provider_txn_id);
CREATE INDEX idx_payment_paid_at       ON "Payment"(paid_at);
CREATE INDEX idx_payment_idempotency   ON "Payment"(idempotency_key)
    WHERE idempotency_key IS NOT NULL;
CREATE INDEX idx_payment_provider_meta ON "Payment"
    USING GIN (provider_meta);
```

#### 4.3 Dữ liệu mẫu seed

```sql
INSERT INTO "PaymentMethod"(code, name, provider, fee_percent)
VALUES
  ('stripe', 'Stripe - Credit Card', 'Stripe', 2.9),
  ('vnpay',  'VNPay - Bank Transfer', 'VNPay', 1.1),
  ('cod',    'Cash on Delivery', 'Internal', 0),
  ('momo',   'MoMo Wallet', 'MoMo', 1.5);
```

---

### 4.4 Tổng kết thay đổi

| Thay đổi | Mô tả |
|----------|-------|
| **Thêm bảng** | `PaymentMethod` (master) |
| **Sửa bảng** | Bỏ cột `method` trong `Payment`, thêm FK `payment_method_id` và các cột bổ sung (`provider_txn_id`, `provider_fee`, `metadata`, `paid_at`). |
| **Tương thích ngược** | Viết migration chuyển dữ liệu cũ từ enum sang dạng FK. |
| **Lợi ích cuối cùng** | • Dễ thêm/xóa phương thức<br>• Lưu metadata riêng không làm phình bảng<br>• Báo cáo phí giao dịch, doanh thu theo provider chính xác. |

---

> ✅ **Quyết định**: Triển khai phương án tách bảng để hệ thống sẵn sàng cho các cổng thanh toán mới và đáp ứng yêu cầu báo cáo chi tiết của Admin Dashboard.