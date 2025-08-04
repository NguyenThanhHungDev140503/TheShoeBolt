# Báo cáo Audit Chi tiết 3 Borderline Cases - Database Layer

**Người thực hiện:** Augment Agent
**Ngày thực hiện:** 31/07/2025
**Người giám sát:** default_user
**Tham chiếu:** Kế hoạch Refactor Clean Architecture Database

## Tóm tắt Báo cáo

Báo cáo này phân tích chi tiết 3 stored procedures được phân loại là "borderline cases" trong database layer hiện tại, xác định business logic vi phạm Clean Architecture và đề xuất giải pháp refactor.

## Nội dung Báo cáo

### 1. sp_assign_shipper - Role Validation Logic

#### Phân tích Code Hiện tại

<augment_code_snippet path="sql/theshoe.sql" mode="EXCERPT">
````sql
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
````
</augment_code_snippet>

#### Vi phạm Clean Architecture

**🔴 Business Logic trong Database Layer:**
- **Dòng 411-417:** Role validation logic thuộc về Domain/Application layer
- **Logic:** Kiểm tra user có role 'shipper' hay không
- **Vấn đề:** Database layer không nên chứa business rules về authorization

#### Giải pháp Refactor

**Di chuyển về ShippingService:**
```typescript
// shipping.service.ts
async assignShipper(orderId: string, shipperId: string): Promise<void> {
  // Business logic: Validate shipper role
  const isShipper = await this.userService.hasRole(shipperId, 'shipper');
  if (!isShipper) {
    throw new BadRequestException('Người dùng không phải shipper');
  }

  // Simple data operation
  await this.shippingRepository.assignShipper(orderId, shipperId);
}
```

**Simplified Procedure:**
```sql
CREATE OR REPLACE PROCEDURE sp_assign_shipper_simple(
    p_order_id UUID,
    p_shipper_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE "Shipping"
    SET shipper_id = p_shipper_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE order_id = p_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy shipping record cho order: %', p_order_id;
    END IF;
END;
$$;
```

### 2. sp_register_user - Workflow Logic

#### Phân tích Code Hiện tại

<augment_code_snippet path="sql/theshoe.sql" mode="EXCERPT">
````sql
CREATE OR REPLACE PROCEDURE sp_register_user(
    p_name VARCHAR(100),
    p_email VARCHAR(255),
    p_sodienthoai VARCHAR(20),
    p_hashed_password VARCHAR(255)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_new_user_id UUID;
BEGIN
    -- Kiểm tra email và số điện thoại đã tồn tại chưa
    IF EXISTS (SELECT 1 FROM "User" WHERE email = p_email) THEN
        RAISE EXCEPTION 'Email đã tồn tại: %', p_email;
    END IF;
    IF EXISTS (SELECT 1 FROM "User" WHERE sodienthoai = p_sodienthoai) THEN
        RAISE EXCEPTION 'Số điện thoại đã tồn tại: %', p_sodienthoai;
    END IF;

    INSERT INTO "User" (name, email, sodienthoai, password)
    VALUES (p_name, p_email, p_sodienthoai, p_hashed_password)
    RETURNING id INTO v_new_user_id;

    -- Tự động tạo giỏ hàng cho người dùng mới
    INSERT INTO "Cart" (user_id) VALUES (v_new_user_id);
    -- Tự động tạo danh sách yêu thích cho người dùng mới
    INSERT INTO "Wishlist" (user_id) VALUES (v_new_user_id);
END;
$$;
````
</augment_code_snippet>

#### Vi phạm Clean Architecture

**🔴 Business Workflow trong Database Layer:**
- **Dòng 460-465:** Business validation logic (email/phone uniqueness)
- **Dòng 474-477:** Complex workflow (user + cart + wishlist creation)
- **Vấn đề:** Database layer chứa business workflow và validation rules

#### Giải pháp Refactor

**Di chuyển về UserRegistrationService:**
```typescript
// user-registration.service.ts
async registerUser(userData: RegisterUserDto): Promise<User> {
  return await this.dataSource.transaction(async (manager) => {
    // 1. Validate business rules
    await this.validateUserRegistration(userData);

    // 2. Create user
    const user = await this.userRepository.create(userData, manager);

    // 3. Initialize user resources
    await Promise.all([
      this.cartService.createCart(user.id, manager),
      this.wishlistService.createWishlist(user.id, manager)
    ]);

    return user;
  });
}

private async validateUserRegistration(userData: RegisterUserDto): Promise<void> {
  if (await this.userRepository.existsByEmail(userData.email)) {
    throw new ConflictException('Email đã tồn tại');
  }
  if (await this.userRepository.existsByPhone(userData.phone)) {
    throw new ConflictException('Số điện thoại đã tồn tại');
  }
}
```

**Simplified Procedure:**
```sql
CREATE OR REPLACE PROCEDURE sp_create_user_simple(
    p_name VARCHAR(100),
    p_email VARCHAR(255),
    p_sodienthoai VARCHAR(20),
    p_hashed_password VARCHAR(255),
    OUT p_user_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO "User" (name, email, sodienthoai, password)
    VALUES (p_name, p_email, p_sodienthoai, p_hashed_password)
    RETURNING id INTO p_user_id;
END;
$$;
```
### 3. sp_process_refund - Business Validation Logic

#### Phân tích Code Hiện tại

<augment_code_snippet path="sql/theshoe.sql" mode="EXCERPT">
````sql
CREATE OR REPLACE PROCEDURE sp_process_refund(
    p_payment_id UUID,
    p_refund_amount DECIMAL(10,2),
    p_reason TEXT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_payment_amount DECIMAL(10,2);
    v_payment_status VARCHAR(20);
BEGIN
    -- Kiểm tra payment tồn tại và trạng thái
    SELECT amount, status INTO v_payment_amount, v_payment_status
    FROM "Payment"
    WHERE id = p_payment_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy thanh toán với ID: %', p_payment_id;
    END IF;

    IF v_payment_status != 'success' THEN
        RAISE EXCEPTION 'Chỉ có thể refund payment có trạng thái success';
    END IF;

    IF p_refund_amount > v_payment_amount THEN
        RAISE EXCEPTION 'Số tiền refund không thể lớn hơn số tiền thanh toán';
    END IF;

    -- Cập nhật trạng thái payment
    UPDATE "Payment"
    SET status = 'refunded',
        metadata = COALESCE(metadata, '{}'::jsonb) ||
                  jsonb_build_object('refund_amount', p_refund_amount, 'refund_reason', p_reason, 'refunded_at', CURRENT_TIMESTAMP),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_payment_id;

    RAISE NOTICE 'Đã xử lý refund % cho payment %', p_refund_amount, p_payment_id;
END;
$$;
````
</augment_code_snippet>

#### Vi phạm Clean Architecture

**🔴 Business Validation trong Database Layer:**
- **Dòng 1080-1082:** Business rule validation (payment status)
- **Dòng 1084-1086:** Business rule validation (refund amount)
- **Vấn đề:** Database layer chứa business validation logic

#### Giải pháp Refactor

**Di chuyển về PaymentRefundService:**
```typescript
// payment-refund.service.ts
async processRefund(
  paymentId: string,
  refundAmount: number,
  reason?: string
): Promise<void> {
  return await this.dataSource.transaction(async (manager) => {
    // 1. Get payment details
    const payment = await this.paymentRepository.findById(paymentId, manager);
    if (!payment) {
      throw new NotFoundException('Không tìm thấy thanh toán');
    }

    // 2. Business validation
    this.validateRefundRequest(payment, refundAmount);

    // 3. Process refund with external provider
    await this.paymentProviderService.processRefund(payment, refundAmount);

    // 4. Update payment record
    await this.paymentRepository.updateRefundStatus(
      paymentId,
      refundAmount,
      reason,
      manager
    );
  });
}

private validateRefundRequest(payment: Payment, refundAmount: number): void {
  if (payment.status !== 'success') {
    throw new BadRequestException('Chỉ có thể refund payment có trạng thái success');
  }

  if (refundAmount > payment.amount) {
    throw new BadRequestException('Số tiền refund không thể lớn hơn số tiền thanh toán');
  }
}
```

**Simplified Procedure:**
```sql
CREATE OR REPLACE PROCEDURE sp_update_refund_status(
    p_payment_id UUID,
    p_refund_amount DECIMAL(10,2),
    p_reason TEXT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE "Payment"
    SET status = 'refunded',
        metadata = COALESCE(metadata, '{}'::jsonb) ||
                  jsonb_build_object(
                    'refund_amount', p_refund_amount,
                    'refund_reason', p_reason,
                    'refunded_at', CURRENT_TIMESTAMP
                  ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_payment_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy payment với ID: %', p_payment_id;
    END IF;
END;
$$;
```
## Kết luận

### Tóm tắt Vi phạm

| Stored Procedure | Vi phạm | Mức độ | Business Logic cần di chuyển |
|------------------|---------|--------|------------------------------|
| `sp_assign_shipper` | Role validation | 🟡 Medium | User role authorization |
| `sp_register_user` | Workflow logic | 🟡 Medium | User registration workflow + validation |
| `sp_process_refund` | Business validation | 🟡 Medium | Payment refund business rules |

### Lợi ích sau Refactor

**✅ Tuân thủ Clean Architecture:**
- Database layer chỉ thực hiện data operations
- Business logic được di chuyển về Application layer
- Domain rules được tách biệt khỏi infrastructure

**✅ Cải thiện Testability:**
- Business logic có thể unit test độc lập
- Mock dependencies dễ dàng hơn
- Test coverage tốt hơn

**✅ Tăng Maintainability:**
- Business rules dễ modify và extend
- Code organization rõ ràng hơn
- Separation of concerns tốt hơn

### Thách thức và Giải pháp

**Thách thức 1: Performance Impact**
- **Vấn đề:** Di chuyển logic từ database có thể ảnh hưởng performance
- **Giải pháp:** Sử dụng database transactions và connection pooling

**Thách thức 2: Transaction Management**
- **Vấn đề:** Đảm bảo data consistency khi logic ở application layer
- **Giải pháp:** Sử dụng TypeORM transactions với proper error handling

**Thách thức 3: Backward Compatibility**
- **Vấn đề:** Existing code có thể đang sử dụng stored procedures
- **Giải pháp:** Gradual migration với feature flags

### Bước tiếp theo

1. **Task 1.2:** Thiết kế NestJS Services Architecture với NestJS CLI
2. **Task 1.3:** Thiết lập Testing Strategy
3. **Phase 2:** Implement refactor cho 3 borderline cases

### Deliverables Task 1.1

- ✅ Audit report chi tiết cho 3 borderline cases
- ✅ Xác định business logic vi phạm Clean Architecture
- ✅ Thiết kế giải pháp refactor cho từng case
- ✅ Simplified procedures thay thế

**Task 1.1 hoàn thành thành công. Chuyển sang Task 1.2.**