import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createPaymentIntent(createPaymentDto: CreatePaymentDto, req: any): Promise<{
        clientSecret: string;
        paymentId: string;
    }>;
    confirmPayment(paymentIntentId: string): Promise<import("./entities/payment.entity").Payment>;
    findUserPayments(req: any): Promise<import("./entities/payment.entity").Payment[]>;
    findOne(id: string): Promise<import("./entities/payment.entity").Payment>;
    handleWebhook(signature: string, body: Buffer): Promise<{
        received: boolean;
    }>;
}
