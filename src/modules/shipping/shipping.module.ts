import { Module } from '@nestjs/common';
import { ShippingService } from './services/shipping.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
