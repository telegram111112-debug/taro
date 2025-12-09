import { create } from 'zustand'

interface UIState {
  isModalOpen: boolean
  modalContent: React.ReactNode | null
  isLoading: boolean
  notification: {
    show: boolean
    message: string
    type: 'success' | 'error' | 'info'
  }

  // Actions
  openModal: (content: React.ReactNode) => void
  closeModal: () => void
  setLoading: (value: boolean) => void
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void
  hideNotification: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isModalOpen: false,
  modalContent: null,
  isLoading: false,
  notification: {
    show: false,
    message: '',
    type: 'info',
  },

  openModal: (content) => set({ isModalOpen: true, modalContent: content }),

  closeModal: () => set({ isModalOpen: false, modalContent: null }),

  setLoading: (value) => set({ isLoading: value }),

  showNotification: (message, type) =>
    set({
      notification: { show: true, message, type },
    }),

  hideNotification: () =>
    set((state) => ({
      notification: { ...state.notification, show: false },
    })),
}))
