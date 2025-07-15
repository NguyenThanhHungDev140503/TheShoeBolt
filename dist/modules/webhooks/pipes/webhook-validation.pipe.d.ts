import { PipeTransform } from '@nestjs/common';
import { WebhookEventDto } from '../dto/clerk-webhook-event.dto';
export declare class WebhookValidationPipe implements PipeTransform {
    private readonly logger;
    transform(value: any): Promise<WebhookEventDto>;
    private validateEventData;
    private formatValidationErrors;
    private validateRequiredFields;
    private checkRequiredFields;
    private validateEmailAddresses;
    private validateTimestamps;
    private validateOrganization;
    private validatePublicUserData;
}
