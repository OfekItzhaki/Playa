import { Recipient, ScheduledEvent } from '../../types';

export const testRecipients: Recipient[] = [
  {
    id: '1',
    name: 'John Doe',
    platform: 'whatsapp',
    identifier: '+1234567890',
    scheduleConfig: { mode: 'random', frequency: 3 },
    messagePool: ['Hey!', 'How are you?', 'Thinking of you'],
    isActive: true,
    createdAt: '2026-02-26T00:00:00.000Z',
    updatedAt: '2026-02-26T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    platform: 'sms',
    identifier: '+9876543210',
    scheduleConfig: { mode: 'fixed', fixedTimes: ['09:00', '18:00'] },
    messagePool: ['Good morning!', 'Have a great day!'],
    isActive: true,
    createdAt: '2026-02-26T00:00:00.000Z',
    updatedAt: '2026-02-26T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    platform: 'instagram',
    identifier: 'bob_johnson',
    scheduleConfig: { mode: 'random', frequency: 2 },
    messagePool: ['Hey Bob!', 'What\'s up?'],
    isActive: true,
    createdAt: '2026-02-26T00:00:00.000Z',
    updatedAt: '2026-02-26T00:00:00.000Z',
  },
];

export const testEvents: ScheduledEvent[] = [
  {
    id: 'event-1',
    recipientId: '1',
    recipientName: 'John Doe',
    platform: 'whatsapp',
    identifier: '+1234567890',
    message: 'Hey!',
    scheduledTime: '2026-02-26T09:00:00.000Z',
    status: 'pending',
    createdAt: '2026-02-26T00:00:00.000Z',
  },
  {
    id: 'event-2',
    recipientId: '2',
    recipientName: 'Jane Smith',
    platform: 'sms',
    identifier: '+9876543210',
    message: 'Good morning!',
    scheduledTime: '2026-02-26T09:00:00.000Z',
    status: 'pending',
    createdAt: '2026-02-26T00:00:00.000Z',
  },
];
