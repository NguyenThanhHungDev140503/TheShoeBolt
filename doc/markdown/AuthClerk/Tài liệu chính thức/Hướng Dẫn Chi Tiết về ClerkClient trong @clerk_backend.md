# Hướng Dẫn Chi Tiết về ClerkClient trong @clerk/backend

## 1. Giới thiệu

## 2. ClerkClient là gì?

## 3. Cài đặt và Khởi tạo ClerkClient

## 4. Các Chức năng Chính của ClerkClient

### 4.1. Quản lý Người dùng (User Management)

### 4.2. Quản lý Phiên (Session Management)

### 4.3. Quản lý Tổ chức (Organization Management)

### 4.4. Các Chức năng Khác

## 5. Best Practices khi sử dụng ClerkClient

## 6. Kết luận

## 7. Tài liệu tham khảo




## 1. Giới thiệu

Trong hệ sinh thái Clerk, `ClerkClient` từ gói `@clerk/backend` đóng vai trò là cầu nối mạnh mẽ giữa ứng dụng backend của bạn và Clerk Backend API. Nó cung cấp một bộ công cụ toàn diện để quản lý người dùng, phiên, tổ chức và nhiều tài nguyên khác của Clerk một cách lập trình. Thay vì phải tự mình xây dựng các HTTP request đến Clerk Backend API, `ClerkClient` cung cấp một giao diện thuận tiện và an toàn để tương tác với các dịch vụ của Clerk.

Bài viết này sẽ đi sâu vào `ClerkClient`, giải thích mục đích của nó, cách cài đặt và khởi tạo, các chức năng chính mà nó cung cấp, và những best practices để sử dụng nó một cách hiệu quả trong ứng dụng NestJS của bạn.




## 2. ClerkClient là gì?

`ClerkClient` là một instance của Clerk JavaScript Backend SDK, được tạo ra bằng hàm `createClerkClient()` từ gói `@clerk/backend`. Nó là một đối tượng chứa các phương thức để tương tác với các tài nguyên và tiện ích xác thực cấp thấp của Clerk Backend API trong môi trường JavaScript (Node.js, NestJS, Next.js API Routes, v.v.) [1].

**Mục đích chính của `ClerkClient`:**

*   **Truy cập Backend API:** `ClerkClient` cung cấp một giao diện lập trình để thực hiện các thao tác CRUD (Create, Read, Update, Delete) trên các tài nguyên của Clerk như người dùng (users), phiên (sessions), tổ chức (organizations), lời mời (invitations), v.v. Thay vì phải gửi các HTTP request trực tiếp đến các endpoint của Clerk Backend API, bạn có thể sử dụng các phương thức được định nghĩa sẵn trên `ClerkClient`.
*   **Đơn giản hóa tích hợp:** Nó trừu tượng hóa sự phức tạp của việc gọi API, xử lý xác thực (sử dụng `secretKey` của bạn), và quản lý phản hồi API.
*   **Tăng cường bảo mật:** Bằng cách sử dụng `ClerkClient`, bạn đảm bảo rằng các tương tác với Clerk Backend API được thực hiện một cách an toàn từ phía backend, tránh việc lộ `secretKey` ra phía frontend.
*   **Cung cấp tiện ích xác thực:** Ngoài việc quản lý tài nguyên, `ClerkClient` còn tích hợp các tiện ích xác thực quan trọng như `authenticateRequest()`, `verifyToken()`, và `verifyWebhook()` để giúp bạn xác thực các yêu cầu đến backend một cách hiệu quả và an toàn.

Ví dụ, nếu bạn muốn lấy danh sách tất cả người dùng trong ứng dụng của mình, thay vì phải tạo một `fetch` request đến endpoint `https://api.clerk.com/v1/users`, bạn có thể sử dụng phương thức `users.getUserList()` được cung cấp bởi `ClerkClient` [1].

Các hoạt động trên tài nguyên được gắn kết dưới dạng các sub-API trên đối tượng `clerkClient`. Ví dụ, để lấy danh sách người dùng, bạn sẽ sử dụng `getUserList()` trên sub-API `users` (`clerkClient.users.getUserList()`).




## 3. Cài đặt và Khởi tạo ClerkClient

Để sử dụng `ClerkClient` trong dự án NestJS của bạn, bạn cần thực hiện hai bước chính: cài đặt gói `@clerk/backend` và khởi tạo một instance của `ClerkClient`.

### 3.1. Cài đặt gói `@clerk/backend`

Bạn có thể cài đặt gói này bằng npm hoặc yarn:

```bash
npm install @clerk/backend
# hoặc yarn add @clerk/backend
# hoặc pnpm add @clerk/backend
```

### 3.2. Khởi tạo ClerkClient

`ClerkClient` được khởi tạo bằng hàm `createClerkClient()` từ gói `@clerk/backend`. Hàm này yêu cầu một đối tượng `options` chứa các khóa API của bạn. Điều quan trọng là phải bảo mật các khóa này và không bao giờ để lộ chúng ra phía frontend. Cách tốt nhất là sử dụng biến môi trường.

**Các tùy chọn chính khi khởi tạo `ClerkClient`:**

*   `secretKey` (bắt buộc): Đây là khóa bí mật của Clerk, được lấy từ trang **API keys** trong Clerk Dashboard của bạn. Khóa này là bắt buộc để `ClerkClient` có thể xác thực các yêu cầu đến Clerk Backend API và thực hiện các thao tác quản trị [1].
*   `jwtKey?` (tùy chọn): Đây là **JWKS Public Key** của bạn, cũng được lấy từ trang **API keys** trong Clerk Dashboard. Việc cung cấp `jwtKey` cho phép các tiện ích xác thực như `authenticateRequest()` và `verifyToken()` thực hiện xác thực token cục bộ (networkless), giúp cải thiện đáng kể hiệu suất bằng cách tránh các cuộc gọi mạng không cần thiết [1].
*   `publishableKey?` (tùy chọn): Khóa công khai của Clerk, thường được sử dụng ở phía frontend. Mặc dù không bắt buộc cho `ClerkClient` ở backend, nhưng đôi khi hữu ích cho một số cấu hình hoặc kiểm tra.
*   Các tùy chọn khác: `domain`, `isSatellite`, `proxyUrl`, `sdkMetadata`, `telemetry`, `userAgent`, `apiUrl`, `apiVersion`, `audience` cho phép tùy chỉnh sâu hơn hành vi của `ClerkClient` [1].

**Ví dụ khởi tạo trong NestJS:**

Trong môi trường NestJS, bạn nên tạo một Provider để khởi tạo `ClerkClient` và cung cấp nó cho toàn bộ ứng dụng. Điều này giúp quản lý dependency injection một cách sạch sẽ và hiệu quả.

Đầu tiên, đảm bảo bạn đã cài đặt `@nestjs/config` để quản lý biến môi trường:

```bash
npm install @nestjs/config
```

Sau đó, tạo file `src/providers/clerk-client.provider.ts`:

```typescript
// src/providers/clerk-client.provider.ts

import { Provider } from '@nestjs/common';
import { ClerkClient, createClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';

export const ClerkClientProvider: Provider = {
  provide: 'ClerkClient',
  useFactory: (configService: ConfigService): ClerkClient => {
    const secretKey = configService.get<string>('CLERK_SECRET_KEY');
    const jwtKey = configService.get<string>('CLERK_JWT_KEY'); // Tùy chọn, cho xác thực networkless

    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY is not set in environment variables.');
    }

    return createClerkClient({
      secretKey: secretKey,
      jwtKey: jwtKey, // Cung cấp jwtKey nếu có để tối ưu hiệu suất xác thực
    });
  },
  inject: [ConfigService],
};


```

Cuối cùng, đăng ký `ClerkClientProvider` này trong `AppModule` của bạn:

```typescript
// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClerkClientProvider } from './providers/clerk-client.provider';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Đảm bảo ConfigService có sẵn trên toàn bộ ứng dụng
    }),
  ],
  controllers: [],
  providers: [ClerkClientProvider],
  exports: [ClerkClientProvider], // Export để các module khác có thể sử dụng
})
export class AppModule {}
```

Với cấu hình này, bạn có thể inject `ClerkClient` vào bất kỳ service, controller, hoặc guard nào trong ứng dụng NestJS của mình bằng cách sử dụng `@Inject('ClerkClient')`.




## 4. Các Chức năng Chính của ClerkClient

`ClerkClient` cung cấp một tập hợp phong phú các phương thức được tổ chức thành các sub-API, cho phép bạn tương tác với hầu hết các tài nguyên của Clerk. Dưới đây là các chức năng chính và ví dụ sử dụng:

### 4.1. Quản lý Người dùng (User Management)

Sub-API `clerkClient.users` cho phép bạn thực hiện các thao tác quản lý người dùng như tạo, đọc, cập nhật, xóa người dùng, và quản lý các thuộc tính của họ.

*   **Lấy thông tin người dùng:**
    *   `getUser(userId: string)`: Lấy thông tin chi tiết của một người dùng cụ thể bằng ID [2].
    *   `getUserList(params?: GetUserListParams)`: Lấy danh sách tất cả người dùng hoặc người dùng theo các tiêu chí lọc [3].

    ```typescript
    // Ví dụ trong một UserService
    import { Injectable, Inject } from '@nestjs/common';
    import { ClerkClient, User } from '@clerk/backend';
    
    @Injectable()
    export class UserService {
      constructor(@Inject('ClerkClient') private readonly clerkClient: ClerkClient) {}
    
      async findUserById(userId: string): Promise<User | null> {
        try {
          const user = await this.clerkClient.users.getUser(userId);
          return user;
        } catch (error) {
          console.error(`Error fetching user ${userId}:`, error);
          return null;
        }
      }
    
      async listAllUsers(): Promise<User[]> {
        try {
          const users = await this.clerkClient.users.getUserList();
          return users;
        } catch (error) {
          console.error('Error fetching user list:', error);
          return [];
        }
      }
    }
    ```

*   **Tạo người dùng:**
    *   `createUser(params: CreateUserParams)`: Tạo một người dùng mới. Bạn có thể chỉ định email, số điện thoại, mật khẩu, và các thuộc tính khác [4].

    ```typescript
    // Ví dụ tạo người dùng mới
    async createNewUser(emailAddress: string, password?: string): Promise<User> {
      try {
        const newUser = await this.clerkClient.users.createUser({
          emailAddress: [emailAddress],
          password: password,
          // ... các thuộc tính khác như firstName, lastName
        });
        return newUser;
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    }
    ```

*   **Cập nhật người dùng:**
    *   `updateUser(userId: string, params: UpdateUserParams)`: Cập nhật thông tin của một người dùng hiện có [5].

    ```typescript
    // Ví dụ cập nhật tên người dùng
    async updateUserName(userId: string, firstName: string, lastName: string): Promise<User> {
      try {
        const updatedUser = await this.clerkClient.users.updateUser(userId, {
          firstName: firstName,
          lastName: lastName,
        });
        return updatedUser;
      } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        throw error;
      }
    }
    ```

*   **Xóa người dùng:**
    *   `deleteUser(userId: string)`: Xóa một người dùng khỏi hệ thống Clerk [6].

    ```typescript
    // Ví dụ xóa người dùng
    async deleteExistingUser(userId: string): Promise<void> {
      try {
        await this.clerkClient.users.deleteUser(userId);
        console.log(`User ${userId} deleted successfully.`);
      } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        throw error;
      }
    }
    ```

### 4.2. Quản lý Phiên (Session Management)

Sub-API `clerkClient.sessions` cho phép bạn quản lý các phiên đăng nhập của người dùng, bao gồm việc lấy thông tin phiên và thu hồi phiên.

*   **Lấy thông tin phiên:**
    *   `getSession(sessionId: string)`: Lấy thông tin chi tiết của một phiên cụ thể bằng ID [7].
    *   `getSessionList(params?: GetSessionListParams)`: Lấy danh sách các phiên theo các tiêu chí lọc [8].

    ```typescript
    // Ví dụ trong một SessionService
    import { Injectable, Inject } from '@nestjs/common';
    import { ClerkClient, Session } from '@clerk/backend';
    
    @Injectable()
    export class SessionService {
      constructor(@Inject('ClerkClient') private readonly clerkClient: ClerkClient) {}
    
      async getSessionDetails(sessionId: string): Promise<Session | null> {
        try {
          const session = await this.clerkClient.sessions.getSession(sessionId);
          return session;
        } catch (error) {
          console.error(`Error fetching session ${sessionId}:`, error);
          return null;
        }
      }
    }
    ```

*   **Thu hồi phiên:**
    *   `revokeSession(sessionId: string)`: Vô hiệu hóa một phiên đang hoạt động. Điều này thường được sử dụng cho chức năng đăng xuất từ xa hoặc khi phát hiện hoạt động đáng ngờ [9].

    ```typescript
    // Ví dụ thu hồi phiên
    async revokeUserSession(sessionId: string): Promise<Session> {
      try {
        const revokedSession = await this.clerkClient.sessions.revokeSession(sessionId);
        return revokedSession;
      } catch (error) {
        console.error(`Error revoking session ${sessionId}:`, error);
        throw error;
      }
    }
    ```

### 4.3. Quản lý Tổ chức (Organization Management)

Sub-API `clerkClient.organizations` cho phép bạn quản lý các tổ chức (Clerk Organizations), bao gồm tạo, đọc, cập nhật, xóa tổ chức và quản lý thành viên của chúng.

*   **Lấy thông tin tổ chức:**
    *   `getOrganization(organizationId: string)`: Lấy thông tin chi tiết của một tổ chức cụ thể [10].
    *   `getOrganizationList(params?: GetOrganizationListParams)`: Lấy danh sách các tổ chức [11].

*   **Tạo tổ chức:**
    *   `createOrganization(params: CreateOrganizationParams)`: Tạo một tổ chức mới [12].

*   **Quản lý thành viên tổ chức:**
    *   `getOrganizationMembershipList(organizationId: string)`: Lấy danh sách thành viên của một tổ chức [13].
    *   `createOrganizationMembership(organizationId: string, params: CreateOrganizationMembershipParams)`: Thêm thành viên vào tổ chức [14].
    *   `updateOrganizationMembership(organizationId: string, userId: string, params: UpdateOrganizationMembershipParams)`: Cập nhật vai trò của thành viên trong tổ chức [15].
    *   `deleteOrganizationMembership(organizationId: string, userId: string)`: Xóa thành viên khỏi tổ chức [16].

    ```typescript
    // Ví dụ trong một OrganizationService
    import { Injectable, Inject } from '@nestjs/common';
    import { ClerkClient, Organization, OrganizationMembership } from '@clerk/backend';
    
    @Injectable()
    export class OrganizationService {
      constructor(@Inject('ClerkClient') private readonly clerkClient: ClerkClient) {}
    
      async findOrganizationById(orgId: string): Promise<Organization | null> {
        try {
          const org = await this.clerkClient.organizations.getOrganization(orgId);
          return org;
        } catch (error) {
          console.error(`Error fetching organization ${orgId}:`, error);
          return null;
        }
      }
    
      async addMemberToOrganization(orgId: string, userId: string, role: 'admin' | 'basic_member'): Promise<OrganizationMembership> {
        try {
          const membership = await this.clerkClient.organizations.createOrganizationMembership(orgId, {
            userId: userId,
            role: role,
          });
          return membership;
        } catch (error) {
          console.error(`Error adding user ${userId} to organization ${orgId}:`, error);
          throw error;
        }
      }
    }
    ```

### 4.4. Các Chức năng Khác

Ngoài các chức năng quản lý người dùng, phiên và tổ chức, `ClerkClient` còn cung cấp các sub-API và phương thức cho nhiều tác vụ khác:

*   **`clerkClient.clients`**: Quản lý các client (ví dụ: lấy thông tin client, xóa client) [17].
*   **`clerkClient.invitations`**: Gửi và quản lý lời mời người dùng [18].
*   **`clerkClient.redirectUrls`**: Quản lý các URL chuyển hướng an toàn [19].
*   **`clerkClient.emailAddresses`, `clerkClient.phoneNumbers`**: Quản lý các định danh liên lạc của người dùng [20], [21].
*   **`clerkClient.samlConnections`**: Quản lý kết nối SAML [22].
*   **`clerkClient.signInTokens`**: Quản lý các token đăng nhập một lần [23].
*   **`clerkClient.webhooks`**: Chứa phương thức `verifyWebhook()` để xác minh chữ ký của webhook từ Clerk [24].

Các phương thức này cho phép bạn xây dựng các tính năng quản trị mạnh mẽ và tự động hóa các quy trình liên quan đến người dùng và xác thực trong ứng dụng backend của mình.




## 5. Best Practices khi sử dụng ClerkClient

Để sử dụng `ClerkClient` một cách hiệu quả, an toàn và tối ưu trong ứng dụng NestJS của bạn, hãy tuân thủ các best practices sau:

### 5.1. Bảo mật `secretKey` và `jwtKey`

*   **Luôn sử dụng biến môi trường:** Không bao giờ hardcode `secretKey` hoặc `jwtKey` trực tiếp trong mã nguồn của bạn. Luôn đọc chúng từ biến môi trường (ví dụ: `.env` file, Kubernetes secrets, AWS Secrets Manager, v.v.).
*   **Giới hạn quyền truy cập:** Đảm bảo rằng các biến môi trường này chỉ có thể truy cập được bởi ứng dụng backend của bạn và không bao giờ được gửi đến frontend hoặc lưu trữ ở những nơi không an toàn.

### 5.2. Tối ưu hóa hiệu suất với `jwtKey`

*   **Cung cấp `jwtKey` khi khởi tạo `ClerkClient`:** Như đã thảo luận ở Mục 3.2, việc cung cấp `jwtKey` (JWKS Public Key) khi khởi tạo `ClerkClient` sẽ cho phép các phương thức xác thực như `authenticateRequest()` và `verifyToken()` thực hiện xác thực token cục bộ (networkless). Điều này loại bỏ nhu cầu thực hiện cuộc gọi mạng đến Clerk Backend API để tải JWKS cho mỗi lần xác thực, giúp giảm đáng kể độ trễ và cải thiện hiệu suất của ứng dụng, đặc biệt trong các hệ thống có lưu lượng truy cập cao.

### 5.3. Xử lý lỗi một cách mạnh mẽ

*   **Sử dụng `try/catch`:** Các phương thức của `ClerkClient` trả về `Promise` và có thể ném lỗi (`ClerkAPIResponseError`) khi có vấn đề xảy ra (ví dụ: không tìm thấy tài nguyên, lỗi xác thực, lỗi mạng). Luôn bao bọc các cuộc gọi `ClerkClient` trong khối `try/catch` để xử lý lỗi một cách duyên dáng và cung cấp phản hồi phù hợp cho người dùng hoặc ghi log để gỡ lỗi.

    ```typescript
    // Ví dụ xử lý lỗi
    try {
      const user = await this.clerkClient.users.getUser("non_existent_user_id");
      console.log(user);
    } catch (error) {
      if (error.status === 404) {
        console.error("User not found.");
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
    ```

### 5.4. Tận dụng Dependency Injection trong NestJS

*   **Sử dụng Provider và `@Inject()`:** Như đã minh họa ở Mục 3.2, việc tạo một Provider cho `ClerkClient` và sử dụng `@Inject("ClerkClient")` là cách tốt nhất để quản lý `ClerkClient` trong NestJS. Điều này giúp mã nguồn của bạn sạch sẽ, dễ kiểm thử và dễ bảo trì hơn.

### 5.5. Ghi log các hoạt động quan trọng

*   **Ghi log các cuộc gọi API:** Ghi log các cuộc gọi quan trọng đến Clerk Backend API (ví dụ: tạo người dùng, xóa người dùng, thu hồi phiên) có thể rất hữu ích cho việc kiểm toán, gỡ lỗi và theo dõi hoạt động của ứng dụng.

### 5.6. Tránh các thao tác không cần thiết

*   **Chỉ gọi API khi cần:** Tránh gọi các phương thức của `ClerkClient` một cách không cần thiết. Ví dụ, nếu bạn đã có thông tin người dùng từ JWT sau khi xác thực, không cần phải gọi `clerkClient.users.getUser()` một lần nữa trừ khi bạn cần thông tin cập nhật hoặc chi tiết hơn không có trong JWT.

### 5.7. Xử lý Webhook một cách chính xác

*   **Sử dụng `verifyWebhook()`:** Khi nhận webhook từ Clerk, luôn sử dụng phương thức `verifyWebhook()` từ `@clerk/backend` để xác minh chữ ký của webhook. Điều này đảm bảo rằng webhook đến từ Clerk và không bị giả mạo, là một bước bảo mật cực kỳ quan trọng.
*   **Truy cập Raw Body:** `verifyWebhook()` yêu cầu raw body của request để xác minh chữ ký. Đảm bảo rằng middleware xử lý request của bạn không parse JSON body trước khi bạn có thể truy cập raw body cho webhook endpoint.

### 5.8. Cập nhật SDK thường xuyên

*   **Luôn cập nhật phiên bản mới nhất:** Clerk thường xuyên cập nhật SDK của mình với các tính năng mới, cải tiến hiệu suất và các bản vá bảo mật. Hãy đảm bảo bạn luôn sử dụng phiên bản `@clerk/backend` mới nhất để tận dụng những lợi ích này.




## 6. Kết luận

`ClerkClient` trong `@clerk/backend` là một công cụ không thể thiếu cho bất kỳ ứng dụng backend nào tích hợp với Clerk. Nó cung cấp một giao diện lập trình mạnh mẽ, an toàn và dễ sử dụng để quản lý tất cả các khía cạnh của xác thực và quản lý người dùng do Clerk cung cấp. Từ việc quản lý người dùng, phiên, tổ chức đến xử lý webhook và xác thực token, `ClerkClient` đơn giản hóa đáng kể quá trình phát triển và cho phép các nhà phát triển tập trung vào logic nghiệp vụ cốt lõi.

Bằng cách tuân thủ các best practices như bảo mật khóa API, tận dụng `jwtKey` để xác thực networkless, xử lý lỗi mạnh mẽ, và tích hợp hợp lý với hệ thống Dependency Injection của NestJS, bạn có thể xây dựng các ứng dụng backend an toàn, hiệu quả và có khả năng mở rộng cao với Clerk.

Việc hiểu rõ và sử dụng thành thạo `ClerkClient` sẽ giúp bạn khai thác tối đa tiềm năng của Clerk, mang lại trải nghiệm xác thực liền mạch và bảo mật cho người dùng của mình.




## 7. Tài liệu tham khảo

[1] Clerk Documentation. JavaScript Backend SDK. Available at: [https://clerk.com/docs/references/backend/overview](https://clerk.com/docs/references/backend/overview)

[2] Clerk Documentation. JS Backend SDK: getUser(). Available at: [https://clerk.com/docs/references/backend/users/get-user](https://clerk.com/docs/references/backend/users/get-user)

[3] Clerk Documentation. JS Backend SDK: getUserList(). Available at: [https://clerk.com/docs/references/backend/users/get-user-list](https://clerk.com/docs/references/backend/users/get-user-list)

[4] Clerk Documentation. JS Backend SDK: createUser(). Available at: [https://clerk.com/docs/references/backend/users/create-user](https://clerk.com/docs/references/backend/users/create-user)

[5] Clerk Documentation. JS Backend SDK: updateUser(). Available at: [https://clerk.com/docs/references/backend/users/update-user](https://clerk.com/docs/references/backend/users/update-user)

[6] Clerk Documentation. JS Backend SDK: deleteUser(). Available at: [https://clerk.com/docs/references/backend/users/delete-user](https://clerk.com/docs/references/backend/users/delete-user)

[7] Clerk Documentation. JS Backend SDK: getSession(). Available at: [https://clerk.com/docs/references/backend/sessions/get-session](https://clerk.com/docs/references/backend/sessions/get-session)

[8] Clerk Documentation. JS Backend SDK: getSessionList(). Available at: [https://clerk.com/docs/references/backend/sessions/get-session-list](https://clerk.com/docs/references/backend/sessions/get-session-list)

[9] Clerk Documentation. JS Backend SDK: revokeSession(). Available at: [https://clerk.com/docs/references/backend/sessions/revoke-session](https://clerk.com/docs/references/backend/sessions/revoke-session)

[10] Clerk Documentation. JS Backend SDK: getOrganization(). Available at: [https://clerk.com/docs/references/backend/organizations/get-organization](https://clerk.com/docs/references/backend/organizations/get-organization)

[11] Clerk Documentation. JS Backend SDK: getOrganizationList(). Available at: [https://clerk.com/docs/references/backend/organizations/get-organization-list](https://clerk.com/docs/references/backend/organizations/get-organization-list)

[12] Clerk Documentation. JS Backend SDK: createOrganization(). Available at: [https://clerk.com/docs/references/backend/organizations/create-organization](https://clerk.com/docs/references/backend/organizations/create-organization)

[13] Clerk Documentation. JS Backend SDK: getOrganizationMembershipList(). Available at: [https://clerk.com/docs/references/backend/organization-memberships/get-organization-membership-list](https://clerk.com/docs/references/backend/organization-memberships/get-organization-membership-list)

[14] Clerk Documentation. JS Backend SDK: createOrganizationMembership(). Available at: [https://clerk.com/docs/references/backend/organization-memberships/create-organization-membership](https://clerk.com/docs/references/backend/organization-memberships/create-organization-membership)

[15] Clerk Documentation. JS Backend SDK: updateOrganizationMembership(). Available at: [https://clerk.com/docs/references/backend/organization-memberships/update-organization-membership](https://clerk.com/docs/references/backend/organization-memberships/update-organization-membership)

[16] Clerk Documentation. JS Backend SDK: deleteOrganizationMembership(). Available at: [https://clerk.com/docs/references/backend/organization-memberships/delete-organization-membership](https://clerk.com/docs/references/backend/organization-memberships/delete-organization-membership)

[17] Clerk Documentation. JS Backend SDK: getClient(). Available at: [https://clerk.com/docs/references/backend/clients/get-client](https://clerk.com/docs/references/backend/clients/get-client)

[18] Clerk Documentation. JS Backend SDK: createInvitation(). Available at: [https://clerk.com/docs/references/backend/invitations/create-invitation](https://clerk.com/docs/references/backend/invitations/create-invitation)

[19] Clerk Documentation. JS Backend SDK: getRedirectUrl(). Available at: [https://clerk.com/docs/references/backend/redirect-urls/get-redirect-url](https://clerk.com/docs/references/backend/redirect-urls/get-redirect-url)

[20] Clerk Documentation. JS Backend SDK: getEmailAddress(). Available at: [https://clerk.com/docs/references/backend/email-addresses/get-email-address](https://clerk.com/docs/references/backend/email-addresses/get-email-address)

[21] Clerk Documentation. JS Backend SDK: getPhoneNumber(). Available at: [https://clerk.com/docs/references/backend/phone-numbers/get-phone-number](https://clerk.com/docs/references/backend/phone-numbers/get-phone-number)

[22] Clerk Documentation. JS Backend SDK: getSamlConnection(). Available at: [https://clerk.com/docs/references/backend/saml-connections/get-saml-connection](https://clerk.com/docs/references/backend/saml-connections/get-saml-connection)

[23] Clerk Documentation. JS Backend SDK: createSignInToken(). Available at: [https://clerk.com/docs/references/backend/sign-in-tokens/create-sign-in-token](https://clerk.com/docs/references/backend/sign-in-tokens/create-sign-in-token)

[24] Clerk Documentation. JS Backend SDK: verifyWebhook(). Available at: [https://clerk.com/docs/references/backend/webhooks/verify-webhook](https://clerk.com/docs/references/backend/webhooks/verify-webhook)

