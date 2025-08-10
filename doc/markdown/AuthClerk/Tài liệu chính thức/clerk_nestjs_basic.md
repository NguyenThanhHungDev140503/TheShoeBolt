# Hướng dẫn chi tiết về xác thực với Clerk trong NestJS

## Giới thiệu

Xác thực người dùng là một phần quan trọng của hầu hết các ứng dụng web hiện đại. Việc triển khai một hệ thống xác thực an toàn và hiệu quả có thể phức tạp và tốn thời gian. Clerk là một nền tảng quản lý người dùng và xác thực toàn diện, cung cấp các giải pháp dễ dàng tích hợp để xử lý các tác vụ liên quan đến người dùng, cho phép các nhà phát triển tập trung vào logic kinh doanh cốt lõi của ứng dụng. Bài luận này sẽ đi sâu vào cách tích hợp Clerk vào một ứng dụng NestJS, cung cấp một hướng dẫn chi tiết từ thiết lập ban đầu đến triển khai các chiến lược xác thực nâng cao.

## Clerk là gì?

Clerk là một bộ công cụ mạnh mẽ bao gồm các giao diện người dùng (UI) có thể nhúng, các API linh hoạt và bảng điều khiển quản trị trực quan. Nó được thiết kế để đơn giản hóa quá trình xác thực và quản lý người dùng. Clerk xử lý nhiều khía cạnh của xác thực, bao gồm quản lý phiên, xác thực đa yếu tố (MFA), đăng nhập xã hội (Social Sign-On), liên kết ma thuật (Magic Links), và mã xác minh một lần qua email hoặc SMS [1].

## Tại sao nên sử dụng Clerk?

Các yêu cầu về bảo mật và xác thực luôn thay đổi, và việc bảo vệ dữ liệu người dùng ngày càng trở nên quan trọng. Bằng cách ủy thác các trách nhiệm này cho một nhà cung cấp dịch vụ chuyên biệt như Clerk, các nhà phát triển có thể:

• **Tăng tốc độ phát triển**: Không cần phải xây dựng và duy trì hệ thống xác thực từ đầu, giúp tiết kiệm thời gian và nguồn lực.

• **Tăng cường bảo mật**: Clerk cung cấp các tính năng bảo mật tiên tiến như MFA, phát hiện gian lận, và quản lý phiên, giúp bảo vệ ứng dụng khỏi các mối đe dọa bảo mật.

• **Trải nghiệm người dùng tốt hơn**: Các UI dựng sẵn của Clerk giúp tạo ra trải nghiệm đăng nhập và đăng ký liền mạch và thân thiện với người dùng.

• **Khả năng mở rộng**: Clerk được xây dựng để mở rộng, có thể xử lý số lượng lớn người dùng và yêu cầu xác thực.

## Chuẩn bị dự án NestJS

Để bắt đầu tích hợp Clerk vào ứng dụng NestJS, chúng ta cần thiết lập một dự án NestJS mới hoặc sử dụng một dự án hiện có. Ngoài ra, cần có tài khoản Clerk và cài đặt các thư viện cần thiết.

### Tạo dự án NestJS

Nếu bạn chưa có dự án NestJS, bạn có thể tạo một dự án mới bằng Nest CLI:

```bash
pnpm add -g @nestjs/cli
nest new clerk-auth
```

### Thiết lập tài khoản và ứng dụng Clerk

Truy cập trang web của Clerk (clerk.com) và tạo một tài khoản. Sau khi đăng nhập, hãy tạo một ứng dụng mới trong bảng điều khiển Clerk. Bạn sẽ cần `CLERK_PUBLISHABLE_KEY` và `CLERK_SECRET_KEY` từ bảng điều khiển này để cấu hình ứng dụng NestJS của mình.

### Cài đặt các thư viện cần thiết

Cài đặt các gói sau vào dự án NestJS của bạn:

```bash
pnpm add @clerk/backend @nestjs/config @nestjs/passport passport passport-custom
```

• **@clerk/backend**: SDK backend của Clerk để tương tác với API của Clerk.
• **@nestjs/config**: Module cấu hình của NestJS để quản lý biến môi trường.
• **@nestjs/passport**: Tích hợp Passport.js vào NestJS.
• **passport**: Thư viện xác thực trung lập với framework.
• **passport-custom**: Chiến lược Passport tùy chỉnh.

### Cấu hình biến môi trường

Tạo một tệp `.env` ở thư mục gốc của dự án và thêm các khóa API của Clerk:

```env
# .env
CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_SECRET_KEY
```

Để NestJS có thể truy cập các biến môi trường này, hãy import `ConfigModule` vào `AppModule` chính của ứng dụng:

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

`isGlobal: true` giúp `ConfigService` có thể được inject vào bất kỳ module nào trong ứng dụng mà không cần import lại.

## Tích hợp Clerk vào NestJS

Sau khi thiết lập dự án, bước tiếp theo là tích hợp SDK backend của Clerk vào NestJS.

### Tạo Clerk client provider

Để sử dụng Clerk client trong các service hoặc controller của NestJS, chúng ta cần đăng ký nó như một provider. Điều này cho phép NestJS quản lý vòng đời của Clerk client và inject nó vào các class khác thông qua cơ chế Dependency Injection.

```typescript
// src/providers/clerk-client.provider.ts
import { createClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';

export const ClerkClientProvider = {
  provide: 'ClerkClient',
  useFactory: (configService: ConfigService) => {
    return createClerkClient({
      publishableKey: configService.get('CLERK_PUBLISHABLE_KEY'),
      secretKey: configService.get('CLERK_SECRET_KEY'),
    });
  },
  inject: [ConfigService],
};
```

Trong đoạn mã trên:

• **provide: 'ClerkClient'** định nghĩa một token injection. Bạn có thể sử dụng token này để yêu cầu Clerk client trong các class khác.
• **useFactory** là một hàm tạo ra instance của Clerk client. Nó nhận `ConfigService` làm dependency để lấy các khóa API từ biến môi trường.
• **inject: [ConfigService]** cho NestJS biết rằng `ConfigService` cần được inject vào `useFactory`.

### Đăng ký ClerkClientProvider trong AppModule

Tiếp theo, đăng ký `ClerkClientProvider` trong `AppModule` để NestJS có thể nhận diện và quản lý nó:

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
  providers: [ClerkClientProvider],
})
export class AppModule {}
```

## Sử dụng Passport với JWT do Clerk cấp

Khi người dùng đăng ký hoặc đăng nhập thông qua các trang được lưu trữ của Clerk hoặc ứng dụng frontend, Clerk sẽ cấp một mã thông báo JWT (JSON Web Token). Mã thông báo này sau đó được gửi dưới dạng mã thông báo bearer trong tiêu đề Authorization của các yêu cầu gửi đến ứng dụng NestJS backend.

### Tạo một chiến lược Clerk (Clerk Strategy)

Trong NestJS, Passport.js là cách được khuyến nghị để triển khai các chiến lược xác thực. Chúng ta sẽ tạo một chiến lược Clerk tùy chỉnh để xác minh các mã thông báo với Clerk client.

```typescript
// src/auth/clerk.strategy.ts
import { User, verifyToken } from '@clerk/backend';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { ClerkClient } from '@clerk/backend';
import { Inject } from '@nestjs/common';

@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, 'clerk') {
  constructor(
    @Inject('ClerkClient')
    private readonly clerkClient: ClerkClient,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async validate(req: Request): Promise<User> {
    const token = req.headers.authorization?.split(' ').pop();
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const tokenPayload = await verifyToken(token, {
        secretKey: this.configService.get('CLERK_SECRET_KEY'),
      });
      
      const user = await this.clerkClient.users.getUser(tokenPayload.sub);
      return user;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

Giải thích về `ClerkStrategy`:

• **PassportStrategy(Strategy, 'clerk')**: Kế thừa từ `PassportStrategy` và sử dụng `passport-custom` để tạo một chiến lược tùy chỉnh có tên 'clerk'.
• **constructor**: Inject `ClerkClient` và `ConfigService` để sử dụng trong quá trình xác thực.
• **validate(req: Request)**: Đây là phương thức chính để xác thực. Nó trích xuất mã thông báo JWT từ tiêu đề Authorization, sau đó sử dụng `verifyToken` của Clerk để xác minh mã thông báo. Nếu mã thông báo hợp lệ, nó sẽ lấy thông tin người dùng từ Clerk client và trả về đối tượng `User`. Nếu không, nó sẽ ném ra `UnauthorizedException`.

### Tạo Auth Module

Để tổ chức mã xác thực, chúng ta sẽ tạo một `AuthModule` riêng biệt. Module này sẽ cung cấp `ClerkStrategy` và tích hợp với `PassportModule`.

```typescript
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ClerkStrategy } from './clerk.strategy';
import { ConfigModule } from '@nestjs/config';
import { ClerkClientProvider } from '../providers/clerk-client.provider';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
  ],
  providers: [
    ClerkStrategy,
    ClerkClientProvider,
  ],
  exports: [
    PassportModule,
  ],
})
export class AuthModule {}
```

Lưu ý:

• **imports: [PassportModule, ConfigModule]**: Import `PassportModule` và `ConfigModule` để sử dụng trong `AuthModule`.
• **providers: [ClerkStrategy, ClerkClientProvider]**: Đăng ký `ClerkStrategy` và `ClerkClientProvider` làm providers trong module này.
• **exports: [PassportModule]**: Export `PassportModule` để các module khác có thể sử dụng các guard của Passport (ví dụ: `AuthGuard('clerk')`).

### Cập nhật AppModule

Cuối cùng, import `AuthModule` vào `AppModule` chính:

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ClerkClientProvider } from './providers/clerk-client.provider';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
  ],
  providers: [
    ClerkClientProvider,
  ],
})
export class AppModule {}
```

## Bảo vệ các endpoint với AuthGuard

Sau khi thiết lập chiến lược Clerk, bạn có thể bảo vệ các endpoint API bằng cách sử dụng `AuthGuard` của NestJS.

```typescript
// src/app.controller.ts
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('protected')
export class ProtectedController {
  @UseGuards(AuthGuard('clerk'))
  @Get()
  getProtectedData(@Req() req: Request) {
    return { 
      message: 'This is protected data!', 
      user: req.user 
    };
  }
}
```

Trong ví dụ này:

• **@UseGuards(AuthGuard('clerk'))**: Áp dụng `AuthGuard` với chiến lược 'clerk' cho endpoint `getProtectedData`. Điều này đảm bảo rằng chỉ những yêu cầu có mã thông báo JWT hợp lệ do Clerk cấp mới có thể truy cập endpoint này.
• **@Req() req: Request**: Truy cập đối tượng request, nơi thông tin người dùng đã xác thực (được trả về từ phương thức `validate` của `ClerkStrategy`) sẽ được gắn vào `req.user`.

## Xử lý thông tin người dùng

Khi một yêu cầu được xác thực thành công, thông tin người dùng từ Clerk sẽ được gắn vào đối tượng `req.user`. Bạn có thể tạo một interface hoặc class để định nghĩa kiểu dữ liệu cho đối tượng người dùng này, giúp cải thiện an toàn kiểu dữ liệu và khả năng đọc mã.

```typescript
// src/auth/clerk-user.interface.ts
import { User } from '@clerk/backend';

declare module 'express' {
  interface Request {
    user?: User;
  }
}
```

Bây giờ, bạn có thể sử dụng `req.user` với kiểu dữ liệu an toàn trong các controller và service của mình.

## Kết luận

Việc tích hợp Clerk vào ứng dụng NestJS giúp đơn giản hóa đáng kể quá trình xác thực và quản lý người dùng. Bằng cách tận dụng các tính năng mạnh mẽ của Clerk và cơ chế xác thực của NestJS với Passport.js, các nhà phát triển có thể xây dựng các ứng dụng an toàn và có khả năng mở rộng một cách hiệu quả. Hướng dẫn này đã cung cấp một lộ trình chi tiết để triển khai xác thực Clerk trong NestJS, từ thiết lập ban đầu đến bảo vệ các endpoint API và xử lý thông tin người dùng. Với Clerk, bạn có thể tập trung vào việc xây dựng các tính năng cốt lõi của ứng dụng, trong khi Clerk lo phần xác thực phức tạp.

## Tài liệu tham khảo

[1] Clerk. Authentication and User Management. Available at: https://clerk.com/

[2] TheDammyKing. Authentication with Clerk in NestJS Server Application. DEV Community. Available at: https://dev.to/thedammyking/authentication-with-clerk-in-nestjs-server-application-gpm