import * as fc from 'fast-check';
import { recipientArbitrary } from '../helpers/arbitraries';
import * as StorageService from '../../services/StorageService';
import { clearMockStorage } from '../setup';

/**
 * Property 1: Recipient Persistence Round-Trip
 * 
 * For any valid Recipient object, serializing to JSON, persisting to storage,
 * and then deserializing SHALL produce an equivalent Recipient with all fields preserved.
 */
describe('Property 1: Recipient Persistence Round-Trip', () => {
  beforeEach(async () => {
    clearMockStorage();
    await StorageService.clearAllData();
  });

  afterEach(async () => {
    clearMockStorage();
    await StorageService.clearAllData();
  });

  it('should preserve all recipient fields through save/load cycle', async () => {
    await fc.assert(
      fc.asyncProperty(recipientArbitrary, async (recipient) => {
        // Save recipient
        await StorageService.saveRecipient(recipient);

        // Load recipient
        const loaded = await StorageService.getRecipient(recipient.id);

        // Verify all fields match
        expect(loaded).not.toBeNull();
        expect(loaded).toEqual(recipient);
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve all recipients through bulk save/load cycle', async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(recipientArbitrary, { minLength: 1, maxLength: 20 }), async (recipients) => {
        // Clear storage before each iteration
        clearMockStorage();
        await StorageService.clearAllData();
        
        // Save all recipients
        for (const recipient of recipients) {
          await StorageService.saveRecipient(recipient);
        }

        // Load all recipients
        const loaded = await StorageService.getAllRecipients();

        // Verify count matches
        expect(loaded).toHaveLength(recipients.length);

        // Verify each recipient exists and matches
        for (const original of recipients) {
          const found = loaded.find((r) => r.id === original.id);
          expect(found).toEqual(original);
        }
      }),
      { numRuns: 50 }
    );
  });
});
