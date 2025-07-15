export declare enum WebhookEventStatus {
    SUCCESS = "success",
    FAILED = "failed",
    PROCESSING = "processing",
    RETRYING = "retrying"
}
export declare class WebhookEvent {
    id: string;
    eventType: string;
    clerkId: string | null;
    payload: Record<string, any> | null;
    status: WebhookEventStatus;
    errorMessage: string | null;
    retryCount: number;
    processedAt: Date | null;
    webhookId: string | null;
    webhookTimestamp: Date | null;
    processingDurationMs: number | null;
    createdAt: Date;
    updatedAt: Date;
    markAsSuccess(processingDuration?: number): void;
    markAsFailed(errorMessage: string): void;
    incrementRetry(): void;
    isRetryable(): boolean;
    getProcessingTime(): number | null;
}
