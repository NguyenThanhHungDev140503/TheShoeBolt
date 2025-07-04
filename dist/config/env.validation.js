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
exports.envValidationConfig = exports.EnvironmentVariables = void 0;
exports.validateEnvironment = validateEnvironment;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class EnvironmentVariables {
    constructor() {
        this.PORT = 3000;
        this.NODE_ENV = 'development';
        this.CORS_ORIGIN = 'http://localhost:3000';
        this.RABBITMQ_URL = 'amqp://localhost:5672';
        this.AWS_REGION = 'us-east-1';
        this.THROTTLE_TTL = 60000;
        this.THROTTLE_LIMIT = 100;
        this.CACHE_TTL = 300;
        this.LOG_LEVEL = 'info';
        this.LOG_TO_FILE = true;
        this.ENABLE_HELMET = true;
        this.ENABLE_COMPRESSION = true;
        this.HEALTH_CHECK_TIMEOUT = 5000;
    }
}
exports.EnvironmentVariables = EnvironmentVariables;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPort)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "PORT", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['development', 'production', 'test', 'staging']),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "NODE_ENV", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({ require_tld: false }),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "CORS_ORIGIN", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_HOST", void 0);
__decorate([
    (0, class_validator_1.IsPort)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "DB_PORT", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 63),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_USERNAME", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_PASSWORD", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 63),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_NAME", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "REDIS_HOST", void 0);
__decorate([
    (0, class_validator_1.IsPort)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "REDIS_PORT", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "REDIS_PASSWORD", void 0);
__decorate([
    (0, class_validator_1.IsUrl)({ require_tld: false }),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "ES_NODE", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^mongodb:\/\/.*/, {
        message: 'MONGODB_URI must be a valid MongoDB connection string',
    }),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "MONGODB_URI", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(32, 512),
    (0, class_validator_1.Matches)(/^sk_/, {
        message: 'CLERK_SECRET_KEY must start with sk_',
    }),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "CLERK_SECRET_KEY", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(32, 512),
    (0, class_validator_1.Matches)(/^pk_/, {
        message: 'CLERK_PUBLISHABLE_KEY must start with pk_',
    }),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "CLERK_PUBLISHABLE_KEY", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(32, 512),
    (0, class_validator_1.Matches)(/^whsec_/, {
        message: 'CLERK_WEBHOOK_SECRET must start with whsec_',
    }),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "CLERK_WEBHOOK_SECRET", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "EMAIL_HOST", void 0);
__decorate([
    (0, class_validator_1.IsPort)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "EMAIL_PORT", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "EMAIL_AUTH_USER", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "EMAIL_AUTH_PASSWORD", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "EMAIL_FROM", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(32, 512),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_SECRET", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^sk_/, {
        message: 'STRIPE_SECRET_KEY must start with sk_',
    }),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "STRIPE_SECRET_KEY", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^pk_/, {
        message: 'STRIPE_PUBLISHABLE_KEY must start with pk_',
    }),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "STRIPE_PUBLISHABLE_KEY", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^whsec_/, {
        message: 'STRIPE_WEBHOOK_SECRET must start with whsec_',
    }),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "STRIPE_WEBHOOK_SECRET", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "RABBITMQ_URL", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "AWS_ACCESS_KEY_ID", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "AWS_SECRET_ACCESS_KEY", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "AWS_REGION", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "AWS_S3_BUCKET", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10000),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "THROTTLE_TTL", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "THROTTLE_LIMIT", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(86400),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "CACHE_TTL", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['error', 'warn', 'info', 'debug', 'verbose']),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "LOG_LEVEL", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true'),
    __metadata("design:type", Boolean)
], EnvironmentVariables.prototype, "LOG_TO_FILE", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true'),
    __metadata("design:type", Boolean)
], EnvironmentVariables.prototype, "ENABLE_HELMET", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true'),
    __metadata("design:type", Boolean)
], EnvironmentVariables.prototype, "ENABLE_COMPRESSION", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1000),
    (0, class_validator_1.Max)(60000),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "HEALTH_CHECK_TIMEOUT", void 0);
function validateEnvironment(config) {
    const validatedConfig = (0, class_transformer_1.plainToInstance)(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });
    const errors = (0, class_validator_1.validateSync)(validatedConfig, {
        skipMissingProperties: false,
        whitelist: true,
        forbidNonWhitelisted: true,
    });
    if (errors.length > 0) {
        const errorMessages = errors
            .map((error) => {
            const constraints = error.constraints ? Object.values(error.constraints) : [];
            return `${error.property}: ${constraints.join(', ')}`;
        })
            .join('\n');
        throw new Error(`Environment validation failed:\n${errorMessages}`);
    }
    return validatedConfig;
}
exports.envValidationConfig = {
    validate: validateEnvironment,
    validationOptions: {
        allowUnknown: false,
        abortEarly: false,
    },
};
//# sourceMappingURL=env.validation.js.map