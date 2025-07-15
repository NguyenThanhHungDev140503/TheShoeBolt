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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WebhookTransactionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookTransactionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const webhook_event_entity_1 = require("../entities/webhook-event.entity");
const users_service_1 = require("../../users/users.service");
const session_tracking_service_1 = require("./session-tracking.service");
let WebhookTransactionService = WebhookTransactionService_1 = class WebhookTransactionService {
    constructor(dataSource, webhookEventRepository, usersService, sessionTrackingService) {
        this.dataSource = dataSource;
        this.webhookEventRepository = webhookEventRepository;
        this.usersService = usersService;
        this.sessionTrackingService = sessionTrackingService;
        this.logger = new common_1.Logger(WebhookTransactionService_1.name);
    }
    async processWebhookWithTransaction(context) {
        const startTime = Date.now();
        const webhookEvent = await this.createWebhookEvent(context);
        try {
            await this.dataSource.transaction(async (manager) => {
                this.logger.debug(`Starting transaction for webhook event: ${context.eventType}`);
                await this.processEventInTransaction(context, manager);
                webhookEvent.markAsSuccess(Date.now() - startTime);
                await manager.save(webhook_event_entity_1.WebhookEvent, webhookEvent);
                this.logger.log(`Successfully processed webhook event: ${context.eventType} for ${context.clerkId}`);
            });
        }
        catch (error) {
            this.logger.error(`Transaction failed for webhook event: ${context.eventType}`, error);
            webhookEvent.markAsFailed(error.message);
            await this.webhookEventRepository.save(webhookEvent);
            throw new common_1.InternalServerErrorException(`Failed to process webhook event: ${error.message}`);
        }
    }
    async processEventInTransaction(context, manager) {
        switch (context.eventType) {
            case 'user.created':
                await this.handleUserCreatedInTransaction(context.payload, manager);
                break;
            case 'user.updated':
                await this.handleUserUpdatedInTransaction(context.payload, manager);
                break;
            case 'user.deleted':
                await this.handleUserDeletedInTransaction(context.payload, manager);
                break;
            case 'session.created':
                await this.handleSessionCreatedInTransaction(context.payload, manager);
                break;
            case 'session.ended':
                await this.handleSessionEndedInTransaction(context.payload, manager);
                break;
            default:
                this.logger.warn(`Unhandled webhook event type: ${context.eventType}`);
        }
    }
    async handleUserCreatedInTransaction(userData, manager) {
        this.logger.debug(`Processing user.created in transaction: ${userData.id}`);
        await this.usersService.syncUserFromClerk(userData);
    }
    async handleUserUpdatedInTransaction(userData, manager) {
        this.logger.debug(`Processing user.updated in transaction: ${userData.id}`);
        await this.usersService.syncUserFromClerk(userData);
    }
    async handleUserDeletedInTransaction(userData, manager) {
        this.logger.debug(`Processing user.deleted in transaction: ${userData.id}`);
        const user = await this.usersService.findByClerkId(userData.id);
        if (user) {
            await this.usersService.remove(user.id);
        }
    }
    async handleSessionCreatedInTransaction(sessionData, manager) {
        this.logger.debug(`Processing session.created in transaction: ${sessionData.id}`);
        const user = await this.usersService.findByClerkId(sessionData.user_id);
        if (!user) {
            throw new Error(`User not found for session creation: ${sessionData.user_id}`);
        }
        await this.sessionTrackingService.createSession({
            clerkSessionId: sessionData.id,
            userId: user.id,
            createdAt: new Date(sessionData.created_at * 1000),
            lastActivity: sessionData.last_active_at ? new Date(sessionData.last_active_at.timestamp * 1000) : new Date(),
            ipAddress: sessionData.last_active_at?.ip_address,
            userAgent: sessionData.last_active_at?.user_agent,
            sessionMetadata: {
                clerkUserId: sessionData.user_id,
                status: sessionData.status,
                lastActiveAt: sessionData.last_active_at
            }
        });
    }
    async handleSessionEndedInTransaction(sessionData, manager) {
        this.logger.debug(`Processing session.ended in transaction: ${sessionData.id}`);
        await this.sessionTrackingService.endSession(sessionData.id);
    }
    async createWebhookEvent(context) {
        const webhookEvent = this.webhookEventRepository.create({
            eventType: context.eventType,
            clerkId: context.clerkId,
            payload: context.payload,
            webhookId: context.webhookId,
            webhookTimestamp: context.webhookTimestamp,
            status: webhook_event_entity_1.WebhookEventStatus.PROCESSING,
        });
        return await this.webhookEventRepository.save(webhookEvent);
    }
    async getWebhookStats() {
        try {
            const [totalEvents, successfulEvents, failedEvents] = await Promise.all([
                this.webhookEventRepository.count(),
                this.webhookEventRepository.count({ where: { status: webhook_event_entity_1.WebhookEventStatus.SUCCESS } }),
                this.webhookEventRepository.count({ where: { status: webhook_event_entity_1.WebhookEventStatus.FAILED } })
            ]);
            const successfulEventsWithDuration = await this.webhookEventRepository.find({
                where: {
                    status: webhook_event_entity_1.WebhookEventStatus.SUCCESS,
                },
                select: ['processingDurationMs']
            });
            let averageProcessingTime = 0;
            if (successfulEventsWithDuration.length > 0) {
                const totalDuration = successfulEventsWithDuration.reduce((sum, event) => {
                    return sum + (event.processingDurationMs || 0);
                }, 0);
                averageProcessingTime = totalDuration / successfulEventsWithDuration.length;
            }
            return {
                totalEvents,
                successfulEvents,
                failedEvents,
                averageProcessingTime
            };
        }
        catch (error) {
            this.logger.error(`Failed to get webhook stats: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to get webhook stats');
        }
    }
    async getFailedEvents(limit = 10) {
        try {
            return await this.webhookEventRepository.find({
                where: { status: webhook_event_entity_1.WebhookEventStatus.FAILED },
                order: { createdAt: 'ASC' },
                take: limit
            });
        }
        catch (error) {
            this.logger.error(`Failed to get failed events: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to get failed events');
        }
    }
    async retryFailedEvent(eventId) {
        try {
            const webhookEvent = await this.webhookEventRepository.findOne({
                where: { id: eventId }
            });
            if (!webhookEvent) {
                throw new Error(`Webhook event not found: ${eventId}`);
            }
            if (!webhookEvent.isRetryable()) {
                throw new Error(`Webhook event is not retryable: ${eventId}`);
            }
            webhookEvent.incrementRetry();
            await this.webhookEventRepository.save(webhookEvent);
            const context = {
                eventType: webhookEvent.eventType,
                clerkId: webhookEvent.clerkId,
                payload: webhookEvent.payload,
                webhookId: webhookEvent.webhookId,
                webhookTimestamp: webhookEvent.webhookTimestamp,
            };
            await this.processWebhookWithTransaction(context);
        }
        catch (error) {
            this.logger.error(`Failed to retry webhook event: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException(`Failed to retry webhook event: ${error.message}`);
        }
    }
};
exports.WebhookTransactionService = WebhookTransactionService;
exports.WebhookTransactionService = WebhookTransactionService = WebhookTransactionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __param(1, (0, typeorm_1.InjectRepository)(webhook_event_entity_1.WebhookEvent)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository,
        users_service_1.UsersService,
        session_tracking_service_1.SessionTrackingService])
], WebhookTransactionService);
//# sourceMappingURL=webhook-transaction.service.js.map