"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const cache_manager_1 = require("@nestjs/cache-manager");
const nest_winston_1 = require("nest-winston");
const winston = require("winston");
const cache_manager_redis_yet_1 = require("cache-manager-redis-yet");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const payments_module_1 = require("./modules/payments/payments.module");
const emails_module_1 = require("./modules/emails/emails.module");
const queues_module_1 = require("./modules/queues/queues.module");
const health_module_1 = require("./modules/health/health.module");
const elasticsearch_module_1 = require("./modules/elasticsearch/elasticsearch.module");
const chat_module_1 = require("./modules/chat/chat.module");
const clerk_module_1 = require("./modules/clerk/clerk.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_config_1 = require("./config/database.config");
const redis_config_1 = require("./config/redis.config");
const elasticsearch_config_1 = require("./config/elasticsearch.config");
const mongodb_config_1 = require("./config/mongodb.config");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
                load: [database_config_1.databaseConfig, redis_config_1.redisConfig, elasticsearch_config_1.elasticsearchConfig, mongodb_config_1.mongodbConfig],
            }),
            nest_winston_1.WinstonModule.forRoot({
                transports: [
                    new winston.transports.Console({
                        format: winston.format.combine(winston.format.timestamp(), winston.format.colorize(), winston.format.simple()),
                    }),
                    new winston.transports.File({
                        filename: 'logs/error.log',
                        level: 'error',
                        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
                    }),
                    new winston.transports.File({
                        filename: 'logs/combined.log',
                        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
                    }),
                ],
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                useFactory: async () => ({
                    store: cache_manager_redis_yet_1.redisStore,
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT) || 6379,
                    password: process.env.REDIS_PASSWORD,
                    ttl: 300,
                }),
            }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            payments_module_1.PaymentsModule,
            emails_module_1.EmailsModule,
            queues_module_1.QueuesModule,
            health_module_1.HealthModule,
            elasticsearch_module_1.ElasticsearchModule,
            chat_module_1.ChatModule,
            clerk_module_1.ClerkModule.forRootAsync(),
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map