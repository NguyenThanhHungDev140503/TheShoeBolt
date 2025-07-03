import { validateEnvironment, EnvironmentVariables } from './env.validation';

describe('Environment Validation', () => {
  const validEnvConfig = {
    // Application
    PORT: '3000',
    NODE_ENV: 'development',
    CORS_ORIGIN: 'http://localhost:3000',

    // Database
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_USERNAME: 'postgres',
    DB_PASSWORD: 'password',
    DB_NAME: 'testdb',

    // Redis
    REDIS_HOST: 'localhost',
    REDIS_PORT: '6379',
    REDIS_PASSWORD: '',

    // Elasticsearch
    ES_NODE: 'http://localhost:9200',

    // MongoDB
    MONGODB_URI: 'mongodb://localhost:27017/testdb',

    // Clerk
    CLERK_SECRET_KEY: 'sk_test_1234567890abcdef1234567890abcdef',
    CLERK_PUBLISHABLE_KEY: 'pk_test_1234567890abcdef1234567890abcdef',
    CLERK_WEBHOOK_SECRET: 'whsec_1234567890abcdef1234567890abcdef',

    // Email
    EMAIL_HOST: 'smtp.example.com',
    EMAIL_PORT: '587',
    EMAIL_AUTH_USER: 'test@example.com',
    EMAIL_AUTH_PASSWORD: 'password',
    EMAIL_FROM: 'noreply@example.com',
  };

  describe('Valid Configuration', () => {
    it('should validate a complete valid configuration', () => {
      expect(() => validateEnvironment(validEnvConfig)).not.toThrow();
    });

    it('should return validated configuration object', () => {
      const result = validateEnvironment(validEnvConfig);
      expect(result).toBeInstanceOf(EnvironmentVariables);
      expect(result.PORT).toBe(3000);
      expect(result.NODE_ENV).toBe('development');
      expect(result.DB_HOST).toBe('localhost');
      expect(result.DB_PORT).toBe(5432);
    });

    it('should handle optional variables with defaults', () => {
      const result = validateEnvironment(validEnvConfig);
      expect(result.THROTTLE_TTL).toBe(60000);
      expect(result.THROTTLE_LIMIT).toBe(100);
      expect(result.CACHE_TTL).toBe(300);
      expect(result.LOG_LEVEL).toBe('info');
    });

    it('should validate with optional Stripe configuration', () => {
      const configWithStripe = {
        ...validEnvConfig,
        STRIPE_SECRET_KEY: 'sk_test_1234567890abcdef1234567890abcdef',
        STRIPE_PUBLISHABLE_KEY: 'pk_test_1234567890abcdef1234567890abcdef',
        STRIPE_WEBHOOK_SECRET: 'whsec_1234567890abcdef1234567890abcdef',
      };

      expect(() => validateEnvironment(configWithStripe)).not.toThrow();
    });
  });

  describe('Invalid Configuration', () => {
    it('should throw error for missing required variables', () => {
      const incompleteConfig = {
        PORT: '3000',
        NODE_ENV: 'development',
      };

      expect(() => validateEnvironment(incompleteConfig)).toThrow(
        'Environment validation failed'
      );
    });

    it('should throw error for invalid NODE_ENV', () => {
      const invalidConfig = {
        ...validEnvConfig,
        NODE_ENV: 'invalid_env',
      };

      expect(() => validateEnvironment(invalidConfig)).toThrow();
    });

    it('should throw error for invalid port numbers', () => {
      const invalidConfig = {
        ...validEnvConfig,
        DB_PORT: '99999',
      };

      expect(() => validateEnvironment(invalidConfig)).toThrow();
    });

    it('should throw error for invalid email format', () => {
      const invalidConfig = {
        ...validEnvConfig,
        EMAIL_AUTH_USER: 'invalid-email',
      };

      expect(() => validateEnvironment(invalidConfig)).toThrow();
    });

    it('should throw error for invalid URL format', () => {
      const invalidConfig = {
        ...validEnvConfig,
        ES_NODE: 'invalid-url',
      };

      expect(() => validateEnvironment(invalidConfig)).toThrow();
    });

    it('should throw error for invalid MongoDB URI', () => {
      const invalidConfig = {
        ...validEnvConfig,
        MONGODB_URI: 'invalid-mongodb-uri',
      };

      expect(() => validateEnvironment(invalidConfig)).toThrow();
    });

    it('should throw error for invalid Clerk secret key format', () => {
      const invalidConfig = {
        ...validEnvConfig,
        CLERK_SECRET_KEY: 'invalid_key_format',
      };

      expect(() => validateEnvironment(invalidConfig)).toThrow();
    });

    it('should throw error for invalid Stripe key format', () => {
      const invalidConfig = {
        ...validEnvConfig,
        STRIPE_SECRET_KEY: 'invalid_stripe_key',
      };

      expect(() => validateEnvironment(invalidConfig)).toThrow();
    });
  });

  describe('Type Transformations', () => {
    it('should transform string numbers to numbers', () => {
      const result = validateEnvironment(validEnvConfig);
      expect(typeof result.PORT).toBe('number');
      expect(typeof result.DB_PORT).toBe('number');
      expect(typeof result.REDIS_PORT).toBe('number');
    });

    it('should transform string booleans to booleans', () => {
      const configWithBooleans = {
        ...validEnvConfig,
        LOG_TO_FILE: 'true',
        ENABLE_HELMET: 'false',
      };

      const result = validateEnvironment(configWithBooleans);
      expect(typeof result.LOG_TO_FILE).toBe('boolean');
      expect(typeof result.ENABLE_HELMET).toBe('boolean');
      expect(result.LOG_TO_FILE).toBe(true);
      expect(result.ENABLE_HELMET).toBe(false);
    });
  });

  describe('Range Validations', () => {
    it('should validate throttle limits within range', () => {
      const configWithLimits = {
        ...validEnvConfig,
        THROTTLE_TTL: '30000',
        THROTTLE_LIMIT: '50',
      };

      expect(() => validateEnvironment(configWithLimits)).not.toThrow();
    });

    it('should throw error for throttle limits outside range', () => {
      const configWithInvalidLimits = {
        ...validEnvConfig,
        THROTTLE_LIMIT: '2000', // Max is 1000
      };

      expect(() => validateEnvironment(configWithInvalidLimits)).toThrow();
    });

    it('should validate cache TTL within range', () => {
      const configWithCacheTTL = {
        ...validEnvConfig,
        CACHE_TTL: '600',
      };

      expect(() => validateEnvironment(configWithCacheTTL)).not.toThrow();
    });
  });

  describe('String Length Validations', () => {
    it('should validate string lengths for database credentials', () => {
      const configWithLongStrings = {
        ...validEnvConfig,
        DB_USERNAME: 'a'.repeat(63), // Max length
        DB_PASSWORD: 'a'.repeat(255), // Max length
      };

      expect(() => validateEnvironment(configWithLongStrings)).not.toThrow();
    });

    it('should throw error for strings exceeding max length', () => {
      const configWithTooLongString = {
        ...validEnvConfig,
        DB_USERNAME: 'a'.repeat(64), // Exceeds max length of 63
      };

      expect(() => validateEnvironment(configWithTooLongString)).toThrow();
    });

    it('should validate Clerk key lengths', () => {
      const configWithValidKeys = {
        ...validEnvConfig,
        CLERK_SECRET_KEY: 'sk_test_' + 'a'.repeat(32),
        CLERK_PUBLISHABLE_KEY: 'pk_test_' + 'a'.repeat(32),
        CLERK_WEBHOOK_SECRET: 'whsec_' + 'a'.repeat(32),
      };

      expect(() => validateEnvironment(configWithValidKeys)).not.toThrow();
    });
  });

  describe('Optional Variables', () => {
    it('should work without optional AWS configuration', () => {
      expect(() => validateEnvironment(validEnvConfig)).not.toThrow();
    });

    it('should work with partial AWS configuration', () => {
      const configWithPartialAWS = {
        ...validEnvConfig,
        AWS_REGION: 'eu-west-1',
      };

      expect(() => validateEnvironment(configWithPartialAWS)).not.toThrow();
    });

    it('should work without JWT secret (legacy)', () => {
      expect(() => validateEnvironment(validEnvConfig)).not.toThrow();
    });

    it('should work with RabbitMQ URL', () => {
      const configWithRabbitMQ = {
        ...validEnvConfig,
        RABBITMQ_URL: 'amqp://user:pass@localhost:5672',
      };

      expect(() => validateEnvironment(configWithRabbitMQ)).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty optional password fields', () => {
      const configWithEmptyPassword = {
        ...validEnvConfig,
        REDIS_PASSWORD: '',
      };

      const result = validateEnvironment(configWithEmptyPassword);
      expect(result.REDIS_PASSWORD).toBeUndefined();
    });

    it('should handle minimum valid port numbers', () => {
      const configWithMinPorts = {
        ...validEnvConfig,
        DB_PORT: '1',
        REDIS_PORT: '1',
        EMAIL_PORT: '1',
      };

      expect(() => validateEnvironment(configWithMinPorts)).not.toThrow();
    });

    it('should handle maximum valid port numbers', () => {
      const configWithMaxPorts = {
        ...validEnvConfig,
        DB_PORT: '65535',
        REDIS_PORT: '65535',
        EMAIL_PORT: '65535',
      };

      expect(() => validateEnvironment(configWithMaxPorts)).not.toThrow();
    });
  });
});
