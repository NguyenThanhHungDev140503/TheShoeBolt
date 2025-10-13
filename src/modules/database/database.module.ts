import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from '@/config/database.config';
import { User } from '../users/entities/user.entity';
import { Payment } from '../payments/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)], // Đăng ký databaseConfig vào trong hệ thống DI bằng forFeature
      useFactory: (config) => ({
        ...config,
        entities: [User, Payment],
      }),
      inject: [databaseConfig.KEY], // Dùng Key của registerAs để cho hệ thống DI tìm kiếm module và inject vào trong useFactory
    }),
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     uri: configService.get('mongodb.uri'),
    //   }),
    //   inject: [ConfigService],
    // }),
  ],
})
export class DatabaseModule { }