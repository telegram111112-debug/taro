import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Card, CollectionItem, Reading } from '../types'

export type FeedbackType = 'positive' | 'negative'

export interface FeedbackEntry {
  readingType: 'daily' | 'love' | 'money' | 'future' | 'question'
  feedback: FeedbackType
  date: string
  cards?: string[] // ID карт в раскладе
}

export interface FeedbackStats {
  total: number
  positive: number
  negative: number
  byType: {
    daily: { positive: number; negative: number }
    love: { positive: number; negative: number }
    money: { positive: number; negative: number }
    future: { positive: number; negative: number }
    question: { positive: number; negative: number }
  }
}

interface CardsState {
  cards: Card[]
  collection: CollectionItem[]
  todayReading: Reading | null
  todayReadingDate: string | null // Track when todayReading was set
  readings: Reading[]
  feedbackHistory: FeedbackEntry[]

  // Actions
  setCards: (cards: Card[]) => void
  setCollection: (collection: CollectionItem[]) => void
  addToCollection: (item: CollectionItem) => void
  setTodayReading: (reading: Reading | null) => void
  setReadings: (readings: Reading[]) => void
  addReading: (reading: Reading) => void
  // Feedback
  addFeedback: (entry: Omit<FeedbackEntry, 'date'>) => void
  getFeedbackStats: () => FeedbackStats
}

export const useCardsStore = create<CardsState>()(
  persist(
    (set, get) => ({
      cards: [],
      collection: [],
      todayReading: null,
      todayReadingDate: null,
      readings: [],
      feedbackHistory: [],

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

      setTodayReading: (reading) => set({
        todayReading: reading,
        todayReadingDate: reading ? new Date().toISOString() : null
      }),

      setReadings: (readings) => set({ readings }),

      addReading: (reading) =>
        set((state) => ({ readings: [reading, ...state.readings] })),

      // Добавить отзыв о раскладе
      addFeedback: (entry) =>
        set((state) => ({
          feedbackHistory: [
            ...state.feedbackHistory,
            { ...entry, date: new Date().toISOString() },
          ],
        })),

      // Получить статистику отзывов
      getFeedbackStats: () => {
        const { feedbackHistory } = get()
        const stats: FeedbackStats = {
          total: feedbackHistory.length,
          positive: feedbackHistory.filter((f) => f.feedback === 'positive').length,
          negative: feedbackHistory.filter((f) => f.feedback === 'negative').length,
          byType: {
            daily: { positive: 0, negative: 0 },
            love: { positive: 0, negative: 0 },
            money: { positive: 0, negative: 0 },
            future: { positive: 0, negative: 0 },
            question: { positive: 0, negative: 0 },
          },
        }

        feedbackHistory.forEach((entry) => {
          if (stats.byType[entry.readingType]) {
            stats.byType[entry.readingType][entry.feedback]++
          }
        })

        return stats
      },
    }),
    {
      name: 'taro-cards-storage',
      partialize: (state) => ({
        todayReading: state.todayReading,
        todayReadingDate: state.todayReadingDate,
        collection: state.collection,
        readings: state.readings,
        feedbackHistory: state.feedbackHistory,
      }),
    }
  )
)
