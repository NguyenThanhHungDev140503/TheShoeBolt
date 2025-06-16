# Chi Tiết Implementation Tasks - TheShoeBolt Gap Analysis

## Phase 1: Core E-commerce Foundation

### Task 1: File Storage Module (Priority: Critical)
**Estimated Time:** 3-4 days  
**Dependencies:** None  

#### Files cần tạo:
```
src/modules/file-storage/
├── file-storage.controller.ts
├── file-storage.service.ts
├── file-storage.module.ts
├── dto/
│   ├── upload-file.dto.ts
│   └── update-file.dto.ts
├── entities/
│   └── file-storage.entity.ts
└── interfaces/
    └── storage-provider.interface.ts
```

#### Implementation Details:

**Entity Structure:**
```typescript
@Entity('file_storage')
export class FileStorage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column('bigint')
  size: number;

  @Column()
  path: string;

  @Column({ nullable: true })
  url: string;

  @ManyToOne(() => User, { nullable: true })
  uploadedBy: User;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```

**API Endpoints:**
- `POST /files/upload` - Upload file
- `GET /files/:id` - Get file info
- `DELETE /files/:id` - Delete file
- `PUT /files/:id` - Update file metadata
- `GET /files` - List user files
- Admin endpoints: `/files/all`, `/files/user/:userId`, `/files/batch`, `/files/stats`, `/files/settings`

**Required Dependencies:**
```bash
npm install multer @types/multer aws-sdk @aws-sdk/client-s3
# or
npm install @google-cloud/storage
```

### Task 2: Products Module (Priority: Critical)
**Estimated Time:** 5-7 days  
**Dependencies:** File Storage Module  

#### Files cần tạo:
```
src/modules/products/
├── products.controller.ts
├── products.service.ts
├── products.module.ts
├── categories.controller.ts
├── categories.service.ts
├── reviews.controller.ts
├── reviews.service.ts
├── dto/
│   ├── create-product.dto.ts
│   ├── update-product.dto.ts
│   ├── filter-products.dto.ts
│   ├── create-category.dto.ts
│   ├── update-category.dto.ts
│   ├── create-review.dto.ts
│   └── product-search.dto.ts
├── entities/
│   ├── product.entity.ts
│   ├── category.entity.ts
│   ├── product-variant.entity.ts
│   ├── product-review.entity.ts
│   └── product-image.entity.ts
└── interfaces/
    ├── product-filter.interface.ts
    └── product-search.interface.ts
```

#### Database Schema:

**Product Entity:**
```typescript
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { nullable: true })
  shortDescription: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  salePrice: number;

  @Column()
  sku: string;

  @Column('int', { default: 0 })
  stockQuantity: number;

  @Column('int', { default: 0 })
  soldCount: number;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column('int', { default: 0 })
  reviewCount: number;

  @ManyToOne(() => Category, category => category.products)
  category: Category;

  @OneToMany(() => ProductVariant, variant => variant.product)
  variants: ProductVariant[];

  @OneToMany(() => ProductReview, review => review.product)
  reviews: ProductReview[];

  @OneToMany(() => ProductImage, image => image.product)
  images: ProductImage[];

  @Column('json', { nullable: true })
  attributes: { [key: string]: any };

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**API Implementation Pattern:**
```typescript
@Controller('products')
@UseInterceptors(LoggingInterceptor)
export class ProductsController {
  @Get()
  @ApiOperation({ summary: 'Get products list with filters' })
  async findAll(@Query() filterDto: FilterProductsDto) {
    return this.productsService.findAll(filterDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products' })
  async search(@Query() searchDto: ProductSearchDto) {
    return this.productsService.search(searchDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create new product' })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }
}
```

### Task 3: RBAC Module (Priority: Critical)
**Estimated Time:** 4-5 days  
**Dependencies:** None  

#### Files cần tạo:
```
src/modules/rbac/
├── rbac.controller.ts
├── rbac.service.ts
├── rbac.module.ts
├── dto/
│   ├── create-role.dto.ts
│   ├── update-role.dto.ts
│   ├── assign-role.dto.ts
│   ├── create-permission.dto.ts
│   └── create-policy.dto.ts
├── entities/
│   ├── role.entity.ts
│   ├── permission.entity.ts
│   ├── user-role.entity.ts
│   └── role-permission.entity.ts
├── guards/
│   └── permissions.guard.ts
├── decorators/
│   └── permissions.decorator.ts
└── interfaces/
    └── rbac.interface.ts
```

#### RBAC Schema:
```typescript
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({ name: 'role_permissions' })
  permissions: Permission[];

  @OneToMany(() => UserRole, userRole => userRole.role)
  userRoles: UserRole[];
}

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  resource: string;

  @Column()
  action: string;

  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];
}
```

**Permission Guard:**
```typescript
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return this.rbacService.hasPermissions(user.id, requiredPermissions);
  }
}
```

### Task 4: Cart Module (Priority: Critical)
**Estimated Time:** 3-4 days  
**Dependencies:** Products Module, Redis  

#### Files cần tạo:
```
src/modules/cart/
├── cart.controller.ts
├── cart.service.ts
├── cart.module.ts
├── dto/
│   ├── add-to-cart.dto.ts
│   ├── update-cart-item.dto.ts
│   └── cart-checkout.dto.ts
├── schemas/
│   └── cart.schema.ts (MongoDB/Redis)
└── interfaces/
    ├── cart.interface.ts
    └── cart-item.interface.ts
```

#### Cart Schema (Redis):
```typescript
export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
  attributes?: { [key: string]: any };
}

export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}
```

## Phase 2: Order Processing

### Task 5: Promotions Module (Priority: High)
**Estimated Time:** 4-5 days  
**Dependencies:** Products Module  

#### Files cần tạo:
```
src/modules/promotions/
├── promotions.controller.ts
├── promotions.service.ts
├── promotions.module.ts
├── dto/
│   ├── create-promotion.dto.ts
│   ├── update-promotion.dto.ts
│   ├── apply-promotion.dto.ts
│   └── validate-promotion.dto.ts
├── entities/
│   ├── promotion.entity.ts
│   ├── promotion-usage.entity.ts
│   └── promotion-rule.entity.ts
└── interfaces/
    ├── promotion.interface.ts
    └── discount-calculator.interface.ts
```

#### Promotion Types:
```typescript
export enum PromotionType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping',
  BUY_X_GET_Y = 'buy_x_get_y',
}

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'enum', enum: PromotionType })
  type: PromotionType;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  discountValue: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minOrderAmount: number;

  @Column({ nullable: true })
  maxUsage: number;

  @Column({ default: 0 })
  usedCount: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;
}
```

### Task 6: Orders Module (Priority: Critical)
**Estimated Time:** 6-8 days  
**Dependencies:** Products, Cart, Promotions  

#### Complex Order State Management:
```typescript
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
  REFUNDED = 'refunded',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @OneToMany(() => OrderItem, item => item.order)
  items: OrderItem[];

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column('json')
  shippingAddress: Address;

  @Column('json')
  billingAddress: Address;

  @Column({ nullable: true })
  trackingNumber: string;

  @OneToMany(() => OrderStatusHistory, history => history.order)
  statusHistory: OrderStatusHistory[];
}
```

### Task 7: Checkout Module (Priority: Critical)
**Estimated Time:** 5-6 days  
**Dependencies:** Orders, Promotions, Payments  

#### Payment Processing Flow:
```typescript
export interface CheckoutSession {
  id: string;
  orderId: string;
  paymentIntentId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: string;
  amount: number;
  currency: string;
  expiresAt: Date;
}

@Injectable()
export class CheckoutService {
  async createCheckoutSession(createCheckoutDto: CreateCheckoutDto) {
    // 1. Validate cart items
    // 2. Apply promotions
    // 3. Calculate totals
    // 4. Create order
    // 5. Create payment intent
    // 6. Return checkout session
  }

  async confirmPayment(sessionId: string, paymentData: any) {
    // 1. Verify payment with gateway
    // 2. Update order status
    // 3. Send confirmation email
    // 4. Update inventory
    // 5. Clear cart
  }
}
```

## Phase 3: Communication & UX

### Task 8: Notifications Module (Priority: High)
**Estimated Time:** 4-5 days  
**Dependencies:** Orders, Email Service  

#### Multi-channel Notifications:
```typescript
export enum NotificationType {
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  IN_APP = 'in_app',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @Column('json', { nullable: true })
  data: any;

  @CreateDateColumn()
  createdAt: Date;
}
```

### Task 9: Wishlist Module (Priority: Medium)
**Estimated Time:** 2-3 days  
**Dependencies:** Products Module  

## Implementation Commands

### Database Migrations
```bash
# Generate migrations for each entity
npm run typeorm:generate-migration AddProductsTable
npm run typeorm:generate-migration AddCartTable  
npm run typeorm:generate-migration AddOrdersTable
npm run typeorm:generate-migration AddRBACTables
npm run typeorm:generate-migration AddPromotionsTable

# Run migrations
npm run typeorm:run-migrations
```

### Module Generation Commands
```bash
# Generate base module structure
nest g module products
nest g controller products
nest g service products

nest g module cart
nest g controller cart  
nest g service cart

# Repeat for all modules...
```

### Testing Strategy
```bash
# Unit tests for each service
npm run test products.service.spec.ts
npm run test cart.service.spec.ts
npm run test orders.service.spec.ts

# Integration tests for controllers
npm run test:e2e products.e2e-spec.ts
npm run test:e2e cart.e2e-spec.ts

# Full test suite
npm run test:cov
```

## Environment Setup

### Required Environment Variables
```env
# File Storage
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Payment Gateway
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# External Services
CLERK_SECRET_KEY=sk_test_...
ELASTICSEARCH_URL=http://localhost:9200
```

### Package Dependencies
```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "^3.0.0",
    "@stripe/stripe-js": "^1.0.0",
    "stripe": "^12.0.0",
    "@clerk/backend": "^0.23.0",
    "multer": "^1.4.5-lts.1",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0"
  }
}
```

Tài liệu này cung cấp roadmap implementation chi tiết với code structure cụ thể cho từng module thiếu trong dự án TheShoeBolt.