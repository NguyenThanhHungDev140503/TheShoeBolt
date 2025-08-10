# Kế hoạch Refactor Database Layer - Tuân thủ Clean Architecture

**Người thực hiện:** Augment Agent  
**Ngày thực hiện:** 18/01/2025  
**Người giám sát:** default_user  
**Tham chiếu:** Báo cáo Phân tích Stored Procedures và Functions - Clean Architecture

## Tóm tắt Báo cáo

Kế hoạch này triển khai việc refactor database layer để tuân thủ nguyên tắc Clean Architecture, loại bỏ business logic khỏi stored procedures/functions và di chuyển về Application/Domain Layer trong NestJS. Mục tiêu chính là đảm bảo database layer chỉ thực hiện data access operations, validation cơ bản và database-specific optimizations.

**Nguyên tắc Clean Architecture được áp dụng:**
- Business logic KHÔNG được đặt trong Database Layer
- Stored procedures/functions chỉ thực hiện data operations đơn thuần
- Complex workflows thuộc về Application/Domain Services
- Database layer tập trung vào performance và data integrity

**Timeline tổng cộng:** 6-8 tuần với 3 phases chính

## Nội dung Kế hoạch

### Phân loại Stored Procedures/Functions Hiện tại

#### 🔴 Vi phạm Nghiêm trọng (Critical Violations) - LOẠI BỎ HOÀN TOÀN
Các procedures này chứa complex business workflows và vi phạm nghiêm trọng Clean Architecture:

**Không tìm thấy trong file hiện tại:**
- `sp_process_order` - Complex order processing workflow
- `sp_create_user_with_role` - User creation với role assignment logic

#### 🔴 Vi phạm Đáng kể (Major Violations) - LOẠI BỎ HOÀN TOÀN  
**Không tìm thấy trong file hiện tại:**
- `sp_apply_discount` - Discount calculation logic
- `fn_calculate_order_total` - Order total calculation với business rules

#### 🟡 Vùng biên giới (Borderline Cases) - XEM XÉT VÀ QUYẾT ĐỊNH
**Có trong file hiện tại:**
- `sp_update_product_stock` - **KHÔNG CÓ** (chỉ có prepared statement `update_product_stock`)
- `fn_check_product_availability` - **KHÔNG CÓ** (chỉ có `fn_check_stock`)

#### 🟢 Hợp lệ (Compliant) - GIỮ LẠI VÀ TỐI ƯU
**Có trong file hiện tại:**
- `fn_search_products` - Data retrieval với filtering
- `sp_register_user` - Simple user creation (có thể cần review)
- `sp_update_order_status` - Simple status update
- `sp_add_address` - Simple data insertion
- `sp_create_payment` - Payment record creation
- `sp_update_payment_status` - Simple status update

### Phase 1: Phân tích và Chuẩn bị (1-2 tuần)

#### Task 1.1: Audit Toàn bộ Database Layer
**Mục tiêu:** Rà soát lại toàn bộ stored procedures/functions trong file hiện tại

**Phát hiện từ file `sql/theshoe.sql`:**
```sql
-- Stored Procedures hiện có:
1. sp_update_order_status - ✅ Hợp lệ (simple status update)
2. sp_remove_from_cart - ✅ Hợp lệ (simple data operation)
3. sp_add_address - ✅ Hợp lệ (simple insertion với validation)
4. sp_set_default_address - ✅ Hợp lệ (simple update operation)
5. sp_create_payment - ✅ Hợp lệ (simple record creation)
6. sp_update_payment_status - ✅ Hợp lệ (simple status update)
7. sp_assign_shipper - 🟡 Borderline (có role validation logic)
8. sp_update_shipping_status - ✅ Hợp lệ (simple status update)
9. sp_register_user - 🟡 Borderline (tạo user + cart + wishlist)
10. sp_update_user_profile - ✅ Hợp lệ (simple profile update)
11. sp_process_refund - 🟡 Borderline (có business validation)
12. sp_toggle_payment_method - ✅ Hợp lệ (simple toggle operation)

-- Functions hiện có:
1. fn_check_stock - ✅ Hợp lệ (simple stock check)
2. fn_search_products - ✅ Hợp lệ (data retrieval với filtering)
3. fn_get_payment_stats - ✅ Hợp lệ (reporting function)
4. fn_get_provider_revenue - ✅ Hợp lệ (reporting function)
```

**Kết luận:** File hiện tại đã khá tuân thủ Clean Architecture, chỉ có 3 cases cần xem xét.

#### Task 1.2: Thiết kế NestJS Services Architecture
**Mục tiêu:** Thiết kế cấu trúc services để tiếp nhận logic từ database

```typescript
// Cấu trúc services cần tạo
src/
├── modules/
│   ├── user/
│   │   ├── services/
│   │   │   ├── user.service.ts
│   │   │   └── user-registration.service.ts
│   ├── shipping/
│   │   ├── services/
│   │   │   └── shipping.service.ts
│   ├── payment/
│   │   ├── services/
│   │   │   └── payment-refund.service.ts
```

#### Task 1.3: Thiết lập Testing Strategy
**Mục tiêu:** Đảm bảo không break functionality khi refactor

```typescript
// Testing approach
1. Unit tests cho existing stored procedures
2. Integration tests cho workflows
3. E2E tests cho critical user journeys
4. Performance benchmarks
```

**Deliverables Phase 1:**
- Audit report chi tiết
- NestJS services architecture design
- Testing strategy document
- Migration timeline chi tiết

**Timeline:** 1-2 tuần

---

### Phase 2: Refactor Borderline Cases (2-3 tuần)

#### Task 2.1: Refactor sp_assign_shipper
**Vấn đề hiện tại:**
```sql
-- Chứa role validation logic
IF NOT EXISTS (
    SELECT 1 FROM "UserRole" ur
    JOIN "Role" r ON ur.role_id = r.id
    WHERE ur.user_id = p_shipper_id AND r.name = 'shipper'
) THEN
    RAISE EXCEPTION 'Người dùng không phải shipper';
END IF;
```

**Giải pháp:** Di chuyển role validation về ShippingService

```typescript
// shipping.service.ts
@Injectable()
export class ShippingService {
  async assignShipper(orderId: string, shipperId: string): Promise<void> {
    // Business logic: Validate shipper role
    const isShipper = await this.userService.hasRole(shipperId, 'shipper');
    if (!isShipper) {
      throw new BadRequestException('Người dùng không phải shipper');
    }
    
    // Simple data operation
    await this.shippingRepository.assignShipper(orderId, shipperId);
  }
}
```

**Thay thế stored procedure:**
```sql
-- Simplified procedure - chỉ data operation
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

#### Task 2.2: Refactor sp_register_user
**Vấn đề hiện tại:**
```sql
-- Chứa workflow logic: user + cart + wishlist creation
INSERT INTO "User" (name, email, sodienthoai, password)
VALUES (p_name, p_email, p_sodienthoai, p_hashed_password)
RETURNING id INTO v_new_user_id;

-- Tự động tạo giỏ hàng cho người dùng mới
INSERT INTO "Cart" (user_id) VALUES (v_new_user_id);
-- Tự động tạo danh sách yêu thích cho người dùng mới
INSERT INTO "Wishlist" (user_id) VALUES (v_new_user_id);
```

**Giải pháp:** Di chuyển workflow về UserRegistrationService

```typescript
// user-registration.service.ts
@Injectable()
export class UserRegistrationService {
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
    // Business validation logic
    if (await this.userRepository.existsByEmail(userData.email)) {
      throw new ConflictException('Email đã tồn tại');
    }
    if (await this.userRepository.existsByPhone(userData.phone)) {
      throw new ConflictException('Số điện thoại đã tồn tại');
    }
  }
}
```

**Thay thế stored procedure:**
```sql
-- Simple user creation procedure
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

#### Task 2.3: Refactor sp_process_refund
**Vấn đề hiện tại:**
```sql
-- Chứa business validation logic
IF v_payment_status != 'success' THEN
    RAISE EXCEPTION 'Chỉ có thể refund payment có trạng thái success';
END IF;

IF p_refund_amount > v_payment_amount THEN
    RAISE EXCEPTION 'Số tiền refund không thể lớn hơn số tiền thanh toán';
END IF;
```

**Giải pháp:** Di chuyển business logic về PaymentRefundService

```typescript
// payment-refund.service.ts
@Injectable()
export class PaymentRefundService {
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
}
```

**Thay thế stored procedure:**
```sql
-- Simple refund update procedure
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

**Deliverables Phase 2:**
- 3 NestJS services được implement
- 3 simplified stored procedures
- Unit tests cho tất cả services
- Integration tests cho workflows
- Performance comparison report

**Timeline:** 2-3 tuần

---

### Phase 3: Tối ưu và Hoàn thiện (2-3 tuần)

#### Task 3.1: Optimize Compliant Functions
**Mục tiêu:** Cải thiện performance cho các functions hợp lệ

```sql
-- Tối ưu fn_search_products với better indexing
CREATE INDEX CONCURRENTLY idx_product_search_optimized 
ON "Product" USING GIN (
  to_tsvector('vietnamese_unaccent', name || ' ' || COALESCE(description, ''))
);

-- Tối ưu fn_get_payment_stats với materialized view
CREATE MATERIALIZED VIEW mv_payment_stats AS
SELECT 
    pm.provider,
    pm.name as payment_method_name,
    DATE(p.created_at) as payment_date,
    COUNT(p.id) as total_transactions,
    SUM(CASE WHEN p.status = 'success' THEN p.amount ELSE 0 END) as total_amount,
    SUM(CASE WHEN p.status = 'success' THEN p.provider_fee ELSE 0 END) as total_fees
FROM "Payment" p
JOIN "PaymentMethod" pm ON p.payment_method_id = pm.id
GROUP BY pm.provider, pm.name, DATE(p.created_at);

-- Refresh schedule
CREATE OR REPLACE FUNCTION refresh_payment_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_payment_stats;
END;
$$ LANGUAGE plpgsql;
```

#### Task 3.2: Implement Comprehensive Testing
**Mục tiêu:** Đảm bảo quality và performance

```typescript
// E2E test example
describe('User Registration Workflow', () => {
  it('should register user and create associated resources', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '0123456789',
      password: 'hashedPassword'
    };
    
    const user = await userRegistrationService.registerUser(userData);
    
    expect(user).toBeDefined();
    expect(user.email).toBe(userData.email);
    
    // Verify cart and wishlist created
    const cart = await cartService.findByUserId(user.id);
    const wishlist = await wishlistService.findByUserId(user.id);
    
    expect(cart).toBeDefined();
    expect(wishlist).toBeDefined();
  });
});

// Performance test example
describe('Payment Refund Performance', () => {
  it('should process refund within acceptable time', async () => {
    const startTime = Date.now();
    
    await paymentRefundService.processRefund(paymentId, 100, 'Test refund');
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });
});
```

#### Task 3.3: Documentation và Training
**Mục tiêu:** Đảm bảo team hiểu và áp dụng đúng nguyên tắc

```markdown
## Clean Architecture Guidelines for Database Layer

### ✅ Allowed in Database Layer
- Simple CRUD operations
- Data validation (constraints, basic checks)
- Database-specific optimizations (indexes, materialized views)
- Atomic operations (single table updates)
- Reporting queries (aggregations, joins)

### ❌ Not Allowed in Database Layer
- Business rule validation
- Complex workflows
- External API calls
- Multi-step business processes
- Domain logic calculations

### Migration Checklist
Before creating any stored procedure/function:
1. [ ] Does it contain business logic? → Move to service layer
2. [ ] Does it validate business rules? → Move to service layer
3. [ ] Is it a simple data operation? → OK for database layer
4. [ ] Is it a performance optimization? → OK for database layer
```

**Deliverables Phase 3:**
- Optimized database functions
- Comprehensive test suite (100+ test cases)
- Performance benchmarks
- Documentation và guidelines
- Team training materials

**Timeline:** 2-3 tuần

---

## Implementation Guidelines

### Database Layer Responsibilities (Final State)

#### ✅ Allowed Operations
```sql
-- Simple data retrieval
PREPARE get_user_by_id (UUID) AS
    SELECT * FROM "User" WHERE id = $1;

-- Simple status updates
CREATE OR REPLACE PROCEDURE sp_update_order_status(
    p_order_id UUID,
    p_new_status VARCHAR(20)
) AS $$
BEGIN
    UPDATE "Order" 
    SET status = p_new_status, updated_at = CURRENT_TIMESTAMP
    WHERE id = p_order_id;
END;
$$;

-- Database-specific optimizations
CREATE INDEX idx_product_search ON "Product" 
USING GIN (to_tsvector('vietnamese_unaccent', name));

-- Reporting functions
CREATE OR REPLACE FUNCTION fn_get_sales_report(
    p_start_date DATE,
    p_end_date DATE
) RETURNS TABLE(...) AS $$
    SELECT ... FROM "Order" o
    JOIN "OrderDetail" od ON o.id = od.order_id
    WHERE o.created_at BETWEEN p_start_date AND p_end_date
    GROUP BY ...;
$$;
```

#### ❌ Prohibited Operations
```sql
-- ❌ Business logic validation
IF order_total < minimum_order_amount THEN
    RAISE EXCEPTION 'Order amount too low';
END IF;

-- ❌ Complex workflows
-- Creating order + updating inventory + sending notifications

-- ❌ External integrations
-- Calling payment APIs, sending emails

-- ❌ Domain calculations
-- Calculating discounts, taxes, shipping costs
```

### NestJS Services Pattern

```typescript
// Service layer structure
@Injectable()
export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private inventoryService: InventoryService,
    private paymentService: PaymentService,
    private notificationService: NotificationService
  ) {}
  
  async processOrder(orderData: ProcessOrderDto): Promise<Order> {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Business validation
      await this.validateOrderRules(orderData);
      
      // 2. Calculate totals
      const total = await this.calculateOrderTotal(orderData);
      
      // 3. Create order (simple database operation)
      const order = await this.orderRepository.create({
        ...orderData,
        totalAmount: total
      }, manager);
      
      // 4. Update inventory
      await this.inventoryService.reserveItems(orderData.items, manager);
      
      // 5. Process payment
      await this.paymentService.processPayment(order.id, total, manager);
      
      return order;
    });
  }
}
```

## Risk Mitigation

### Backward Compatibility Strategy
```typescript
// Gradual migration approach
@Injectable()
export class UserService {
  async registerUser(userData: RegisterUserDto): Promise<User> {
    if (this.configService.get('USE_LEGACY_REGISTRATION')) {
      // Call old stored procedure
      return await this.userRepository.registerUserLegacy(userData);
    } else {
      // Use new service-based approach
      return await this.userRegistrationService.registerUser(userData);
    }
  }
}
```

### Performance Monitoring
```typescript
// Performance tracking
@Injectable()
export class PerformanceMonitoringService {
  async trackMigrationPerformance(operation: string, fn: () => Promise<any>) {
    const startTime = Date.now();
    const result = await fn();
    const duration = Date.now() - startTime;
    
    this.metricsService.recordDuration(`migration.${operation}`, duration);
    
    if (duration > this.getThreshold(operation)) {
      this.alertService.sendPerformanceAlert(operation, duration);
    }
    
    return result;
  }
}
```

## Testing Strategy

### Test Coverage Requirements
- **Unit Tests:** 90%+ coverage cho tất cả services
- **Integration Tests:** 100% coverage cho critical workflows
- **E2E Tests:** 100% coverage cho user journeys
- **Performance Tests:** Baseline và regression testing

### Test Examples
```typescript
// Unit test
describe('PaymentRefundService', () => {
  it('should validate refund amount', async () => {
    const payment = { amount: 100, status: 'success' };
    
    await expect(
      service.processRefund('payment-id', 150, 'test')
    ).rejects.toThrow('Số tiền refund không thể lớn hơn số tiền thanh toán');
  });
});

// Integration test
describe('User Registration Integration', () => {
  it('should create user with cart and wishlist', async () => {
    const userData = createTestUserData();
    
    const user = await userRegistrationService.registerUser(userData);
    
    // Verify database state
    const dbUser = await userRepository.findById(user.id);
    const cart = await cartRepository.findByUserId(user.id);
    const wishlist = await wishlistRepository.findByUserId(user.id);
    
    expect(dbUser).toBeDefined();
    expect(cart).toBeDefined();
    expect(wishlist).toBeDefined();
  });
});
```

## Timeline và Milestones

| Phase | Duration | Key Deliverables | Success Criteria |
|-------|----------|------------------|------------------|
| Phase 1 | 1-2 tuần | Audit, Design, Testing Strategy | Complete analysis, approved architecture |
| Phase 2 | 2-3 tuần | Refactor 3 borderline cases | All services implemented, tests passing |
| Phase 3 | 2-3 tuần | Optimization, Documentation | Performance targets met, team trained |

### Critical Success Factors
1. **Zero Downtime:** Migration không ảnh hưởng production
2. **Performance Parity:** New implementation không chậm hơn 10%
3. **Test Coverage:** 90%+ coverage cho tất cả migrated code
4. **Team Adoption:** 100% team members trained và confident

## Kết luận

Kế hoạch refactor này sẽ đưa database layer về đúng vai trò trong Clean Architecture:
- **Database Layer:** Chỉ thực hiện data operations và optimizations
- **Application Layer:** Chứa business logic và workflows
- **Domain Layer:** Chứa business rules và validations

**Lợi ích đạt được:**
- ✅ **Better Separation of Concerns:** Rõ ràng về responsibility
- ✅ **Improved Testability:** Business logic có thể unit test
- ✅ **Enhanced Maintainability:** Dễ modify business rules
- ✅ **Better Performance:** Database tập trung vào data operations
- ✅ **Scalability:** Services có thể scale independently

**Next Steps:**
1. Review và approval kế hoạch
2. Setup development environment
3. Implement Phase 1 - Analysis và preparation
4. Execute Phase 2 - Refactor borderline cases
5. Complete Phase 3 - Optimization và documentation

Timeline tổng cộng: **6-8 tuần** với 3 phases song song và có thể overlap để tối ưu thời gian.