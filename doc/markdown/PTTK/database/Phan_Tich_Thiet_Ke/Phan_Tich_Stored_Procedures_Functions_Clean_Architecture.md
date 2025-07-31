# Báo cáo Phân tích Stored Procedures và Functions - Tuân thủ Clean Architecture

**Người thực hiện:** Augment Agent  
**Ngày thực hiện:** 18/01/2025  
**Người giám sát:** default_user  

## Tóm tắt Báo cáo

Báo cáo này trình bày kết quả phân tích toàn diện các Stored Procedures và Functions trong file `sql/theshoe.sql` của hệ thống TheShoe, nhằm đánh giá mức độ tuân thủ nguyên tắc Clean Architecture. Phân tích tập trung vào việc xác định xem có vi phạm Dependency Rule khi đặt business logic ở Infrastructure Layer (Database) hay không.

**Nguyên tắc Clean Architecture được áp dụng:**
- Logic nghiệp vụ KHÔNG được đặt trong Stored Procedures/Functions
- Database layer chỉ thực hiện data access, validation cơ bản, và database-specific operations
- Complex business rules và domain logic thuộc về Application/Domain Layer (NestJS services)

## Nội dung Phân tích

### Danh sách Stored Procedures và Functions Hiện có

Sau khi rà soát file `sql/theshoe.sql`, dưới đây là danh sách đầy đủ các procedures và functions được phát hiện:

#### Stored Procedures (sp_*)

1. **sp_create_user_with_role**
   - **Mục đích:** Tạo user mới và gán role trong một transaction
   - **Tham số:** p_name, p_email, p_phone, p_password, p_role_name
   - **Phân loại:** 🔴 **VI PHẠM**
   - **Lý do:** Chứa business logic về việc tạo user và gán role, bao gồm validation và workflow logic

2. **sp_update_product_stock**
   - **Mục đích:** Cập nhật số lượng tồn kho sản phẩm
   - **Tham số:** p_product_id, p_quantity_change
   - **Phân loại:** 🟡 **BIÊN GIỚI** 
   - **Lý do:** Có validation cơ bản nhưng chứa business rule về stock management

3. **sp_process_order**
   - **Mục đích:** Xử lý đơn hàng hoàn chỉnh từ cart đến order
   - **Tham số:** p_user_id, p_discount_code, p_address_id
   - **Phân loại:** 🔴 **VI PHẠM NGHIÊM TRỌNG**
   - **Lý do:** Chứa complex business workflow, pricing logic, inventory management

4. **sp_apply_discount**
   - **Mục đích:** Áp dụng mã giảm giá cho đơn hàng
   - **Tham số:** p_order_id, p_discount_code
   - **Phân loại:** 🔴 **VI PHẠM**
   - **Lý do:** Chứa business logic về discount calculation và validation rules

#### Functions (fn_*)

1. **fn_calculate_order_total**
   - **Mục đích:** Tính tổng giá trị đơn hàng
   - **Tham số:** p_order_id
   - **Phân loại:** 🔴 **VI PHẠM**
   - **Lý do:** Chứa business logic về pricing calculation

2. **fn_get_user_order_history**
   - **Mục đích:** Lấy lịch sử đơn hàng của user
   - **Tham số:** p_user_id, p_limit, p_offset
   - **Phân loại:** 🟢 **HỢP LỆ**
   - **Lý do:** Chỉ thực hiện data retrieval với pagination

3. **fn_check_product_availability**
   - **Mục đích:** Kiểm tra tình trạng có sẵn của sản phẩm
   - **Tham số:** p_product_id, p_quantity
   - **Phân loại:** 🟡 **BIÊN GIỚI**
   - **Lý do:** Simple validation nhưng có thể coi là business rule

4. **fn_get_popular_products**
   - **Mục đích:** Lấy danh sách sản phẩm phổ biến
   - **Tham số:** p_limit, p_category_id
   - **Phân loại:** 🟢 **HỢP LỆ**
   - **Lý do:** Data aggregation và retrieval operation

5. **fn_search_products**
   - **Mục đích:** Tìm kiếm sản phẩm với full-text search
   - **Tham số:** p_search_term, p_category_id, p_min_price, p_max_price
   - **Phân loại:** 🟢 **HỢP LỆ**
   - **Lý do:** Database-specific search operation

### Phân tích Chi tiết theo Mức độ Vi phạm

#### 🔴 Vi phạm Nghiêm trọng (Critical Violations)

**1. sp_process_order**
```sql
-- Chứa complex business workflow
-- Bao gồm: inventory check, pricing, discount application, payment processing
-- Thuộc về Domain/Application Layer
```

**Vấn đề:**
- Chứa toàn bộ order processing workflow
- Mixing concerns: inventory, pricing, payment
- Khó test và maintain
- Vi phạm Single Responsibility Principle

**Đề xuất:** Di chuyển toàn bộ logic về `OrderService` trong NestJS

#### 🔴 Vi phạm Đáng kể (Major Violations)

**1. sp_create_user_with_role**
- Chứa user creation workflow và role assignment logic
- Thuộc về User Domain Service

**2. sp_apply_discount**
- Chứa discount calculation và validation business rules
- Thuộc về Promotion Domain Service

**3. fn_calculate_order_total**
- Chứa pricing calculation logic
- Thuộc về Order Domain Service

#### 🟡 Vùng Biên giới (Borderline Cases)

**1. sp_update_product_stock**
- Simple operation nhưng có business validation
- Có thể chấp nhận nếu chỉ là atomic operation

**2. fn_check_product_availability**
- Basic validation có thể coi là database constraint
- Acceptable nếu chỉ check simple rules

#### 🟢 Hợp lệ (Compliant)

**1. fn_get_user_order_history**
- Pure data retrieval với pagination
- Đúng vai trò của database layer

**2. fn_get_popular_products**
- Data aggregation operation
- Database-specific optimization

**3. fn_search_products**
- Full-text search với database-specific features
- Hợp lý để tận dụng PostgreSQL capabilities

### Thống kê Tổng quan

| Phân loại | Số lượng | Tỷ lệ | Mức độ ưu tiên sửa |
|-----------|----------|-------|-------------------|
| 🔴 Vi phạm nghiêm trọng | 1 | 12.5% | Critical |
| 🔴 Vi phạm đáng kể | 3 | 37.5% | High |
| 🟡 Vùng biên giới | 2 | 25% | Medium |
| 🟢 Hợp lệ | 2 | 25% | - |
| **Tổng cộng** | **8** | **100%** | |

### Đề xuất Cải thiện

#### Phase 1: Critical Priority (1-2 tuần)

**1. Refactor sp_process_order**
```typescript
// Di chuyển về OrderService
class OrderService {
  async processOrder(userId: string, discountCode?: string, addressId?: string) {
    // Business logic here
    return await this.orderRepository.createOrder(orderData);
  }
}
```

**2. Thay thế sp_create_user_with_role**
```typescript
// Di chuyển về UserService
class UserService {
  async createUserWithRole(userData: CreateUserDto, roleName: string) {
    // User creation and role assignment logic
  }
}
```

#### Phase 2: High Priority (2-3 tuần)

**1. Refactor sp_apply_discount**
```typescript
// Di chuyển về PromotionService
class PromotionService {
  async applyDiscount(orderId: string, discountCode: string) {
    // Discount calculation logic
  }
}
```

**2. Refactor fn_calculate_order_total**
```typescript
// Di chuyển về OrderService
class OrderService {
  async calculateOrderTotal(orderId: string): Promise<number> {
    // Pricing calculation logic
  }
}
```

#### Phase 3: Medium Priority (3-4 tuần)

**1. Review Borderline Cases**
- Đánh giá lại `sp_update_product_stock` và `fn_check_product_availability`
- Quyết định giữ lại hoặc di chuyển dựa trên complexity

**2. Optimize Compliant Functions**
- Cải thiện performance cho `fn_search_products`
- Thêm caching cho `fn_get_popular_products`

### Nguyên tắc Thiết kế Mới

#### Database Layer Responsibilities (Allowed)
```sql
-- ✅ Data retrieval với filtering/pagination
-- ✅ Database-specific operations (full-text search, aggregation)
-- ✅ Simple data validation (constraints, basic checks)
-- ✅ Atomic operations (single table updates)
```

#### Application Layer Responsibilities (Required)
```typescript
// ✅ Business workflow và orchestration
// ✅ Complex calculations và business rules
// ✅ Cross-domain operations
// ✅ External service integrations
```

### Implementation Guidelines

#### 1. Database Functions - Allowed Patterns
```sql
-- ✅ Simple data retrieval
CREATE OR REPLACE FUNCTION fn_get_orders_by_status(p_status VARCHAR)
RETURNS TABLE(...) AS $$
BEGIN
    RETURN QUERY SELECT * FROM "Order" WHERE status = p_status;
END;
$$ LANGUAGE plpgsql;

-- ✅ Database-specific operations
CREATE OR REPLACE FUNCTION fn_search_products_fts(p_term TEXT)
RETURNS TABLE(...) AS $$
BEGIN
    RETURN QUERY 
    SELECT * FROM "Product" 
    WHERE to_tsvector('vietnamese_unaccent', name) @@ plainto_tsquery(p_term);
END;
$$ LANGUAGE plpgsql;
```

#### 2. Application Services - Required Patterns
```typescript
// ✅ Business logic in services
@Injectable()
export class OrderService {
  async processOrder(orderData: ProcessOrderDto): Promise<Order> {
    // 1. Validate business rules
    await this.validateOrderRules(orderData);
    
    // 2. Calculate pricing
    const total = await this.calculateTotal(orderData);
    
    // 3. Apply discounts
    const finalAmount = await this.applyDiscounts(total, orderData.discountCode);
    
    // 4. Create order
    return await this.orderRepository.create({
      ...orderData,
      totalAmount: finalAmount
    });
  }
}
```

## Kết luận

### Đánh giá Tổng thể
Hệ thống TheShoe hiện tại có **50% procedures/functions vi phạm** nguyên tắc Clean Architecture bằng cách đặt business logic ở database layer. Điều này tạo ra các vấn đề:

1. **Tight Coupling:** Business logic bị ràng buộc với database implementation
2. **Testing Difficulty:** Khó test business logic khi nó nằm trong database
3. **Maintainability:** Khó maintain và modify business rules
4. **Scalability:** Khó scale khi business logic phân tán

### Lợi ích Khi Cải thiện
1. **Better Separation of Concerns:** Rõ ràng về responsibility của từng layer
2. **Improved Testability:** Business logic có thể unit test dễ dàng
3. **Enhanced Maintainability:** Dễ dàng modify business rules
4. **Better Performance:** Database tập trung vào data operations

### Timeline Thực hiện
- **Phase 1 (Critical):** 1-2 tuần
- **Phase 2 (High):** 2-3 tuần  
- **Phase 3 (Medium):** 3-4 tuần
- **Total Timeline:** 6-9 tuần

### Next Steps
1. Thảo luận và approval cho refactoring plan
2. Bắt đầu với Phase 1 - Critical violations
3. Thiết lập testing strategy cho migrated logic
4. Implement gradual migration với backward compatibility
5. Monitor performance impact sau migration

**Khuyến nghị:** Ưu tiên refactor `sp_process_order` trước vì đây là core business function và vi phạm nghiêm trọng nhất nguyên tắc Clean Architecture.