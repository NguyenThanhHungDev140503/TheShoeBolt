"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongodbConfig = void 0;
const config_1 = require("@nestjs/config");
exports.mongodbConfig = (0, config_1.registerAs)('mongodb', () => ({
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/chat_service',
}));
//# sourceMappingURL=mongodb.config.js.map