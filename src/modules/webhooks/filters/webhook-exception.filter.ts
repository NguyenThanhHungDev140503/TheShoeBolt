import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException, Logger, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(BadRequestException)
export class WebhookExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(WebhookExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    
    // Extract error details
    const errorMessage = typeof exceptionResponse === 'string' 
      ? exceptionResponse 
      : (exceptionResponse as any).message || 'Webhook validation failed';
    
    const errorDetails = typeof exceptionResponse === 'object' 
      ? (exceptionResponse as any).message || []
      : [];

    // Log the webhook validation error with context
    this.logger.error(`Webhook validation failed for ${request.method} ${request.url}`, {
      error: errorMessage,
      details: errorDetails,
      headers: {
        'svix-id': request.headers['svix-id'],
        'svix-timestamp': request.headers['svix-timestamp'],
        'svix-signature': request.headers['svix-signature'] ? '[REDACTED]' : undefined,
        'content-type': request.headers['content-type'],
        'user-agent': request.headers['user-agent'],
      },
      bodySize: request.body ? JSON.stringify(request.body).length : 0,
      ip: request.ip,
      timestamp: new Date().toISOString(),
    });

    // Determine error category for better handling
    const errorCategory = this.categorizeError(errorMessage);
    
    // Create structured error response
    const errorResponse = {
      success: false,
      error: 'Webhook validation failed',
      message: errorMessage,
      category: errorCategory,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...(Array.isArray(errorDetails) && errorDetails.length > 0 && {
        details: errorDetails
      }),
      // Include webhook-specific context
      webhook: {
        id: request.headers['svix-id'] || null,
        timestamp: request.headers['svix-timestamp'] || null,
        hasSignature: !!request.headers['svix-signature'],
      },
      // Provide guidance for common issues
      guidance: this.getErrorGuidance(errorCategory),
    };

    // Set appropriate HTTP status based on error category
    const httpStatus = this.getHttpStatusForCategory(errorCategory);

    response
      .status(httpStatus)
      .json(errorResponse);
  }

  private categorizeError(errorMessage: string): string {
    const message = errorMessage.toLowerCase();
    
    if (message.includes('invalid webhook structure') || message.includes('must be an object')) {
      return 'INVALID_STRUCTURE';
    }
    
    if (message.includes('missing required field') || message.includes('is required')) {
      return 'MISSING_REQUIRED_FIELD';
    }
    
    if (message.includes('invalid email') || message.includes('email format')) {
      return 'INVALID_EMAIL_FORMAT';
    }
    
    if (message.includes('invalid timestamp') || message.includes('timestamp format')) {
      return 'INVALID_TIMESTAMP';
    }
    
    if (message.includes('unknown event type')) {
      return 'UNKNOWN_EVENT_TYPE';
    }
    
    if (message.includes('event data') || message.includes('invalid event data')) {
      return 'INVALID_EVENT_DATA';
    }
    
    if (message.includes('organization') && message.includes('must be an object')) {
      return 'INVALID_ORGANIZATION_DATA';
    }
    
    if (message.includes('public_user_data') && message.includes('must be an object')) {
      return 'INVALID_USER_DATA';
    }
    
    return 'GENERAL_VALIDATION_ERROR';
  }

  private getHttpStatusForCategory(category: string): number {
    switch (category) {
      case 'INVALID_STRUCTURE':
      case 'MISSING_REQUIRED_FIELD':
      case 'INVALID_EMAIL_FORMAT':
      case 'INVALID_TIMESTAMP':
      case 'INVALID_EVENT_DATA':
      case 'INVALID_ORGANIZATION_DATA':
      case 'INVALID_USER_DATA':
        return HttpStatus.BAD_REQUEST; // 400
      
      case 'UNKNOWN_EVENT_TYPE':
        return HttpStatus.UNPROCESSABLE_ENTITY; // 422
      
      case 'GENERAL_VALIDATION_ERROR':
      default:
        return HttpStatus.BAD_REQUEST; // 400
    }
  }

  private getErrorGuidance(category: string): string {
    switch (category) {
      case 'INVALID_STRUCTURE':
        return 'Ensure the webhook payload is a valid JSON object with required top-level fields (type, data, object).';
      
      case 'MISSING_REQUIRED_FIELD':
        return 'Check that all required fields for this event type are present and not null/undefined.';
      
      case 'INVALID_EMAIL_FORMAT':
        return 'Verify that email addresses follow the format: user@domain.com and are properly structured.';
      
      case 'INVALID_TIMESTAMP':
        return 'Timestamps should be Unix timestamps (positive integers representing seconds since epoch).';
      
      case 'UNKNOWN_EVENT_TYPE':
        return 'This event type is not currently supported. Check the webhook configuration in Clerk dashboard.';
      
      case 'INVALID_EVENT_DATA':
        return 'The event data structure does not match the expected format for this event type.';
      
      case 'INVALID_ORGANIZATION_DATA':
        return 'Organization data must include id, name, and slug fields as strings.';
      
      case 'INVALID_USER_DATA':
        return 'User data must include user_id field and follow the expected structure.';
      
      case 'GENERAL_VALIDATION_ERROR':
      default:
        return 'Review the webhook payload structure and ensure it matches Clerk webhook specifications.';
    }
  }

  /**
   * Generate suggestions for fixing common validation issues
   */
  private generateFixSuggestions(errorMessage: string): string[] {
    const suggestions: string[] = [];
    const message = errorMessage.toLowerCase();

    if (message.includes('email')) {
      suggestions.push('Verify email format: user@domain.com');
      suggestions.push('Ensure email_addresses is an array with at least one valid email');
    }

    if (message.includes('timestamp')) {
      suggestions.push('Use Unix timestamps (seconds since epoch)');
      suggestions.push('Ensure timestamps are positive integers');
    }

    if (message.includes('required')) {
      suggestions.push('Check Clerk webhook documentation for required fields');
      suggestions.push('Verify all mandatory fields are present and not null');
    }

    if (message.includes('organization')) {
      suggestions.push('Include organization.id, organization.name, and organization.slug');
      suggestions.push('Ensure organization data is properly nested');
    }

    if (message.includes('user_id')) {
      suggestions.push('Verify user_id is a valid Clerk user identifier');
      suggestions.push('Check that the user exists in your Clerk instance');
    }

    return suggestions;
  }

  /**
   * Check if error is retryable (for webhook retry logic)
   */
  private isRetryableError(category: string): boolean {
    // These errors are typically not retryable as they indicate client-side issues
    const nonRetryableCategories = [
      'INVALID_STRUCTURE',
      'MISSING_REQUIRED_FIELD',
      'INVALID_EMAIL_FORMAT',
      'INVALID_TIMESTAMP',
      'INVALID_EVENT_DATA',
      'INVALID_ORGANIZATION_DATA',
      'INVALID_USER_DATA',
    ];

    return !nonRetryableCategories.includes(category);
  }

  /**
   * Extract relevant debugging information from request
   */
  private extractDebugInfo(request: Request): Record<string, any> {
    return {
      contentLength: request.headers['content-length'],
      contentType: request.headers['content-type'],
      userAgent: request.headers['user-agent'],
      svixHeaders: {
        id: request.headers['svix-id'],
        timestamp: request.headers['svix-timestamp'],
        hasSignature: !!request.headers['svix-signature'],
      },
      bodyPreview: request.body ? 
        JSON.stringify(request.body).substring(0, 200) + '...' : 
        'No body',
      ip: request.ip,
      method: request.method,
      url: request.url,
    };
  }
}
