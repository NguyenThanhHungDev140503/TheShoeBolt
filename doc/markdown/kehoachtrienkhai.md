Phân tích cho thấy:
- `ClerkController` sử dụng `ClerkSessionService` (từ cùng module `clerk`) để thực hiện các thao tác quản lý session. Điều này là tốt và phù hợp.
- Tuy nhiên, `ClerkController` cũng sử dụng `@UseGuards(ClerkAuthGuard)` (dòng 21), `ClerkAuthGuard` (dòng 14), `RolesGuard` (dòng 15), và `@Roles(UserRole.ADMIN)` (dòng 16, 59, 76). Tất cả các guard và decorator này đều được import từ `../auth/`, tức là từ `AuthModule`.

Điều này xác nhận điểm yếu về "phụ thuộc hai chiều không lý tưởng" được nêu trong báo cáo phân tích ([`doc/markdown/Phan_Tich_QH_Clerk_Auth_Module.md`](doc/markdown/Phan_Tich_QH_Clerk_Auth_Module.md:264)). Module `clerk` (cụ thể là `ClerkController`) đang phụ thuộc vào các thành phần của `AuthModule` để thực hiện xác thực và phân quyền cho các API của chính nó.

**Tóm tắt các phát hiện chính từ việc phân tích mã nguồn:**

1.  **Trùng lặp logic xác thực token**:
    *   `ClerkSessionService` có phương thức `verifySessionToken(token: string)` (dòng 51-60 trong [`src/modules/clerk/clerk.session.service.ts`](src/modules/clerk/clerk.session.service.ts:51)).
    *   `ClerkAuthGuard` trong `AuthModule` cũng thực hiện logic tương tự bằng cách gọi trực tiếp `clerkClient.verifyToken(token, {...})` (dòng 30 trong [`src/modules/auth/guards/clerk-auth.guard.ts`](src/modules/auth/guards/clerk-auth.guard.ts:30)) và sau đó là `clerkClient.sessions.getSession(sessionToken.sid)` (dòng 36 trong [`src/modules/auth/guards/clerk-auth.guard.ts`](src/modules/auth/guards/clerk-auth.guard.ts:36)).
    *   **Vấn đề**: `ClerkAuthGuard` nên sử dụng `ClerkSessionService.verifySessionToken()` thay vì tự mình gọi `clerkClient`. Điều này sẽ tập trung logic tương tác với Clerk SDK vào `ClerkModule`.

2.  **Phụ thuộc không lý tưởng của `ClerkController` vào `AuthModule`**:
    *   `ClerkController` ([`src/modules/clerk/clerk.controller.ts`](src/modules/clerk/clerk.controller.ts:1)) sử dụng `ClerkAuthGuard` và `RolesGuard` từ `AuthModule`.
    *   **Vấn đề**: Điều này tạo ra sự phụ thuộc từ module hạ tầng (`clerk`) sang module nghiệp vụ/hạ tầng khác (`auth`). Lý tưởng nhất, các module hạ tầng nên độc lập hoặc chỉ phụ thuộc vào các module hạ tầng cốt lõi hơn.

**Đề xuất giải pháp kiến trúc:**

Dựa trên các phát hiện và các đề xuất trong báo cáo phân tích ([`doc/markdown/Phan_Tich_QH_Clerk_Auth_Module.md`](doc/markdown/Phan_Tich_QH_Clerk_Auth_Module.md:270)), tôi đề xuất các bước sau để giải quyết sự trùng lặp và cải thiện kiến trúc:

1.  **Tái cấu trúc `ClerkAuthGuard`**:
    *   Sửa đổi [`src/modules/auth/guards/clerk-auth.guard.ts`](src/modules/auth/guards/clerk-auth.guard.ts:1) để inject và sử dụng `ClerkSessionService` (từ `ClerkModule`) thay vì gọi trực tiếp `clerkClient.verifyToken()` và `clerkClient.sessions.getSession()`.
    *   `ClerkSessionService.verifySessionToken()` có thể cần được điều chỉnh để trả về thông tin đầy đủ mà guard cần (session và user) hoặc guard sẽ gọi thêm các phương thức khác từ `ClerkSessionService` (ví dụ: một phương thức mới như `getUserFromSession(sessionId)`).

2.  **Giải quyết phụ thuộc của `ClerkController`**:
    *   **Lựa chọn A (Ưu tiên): Chuyển `ClerkAuthGuard` sang `ClerkModule`**.
        *   Vì `ClerkAuthGuard` thực hiện logic xác thực token cốt lõi của Clerk, việc đặt nó trong `ClerkModule` sẽ hợp lý hơn.
        *   `ClerkModule` sau đó có thể export `ClerkAuthGuard` này.
        *   `AuthModule` và các module khác cần xác thực Clerk sẽ import `ClerkAuthGuard` từ `ClerkModule`.
        *   Điều này sẽ loại bỏ sự phụ thuộc của `ClerkController` vào `AuthModule` cho việc xác thực.
    *   **Lựa chọn B (Nếu `RolesGuard` vẫn cần thiết cho `ClerkController`):**
        *   Xem xét việc tạo một module "core-auth" hoặc "shared-auth" chứa các decorator như `@Roles()` và có thể cả `RolesGuard` nếu nó thực sự là một thành phần dùng chung, không phụ thuộc cụ thể vào logic nghiệp vụ của `AuthModule`. Cả `AuthModule` và `ClerkModule` có thể import từ module dùng chung này. Tuy nhiên, việc này cần cân nhắc kỹ lưỡng để tránh làm phức tạp hóa không cần thiết.
        *   Một giải pháp đơn giản hơn có thể là `ClerkController` chỉ sử dụng `ClerkAuthGuard` (sau khi đã chuyển sang `ClerkModule`), và nếu cần phân quyền cụ thể cho các API của `ClerkController`, thì logic đó có thể được xử lý bên trong controller hoặc bằng một guard riêng biệt trong `ClerkModule` mà không cần đến `RolesGuard` của `AuthModule` nếu vai trò chỉ đơn giản là "admin" và có thể kiểm tra trực tiếp từ `request.user.publicMetadata`.

3.  **Đảm bảo `ClerkModule` là nguồn duy nhất cho tương tác Clerk SDK**:
    *   Tất cả các tương tác với `clerkClient` nên được đóng gói trong các services của `ClerkModule` (chủ yếu là `ClerkSessionService` và có thể thêm các service khác nếu cần, ví dụ `ClerkUserService` để lấy thông tin user).
    *   Các module khác (bao gồm `AuthModule`) sẽ inject và sử dụng các services này.

**Kế hoạch thực hiện các thay đổi (dưới dạng các bước cụ thể):**

1.  **Sửa đổi `ClerkAuthGuard` ([`src/modules/auth/guards/clerk-auth.guard.ts`](src/modules/auth/guards/clerk-auth.guard.ts:1)):**
    *   Inject `ClerkSessionService`.
    *   Thay thế các lệnh gọi `clerkClient.verifyToken()` và `clerkClient.sessions.getSession()` bằng cách gọi phương thức tương ứng từ `ClerkSessionService` (ví dụ: `this.clerkSessionService.verifySessionToken(token)`). Có thể cần điều chỉnh `ClerkSessionService.verifySessionToken` để trả về cả thông tin user nếu cần, hoặc thêm một phương thức mới trong `ClerkSessionService` để lấy user từ session ID.
    *   Vẫn giữ logic lấy `user` từ `clerkClient.users.getUser()` nếu `ClerkSessionService` chưa cung cấp chức năng này, nhưng lý tưởng nhất là `ClerkSessionService` nên có một phương thức như `getFullVerifiedSessionDetails(token)` trả về cả session và user.

2.  **Chuyển `ClerkAuthGuard` sang `ClerkModule` (Lựa chọn A được ưu tiên):**
    *   Di chuyển tệp `clerk-auth.guard.ts` từ `src/modules/auth/guards/` sang `src/modules/clerk/guards/`.
    *   Cập nhật đường dẫn import trong `ClerkAuthGuard` nếu cần.
    *   Thêm `ClerkAuthGuard` vào `providers` và `exports` của `ClerkModule` ([`src/modules/clerk/clerk.module.ts`](src/modules/clerk/clerk.module.ts:1)).
    *   Cập nhật tất cả các nơi đang sử dụng `ClerkAuthGuard` (bao gồm `ClerkController` và các controller khác) để import từ `ClerkModule`.

3.  **Xem xét `RolesGuard` cho `ClerkController`:**
    *   Nếu `ClerkAuthGuard` đã được chuyển sang `ClerkModule`, `ClerkController` sẽ không còn phụ thuộc trực tiếp vào `AuthModule` cho việc xác thực.
    *   Đối với `RolesGuard`:
        *   Nếu `ClerkController` chỉ cần kiểm tra vai trò "admin" đơn giản, có thể thực hiện kiểm tra này trực tiếp trong controller sau khi `ClerkAuthGuard` đã gắn thông tin user vào request (ví dụ: `if (req.user.publicMetadata?.role !== UserRole.ADMIN) throw new ForbiddenException();`).
        *   Hoặc, tạo một `AdminGuard` đơn giản bên trong `ClerkModule` chuyên dùng cho các endpoint admin của `ClerkController`.
        *   Điều này sẽ giúp loại bỏ hoàn toàn sự phụ thuộc của `ClerkController` vào `AuthModule`.

4.  **Rà soát lại `AuthModule`:**
    *   Đảm bảo `AuthService` ([`src/modules/auth/auth.service.ts`](src/modules/auth/auth.service.ts:1)) không còn tương tác trực tiếp với Clerk SDK (hiện tại có vẻ đã đúng).
    *   `AuthModule` sẽ tập trung vào logic nghiệp vụ như đồng bộ người dùng, quản lý hồ sơ người dùng cục bộ, và có thể là các khía cạnh ủy quyền phức tạp hơn nếu cần, sử dụng thông tin đã được xác thực và cung cấp bởi `ClerkModule`.

Tôi sẽ bắt đầu bằng việc đề xuất các thay đổi cụ thể cho `ClerkAuthGuard` để sử dụng `ClerkSessionService`.

Bạn có muốn tôi tiếp tục với việc tạo diff cho việc tái cấu trúc `ClerkAuthGuard` không? Hoặc bạn muốn thảo luận thêm về các lựa chọn giải quyết phụ thuộc cho `ClerkController`?