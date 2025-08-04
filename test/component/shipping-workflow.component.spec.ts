import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ShippingService } from '../../src/modules/shipping/services/shipping.service';
import { UsersService } from '../../src/modules/users/users.service';

describe('Shipping Workflow Component Test', () => {
  let shippingService: ShippingService;
  let usersService: jest.Mocked<UsersService>;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    const mockUsersService = {
      findOne: jest.fn(),
      hasRole: jest.fn(),
      existsByEmail: jest.fn(),
      existsByPhone: jest.fn(),
    };

    const mockDataSource = {
      query: jest.fn(),
      transaction: jest.fn(),
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

    shippingService = module.get<ShippingService>(ShippingService);
    usersService = module.get(UsersService);
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Shipper Assignment Workflow', () => {
    const orderId = 'order-123';
    const shipperId = 'shipper-456';

    it('should complete full shipper assignment workflow', async () => {
      // Arrange
      jest.spyOn(shippingService as any, 'validateShipperRole').mockResolvedValue(true);
      dataSource.query.mockResolvedValue(undefined);

      // Act
      await shippingService.assignShipper(orderId, shipperId);

      // Assert
      expect(shippingService['validateShipperRole']).toHaveBeenCalledWith(shipperId);
      // Note: Since updateShippingRecord is placeholder, we check the debug log
    });

    it('should handle role validation failure', async () => {
      // Arrange
      jest.spyOn(shippingService as any, 'validateShipperRole').mockResolvedValue(false);

      // Act & Assert
      await expect(shippingService.assignShipper(orderId, shipperId))
        .rejects
        .toThrow(BadRequestException);

      expect(shippingService['validateShipperRole']).toHaveBeenCalledWith(shipperId);
    });

    it('should handle database transaction errors', async () => {
      // Arrange
      jest.spyOn(shippingService as any, 'validateShipperRole').mockResolvedValue(true);
      jest.spyOn(shippingService as any, 'updateShippingRecord').mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act & Assert
      await expect(shippingService.assignShipper(orderId, shipperId))
        .rejects
        .toThrow('Database connection failed');
    });

    it('should log workflow progress', async () => {
      // Arrange
      const logSpy = jest.spyOn(shippingService['logger'], 'log').mockImplementation();
      jest.spyOn(shippingService as any, 'validateShipperRole').mockResolvedValue(true);
      jest.spyOn(shippingService as any, 'updateShippingRecord').mockResolvedValue(undefined);

      // Act
      await shippingService.assignShipper(orderId, shipperId);

      // Assert
      expect(logSpy).toHaveBeenCalledWith(`Assigning shipper ${shipperId} to order ${orderId}`);
      expect(logSpy).toHaveBeenCalledWith(`Successfully assigned shipper ${shipperId} to order ${orderId}`);
    });
  });

  describe('Transaction-aware Shipper Assignment', () => {
    const orderId = 'order-123';
    const shipperId = 'shipper-456';
    const mockManager = {
      getRepository: jest.fn(),
    };

    it('should handle transaction-aware assignment', async () => {
      // Arrange
      jest.spyOn(shippingService as any, 'validateShipperRole').mockResolvedValue(true);
      jest.spyOn(shippingService as any, 'updateShippingRecord').mockResolvedValue(undefined);

      // Act
      await shippingService.assignShipperWithTransaction(orderId, shipperId, mockManager as any);

      // Assert
      expect(shippingService['validateShipperRole']).toHaveBeenCalledWith(shipperId);
      expect(shippingService['updateShippingRecord']).toHaveBeenCalledWith(orderId, shipperId);
    });

    it('should handle transaction rollback on validation failure', async () => {
      // Arrange
      jest.spyOn(shippingService as any, 'validateShipperRole').mockResolvedValue(false);

      // Act & Assert
      await expect(shippingService.assignShipperWithTransaction(orderId, shipperId, mockManager as any))
        .rejects
        .toThrow(BadRequestException);

      expect(shippingService['validateShipperRole']).toHaveBeenCalledWith(shipperId);
    });
  });
});
