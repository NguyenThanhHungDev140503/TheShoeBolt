import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ShippingService } from '../../../../src/modules/shipping/services/shipping.service';
import { UsersService } from '../../../../src/modules/users/users.service';

describe('ShippingService', () => {
  let service: ShippingService;
  let usersService: jest.Mocked<UsersService>;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    const mockUsersService = {
      findOne: jest.fn(),
      hasRole: jest.fn(),
    };

    const mockDataSource = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShippingService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ShippingService>(ShippingService);
    usersService = module.get(UsersService);
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignShipper', () => {
    const orderId = 'order-123';
    const shipperId = 'shipper-456';

    it('should assign shipper when user has valid role', async () => {
      // Arrange
      jest.spyOn(service as any, 'validateShipperRole').mockResolvedValue(true);
      jest.spyOn(service as any, 'updateShippingRecord').mockResolvedValue(undefined);

      // Act
      await service.assignShipper(orderId, shipperId);

      // Assert
      expect(service['validateShipperRole']).toHaveBeenCalledWith(shipperId);
      expect(service['updateShippingRecord']).toHaveBeenCalledWith(orderId, shipperId);
    });

    it('should throw BadRequestException when user is not shipper', async () => {
      // Arrange
      jest.spyOn(service as any, 'validateShipperRole').mockResolvedValue(false);

      // Act & Assert
      await expect(service.assignShipper(orderId, shipperId))
        .rejects
        .toThrow(BadRequestException);

      expect(service['validateShipperRole']).toHaveBeenCalledWith(shipperId);
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      jest.spyOn(service as any, 'validateShipperRole').mockResolvedValue(true);
      jest.spyOn(service as any, 'updateShippingRecord').mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.assignShipper(orderId, shipperId))
        .rejects
        .toThrow('Database error');
    });

    it('should log operations correctly', async () => {
      // Arrange
      const logSpy = jest.spyOn(service['logger'], 'log').mockImplementation();
      const errorSpy = jest.spyOn(service['logger'], 'error').mockImplementation();

      jest.spyOn(service as any, 'validateShipperRole').mockResolvedValue(true);
      jest.spyOn(service as any, 'updateShippingRecord').mockResolvedValue(undefined);

      // Act
      await service.assignShipper(orderId, shipperId);

      // Assert
      expect(logSpy).toHaveBeenCalledWith(`Assigning shipper ${shipperId} to order ${orderId}`);
      expect(logSpy).toHaveBeenCalledWith(`Successfully assigned shipper ${shipperId} to order ${orderId}`);
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe('validateShipperRole', () => {
    const userId = 'user-123';

    it('should return true for valid shipper (placeholder implementation)', async () => {
      // Act
      const result = await service['validateShipperRole'](userId);

      // Assert
      expect(result).toBe(true);
    });

    it('should log debug message', async () => {
      // Arrange
      const debugSpy = jest.spyOn(service['logger'], 'debug').mockImplementation();

      // Act
      await service['validateShipperRole'](userId);

      // Assert
      expect(debugSpy).toHaveBeenCalledWith(`Validating shipper role for user ${userId}`);
    });
  });

  describe('updateShippingRecord', () => {
    const orderId = 'order-123';
    const shipperId = 'shipper-456';

    it('should log debug message after updating shipping record', async () => {
      // Arrange
      const debugSpy = jest.spyOn(service['logger'], 'debug').mockImplementation();
      dataSource.query.mockResolvedValue(undefined);

      // Act
      await service['updateShippingRecord'](orderId, shipperId);

      // Assert
      expect(dataSource.query).toHaveBeenCalledWith(
        'CALL sp_assign_shipper_simple($1, $2)',
        [orderId, shipperId]
      );
      expect(debugSpy).toHaveBeenCalledWith(`Updated shipping record for order ${orderId} with shipper ${shipperId}`);
    });
  });

  describe('updateShippingStatus', () => {
    const shippingId = 'shipping-123';
    const newStatus = 'delivered';

    it('should update shipping status successfully', async () => {
      // Arrange
      const logSpy = jest.spyOn(service['logger'], 'log').mockImplementation();

      // Act
      await service.updateShippingStatus(shippingId, newStatus);

      // Assert
      expect(logSpy).toHaveBeenCalledWith(`Updating shipping ${shippingId} status to ${newStatus}`);
      expect(logSpy).toHaveBeenCalledWith('Successfully updated shipping status');
    });
  });

  describe('assignShipperWithTransaction', () => {
    const orderId = 'order-123';
    const shipperId = 'shipper-456';

    it('should assign shipper with transaction support', async () => {
      // Arrange
      jest.spyOn(service as any, 'validateShipperRole').mockResolvedValue(true);
      jest.spyOn(service as any, 'updateShippingRecord').mockResolvedValue(undefined);

      // Act
      await service.assignShipperWithTransaction(orderId, shipperId);

      // Assert
      expect(service['validateShipperRole']).toHaveBeenCalledWith(shipperId);
      expect(service['updateShippingRecord']).toHaveBeenCalledWith(orderId, shipperId);
    });

    it('should throw BadRequestException when user is not shipper', async () => {
      // Arrange
      jest.spyOn(service as any, 'validateShipperRole').mockResolvedValue(false);

      // Act & Assert
      await expect(service.assignShipperWithTransaction(orderId, shipperId))
        .rejects
        .toThrow(BadRequestException);
    });
  });
});