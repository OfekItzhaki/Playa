import { validatePhoneNumber, validateInstagramUsername, validateMessage, validateRecipient } from '../../../services/ValidationService';

describe('ValidationService', () => {
  describe('validatePhoneNumber', () => {
    it('should accept valid E.164 phone numbers', () => {
      expect(validatePhoneNumber('+1234567890').success).toBe(true);
      expect(validatePhoneNumber('+447911123456').success).toBe(true);
      expect(validatePhoneNumber('+12025551234').success).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('1234567890').success).toBe(false);
      expect(validatePhoneNumber('+0123456789').success).toBe(false);
      expect(validatePhoneNumber('').success).toBe(false);
      expect(validatePhoneNumber('abc').success).toBe(false);
    });

    it('should return error message for invalid phone', () => {
      const result = validatePhoneNumber('invalid');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateInstagramUsername', () => {
    it('should accept valid Instagram usernames', () => {
      expect(validateInstagramUsername('john_doe').success).toBe(true);
      expect(validateInstagramUsername('user.name').success).toBe(true);
      expect(validateInstagramUsername('user123').success).toBe(true);
    });

    it('should reject invalid Instagram usernames', () => {
      expect(validateInstagramUsername('').success).toBe(false);
      expect(validateInstagramUsername('user name').success).toBe(false);
      expect(validateInstagramUsername('user@name').success).toBe(false);
      expect(validateInstagramUsername('a'.repeat(31)).success).toBe(false);
    });

    it('should return error message for invalid username', () => {
      const result = validateInstagramUsername('invalid username');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateMessage', () => {
    it('should accept valid messages', () => {
      expect(validateMessage('Hello').success).toBe(true);
      expect(validateMessage('A'.repeat(500)).success).toBe(true);
    });

    it('should reject empty messages', () => {
      expect(validateMessage('').success).toBe(false);
    });

    it('should reject messages over 500 characters', () => {
      expect(validateMessage('A'.repeat(501)).success).toBe(false);
    });

    it('should return error message for invalid message', () => {
      const result = validateMessage('');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateRecipient', () => {
    it('should accept valid recipient with WhatsApp', () => {
      const data = {
        name: 'John Doe',
        platform: 'whatsapp',
        identifier: '+1234567890',
        scheduleConfig: { mode: 'random', frequency: 3 },
        messagePool: ['Hello', 'Hi'],
      };
      const result = validateRecipient(data);
      expect(result.data).toBeDefined();
      expect(result.errors).toBeUndefined();
    });

    it('should accept valid recipient with Instagram', () => {
      const data = {
        name: 'John Doe',
        platform: 'instagram',
        identifier: 'john_doe',
        scheduleConfig: { mode: 'fixed', fixedTimes: ['09:00', '18:00'] },
        messagePool: ['Hello'],
      };
      const result = validateRecipient(data);
      expect(result.data).toBeDefined();
      expect(result.errors).toBeUndefined();
    });

    it('should reject recipient with invalid name', () => {
      const data = {
        name: '',
        platform: 'whatsapp',
        identifier: '+1234567890',
        scheduleConfig: { mode: 'random', frequency: 3 },
        messagePool: ['Hello'],
      };
      const result = validateRecipient(data);
      expect(result.errors).toBeDefined();
      expect(result.errors?.name).toBeDefined();
    });

    it('should reject recipient with invalid phone', () => {
      const data = {
        name: 'John Doe',
        platform: 'whatsapp',
        identifier: 'invalid',
        scheduleConfig: { mode: 'random', frequency: 3 },
        messagePool: ['Hello'],
      };
      const result = validateRecipient(data);
      expect(result.errors).toBeDefined();
      expect(result.errors?.identifier).toBeDefined();
    });

    it('should reject recipient with empty message pool', () => {
      const data = {
        name: 'John Doe',
        platform: 'whatsapp',
        identifier: '+1234567890',
        scheduleConfig: { mode: 'random', frequency: 3 },
        messagePool: [],
      };
      const result = validateRecipient(data);
      expect(result.errors).toBeDefined();
      expect(result.errors?.messagePool).toBeDefined();
    });
  });
});
