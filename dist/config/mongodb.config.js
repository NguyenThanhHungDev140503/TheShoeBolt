"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongodbConfig = void 0;
const config_1 = require("@nestjs/config");
exports.mongodbConfig = (0, config_1.registerAs)('mongodb', () => ({
    uri: process.env.MONGODB_URI,
    useNewUrlParser: true,
    useUnifiedTopology: true,
}));
//# sourceMappingURL=mongodb.config.js.map