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
var ClerkWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkWebhookController = void 0;
const common_1 = require("@nestjs/common");
const svix_1 = require("svix");
const swagger_1 = require("@nestjs/swagger");
const env_config_1 = require("../../config/env.config");
const users_service_1 = require("../users/users.service");
let ClerkWebhookController = ClerkWebhookController_1 = class ClerkWebhookController {
    constructor(envConfig, usersService) {
        this.envConfig = envConfig;
        this.usersService = usersService;
        this.logger = new common_1.Logger(ClerkWebhookController_1.name);
    }
    async handleClerkWebhook(headers, req, res) {
        const webhookSecret = this.envConfig.clerk.webhookSecret;
        if (!webhookSecret) {
            this.logger.error('Clerk webhook secret is not configured.');
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                error: 'Webhook secret not configured'
            });
        }
        try {
            const payload = req.body;
            const payloadString = payload.toString();
            const svixHeaders = {
                'svix-id': headers['svix-id'],
                'svix-timestamp': headers['svix-timestamp'],
                'svix-signature': headers['svix-signature'],
            };
            const wh = new svix_1.Webhook(webhookSecret);
            const evt = wh.verify(payloadString, svixHeaders);
            this.logger.log(`Webhook event received: ${evt.type} for ${evt.data?.id || 'unknown'}`);
            switch (evt.type) {
                case 'user.created':
                    await this.handleUserCreated(evt.data);
                    break;
                case 'user.updated':
                    await this.handleUserUpdated(evt.data);
                    break;
                case 'user.deleted':
                    await this.handleUserDeleted(evt.data);
                    break;
                case 'session.created':
                    await this.handleSessionCreated(evt.data);
                    break;
                case 'session.ended':
                    await this.handleSessionEnded(evt.data);
                    break;
                default:
                    this.logger.warn(`Unhandled webhook event type: ${evt.type}`);
            }
            return res.status(common_1.HttpStatus.OK).json({
                success: true,
                message: 'Webhook processed successfully',
                eventType: evt.type
            });
        }
        catch (err) {
            this.logger.error('Error processing Clerk webhook:', {
                error: err.message,
                stack: err.stack,
                headers: headers
            });
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: 'Webhook signature verification failed'
            });
        }
    }
    async handleUserCreated(userData) {
        try {
            this.logger.debug(`Processing user.created for user: ${userData.id}`);
            await this.usersService.syncUserFromClerk(userData);
            this.logger.log(`Successfully synced new user: ${userData.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to sync user.created for ${userData.id}:`, error);
            throw error;
        }
    }
    async handleUserUpdated(userData) {
        try {
            this.logger.debug(`Processing user.updated for user: ${userData.id}`);
            await this.usersService.updateUserFromClerk(userData);
            this.logger.log(`Successfully updated user: ${userData.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to sync user.updated for ${userData.id}:`, error);
            throw error;
        }
    }
    async handleUserDeleted(userData) {
        try {
            this.logger.debug(`Processing user.deleted for user: ${userData.id}`);
            await this.usersService.deleteUser(userData.id);
            this.logger.log(`Successfully deleted user: ${userData.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to sync user.deleted for ${userData.id}:`, error);
            throw error;
        }
    }
    async handleSessionCreated(sessionData) {
        try {
            this.logger.debug(`Processing session.created for session: ${sessionData.id}`);
            this.logger.log(`Session created: ${sessionData.id} for user: ${sessionData.user_id}`);
        }
        catch (error) {
            this.logger.error(`Failed to process session.created for ${sessionData.id}:`, error);
        }
    }
    async handleSessionEnded(sessionData) {
        try {
            this.logger.debug(`Processing session.ended for session: ${sessionData.id}`);
            this.logger.log(`Session ended: ${sessionData.id} for user: ${sessionData.user_id}`);
        }
        catch (error) {
            this.logger.error(`Failed to process session.ended for ${sessionData.id}:`, error);
        }
    }
};
exports.ClerkWebhookController = ClerkWebhookController;
__decorate([
    (0, common_1.Post)('clerk'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Clerk webhook events' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid webhook signature' }),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ClerkWebhookController.prototype, "handleClerkWebhook", null);
exports.ClerkWebhookController = ClerkWebhookController = ClerkWebhookController_1 = __decorate([
    (0, swagger_1.ApiTags)('Webhooks'),
    (0, common_1.Controller)('webhooks'),
    __metadata("design:paramtypes", [env_config_1.EnvConfigService,
        users_service_1.UsersService])
], ClerkWebhookController);
//# sourceMappingURL=clerk-webhook.controller.js.map