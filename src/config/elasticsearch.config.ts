import { registerAs } from '@nestjs/config';

export const elasticsearchConfig = registerAs('elasticsearch', () => ({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  username: process.env.ELASTICSEARCH_USERNAME || '',
  password: process.env.ELASTICSEARCH_PASSWORD || '',
  indexPrefix: process.env.ELASTICSEARCH_INDEX_PREFIX || 'app_',
  // Default index settings
  defaultSettings: {
    number_of_shards: 1,
    number_of_replicas: 1,
    refresh_interval: '1s',
  },
}));