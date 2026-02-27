import * as StorageService from '../../../services/StorageService';
import { Recipient, ScheduledEvent } from '../../../types';

describe('StorageService', () => {
  beforeEach(async () => {
    await StorageService.clearAllData();
  });

  afterEach(async () => {
    await StorageService.clearAllData();
  });

  describe('Recipient Operations', () => {
    const mockRecipient: Recipient = {
      id: 'test-id-1',
      name: 'Test User',
      platform: 'whatsapp',
      identifier: '+1234567890',
      scheduleConfig: { mode: 'random', frequency: 3 },
      messagePool: ['Hello', 'Hi there'],
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    it('should save and retrieve a recipient', async () => {
      await StorageService.saveRecipient(mockRecipient);
      const retrieved = await StorageService.getRecipient(mockRecipient.id);
      expect(retrieved).toEqual(mockRecipient);
    });

    it('should return null for non-existent recipient', async () => {
      const retrieved = await StorageService.getRecipient('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should get all recipients', async () => {
      const recipient2 = { ...mockRecipient, id: 'test-id-2', name: 'User 2' };
      await StorageService.saveRecipient(mockRecipient);
      await StorageService.saveRecipient(recipient2);

      const all = await StorageService.getAllRecipients();
      expect(all).toHaveLength(2);
      expect(all).toContainEqual(mockRecipient);
      expect(all).toContainEqual(recipient2);
    });

    it('should delete a recipient', async () => {
      await StorageService.saveRecipient(mockRecipient);
      await StorageService.deleteRecipient(mockRecipient.id);
      const retrieved = await StorageService.getRecipient(mockRecipient.id);
      expect(retrieved).toBeNull();
    });
  });

  describe('Event Operations', () => {
    const mockEvent: ScheduledEvent = {
      id: 'event-1',
      recipientId: 'recipient-1',
      recipientName: 'Test User',
      platform: 'whatsapp',
      identifier: '+1234567890',
      message: 'Test message',
      scheduledTime: '2024-01-01T10:00:00.000Z',
      status: 'pending',
      createdAt: '2024-01-01T00:00:00.000Z',
    };

    it('should save and retrieve an event', async () => {
      await StorageService.saveEvent(mockEvent);
      const retrieved = await StorageService.getEvent(mockEvent.id);
      expect(retrieved).toEqual(mockEvent);
    });

    it('should get all events', async () => {
      const event2 = { ...mockEvent, id: 'event-2' };
      await StorageService.saveEvent(mockEvent);
      await StorageService.saveEvent(event2);

      const all = await StorageService.getAllEvents();
      expect(all).toHaveLength(2);
    });

    it('should get events by date', async () => {
      const event2 = { ...mockEvent, id: 'event-2', scheduledTime: '2024-01-02T10:00:00.000Z' };
      await StorageService.saveEvent(mockEvent);
      await StorageService.saveEvent(event2);

      const events = await StorageService.getEventsByDate('2024-01-01');
      expect(events).toHaveLength(1);
      expect(events[0].id).toBe('event-1');
    });

    it('should delete an event', async () => {
      await StorageService.saveEvent(mockEvent);
      await StorageService.deleteEvent(mockEvent.id);
      const retrieved = await StorageService.getEvent(mockEvent.id);
      expect(retrieved).toBeNull();
    });

    it('should save multiple events', async () => {
      const events = [
        mockEvent,
        { ...mockEvent, id: 'event-2' },
        { ...mockEvent, id: 'event-3' },
      ];
      await StorageService.saveEvents(events);

      const all = await StorageService.getAllEvents();
      expect(all).toHaveLength(3);
    });

    it('should delete events by recipient', async () => {
      const event2 = { ...mockEvent, id: 'event-2', recipientId: 'recipient-2' };
      await StorageService.saveEvent(mockEvent);
      await StorageService.saveEvent(event2);

      await StorageService.deleteEventsByRecipient('recipient-1');

      const all = await StorageService.getAllEvents();
      expect(all).toHaveLength(1);
      expect(all[0].recipientId).toBe('recipient-2');
    });
  });

  describe('Export/Import', () => {
    it('should export and import data', async () => {
      const recipient: Recipient = {
        id: 'test-id',
        name: 'Test User',
        platform: 'whatsapp',
        identifier: '+1234567890',
        scheduleConfig: { mode: 'random', frequency: 3 },
        messagePool: ['Hello'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      await StorageService.saveRecipient(recipient);
      const exported = await StorageService.exportData();
      
      await StorageService.clearAllData();
      await StorageService.importData(exported);

      const imported = await StorageService.getRecipient('test-id');
      expect(imported).toEqual(recipient);
    });
  });
});
