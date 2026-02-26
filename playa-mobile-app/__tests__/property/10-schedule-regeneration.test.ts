import * as fc from 'fast-check';
import { recipientArbitrary, scheduleConfigArbitrary } from '../helpers/arbitraries';
import { generateEventsForRecipient } from '../../services/SchedulingService';

/**
 * Property 13: Schedule Config Change Regeneration
 * 
 * For any Recipient, when the ScheduleConfig is modified, all pending ScheduledEvents
 * for that Recipient SHALL be removed and new events SHALL be generated matching
 * the new configuration.
 */
describe('Property 13: Schedule Config Change Regeneration', () => {
  it('should generate events matching new config', () => {
    fc.assert(
      fc.property(
        recipientArbitrary.filter((r) => r.messagePool.length > 0).map((r) => ({ ...r, isActive: true })),
        scheduleConfigArbitrary,
        fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
        (recipient, newScheduleConfig, date) => {
          // Generate initial events
          const initialEvents = generateEventsForRecipient(recipient, date);
          const initialCount = initialEvents.length;

          // Update recipient with new schedule config
          const updatedRecipient = {
            ...recipient,
            scheduleConfig: newScheduleConfig,
          };

          // Generate new events with updated config
          const newEvents = generateEventsForRecipient(updatedRecipient, date);

          // Verify new events match new config
          const expectedCount =
            newScheduleConfig.mode === 'random'
              ? newScheduleConfig.frequency
              : newScheduleConfig.fixedTimes.length;

          expect(newEvents).toHaveLength(expectedCount);

          // Verify new events have correct schedule config
          if (newScheduleConfig.mode === 'fixed') {
            for (const fixedTime of newScheduleConfig.fixedTimes) {
              const [hours, minutes] = fixedTime.split(':').map(Number);
              const matchingEvent = newEvents.find((e) => {
                const eventDate = new Date(e.scheduledTime);
                return eventDate.getHours() === hours && eventDate.getMinutes() === minutes;
              });
              expect(matchingEvent).toBeDefined();
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should generate different event counts for different configs', () => {
    fc.assert(
      fc.property(
        recipientArbitrary.filter((r) => r.messagePool.length > 0 && r.scheduleConfig.mode === 'random').map((r) => ({ ...r, isActive: true })),
        fc.integer({ min: 1, max: 10 }),
        fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
        (recipient, newFrequency, date) => {
          // Skip if frequency is the same
          if (recipient.scheduleConfig.mode === 'random' && recipient.scheduleConfig.frequency === newFrequency) {
            return true;
          }

          // Generate initial events
          const initialEvents = generateEventsForRecipient(recipient, date);

          // Update with new frequency
          const updatedRecipient = {
            ...recipient,
            scheduleConfig: {
              mode: 'random' as const,
              frequency: newFrequency,
            },
          };

          // Generate new events
          const newEvents = generateEventsForRecipient(updatedRecipient, date);

          // Verify count matches new frequency
          expect(newEvents).toHaveLength(newFrequency);

          // If frequencies are different, counts should be different
          if (recipient.scheduleConfig.mode === 'random' && recipient.scheduleConfig.frequency !== newFrequency) {
            expect(newEvents.length).not.toBe(initialEvents.length);
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});
