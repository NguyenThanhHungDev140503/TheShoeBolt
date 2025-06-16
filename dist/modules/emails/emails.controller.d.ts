import { EmailsService } from './emails.service';
import { SendEmailDto } from './dto/send-email.dto';
export declare class EmailsController {
    private readonly emailsService;
    constructor(emailsService: EmailsService);
    sendEmail(sendEmailDto: SendEmailDto): Promise<{
        success: boolean;
        messageId: string;
    }>;
}
