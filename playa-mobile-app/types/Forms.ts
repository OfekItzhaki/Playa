import { Platform } from './Recipient';
import { ScheduleConfig } from './ScheduleConfig';

export interface RecipientFormData {
  name: string;
  platform: Platform;
  identifier: string;
  scheduleConfig: ScheduleConfig;
  messagePool: string[];
}

export interface RecipientFormErrors {
  name?: string;
  identifier?: string;
  scheduleConfig?: string;
  messagePool?: string;
}

export interface CloneOptions {
  sourceRecipientId: string;
  copyScheduleConfig: boolean;
  copyMessagePool: boolean;
}
