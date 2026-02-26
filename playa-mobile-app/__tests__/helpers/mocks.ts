import { Recipient, ScheduledEvent, Platform, ScheduleConfig } from '../../types';

export function createMockRecipient(overrides?: Partial<Recipient>): Recipient {
  return {
    id: 'test-recipient-id',
    name: 'Test User',
    platform: 'whatsapp' as Platform,
    identifier: '+1234567890',
    scheduleConfig: {
      mode: 'random',
      frequency: 3,
    } as ScheduleConfig,
    messagePool: ['Hello', 'Hi there', 'Hey'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockEvent(overrides?: Partial<ScheduledEvent>): ScheduledEvent {
  return {
    id: 'test-event-id',
    recipientId: 'test-recipient-id',
    recipientName: 'Test User',
    platform: 'whatsapp' as Platform,
    identifier: '+1234567890',
    message: 'Hello',
    scheduledTime: new Date().toISOString(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}
