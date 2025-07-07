import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_sessions')
@Index(['clerkSessionId'], { unique: true })
@Index(['userId', 'endedAt'])
@Index(['createdAt'])
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'clerk_session_id', unique: true })
  clerkSessionId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'ended_at', nullable: true })
  endedAt: Date | null;

  @Column({ name: 'last_activity', nullable: true })
  lastActivity: Date | null;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ type: 'jsonb', nullable: true, name: 'session_metadata' })
  sessionMetadata: Record<string, any> | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Helper methods
  isActive(): boolean {
    return this.endedAt === null;
  }

  getDuration(): number | null {
    if (!this.endedAt) {
      return Date.now() - this.createdAt.getTime();
    }
    return this.endedAt.getTime() - this.createdAt.getTime();
  }

  updateLastActivity(): void {
    this.lastActivity = new Date();
  }

  endSession(): void {
    this.endedAt = new Date();
  }
}
