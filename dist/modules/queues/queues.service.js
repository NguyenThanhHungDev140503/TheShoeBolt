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
var QueuesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueuesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const amqp = require("amqplib");
const emails_service_1 = require("../emails/emails.service");
let QueuesService = QueuesService_1 = class QueuesService {
    constructor(configService, emailsService) {
        this.configService = configService;
        this.emailsService = emailsService;
        this.logger = new common_1.Logger(QueuesService_1.name);
        this.EMAIL_QUEUE = 'email_queue';
    }
    async onModuleInit() {
        await this.connect();
        await this.setupQueues();
        await this.startConsumers();
    }
    async onModuleDestroy() {
        if (this.channel) {
            await this.channel.close();
        }
        if (this.connection) {
            await this.connection.close();
        }
    }
    async connect() {
        try {
            const rabbitmqUrl = this.configService.get('RABBITMQ_URL') || 'amqp://localhost';
            this.connection = await amqp.connect(rabbitmqUrl);
            this.channel = await this.connection.createChannel();
            this.logger.log('Connected to RabbitMQ');
        }
        catch (error) {
            this.logger.error('Failed to connect to RabbitMQ', error);
            throw error;
        }
    }
    async setupQueues() {
        await this.channel.assertQueue(this.EMAIL_QUEUE, { durable: true });
        this.logger.log('Queues setup completed');
    }
    async startConsumers() {
        await this.channel.consume(this.EMAIL_QUEUE, async (msg) => {
            if (msg) {
                try {
                    const job = JSON.parse(msg.content.toString());
                    await this.processEmailJob(job);
                    this.channel.ack(msg);
                    this.logger.log(`Email job processed: ${job.type}`);
                }
                catch (error) {
                    this.logger.error('Error processing email job', error);
                    this.channel.nack(msg, false, false);
                }
            }
        });
    }
    async addEmailJob(job) {
        const message = Buffer.from(JSON.stringify(job));
        await this.channel.sendToQueue(this.EMAIL_QUEUE, message, { persistent: true });
        this.logger.log(`Email job added to queue: ${job.type}`);
    }
    async processEmailJob(job) {
        switch (job.type) {
            case 'welcome':
                await this.emailsService.sendWelcomeEmail(job.data.email, job.data.firstName);
                break;
            case 'password-reset':
                await this.emailsService.sendPasswordResetEmail(job.data.email, job.data.resetToken);
                break;
            case 'payment-confirmation':
                await this.emailsService.sendPaymentConfirmationEmail(job.data.email, job.data.amount, job.data.currency);
                break;
            default:
                this.logger.warn(`Unknown email job type: ${job.type}`);
        }
    }
    async addWelcomeEmailJob(email, firstName) {
        await this.addEmailJob({
            type: 'welcome',
            data: { email, firstName },
        });
    }
    async addPasswordResetEmailJob(email, resetToken) {
        await this.addEmailJob({
            type: 'password-reset',
            data: { email, resetToken },
        });
    }
    async addPaymentConfirmationEmailJob(email, amount, currency) {
        await this.addEmailJob({
            type: 'payment-confirmation',
            data: { email, amount, currency },
        });
    }
};
exports.QueuesService = QueuesService;
exports.QueuesService = QueuesService = QueuesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        emails_service_1.EmailsService])
], QueuesService);
//# sourceMappingURL=queues.service.js.map