"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../modules/users/entities/user.entity");
const payment_entity_1 = require("../modules/payments/entities/payment.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'nestjs_backend',
    synchronize: false,
    logging: true,
    entities: [user_entity_1.User, payment_entity_1.Payment],
    migrations: ['src/database/migrations/*.ts'],
    subscribers: ['src/database/subscribers/*.ts'],
});
//# sourceMappingURL=data-source.js.map