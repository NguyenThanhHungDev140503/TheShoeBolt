import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Payment } from '../../payments/entities/payment.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  SHIPPER = 'shipper',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true, unique: true })
  clerkId: string;

  @Column({ nullable: true })
  profileImageUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  publicMetadata: any;

  @Column({ type: 'jsonb', nullable: true })
  privateMetadata: any;

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}