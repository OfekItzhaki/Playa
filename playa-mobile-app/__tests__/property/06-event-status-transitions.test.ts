import * as fc from 'fast-check';
import { scheduledEventArbitrary } from '../helpers/arbitraries';
import { useEventStore } from '../../stores/EventStore';
import * as StorageService from '../../services/StorageService';

/**
 * Property 11: Event Status Transitions
 * 
 * Valid status transitions:
 * - pending → sent (when user triggers or notification fires)
 * - pending → cancelled (when user deletes)
 * Invalid transitions (should be rejected):
 * - sent → pending
 * - cancelled → pending
 * - cancelled → sent
 */
describe('Property 11: Event Status Transitions', () => {
  beforeEach(async () => {
    useEventStore.getState().clearEvents();
    await StorageService.clearAllData();
  });

  it('should allow pending → sent transition', async () => {
    await fc.assert(
      fc.asyncProperty(
        scheduledEventArbitrary.map((e) => ({ ...e, status: 'pending' as const })),
        async (event) => {
          // Add event using store API
          await useEventStore.getState().addEvents([event]);

          // Transition to sent
          await useEventStore.getState().updateEvent(event.id, { status: 'sent', executedAt: new Date().toISOString() });

          // Verify transition succeeded
          const updatedEvent = useEventStore.getState().events[event.id];
          expect(updatedEvent.status).toBe('sent');
          expect(updatedEvent.executedAt).toBeDefined();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should allow pending → cancelled transition', async () => {
    await fc.assert(
      fc.asyncProperty(
        scheduledEventArbitrary.map((e) => ({ ...e, status: 'pending' as const })),
        async (event) => {
          // Add event using store API
          await useEventStore.getState().addEvents([event]);

          // Transition to cancelled
          await useEventStore.getState().updateEvent(event.id, { status: 'cancelled' });

          // Verify transition succeeded
          const updatedEvent = useEventStore.getState().events[event.id];
          expect(updatedEvent.status).toBe('cancelled');
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should maintain sent status (no backwards transitions)', async () => {
    await fc.assert(
      fc.asyncProperty(
        scheduledEventArbitrary.map((e) => ({ 
          ...e, 
          status: 'sent' as const,
          executedAt: new Date().toISOString()
        })),
        async (event) => {
          // Add event in sent state using store API
          await useEventStore.getState().addEvents([event]);

          // Attempt to transition back to pending (should not change)
          await useEventStore.getState().updateEvent(event.id, { status: 'pending' });

          // Verify status remains sent
          const updatedEvent = useEventStore.getState().events[event.id];
          expect(updatedEvent.status).toBe('sent');
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should maintain cancelled status (no backwards transitions)', async () => {
    await fc.assert(
      fc.asyncProperty(
        scheduledEventArbitrary.map((e) => ({ ...e, status: 'cancelled' as const })),
        async (event) => {
          // Add event in cancelled state using store API
          await useEventStore.getState().addEvents([event]);

          // Attempt to transition to pending (should not change)
          await useEventStore.getState().updateEvent(event.id, { status: 'pending' });

          // Verify status remains cancelled
          const updatedEvent = useEventStore.getState().events[event.id];
          expect(updatedEvent.status).toBe('cancelled');
        }
      ),
      { numRuns: 50 }
    );
  });
});
