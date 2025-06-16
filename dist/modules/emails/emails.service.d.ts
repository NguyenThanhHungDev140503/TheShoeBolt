import { ConfigService } from '@nestjs/config';
import { SendEmailDto } from './dto/send-email.dto';
export declare class EmailsService {
    private configService;
    private resend;
    constructor(configService: ConfigService);
    sendEmail(sendEmailDto: SendEmailDto): Promise<{
        success: boolean;
        messageId: string;
    }>;
    sendWelcomeEmail(email: string, firstName: string): Promise<{
        success: boolean;
        messageId: string;
    }>;
    sendPasswordResetEmail(email: string, resetToken: string): Promise<{
        success: boolean;
        messageId: string;
    }>;
    sendPaymentConfirmationEmail(email: string, amount: number, currency: string): Promise<{
        success: boolean;
        messageId: string;
    }>;
}
