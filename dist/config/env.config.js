"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const env_types_1 = require("./env.types");
let EnvConfigService = class EnvConfigService {
    constructor(configService) {
        this.configService = configService;
    }
    get port() {
        return this.configService.get(env_types_1.ENV_KEYS.PORT) ?? env_types_1.ENV_DEFAULTS.PORT;
    }
    get nodeEnv() {
        return (this.configService.get(env_types_1.ENV_KEYS.NODE_ENV) ?? env_types_1.ENV_DEFAULTS.NODE_ENV);
    }
    get isDevelopment() {
        return this.nodeEnv === 'development';
    }
    get isProduction() {
        return this.nodeEnv === 'production';
    }
    get isTest() {
        return this.nodeEnv === 'test';
    }
    get database() {
        return {
            type: 'postgres',
            host: this.configService.get(env_types_1.ENV_KEYS.DB_HOST),
            port: this.configService.get(env_types_1.ENV_KEYS.DB_PORT),
            username: this.configService.get(env_types_1.ENV_KEYS.DB_USERNAME),
            password: this.configService.get(env_types_1.ENV_KEYS.DB_PASSWORD),
            database: this.configService.get(env_types_1.ENV_KEYS.DB_NAME),
            synchronize: this.isDevelopment,
            logging: this.isDevelopment,
            entities: ['dist/**/*.entity.js'],
            migrations: ['dist/database/migrations/*.js'],
            cli: {
                migrationsDir: 'src/database/migrations',
            },
        };
    }
    get redis() {
        return {
            host: this.configService.get(env_types_1.ENV_KEYS.REDIS_HOST),
            port: this.configService.get(env_types_1.ENV_KEYS.REDIS_PORT),
            password: this.configService.get(env_types_1.ENV_KEYS.REDIS_PASSWORD) || undefined,
            ttl: this.configService.get(env_types_1.ENV_KEYS.CACHE_TTL) ?? env_types_1.ENV_DEFAULTS.CACHE_TTL,
        };
    }
    get elasticsearch() {
        return {
            node: this.configService.get(env_types_1.ENV_KEYS.ES_NODE),
            maxRetries: 3,
            requestTimeout: 60000,
            pingTimeout: 3000,
        };
    }
    get mongodb() {
        return {
            uri: this.configService.get(env_types_1.ENV_KEYS.MONGODB_URI),
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };
    }
    get clerk() {
        return {
            secretKey: this.configService.get(env_types_1.ENV_KEYS.CLERK_SECRET_KEY),
            publishableKey: this.configService.get(env_types_1.ENV_KEYS.CLERK_PUBLISHABLE_KEY),
            webhookSecret: this.configService.get(env_types_1.ENV_KEYS.CLERK_WEBHOOK_SECRET),
        };
    }
    get email() {
        const port = this.configService.get(env_types_1.ENV_KEYS.EMAIL_PORT);
        return {
            host: this.configService.get(env_types_1.ENV_KEYS.EMAIL_HOST),
            port,
            auth: {
                user: this.configService.get(env_types_1.ENV_KEYS.EMAIL_AUTH_USER),
                password: this.configService.get(env_types_1.ENV_KEYS.EMAIL_AUTH_PASSWORD),
            },
            from: this.configService.get(env_types_1.ENV_KEYS.EMAIL_FROM),
            secure: port === 465,
        };
    }
    get stripe() {
        return {
            secretKey: this.configService.get(env_types_1.ENV_KEYS.STRIPE_SECRET_KEY),
            publishableKey: this.configService.get(env_types_1.ENV_KEYS.STRIPE_PUBLISHABLE_KEY),
            webhookSecret: this.configService.get(env_types_1.ENV_KEYS.STRIPE_WEBHOOK_SECRET),
        };
    }
    get aws() {
        return {
            accessKeyId: this.configService.get(env_types_1.ENV_KEYS.AWS_ACCESS_KEY_ID),
            secretAccessKey: this.configService.get(env_types_1.ENV_KEYS.AWS_SECRET_ACCESS_KEY),
            region: this.configService.get(env_types_1.ENV_KEYS.AWS_REGION) ?? env_types_1.ENV_DEFAULTS.AWS_REGION,
            s3Bucket: this.configService.get(env_types_1.ENV_KEYS.AWS_S3_BUCKET),
        };
    }
    get throttle() {
        return {
            ttl: this.configService.get(env_types_1.ENV_KEYS.THROTTLE_TTL) ?? env_types_1.ENV_DEFAULTS.THROTTLE_TTL,
            limit: this.configService.get(env_types_1.ENV_KEYS.THROTTLE_LIMIT) ?? env_types_1.ENV_DEFAULTS.THROTTLE_LIMIT,
        };
    }
    get cache() {
        return {
            ttl: this.configService.get(env_types_1.ENV_KEYS.CACHE_TTL) ?? env_types_1.ENV_DEFAULTS.CACHE_TTL,
            store: 'redis',
            host: this.redis.host,
            port: this.redis.port,
            password: this.redis.password,
        };
    }
    get logging() {
        return {
            level: (this.configService.get(env_types_1.ENV_KEYS.LOG_LEVEL) ?? env_types_1.ENV_DEFAULTS.LOG_LEVEL),
            toFile: this.configService.get(env_types_1.ENV_KEYS.LOG_TO_FILE) ?? env_types_1.ENV_DEFAULTS.LOG_TO_FILE,
            errorLogPath: 'logs/error.log',
            combinedLogPath: 'logs/combined.log',
        };
    }
    get security() {
        return {
            enableHelmet: this.configService.get(env_types_1.ENV_KEYS.ENABLE_HELMET) ?? env_types_1.ENV_DEFAULTS.ENABLE_HELMET,
            enableCompression: this.configService.get(env_types_1.ENV_KEYS.ENABLE_COMPRESSION) ?? env_types_1.ENV_DEFAULTS.ENABLE_COMPRESSION,
            corsOrigin: this.configService.get(env_types_1.ENV_KEYS.CORS_ORIGIN) ?? env_types_1.ENV_DEFAULTS.CORS_ORIGIN,
        };
    }
    get healthCheck() {
        return {
            timeout: this.configService.get(env_types_1.ENV_KEYS.HEALTH_CHECK_TIMEOUT) ?? env_types_1.ENV_DEFAULTS.HEALTH_CHECK_TIMEOUT,
        };
    }
    get rabbitmqUrl() {
        return this.configService.get(env_types_1.ENV_KEYS.RABBITMQ_URL) ?? env_types_1.ENV_DEFAULTS.RABBITMQ_URL;
    }
    get jwtSecret() {
        return this.configService.get(env_types_1.ENV_KEYS.JWT_SECRET);
    }
    get appConfig() {
        return {
            port: this.port,
            nodeEnv: this.nodeEnv,
            database: this.database,
            redis: this.redis,
            elasticsearch: this.elasticsearch,
            mongodb: this.mongodb,
            clerk: this.clerk,
            email: this.email,
            stripe: this.stripe,
            aws: this.aws,
            throttle: this.throttle,
            cache: this.cache,
            logging: this.logging,
            security: this.security,
            healthCheck: this.healthCheck,
            ...(this.rabbitmqUrl && { rabbitmq: { url: this.rabbitmqUrl } }),
            ...(this.jwtSecret && { jwt: { secret: this.jwtSecret } }),
        };
    }
    validateRequiredEnvVars() {
        const requiredVars = [
            env_types_1.ENV_KEYS.DB_HOST,
            env_types_1.ENV_KEYS.DB_PORT,
            env_types_1.ENV_KEYS.DB_USERNAME,
            env_types_1.ENV_KEYS.DB_PASSWORD,
            env_types_1.ENV_KEYS.DB_NAME,
            env_types_1.ENV_KEYS.REDIS_HOST,
            env_types_1.ENV_KEYS.REDIS_PORT,
            env_types_1.ENV_KEYS.ES_NODE,
            env_types_1.ENV_KEYS.MONGODB_URI,
            env_types_1.ENV_KEYS.CLERK_SECRET_KEY,
            env_types_1.ENV_KEYS.CLERK_PUBLISHABLE_KEY,
            env_types_1.ENV_KEYS.CLERK_WEBHOOK_SECRET,
            env_types_1.ENV_KEYS.EMAIL_HOST,
            env_types_1.ENV_KEYS.EMAIL_PORT,
            env_types_1.ENV_KEYS.EMAIL_AUTH_USER,
            env_types_1.ENV_KEYS.EMAIL_AUTH_PASSWORD,
            env_types_1.ENV_KEYS.EMAIL_FROM,
        ];
        const missingVars = requiredVars.filter((varName) => !this.configService.get(varName));
        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
        }
    }
};
exports.EnvConfigService = EnvConfigService;
exports.EnvConfigService = EnvConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EnvConfigService);
//# sourceMappingURL=env.config.js.map