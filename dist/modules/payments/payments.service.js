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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const typeorm_2 = require("typeorm");
const stripe_1 = require("stripe");
const payment_entity_1 = require("./entities/payment.entity");
let PaymentsService = class PaymentsService {
    constructor(paymentsRepository, configService) {
        this.paymentsRepository = paymentsRepository;
        this.configService = configService;
        this.stripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY'), {
            apiVersion: '2023-10-16',
        });
    }
    async createPaymentIntent(createPaymentDto, userId) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(createPaymentDto.amount * 100),
                currency: createPaymentDto.currency || 'usd',
                metadata: {
                    userId,
                    description: createPaymentDto.description || '',
                },
            });
            const payment = this.paymentsRepository.create({
                userId,
                stripePaymentIntentId: paymentIntent.id,
                amount: createPaymentDto.amount,
                currency: createPaymentDto.currency || 'usd',
                description: createPaymentDto.description,
                status: payment_entity_1.PaymentStatus.PENDING,
            });
            await this.paymentsRepository.save(payment);
            return {
                clientSecret: paymentIntent.client_secret,
                paymentId: payment.id,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Payment creation failed: ${error.message}`);
        }
    }
    async confirmPayment(paymentIntentId) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
            const payment = await this.paymentsRepository.findOne({
                where: { stripePaymentIntentId: paymentIntentId },
            });
            if (!payment) {
                throw new common_1.NotFoundException('Payment not found');
            }
            payment.status = paymentIntent.status === 'succeeded'
                ? payment_entity_1.PaymentStatus.COMPLETED
                : payment_entity_1.PaymentStatus.FAILED;
            await this.paymentsRepository.save(payment);
            return payment;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Payment confirmation failed: ${error.message}`);
        }
    }
    async findUserPayments(userId) {
        return this.paymentsRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const payment = await this.paymentsRepository.findOne({ where: { id } });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        return payment;
    }
    async handleWebhook(signature, body) {
        const endpointSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        try {
            const event = this.stripe.webhooks.constructEvent(body, signature, endpointSecret);
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.confirmPayment(event.data.object.id);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handleFailedPayment(event.data.object.id);
                    break;
                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }
            return { received: true };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Webhook signature verification failed: ${error.message}`);
        }
    }
    async handleFailedPayment(paymentIntentId) {
        const payment = await this.paymentsRepository.findOne({
            where: { stripePaymentIntentId: paymentIntentId },
        });
        if (payment) {
            payment.status = payment_entity_1.PaymentStatus.FAILED;
            await this.paymentsRepository.save(payment);
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map