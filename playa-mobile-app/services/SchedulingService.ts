import { v4 as uuidv4 } from 'uuid';
import { Recipient, ScheduledEvent } from '../types';
import * as StorageService from './StorageService';

const SCHEDULE_START_HOUR = 9;
const SCHEDULE_END_HOUR = 21;
const MINUTES_IN_HOUR = 60;

export function generateRandomTimes(frequency: number, date: string): string[] {
  const totalMinutes = (SCHEDULE_END_HOUR - SCHEDULE_START_HOUR) * MINUTES_IN_HOUR;
  const offsets = new Set<number>();

  while (offsets.size < frequency) {
    const randomOffset = Math.floor(Math.random() * totalMinutes);
    offsets.add(randomOffset);
  }

  const times = Array.from(offsets)
    .sort((a, b) => a - b)
    .map((offset) => {
      const hour = SCHEDULE_START_HOUR + Math.floor(offset / MINUTES_IN_HOUR);
      const minute = offset % MINUTES_IN_HOUR;
      const dateObj = new Date(date);
      dateObj.setHours(hour, minute, 0, 0);
      return dateObj.toISOString();
    });

  return times;
}

export function generateEventsForRecipient(
  recipient: Recipient,
  date: Date
): ScheduledEvent[] {
  if (!recipient.isActive || recipient.messagePool.length === 0) {
    return [];
  }

  const { scheduleConfig, messagePool } = recipient;
  let times: string[] = [];

  const dateStr = date.toISOString().split('T')[0];

  if (scheduleConfig.mode === 'random' && scheduleConfig.frequency) {
    times = generateRandomTimes(scheduleConfig.frequency, dateStr);
  } else if (scheduleConfig.mode === 'fixed' && scheduleConfig.fixedTimes) {
    times = scheduleConfig.fixedTimes.map((time) => {
      const [hour, minute] = time.split(':').map(Number);
      const eventDate = new Date(date);
      eventDate.setHours(hour, minute, 0, 0);
      return eventDate.toISOString();
    });
  }

  const events: ScheduledEvent[] = [];
  const now = new Date().toISOString();

  for (const time of times) {
    const randomMessage = messagePool[Math.floor(Math.random() * messagePool.length)];

    events.push({
      id: uuidv4(),
      recipientId: recipient.id,
      recipientName: recipient.name,
      platform: recipient.platform,
      identifier: recipient.identifier,
      message: randomMessage,
      scheduledTime: time,
      status: 'pending',
      createdAt: now,
    });
  }

  return events;
}

export async function generateEventsForRecipientAsync(
  recipient: Recipient,
  date: string
): Promise<ScheduledEvent[]> {
  const dateObj = new Date(date);
  const events = generateEventsForRecipient(recipient, dateObj);

  // Filter out duplicates from storage
  const existingEvents = await StorageService.getEventsByDate(date);
  const existingKeys = new Set(
    existingEvents.map((e) => `${e.recipientId}-${e.scheduledTime}`)
  );

  return events.filter((e) => !existingKeys.has(`${e.recipientId}-${e.scheduledTime}`));
}

export async function generateDailyEvents(date: string): Promise<ScheduledEvent[]> {
  const recipients = await StorageService.getAllRecipients();
  const activeRecipients = recipients.filter((r) => r.isActive);

  const allEvents: ScheduledEvent[] = [];

  for (const recipient of activeRecipients) {
    const events = await generateEventsForRecipientAsync(recipient, date);
    allEvents.push(...events);
  }

  return allEvents;
}

export function validateScheduleConfig(recipient: Recipient): boolean {
  const { scheduleConfig } = recipient;

  if (scheduleConfig.mode === 'random') {
    return (
      scheduleConfig.frequency !== undefined &&
      scheduleConfig.frequency >= 1 &&
      scheduleConfig.frequency <= 10
    );
  }

  if (scheduleConfig.mode === 'fixed') {
    return (
      scheduleConfig.fixedTimes !== undefined &&
      scheduleConfig.fixedTimes.length > 0
    );
  }

  return false;
}

export function canGenerateEvents(recipient: Recipient): boolean {
  return (
    recipient.isActive &&
    recipient.messagePool.length > 0 &&
    validateScheduleConfig(recipient)
  );
}
