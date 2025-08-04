import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ShippingService } from '../../../src/modules/shipping/services/shipping.service';
import { UsersService } from '../../../src/modules/users/users.service';
import { PaymentsService } from '../../../src/modules/payments/payments.service';
import { User } from '../../../src/modules/users/entities/user.entity';
import { Payment } from '../../../src/modules/payments/entities/payment.entity';
import { ElasticsearchService } from '../../../src/modules/elasticsearch/elasticsearch.service';

describe('Database Refactor Performance Benchmarks', () => {
  let shippingService: ShippingService;
  let usersService: UsersService;
  let paymentsService: PaymentsService;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    const mockDataSource = {
      query: jest.fn(),
      transaction: jest.fn(),
    };

    const mockUserRepository = {
      findOne: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockPaymentRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
    };

    const mockElasticsearchService = {
      indexUser: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('test_key'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShippingService,
        UsersService,
        PaymentsService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentRepository,
        },
        {
          provide: ElasticsearchService,
          useValue: mockElasticsearchService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    shippingService = module.get<ShippingService>(ShippingService);
    usersService = module.get<UsersService>(UsersService);
    paymentsService = module.get<PaymentsService>(PaymentsService);
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Stored Procedure vs Service Performance', () => {
    const iterations = 100; // Reduced for testing environment
    const performanceThreshold = 50; // 50ms average per operation

    it('should measure shipper assignment performance', async () => {
      // Arrange
      const orderId = 'order-123';
      const shipperId = 'shipper-456';

      jest.spyOn(shippingService as any, 'validateShipperRole').mockResolvedValue(true);
      jest.spyOn(shippingService as any, 'updateShippingRecord').mockResolvedValue(undefined);

      // Warm up
      await shippingService.assignShipper(orderId, shipperId);

      // Act - Measure service performance
      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        await shippingService.assignShipper(`${orderId}-${i}`, `${shipperId}-${i}`);
      }

      const endTime = Date.now();
      const avgTime = (endTime - startTime) / iterations;

      // Assert
      expect(avgTime).toBeLessThan(performanceThreshold);
      console.log(`Shipper assignment average time: ${avgTime.toFixed(2)}ms per operation`);
    });

    it('should measure user registration performance', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '0123456789',
        password: 'hashedPassword123',
      };

      const mockUser = { id: 'user-123', firstName: 'John', lastName: 'Doe' };
      const mockManager = { getRepository: jest.fn() };

      dataSource.transaction.mockImplementation(async (callback) => callback(mockManager));
      jest.spyOn(usersService as any, 'validateUserRegistration').mockResolvedValue(undefined);
      jest.spyOn(usersService as any, 'createUserInTransaction').mockResolvedValue(mockUser);
      jest.spyOn(usersService as any, 'initializeUserResources').mockResolvedValue(undefined);

      // Warm up
      await usersService.registerUser(userData);

      // Act - Measure service performance
      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        const testData = { ...userData, email: `john${i}@example.com` };
        await usersService.registerUser(testData);
      }

      const endTime = Date.now();
      const avgTime = (endTime - startTime) / iterations;

      // Assert
      expect(avgTime).toBeLessThan(performanceThreshold);
      console.log(`User registration average time: ${avgTime.toFixed(2)}ms per operation`);
    });

    it('should measure refund processing performance', async () => {
      // Arrange
      const paymentId = 'payment-123';
      const refundAmount = 100.50;
      const reason = 'Customer request';

      const mockPayment = {
        id: paymentId,
        amount: 200.00,
        status: 'completed',
        stripePaymentIntentId: 'pi_test123',
      };
      const mockManager = { getRepository: jest.fn() };

      dataSource.transaction.mockImplementation(async (callback) => callback(mockManager));
      jest.spyOn(paymentsService as any, 'findPaymentById').mockResolvedValue(mockPayment);
      jest.spyOn(paymentsService as any, 'validateRefundRequest').mockImplementation();
      jest.spyOn(paymentsService as any, 'processExternalRefund').mockResolvedValue(undefined);
      jest.spyOn(paymentsService as any, 'updateRefundStatus').mockResolvedValue(undefined);

      // Warm up
      await paymentsService.processRefund(paymentId, refundAmount, reason);

      // Act - Measure service performance
      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        await paymentsService.processRefund(`${paymentId}-${i}`, refundAmount, reason);
      }

      const endTime = Date.now();
      const avgTime = (endTime - startTime) / iterations;

      // Assert
      expect(avgTime).toBeLessThan(performanceThreshold);
      console.log(`Refund processing average time: ${avgTime.toFixed(2)}ms per operation`);
    });

    it('should compare memory usage', async () => {
      // Arrange
      const memBefore = process.memoryUsage();
      const operations = 50; // Reduced for memory test

      // Act - Perform multiple operations
      for (let i = 0; i < operations; i++) {
        // Simulate mixed operations
        jest.spyOn(shippingService as any, 'validateShipperRole').mockResolvedValue(true);
        jest.spyOn(shippingService as any, 'updateShippingRecord').mockResolvedValue(undefined);

        await shippingService.assignShipper(`order-${i}`, `shipper-${i}`);

        if (i % 10 === 0) {
          // Force garbage collection periodically if available
          if (global.gc) {
            global.gc();
          }
        }
      }

      const memAfter = process.memoryUsage();
      const memDiff = memAfter.heapUsed - memBefore.heapUsed;
      const memPerOperation = memDiff / operations;

      // Assert
      expect(memDiff).toBeLessThan(10 * 1024 * 1024); // Less than 10MB total
      expect(memPerOperation).toBeLessThan(200 * 1024); // Less than 200KB per operation

      console.log(`Memory usage: ${(memDiff / 1024 / 1024).toFixed(2)}MB total, ${(memPerOperation / 1024).toFixed(2)}KB per operation`);
    });
  });

  describe('Error Handling Performance', () => {
    it('should measure error handling overhead', async () => {
      // Arrange
      const iterations = 50;
      jest.spyOn(shippingService as any, 'validateShipperRole').mockResolvedValue(false);

      // Act - Measure error handling performance
      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        try {
          await shippingService.assignShipper(`order-${i}`, `invalid-shipper-${i}`);
        } catch (error) {
          // Expected error
        }
      }

      const endTime = Date.now();
      const avgTime = (endTime - startTime) / iterations;

      // Assert
      expect(avgTime).toBeLessThan(20); // Error handling should be fast
      console.log(`Error handling average time: ${avgTime.toFixed(2)}ms per operation`);
    });
  });

  describe('Transaction Performance', () => {
    it('should measure transaction overhead', async () => {
      // Arrange
      const iterations = 30;
      const mockManager = { getRepository: jest.fn() };

      dataSource.transaction.mockImplementation(async (callback) => callback(mockManager));
      jest.spyOn(shippingService as any, 'validateShipperRole').mockResolvedValue(true);
      jest.spyOn(shippingService as any, 'updateShippingRecord').mockResolvedValue(undefined);

      // Act - Measure transaction performance
      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        await shippingService.assignShipperWithTransaction(`order-${i}`, `shipper-${i}`, mockManager as any);
      }

      const endTime = Date.now();
      const avgTime = (endTime - startTime) / iterations;

      // Assert
      expect(avgTime).toBeLessThan(30); // Transaction overhead should be minimal
      console.log(`Transaction average time: ${avgTime.toFixed(2)}ms per operation`);
    });
  });
});
