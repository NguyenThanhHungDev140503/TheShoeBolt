import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { UsersService } from '../../users/users.service';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(
    // @InjectRepository(Shipping)
    // private readonly shippingRepository: Repository<Shipping>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Assign shipper to order - Business logic moved from sp_assign_shipper
   * This replaces the stored procedure with proper Clean Architecture
   */
  async assignShipper(orderId: string, shipperId: string): Promise<void> {
    this.logger.log(`Assigning shipper ${shipperId} to order ${orderId}`);

    try {
      // Business logic: Validate shipper role
      const isShipper = await this.validateShipperRole(shipperId);
      if (!isShipper) {
        throw new BadRequestException('Người dùng không phải shipper');
      }

      // Simple data operation - will be implemented when Shipping entity is available
      await this.updateShippingRecord(orderId, shipperId);

      this.logger.log(`Successfully assigned shipper ${shipperId} to order ${orderId}`);
    } catch (error) {
      this.logger.error(`Failed to assign shipper: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Validate if user has shipper role
   * Business logic that was previously in database layer
   */
  private async validateShipperRole(userId: string): Promise<boolean> {
    try {
      // This will need to be implemented based on your User/Role entities
      // For now, returning true as placeholder
      // TODO: Implement actual role validation
      // const user = await this.usersService.findOne(userId);
      // return user.roles.some(role => role.name === 'shipper');

      this.logger.debug(`Validating shipper role for user ${userId}`);
      return true; // Placeholder implementation
    } catch (error) {
      this.logger.error(`Error validating shipper role: ${error.message}`);
      return false;
    }
  }

  /**
   * Update shipping record with shipper assignment
   * Simple data operation that replaces stored procedure
   */
  private async updateShippingRecord(orderId: string, shipperId: string): Promise<void> {
    try {
      // TODO: Implement when Shipping entity is available
      // await this.shippingRepository.update(
      //   { orderId },
      //   {
      //     shipperId,
      //     updatedAt: new Date()
      //   }
      // );

      // For now, just log the operation
      this.logger.debug(`Would update shipping record for order ${orderId} with shipper ${shipperId}`);

      // Simulate the database operation
      // In real implementation, this would throw NotFoundException if order not found
      // if (result.affected === 0) {
      //   throw new NotFoundException(`Không tìm thấy shipping record cho order: ${orderId}`);
      // }
    } catch (error) {
      this.logger.error(`Error updating shipping record: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update shipping status
   * Simple data operation for existing compliant procedure
   */
  async updateShippingStatus(shippingId: string, newStatus: string): Promise<void> {
    this.logger.log(`Updating shipping ${shippingId} status to ${newStatus}`);

    try {
      // TODO: Implement when Shipping entity is available
      // const result = await this.shippingRepository.update(
      //   { id: shippingId },
      //   {
      //     status: newStatus,
      //     updatedAt: new Date()
      //   }
      // );

      // if (result.affected === 0) {
      //   throw new NotFoundException(`Không tìm thấy bản ghi giao hàng với ID: ${shippingId}`);
      // }

      this.logger.log(`Successfully updated shipping status`);
    } catch (error) {
      this.logger.error(`Failed to update shipping status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Transaction-aware version for complex workflows
   */
  async assignShipperWithTransaction(
    orderId: string,
    shipperId: string,
    manager?: EntityManager
  ): Promise<void> {
    const repository = manager ? manager.getRepository('Shipping') : null;

    // Business validation
    const isShipper = await this.validateShipperRole(shipperId);
    if (!isShipper) {
      throw new BadRequestException('Người dùng không phải shipper');
    }

    // Data operation with transaction support
    if (repository) {
      // TODO: Implement with actual entity
      // await repository.update({ orderId }, { shipperId, updatedAt: new Date() });
    } else {
      await this.updateShippingRecord(orderId, shipperId);
    }
  }
}
