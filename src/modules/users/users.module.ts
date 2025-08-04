import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { ElasticsearchModule } from '../elasticsearch/elasticsearch.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ElasticsearchModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}