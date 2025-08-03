import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UsersService } from '../../../../src/modules/users/users.service';
import { User } from '../../../../src/modules/users/entities/user.entity';
import { ElasticsearchService } from '../../../../src/modules/elasticsearch/elasticsearch.service';

describe('UsersService - Registration Methods', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    const mockUserRepository = {
      findOne: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockDataSource = {
      transaction: jest.fn(),
      query: jest.fn(),
    };

    const mockElasticsearchService = {
      indexUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: ElasticsearchService,
          useValue: mockElasticsearchService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerUser', () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '0123456789',
      password: 'hashedPassword123',
    };

    it('should register user with cart and wishlist successfully', async () => {
      // Arrange
      const mockUser = { id: 'user-123', firstName: 'John', lastName: 'Doe' };
      const mockManager = {
        getRepository: jest.fn(() => userRepository),
      };

      dataSource.transaction.mockImplementation(async (callback) => callback(mockManager));
      jest.spyOn(service as any, 'validateUserRegistration').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'createUserInTransaction').mockResolvedValue(mockUser);
      jest.spyOn(service as any, 'initializeUserResources').mockResolvedValue(undefined);

      // Act
      const result = await service.registerUser(userData);

      // Assert
      expect(result).toBe(mockUser);
      expect(service['validateUserRegistration']).toHaveBeenCalledWith(userData, mockManager);
      expect(service['createUserInTransaction']).toHaveBeenCalledWith(userData, mockManager);
      expect(service['initializeUserResources']).toHaveBeenCalledWith(mockUser.id, mockManager);
    });

    it('should rollback transaction on error', async () => {
      // Arrange
      const error = new Error('Database error');
      dataSource.transaction.mockRejectedValue(error);

      // Act & Assert
      await expect(service.registerUser(userData))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('validateUserRegistration', () => {
    const userData = { email: 'john@example.com', phone: '0123456789' };

    it('should pass validation for unique email and phone', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service['validateUserRegistration'](userData))
        .resolves
        .not.toThrow();

      expect(userRepository.findOne).toHaveBeenCalledTimes(2);
    });

    it('should throw ConflictException for existing email', async () => {
      // Arrange
      const existingUser = { id: 'existing-user', email: userData.email };
      userRepository.findOne.mockResolvedValueOnce(existingUser as any);

      // Act & Assert
      await expect(service['validateUserRegistration'](userData))
        .rejects
        .toThrow(ConflictException);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: userData.email }
      });
    });
  });

  describe('existsByEmail', () => {
    it('should return true when email exists', async () => {
      // Arrange
      userRepository.count.mockResolvedValue(1);

      // Act
      const result = await service.existsByEmail('test@example.com');

      // Assert
      expect(result).toBe(true);
      expect(userRepository.count).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
    });

    it('should return false when email does not exist', async () => {
      // Arrange
      userRepository.count.mockResolvedValue(0);

      // Act
      const result = await service.existsByEmail('test@example.com');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('existsByPhone', () => {
    it('should return false (placeholder implementation)', async () => {
      // Act
      const result = await service.existsByPhone('0123456789');

      // Assert
      expect(result).toBe(false);
    });
  });
});
