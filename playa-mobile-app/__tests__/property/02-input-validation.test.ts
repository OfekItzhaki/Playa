import * as fc from 'fast-check';
import { validatePhoneNumber, validateInstagramUsername, validateMessage } from '../../services/ValidationService';

/**
 * Property 2: Input Validation Consistency
 * 
 * For any Recipient creation or edit operation, validation SHALL reject invalid inputs
 * and accept valid inputs consistently.
 */
describe('Property 2: Input Validation Consistency', () => {
  describe('Phone number validation', () => {
    it('should accept valid E.164 phone numbers', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 15 }).map((s) => '+' + s.replace(/\D/g, '').slice(0, 14)),
          (phone) => {
            if (/^\+[1-9]\d{1,14}$/.test(phone)) {
              const result = validatePhoneNumber(phone);
              expect(result.success).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject invalid phone numbers', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(''),
            fc.constant('123'),
            fc.constant('invalid'),
            fc.string({ minLength: 1, maxLength: 20 }).filter((s) => !/^\+[1-9]\d{1,14}$/.test(s))
          ),
          (phone) => {
            const result = validatePhoneNumber(phone);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Instagram username validation', () => {
    it('should accept valid Instagram usernames', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-zA-Z0-9._]{1,30}$/),
          (username) => {
            const result = validateInstagramUsername(username);
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject invalid Instagram usernames', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(''),
            fc.constant('user name'),
            fc.constant('user@name'),
            fc.string({ minLength: 31, maxLength: 50 }),
            fc.string({ minLength: 1, maxLength: 30 }).filter((s) => !/^[a-zA-Z0-9._]+$/.test(s))
          ),
          (username) => {
            const result = validateInstagramUsername(username);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Message validation', () => {
    it('should accept valid messages', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          (message) => {
            const result = validateMessage(message);
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject empty messages', () => {
      const result = validateMessage('');
      expect(result.success).toBe(false);
    });

    it('should reject messages over 500 characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 501, maxLength: 1000 }),
          (message) => {
            const result = validateMessage(message);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
