import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Recipient, RecipientFormData, CloneOptions } from '../types';
import * as StorageService from '../services/StorageService';
import * as SchedulingService from '../services/SchedulingService';

interface RecipientStore {
  recipients: Record<string, Recipient>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadRecipients: () => Promise<void>;
  addRecipient: (data: RecipientFormData) => Promise<Recipient>;
  updateRecipient: (id: string, data: Partial<Recipient>) => Promise<void>;
  deleteRecipient: (id: string) => Promise<void>;
  cloneRecipient: (targetId: string, sourceId: string, options: CloneOptions) => Promise<void>;
  clearRecipients: () => void;
  setError: (error: string | null) => void;
}

export const useRecipientStore = create<RecipientStore>((set, get) => ({
  recipients: {},
  isLoading: false,
  error: null,

  loadRecipients: async () => {
    set({ isLoading: true, error: null });
    try {
      const recipients = await StorageService.getAllRecipients();
      const recipientsMap: Record<string, Recipient> = {};
      recipients.forEach((recipient) => {
        recipientsMap[recipient.id] = recipient;
      });
      set({ recipients: recipientsMap, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addRecipient: async (data: RecipientFormData) => {
    set({ isLoading: true, error: null });
    try {
      const now = new Date().toISOString();
      const recipient: Recipient = {
        id: uuidv4(),
        ...data,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      await StorageService.saveRecipient(recipient);
      
      set((state) => ({
        recipients: { ...state.recipients, [recipient.id]: recipient },
        isLoading: false,
      }));

      return recipient;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateRecipient: async (id: string, data: Partial<Recipient>) => {
    set({ isLoading: true, error: null });
    try {
      const existing = get().recipients[id];
      if (!existing) {
        throw new Error('Recipient not found');
      }

      const scheduleConfigChanged = 
        data.scheduleConfig && 
        JSON.stringify(existing.scheduleConfig) !== JSON.stringify(data.scheduleConfig);

      const updated: Recipient = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      };

      await StorageService.saveRecipient(updated);
      
      // Regenerate events if schedule config changed
      if (scheduleConfigChanged) {
        await StorageService.deleteEventsByRecipient(id);
        const today = new Date();
        const newEvents = await SchedulingService.generateEventsForRecipient(updated, today);
        await StorageService.saveEvents(newEvents);
      }

      set((state) => ({
        recipients: { ...state.recipients, [id]: updated },
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteRecipient: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await StorageService.deleteRecipient(id);
      await StorageService.deleteEventsByRecipient(id);
      
      set((state) => {
        const { [id]: _removed, ...rest } = state.recipients;
        return { recipients: rest, isLoading: false };
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  cloneRecipient: async (targetId: string, sourceId: string, options: CloneOptions) => {
    set({ isLoading: true, error: null });
    try {
      const source = get().recipients[sourceId];
      const target = get().recipients[targetId];

      if (!source || !target) {
        throw new Error('Source or target recipient not found');
      }

      const updated: Recipient = { ...target };

      if (options.copyScheduleConfig) {
        updated.scheduleConfig = JSON.parse(JSON.stringify(source.scheduleConfig));
      }

      if (options.copyMessagePool) {
        updated.messagePool = [...source.messagePool];
      }

      updated.updatedAt = new Date().toISOString();

      await StorageService.saveRecipient(updated);
      
      set((state) => ({
        recipients: { ...state.recipients, [targetId]: updated },
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  clearRecipients: () => {
    set({ recipients: {}, isLoading: false, error: null });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
