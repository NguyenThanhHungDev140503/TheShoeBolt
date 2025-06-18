# Kế hoạch Triển khai Tái cấu trúc `ClerkAuthGuard` và `RolesGuard` (Cập nhật)

Mục tiêu: Di chuyển `ClerkAuthGuard` sang `ClerkModule` và giải quyết phụ thuộc của `ClerkController` vào `RolesGuard` từ `AuthModule` để loại bỏ phụ thuộc vòng tròn và cải thiện cấu trúc module.

## Các bước thực hiện:

1.  **Tạo Thư mục Đích**:
    *   Đảm bảo thư mục `src/modules/clerk/guards/` tồn tại. Nếu chưa, tạo mới.

2.  **Di chuyển Tệp `clerk-auth.guard.ts`**:
    *   Di chuyển tệp `clerk-auth.guard.ts` từ `src/modules/auth/guards/` đến `src/modules/clerk/guards/`.

3.  **Cập nhật Đường dẫn Import Nội bộ (trong `ClerkAuthGuard`)**:
    *   Đọc nội dung của tệp `src/modules/clerk/guards/clerk-auth.guard.ts` sau khi di chuyển.
    *   Kiểm tra và cập nhật bất kỳ đường dẫn import nào bên trong `ClerkAuthGuard` có thể bị ảnh hưởng bởi việc di chuyển (ví dụ: đường dẫn đến `ClerkSessionService`).

4.  **Cập nhật `ClerkModule` (`src/modules/clerk/clerk.module.ts`) cho `ClerkAuthGuard`**:
    *   Đọc nội dung của `ClerkModule`.
    *   Import `ClerkAuthGuard` từ vị trí mới (`../guards/clerk-auth.guard`).
    *   Thêm `ClerkAuthGuard` vào mảng `providers` của `ClerkModule`.
    *   Thêm `ClerkAuthGuard` vào mảng `exports` của `ClerkModule`.

5.  **Giải quyết Phụ thuộc `RolesGuard` trong `ClerkController`**:
    *   Phân tích `ClerkController` (`src/modules/clerk/clerk.controller.ts`) để xác định cách nó sử dụng `RolesGuard` (`src/modules/auth/guards/roles.guard.ts`) và `Roles` decorator (`src/modules/auth/decorators/roles.decorator.ts`).
    *   **Phương án A (Ưu tiên nếu logic đơn giản): Kiểm tra vai trò trực tiếp trong `ClerkController`**.
        *   Sau khi `ClerkAuthGuard` (đã được chuyển sang `ClerkModule`) xác thực và gắn thông tin người dùng (bao gồm `publicMetadata` chứa vai trò) vào `request`.
        *   Trong các phương thức của `ClerkController` yêu cầu vai trò admin, truy cập `req.user.publicMetadata.role` (hoặc tương tự, tùy theo cấu trúc `publicMetadata`) để kiểm tra vai trò.
        *   Nếu không phải admin, ném `ForbiddenException`.
        *   Xóa bỏ việc sử dụng `@UseGuards(RolesGuard)` và `@Roles(...)` trong `ClerkController`.
    *   **Phương án B (Nếu logic phức tạp hoặc cần tái sử dụng): Tạo `AdminGuard` trong `ClerkModule`**.
        *   Tạo tệp `src/modules/clerk/guards/admin.guard.ts`.
        *   Sao chép logic kiểm tra vai trò từ `RolesGuard` vào `AdminGuard` mới. `AdminGuard` này sẽ kiểm tra cụ thể `UserRole.ADMIN`.
        *   Tạo tệp `src/modules/clerk/decorators/admin-role.decorator.ts` (nếu cần một decorator tương tự `@Roles` nhưng chỉ cho admin, hoặc có thể không cần nếu `AdminGuard` tự kiểm tra).
        *   Cập nhật `ClerkModule`:
            *   Import và thêm `AdminGuard` vào `providers` và `exports`.
        *   Cập nhật `ClerkController`:
            *   Thay thế `@UseGuards(RolesGuard)` bằng `@UseGuards(AdminGuard)`.
            *   Thay thế `@Roles(UserRole.ADMIN)` bằng decorator mới (nếu có) hoặc xóa bỏ nếu `AdminGuard` đã đủ.
    *   Mục tiêu: `ClerkController` không còn import `RolesGuard` hay `Roles` decorator từ `AuthModule`.

6.  **Cập nhật Các Nơi Sử dụng `ClerkAuthGuard` (Ngoài `ClerkController`)**:
    *   Sử dụng công cụ `search_files` để tìm tất cả các tệp (ngoài `ClerkController` đã xử lý ở bước 5) đang import `ClerkAuthGuard` từ đường dẫn cũ.
    *   Đối với mỗi tệp tìm thấy:
        *   Đọc nội dung tệp.
        *   Cập nhật dòng import `ClerkAuthGuard` để trỏ đến `src/modules/clerk/guards/clerk-auth.guard.ts` (thông qua `ClerkModule` nếu ở module khác).

7.  **Dọn dẹp `AuthModule` (`src/modules/auth/auth.module.ts`)**:
    *   Đọc nội dung của `AuthModule`.
    *   Xóa `ClerkAuthGuard` khỏi `providers` hoặc `exports` (nếu có).
    *   Xóa import không còn sử dụng của `ClerkAuthGuard`.
    *   Nếu `RolesGuard` và `Roles` decorator không còn được module nào khác ngoài `AuthModule` sử dụng (sau khi `ClerkController` đã được cập nhật), và `AuthModule` cũng không tự sử dụng chúng nữa, thì có thể xem xét việc giữ chúng lại trong `AuthModule` (nếu `AuthModule` vẫn cần chúng cho các controller/service riêng của nó) hoặc xóa bỏ nếu không cần thiết. **Hiện tại, tập trung vào việc `ClerkController` không phụ thuộc vào `AuthModule` nữa.**

8.  **Kiểm tra và Hoàn tất**:
    *   Xem xét lại các thay đổi để đảm bảo tính nhất quán và không có lỗi cú pháp.

## Sơ đồ Kế hoạch (Cập nhật):
```mermaid
graph TD
    A[Bắt đầu Tái cấu trúc] --> B{Thư mục src/modules/clerk/guards/ tồn tại?};
    B -- Không --> C[Tạo thư mục src/modules/clerk/guards/];
    B -- Có --> D[Di chuyển clerk-auth.guard.ts sang src/modules/clerk/guards/];
    C --> D;
    D --> E[Cập nhật import nội bộ trong ClerkAuthGuard (nếu cần)];
    E --> F[Cập nhật ClerkModule: providers & exports cho ClerkAuthGuard];
    F --> G[Giải quyết RolesGuard trong ClerkController];
    G -- Phương án A --> GA[Kiểm tra vai trò trực tiếp trong ClerkController];
    G -- Phương án B --> GB[Tạo AdminGuard trong ClerkModule];
    GA --> H[Cập nhật các nơi khác sử dụng ClerkAuthGuard];
    GB --> H;
    H --> I[Dọn dẹp AuthModule];
    I --> J[Kết thúc Tái cấu trúc];