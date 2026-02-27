import { constructDeepLink, validateDeepLink } from '../../../services/DeepLinkService';
import { ScheduledEvent } from '../../../types';

describe('DeepLinkService', () => {
  describe('constructDeepLink', () => {
    describe('WhatsApp', () => {
      it('should construct WhatsApp deep link with phone number', () => {
        const event: ScheduledEvent = {
          id: 'test-1',
          recipientId: 'recipient-1',
          recipientName: 'Test User',
          platform: 'whatsapp',
          identifier: '+1234567890',
          message: 'Hello World',
          scheduledTime: '2024-01-01T10:00:00.000Z',
          status: 'pending',
          createdAt: '2024-01-01T00:00:00.000Z',
        };
        const url = constructDeepLink(event);
        expect(url).toBe('whatsapp://send?phone=+1234567890&text=Hello%20World');
      });

      it('should encode special characters in message', () => {
        const event: ScheduledEvent = {
          id: 'test-1',
          recipientId: 'recipient-1',
          recipientName: 'Test User',
          platform: 'whatsapp',
          identifier: '+1234567890',
          message: 'Hello & goodbye!',
          scheduledTime: '2024-01-01T10:00:00.000Z',
          status: 'pending',
          createdAt: '2024-01-01T00:00:00.000Z',
        };
        const url = constructDeepLink(event);
        expect(url).toContain('Hello%20%26%20goodbye!');
      });

      it('should handle empty message', () => {
        const event: ScheduledEvent = {
          id: 'test-1',
          recipientId: 'recipient-1',
          recipientName: 'Test User',
          platform: 'whatsapp',
          identifier: '+1234567890',
          message: '',
          scheduledTime: '2024-01-01T10:00:00.000Z',
          status: 'pending',
          createdAt: '2024-01-01T00:00:00.000Z',
        };
        const url = constructDeepLink(event);
        expect(url).toBe('whatsapp://send?phone=+1234567890&text=');
      });
    });

    describe('SMS', () => {
      it('should construct SMS deep link with phone number', () => {
        const event: ScheduledEvent = {
          id: 'test-1',
          recipientId: 'recipient-1',
          recipientName: 'Test User',
          platform: 'sms',
          identifier: '+1234567890',
          message: 'Hello World',
          scheduledTime: '2024-01-01T10:00:00.000Z',
          status: 'pending',
          createdAt: '2024-01-01T00:00:00.000Z',
        };
        const url = constructDeepLink(event);
        expect(url).toBe('sms:+1234567890?body=Hello%20World');
      });

      it('should encode special characters in message', () => {
        const event: ScheduledEvent = {
          id: 'test-1',
          recipientId: 'recipient-1',
          recipientName: 'Test User',
          platform: 'sms',
          identifier: '+1234567890',
          message: 'Test & message',
          scheduledTime: '2024-01-01T10:00:00.000Z',
          status: 'pending',
          createdAt: '2024-01-01T00:00:00.000Z',
        };
        const url = constructDeepLink(event);
        expect(url).toContain('Test%20%26%20message');
      });
    });

    describe('Instagram', () => {
      it('should construct Instagram deep link with username', () => {
        const event: ScheduledEvent = {
          id: 'test-1',
          recipientId: 'recipient-1',
          recipientName: 'Test User',
          platform: 'instagram',
          identifier: 'john_doe',
          message: 'Hello',
          scheduledTime: '2024-01-01T10:00:00.000Z',
          status: 'pending',
          createdAt: '2024-01-01T00:00:00.000Z',
        };
        const url = constructDeepLink(event);
        expect(url).toBe('instagram://user?username=john_doe');
      });

      it('should ignore message for Instagram', () => {
        const event: ScheduledEvent = {
          id: 'test-1',
          recipientId: 'recipient-1',
          recipientName: 'Test User',
          platform: 'instagram',
          identifier: 'john_doe',
          message: 'This message is ignored',
          scheduledTime: '2024-01-01T10:00:00.000Z',
          status: 'pending',
          createdAt: '2024-01-01T00:00:00.000Z',
        };
        const url = constructDeepLink(event);
        expect(url).toBe('instagram://user?username=john_doe');
      });
    });

    describe('Edge cases', () => {
      it('should handle long messages', () => {
        const longMessage = 'A'.repeat(500);
        const event: ScheduledEvent = {
          id: 'test-1',
          recipientId: 'recipient-1',
          recipientName: 'Test User',
          platform: 'whatsapp',
          identifier: '+1234567890',
          message: longMessage,
          scheduledTime: '2024-01-01T10:00:00.000Z',
          status: 'pending',
          createdAt: '2024-01-01T00:00:00.000Z',
        };
        const url = constructDeepLink(event);
        expect(url).toContain(encodeURIComponent(longMessage));
      });

      it('should handle usernames with special characters', () => {
        const event: ScheduledEvent = {
          id: 'test-1',
          recipientId: 'recipient-1',
          recipientName: 'Test User',
          platform: 'instagram',
          identifier: 'user.name_123',
          message: '',
          scheduledTime: '2024-01-01T10:00:00.000Z',
          status: 'pending',
          createdAt: '2024-01-01T00:00:00.000Z',
        };
        const url = constructDeepLink(event);
        expect(url).toBe('instagram://user?username=user.name_123');
      });
    });
  });

  describe('validateDeepLink', () => {
    it('should validate WhatsApp URLs', () => {
      expect(validateDeepLink('whatsapp://send?phone=+1234567890&text=Hello')).toBe(true);
    });

    it('should validate SMS URLs', () => {
      expect(validateDeepLink('sms:+1234567890?body=Hello')).toBe(true);
    });

    it('should validate Instagram URLs', () => {
      expect(validateDeepLink('instagram://user?username=john_doe')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateDeepLink('invalid://url')).toBe(false);
      expect(validateDeepLink('http://example.com')).toBe(false);
    });

    it('should reject URLs exceeding max length', () => {
      const longUrl = 'whatsapp://send?phone=+1234567890&text=' + 'A'.repeat(3000);
      expect(validateDeepLink(longUrl)).toBe(false);
    });
  });
});
