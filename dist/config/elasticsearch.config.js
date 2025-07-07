"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elasticsearchConfig = void 0;
const config_1 = require("@nestjs/config");
exports.elasticsearchConfig = (0, config_1.registerAs)('elasticsearch', () => ({
    node: process.env.ES_NODE,
    maxRetries: 3,
    requestTimeout: 60000,
    pingTimeout: 3000,
}));
//# sourceMappingURL=elasticsearch.config.js.map