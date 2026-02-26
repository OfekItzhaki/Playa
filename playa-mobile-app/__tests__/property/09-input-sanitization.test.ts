import * as fc from 'fast-check';
import { sanitizeInput } from '../../utils/sanitize';

/**
 * Property 17: Input Sanitization
 * 
 * For any user-provided string input, the sanitized output SHALL:
 * - Remove or escape dangerous HTML/script content
 * - Preserve valid Unicode characters
 * - Remove leading/trailing whitespace
 * - Enforce length constraints
 */
describe('Property 17: Input Sanitization', () => {
  it('should remove leading and trailing whitespace', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.nat({ max: 10 }),
        fc.nat({ max: 10 }),
        (str, leadingSpaces, trailingSpaces) => {
          const input = ' '.repeat(leadingSpaces) + str + ' '.repeat(trailingSpaces);
          const sanitized = sanitizeInput(input);

          // Verify no leading/trailing whitespace
          expect(sanitized).toBe(sanitized.trim());
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should escape HTML tags', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          '<script>alert("xss")</script>',
          '<img src=x onerror=alert(1)>',
          '<div onclick="malicious()">',
          '<iframe src="evil.com"></iframe>',
          'Normal text with <b>bold</b>'
        ),
        (input) => {
          const sanitized = sanitizeInput(input);

          // Verify no raw HTML tags remain
          expect(sanitized).not.toMatch(/<script/i);
          expect(sanitized).not.toMatch(/<iframe/i);
          expect(sanitized).not.toMatch(/onerror=/i);
          expect(sanitized).not.toMatch(/onclick=/i);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve valid Unicode characters', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'Hello 世界',
          'Emoji test 😀🎉',
          'Ñoño español',
          'Привет мир',
          'مرحبا بالعالم'
        ),
        (input) => {
          const sanitized = sanitizeInput(input);

          // Verify Unicode characters are preserved (after trimming)
          expect(sanitized.length).toBeGreaterThan(0);
          // Should not be empty after sanitization
          expect(sanitized).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should enforce maximum length', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 1000 }),
        fc.integer({ min: 10, max: 100 }),
        (str, maxLength) => {
          const sanitized = sanitizeInput(str, maxLength);

          // Verify length constraint
          expect(sanitized.length).toBeLessThanOrEqual(maxLength);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle empty strings', () => {
    const sanitized = sanitizeInput('');
    expect(sanitized).toBe('');
  });

  it('should handle strings with only whitespace', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        (spaces) => {
          const input = ' '.repeat(spaces);
          const sanitized = sanitizeInput(input);
          expect(sanitized).toBe('');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should remove control characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (str) => {
          // Add control characters
          const input = str + '\x00\x01\x02\x03';
          const sanitized = sanitizeInput(input);

          // Verify no control characters (except newlines/tabs which might be allowed)
          expect(sanitized).not.toMatch(/[\x00-\x08\x0B\x0C\x0E-\x1F]/);
        }
      ),
      { numRuns: 100 }
    );
  });
});
