import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailsService } from '../emails/emails.service';
export interface EmailJob {
    type: 'welcome' | 'password-reset' | 'payment-confirmation';
    data: any;
}
export declare class QueuesService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private emailsService;
    private connection;
    private channel;
    private readonly logger;
    private readonly EMAIL_QUEUE;
    constructor(configService: ConfigService, emailsService: EmailsService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private connect;
    private setupQueues;
    private startConsumers;
    addEmailJob(job: EmailJob): Promise<void>;
    private processEmailJob;
    addWelcomeEmailJob(email: string, firstName: string): Promise<void>;
    addPasswordResetEmailJob(email: string, resetToken: string): Promise<void>;
    addPaymentConfirmationEmailJob(email: string, amount: number, currency: string): Promise<void>;
}
