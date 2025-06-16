"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
const config_1 = require("@nestjs/config");
exports.databaseConfig = (0, config_1.registerAs)('database', () => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'nestjs_backend',
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/database/migrations/*.js'],
    cli: {
        migrationsDir: 'src/database/migrations',
    },
}));
//# sourceMappingURL=database.config.js.map