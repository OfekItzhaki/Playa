import * as fc from 'fast-check';
import { recipientArbitrary, scheduledEventArbitrary } from '../helpers/arbitraries';
import { generateEventsForRecipient } from '../../services/SchedulingService';

/**
 * Property 8: Unique Event Identifiers
 * Property 9: No Duplicate Events Per Recipient-Time
 * Property 10: Initial Event Status
 * Property 12: Chronological Event Sorting
 */
describe('Event Properties', () => {
  describe('Property 8: Unique Event Identifiers', () => {
    it('should generate unique IDs for all events', () => {
      fc.assert(
        fc.property(
          fc.array(recipientArbitrary.filter((r) => r.messagePool.length > 0), { minLength: 5, maxLength: 20 }),
          fc.integer({ min: 1704067200000, max: 1735689599000 }).map((ts) => new Date(ts)),
          (recipients, date) => {
            const allEvents = recipients.flatMap((recipient) =>
              generateEventsForRecipient(recipient, date)
            );

            const ids = allEvents.map((e) => e.id);
            const uniqueIds = new Set(ids);

            // Verify no duplicate IDs
            expect(uniqueIds.size).toBe(ids.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9: No Duplicate Events Per Recipient-Time', () => {
    it('should not create duplicate events for same recipient and time', () => {
      fc.assert(
        fc.property(
          recipientArbitrary.filter((r) => r.messagePool.length > 0),
          fc.integer({ min: 1704067200000, max: 1735689599000 }).map((ts) => new Date(ts)),
          (recipient, date) => {
            const events = generateEventsForRecipient(recipient, date);

            // Create map of recipient-time combinations
            const recipientTimePairs = events.map((e) => `${e.recipientId}-${e.scheduledTime}`);
            const uniquePairs = new Set(recipientTimePairs);

            // Verify no duplicates
            expect(uniquePairs.size).toBe(recipientTimePairs.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10: Initial Event Status', () => {
    it('should set all new events to pending status', () => {
      fc.assert(
        fc.property(
          recipientArbitrary.filter((r) => r.messagePool.length > 0),
          fc.integer({ min: 1704067200000, max: 1735689599000 }).map((ts) => new Date(ts)),
          (recipient, date) => {
            const events = generateEventsForRecipient(recipient, date);

            for (const event of events) {
              expect(event.status).toBe('pending');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 12: Chronological Event Sorting', () => {
    it('should maintain chronological order when sorted by scheduledTime', () => {
      fc.assert(
        fc.property(
          fc.array(scheduledEventArbitrary, { minLength: 2, maxLength: 50 }),
          (events) => {
            // Sort events by scheduledTime
            const sorted = [...events].sort(
              (a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
            );

            // Verify pairwise ordering
            for (let i = 0; i < sorted.length - 1; i++) {
              const currentTime = new Date(sorted[i].scheduledTime).getTime();
              const nextTime = new Date(sorted[i + 1].scheduledTime).getTime();
              expect(currentTime).toBeLessThanOrEqual(nextTime);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
