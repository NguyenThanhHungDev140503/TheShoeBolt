import { registerAs } from '@nestjs/config';
import { ElasticsearchConfig } from './env.types';

export const elasticsearchConfig = registerAs('elasticsearch', (): ElasticsearchConfig => ({
  node: process.env.ES_NODE!,
  maxRetries: 3,
  requestTimeout: 60000,
  pingTimeout: 3000,
}));