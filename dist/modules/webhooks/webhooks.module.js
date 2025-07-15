"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const clerk_webhook_controller_1 = require("./clerk-webhook.controller");
const users_module_1 = require("../users/users.module");
const session_tracking_service_1 = require("./services/session-tracking.service");
const webhook_transaction_service_1 = require("./services/webhook-transaction.service");
const webhook_validation_pipe_1 = require("./pipes/webhook-validation.pipe");
const webhook_exception_filter_1 = require("./filters/webhook-exception.filter");
const user_session_entity_1 = require("./entities/user-session.entity");
const webhook_event_entity_1 = require("./entities/webhook-event.entity");
let WebhooksModule = class WebhooksModule {
};
exports.WebhooksModule = WebhooksModule;
exports.WebhooksModule = WebhooksModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            users_module_1.UsersModule,
            typeorm_1.TypeOrmModule.forFeature([user_session_entity_1.UserSession, webhook_event_entity_1.WebhookEvent])
        ],
        controllers: [clerk_webhook_controller_1.ClerkWebhookController],
        providers: [
            session_tracking_service_1.SessionTrackingService,
            webhook_transaction_service_1.WebhookTransactionService,
            webhook_validation_pipe_1.WebhookValidationPipe,
            webhook_exception_filter_1.WebhookExceptionFilter
        ],
        exports: [
            session_tracking_service_1.SessionTrackingService,
            webhook_transaction_service_1.WebhookTransactionService,
            webhook_validation_pipe_1.WebhookValidationPipe,
            webhook_exception_filter_1.WebhookExceptionFilter
        ],
    })
], WebhooksModule);
//# sourceMappingURL=webhooks.module.js.map