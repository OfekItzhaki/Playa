import { Recipient } from './Recipient';
import { ScheduledEvent } from './ScheduledEvent';

export interface StorageSchema {
  recipients: Record<string, Recipient>; // Keyed by ID
  events: Record<string, ScheduledEvent>; // Keyed by ID
  metadata: {
    lastGenerationDate: string; // ISO 8601 date
    version: string; // Schema version for migrations
  };
}
