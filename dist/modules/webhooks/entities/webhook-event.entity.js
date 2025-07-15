"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookEvent = exports.WebhookEventStatus = void 0;
const typeorm_1 = require("typeorm");
var WebhookEventStatus;
(function (WebhookEventStatus) {
    WebhookEventStatus["SUCCESS"] = "success";
    WebhookEventStatus["FAILED"] = "failed";
    WebhookEventStatus["PROCESSING"] = "processing";
    WebhookEventStatus["RETRYING"] = "retrying";
})(WebhookEventStatus || (exports.WebhookEventStatus = WebhookEventStatus = {}));
let WebhookEvent = class WebhookEvent {
    markAsSuccess(processingDuration) {
        this.status = WebhookEventStatus.SUCCESS;
        this.processedAt = new Date();
        this.errorMessage = null;
        if (processingDuration) {
            this.processingDurationMs = processingDuration;
        }
    }
    markAsFailed(errorMessage) {
        this.status = WebhookEventStatus.FAILED;
        this.processedAt = new Date();
        this.errorMessage = errorMessage;
    }
    incrementRetry() {
        this.retryCount += 1;
        this.status = WebhookEventStatus.RETRYING;
    }
    isRetryable() {
        return this.retryCount < 3 && this.status === WebhookEventStatus.FAILED;
    }
    getProcessingTime() {
        if (this.processedAt && this.createdAt) {
            return this.processedAt.getTime() - this.createdAt.getTime();
        }
        return null;
    }
};
exports.WebhookEvent = WebhookEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WebhookEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'event_type', length: 100 }),
    __metadata("design:type", String)
], WebhookEvent.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'clerk_id', nullable: true }),
    __metadata("design:type", String)
], WebhookEvent.prototype, "clerkId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], WebhookEvent.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: WebhookEventStatus,
        default: WebhookEventStatus.PROCESSING,
    }),
    __metadata("design:type", String)
], WebhookEvent.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true }),
    __metadata("design:type", String)
], WebhookEvent.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'retry_count', default: 0 }),
    __metadata("design:type", Number)
], WebhookEvent.prototype, "retryCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processed_at', nullable: true }),
    __metadata("design:type", Date)
], WebhookEvent.prototype, "processedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'webhook_id', nullable: true }),
    __metadata("design:type", String)
], WebhookEvent.prototype, "webhookId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'webhook_timestamp', nullable: true }),
    __metadata("design:type", Date)
], WebhookEvent.prototype, "webhookTimestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processing_duration_ms', nullable: true }),
    __metadata("design:type", Number)
], WebhookEvent.prototype, "processingDurationMs", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], WebhookEvent.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], WebhookEvent.prototype, "updatedAt", void 0);
exports.WebhookEvent = WebhookEvent = __decorate([
    (0, typeorm_1.Entity)('webhook_events'),
    (0, typeorm_1.Index)(['eventType']),
    (0, typeorm_1.Index)(['clerkId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['processedAt'])
], WebhookEvent);
//# sourceMappingURL=webhook-event.entity.js.map