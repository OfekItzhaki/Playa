import * as fc from 'fast-check';
import { recipientArbitrary, scheduledEventArbitrary } from '../helpers/arbitraries';
import * as StorageService from '../../services/StorageService';
import { clearMockStorage } from '../setup';

/**
 * Property 16: Data Export/Import Round-Trip
 * 
 * For any complete application state, exporting to JSON and then importing
 * SHALL restore the exact same state with all data preserved.
 */
describe('Property 16: Data Export/Import Round-Trip', () => {
  beforeEach(async () => {
    clearMockStorage();
    await StorageService.clearAllData();
  });

  afterEach(async () => {
    clearMockStorage();
    await StorageService.clearAllData();
  });

  it('should preserve all data through export/import cycle', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(recipientArbitrary, { minLength: 1, maxLength: 10 }),
        fc.array(scheduledEventArbitrary, { minLength: 1, maxLength: 20 }),
        async (recipients, events) => {
          // Clear storage before each iteration
          clearMockStorage();
          await StorageService.clearAllData();
          
          // Save initial state
          for (const recipient of recipients) {
            await StorageService.saveRecipient(recipient);
          }
          for (const event of events) {
            await StorageService.saveEvent(event);
          }

          // Export data
          const exportedData = await StorageService.exportData();

          // Verify export is valid JSON
          expect(() => JSON.parse(exportedData)).not.toThrow();

          // Clear all data
          await StorageService.clearAllData();

          // Verify data is cleared
          const emptyRecipients = await StorageService.getAllRecipients();
          const emptyEvents = await StorageService.getAllEvents();
          expect(emptyRecipients).toHaveLength(0);
          expect(emptyEvents).toHaveLength(0);

          // Import data
          await StorageService.importData(exportedData);

          // Load imported data
          const importedRecipients = await StorageService.getAllRecipients();
          const importedEvents = await StorageService.getAllEvents();

          // Verify counts match
          expect(importedRecipients).toHaveLength(recipients.length);
          expect(importedEvents).toHaveLength(events.length);

          // Verify each recipient matches
          for (const original of recipients) {
            const imported = importedRecipients.find((r) => r.id === original.id);
            expect(imported).toEqual(original);
          }

          // Verify each event matches
          for (const original of events) {
            const imported = importedEvents.find((e) => e.id === original.id);
            expect(imported).toEqual(original);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle empty state export/import', async () => {
    // Export empty state
    const exportedData = await StorageService.exportData();

    // Verify export is valid JSON
    const parsed = JSON.parse(exportedData);
    expect(parsed.recipients).toEqual({});
    expect(parsed.events).toEqual({});

    // Import empty state
    await StorageService.importData(exportedData);

    // Verify still empty
    const recipients = await StorageService.getAllRecipients();
    const events = await StorageService.getAllEvents();
    expect(recipients).toHaveLength(0);
    expect(events).toHaveLength(0);
  });
});
