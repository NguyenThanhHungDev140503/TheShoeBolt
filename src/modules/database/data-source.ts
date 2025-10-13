import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Payment } from '../payments/entities/payment.entity';
import { databaseConfig } from '@/config/database.config';

const config = databaseConfig();

export const AppDataSource = new DataSource({
  ...(config as DataSourceOptions),
  entities: [User, Payment],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: ['src/database/subscribers/*.ts'],
});