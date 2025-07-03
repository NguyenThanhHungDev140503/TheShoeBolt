import { registerAs } from '@nestjs/config';
import { MongodbConfig } from './env.types';

export const mongodbConfig = registerAs('mongodb', (): MongodbConfig => ({
  uri: process.env.MONGODB_URI!,
  useNewUrlParser: true,
  useUnifiedTopology: true,
}));