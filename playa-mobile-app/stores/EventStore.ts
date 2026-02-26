import { create } from 'zustand';
import { ScheduledEvent } from '../types';
import * as StorageService from '../services/StorageService';
import * as NotificationService from '../services/NotificationService';

interface EventStore {
  events: Record<string, ScheduledEvent>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadEvents: () => Promise<void>;
  addEvents: (events: ScheduledEvent[]) => Promise<void>;
  updateEvent: (id: string, data: Partial<ScheduledEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEventsByDate: (date: string) => ScheduledEvent[];
  clearEvents: () => void;
  setError: (error: string | null) => void;
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: {},
  isLoading: false,
  error: null,

  loadEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const events = await StorageService.getAllEvents();
      const eventsMap: Record<string, ScheduledEvent> = {};
      events.forEach((event) => {
        eventsMap[event.id] = event;
      });
      set({ events: eventsMap, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addEvents: async (events: ScheduledEvent[]) => {
    set({ isLoading: true, error: null });
    try {
      await StorageService.saveEvents(events);
      
      set((state) => {
        const newEvents = { ...state.events };
        events.forEach((event) => {
          newEvents[event.id] = event;
        });
        return { events: newEvents, isLoading: false };
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateEvent: async (id: string, data: Partial<ScheduledEvent>) => {
    set({ isLoading: true, error: null });
    try {
      const existing = get().events[id];
      if (!existing) {
        throw new Error('Event not found');
      }

      // Validate status transitions
      if (data.status && existing.status !== data.status) {
        const validTransitions: Record<string, string[]> = {
          pending: ['sent', 'cancelled'],
          sent: [], // No transitions from sent
          cancelled: [], // No transitions from cancelled
        };

        const allowedTransitions = validTransitions[existing.status] || [];
        if (!allowedTransitions.includes(data.status)) {
          // Invalid transition - keep existing status
          data = { ...data, status: existing.status };
        }
      }

      const updated: ScheduledEvent = {
        ...existing,
        ...data,
      };

      await StorageService.saveEvent(updated);
      
      set((state) => ({
        events: { ...state.events, [id]: updated },
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteEvent: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const existing = get().events[id];
      if (existing) {
        // Cancel notification if it exists
        if (existing.notificationId) {
          try {
            await NotificationService.cancelNotification(existing.notificationId);
          } catch (error) {
            console.error('Failed to cancel notification:', error);
            // Continue with deletion even if notification cancellation fails
          }
        }

        // Update status to cancelled instead of deleting
        const updated: ScheduledEvent = {
          ...existing,
          status: 'cancelled',
        };
        await StorageService.saveEvent(updated);
        
        set((state) => ({
          events: { ...state.events, [id]: updated },
          isLoading: false,
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  getEventsByDate: (date: string) => {
    const events = Object.values(get().events);
    return events.filter((event) => event.scheduledTime.startsWith(date));
  },

  clearEvents: () => {
    set({ events: {}, isLoading: false, error: null });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
