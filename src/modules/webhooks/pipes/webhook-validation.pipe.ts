import { PipeTransform, Injectable, BadRequestException, Logger } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { 
  WebhookEventDto, 
  ClerkUserEventDto, 
  ClerkSessionEventDto, 
  ClerkOrganizationEventDto,
  ClerkOrganizationMembershipEventDto 
} from '../dto/clerk-webhook-event.dto';

@Injectable()
export class WebhookValidationPipe implements PipeTransform {
  private readonly logger = new Logger(WebhookValidationPipe.name);

  async transform(value: any): Promise<WebhookEventDto> {
    if (!value || typeof value !== 'object') {
      throw new BadRequestException('Invalid webhook payload: must be an object');
    }

    // Validate basic webhook structure
    const webhookEvent = plainToClass(WebhookEventDto, value);
    const webhookErrors = await validate(webhookEvent, { 
      whitelist: true, 
      forbidNonWhitelisted: false // Allow extra properties for flexibility
    });

    if (webhookErrors.length > 0) {
      const errorMessages = this.formatValidationErrors(webhookErrors);
      this.logger.warn(`Webhook validation failed: ${errorMessages.join(', ')}`);
      throw new BadRequestException(`Invalid webhook structure: ${errorMessages.join(', ')}`);
    }

    // Validate event-specific data based on event type
    try {
      await this.validateEventData(value.type, value.data);
    } catch (error) {
      this.logger.warn(`Event data validation failed for ${value.type}: ${error.message}`);
      throw new BadRequestException(`Invalid event data for ${value.type}: ${error.message}`);
    }

    return webhookEvent;
  }

  private async validateEventData(eventType: string, eventData: any): Promise<void> {
    if (!eventData) {
      throw new Error('Event data is required');
    }

    let dtoClass: any;
    let validationOptions = { 
      whitelist: true, 
      forbidNonWhitelisted: false,
      skipMissingProperties: false 
    };

    switch (eventType) {
      case 'user.created':
      case 'user.updated':
      case 'user.deleted':
        dtoClass = ClerkUserEventDto;
        break;
      case 'session.created':
      case 'session.updated':
      case 'session.ended':
      case 'session.removed':
      case 'session.revoked':
        dtoClass = ClerkSessionEventDto;
        // Sessions might have fewer required fields for some events
        validationOptions.skipMissingProperties = true;
        break;
      case 'organization.created':
      case 'organization.updated':
      case 'organization.deleted':
        dtoClass = ClerkOrganizationEventDto;
        break;
      case 'organizationMembership.created':
      case 'organizationMembership.updated':
      case 'organizationMembership.deleted':
        dtoClass = ClerkOrganizationMembershipEventDto;
        break;
      default:
        // For unknown event types, skip detailed validation but log warning
        this.logger.warn(`Unknown event type: ${eventType}, skipping detailed validation`);
        return;
    }

    const dto = plainToClass(dtoClass, eventData);
    const errors = await validate(dto, validationOptions);

    if (errors.length > 0) {
      const errorMessages = this.formatValidationErrors(errors);
      throw new Error(errorMessages.join(', '));
    }
  }

  private formatValidationErrors(errors: any[]): string[] {
    const messages: string[] = [];

    for (const error of errors) {
      if (error.constraints) {
        messages.push(...Object.values(error.constraints));
      }
      
      // Handle nested validation errors
      if (error.children && error.children.length > 0) {
        const childMessages = this.formatValidationErrors(error.children);
        messages.push(...childMessages.map(msg => `${error.property}.${msg}`));
      }
    }

    return messages;
  }

  /**
   * Validate specific required fields based on event type
   */
  private validateRequiredFields(eventType: string, eventData: any): void {
    const commonRequiredFields = ['id'];
    
    switch (eventType) {
      case 'user.created':
      case 'user.updated':
        const userRequiredFields = [...commonRequiredFields, 'email_addresses', 'created_at', 'updated_at'];
        this.checkRequiredFields(eventData, userRequiredFields, 'user');
        break;
        
      case 'user.deleted':
        // Deleted events might have minimal data
        this.checkRequiredFields(eventData, commonRequiredFields, 'user');
        break;
        
      case 'session.created':
        const sessionRequiredFields = [...commonRequiredFields, 'user_id', 'created_at'];
        this.checkRequiredFields(eventData, sessionRequiredFields, 'session');
        break;
        
      case 'session.ended':
      case 'session.removed':
      case 'session.revoked':
        // Session end events might have minimal data
        this.checkRequiredFields(eventData, [...commonRequiredFields, 'user_id'], 'session');
        break;
        
      case 'organization.created':
      case 'organization.updated':
        const orgRequiredFields = [...commonRequiredFields, 'name', 'slug', 'created_at'];
        this.checkRequiredFields(eventData, orgRequiredFields, 'organization');
        break;
        
      case 'organizationMembership.created':
      case 'organizationMembership.updated':
        const membershipRequiredFields = [...commonRequiredFields, 'organization', 'public_user_data', 'role'];
        this.checkRequiredFields(eventData, membershipRequiredFields, 'membership');
        break;
    }
  }

  private checkRequiredFields(data: any, requiredFields: string[], entityType: string): void {
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null) {
        throw new Error(`Missing required field '${field}' for ${entityType} event`);
      }
    }
  }

  /**
   * Validate email addresses format
   */
  private validateEmailAddresses(emailAddresses: any[]): void {
    if (!Array.isArray(emailAddresses)) {
      throw new Error('email_addresses must be an array');
    }

    if (emailAddresses.length === 0) {
      throw new Error('At least one email address is required');
    }

    for (const email of emailAddresses) {
      if (!email.id || !email.email_address) {
        throw new Error('Each email address must have id and email_address fields');
      }
      
      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.email_address)) {
        throw new Error(`Invalid email format: ${email.email_address}`);
      }
    }
  }

  /**
   * Validate timestamp fields
   */
  private validateTimestamps(data: any): void {
    const timestampFields = ['created_at', 'updated_at', 'last_sign_in_at', 'expire_at', 'abandon_at'];
    
    for (const field of timestampFields) {
      if (data[field] !== undefined && data[field] !== null) {
        if (!Number.isInteger(data[field]) || data[field] < 0) {
          throw new Error(`Invalid timestamp format for ${field}: must be a positive integer`);
        }
      }
    }
  }

  /**
   * Validate organization structure
   */
  private validateOrganization(organization: any): void {
    if (!organization || typeof organization !== 'object') {
      throw new Error('organization must be an object');
    }

    const requiredFields = ['id', 'name', 'slug'];
    for (const field of requiredFields) {
      if (!organization[field]) {
        throw new Error(`organization.${field} is required`);
      }
    }
  }

  /**
   * Validate public user data structure
   */
  private validatePublicUserData(publicUserData: any): void {
    if (!publicUserData || typeof publicUserData !== 'object') {
      throw new Error('public_user_data must be an object');
    }

    if (!publicUserData.user_id) {
      throw new Error('public_user_data.user_id is required');
    }
  }
}
