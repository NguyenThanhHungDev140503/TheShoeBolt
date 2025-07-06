import { BadRequestException } from '@nestjs/common';
import { WebhookValidationPipe } from 'src/modules/webhooks/pipes/webhook-validation.pipe';

describe('WebhookValidationPipe', () => {
  let pipe: WebhookValidationPipe;

  beforeEach(() => {
    pipe = new WebhookValidationPipe();
  });

  describe('transform', () => {
    it('should validate valid user.created webhook event', async () => {
      const validUserEvent = {
        type: 'user.created',
        object: 'event',
        data: {
          id: 'user_test123',
          email_addresses: [
            {
              id: 'email_test123',
              email_address: 'test@example.com',
              primary: true,
            }
          ],
          first_name: 'Test',
          last_name: 'User',
          created_at: 1625097600,
          updated_at: 1625097600,
        }
      };

      const result = await pipe.transform(validUserEvent);

      expect(result).toBeDefined();
      expect(result.type).toBe('user.created');
      expect(result.data).toBeDefined();
    });

    it('should validate valid session.created webhook event', async () => {
      const validSessionEvent = {
        type: 'session.created',
        object: 'event',
        data: {
          id: 'sess_test123',
          user_id: 'user_test123',
          created_at: 1625097600,
          updated_at: 1625097600,
          last_active_at: {
            timestamp: 1625097900,
            ip_address: '192.168.1.1',
            user_agent: 'Mozilla/5.0 Test Browser'
          }
        }
      };

      const result = await pipe.transform(validSessionEvent);

      expect(result).toBeDefined();
      expect(result.type).toBe('session.created');
      expect(result.data).toBeDefined();
    });

    it('should validate valid organization.created webhook event', async () => {
      const validOrgEvent = {
        type: 'organization.created',
        object: 'event',
        data: {
          id: 'org_test123',
          name: 'Test Organization',
          slug: 'test-org',
          created_at: 1625097600,
          updated_at: 1625097600,
          public_metadata: {},
          private_metadata: {}
        }
      };

      const result = await pipe.transform(validOrgEvent);

      expect(result).toBeDefined();
      expect(result.type).toBe('organization.created');
      expect(result.data).toBeDefined();
    });

    it('should validate valid organizationMembership.created webhook event', async () => {
      const validMembershipEvent = {
        type: 'organizationMembership.created',
        object: 'event',
        data: {
          id: 'membership_test123',
          organization: {
            id: 'org_test123',
            name: 'Test Organization',
            slug: 'test-org'
          },
          public_user_data: {
            user_id: 'user_test123',
            first_name: 'Test',
            last_name: 'User'
          },
          role: 'admin',
          created_at: 1625097600,
          updated_at: 1625097600
        }
      };

      const result = await pipe.transform(validMembershipEvent);

      expect(result).toBeDefined();
      expect(result.type).toBe('organizationMembership.created');
      expect(result.data).toBeDefined();
    });

    it('should throw BadRequestException for invalid webhook structure', async () => {
      const invalidEvent = {
        // Missing required fields
        data: {}
      };

      await expect(pipe.transform(invalidEvent)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for null/undefined payload', async () => {
      await expect(pipe.transform(null)).rejects.toThrow(BadRequestException);
      await expect(pipe.transform(undefined)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for non-object payload', async () => {
      await expect(pipe.transform('invalid')).rejects.toThrow(BadRequestException);
      await expect(pipe.transform(123)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for missing event data', async () => {
      const eventWithoutData = {
        type: 'user.created',
        object: 'event'
        // Missing data field
      };

      await expect(pipe.transform(eventWithoutData)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid email format in user event', async () => {
      const invalidUserEvent = {
        type: 'user.created',
        object: 'event',
        data: {
          id: 'user_test123',
          email_addresses: [
            {
              id: 'email_test123',
              email_address: 'invalid-email', // Invalid email format
              primary: true,
            }
          ],
          created_at: 1625097600,
          updated_at: 1625097600,
        }
      };

      await expect(pipe.transform(invalidUserEvent)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for missing required fields in user event', async () => {
      const incompleteUserEvent = {
        type: 'user.created',
        object: 'event',
        data: {
          id: 'user_test123',
          // Missing email_addresses
          first_name: 'Test',
          last_name: 'User',
          created_at: 1625097600,
          updated_at: 1625097600,
        }
      };

      await expect(pipe.transform(incompleteUserEvent)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid timestamp in session event', async () => {
      const invalidSessionEvent = {
        type: 'session.created',
        object: 'event',
        data: {
          id: 'sess_test123',
          user_id: 'user_test123',
          created_at: 'invalid-timestamp', // Should be number
          updated_at: 1625097600,
        }
      };

      await expect(pipe.transform(invalidSessionEvent)).rejects.toThrow(BadRequestException);
    });

    it('should handle unknown event types gracefully', async () => {
      const unknownEvent = {
        type: 'unknown.event.type',
        object: 'event',
        data: {
          id: 'test123',
          some_field: 'some_value'
        }
      };

      // Should not throw for unknown event types, just log warning
      const result = await pipe.transform(unknownEvent);
      expect(result).toBeDefined();
      expect(result.type).toBe('unknown.event.type');
    });

    it('should validate session.ended event with minimal data', async () => {
      const sessionEndedEvent = {
        type: 'session.ended',
        object: 'event',
        data: {
          id: 'sess_test123',
          user_id: 'user_test123',
          // Minimal data for session end events
        }
      };

      const result = await pipe.transform(sessionEndedEvent);
      expect(result).toBeDefined();
      expect(result.type).toBe('session.ended');
    });

    it('should validate user.deleted event with minimal data', async () => {
      const userDeletedEvent = {
        type: 'user.deleted',
        object: 'event',
        data: {
          id: 'user_test123',
          // Minimal data for deleted events
        }
      };

      const result = await pipe.transform(userDeletedEvent);
      expect(result).toBeDefined();
      expect(result.type).toBe('user.deleted');
    });
  });
});
