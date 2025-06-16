"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elasticsearchConfig = void 0;
const config_1 = require("@nestjs/config");
exports.elasticsearchConfig = (0, config_1.registerAs)('elasticsearch', () => ({
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    username: process.env.ELASTICSEARCH_USERNAME || '',
    password: process.env.ELASTICSEARCH_PASSWORD || '',
    indexPrefix: process.env.ELASTICSEARCH_INDEX_PREFIX || 'app_',
    defaultSettings: {
        number_of_shards: 1,
        number_of_replicas: 1,
        refresh_interval: '1s',
    },
}));
//# sourceMappingURL=elasticsearch.config.js.map