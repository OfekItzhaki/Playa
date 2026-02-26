import * as fc from 'fast-check';
import { recipientArbitrary } from '../helpers/arbitraries';
import { generateEventsForRecipient } from '../../services/SchedulingService';

/**
 * Property 3: Random Schedule Time Bounds
 * Property 4: Fixed Schedule Time Matching
 * Property 5: Message Pool Membership
 * Property 6: Empty Message Pool Constraint
 */
describe('Scheduling Algorithm Properties', () => {
  describe('Property 3: Random Schedule Time Bounds', () => {
    it('should generate events within 09:00-21:00 for random mode', () => {
      fc.assert(
        fc.property(
          recipientArbitrary.filter((r) => r.scheduleConfig.mode === 'random' && r.messagePool.length > 0),
          fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
          (recipient, date) => {
            const events = generateEventsForRecipient(recipient, date);

            for (const event of events) {
              const eventDate = new Date(event.scheduledTime);
              const hours = eventDate.getHours();
              const minutes = eventDate.getMinutes();

              // Verify time is between 09:00 and 21:00
              const timeInMinutes = hours * 60 + minutes;
              expect(timeInMinutes).toBeGreaterThanOrEqual(9 * 60); // 09:00
              expect(timeInMinutes).toBeLessThanOrEqual(21 * 60); // 21:00
            }

            // Verify count matches frequency
            if (recipient.scheduleConfig.mode === 'random') {
              expect(events).toHaveLength(recipient.scheduleConfig.frequency);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 4: Fixed Schedule Time Matching', () => {
    it('should generate exactly one event per fixed time', () => {
      fc.assert(
        fc.property(
          recipientArbitrary.filter((r) => r.scheduleConfig.mode === 'fixed' && r.messagePool.length > 0),
          fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
          (recipient, date) => {
            const events = generateEventsForRecipient(recipient, date);

            if (recipient.scheduleConfig.mode === 'fixed') {
              // Verify count matches fixed times count
              expect(events).toHaveLength(recipient.scheduleConfig.fixedTimes.length);

              // Verify each fixed time has exactly one event
              for (const fixedTime of recipient.scheduleConfig.fixedTimes) {
                const [hours, minutes] = fixedTime.split(':').map(Number);
                const matchingEvents = events.filter((event) => {
                  const eventDate = new Date(event.scheduledTime);
                  return eventDate.getHours() === hours && eventDate.getMinutes() === minutes;
                });

                expect(matchingEvents).toHaveLength(1);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5: Message Pool Membership', () => {
    it('should only use messages from recipient message pool', () => {
      fc.assert(
        fc.property(
          recipientArbitrary.filter((r) => r.messagePool.length > 0),
          fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
          (recipient, date) => {
            const events = generateEventsForRecipient(recipient, date);

            for (const event of events) {
              expect(recipient.messagePool).toContain(event.message);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 6: Empty Message Pool Constraint', () => {
    it('should generate zero events for empty message pool', () => {
      fc.assert(
        fc.property(
          recipientArbitrary.map((r) => ({ ...r, messagePool: [] })),
          fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
          (recipient, date) => {
            const events = generateEventsForRecipient(recipient, date);
            expect(events).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
