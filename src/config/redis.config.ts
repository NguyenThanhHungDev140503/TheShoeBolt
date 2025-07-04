import { registerAs } from '@nestjs/config';
import { RedisConfig } from './env.types';

export const redisConfig = registerAs('redis', (): RedisConfig => ({
  host: process.env.REDIS_HOST!,
  port: parseInt(process.env.REDIS_PORT!, 10),
  password: process.env.REDIS_PASSWORD || undefined,
  ttl: parseInt(process.env.CACHE_TTL!, 10) || 300,
}));