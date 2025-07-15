import { ExceptionFilter, ArgumentsHost, BadRequestException } from '@nestjs/common';
export declare class WebhookExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: BadRequestException, host: ArgumentsHost): void;
    private categorizeError;
    private getHttpStatusForCategory;
    private getErrorGuidance;
    private generateFixSuggestions;
    private isRetryableError;
    private extractDebugInfo;
}
