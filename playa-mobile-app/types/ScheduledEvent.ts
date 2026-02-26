import { Platform } from './Recipient';

export type EventStatus = 'pending' | 'sent' | 'cancelled';

export interface ScheduledEvent {
  id: string; // UUID v4
  recipientId: string; // Foreign key to Recipient
  recipientName: string; // Denormalized for display
  platform: Platform; // Denormalized for display
  identifier: string; // Denormalized for deep linking
  message: string; // Selected from message pool
  scheduledTime: string; // ISO 8601 datetime
  status: EventStatus;
  notificationId?: string; // Platform notification identifier
  createdAt: string; // ISO 8601
  executedAt?: string; // ISO 8601, when status changed to 'sent'
}
