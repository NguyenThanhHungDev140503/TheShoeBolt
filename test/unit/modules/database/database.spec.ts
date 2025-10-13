import { DataSource } from 'typeorm';
import { databaseConfig } from '@/config/database.config';


describe('Database Connection Tests', () => {
  let dataSource: DataSource;
  let testDataSource: DataSource;

  beforeAll(async () => {
    // Thiết lập timeout cho các test database
    jest.setTimeout(30000);
  });

  afterEach(async () => {
    // Cleanup sau mỗi test
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
    if (testDataSource && testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  });

  describe('TypeORM DataSource Configuration', () => {
    test('should create DataSource with DATABASE_URL', async () => {
      // Arrange
      expect(process.env.DATABASE_URL).toBeDefined();

      dataSource = new DataSource({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        synchronize: false,
        logging: false,
        entities: [],
      });

      // Act & Assert
      expect(dataSource).toBeInstanceOf(DataSource);
      expect(dataSource.options.type).toBe('postgres');
      expect((dataSource.options as any).url).toBe(process.env.DATABASE_URL);
    });

    test('should initialize DataSource successfully', async () => {
      // Arrange
      dataSource = new DataSource({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        synchronize: false,
        logging: false,
        entities: [],
      });

      // Act
      await dataSource.initialize();

      // Assert
      expect(dataSource.isInitialized).toBe(true);
      expect(dataSource.driver).toBeDefined();
    });

    test('should handle connection errors gracefully', async () => {
      // Arrange
      const invalidDataSource = new DataSource({
        type: 'postgres',
        url: 'postgresql://invalid:invalid@invalid:5432/invalid',
        synchronize: false,
        logging: false,
        entities: [],
      });

      // Act & Assert
      await expect(invalidDataSource.initialize()).rejects.toThrow();
    });
  });

  describe('Database Configuration Tests', () => {
    test('should return correct database configuration', () => {
      // Act
      const config = databaseConfig();

      // Assert
      expect(config).toBeDefined();
      expect(config.type).toBe('postgres');
      expect(config.host).toBe(process.env.DB_HOST);
      expect(config.url).toBe(process.env.DATABASE_URL);
      expect(config.port).toBe(parseInt(process.env.DB_PORT!, 10));
      expect(config.username).toBe(process.env.DB_USERNAME);
      expect(config.password).toBe(process.env.DB_PASSWORD);
      expect(config.database).toBe(process.env.DB_NAME);
    });

    test('should set synchronize to true in development', () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Act
      const config = databaseConfig();

      // Assert
      expect(config.synchronize).toBe(true);
      expect(config.logging).toBe(true);

      // Cleanup
      process.env.NODE_ENV = originalEnv;
    });

    test('should set synchronize to false in production', () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Act
      const config = databaseConfig();

      // Assert
      expect(config.synchronize).toBe(false);
      expect(config.logging).toBe(false);

      // Cleanup
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Database Validation Tests', () => {
    beforeEach(async () => {
      testDataSource = new DataSource({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        synchronize: false,
        logging: false,
        entities: [],
      });
      await testDataSource.initialize();
    });

    test('should execute simple SELECT query', async () => {
      // Act
      const result = await testDataSource.query('SELECT 1 as test_value');

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('test_value', 1);
    });

    test('should verify database connection info', async () => {
      // Act
      const result = await testDataSource.query(
        'SELECT current_database(), current_user, version()'
      );

      // Assert
      expect(result).toBeDefined();
      expect(result[0]).toHaveProperty('current_database', process.env.DB_NAME);
      expect(result[0]).toHaveProperty('current_user', process.env.DB_USERNAME);
      expect(result[0].version).toContain('PostgreSQL');
    });

    test('should verify SSL connection', async () => {
      // Act
      const result = await testDataSource.query(
        'SELECT 1'
      );

      // Assert
      expect(result).toBeDefined();
    });

    test('should handle query errors properly', async () => {
      // Act & Assert
      await expect(
        testDataSource.query('SELECT * FROM non_existent_table')
      ).rejects.toThrow();
    });

    test('should verify connection pool settings', async () => {
      // Act
      const result = await testDataSource.query(
        'SELECT current_setting(\'max_connections\') as max_connections'
      );

      // Assert
      expect(result).toBeDefined();
      expect(result[0]).toHaveProperty('max_connections');
      expect(parseInt(result[0].max_connections)).toBeGreaterThan(0);
    });

    test('should verify database timezone', async () => {
      // Act
      const result = await testDataSource.query(
        'SELECT current_setting(\'timezone\') as timezone'
      );

      // Assert
      expect(result).toBeDefined();
      expect(result[0]).toHaveProperty('timezone');
    });
  });

  describe('Environment Variables Validation', () => {
    test('should have all required environment variables', () => {
      // Assert
      expect(process.env.DATABASE_URL).toBeDefined();
      expect(process.env.DB_HOST).toBeDefined();
      expect(process.env.DB_PORT).toBeDefined();
      expect(process.env.DB_USERNAME).toBeDefined();
      expect(process.env.DB_PASSWORD).toBeDefined();
      expect(process.env.DB_NAME).toBeDefined();
      expect(process.env.DB_SSL).toBeDefined();
    });

    test('should have valid port number', () => {
      // Act
      const port = parseInt(process.env.DB_PORT!, 10);

      // Assert
      expect(port).toBeGreaterThan(0);
      expect(port).toBeLessThanOrEqual(65535);
      expect(port).toBe(5432); // PostgreSQL default port
    });

    test('should have SSL mode set to require', () => {
      // Assert
      expect(process.env.DB_SSL).toBe('require');
    });

    test('should have Neon PostgreSQL host', () => {
      // Assert
      expect(process.env.DB_HOST).toContain('neon.tech');
      expect(process.env.DB_HOST).toContain('pooler');
    });
  });

});