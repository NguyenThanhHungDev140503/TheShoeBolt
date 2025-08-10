# Hướng dẫn chi tiết TypeORM với NestJS: Từ cơ bản đến nâng cao

**Tác giả:** Manus AI

## Mục lục

1.  ORM là gì?
2.  Giới thiệu về TypeORM và lợi ích khi sử dụng với NestJS
3.  Cấp độ Junior: Bắt đầu với TypeORM và NestJS
    *   Cài đặt NestJS và TypeORM
    *   Kết nối với PostgreSQL
    *   Định nghĩa Entity cơ bản
    *   Thực hiện các thao tác CRUD đơn giản
4.  Cấp độ Middle: Nâng cao kỹ năng với TypeORM
    *   Quản lý quan hệ giữa các Entity (One-to-Many, Many-to-Many)
    *   Sử dụng Query Builder
    *   Migrations
    *   Custom Repositories
5.  Cấp độ Senior: Tối ưu hóa và các kỹ thuật nâng cao
    *   Transactions
    *   Listeners và Subscribers
    *   Caching
    *   Performance Tuning
    *   Sử dụng Decorator nâng cao
6.  Cấp độ Principal: Kiến trúc và Best Practices
    *   Thiết kế kiến trúc ứng dụng với TypeORM
    *   Testing với TypeORM
    *   Xử lý lỗi và Logging
    *   Security Best Practices
    *   Triển khai và Scaling

## 1. ORM là gì?

Object-Relational Mapping (ORM) là một kỹ thuật lập trình cho phép bạn tương tác với cơ sở dữ liệu quan hệ bằng cách sử dụng các đối tượng của ngôn ngữ lập trình hướng đối tượng. Thay vì viết các câu lệnh SQL trực tiếp, ORM cung cấp một lớp trừu tượng, cho phép các nhà phát triển thao tác dữ liệu trong cơ sở dữ liệu như thể họ đang làm việc với các đối tượng trong mã của họ.

### Mục đích của ORM

Mục đích chính của ORM là tạo ra một cầu nối giữa các ứng dụng hướng đối tượng và cơ sở dữ liệu quan hệ. Nó giải quyết vấn đề "mismatch" giữa cách dữ liệu được biểu diễn trong các ngôn ngữ lập trình hướng đối tượng (dưới dạng đối tượng) và cách dữ liệu được lưu trữ trong cơ sở dữ liệu quan hệ (dưới dạng bảng và hàng).

### Lợi ích của ORM

*   **Tăng tốc độ phát triển:** ORM tự động hóa nhiều tác vụ lặp đi lặp lại liên quan đến tương tác cơ sở dữ liệu, giúp nhà phát triển viết mã nhanh hơn.
*   **Giảm lỗi:** Bằng cách trừu tượng hóa SQL, ORM giúp giảm thiểu các lỗi cú pháp SQL và các vấn đề liên quan đến việc ánh xạ dữ liệu thủ công.
*   **Tăng tính bảo trì:** Mã nguồn trở nên dễ đọc và dễ bảo trì hơn vì nhà phát triển làm việc với các đối tượng quen thuộc thay vì các chuỗi SQL.
*   **Độc lập với cơ sở dữ liệu:** Nhiều ORM hỗ trợ nhiều loại cơ sở dữ liệu khác nhau, cho phép nhà phát triển chuyển đổi giữa các hệ quản trị cơ sở dữ liệu mà không cần thay đổi nhiều mã nguồn.
*   **Bảo mật:** ORM thường tích hợp các cơ chế bảo mật như chống SQL Injection bằng cách sử dụng các tham số hóa truy vấn.
*   **Quản lý quan hệ phức tạp:** ORM giúp quản lý các mối quan hệ phức tạp giữa các bảng (ví dụ: One-to-One, One-to-Many, Many-to-Many) một cách dễ dàng hơn.

## 2. Giới thiệu về TypeORM và lợi ích khi sử dụng với NestJS

TypeORM là một Object-Relational Mapper (ORM) mạnh mẽ, linh hoạt và có nhiều tính năng dành cho TypeScript và JavaScript. Nó hỗ trợ nhiều hệ quản trị cơ sở dữ liệu quan hệ khác nhau như PostgreSQL, MySQL, MariaDB, SQLite, Microsoft SQL Server, Oracle, SAP Hana, WebSQL, và MongoDB (dù MongoDB là NoSQL, TypeORM vẫn cung cấp một số tính năng tương tác).

TypeORM được thiết kế để hoạt động tốt với TypeScript, tận dụng tối đa hệ thống kiểu (type system) của TypeScript để cung cấp tính an toàn kiểu (type safety) trong quá trình tương tác với cơ sở dữ liệu. Điều này giúp phát hiện lỗi sớm trong quá trình phát triển và cải thiện khả năng bảo trì mã.

### Các tính năng nổi bật của TypeORM

*   **Hỗ trợ TypeScript/JavaScript:** Được viết hoàn toàn bằng TypeScript, cung cấp trải nghiệm phát triển tuyệt vời với tính năng tự động hoàn thành (autocompletion) và kiểm tra kiểu (type checking).
*   **Hỗ trợ nhiều cơ sở dữ liệu:** Tương thích với nhiều hệ quản trị cơ sở dữ liệu phổ biến.
*   **Active Record và Data Mapper:** TypeORM là một trong số ít ORM hỗ trợ cả hai mẫu thiết kế này, mang lại sự linh hoạt cho nhà phát triển.
    *   **Active Record:** Cho phép bạn thực hiện các thao tác CRUD (Create, Read, Update, Delete) trực tiếp trên các đối tượng entity.
    *   **Data Mapper:** Tách biệt logic nghiệp vụ khỏi logic tương tác cơ sở dữ liệu, giúp mã sạch hơn và dễ kiểm thử hơn.
*   **Query Builder mạnh mẽ:** Cung cấp một API linh hoạt để xây dựng các truy vấn SQL phức tạp một cách an toàn và dễ đọc.
*   **Migrations:** Hỗ trợ tạo và chạy các migration để quản lý thay đổi cấu trúc cơ sở dữ liệu.
*   **Relations:** Dễ dàng định nghĩa và quản lý các mối quan hệ giữa các entity (One-to-One, One-to-Many, Many-to-Many).
*   **Decorators:** Sử dụng các decorator của TypeScript để định nghĩa các entity, cột và mối quan hệ.

### Lợi ích khi sử dụng TypeORM với NestJS

NestJS là một framework Node.js tiến bộ, được xây dựng bằng TypeScript và lấy cảm hứng từ Angular. Sự kết hợp giữa NestJS và TypeORM mang lại nhiều lợi ích đáng kể:

*   **Tính an toàn kiểu (Type Safety) toàn diện:** Cả NestJS và TypeORM đều được xây dựng trên TypeScript, tạo ra một môi trường phát triển đồng nhất và an toàn về kiểu. Điều này giúp giảm thiểu lỗi runtime và cải thiện chất lượng mã.
*   **Tích hợp dễ dàng:** NestJS cung cấp các module và decorator được thiết kế đặc biệt để tích hợp TypeORM một cách liền mạch, giúp việc cấu hình và sử dụng trở nên đơn giản.
*   **Kiến trúc module hóa:** NestJS khuyến khích kiến trúc module hóa, giúp tổ chức mã nguồn rõ ràng. TypeORM Entities và Repositories có thể được đặt trong các module riêng biệt, tăng tính tái sử dụng và dễ bảo trì.
*   **Dependency Injection:** NestJS sử dụng Dependency Injection mạnh mẽ, cho phép bạn dễ dàng inject các Repository của TypeORM vào các Service và Controller, giúp mã dễ kiểm thử và linh hoạt hơn.
*   **Cộng đồng lớn và tài liệu phong phú:** Cả NestJS và TypeORM đều có cộng đồng lớn và tài liệu chi tiết, giúp nhà phát triển dễ dàng tìm kiếm sự hỗ trợ và giải pháp.
*   **Hiệu suất:** TypeORM được tối ưu hóa để cung cấp hiệu suất tốt, và khi kết hợp với kiến trúc hiệu quả của NestJS, nó tạo ra các ứng dụng backend mạnh mẽ và có khả năng mở rộng.

Với những lợi ích này, TypeORM trở thành lựa chọn hàng đầu cho việc tương tác cơ sở dữ liệu trong các ứng dụng NestJS, đặc biệt là khi làm việc với PostgreSQL.

## 3. Cấp độ Junior: Bắt đầu với TypeORM và NestJS

Ở cấp độ này, chúng ta sẽ tìm hiểu những kiến thức cơ bản nhất để bắt đầu sử dụng TypeORM với NestJS và PostgreSQL. Bạn sẽ học cách cài đặt các gói cần thiết, cấu hình kết nối cơ sở dữ liệu, định nghĩa một Entity đơn giản và thực hiện các thao tác CRUD (Create, Read, Update, Delete) cơ bản.

### 3.1. Cài đặt NestJS và TypeORM

Đầu tiên, hãy đảm bảo bạn đã cài đặt Node.js (phiên bản 12 trở lên) và npm/yarn trên hệ thống của mình. Sau đó, cài đặt NestJS CLI (Command Line Interface) toàn cục:

```bash
npm i -g @nestjs/cli
```

Tiếp theo, tạo một dự án NestJS mới:

```bash
nest new typeorm-nestjs-tutorial
cd typeorm-nestjs-tutorial
```

Bây giờ, chúng ta cần cài đặt các gói TypeORM và driver cho PostgreSQL:

```bash
npm install @nestjs/typeorm typeorm pg
```

*   `@nestjs/typeorm`: Module tích hợp TypeORM cho NestJS.
*   `typeorm`: Thư viện TypeORM chính.
*   `pg`: Driver PostgreSQL cho Node.js.

### 3.2. Kết nối với PostgreSQL

Để kết nối NestJS với cơ sở dữ liệu PostgreSQL thông qua TypeORM, chúng ta sẽ cấu hình `TypeOrmModule` trong `app.module.ts`.

Đầu tiên, hãy tạo một file `.env` ở thư mục gốc của dự án để lưu trữ các biến môi trường, bao gồm thông tin kết nối cơ sở dữ liệu. Điều này giúp bảo mật thông tin nhạy cảm và dễ dàng quản lý cấu hình cho các môi trường khác nhau.

**Tạo file `.env`:**

```dotenv
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database_name
```

Thay thế `your_username`, `your_password`, `your_database_name` bằng thông tin PostgreSQL của bạn. Đảm bảo rằng bạn đã tạo một cơ sở dữ liệu PostgreSQL với tên `your_database_name` và người dùng `your_username` có quyền truy cập.

Để đọc các biến môi trường này trong NestJS, chúng ta sẽ sử dụng `@nestjs/config` module. Cài đặt nó:

```bash
npm install @nestjs/config
```

Bây giờ, cấu hình `AppModule` trong `src/app.module.ts`:

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Biến môi trường sẽ có sẵn trên toàn bộ ứng dụng
      envFilePath: '.env', // Chỉ định đường dẫn đến file .env
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [], // Chúng ta sẽ thêm các Entity vào đây sau
      synchronize: true, // KHÔNG SỬ DỤNG TRONG MÔI TRƯỜNG SẢN XUẤT! Tự động tạo schema DB dựa trên các Entity của bạn.
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Lưu ý quan trọng về `synchronize: true`:**

Thuộc tính `synchronize: true` trong cấu hình TypeORM sẽ tự động tạo hoặc cập nhật schema cơ sở dữ liệu dựa trên các Entity của bạn mỗi khi ứng dụng khởi động. Điều này cực kỳ tiện lợi cho môi trường phát triển vì bạn không cần phải tạo bảng thủ công. **Tuy nhiên, KHÔNG BAO GIỜ sử dụng `synchronize: true` trong môi trường sản xuất (production)**. Trong môi trường sản xuất, việc thay đổi schema cơ sở dữ liệu tự động có thể dẫn đến mất dữ liệu hoặc các vấn đề không mong muốn. Thay vào đó, bạn nên sử dụng các Migration của TypeORM để quản lý các thay đổi schema một cách có kiểm soát.

### 3.3. Định nghĩa Entity cơ bản

Trong TypeORM, một Entity là một lớp TypeScript đại diện cho một bảng trong cơ sở dữ liệu của bạn. Mỗi thuộc tính của lớp sẽ ánh xạ tới một cột trong bảng. Chúng ta sẽ sử dụng các decorator của TypeORM để định nghĩa Entity và các cột của nó.

Hãy tạo một Entity đơn giản, ví dụ `User`.

**Tạo file `src/user/user.entity.ts`:**

```typescript
// src/user/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  email: string;

  @Column({ default: true })
  isActive: boolean;
}
```

**Giải thích các Decorator:**

*   `@Entity()`: Đánh dấu lớp `User` là một Entity TypeORM, ánh xạ tới một bảng trong cơ sở dữ liệu (mặc định tên bảng sẽ là `user`).
*   `@PrimaryGeneratedColumn()`: Đánh dấu `id` là khóa chính và sẽ tự động tăng (auto-increment).
*   `@Column()`: Đánh dấu các thuộc tính `username`, `email`, `isActive` là các cột trong bảng.
    *   `{ unique: true }`: Đảm bảo giá trị `username` là duy nhất.
    *   `{ default: true }`: Đặt giá trị mặc định cho `isActive` là `true`.

Bây giờ, chúng ta cần thêm Entity này vào cấu hình `TypeOrmModule` trong `src/app.module.ts` để TypeORM biết về nó:

```typescript
// src/app.module.ts (cập nhật)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user/user.entity'; // Import Entity User

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User], // Thêm Entity User vào đây
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### 3.4. Thực hiện các thao tác CRUD đơn giản

Để thực hiện các thao tác CRUD (Create, Read, Update, Delete) với Entity `User`, chúng ta sẽ tạo một `UserService` và `UserController`.

**Tạo module `User`:**

```bash
nest g module user
```

**Tạo service và controller cho `User`:**

```bash
nest g service user
nest g controller user
```

Cấu trúc thư mục của bạn sẽ trông như thế này:

```
src/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
└── user/
    ├── user.controller.ts
    ├── user.module.ts
    ├── user.service.ts
    └── user.entity.ts
```

Bây giờ, chúng ta cần cấu hình `UserModule` để TypeORM biết về `UserEntity` và cung cấp `UserRepository` cho `UserService`.

**Cập nhật `src/user/user.module.ts`:**

```typescript
// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Đăng ký Entity User cho module này
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
```

*   `TypeOrmModule.forFeature([User])`: Đăng ký `User` Entity với `UserModule`. Điều này cho phép chúng ta inject `UserRepository` vào `UserService`.

Cuối cùng, thêm `UserModule` vào `AppModule`:

**Cập nhật `src/app.module.ts` (lần cuối):**

```typescript
// src/app.module.ts (cập nhật lần cuối)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module'; // Import UserModule

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User],
      synchronize: true,
    }),
    UserModule, // Thêm UserModule vào đây
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Bây giờ, chúng ta sẽ triển khai các phương thức CRUD trong `UserService` và `UserController`.

**Cập nhật `src/user/user.service.ts`:**

```typescript
// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) // Inject UserRepository
    private usersRepository: Repository<User>,
  ) {}

  // Create
  async create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(user);
    return this.usersRepository.save(newUser);
  }

  // Read all
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  // Read by ID
  async findOne(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  // Update
  async update(id: number, user: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, user);
    return this.usersRepository.findOneBy({ id });
  }

  // Delete
  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
```

*   `@InjectRepository(User)`: Decorator này cho phép chúng ta inject `Repository<User>` vào `UserService`. `Repository` là một lớp của TypeORM cung cấp các phương thức để tương tác với cơ sở dữ liệu cho một Entity cụ thể.
*   `create(user: Partial<User>)`: Phương thức này nhận một đối tượng `Partial<User>` (cho phép các thuộc tính không bắt buộc) và tạo một instance mới của `User` Entity. Sau đó, `save()` sẽ lưu Entity này vào cơ sở dữ liệu.
*   `findAll()`: Trả về tất cả các bản ghi `User` từ cơ sở dữ liệu.
*   `findOne(id: number)`: Tìm một bản ghi `User` theo `id`.
*   `update(id: number, user: Partial<User>)`: Cập nhật một bản ghi `User` theo `id` với dữ liệu mới. Sau khi cập nhật, chúng ta tìm lại bản ghi để trả về đối tượng đã được cập nhật.
*   `remove(id: number)`: Xóa một bản ghi `User` theo `id`.

**Cập nhật `src/user/user.controller.ts`:**

```typescript
// src/user/user.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

// Định nghĩa DTO (Data Transfer Object) cho việc tạo và cập nhật User
// src/user/dto/create-user.dto.ts
export class CreateUserDto {
  username: string;
  email: string;
}

// src/user/dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(+id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.userService.remove(+id);
  }
}
```

*   **DTOs (Data Transfer Objects):** Chúng ta định nghĩa `CreateUserDto` và `UpdateUserDto` để xác định cấu trúc dữ liệu mong đợi từ client khi tạo hoặc cập nhật người dùng. `PartialType` từ `@nestjs/mapped-types` giúp tạo `UpdateUserDto` dựa trên `CreateUserDto` nhưng với tất cả các thuộc tính là tùy chọn.
    *   Để sử dụng `PartialType`, bạn cần cài đặt `@nestjs/mapped-types`:
        ```bash
        npm install @nestjs/mapped-types
        ```
*   `@Controller('users')`: Đặt tiền tố đường dẫn cho tất cả các route trong controller này là `/users`.
*   `@Post()`, `@Get()`, `@Put()`, `@Delete()`: Các decorator này ánh xạ các phương thức HTTP tương ứng tới các phương thức của controller.
*   `@Body()`, `@Param()`: Các decorator này trích xuất dữ liệu từ body của request hoặc từ các tham số trong URL.
*   `+id`: Chuyển đổi `id` từ string sang number.
*   `@HttpCode(HttpStatus.CREATED)` và `HttpStatus.NO_CONTENT`: Đặt mã trạng thái HTTP cho phản hồi.

**Để chạy ứng dụng:**

```bash
npm run start:dev
```

Ứng dụng sẽ chạy trên `http://localhost:3000`. Bạn có thể sử dụng các công cụ như Postman hoặc Insomnia để kiểm tra các API endpoint:

*   **POST /users** (Create User)
    *   Body (JSON): `{"username": "john_doe", "email": "john@example.com"}`
*   **GET /users** (Get All Users)
*   **GET /users/:id** (Get User by ID)
*   **PUT /users/:id** (Update User)
    *   Body (JSON): `{"email": "new_john@example.com"}`
*   **DELETE /users/:id** (Delete User)

Sau khi chạy ứng dụng, TypeORM sẽ tự động tạo bảng `user` trong cơ sở dữ liệu PostgreSQL của bạn (do `synchronize: true`). Bạn có thể kiểm tra cơ sở dữ liệu để xác nhận.

Đây là nền tảng cơ bản để làm việc với TypeORM và NestJS. Ở các cấp độ tiếp theo, chúng ta sẽ đi sâu vào các tính năng nâng cao hơn.



## 4. Cấp độ Middle: Nâng cao kỹ năng với TypeORM

Ở cấp độ này, chúng ta sẽ đi sâu vào các tính năng quan trọng hơn của TypeORM, giúp bạn xây dựng các ứng dụng phức tạp hơn và quản lý dữ liệu hiệu quả hơn. Chúng ta sẽ tìm hiểu về cách quản lý các mối quan hệ giữa các Entity, sử dụng Query Builder mạnh mẽ, quản lý thay đổi schema cơ sở dữ liệu bằng Migrations và tạo Custom Repositories để tổ chức mã tốt hơn.

### 4.1. Quản lý quan hệ giữa các Entity

Trong các ứng dụng thực tế, các bảng cơ sở dữ liệu hiếm khi tồn tại độc lập. Chúng thường có các mối quan hệ với nhau (ví dụ: một người dùng có nhiều bài viết, một bài viết có nhiều thẻ). TypeORM cung cấp các decorator mạnh mẽ để định nghĩa và quản lý các mối quan hệ này.

Chúng ta sẽ tạo một Entity mới là `Post` và thiết lập mối quan hệ One-to-Many giữa `User` và `Post` (một người dùng có thể viết nhiều bài viết).

**Tạo Entity `Post` (`src/post/post.entity.ts`):**

```typescript
// src/post/post.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity'; // Import User Entity

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @ManyToOne(() => User, user => user.posts) // Định nghĩa mối quan hệ Many-to-One với User
  user: User;
}
```

**Giải thích:**

*   `@ManyToOne(() => User, user => user.posts)`: Decorator này định nghĩa mối quan hệ Many-to-One từ `Post` đến `User`. Điều này có nghĩa là nhiều bài viết có thể thuộc về một người dùng. Tham số đầu tiên là hàm trả về Entity đích (`User`), tham số thứ hai là hàm trả về thuộc tính ngược lại trong Entity đích (`user.posts`).

**Cập nhật Entity `User` (`src/user/user.entity.ts`) để thêm mối quan hệ ngược lại:**

```typescript
// src/user/user.entity.ts (cập nhật)
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Post } from '../post/post.entity'; // Import Post Entity

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Post, post => post.user) // Định nghĩa mối quan hệ One-to-Many với Post
  posts: Post[];
}
```

**Giải thích:**

*   `@OneToMany(() => Post, post => post.user)`: Decorator này định nghĩa mối quan hệ One-to-Many từ `User` đến `Post`. Điều này có nghĩa là một người dùng có thể có nhiều bài viết. Tham số đầu tiên là hàm trả về Entity đích (`Post`), tham số thứ hai là hàm trả về thuộc tính ngược lại trong Entity đích (`post.user`).

**Tạo module `Post` và thêm vào `AppModule`:**

```bash
nest g module post
nest g service post
nest g controller post
```

**Cập nhật `src/post/post.module.ts`:**

```typescript
// src/post/post.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post } from './post.entity';
import { UserModule } from '../user/user.module'; // Import UserModule để sử dụng UserService

@Module({
  imports: [TypeOrmModule.forFeature([Post]), UserModule],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
```

**Cập nhật `src/app.module.ts` để thêm `Post` Entity và `PostModule`:**

```typescript
// src/app.module.ts (cập nhật)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { Post } from './post/post.entity'; // Import Post Entity
import { PostModule } from './post/post.module'; // Import PostModule

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      entities: [User, Post], // Thêm Post Entity vào đây
      database: process.env.DB_DATABASE,
      synchronize: true,
    }),
    UserModule,
    PostModule, // Thêm PostModule vào đây
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Cập nhật `src/post/post.service.ts` để thêm các thao tác CRUD cho `Post` và xử lý mối quan hệ:**

```typescript
// src/post/post.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { UserService } from '../user/user.service'; // Import UserService

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    private userService: UserService, // Inject UserService
  ) {}

  async create(title: string, content: string, userId: number): Promise<Post> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const newPost = this.postsRepository.create({ title, content, user });
    return this.postsRepository.save(newPost);
  }

  async findAll(): Promise<Post[]> {
    return this.postsRepository.find({ relations: ['user'] }); // Eager loading user data
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({ where: { id }, relations: ['user'] });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async update(id: number, title?: string, content?: string): Promise<Post> {
    const post = await this.postsRepository.findOneBy({ id });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    if (title) post.title = title;
    if (content) post.content = content;
    return this.postsRepository.save(post);
  }

  async remove(id: number): Promise<void> {
    const result = await this.postsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }
}
```

**Cập nhật `src/post/post.controller.ts`:**

```typescript
// src/post/post.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { PostService } from './post.service';
import { Post as PostEntity } from './post.entity';

// src/post/dto/create-post.dto.ts
export class CreatePostDto {
  title: string;
  content: string;
  userId: number;
}

// src/post/dto/update-post.dto.ts
import { PartialType } from '@nestjs/mapped-types';

export class UpdatePostDto extends PartialType(CreatePostDto) {}

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: CreatePostDto): Promise<PostEntity> {
    const { title, content, userId } = createPostDto;
    return this.postService.create(title, content, userId);
  }

  @Get()
  async findAll(): Promise<PostEntity[]> {
    return this.postService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PostEntity> {
    return this.postService.findOne(+id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto): Promise<PostEntity> {
    const { title, content } = updatePostDto;
    return this.postService.update(+id, title, content);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.postService.remove(+id);
  }
}
```

**Thử nghiệm mối quan hệ:**

1.  Tạo một người dùng: `POST /users` với `{"username": "author1", "email": "author1@example.com"}`. Ghi lại `id` của người dùng.
2.  Tạo một bài viết liên kết với người dùng đó: `POST /posts` với `{"title": "My First Post", "content": "This is the content of my first post.", "userId": 1}` (thay `1` bằng `id` của người dùng vừa tạo).
3.  Lấy tất cả bài viết: `GET /posts`. Bạn sẽ thấy bài viết và thông tin người dùng liên quan được tải cùng (do `relations: ['user']`).

### 4.2. Sử dụng Query Builder

Trong khi `Repository` cung cấp các phương thức CRUD cơ bản, Query Builder của TypeORM cho phép bạn xây dựng các truy vấn SQL phức tạp hơn một cách linh hoạt và an toàn kiểu. Nó rất hữu ích khi bạn cần các truy vấn tùy chỉnh, JOIN, điều kiện phức tạp, GROUP BY, HAVING, v.v.

Chúng ta sẽ thêm một phương thức vào `UserService` để tìm người dùng dựa trên một điều kiện phức tạp hơn, ví dụ: tìm người dùng có tên chứa một chuỗi và có ít nhất một bài viết.

**Cập nhật `src/user/user.service.ts`:**

```typescript
// src/user/user.service.ts (thêm phương thức)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // ... các phương thức CRUD đã có ...

  async findUsersWithPosts(usernamePartial: string): Promise<User[]> {
    return this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.posts', 'post') // JOIN với bảng posts
      .where('user.username LIKE :username', { username: `%${usernamePartial}%` }) // Điều kiện LIKE
      .groupBy('user.id') // Group theo user.id
      .having('COUNT(post.id) > 0') // Chỉ lấy user có ít nhất 1 bài viết
      .getMany();
  }
}
```

**Giải thích:**

*   `createQueryBuilder('user')`: Bắt đầu một Query Builder cho Entity `User`, với alias là `user`.
*   `leftJoinAndSelect('user.posts', 'post')`: Thực hiện LEFT JOIN với mối quan hệ `posts` của `user` và chọn (SELECT) cả các cột từ bảng `post`. Alias cho bảng `post` là `post`.
*   `where('user.username LIKE :username', { username: `%${usernamePartial}%` })`: Thêm điều kiện `WHERE` sử dụng tham số hóa (`:username`) để tránh SQL Injection.
*   `groupBy('user.id')`: Nhóm kết quả theo `user.id`.
*   `having('COUNT(post.id) > 0')`: Lọc các nhóm mà số lượng bài viết (`post.id`) lớn hơn 0.
*   `getMany()`: Thực thi truy vấn và trả về nhiều kết quả.

**Thêm endpoint vào `src/user/user.controller.ts` để kiểm tra:**

```typescript
// src/user/user.controller.ts (thêm phương thức)
import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto'; // Import DTOs

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ... các phương thức CRUD đã có ...

  @Get('with-posts')
  async findUsersWithPosts(@Query('username') username: string): Promise<User[]> {
    return this.userService.findUsersWithPosts(username);
  }
}
```

**Thử nghiệm:**

*   `GET /users/with-posts?username=author`. Nếu có người dùng nào có tên chứa 

chuỗi 'author' và có bài viết, chúng sẽ được trả về.

### 4.3. Migrations

Như đã đề cập ở cấp độ Junior, việc sử dụng `synchronize: true` trong môi trường sản xuất là không an toàn. Thay vào đó, chúng ta sử dụng Migrations để quản lý các thay đổi schema cơ sở dữ liệu một cách có kiểm soát và theo dõi phiên bản.

Migration là các file mã nguồn (thường là TypeScript hoặc JavaScript) chứa các hướng dẫn để thay đổi cấu trúc cơ sở dữ liệu (ví dụ: tạo bảng, thêm cột, sửa đổi kiểu dữ liệu). TypeORM cung cấp các lệnh CLI để tạo, chạy và hoàn tác (revert) các migration.

**Bước 1: Tắt `synchronize` và cấu hình `ormconfig.ts`**

Đầu tiên, hãy tắt `synchronize: true` trong `src/app.module.ts` và tạo một file cấu hình TypeORM riêng biệt để quản lý migrations.

**Cập nhật `src/app.module.ts`:**

```typescript
// src/app.module.ts (tắt synchronize)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { Post } from './post/post.entity';
import { PostModule } from './post/post.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, Post],
      synchronize: false, // Đặt thành false
      autoLoadEntities: true, // Tự động tải các entity đã được định nghĩa
    }),
    UserModule,
    PostModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Tạo file `ormconfig.ts` ở thư mục gốc của dự án:**

```typescript
// ormconfig.ts
import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const config: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/**/*.entity{.ts,.js}'], // Đường dẫn đến các entity của bạn
  migrations: [__dirname + '/migrations/*.ts'], // Đường dẫn đến các migration files
  synchronize: false, // Luôn là false trong production
};

export default config;
```

**Lưu ý:** Bạn cần cài đặt `dotenv` để đọc biến môi trường trong `ormconfig.ts`:

```bash
npm install dotenv
```

**Bước 2: Cấu hình `package.json` cho TypeORM CLI**

Thêm các script sau vào file `package.json` của bạn để dễ dàng chạy các lệnh TypeORM CLI:

```json
// package.json (thêm vào phần 

```json
// package.json (thêm vào phần "scripts")
"scripts": {
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:debug": "nest start --debug --watch",
  "start:prod": "node dist/main",
  "lint": "eslint \"{src,apps,libs}/**/*.ts\" --fix",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:debug": "node --inspect-brk -r tsconfig-paths/register -r jest/bin/jest.js --runInBand",
  "test:e2e": "jest --config ./test/jest-e2e.json",
  "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js --dataSource ormconfig.ts",
  "migration:generate": "npm run typeorm -- migration:generate",
  "migration:create": "npm run typeorm -- migration:create",
  "migration:run": "npm run typeorm -- migration:run",
  "migration:revert": "npm run typeorm -- migration:revert"
},
```

**Lưu ý:** Bạn cần cài đặt `ts-node` và `tsconfig-paths` để chạy các lệnh TypeORM CLI với TypeScript:

```bash
npm install -D ts-node tsconfig-paths
```

**Bước 3: Tạo Migration đầu tiên**

Bây giờ, hãy tạo một migration để tạo bảng `user` và `post`:

```bash
npm run migration:generate -- ./src/migrations/InitialSchema
```

Lệnh này sẽ tạo một file migration mới trong thư mục `src/migrations` (ví dụ: `1678886400000-InitialSchema.ts`). Nội dung của file này sẽ tự động được TypeORM tạo ra dựa trên các Entity hiện có của bạn. Nó sẽ chứa các phương thức `up` và `down`:

```typescript
// src/migrations/1678886400000-InitialSchema.ts (ví dụ)
import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1678886400000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL UNIQUE, "email" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "content" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_2829ae6ee67bc116b506fe6fd99" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_34971239922123456789" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_34971239922123456789"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
```

**Bước 4: Chạy Migration**

Để áp dụng các thay đổi schema vào cơ sở dữ liệu, chạy lệnh:

```bash
npm run migration:run
```

Lệnh này sẽ thực thi phương thức `up` của tất cả các migration chưa được chạy. TypeORM sẽ tạo một bảng `migrations` trong cơ sở dữ liệu để theo dõi các migration đã được áp dụng.

**Bước 5: Hoàn tác Migration (tùy chọn)**

Nếu bạn cần hoàn tác migration cuối cùng (ví dụ: trong môi trường phát triển), bạn có thể sử dụng:

```bash
npm run migration:revert
```

**Quy trình làm việc với Migrations:**

1.  Thay đổi Entity (thêm/sửa/xóa thuộc tính, mối quan hệ).
2.  Chạy `npm run migration:generate -- ./src/migrations/YourMigrationName` để tạo file migration mới.
3.  Kiểm tra nội dung file migration để đảm bảo nó thực hiện đúng các thay đổi mong muốn.
4.  Chạy `npm run migration:run` để áp dụng migration vào cơ sở dữ liệu.

### 4.4. Custom Repositories

Khi ứng dụng phát triển, bạn có thể thấy rằng các phương thức tương tác với cơ sở dữ liệu trở nên phức tạp hơn và cần được tổ chức tốt hơn. TypeORM cho phép bạn tạo Custom Repositories để đóng gói các logic truy vấn cụ thể cho một Entity, giúp mã sạch hơn và dễ tái sử dụng hơn.

Chúng ta sẽ tạo một Custom Repository cho `User` Entity để thêm một phương thức tìm kiếm người dùng theo email.

**Bước 1: Tạo Custom Repository (`src/user/user.repository.ts`):**

```typescript
// src/user/user.repository.ts
import { Repository, DataSource } from 'typeorm';
import { User } from './user.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.findOneBy({ email });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.find({ where: { isActive: true } });
  }
}
```

**Giải thích:**

*   Chúng ta tạo một lớp `UserRepository` kế thừa từ `Repository<User>`. Điều này cho phép chúng ta sử dụng tất cả các phương thức của `Repository` và thêm các phương thức tùy chỉnh.
*   `@Injectable()`: Đánh dấu lớp này là một provider có thể được inject trong NestJS.
*   Trong constructor, chúng ta inject `DataSource` của TypeORM và gọi `super()` để khởi tạo `Repository` với Entity `User` và `EntityManager`.

**Bước 2: Cập nhật `UserModule` để sử dụng Custom Repository:**

Để NestJS có thể inject `UserRepository` vào các service khác, chúng ta cần cung cấp nó trong `UserModule`.

```typescript
// src/user/user.module.ts (cập nhật)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserRepository } from './user.repository'; // Import Custom Repository

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, UserRepository], // Thêm UserRepository vào providers
  controllers: [UserController],
  exports: [UserService, UserRepository], // Export UserRepository nếu cần sử dụng ở module khác
})
export class UserModule {}
```

**Bước 3: Cập nhật `UserService` để sử dụng Custom Repository:**

Bây giờ, chúng ta có thể inject `UserRepository` vào `UserService` thay vì `Repository<User>` mặc định.

```typescript
// src/user/user.service.ts (cập nhật)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'; // Vẫn cần InjectRepository nếu muốn dùng Repository mặc định
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository'; // Import Custom Repository

@Injectable()
export class UserService {
  constructor(
    // @InjectRepository(User) // Có thể bỏ dòng này nếu chỉ dùng Custom Repository
    // private usersRepository: Repository<User>,
    private customUserRepository: UserRepository, // Inject Custom Repository
  ) {}

  // Create
  async create(user: Partial<User>): Promise<User> {
    const newUser = this.customUserRepository.create(user);
    return this.customUserRepository.save(newUser);
  }

  // Read all
  async findAll(): Promise<User[]> {
    return this.customUserRepository.find();
  }

  // Read by ID
  async findOne(id: number): Promise<User> {
    return this.customUserRepository.findOneBy({ id });
  }

  // Update
  async update(id: number, user: Partial<User>): Promise<User> {
    await this.customUserRepository.update(id, user);
    return this.customUserRepository.findOneBy({ id });
  }

  // Delete
  async remove(id: number): Promise<void> {
    await this.customUserRepository.delete(id);
  }

  // Sử dụng phương thức từ Custom Repository
  async findByEmail(email: string): Promise<User | undefined> {
    return this.customUserRepository.findByEmail(email);
  }

  async findActiveUsers(): Promise<User[]> {
    return this.customUserRepository.findActiveUsers();
  }

  async findUsersWithPosts(usernamePartial: string): Promise<User[]> {
    return this.customUserRepository.createQueryBuilder("user")
      .leftJoinAndSelect("user.posts", "post")
      .where("user.username LIKE :username", { username: `%${usernamePartial}%` })
      .groupBy("user.id")
      .having("COUNT(post.id) > 0")
      .getMany();
  }
}
```

**Thử nghiệm Custom Repository:**

Thêm một endpoint vào `UserController` để kiểm tra phương thức `findByEmail`:

```typescript
// src/user/user.controller.ts (thêm phương thức)
import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ... các phương thức đã có ...

  @Get('by-email')
  async findByEmail(@Query('email') email: string): Promise<User | undefined> {
    return this.userService.findByEmail(email);
  }

  @Get('active')
  async findActiveUsers(): Promise<User[]> {
    return this.userService.findActiveUsers();
  }
}
```

Bây giờ bạn có thể gọi `GET /users/by-email?email=john@example.com` để tìm người dùng theo email và `GET /users/active` để tìm tất cả người dùng đang hoạt động. Custom Repositories giúp bạn tổ chức mã tốt hơn và tái sử dụng logic truy vấn phức tạp.

## 5. Cấp độ Senior: Tối ưu hóa và các kỹ thuật nâng cao

Ở cấp độ Senior, chúng ta sẽ khám phá các kỹ thuật nâng cao để tối ưu hóa hiệu suất, quản lý các tác vụ phức tạp và đảm bảo tính toàn vẹn dữ liệu trong ứng dụng NestJS sử dụng TypeORM. Các chủ đề bao gồm Transactions, Listeners và Subscribers, Caching, Performance Tuning và sử dụng Decorator nâng cao.

### 5.1. Transactions

Transactions (giao dịch) là một khái niệm quan trọng trong cơ sở dữ liệu, đảm bảo rằng một chuỗi các thao tác cơ sở dữ liệu được thực hiện như một đơn vị công việc duy nhất: hoặc tất cả đều thành công (commit), hoặc tất cả đều thất bại (rollback). Điều này đảm bảo tính toàn vẹn và nhất quán của dữ liệu.

TypeORM cung cấp hai cách để làm việc với transactions:

1.  **Sử dụng `QueryRunner`:** Cách này cung cấp quyền kiểm soát chi tiết nhất và thường được sử dụng khi bạn cần thực hiện nhiều thao tác phức tạp hoặc khi bạn muốn sử dụng cùng một kết nối cơ sở dữ liệu cho toàn bộ transaction.
2.  **Sử dụng `EntityManager`:** Cách này đơn giản hơn và phù hợp cho các transaction đơn giản hơn, nơi bạn chỉ cần bọc một vài thao tác `save`, `remove`, `update` trong một transaction.

Chúng ta sẽ xem xét ví dụ về việc tạo một người dùng và một bài viết mới trong cùng một transaction. Nếu một trong hai thao tác thất bại, cả hai sẽ được hoàn tác.

**Ví dụ sử dụng `QueryRunner` (trong `UserService` hoặc một service mới):**

```typescript
// src/user/user.service.ts (thêm phương thức)
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm'; // Import DataSource
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { Post } from '../post/post.entity'; // Import Post Entity

@Injectable()
export class UserService {
  constructor(
    private customUserRepository: UserRepository,
    private dataSource: DataSource, // Inject DataSource
  ) {}

  // ... các phương thức đã có ...

  async createUserAndPost(username: string, email: string, postTitle: string, postContent: string): Promise<{ user: User, post: Post }> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Tạo người dùng mới
      const newUser = queryRunner.manager.create(User, { username, email });
      await queryRunner.manager.save(newUser);

      // Tạo bài viết mới liên kết với người dùng vừa tạo
      const newPost = queryRunner.manager.create(Post, { title: postTitle, content: postContent, user: newUser });
      await queryRunner.manager.save(newPost);

      await queryRunner.commitTransaction();
      return { user: newUser, post: newPost };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
```

**Giải thích:**

*   `this.dataSource.createQueryRunner()`: Tạo một `QueryRunner` mới từ `DataSource`.
*   `await queryRunner.connect()`: Kết nối `QueryRunner` với cơ sở dữ liệu.
*   `await queryRunner.startTransaction()`: Bắt đầu một transaction.
*   `queryRunner.manager.create()`, `queryRunner.manager.save()`: Sử dụng `EntityManager` của `QueryRunner` để thực hiện các thao tác trong transaction. Điều này đảm bảo rằng tất cả các thao tác này đều nằm trong cùng một transaction.
*   `await queryRunner.commitTransaction()`: Nếu tất cả các thao tác thành công, commit transaction.
*   `await queryRunner.rollbackTransaction()`: Nếu có lỗi xảy ra, rollback transaction để hoàn tác tất cả các thay đổi.
*   `await queryRunner.release()`: Luôn luôn giải phóng `QueryRunner` sau khi sử dụng, bất kể transaction thành công hay thất bại, để trả lại kết nối về pool.

**Ví dụ sử dụng `EntityManager` (đơn giản hơn):**

```typescript
// src/user/user.service.ts (thêm phương thức)
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { Post } from '../post/post.entity';

@Injectable()
export class UserService {
  constructor(
    private customUserRepository: UserRepository,
    private dataSource: DataSource,
  ) {}

  // ... các phương thức đã có ...

  async createUserAndPostWithEntityManager(username: string, email: string, postTitle: string, postContent: string): Promise<{ user: User, post: Post }> {
    return this.dataSource.transaction(async (manager) => {
      // Tạo người dùng mới
      const newUser = manager.create(User, { username, email });
      await manager.save(newUser);

      // Tạo bài viết mới liên kết với người dùng vừa tạo
      const newPost = manager.create(Post, { title: postTitle, content: postContent, user: newUser });
      await manager.save(newPost);

      return { user: newUser, post: newPost };
    });
  }
}
```

**Giải thích:**

*   `this.dataSource.transaction(async (manager) => { ... })`: Phương thức này bọc một hàm callback trong một transaction. TypeORM sẽ tự động quản lý việc bắt đầu, commit và rollback transaction. `manager` là một `EntityManager` được cung cấp cho callback, đảm bảo tất cả các thao tác bên trong callback đều nằm trong cùng một transaction.

### 5.2. Listeners và Subscribers

TypeORM cung cấp các cơ chế Listener và Subscriber để bạn có thể thực hiện các hành động trước hoặc sau khi một Entity được lưu, cập nhật, xóa hoặc tải. Điều này rất hữu ích cho các tác vụ như validation, hashing mật khẩu, cập nhật timestamp, hoặc gửi thông báo.

*   **Listeners:** Là các phương thức được đánh dấu bằng các decorator như `@BeforeInsert()`, `@AfterInsert()`, `@BeforeUpdate()`, `@AfterUpdate()`, v.v., được đặt trực tiếp trong Entity class.
*   **Subscribers:** Là các lớp riêng biệt lắng nghe các sự kiện của nhiều Entity hoặc các sự kiện toàn cục. Chúng cung cấp một cách tổ chức tốt hơn cho các logic phức tạp hoặc tái sử dụng.

**Ví dụ về Listener (trong `User` Entity):**

Chúng ta sẽ thêm một listener để tự động chuyển đổi `username` thành chữ thường trước khi lưu vào cơ sở dữ liệu.

```typescript
// src/user/user.entity.ts (thêm listener)
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Post } from '../post/post.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Post, post => post.user)
  posts: Post[];

  @BeforeInsert()
  @BeforeUpdate()
  convertUsernameToLowercase() {
    this.username = this.username.toLowerCase();
  }
}
```

**Giải thích:**

*   `@BeforeInsert()`: Phương thức `convertUsernameToLowercase` sẽ được gọi trước khi một Entity `User` mới được chèn vào cơ sở dữ liệu.
*   `@BeforeUpdate()`: Phương thức này cũng sẽ được gọi trước khi một Entity `User` hiện có được cập nhật.

**Ví dụ về Subscriber:**

Chúng ta sẽ tạo một Subscriber để log lại các sự kiện `INSERT` và `UPDATE` cho `User` Entity.

**Bước 1: Tạo Subscriber (`src/subscriber/user.subscriber.ts`):**

```typescript
// src/subscriber/user.subscriber.ts
import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent } from 'typeorm';
import { User } from '../user/user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  afterInsert(event: InsertEvent<User>) {
    console.log(`AFTER INSERTED: `, event.entity);
  }

  afterUpdate(event: UpdateEvent<User>) {
    console.log(`AFTER UPDATED: `, event.entity);
  }
}
```

**Giải thích:**

*   `@EventSubscriber()`: Đánh dấu lớp này là một TypeORM Subscriber.
*   `listenTo()`: Phương thức này cho TypeORM biết Subscriber này sẽ lắng nghe các sự kiện của Entity nào. Ở đây là `User`.
*   `afterInsert(event: InsertEvent<User>)`: Phương thức này được gọi sau khi một Entity `User` được chèn vào cơ sở dữ liệu.
*   `afterUpdate(event: UpdateEvent<User>)`: Phương thức này được gọi sau khi một Entity `User` được cập nhật.

**Bước 2: Đăng ký Subscriber trong cấu hình TypeORM:**

Để TypeORM nhận biết Subscriber, bạn cần thêm nó vào mảng `subscribers` trong cấu hình `TypeOrmModule.forRoot`.

```typescript
// src/app.module.ts (cập nhật)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { Post } from './post/post.entity';
import { PostModule } from './post/post.module';
import { UserSubscriber } from './subscriber/user.subscriber'; // Import UserSubscriber

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, Post],
      synchronize: false,
      autoLoadEntities: true,
      subscribers: [UserSubscriber], // Thêm Subscriber vào đây
    }),
    UserModule,
    PostModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Bây giờ, khi bạn tạo hoặc cập nhật một người dùng, bạn sẽ thấy log trong console.

### 5.3. Caching

Caching là một kỹ thuật quan trọng để cải thiện hiệu suất ứng dụng bằng cách lưu trữ kết quả của các truy vấn cơ sở dữ liệu thường xuyên được sử dụng trong bộ nhớ hoặc một kho lưu trữ nhanh khác. TypeORM cung cấp tích hợp caching đơn giản.

Để sử dụng caching, bạn cần cấu hình một cache driver trong `TypeOrmModule.forRoot`. TypeORM hỗ trợ các cache driver như `redis`, `memcached`, hoặc một `CustomCache`.

**Bước 1: Cài đặt cache driver (ví dụ: `redis`)**

```bash
npm install redis
```

**Bước 2: Cấu hình caching trong `src/app.module.ts`:**

```typescript
// src/app.module.ts (cập nhật caching)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { Post } from './post/post.entity';
import { PostModule } from './post/post.module';
import { UserSubscriber } from './subscriber/user.subscriber';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, Post],
      synchronize: false,
      autoLoadEntities: true,
      subscribers: [UserSubscriber],
      cache: {
        type: 'redis', // Hoặc 'memory', 'memcached'
        options: {
          host: 'localhost',
          port: 6379,
        }, // Cấu hình Redis server
        duration: 10000, // Thời gian cache (miliseconds), ví dụ 10 giây
      },
    }),
    UserModule,
    PostModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Lưu ý:** Để ví dụ này hoạt động, bạn cần có một Redis server đang chạy trên `localhost:6379`.

**Bước 3: Sử dụng caching trong truy vấn:**

Bạn có thể bật caching cho các truy vấn cụ thể bằng cách sử dụng phương thức `.cache()` trên Query Builder hoặc Repository.

```typescript
// src/user/user.service.ts (thêm caching vào findAll)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { Post } from '../post/post.entity';

@Injectable()
export class UserService {
  constructor(
    private customUserRepository: UserRepository,
    private dataSource: DataSource,
  ) {}

  // ... các phương thức đã có ...

  // Read all with caching
  async findAll(): Promise<User[]> {
    return this.customUserRepository.find({ cache: true }); // Bật cache cho truy vấn này
  }

  // Hoặc với Query Builder
  async findUsersWithPostsCached(usernamePartial: string): Promise<User[]> {
    return this.customUserRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.posts', 'post')
      .where('user.username LIKE :username', { username: `%${usernamePartial}%` })
      .groupBy('user.id')
      .having('COUNT(post.id) > 0')
      .cache(true) // Bật cache cho Query Builder
      .getMany();
  }
}
```

**Giải thích:**

*   `cache: true`: Bật caching cho truy vấn `find()` này. TypeORM sẽ lưu trữ kết quả của truy vấn vào cache và trả về từ cache nếu truy vấn được gọi lại trong thời gian `duration` đã cấu hình.
*   `cache(true)`: Tương tự, bật caching cho Query Builder.

Caching rất hiệu quả cho các truy vấn đọc thường xuyên và ít thay đổi. Tuy nhiên, cần cẩn thận với dữ liệu thay đổi thường xuyên để tránh trả về dữ liệu cũ.

### 5.4. Performance Tuning

Để tối ưu hóa hiệu suất khi sử dụng TypeORM, có một số kỹ thuật quan trọng cần xem xét:

*   **Lazy vs. Eager Loading:**
    *   **Eager Loading:** Mối quan hệ được tải tự động cùng với Entity chính. Điều này được thực hiện bằng cách sử dụng `relations: ['relationName']` trong các phương thức `find()` hoặc `findOne()`, hoặc bằng cách sử dụng `leftJoinAndSelect()` trong Query Builder. Eager loading đơn giản để sử dụng nhưng có thể dẫn đến việc tải quá nhiều dữ liệu không cần thiết (N+1 problem) nếu không được quản lý cẩn thận.
    *   **Lazy Loading:** Mối quan hệ chỉ được tải khi bạn truy cập thuộc tính mối quan hệ đó lần đầu tiên. Điều này giúp tiết kiệm bộ nhớ và băng thông nếu mối quan hệ không phải lúc nào cũng cần thiết. Để sử dụng lazy loading, bạn chỉ cần định nghĩa mối quan hệ mà không cần thêm `eager: true` hoặc `relations` trong truy vấn. Các thuộc tính lazy-loaded thường được đánh dấu bằng `Promise<T>`.

    **Ví dụ Lazy Loading (trong `User` Entity):**

    ```typescript
    // src/user/user.entity.ts (Lazy Loading cho posts)
    import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
    import { Post } from '../post/post.entity';

    @Entity()
    export class User {
      // ... các thuộc tính khác ...

      @OneToMany(() => Post, post => post.user)
      posts: Promise<Post[]>; // Sử dụng Promise cho Lazy Loading
    }
    ```

    Khi bạn truy cập `user.posts`, TypeORM sẽ tự động thực hiện một truy vấn riêng để tải các bài viết liên quan.

    ```typescript
    // Trong một service hoặc controller
    const user = await this.userService.findOne(1); // Chỉ tải User
    const posts = await user.posts; // Lúc này mới tải các bài viết
    ```

    **Khi nào sử dụng Lazy vs. Eager:**
    *   Sử dụng **Eager Loading** khi bạn chắc chắn rằng mối quan hệ luôn cần thiết và số lượng bản ghi liên quan không quá lớn.
    *   Sử dụng **Lazy Loading** khi mối quan hệ chỉ cần thiết trong một số trường hợp, hoặc khi số lượng bản ghi liên quan có thể rất lớn. Kết hợp với Query Builder để tải dữ liệu có chọn lọc khi cần.

*   **Chọn lọc cột (Select Columns):**
    Chỉ chọn các cột bạn thực sự cần thay vì tải tất cả các cột của một Entity. Điều này giảm lượng dữ liệu truyền qua mạng và bộ nhớ sử dụng.

    ```typescript
    // src/user/user.service.ts (ví dụ chọn lọc cột)
    async findUsersBasicInfo(): Promise<Partial<User>[]> {
      return this.customUserRepository.find({
        select: ['id', 'username', 'email'], // Chỉ chọn các cột này
      });
    }
    ```

*   **Pagination (Phân trang):**
    Khi làm việc với tập dữ liệu lớn, luôn sử dụng phân trang để giới hạn số lượng bản ghi trả về. TypeORM hỗ trợ `skip` và `take`.

    ```typescript
    // src/user/user.service.ts (ví dụ phân trang)
    async findPaginatedUsers(page: number, limit: number): Promise<[User[], number]> {
      const skip = (page - 1) * limit;
      return this.customUserRepository.findAndCount({
        skip: skip,
        take: limit,
      });
    }
    ```

    `findAndCount()` trả về một tuple chứa mảng các Entity và tổng số bản ghi (không phân trang), rất hữu ích cho việc xây dựng giao diện phân trang.

*   **Indexing:**
    Đảm bảo các cột được sử dụng trong điều kiện `WHERE`, `JOIN`, `ORDER BY` có index phù hợp trong cơ sở dữ liệu. TypeORM cho phép bạn định nghĩa index trực tiếp trên Entity.

    ```typescript
    // src/user/user.entity.ts (thêm index)
    import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

    @Entity()
    @Index(["email", "username"], { unique: true }) // Composite unique index
    export class User {
      // ... các thuộc tính khác ...

      @Column({ unique: true })
      @Index() // Index riêng cho cột username
      username: string;

      @Column()
      @Index() // Index riêng cho cột email
      email: string;

      // ...
    }
    ```

    Khi bạn chạy migration, TypeORM sẽ tạo các index này trong cơ sở dữ liệu.

*   **Batch Operations:**
    Khi cần chèn hoặc cập nhật nhiều bản ghi, sử dụng các thao tác batch để giảm số lượng truy vấn đến cơ sở dữ liệu.

    ```typescript
    // src/user/user.service.ts (ví dụ batch insert)
    async createManyUsers(usersData: Partial<User>[]): Promise<User[]> {
      const newUsers = this.customUserRepository.create(usersData);
      return this.customUserRepository.save(newUsers); // TypeORM sẽ tự động thực hiện batch insert
    }
    ```

### 5.5. Sử dụng Decorator nâng cao

TypeORM cung cấp nhiều decorator mạnh mẽ khác để tùy chỉnh cách Entity và các cột của nó tương tác với cơ sở dữ liệu.

*   **`@CreateDateColumn()` và `@UpdateDateColumn()`:** Tự động quản lý các cột `createdAt` và `updatedAt`.

    ```typescript
    // src/user/user.entity.ts (thêm timestamp)
    import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

    @Entity()
    export class User {
      // ... các thuộc tính khác ...

      @CreateDateColumn()
      createdAt: Date;

      @UpdateDateColumn()
      updatedAt: Date;
    }
    ```

*   **`@VersionColumn()`:** Tự động quản lý phiên bản của Entity để hỗ trợ optimistic locking, giúp ngăn chặn các vấn đề đồng thời khi nhiều người dùng cố gắng cập nhật cùng một bản ghi.

    ```typescript
    // src/user/user.entity.ts (thêm version column)
    import { Entity, PrimaryGeneratedColumn, Column, VersionColumn } from 'typeorm';

    @Entity()
    export class User {
      // ... các thuộc tính khác ...

      @VersionColumn()
      version: number;
    }
    ```

*   **`@Generated()`:** Sử dụng cho các cột có giá trị được tạo tự động bởi cơ sở dữ liệu (ví dụ: UUID).

    ```typescript
    // src/some-entity.entity.ts (ví dụ UUID)
    import { Entity, PrimaryColumn, Column, Generated } from 'typeorm';

    @Entity()
    export class SomeEntity {
      @PrimaryColumn()
      @Generated("uuid")
      id: string;

      // ...
    }
    ```

*   **`@Column()` với các tùy chọn nâng cao:**
    *   `type`: Chỉ định kiểu dữ liệu cụ thể trong cơ sở dữ liệu (ví dụ: `decimal`, `jsonb`).
    *   `nullable`: Cho phép cột có giá trị `NULL`.
    *   `default`: Giá trị mặc định cho cột.
    *   `length`: Độ dài tối đa cho kiểu `varchar`.
    *   `precision`, `scale`: Độ chính xác cho kiểu số thập phân.

    ```typescript
    // src/product/product.entity.ts (ví dụ)
    import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

    @Entity()
    export class Product {
      @PrimaryGeneratedColumn()
      id: number;

      @Column({ type: 'varchar', length: 255 })
      name: string;

      @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
      price: number;

      @Column({ type: 'jsonb', nullable: true })
      details: object;
    }
    ```

Việc nắm vững các decorator này giúp bạn định nghĩa schema cơ sở dữ liệu một cách chính xác và hiệu quả, tận dụng tối đa các tính năng của TypeORM và cơ sở dữ liệu PostgreSQL.

## 6. Cấp độ Principal: Kiến trúc và Best Practices

Ở cấp độ Principal, chúng ta sẽ tập trung vào việc thiết kế kiến trúc ứng dụng bền vững, các phương pháp hay nhất (best practices) để đảm bảo chất lượng mã, khả năng kiểm thử, bảo mật và khả năng mở rộng của ứng dụng NestJS sử dụng TypeORM. Đây là những kiến thức quan trọng để xây dựng các hệ thống lớn và phức tạp.

### 6.1. Thiết kế kiến trúc ứng dụng với TypeORM

Một kiến trúc tốt là chìa khóa cho một ứng dụng dễ bảo trì, mở rộng và kiểm thử. Với NestJS và TypeORM, bạn nên tuân thủ các nguyên tắc sau:

*   **Tách biệt mối quan tâm (Separation of Concerns):**
    *   **Controllers:** Chỉ xử lý các yêu cầu HTTP, gọi các service và trả về phản hồi. Không chứa logic nghiệp vụ hoặc logic truy vấn cơ sở dữ liệu trực tiếp.
    *   **Services:** Chứa logic nghiệp vụ chính của ứng dụng. Đây là nơi bạn sẽ gọi các phương thức từ Repository để tương tác với cơ sở dữ liệu, xử lý dữ liệu, và áp dụng các quy tắc nghiệp vụ.
    *   **Repositories (hoặc Custom Repositories):** Chứa logic tương tác trực tiếp với cơ sở dữ liệu cho một Entity cụ thể. Các phương thức ở đây nên tập trung vào việc truy vấn, lưu trữ, cập nhật và xóa dữ liệu.
    *   **Entities:** Chỉ định nghĩa cấu trúc của bảng cơ sở dữ liệu và các mối quan hệ. Tránh thêm logic nghiệp vụ phức tạp vào Entity.
    *   **DTOs (Data Transfer Objects):** Định nghĩa cấu trúc dữ liệu cho việc truyền tải giữa các lớp (ví dụ: từ client đến controller, hoặc giữa các service). Sử dụng `class-validator` và `class-transformer` để validate và transform dữ liệu.

*   **Module hóa:** NestJS khuyến khích chia ứng dụng thành các module nhỏ, độc lập. Mỗi module nên tập trung vào một tính năng hoặc một phần của nghiệp vụ (ví dụ: `UserModule`, `AuthModule`, `ProductModule`). Mỗi module sẽ có các Controller, Service, Entity và Repository riêng.

    ```typescript
    // src/app.module.ts
    import { Module } from '@nestjs/common';
    import { TypeOrmModule } from '@nestjs/typeorm';
    import { ConfigModule } from '@nestjs/config';
    import { UserModule } from './user/user.module';
    import { PostModule } from './post/post.module';
    // ... các imports khác ...

    @Module({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
        TypeOrmModule.forRoot({
          // ... cấu hình DB ...
          entities: [__dirname + '/**/*.entity{.ts,.js}'], // Tự động tìm tất cả entities
          subscribers: [__dirname + '/**/*.subscriber{.ts,.js}'], // Tự động tìm tất cả subscribers
        }),
        UserModule,
        PostModule,
        // ... các module khác ...
      ],
      // ...
    })
    export class AppModule {}
    ```

*   **Sử dụng Dependency Injection (DI):** NestJS được xây dựng dựa trên DI. Luôn inject các dependencies (như Service, Repository) vào constructor của lớp thay vì tạo instance mới. Điều này giúp mã dễ kiểm thử, linh hoạt và dễ bảo trì hơn.

    ```typescript
    // src/user/user.service.ts
    import { Injectable } from '@nestjs/common';
    import { UserRepository } from './user.repository';

    @Injectable()
    export class UserService {
      constructor(private readonly userRepository: UserRepository) {}
      // ...
    }
    ```

*   **Xử lý lỗi tập trung (Centralized Error Handling):** Sử dụng Exception Filters của NestJS để bắt và xử lý các lỗi HTTP một cách nhất quán trên toàn ứng dụng. Đối với các lỗi liên quan đến cơ sở dữ liệu từ TypeORM, bạn có thể tạo các custom exception filters để chuyển đổi chúng thành các phản hồi HTTP thân thiện với người dùng.

### 6.2. Testing với TypeORM

Kiểm thử là một phần không thể thiếu của quá trình phát triển phần mềm. Với TypeORM và NestJS, bạn cần kiểm thử ở nhiều cấp độ:

*   **Unit Tests:** Kiểm thử các đơn vị mã nhỏ nhất (ví dụ: các phương thức trong service, các hàm tiện ích) một cách độc lập, không cần kết nối cơ sở dữ liệu thực. Bạn có thể mock (giả lập) các Repository của TypeORM.

    **Ví dụ Unit Test cho `UserService` (mock `UserRepository`):**

    ```typescript
    // test/user/user.service.spec.ts
    import { Test, TestingModule } from '@nestjs/testing';
    import { UserService } from '../../src/user/user.service';
    import { UserRepository } from '../../src/user/user.repository';
    import { User } from '../../src/user/user.entity';

    describe('UserService', () => {
      let service: UserService;
      let repository: UserRepository;

      const mockUserRepository = {
        findOneBy: jest.fn(),
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      };

      beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          providers: [
            UserService,
            {
              provide: UserRepository,
              useValue: mockUserRepository,
            },
          ],
        }).compile();

        service = module.get<UserService>(UserService);
        repository = module.get<UserRepository>(UserRepository);
      });

      it('should be defined', () => {
        expect(service).toBeDefined();
      });

      it('should find a user by id', async () => {
        const user = new User();
        user.id = 1;
        user.username = 'testuser';
        mockUserRepository.findOneBy.mockResolvedValue(user);

        expect(await service.findOne(1)).toEqual(user);
        expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      });

      // ... thêm các test case khác cho các phương thức CRUD
    });
    ```

*   **Integration Tests:** Kiểm thử sự tương tác giữa các thành phần (ví dụ: Controller với Service, Service với Repository) và thường yêu cầu một cơ sở dữ liệu thực (hoặc một cơ sở dữ liệu trong bộ nhớ như SQLite để tăng tốc độ).

    **Ví dụ Integration Test (sử dụng TypeORM Test Module):**

    ```typescript
    // test/user/user.e2e-spec.ts (ví dụ)
    import { Test, TestingModule } from '@nestjs/testing';
    import * as request from 'supertest';
    import { AppModule } from './../src/app.module';
    import { INestApplication } from '@nestjs/common';
    import { DataSource } from 'typeorm';
    import { User } from '../src/user/user.entity';

    describe('UserController (e2e)', () => {
      let app: INestApplication;
      let dataSource: DataSource;

      beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        dataSource = app.get(DataSource);
        // Xóa tất cả dữ liệu trước mỗi lần chạy test
        await dataSource.synchronize(true); // Sử dụng synchronize cho test env
      });

      afterAll(async () => {
        await dataSource.destroy();
        await app.close();
      });

      it('/users (POST)', async () => {
        const createUserDto = { username: 'testuser', email: 'test@example.com' };
        return request(app.getHttpServer())
          .post('/users')
          .send(createUserDto)
          .expect(201)
          .expect((res) => {
            expect(res.body.username).toEqual(createUserDto.username);
            expect(res.body.email).toEqual(createUserDto.email);
            expect(res.body.id).toBeDefined();
          });
      });

      // ... thêm các test case khác cho GET, PUT, DELETE
    });
    ```

    **Lưu ý:** Đối với integration tests, bạn có thể cấu hình một cơ sở dữ liệu test riêng biệt (ví dụ: một cơ sở dữ liệu PostgreSQL khác hoặc SQLite trong bộ nhớ) để đảm bảo môi trường test sạch sẽ và không ảnh hưởng đến dữ liệu phát triển.

### 6.3. Xử lý lỗi và Logging

*   **Xử lý lỗi:**
    *   **TypeORM Exceptions:** TypeORM sẽ ném ra các lỗi cụ thể (ví dụ: `QueryFailedError` khi có lỗi SQL, `EntityNotFoundError` khi không tìm thấy Entity). Bạn nên bắt các lỗi này trong Service layer và chuyển đổi chúng thành các lỗi nghiệp vụ hoặc lỗi HTTP thân thiện với người dùng.
    *   **NestJS Exception Filters:** Sử dụng `@Catch()` decorator để tạo các global hoặc scoped exception filters để xử lý các loại lỗi khác nhau và trả về phản hồi chuẩn hóa cho client.

    ```typescript
    // src/common/filters/all-exceptions.filter.ts
    import { Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
    import { BaseExceptionFilter } from '@nestjs/core';
    import { QueryFailedError } from 'typeorm';

    @Catch()
    export class AllExceptionsFilter extends BaseExceptionFilter {
      catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';

        if (exception instanceof HttpException) {
          status = exception.getStatus();
          message = exception.message;
        } else if (exception instanceof QueryFailedError) {
          status = HttpStatus.BAD_REQUEST;
          message = `Database error: ${exception.message}`;
          // Có thể phân tích exception.driverError để cung cấp thông tin chi tiết hơn
        }

        response.status(status).json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          message: message,
        });
      }
    }
    ```

    Đăng ký filter này trong `main.ts`:

    ```typescript
    // src/main.ts
    import { NestFactory, HttpAdapterHost } from '@nestjs/core';
    import { AppModule } from './app.module';
    import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

    async function bootstrap() {
      const app = await NestFactory.create(AppModule);

      const { httpAdapter } = app.get(HttpAdapterHost);
      app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

      await app.listen(3000);
    }
    bootstrap();
    ```

*   **Logging:**
    *   Sử dụng logger của NestJS (hoặc tích hợp với các thư viện logging mạnh mẽ như Winston, Pino) để ghi lại các sự kiện quan trọng, lỗi và thông tin debug. TypeORM cũng có thể được cấu hình để log các truy vấn SQL, rất hữu ích cho việc debug và tối ưu hóa.

    **Cấu hình TypeORM để log SQL queries (trong `src/app.module.ts`):**

    ```typescript
    // src/app.module.ts (cập nhật logging)
    TypeOrmModule.forRoot({
      // ... các cấu hình khác ...
      logging: ['query', 'error'], // Log các truy vấn SQL và lỗi
      // logger: 'advanced-console', // Hoặc 'simple-console', 'file', hoặc custom logger
    }),
    ```

### 6.4. Security Best Practices

Bảo mật là tối quan trọng trong mọi ứng dụng web. Khi sử dụng TypeORM và NestJS, hãy tuân thủ các nguyên tắc sau:

*   **SQL Injection Prevention:** TypeORM tự động bảo vệ chống lại SQL Injection khi bạn sử dụng các phương thức của Repository hoặc Query Builder với tham số hóa. **Tuyệt đối không** xây dựng các truy vấn SQL bằng cách nối chuỗi trực tiếp với dữ liệu đầu vào từ người dùng.

    ```typescript
    // KHÔNG NÊN LÀM (dễ bị SQL Injection)
    // const rawQuery = `SELECT * FROM users WHERE username = '${username}'`;
    // await this.usersRepository.query(rawQuery);

    // NÊN LÀM (an toàn với tham số hóa)
    await this.usersRepository.findOneBy({ username });
    // Hoặc với Query Builder
    this.usersRepository.createQueryBuilder('user')
      .where('user.username = :username', { username: username })
      .getOne();
    ```

*   **Data Validation:** Luôn validate dữ liệu đầu vào từ client bằng cách sử dụng `class-validator` và NestJS Pipes. Điều này đảm bảo rằng chỉ dữ liệu hợp lệ mới được xử lý và lưu vào cơ sở dữ liệu.

*   **Password Hashing:** Không bao giờ lưu trữ mật khẩu dưới dạng văn bản thuần túy. Luôn hash mật khẩu bằng các thuật toán mạnh mẽ (ví dụ: bcrypt) trước khi lưu vào cơ sở dữ liệu. Bạn có thể sử dụng Listeners (`@BeforeInsert`, `@BeforeUpdate`) để tự động hash mật khẩu.

*   **Environment Variables:** Lưu trữ thông tin nhạy cảm (như thông tin kết nối cơ sở dữ liệu, khóa API) trong các biến môi trường và không bao giờ hardcode chúng trong mã nguồn. Sử dụng `@nestjs/config` để quản lý các biến môi trường.

*   **Least Privilege Principle:** Cấp cho người dùng cơ sở dữ liệu quyền hạn tối thiểu cần thiết để thực hiện công việc của họ. Ví dụ, một ứng dụng chỉ cần quyền `SELECT`, `INSERT`, `UPDATE`, `DELETE` trên các bảng dữ liệu, không cần quyền `DROP TABLE` hoặc `ALTER DATABASE`.

### 6.5. Triển khai và Scaling

*   **Cấu hình Production:**
    *   Tắt `synchronize: true` trong cấu hình TypeORM.
    *   Sử dụng Migrations để quản lý schema.
    *   Tắt logging SQL query nếu không cần thiết để tránh overhead.
    *   Sử dụng các biến môi trường cho tất cả các cấu hình nhạy cảm.
    *   Tối ưu hóa build của NestJS (ví dụ: `npm run build`).

*   **Database Connection Pooling:** TypeORM tự động quản lý connection pooling. Đảm bảo cấu hình pool size phù hợp với số lượng kết nối mà cơ sở dữ liệu của bạn có thể xử lý và số lượng request mà ứng dụng của bạn dự kiến nhận được.

*   **Scaling:**
    *   **Vertical Scaling:** Nâng cấp tài nguyên của máy chủ (CPU, RAM) nơi ứng dụng và cơ sở dữ liệu đang chạy.
    *   **Horizontal Scaling (Load Balancing):** Chạy nhiều instance của ứng dụng NestJS phía sau một load balancer. Mỗi instance sẽ kết nối đến cùng một cơ sở dữ liệu. Điều này yêu cầu ứng dụng của bạn phải stateless (không lưu trữ trạng thái phiên trên máy chủ).
    *   **Database Sharding/Replication:** Đối với cơ sở dữ liệu, bạn có thể sử dụng replication (master-replica) để tăng khả năng đọc và sharding để phân tán dữ liệu trên nhiều máy chủ cơ sở dữ liệu, tăng khả năng ghi và lưu trữ.

*   **Monitoring:** Thiết lập các công cụ giám sát để theo dõi hiệu suất ứng dụng (CPU, RAM, network) và cơ sở dữ liệu (số lượng kết nối, truy vấn chậm, dung lượng đĩa). Điều này giúp bạn phát hiện và giải quyết các vấn đề hiệu suất kịp thời.

Bằng cách áp dụng các nguyên tắc kiến trúc và best practices này, bạn có thể xây dựng các ứng dụng NestJS mạnh mẽ, an toàn và có khả năng mở rộng với TypeORM.

## Tài liệu tham khảo

*   [TypeORM Official Documentation](https://typeorm.io/#/)
*   [NestJS Official Documentation](https://docs.nestjs.com/)
*   [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
*   [Object-Relational Mapping - Wikipedia](https://en.wikipedia.org/wiki/Object%E2%80%93relational_mapping)
*   [What is an ORM – The Meaning of Object Relational Mapping - freeCodeCamp](https://www.freecodecamp.org/news/what-is-an-orm-the-meaning-of-object-relational-mapping-database-tools/)
*   [TypeORM with NestJS: A Beginner's Guide to Database Integration - Codersera](https://codersera.com/blog/typeorm-with-nestjs-a-beginners-guide-to-database-integration)
*   [TypeORM with NestJS: A Comprehensive Guide with Examples - LinkedIn](https://www.linkedin.com/pulse/typeorm-nestjs-comprehensive-guide-examples-syed-ali-hamza-zaidi--0p9qf)





