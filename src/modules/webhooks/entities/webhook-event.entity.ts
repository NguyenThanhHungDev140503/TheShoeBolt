import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum WebhookEventStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PROCESSING = 'processing',
  RETRYING = 'retrying',
}

@Entity('webhook_events')
@Index(['eventType'])
@Index(['clerkId'])
@Index(['status'])
@Index(['processedAt'])
export class WebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_type', length: 100 })
  eventType: string;

  @Column({ name: 'clerk_id', nullable: true })
  clerkId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any> | null;

  @Column({
    type: 'enum',
    enum: WebhookEventStatus,
    default: WebhookEventStatus.PROCESSING,
  })
  status: WebhookEventStatus;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;

  @Column({ name: 'processed_at', nullable: true })
  processedAt: Date | null;

  @Column({ name: 'webhook_id', nullable: true })
  webhookId: string | null; // svix-id from headers

  @Column({ name: 'webhook_timestamp', nullable: true })
  webhookTimestamp: Date | null; // svix-timestamp from headers

  @Column({ name: 'processing_duration_ms', nullable: true })
  processingDurationMs: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Helper methods
  markAsSuccess(processingDuration?: number): void {
    this.status = WebhookEventStatus.SUCCESS;
    this.processedAt = new Date();
    this.errorMessage = null;
    if (processingDuration) {
      this.processingDurationMs = processingDuration;
    }
  }

  markAsFailed(errorMessage: string): void {
    this.status = WebhookEventStatus.FAILED;
    this.processedAt = new Date();
    this.errorMessage = errorMessage;
  }

  incrementRetry(): void {
    this.retryCount += 1;
    this.status = WebhookEventStatus.RETRYING;
  }

  isRetryable(): boolean {
    return this.retryCount < 3 && this.status === WebhookEventStatus.FAILED;
  }

  getProcessingTime(): number | null {
    if (this.processedAt && this.createdAt) {
      return this.processedAt.getTime() - this.createdAt.getTime();
    }
    return null;
  }
}
