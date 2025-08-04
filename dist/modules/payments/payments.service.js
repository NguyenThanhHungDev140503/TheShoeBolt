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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const typeorm_2 = require("typeorm");
const stripe_1 = require("stripe");
const payment_entity_1 = require("./entities/payment.entity");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(paymentsRepository, configService, dataSource) {
        this.paymentsRepository = paymentsRepository;
        this.configService = configService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(PaymentsService_1.name);
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
    async processRefund(paymentId, refundAmount, reason) {
        this.logger.log(`Processing refund for payment ${paymentId}, amount: ${refundAmount}`);
        return await this.dataSource.transaction(async (manager) => {
            try {
                const payment = await this.findPaymentById(paymentId, manager);
                if (!payment) {
                    throw new common_1.NotFoundException(`Không tìm thấy thanh toán với ID: ${paymentId}`);
                }
                this.validateRefundRequest(payment, refundAmount);
                await this.processExternalRefund(payment, refundAmount);
                await this.updateRefundStatus(paymentId, refundAmount, reason, manager);
                this.logger.log(`Successfully processed refund for payment ${paymentId}`);
            }
            catch (error) {
                this.logger.error(`Failed to process refund: ${error.message}`, error.stack);
                throw error;
            }
        });
    }
    validateRefundRequest(payment, refundAmount) {
        if (payment.status !== payment_entity_1.PaymentStatus.SUCCEEDED) {
            throw new common_1.BadRequestException('Chỉ có thể refund payment có trạng thái success');
        }
        if (refundAmount > payment.amount) {
            throw new common_1.BadRequestException('Số tiền refund không thể lớn hơn số tiền thanh toán');
        }
        if (payment.status === payment_entity_1.PaymentStatus.REFUNDED) {
            throw new common_1.BadRequestException('Payment đã được refund trước đó');
        }
        this.logger.debug(`Refund validation passed for payment ${payment.id}`);
    }
    async findPaymentById(paymentId, manager) {
        const repository = manager ? manager.getRepository(payment_entity_1.Payment) : this.paymentsRepository;
        return await repository.findOne({ where: { id: paymentId } });
    }
    async processExternalRefund(payment, refundAmount) {
        try {
            if (payment.stripePaymentIntentId) {
                await this.stripe.refunds.create({
                    payment_intent: payment.stripePaymentIntentId,
                    amount: Math.round(refundAmount * 100),
                });
                this.logger.debug(`Processed Stripe refund for payment ${payment.id}`);
            }
            else {
                this.logger.warn(`No external payment provider found for payment ${payment.id}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to process external refund: ${error.message}`);
            throw new common_1.BadRequestException(`Không thể xử lý refund với payment provider: ${error.message}`);
        }
    }
    async updateRefundStatus(paymentId, refundAmount, reason, manager) {
        const repository = manager.getRepository(payment_entity_1.Payment);
        const updateData = {
            status: payment_entity_1.PaymentStatus.REFUNDED,
            metadata: {
                refund_amount: refundAmount,
                refund_reason: reason,
                refunded_at: new Date().toISOString(),
            },
            updatedAt: new Date(),
        };
        const result = await repository.update({ id: paymentId }, updateData);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Không tìm thấy payment với ID: ${paymentId}`);
        }
        this.logger.debug(`Updated refund status for payment ${paymentId}`);
    }
    async updateRefundStatusSimple(paymentId, refundAmount, reason) {
        this.logger.log(`Updating refund status for payment ${paymentId}`);
        const updateData = {
            status: payment_entity_1.PaymentStatus.REFUNDED,
            metadata: {
                refund_amount: refundAmount,
                refund_reason: reason,
                refunded_at: new Date().toISOString(),
            },
            updatedAt: new Date(),
        };
        const result = await this.paymentsRepository.update({ id: paymentId }, updateData);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Không tìm thấy payment với ID: ${paymentId}`);
        }
        this.logger.log(`Successfully updated refund status for payment ${paymentId}`);
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService,
        typeorm_2.DataSource])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map