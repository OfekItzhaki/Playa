import { create } from 'zustand';

interface UIStore {
  isLoading: boolean;
  error: string | null;
  activeModal: string | null;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isLoading: false,
  error: null,
  activeModal: null,

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  openModal: (modal: string) => {
    set({ activeModal: modal });
  },

  closeModal: () => {
    set({ activeModal: null });
  },
}));
