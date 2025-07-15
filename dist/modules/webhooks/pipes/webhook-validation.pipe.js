"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WebhookValidationPipe_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookValidationPipe = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const clerk_webhook_event_dto_1 = require("../dto/clerk-webhook-event.dto");
let WebhookValidationPipe = WebhookValidationPipe_1 = class WebhookValidationPipe {
    constructor() {
        this.logger = new common_1.Logger(WebhookValidationPipe_1.name);
    }
    async transform(value) {
        if (!value || typeof value !== 'object') {
            throw new common_1.BadRequestException('Invalid webhook payload: must be an object');
        }
        const webhookEvent = (0, class_transformer_1.plainToClass)(clerk_webhook_event_dto_1.WebhookEventDto, value);
        const webhookErrors = await (0, class_validator_1.validate)(webhookEvent, {
            whitelist: true,
            forbidNonWhitelisted: false
        });
        if (webhookErrors.length > 0) {
            const errorMessages = this.formatValidationErrors(webhookErrors);
            this.logger.warn(`Webhook validation failed: ${errorMessages.join(', ')}`);
            throw new common_1.BadRequestException(`Invalid webhook structure: ${errorMessages.join(', ')}`);
        }
        try {
            await this.validateEventData(value.type, value.data);
        }
        catch (error) {
            this.logger.warn(`Event data validation failed for ${value.type}: ${error.message}`);
            throw new common_1.BadRequestException(`Invalid event data for ${value.type}: ${error.message}`);
        }
        return webhookEvent;
    }
    async validateEventData(eventType, eventData) {
        if (!eventData) {
            throw new Error('Event data is required');
        }
        let dtoClass;
        let validationOptions = {
            whitelist: true,
            forbidNonWhitelisted: false,
            skipMissingProperties: false
        };
        switch (eventType) {
            case 'user.created':
            case 'user.updated':
            case 'user.deleted':
                dtoClass = clerk_webhook_event_dto_1.ClerkUserEventDto;
                break;
            case 'session.created':
            case 'session.updated':
            case 'session.ended':
            case 'session.removed':
            case 'session.revoked':
                dtoClass = clerk_webhook_event_dto_1.ClerkSessionEventDto;
                validationOptions.skipMissingProperties = true;
                break;
            case 'organization.created':
            case 'organization.updated':
            case 'organization.deleted':
                dtoClass = clerk_webhook_event_dto_1.ClerkOrganizationEventDto;
                break;
            case 'organizationMembership.created':
            case 'organizationMembership.updated':
            case 'organizationMembership.deleted':
                dtoClass = clerk_webhook_event_dto_1.ClerkOrganizationMembershipEventDto;
                break;
            default:
                this.logger.warn(`Unknown event type: ${eventType}, skipping detailed validation`);
                return;
        }
        const dto = (0, class_transformer_1.plainToClass)(dtoClass, eventData);
        const errors = await (0, class_validator_1.validate)(dto, validationOptions);
        if (errors.length > 0) {
            const errorMessages = this.formatValidationErrors(errors);
            throw new Error(errorMessages.join(', '));
        }
    }
    formatValidationErrors(errors) {
        const messages = [];
        for (const error of errors) {
            if (error.constraints) {
                messages.push(...Object.values(error.constraints));
            }
            if (error.children && error.children.length > 0) {
                const childMessages = this.formatValidationErrors(error.children);
                messages.push(...childMessages.map(msg => `${error.property}.${msg}`));
            }
        }
        return messages;
    }
    validateRequiredFields(eventType, eventData) {
        const commonRequiredFields = ['id'];
        switch (eventType) {
            case 'user.created':
            case 'user.updated':
                const userRequiredFields = [...commonRequiredFields, 'email_addresses', 'created_at', 'updated_at'];
                this.checkRequiredFields(eventData, userRequiredFields, 'user');
                break;
            case 'user.deleted':
                this.checkRequiredFields(eventData, commonRequiredFields, 'user');
                break;
            case 'session.created':
                const sessionRequiredFields = [...commonRequiredFields, 'user_id', 'created_at'];
                this.checkRequiredFields(eventData, sessionRequiredFields, 'session');
                break;
            case 'session.ended':
            case 'session.removed':
            case 'session.revoked':
                this.checkRequiredFields(eventData, [...commonRequiredFields, 'user_id'], 'session');
                break;
            case 'organization.created':
            case 'organization.updated':
                const orgRequiredFields = [...commonRequiredFields, 'name', 'slug', 'created_at'];
                this.checkRequiredFields(eventData, orgRequiredFields, 'organization');
                break;
            case 'organizationMembership.created':
            case 'organizationMembership.updated':
                const membershipRequiredFields = [...commonRequiredFields, 'organization', 'public_user_data', 'role'];
                this.checkRequiredFields(eventData, membershipRequiredFields, 'membership');
                break;
        }
    }
    checkRequiredFields(data, requiredFields, entityType) {
        for (const field of requiredFields) {
            if (data[field] === undefined || data[field] === null) {
                throw new Error(`Missing required field '${field}' for ${entityType} event`);
            }
        }
    }
    validateEmailAddresses(emailAddresses) {
        if (!Array.isArray(emailAddresses)) {
            throw new Error('email_addresses must be an array');
        }
        if (emailAddresses.length === 0) {
            throw new Error('At least one email address is required');
        }
        for (const email of emailAddresses) {
            if (!email.id || !email.email_address) {
                throw new Error('Each email address must have id and email_address fields');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.email_address)) {
                throw new Error(`Invalid email format: ${email.email_address}`);
            }
        }
    }
    validateTimestamps(data) {
        const timestampFields = ['created_at', 'updated_at', 'last_sign_in_at', 'expire_at', 'abandon_at'];
        for (const field of timestampFields) {
            if (data[field] !== undefined && data[field] !== null) {
                if (!Number.isInteger(data[field]) || data[field] < 0) {
                    throw new Error(`Invalid timestamp format for ${field}: must be a positive integer`);
                }
            }
        }
    }
    validateOrganization(organization) {
        if (!organization || typeof organization !== 'object') {
            throw new Error('organization must be an object');
        }
        const requiredFields = ['id', 'name', 'slug'];
        for (const field of requiredFields) {
            if (!organization[field]) {
                throw new Error(`organization.${field} is required`);
            }
        }
    }
    validatePublicUserData(publicUserData) {
        if (!publicUserData || typeof publicUserData !== 'object') {
            throw new Error('public_user_data must be an object');
        }
        if (!publicUserData.user_id) {
            throw new Error('public_user_data.user_id is required');
        }
    }
};
exports.WebhookValidationPipe = WebhookValidationPipe;
exports.WebhookValidationPipe = WebhookValidationPipe = WebhookValidationPipe_1 = __decorate([
    (0, common_1.Injectable)()
], WebhookValidationPipe);
//# sourceMappingURL=webhook-validation.pipe.js.map