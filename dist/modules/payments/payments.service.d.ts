import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsService {
    private paymentsRepository;
    private configService;
    private stripe;
    constructor(paymentsRepository: Repository<Payment>, configService: ConfigService);
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
}
