import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from '../../../../src/modules/payments/payments.service';
import { Payment } from '../../../../src/modules/payments/entities/payment.entity';
import { PaymentStatus } from '../../../../src/modules/payments/enums/payment-status.enum';

describe('PaymentsService - Refund Methods', () => {
  let service: PaymentsService;
  let paymentRepository: jest.Mocked<Repository<Payment>>;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    const mockPaymentRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
    };

    const mockDataSource = {
      transaction: jest.fn(),
      query: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('test_stripe_key'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    paymentRepository = module.get(getRepositoryToken(Payment));
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processRefund', () => {
    const paymentId = 'payment-123';
    const refundAmount = 100.50;
    const reason = 'Customer request';

    it('should process refund successfully', async () => {
      // Arrange
      const mockPayment = {
        id: paymentId,
        amount: 200.00,
        status: PaymentStatus.COMPLETED,
        stripePaymentIntentId: 'pi_test123',
      };
      const mockManager = {
        getRepository: jest.fn(() => paymentRepository),
      };

      dataSource.transaction.mockImplementation(async (callback) => callback(mockManager));
      jest.spyOn(service as any, 'findPaymentById').mockResolvedValue(mockPayment);
      jest.spyOn(service as any, 'validateRefundRequest').mockImplementation();
      jest.spyOn(service as any, 'processExternalRefund').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'updateRefundStatus').mockResolvedValue(undefined);

      // Act
      await service.processRefund(paymentId, refundAmount, reason);

      // Assert
      expect(service['findPaymentById']).toHaveBeenCalledWith(paymentId, mockManager);
      expect(service['validateRefundRequest']).toHaveBeenCalledWith(mockPayment, refundAmount);
      expect(service['processExternalRefund']).toHaveBeenCalledWith(mockPayment, refundAmount);
      expect(service['updateRefundStatus']).toHaveBeenCalledWith(paymentId, refundAmount, reason, mockManager);
    });

    it('should throw NotFoundException when payment not found', async () => {
      // Arrange
      const mockManager = {};
      dataSource.transaction.mockImplementation(async (callback) => callback(mockManager));
      jest.spyOn(service as any, 'findPaymentById').mockResolvedValue(null);

      // Act & Assert
      await expect(service.processRefund(paymentId, refundAmount, reason))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should validate refund request correctly', () => {
      // Arrange
      const validPayment = {
        id: paymentId,
        amount: 200.00,
        status: PaymentStatus.COMPLETED,
      };

      const invalidStatusPayment = {
        id: paymentId,
        amount: 200.00,
        status: PaymentStatus.PENDING,
      };

      const invalidAmountPayment = {
        id: paymentId,
        amount: 50.00, // Less than refund amount
        status: PaymentStatus.COMPLETED,
      };

      // Act & Assert
      expect(() => service['validateRefundRequest'](validPayment, refundAmount))
        .not.toThrow();

      expect(() => service['validateRefundRequest'](invalidStatusPayment, refundAmount))
        .toThrow(BadRequestException);

      expect(() => service['validateRefundRequest'](invalidAmountPayment, refundAmount))
        .toThrow(BadRequestException);
    });
  });

  describe('updateRefundStatusSimple', () => {
    const paymentId = 'payment-123';
    const refundAmount = 100.50;
    const reason = 'Customer request';

    it('should update refund status successfully', async () => {
      // Arrange
      const updateResult = { affected: 1 };
      paymentRepository.update.mockResolvedValue(updateResult as any);

      // Act
      await service.updateRefundStatusSimple(paymentId, refundAmount, reason);

      // Assert
      expect(paymentRepository.update).toHaveBeenCalledWith(
        { id: paymentId },
        expect.objectContaining({
          status: PaymentStatus.CANCELLED,
          description: expect.stringContaining('REFUNDED'),
        })
      );
    });

    it('should throw NotFoundException when payment not found', async () => {
      // Arrange
      const updateResult = { affected: 0 };
      paymentRepository.update.mockResolvedValue(updateResult as any);

      // Act & Assert
      await expect(service.updateRefundStatusSimple(paymentId, refundAmount, reason))
        .rejects
        .toThrow(NotFoundException);
    });
  });
});
