# Quản lý Session với Clerk SDK trong NestJS

Trong các ứng dụng hiện đại, quản lý phiên (session management) là một khía cạnh quan trọng để duy trì trạng thái người dùng và đảm bảo bảo mật. Clerk, với vai trò là một nền tảng xác thực và quản lý người dùng toàn diện, cung cấp các công cụ mạnh mẽ để quản lý các phiên người dùng một cách hiệu quả. Bài luận này sẽ đi sâu vào cách bạn có thể tận dụng Clerk SDK trong môi trường NestJS để lấy thông tin phiên, thu hồi phiên và truy cập các session claims, từ đó xây dựng các ứng dụng an toàn và linh hoạt.

## 1. Giới thiệu về Session trong Clerk

Trong Clerk, một session đại diện cho một phiên đăng nhập đang hoạt động của người dùng. Mỗi khi người dùng đăng nhập thành công, Clerk sẽ tạo một session duy nhất. Session này được liên kết với một người dùng cụ thể và chứa các thông tin quan trọng về phiên làm việc, bao gồm thời gian tạo, thời gian hết hạn, và các thông tin liên quan đến người dùng. Các session token (JWT) được phát hành dựa trên các session này để xác thực các yêu cầu đến backend.

Clerk cung cấp một bộ API mạnh mẽ để quản lý các session từ phía backend, cho phép bạn có toàn quyền kiểm soát các phiên người dùng. Điều này đặc biệt hữu ích cho các tác vụ quản trị, bảo mật, hoặc khi bạn cần đồng bộ hóa trạng thái phiên giữa Clerk và hệ thống nội bộ của mình.

## 2. Chuẩn bị NestJS cho Clerk Client

Để tương tác với các API quản lý session của Clerk, bạn cần khởi tạo `ClerkClient` trong ứng dụng NestJS của mình. `ClerkClient` là một đối tượng được cung cấp bởi `@clerk/backend` SDK, cho phép bạn gọi các phương thức liên quan đến người dùng, phiên, tổ chức, v.v. Để đảm bảo `ClerkClient` có thể được sử dụng trên toàn bộ ứng dụng NestJS, chúng ta sẽ tạo một Provider tùy chỉnh.

### 2.1. Cài đặt các gói cần thiết

Đảm bảo bạn đã cài đặt các gói sau:

```bash
npm install @clerk/backend @nestjs/config
# hoặc yarn add @clerk/backend @nestjs/config
```

### 2.2. Tạo Clerk Client Provider

Bạn có thể tạo một provider để khởi tạo `ClerkClient` và cung cấp nó cho các module khác. Ví dụ, tạo file `src/providers/clerk-client.provider.ts`:

```typescript
// src/providers/clerk-client.provider.ts

import { Provider } from '@nestjs/common';
import { ClerkClient, createClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';

export const ClerkClientProvider: Provider = {
  provide: 'ClerkClient',
  useFactory: (configService: ConfigService): ClerkClient => {
    const secretKey = configService.get<string>('CLERK_SECRET_KEY');
    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY is not set in environment variables.');
    }
    return createClerkClient({ secretKey });
  },
  inject: [ConfigService],
};
```

Sau đó, đăng ký `ClerkClientProvider` này trong `AppModule`:

```typescript
// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClerkClientProvider } from './providers/clerk-client.provider';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [ClerkClientProvider],
})
export class AppModule {}
```

Với cấu hình này, `ClerkClient` đã sẵn sàng để được inject và sử dụng trong các thành phần khác của ứng dụng NestJS, mở đường cho việc triển khai các cơ chế quản lý session mạnh mẽ của Clerk.

## 3. Lấy thông tin Session (Get Session Information)

Để lấy thông tin chi tiết về một session cụ thể, bạn có thể sử dụng phương thức `getSession()` từ `clerkClient.sessions`. Phương thức này yêu cầu `sessionId` làm tham số và trả về một đối tượng `Session` chứa đầy đủ thông tin về phiên đó.

### 3.1. Phương thức `getSession()`

*   **Mục đích:** Truy xuất một session duy nhất dựa trên ID của nó.
*   **Cú pháp:** `clerkClient.sessions.getSession(sessionId: string): Promise<Session>`
*   **Thông tin trả về:** Một đối tượng `Session` bao gồm các thuộc tính như `id`, `userId`, `status`, `expireAt`, `abandonAt`, `lastActiveAt`, `actor`, `client`, `user`, `publicUserData`, `externalAccounts`, `lastActiveOrganizationId`, `organizationMemberships`, `latestActivity` [1].

### 3.2. Ví dụ triển khai trong NestJS

Bạn có thể inject `ClerkClient` vào một service và sử dụng `getSession()` để lấy thông tin session. Ví dụ, tạo `src/session/session.service.ts`:

```typescript
// src/session/session.service.ts

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ClerkClient, Session } from '@clerk/backend';

@Injectable()
export class SessionService {
  constructor(@Inject('ClerkClient') private readonly clerkClient: ClerkClient) {}

  async getSessionInfo(sessionId: string): Promise<Session> {
    try {
      const session = await this.clerkClient.sessions.getSession(sessionId);
      if (!session) {
        throw new NotFoundException(`Session with ID ${sessionId} not found.`);
      }
      return session;
    } catch (error) {
      console.error(`Error getting session ${sessionId}:`, error);
      throw error;
    }
  }
}
```

Sau đó, bạn có thể sử dụng service này trong một controller:

```typescript
// src/session/session.controller.ts

import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard'; // Giả sử bạn có ClerkAuthGuard

@Controller('sessions')
@UseGuards(ClerkAuthGuard) // Bảo vệ endpoint này
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get(':sessionId')
  async getSessionDetails(@Param('sessionId') sessionId: string) {
    const session = await this.sessionService.getSessionInfo(sessionId);
    return session;
  }
}
```

Đừng quên đăng ký `SessionService` và `SessionController` trong một `SessionModule` và import nó vào `AppModule`.

## 4. Thu hồi Session (Revoke Session)

Thu hồi một session có nghĩa là vô hiệu hóa nó, khiến người dùng không thể sử dụng session đó để xác thực các yêu cầu tiếp theo. Điều này rất quan trọng cho các tính năng bảo mật như đăng xuất, buộc đăng xuất người dùng, hoặc khi phát hiện hoạt động đáng ngờ.

### 4.1. Phương thức `revokeSession()`

*   **Mục đích:** Vô hiệu hóa một session đang hoạt động dựa trên ID của nó. Khi một session bị thu hồi, người dùng sẽ bị đăng xuất khỏi tất cả các ứng dụng khách (client applications) mà session đó đang được sử dụng [2].
*   **Cú pháp:** `clerkClient.sessions.revokeSession(sessionId: string): Promise<Session>`
*   **Thông tin trả về:** Đối tượng `Session` của phiên đã bị thu hồi. Trạng thái (`status`) của session này sẽ được cập nhật thành `ended`.

### 4.2. Ví dụ triển khai trong NestJS

Bạn có thể thêm phương thức `revokeSession` vào `SessionService`:

```typescript
// src/session/session.service.ts (tiếp tục)

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ClerkClient, Session } from '@clerk/backend';

@Injectable()
export class SessionService {
  constructor(@Inject('ClerkClient') private readonly clerkClient: ClerkClient) {}

  async getSessionInfo(sessionId: string): Promise<Session> {
    // ... (phương thức getSessionInfo đã có)
  }

  async revokeUserSession(sessionId: string): Promise<Session> {
    try {
      const revokedSession = await this.clerkClient.sessions.revokeSession(sessionId);
      return revokedSession;
    } catch (error) {
      console.error(`Error revoking session ${sessionId}:`, error);
      throw error;
    }
  }
}
```

Và thêm endpoint vào `SessionController`:

```typescript
// src/session/session.controller.ts (tiếp tục)

import { Controller, Post, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { SessionService } from './session.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@Controller('sessions')
@UseGuards(ClerkAuthGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get(':sessionId')
  async getSessionDetails(@Param('sessionId') sessionId: string) {
    // ... (phương thức getSessionDetails đã có)
  }

  @Post(':sessionId/revoke')
  @HttpCode(HttpStatus.NO_CONTENT) // Trả về 204 No Content khi thành công
  async revokeSession(@Param('sessionId') sessionId: string) {
    await this.sessionService.revokeUserSession(sessionId);
    // Không cần trả về gì vì đã dùng HttpCode(HttpStatus.NO_CONTENT)
  }
}
```

## 5. Lấy Session Claims

Session claims là các thông tin được mã hóa trong JWT (session token) của Clerk. Chúng chứa các dữ liệu quan trọng về người dùng và phiên, chẳng hạn như `userId`, `sessionId`, `orgId` (nếu có), và các `claims` tùy chỉnh khác. Việc truy cập các claims này là nền tảng cho việc ủy quyền (authorization) và cá nhân hóa trải nghiệm người dùng.

Thông thường, bạn sẽ lấy session claims sau khi xác thực thành công một JWT bằng `authenticateRequest()` hoặc `verifyToken()`. Cả hai phương thức này đều trả về một đối tượng chứa các claims đã giải mã.

### 5.1. Truy cập Claims từ `authenticateRequest()`

Khi bạn sử dụng `authenticateRequest()` trong một Guard hoặc middleware, nó sẽ trả về một đối tượng chứa `sessionId`, `userId`, `orgId`, và `claims` (là payload đầy đủ của JWT). Bạn có thể gắn các thông tin này vào đối tượng `request` để các controller và service có thể dễ dàng truy cập.

```typescript
// src/auth/clerk-auth.guard.ts (ví dụ từ bài luận trước)

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { Request } from 'express';
import { ClerkClient, authenticateRequest } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';

interface ClerkRequest extends Request {
  clerkUser?: { sessionId: string; userId: string; orgId?: string; claims: any };
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    @Inject('ClerkClient') private readonly clerkClient: ClerkClient,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ClerkRequest>();

    try {
      const jwtKey = this.configService.get<string>('CLERK_JWT_KEY');
      const { sessionId, userId, orgId, claims } = await authenticateRequest({
        headers: request.headers,
        cookies: request.cookies,
      }, {
        jwtKey: jwtKey,
        secretKey: this.configService.get<string>('CLERK_SECRET_KEY'),
        authorizedParties: [this.configService.get<string>('CLERK_FRONTEND_API_URL')],
      });

      if (!userId) {
        throw new UnauthorizedException('User not authenticated');
      }

      // Gắn thông tin người dùng và claims vào request
      request.clerkUser = { sessionId, userId, orgId, claims };

      return true;
    } catch (error) {
      console.error('Clerk authentication failed:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
```

Sau đó, trong controller hoặc service, bạn có thể truy cập `req.clerkUser.claims`:

```typescript
// src/users/users.controller.ts (ví dụ)

import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { Request } from 'express';

interface ClerkRequest extends Request {
  clerkUser?: { sessionId: string; userId: string; orgId?: string; claims: any };
}

@Controller('users')
@UseGuards(ClerkAuthGuard)
export class UsersController {
  @Get('my-claims')
  getMyClaims(@Req() req: ClerkRequest) {
    // Truy cập trực tiếp các claims từ request
    return req.clerkUser.claims;
  }

  @Get('my-role')
  getMyRole(@Req() req: ClerkRequest) {
    // Ví dụ truy cập một claim cụ thể, ví dụ 'role' nếu bạn có cấu hình trong JWT template
    // Lưu ý: 'role' là một ví dụ, bạn cần biết cấu trúc claims của mình
    const userRole = req.clerkUser.claims.role || 'default';
    return { userId: req.clerkUser.userId, role: userRole };
  }
}
```

### 5.2. Truy cập Claims từ `verifyToken()`

Khi sử dụng `verifyToken()`, phương thức này trực tiếp trả về payload đã giải mã của JWT (là các claims). Bạn có thể sử dụng các claims này để lấy thông tin cần thiết.

```typescript
// src/auth/auth.service.ts (ví dụ từ bài luận trước)

import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { verifyToken, ClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @Inject('ClerkClient') private readonly clerkClient: ClerkClient,
    private readonly configService: ConfigService,
  ) {}

  async verifyClerkToken(token: string): Promise<any> {
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    try {
      const jwtKey = this.configService.get<string>('CLERK_JWT_KEY');
      const decodedToken = await verifyToken(token, {
        jwtKey: jwtKey,
        secretKey: this.configService.get<string>('CLERK_SECRET_KEY'),
        authorizedParties: [this.configService.get<string>('CLERK_FRONTEND_API_URL')],
      });

      // decodedToken chính là các claims
      return decodedToken;
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
```

### 5.3. Session Claims và Custom Claims

Clerk tự động thêm một số claims tiêu chuẩn vào JWT như `sub` (userId), `sid` (sessionId), `azp` (authorized party). Ngoài ra, bạn có thể cấu hình các **Custom Claims** thông qua JWT Templates trong Clerk Dashboard. Điều này cho phép bạn nhúng các thông tin tùy chỉnh (ví dụ: vai trò người dùng, cấp độ truy cập) trực tiếp vào JWT, giúp đơn giản hóa logic ủy quyền ở backend mà không cần phải thực hiện thêm các cuộc gọi API đến Clerk hoặc cơ sở dữ liệu của bạn.

Để truy cập các custom claims, bạn chỉ cần truy cập thuộc tính tương ứng trong đối tượng `claims` (hoặc `decodedToken`).

## 6. Kết luận

Quản lý session là một phần không thể thiếu của bất kỳ ứng dụng web an toàn nào. Với Clerk SDK trong NestJS, bạn có các công cụ mạnh mẽ và linh hoạt để thực hiện các tác vụ này một cách hiệu quả. Từ việc lấy thông tin chi tiết về một session bằng `getSession()`, đến việc vô hiệu hóa một session bằng `revokeSession()`, và đặc biệt là truy cập các session claims thông qua `authenticateRequest()` hoặc `verifyToken()` để hỗ trợ logic ủy quyền và cá nhân hóa.

Việc tích hợp đúng đắn các phương thức này không chỉ nâng cao tính bảo mật của ứng dụng mà còn cải thiện trải nghiệm người dùng bằng cách cung cấp khả năng kiểm soát phiên linh hoạt. Luôn đảm bảo rằng bạn đã cấu hình `ClerkClient` một cách chính xác với `secretKey` và tận dụng khả năng xác thực không cần mạng bằng cách cung cấp `jwtKey` để tối ưu hóa hiệu suất.

## 7. Tài liệu tham khảo

[1] Clerk Documentation. JS Backend SDK: getSession(). Available at: [https://clerk.com/docs/references/backend/sessions/get-session](https://clerk.com/docs/references/backend/sessions/get-session)

[2] Clerk Documentation. JS Backend SDK: revokeSession(). Available at: [https://clerk.com/docs/references/backend/sessions/revoke-session](https://clerk.com/docs/references/backend/sessions/revoke-session)


