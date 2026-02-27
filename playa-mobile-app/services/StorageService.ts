import { createMMKV } from 'react-native-mmkv';
import { Recipient, ScheduledEvent, StorageSchema } from '../types';

// Initialize MMKV storage
const storage = createMMKV({
  id: 'playa-storage',
});

// Storage keys
const KEYS = {
  RECIPIENTS: 'recipients',
  EVENTS: 'events',
  METADATA: 'metadata',
};

// In-memory cache for performance
let recipientsCache: Record<string, Recipient> | null = null;
let eventsCache: Record<string, ScheduledEvent> | null = null;

class StorageError extends Error {
  constructor(message: string, public operation: string) {
    super(message);
    this.name = 'StorageError';
  }
}

// Helper functions
function parseJSON<T>(key: string, defaultValue: T): T {
  try {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (_error) {
    console.error(`Failed to parse JSON for key ${key}:`, _error);
    return defaultValue;
  }
}

function setJSON(key: string, value: unknown): void {
  try {
    storage.set(key, JSON.stringify(value));
  } catch (_error) {
    console.error(`Failed to set JSON for key ${key}:`, _error);
    throw new StorageError('Failed to save data. Please try again.', 'setJSON');
  }
}

// Recipient operations
export async function saveRecipient(recipient: Recipient): Promise<void> {
  try {
    const recipients = recipientsCache || parseJSON<Record<string, Recipient>>(KEYS.RECIPIENTS, {});
    recipients[recipient.id] = recipient;
    setJSON(KEYS.RECIPIENTS, recipients);
    recipientsCache = recipients;
  } catch (_error) {
    throw new StorageError('Failed to save recipient. Please try again.', 'saveRecipient');
  }
}

export async function getRecipient(id: string): Promise<Recipient | null> {
  try {
    const recipients = recipientsCache || parseJSON<Record<string, Recipient>>(KEYS.RECIPIENTS, {});
    recipientsCache = recipients;
    return recipients[id] || null;
  } catch (_error) {
    throw new StorageError('Failed to load recipient. Please try again.', 'getRecipient');
  }
}

export async function getAllRecipients(): Promise<Recipient[]> {
  try {
    const recipients = recipientsCache || parseJSON<Record<string, Recipient>>(KEYS.RECIPIENTS, {});
    recipientsCache = recipients;
    return Object.values(recipients);
  } catch (_error) {
    throw new StorageError('Failed to load recipients. Please try again.', 'getAllRecipients');
  }
}

export async function deleteRecipient(id: string): Promise<void> {
  try {
    const recipients = recipientsCache || parseJSON<Record<string, Recipient>>(KEYS.RECIPIENTS, {});
    delete recipients[id];
    setJSON(KEYS.RECIPIENTS, recipients);
    recipientsCache = recipients;
  } catch (_error) {
    throw new StorageError('Failed to delete recipient. Please try again.', 'deleteRecipient');
  }
}

// Event operations
export async function saveEvent(event: ScheduledEvent): Promise<void> {
  try {
    const events = eventsCache || parseJSON<Record<string, ScheduledEvent>>(KEYS.EVENTS, {});
    events[event.id] = event;
    setJSON(KEYS.EVENTS, events);
    eventsCache = events;
  } catch (_error) {
    throw new StorageError('Failed to save event. Please try again.', 'saveEvent');
  }
}

export async function getEvent(id: string): Promise<ScheduledEvent | null> {
  try {
    const events = eventsCache || parseJSON<Record<string, ScheduledEvent>>(KEYS.EVENTS, {});
    eventsCache = events;
    return events[id] || null;
  } catch (_error) {
    throw new StorageError('Failed to load event. Please try again.', 'getEvent');
  }
}

export async function getAllEvents(): Promise<ScheduledEvent[]> {
  try {
    const events = eventsCache || parseJSON<Record<string, ScheduledEvent>>(KEYS.EVENTS, {});
    eventsCache = events;
    return Object.values(events);
  } catch (_error) {
    throw new StorageError('Failed to load events. Please try again.', 'getAllEvents');
  }
}

export async function getEventsByDate(date: string): Promise<ScheduledEvent[]> {
  try {
    const events = await getAllEvents();
    return events.filter((event) => event.scheduledTime.startsWith(date));
  } catch (_error) {
    throw new StorageError('Failed to load events by date. Please try again.', 'getEventsByDate');
  }
}

export async function deleteEvent(id: string): Promise<void> {
  try {
    const events = eventsCache || parseJSON<Record<string, ScheduledEvent>>(KEYS.EVENTS, {});
    delete events[id];
    setJSON(KEYS.EVENTS, events);
    eventsCache = events;
  } catch (_error) {
    throw new StorageError('Failed to delete event. Please try again.', 'deleteEvent');
  }
}

// Bulk operations
export async function saveEvents(events: ScheduledEvent[]): Promise<void> {
  try {
    const existingEvents = eventsCache || parseJSON<Record<string, ScheduledEvent>>(KEYS.EVENTS, {});
    events.forEach((event) => {
      existingEvents[event.id] = event;
    });
    setJSON(KEYS.EVENTS, existingEvents);
    eventsCache = existingEvents;
  } catch (_error) {
    throw new StorageError('Failed to save events. Please try again.', 'saveEvents');
  }
}

export async function deleteEventsByRecipient(recipientId: string): Promise<void> {
  try {
    const events = eventsCache || parseJSON<Record<string, ScheduledEvent>>(KEYS.EVENTS, {});
    const filteredEvents: Record<string, ScheduledEvent> = {};
    
    Object.values(events).forEach((event) => {
      if (event.recipientId !== recipientId) {
        filteredEvents[event.id] = event;
      }
    });
    
    setJSON(KEYS.EVENTS, filteredEvents);
    eventsCache = filteredEvents;
  } catch (_error) {
    throw new StorageError('Failed to delete events. Please try again.', 'deleteEventsByRecipient');
  }
}

// Metadata operations
export async function getLastGenerationDate(): Promise<string | null> {
  try {
    const metadata = parseJSON<StorageSchema['metadata']>(KEYS.METADATA, {
      lastGenerationDate: '',
      version: '1.0.0',
    });
    return metadata.lastGenerationDate || null;
  } catch (_error) {
    return null;
  }
}

export async function setLastGenerationDate(date: string): Promise<void> {
  try {
    const metadata = parseJSON<StorageSchema['metadata']>(KEYS.METADATA, {
      lastGenerationDate: '',
      version: '1.0.0',
    });
    metadata.lastGenerationDate = date;
    setJSON(KEYS.METADATA, metadata);
  } catch (_error) {
    throw new StorageError('Failed to update metadata. Please try again.', 'setLastGenerationDate');
  }
}

// Export/Import operations
export async function exportData(): Promise<string> {
  try {
    const recipients = parseJSON<Record<string, Recipient>>(KEYS.RECIPIENTS, {});
    const events = parseJSON<Record<string, ScheduledEvent>>(KEYS.EVENTS, {});
    const metadata = parseJSON<StorageSchema['metadata']>(KEYS.METADATA, {
      lastGenerationDate: '',
      version: '1.0.0',
    });

    const data: StorageSchema = {
      recipients,
      events,
      metadata,
    };

    return JSON.stringify(data, null, 2);
  } catch (_error) {
    throw new StorageError('Failed to export data. Please try again.', 'exportData');
  }
}

export async function importData(jsonData: string): Promise<void> {
  try {
    const data: StorageSchema = JSON.parse(jsonData);

    // Validate structure
    if (!data.recipients || !data.events || !data.metadata) {
      throw new Error('Invalid data format');
    }

    // Clear existing data first
    await clearAllData();

    // Import data
    setJSON(KEYS.RECIPIENTS, data.recipients);
    setJSON(KEYS.EVENTS, data.events);
    setJSON(KEYS.METADATA, data.metadata);

    // Update cache with imported data
    recipientsCache = data.recipients;
    eventsCache = data.events;
  } catch (_error) {
    throw new StorageError('Failed to import data. Please check the file format.', 'importData');
  }
}

export async function clearAllData(): Promise<void> {
  try {
    storage.clearAll();
    recipientsCache = null;
    eventsCache = null;
  } catch (_error) {
    throw new StorageError('Failed to clear data. Please try again.', 'clearAllData');
  }
}

// Clear cache (useful for testing)
export function clearCache(): void {
  recipientsCache = null;
  eventsCache = null;
}

// Generic metadata operations
export async function getMetadata(key: string): Promise<string | null> {
  try {
    return storage.getString(key) || null;
  } catch (_error) {
    return null;
  }
}

export async function setMetadata(key: string, value: string): Promise<void> {
  try {
    storage.set(key, value);
  } catch (_error) {
    throw new StorageError('Failed to save metadata. Please try again.', 'setMetadata');
  }
}
