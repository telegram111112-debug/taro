import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, DeckTheme, RelationshipStatus } from '../types'

interface UserState {
  user: User | null
  isOnboarded: boolean
  isLoading: boolean

  // Actions
  setUser: (user: User) => void
  updateUser: (updates: Partial<User>) => void
  setOnboarded: (value: boolean) => void
  setLoading: (value: boolean) => void
  setDeckTheme: (theme: DeckTheme) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isOnboarded: false,
      isLoading: false,

      setUser: (user) => set({ user }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      setOnboarded: (value) => set({ isOnboarded: value }),

      setLoading: (value) => set({ isLoading: value }),

      setDeckTheme: (theme) =>
        set((state) => ({
          user: state.user ? { ...state.user, deckTheme: theme } : null,
        })),

      logout: () => set({ user: null, isOnboarded: false }),
    }),
    {
      name: 'taro-user-store',
      partialize: (state) => ({
        user: state.user,
        isOnboarded: state.isOnboarded,
      }),
    }
  )
)
