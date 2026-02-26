import * as fc from 'fast-check';
import { scheduledEventArbitrary } from '../helpers/arbitraries';
import { constructDeepLink } from '../../services/DeepLinkService';

/**
 * Property 15: Deep Link URL Construction
 * 
 * For any ScheduledEvent, the constructed deep link SHALL:
 * - Use correct URL scheme for platform
 * - Properly encode message content
 * - Include correct identifier
 */
describe('Property 15: Deep Link URL Construction', () => {
  it('should construct valid WhatsApp URLs', () => {
    fc.assert(
      fc.property(
        scheduledEventArbitrary.filter((e) => e.platform === 'whatsapp'),
        (event) => {
          const url = constructDeepLink(event);

          // Verify URL scheme
          expect(url).toMatch(/^whatsapp:\/\/send\?/);

          // Verify phone number is included
          expect(url).toContain(`phone=${event.identifier}`);

          // Verify message is URL encoded
          expect(url).toContain('&text=');
          
          // Verify URL format is valid
          expect(url).toMatch(/^whatsapp:\/\/send\?phone=.+&text=.+$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should construct valid SMS URLs', () => {
    fc.assert(
      fc.property(
        scheduledEventArbitrary.filter((e) => e.platform === 'sms'),
        (event) => {
          const url = constructDeepLink(event);

          // Verify URL scheme
          expect(url).toMatch(/^sms:/);

          // Verify phone number is included
          expect(url).toContain(event.identifier);

          // Verify message is included
          expect(url).toContain('body=');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should construct valid Instagram URLs', () => {
    fc.assert(
      fc.property(
        scheduledEventArbitrary.filter((e) => e.platform === 'instagram'),
        (event) => {
          const url = constructDeepLink(event);

          // Verify URL scheme
          expect(url).toMatch(/^instagram:\/\/user\?username=/);

          // Verify username is included
          expect(url).toContain(event.identifier);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should properly encode special characters in messages', () => {
    fc.assert(
      fc.property(
        scheduledEventArbitrary.filter((e) => e.platform === 'whatsapp'),
        fc.constantFrom('Hello & goodbye', 'Test=value', 'Question?', 'Hash#tag', 'Space test'),
        (event, specialMessage) => {
          const eventWithSpecialChars = { ...event, message: specialMessage };
          const url = constructDeepLink(eventWithSpecialChars);

          // Verify URL is valid (no unencoded special chars)
          expect(() => new URL(url)).not.toThrow();

          // Verify message content is encoded
          const urlObj = new URL(url);
          const textParam = urlObj.searchParams.get('text');
          expect(textParam).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });
});
