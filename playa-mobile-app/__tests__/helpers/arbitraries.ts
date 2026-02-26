import * as fc from 'fast-check';
import { Recipient, ScheduledEvent, ScheduleConfig, Platform } from '../../types';

// Generate valid phone numbers in E.164 format
export const phoneArbitrary = fc
  .string({ minLength: 10, maxLength: 15 })
  .map((s) => '+' + s.replace(/\D/g, '').slice(0, 14))
  .filter((s) => /^\+[1-9]\d{1,14}$/.test(s));

// Generate valid Instagram usernames
export const instagramUsernameArbitrary = fc.stringMatching(/^[a-zA-Z0-9._]{1,30}$/);

// Generate valid message templates
export const messageArbitrary = fc.string({ minLength: 1, maxLength: 500 });

// Generate schedule configs
export const scheduleConfigArbitrary: fc.Arbitrary<ScheduleConfig> = fc.oneof(
  // Random mode
  fc.record({
    mode: fc.constant('random' as const),
    frequency: fc.integer({ min: 1, max: 10 }),
  }),
  // Fixed mode
  fc.record({
    mode: fc.constant('fixed' as const),
    fixedTimes: fc
      .array(
        fc
          .integer({ min: 0, max: 23 })
          .chain((hour) =>
            fc
              .integer({ min: 0, max: 59 })
              .map(
                (minute) =>
                  `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
              )
          ),
        { minLength: 1, maxLength: 10 }
      )
      .map((times) => Array.from(new Set(times))), // Remove duplicates
  })
);

// Generate platform
export const platformArbitrary: fc.Arbitrary<Platform> = fc.oneof(
  fc.constant('whatsapp' as const),
  fc.constant('sms' as const),
  fc.constant('instagram' as const)
);

// Generate complete recipients
export const recipientArbitrary: fc.Arbitrary<Recipient> = fc
  .record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    platform: platformArbitrary,
    scheduleConfig: scheduleConfigArbitrary,
    messagePool: fc.array(messageArbitrary, { minLength: 1, maxLength: 20 }),
    isActive: fc.boolean(),
    createdAt: fc.integer({ min: 1577836800000, max: 1893456000000 }).map((ts) => new Date(ts).toISOString()),
    updatedAt: fc.integer({ min: 1577836800000, max: 1893456000000 }).map((ts) => new Date(ts).toISOString()),
  })
  .chain((partial) =>
    fc
      .tuple(
        partial.platform === 'instagram' ? instagramUsernameArbitrary : phoneArbitrary,
        fc.constant(partial)
      )
      .map(([identifier, rest]) => ({
        ...rest,
        identifier,
      }))
  );

// Generate scheduled events
export const scheduledEventArbitrary: fc.Arbitrary<ScheduledEvent> = fc
  .record({
    id: fc.uuid(),
    recipientId: fc.uuid(),
    recipientName: fc.string({ minLength: 1, maxLength: 100 }),
    platform: platformArbitrary,
    message: messageArbitrary,
    scheduledTime: fc.integer({ min: 1704067200000, max: 1893456000000 }).map((ts) => new Date(ts).toISOString()),
    status: fc.oneof(
      fc.constant('pending' as const),
      fc.constant('sent' as const),
      fc.constant('cancelled' as const)
    ),
    notificationId: fc.option(fc.uuid(), { nil: undefined }),
    createdAt: fc.integer({ min: 1577836800000, max: 1893456000000 }).map((ts) => new Date(ts).toISOString()),
    executedAt: fc.option(fc.integer({ min: 1577836800000, max: 1893456000000 }).map((ts) => new Date(ts).toISOString()), { nil: undefined }),
  })
  .chain((partial) =>
    fc
      .tuple(
        partial.platform === 'instagram' ? instagramUsernameArbitrary : phoneArbitrary,
        fc.constant(partial)
      )
      .map(([identifier, rest]) => ({
        ...rest,
        identifier,
      }))
  );
