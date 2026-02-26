import { ScheduleConfig } from './ScheduleConfig';

export type Platform = 'whatsapp' | 'sms' | 'instagram';

export interface Recipient {
  id: string; // UUID v4
  name: string; // Non-empty, max 100 chars
  platform: Platform;
  identifier: string; // Phone (E.164) or Instagram username
  scheduleConfig: ScheduleConfig;
  messagePool: string[]; // Array of message templates
  isActive: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
