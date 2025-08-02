import { ConfigService } from '@nestjs/config';
import { Repository, DataSource } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsService {
    private paymentsRepository;
    private configService;
    private readonly dataSource;
    private stripe;
    private readonly logger;
    constructor(paymentsRepository: Repository<Payment>, configService: ConfigService, dataSource: DataSource);
    createPaymentIntent(createPaymentDto: CreatePaymentDto, userId: string): Promise<{
        clientSecret: string;
        paymentId: string;
    }>;
    confirmPayment(paymentIntentId: string): Promise<Payment>;
    findUserPayments(userId: string): Promise<Payment[]>;
    findOne(id: string): Promise<Payment>;
    handleWebhook(signature: string, body: Buffer): Promise<{
        received: boolean;
    }>;
    private handleFailedPayment;
    processRefund(paymentId: string, refundAmount: number, reason?: string): Promise<void>;
    private validateRefundRequest;
    private findPaymentById;
    private processExternalRefund;
    private updateRefundStatus;
    updateRefundStatusSimple(paymentId: string, refundAmount: number, reason?: string): Promise<void>;
}
