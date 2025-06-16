# Chuyển đổi Authentication từ JWT sang Clerk

## Tổng quan

Dự án TheShoeBolt đã chuyển đổi hoàn toàn từ hệ thống authentication tự quản lý (JWT) sang sử dụng [Clerk](https://clerk.dev/) - một dịch vụ authentication-as-a-service. Tài liệu này mô tả các thay đổi đã thực hiện, cách thức hoạt động của hệ thống mới và hướng dẫn di chuyển dữ liệu người dùng.

## Nội dung chuyển đổi

### 1. Loại bỏ các thành phần cũ

Các file sau đây đã được xóa bỏ:

- `src/modules/auth/strategies/jwt.strategy.ts`: JWT strategy của Passport
- `src/modules/auth/strategies/local.strategy.ts`: Local strategy của Passport
- `src/modules/auth/guards/jwt-auth.guard.ts`: JWT guard cũ
- `src/modules/auth/guards/local-auth.guard.ts`: Local guard cũ
- `src/modules/auth/dto/login.dto.ts`: DTO cho login form

### 2. Các thay đổi chính

- **AuthService**: Đơn giản hóa, chỉ còn vai trò đồng bộ dữ liệu user giữa Clerk và database local
- **AuthController**: Loại bỏ endpoints login/register, thay bằng endpoint để đồng bộ dữ liệu user
- **ClerkAuthGuard**: Sử dụng để xác thực token từ Clerk
- **RolesGuard**: Đọc role từ user.publicMetadata (Clerk metadata)
- **WebSocket Gateway**: Cập nhật để xác thực user qua Clerk

### 3. Cấu trúc hệ thống mới

```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts  # Chỉ còn endpoints sử dụng Clerk
│   │   ├── auth.module.ts      # Đã loại bỏ JWT và Passport
│   │   ├── auth.service.ts     # Đơn giản hóa, vai trò đồng bộ dữ liệu
│   │   ├── guards/
│   │   │   ├── clerk-auth.guard.ts # Xác thực token từ Clerk
│   │   │   └── roles.guard.ts      # Đọc role từ Clerk metadata
│   │   └── decorators/
│   │       └── roles.decorator.ts  # Không thay đổi
│   └── clerk/
│       ├── clerk.controller.ts     # Quản lý session của Clerk
│       ├── clerk.module.ts         # Module configuration cho Clerk
│       └── clerk.session.service.ts # Quản lý các sessions
├── database/
│   └── migrations/
│       └── 1717757565123-add-clerk-id-to-users.ts # Migration thêm trường clerkId
└── tools/
    └── clerk-migration.ts  # Tool di chuyển dữ liệu user từ hệ thống cũ sang Clerk
```

## Cài đặt và cấu hình

### 1. Cài đặt Clerk SDK

```bash
npm install @clerk/clerk-sdk-node
```

### 2. Cấu hình environment variables

Thêm các biến môi trường sau vào file `.env`:

```
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### 3. Chạy migration để thêm trường clerkId

```bash
npm run migration:run
```

### 4. Chạy tool migration để di chuyển dữ liệu người dùng

```bash
ts-node src/tools/clerk-migration.ts
```

## Luồng xác thực

### Backend (API)

1. Client gửi request với Clerk token trong Authorization header
2. `ClerkAuthGuard` kiểm tra và xác thực token với Clerk SDK
3. User data từ Clerk được gắn vào request object
4. RolesGuard kiểm tra quyền hạn từ thông tin role lưu trong Clerk metadata

### WebSocket

1. Client gửi token trong handshake.auth hoặc headers
2. Gateway xác thực token với Clerk SDK
3. User data từ Clerk được gắn vào socket.data

## Kết hợp với Frontend

Phía frontend cần thực hiện:

1. Cài đặt Clerk React SDK: `npm install @clerk/clerk-react`
2. Cấu hình Clerk Provider với publishable key
3. Sử dụng các components có sẵn của Clerk: SignIn, SignUp, UserProfile
4. Lấy token từ Clerk để gửi kèm trong API requests

## Ưu điểm của Clerk

1. **Bảo mật cao cấp**: MFA, passwordless login, device tracking
2. **UI components sẵn sàng**: Giảm effort phát triển UI cho auth flow
3. **Quản lý user lifecycle toàn diện**: Verification, password reset, session management
4. **Social login**: Tích hợp sẵn với nhiều providers
5. **Compliance**: GDPR, SOC2 compliant

## Lưu ý khi chuyển đổi

1. **Dữ liệu người dùng**: Tool migration hỗ trợ di chuyển dữ liệu nhưng cần kiểm tra kỹ
2. **Frontend**: Frontend cần được cập nhật để sử dụng Clerk SDK thay vì form login/register truyền thống
3. **Session management**: Clerk quản lý session, không cần lưu trữ session trên backend
4. **Webhook**: Nên cấu hình webhook từ Clerk để đồng bộ dữ liệu user khi có thay đổi

## Tài liệu tham khảo

1. [Clerk Documentation](https://clerk.dev/docs)
2. [Clerk Node.js SDK](https://clerk.dev/docs/reference/node)
3. [Clerk React SDK](https://clerk.dev/docs/reference/react)
4. [NestJS Authentication](https://docs.nestjs.com/security/authentication)