import { create } from 'zustand'
import type { Card, CollectionItem, Reading } from '../types'

interface CardsState {
  cards: Card[]
  collection: CollectionItem[]
  todayReading: Reading | null
  readings: Reading[]

  // Actions
  setCards: (cards: Card[]) => void
  setCollection: (collection: CollectionItem[]) => void
  addToCollection: (item: CollectionItem) => void
  setTodayReading: (reading: Reading | null) => void
  setReadings: (readings: Reading[]) => void
  addReading: (reading: Reading) => void
}

export const useCardsStore = create<CardsState>((set) => ({
  cards: [],
  collection: [],
  todayReading: null,
  readings: [],

  setCards: (cards) => set({ cards }),

  setCollection: (collection) => set({ collection }),

  addToCollection: (item) =>
    set((state) => {
      const existing = state.collection.find((c) => c.cardId === item.cardId)
      if (existing) {
        return {
          collection: state.collection.map((c) =>
            c.cardId === item.cardId
              ? { ...c, timesReceived: c.timesReceived + 1 }
              : c
          ),
        }
      }
      return { collection: [...state.collection, item] }
    }),

  setTodayReading: (reading) => set({ todayReading: reading }),

  setReadings: (readings) => set({ readings }),

  addReading: (reading) =>
    set((state) => ({ readings: [reading, ...state.readings] })),
}))
