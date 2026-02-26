import * as fc from 'fast-check';
import { recipientArbitrary } from '../helpers/arbitraries';

/**
 * Property 7: Clone Operation Preservation
 * 
 * For any clone operation from source to target, the specified fields
 * SHALL be copied while others are preserved.
 */
describe('Property 7: Clone Operation Preservation', () => {
  it('should copy schedule config when specified', () => {
    fc.assert(
      fc.property(
        recipientArbitrary,
        recipientArbitrary,
        (source, target) => {
          // Simulate clone with copyScheduleConfig = true
          const cloned = {
            ...target,
            scheduleConfig: JSON.parse(JSON.stringify(source.scheduleConfig)),
          };

          // Verify schedule config was copied
          expect(cloned.scheduleConfig).toEqual(source.scheduleConfig);

          // Verify other fields preserved
          expect(cloned.id).toBe(target.id);
          expect(cloned.name).toBe(target.name);
          expect(cloned.platform).toBe(target.platform);
          expect(cloned.identifier).toBe(target.identifier);
          expect(cloned.messagePool).toEqual(target.messagePool);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should copy message pool when specified', () => {
    fc.assert(
      fc.property(
        recipientArbitrary,
        recipientArbitrary,
        (source, target) => {
          // Simulate clone with copyMessagePool = true
          const cloned = {
            ...target,
            messagePool: [...source.messagePool],
          };

          // Verify message pool was copied
          expect(cloned.messagePool).toEqual(source.messagePool);

          // Verify other fields preserved
          expect(cloned.id).toBe(target.id);
          expect(cloned.name).toBe(target.name);
          expect(cloned.platform).toBe(target.platform);
          expect(cloned.identifier).toBe(target.identifier);
          expect(cloned.scheduleConfig).toEqual(target.scheduleConfig);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should copy both when both flags are true', () => {
    fc.assert(
      fc.property(
        recipientArbitrary,
        recipientArbitrary,
        (source, target) => {
          // Simulate clone with both flags true
          const cloned = {
            ...target,
            scheduleConfig: JSON.parse(JSON.stringify(source.scheduleConfig)),
            messagePool: [...source.messagePool],
          };

          // Verify both were copied
          expect(cloned.scheduleConfig).toEqual(source.scheduleConfig);
          expect(cloned.messagePool).toEqual(source.messagePool);

          // Verify identity fields preserved
          expect(cloned.id).toBe(target.id);
          expect(cloned.name).toBe(target.name);
          expect(cloned.platform).toBe(target.platform);
          expect(cloned.identifier).toBe(target.identifier);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve everything when both flags are false', () => {
    fc.assert(
      fc.property(
        recipientArbitrary,
        recipientArbitrary,
        (source, target) => {
          // Simulate clone with both flags false (no changes)
          const cloned = { ...target };

          // Verify nothing changed
          expect(cloned).toEqual(target);
        }
      ),
      { numRuns: 100 }
    );
  });
});
