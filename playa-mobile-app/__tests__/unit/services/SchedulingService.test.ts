import { generateRandomTimes, generateEventsForRecipient, canGenerateEvents } from '../../../services/SchedulingService';
import { Recipient } from '../../../types';

describe('SchedulingService', () => {
  describe('generateRandomTimes', () => {
    it('should generate correct number of times', () => {
      const times = generateRandomTimes(5, '2024-01-01');
      expect(times).toHaveLength(5);
    });

    it('should generate times in chronological order', () => {
      const times = generateRandomTimes(10, '2024-01-01');
      for (let i = 1; i < times.length; i++) {
        expect(new Date(times[i]).getTime()).toBeGreaterThan(new Date(times[i - 1]).getTime());
      }
    });

    it('should generate times between 09:00 and 21:00', () => {
      const times = generateRandomTimes(10, '2024-01-01');
      times.forEach((time) => {
        const date = new Date(time);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const timeInMinutes = hours * 60 + minutes;
        expect(timeInMinutes).toBeGreaterThanOrEqual(9 * 60);
        expect(timeInMinutes).toBeLessThanOrEqual(21 * 60);
      });
    });
  });

  describe('generateEventsForRecipient', () => {
    const mockRecipient: Recipient = {
      id: 'test-id',
      name: 'Test User',
      platform: 'whatsapp',
      identifier: '+1234567890',
      scheduleConfig: { mode: 'random', frequency: 3 },
      messagePool: ['Hello', 'Hi', 'Hey'],
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    it('should generate events for random mode', () => {
      const events = generateEventsForRecipient(mockRecipient, new Date('2024-01-01'));
      expect(events).toHaveLength(3);
      events.forEach((event) => {
        expect(event.recipientId).toBe(mockRecipient.id);
        expect(mockRecipient.messagePool).toContain(event.message);
        expect(event.status).toBe('pending');
      });
    });

    it('should generate events for fixed mode', () => {
      const fixedRecipient: Recipient = {
        ...mockRecipient,
        scheduleConfig: { mode: 'fixed', fixedTimes: ['09:00', '14:00', '18:00'] },
      };

      const events = generateEventsForRecipient(fixedRecipient, new Date('2024-01-01'));
      expect(events).toHaveLength(3);

      const times = events.map((e) => {
        const date = new Date(e.scheduledTime);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      });

      expect(times).toContain('09:00');
      expect(times).toContain('14:00');
      expect(times).toContain('18:00');
    });

    it('should return empty array for inactive recipient', () => {
      const inactiveRecipient = { ...mockRecipient, isActive: false };
      const events = generateEventsForRecipient(inactiveRecipient, new Date('2024-01-01'));
      expect(events).toHaveLength(0);
    });

    it('should return empty array for empty message pool', () => {
      const emptyPoolRecipient = { ...mockRecipient, messagePool: [] };
      const events = generateEventsForRecipient(emptyPoolRecipient, new Date('2024-01-01'));
      expect(events).toHaveLength(0);
    });
  });

  describe('canGenerateEvents', () => {
    const mockRecipient: Recipient = {
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

    it('should return true for valid recipient', () => {
      expect(canGenerateEvents(mockRecipient)).toBe(true);
    });

    it('should return false for inactive recipient', () => {
      expect(canGenerateEvents({ ...mockRecipient, isActive: false })).toBe(false);
    });

    it('should return false for empty message pool', () => {
      expect(canGenerateEvents({ ...mockRecipient, messagePool: [] })).toBe(false);
    });

    it('should return false for invalid schedule config', () => {
      expect(canGenerateEvents({ ...mockRecipient, scheduleConfig: { mode: 'random', frequency: 0 } })).toBe(false);
    });
  });
});
