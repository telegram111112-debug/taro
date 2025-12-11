import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, DeckTheme, Friend } from '../types'

interface UserState {
  user: User | null
  isOnboarded: boolean
  isLoading: boolean
  friends: Friend[] // Список подруг с деталями

  // Actions
  setUser: (user: User) => void
  updateUser: (updates: Partial<User>) => void
  setOnboarded: (value: boolean) => void
  setLoading: (value: boolean) => void
  setDeckTheme: (theme: DeckTheme) => void
  checkAndUpdateStreak: () => void
  useWeeklySpread: (type: 'love' | 'money' | 'future') => boolean
  // Вопросы картам (1 базовый + кол-во активных подруг)
  getMaxQuestionsPerDay: () => number
  getRemainingQuestions: () => number
  canAskQuestion: () => boolean
  useQuestion: () => boolean
  resetDailyQuestions: () => void
  // Карта дня
  canGetDailyCard: () => boolean
  useDailyCard: () => boolean
  // Подруги
  addFriend: (friend: Friend) => void
  removeFriend: (telegramId: number) => void
  updateFriendStatus: (telegramId: number, isActive: boolean) => void
  syncFriends: (activeTelegramIds: number[]) => void
  getActiveFriendsCount: () => number
  logout: () => void
}

// Проверяет, является ли дата сегодняшней
const isToday = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

// Проверяет, была ли дата вчера
const isYesterday = (dateStr: string) => {
  const date = new Date(dateStr)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.toDateString() === yesterday.toDateString()
}

// Получает номер недели в году
const getWeekNumber = (date: Date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isOnboarded: false,
      isLoading: false,
      friends: [],

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

      // Проверяет и обновляет streak при заходе пользователя
      checkAndUpdateStreak: () => {
        const { user } = get()
        if (!user) return

        const today = new Date().toISOString()
        const lastDate = user.streakLastDate

        // Если сегодня уже заходил — ничего не делаем
        if (lastDate && isToday(lastDate)) return

        let newStreakCount = user.streakCount

        if (lastDate && isYesterday(lastDate)) {
          // Заход вчера — продолжаем серию
          newStreakCount += 1
        } else if (!lastDate || !isToday(lastDate)) {
          // Первый заход или пропустил день — начинаем серию с 1
          newStreakCount = 1
        }

        // Проверяем, нужно ли пополнить еженедельные расклады
        const currentWeek = getWeekNumber(new Date())
        const lastRefillWeek = user.weeklyLastRefill
          ? getWeekNumber(new Date(user.weeklyLastRefill))
          : 0
        const lastRefillYear = user.weeklyLastRefill
          ? new Date(user.weeklyLastRefill).getFullYear()
          : 0
        const currentYear = new Date().getFullYear()

        // Пополняем раз в неделю при условии streak >= 7
        const shouldRefill =
          (currentWeek !== lastRefillWeek || currentYear !== lastRefillYear) &&
          newStreakCount >= 7

        set({
          user: {
            ...user,
            streakCount: newStreakCount,
            streakLastDate: today,
            ...(shouldRefill && {
              weeklyLoveSpreads: 1,
              weeklyMoneySpreads: 1,
              weeklyFutureSpreads: 1,
              weeklyLastRefill: today,
            }),
          },
        })
      },

      // Использует еженедельный расклад
      useWeeklySpread: (type) => {
        const { user } = get()
        if (!user) return false

        const key = `weekly${type.charAt(0).toUpperCase() + type.slice(1)}Spreads` as
          | 'weeklyLoveSpreads'
          | 'weeklyMoneySpreads'
          | 'weeklyFutureSpreads'

        if (user[key] <= 0) return false

        set({
          user: {
            ...user,
            [key]: user[key] - 1,
          },
        })

        return true
      },

      // Возвращает количество активных подруг
      getActiveFriendsCount: () => {
        const { friends } = get()
        return friends.filter((f) => f.isActive).length
      },

      // Максимум вопросов в день = 1 базовый + количество активных подруг
      // Каждая подключённая подруга в приложении даёт +1 вопрос картам в день
      getMaxQuestionsPerDay: () => {
        const { getActiveFriendsCount } = get()
        return 1 + getActiveFriendsCount()
      },

      // Сколько вопросов осталось сегодня
      getRemainingQuestions: () => {
        const { user, getMaxQuestionsPerDay } = get()
        if (!user) return 0

        // Если это новый день — сбрасываем счётчик
        if (!user.lastQuestionDate || !isToday(user.lastQuestionDate)) {
          return getMaxQuestionsPerDay()
        }

        const used = user.questionsUsedToday || 0
        return Math.max(0, getMaxQuestionsPerDay() - used)
      },

      // Проверяет, можно ли задать вопрос сегодня
      canAskQuestion: () => {
        const { getRemainingQuestions } = get()
        return getRemainingQuestions() > 0
      },

      // Использует один вопрос
      useQuestion: () => {
        const { user, canAskQuestion, getMaxQuestionsPerDay } = get()
        if (!user || !canAskQuestion()) return false

        const today = new Date().toISOString()
        const isNewDay = !user.lastQuestionDate || !isToday(user.lastQuestionDate)

        set({
          user: {
            ...user,
            lastQuestionDate: today,
            questionsUsedToday: isNewDay ? 1 : (user.questionsUsedToday || 0) + 1,
          },
        })

        return true
      },

      // Сбрасывает счётчик вопросов (вызывается при новом дне)
      resetDailyQuestions: () => {
        const { user } = get()
        if (!user) return

        set({
          user: {
            ...user,
            questionsUsedToday: 0,
          },
        })
      },

      // Проверяет, можно ли получить карту дня сегодня
      canGetDailyCard: () => {
        const { user } = get()
        if (!user) return false
        if (!user.lastDailyCardDate) return true
        return !isToday(user.lastDailyCardDate)
      },

      // Использует ежедневную карту дня
      useDailyCard: () => {
        const { user, canGetDailyCard } = get()
        if (!user || !canGetDailyCard()) return false

        set({
          user: {
            ...user,
            lastDailyCardDate: new Date().toISOString(),
          },
        })

        return true
      },

      // Добавить подругу
      addFriend: (friend) => {
        const { friends, user } = get()
        // Проверяем, что подруги ещё нет в списке
        if (friends.some((f) => f.telegramId === friend.telegramId)) return

        set({
          friends: [...friends, friend],
          user: user
            ? { ...user, friends: [...user.friends, friend.telegramId] }
            : null,
        })
      },

      // Удалить подругу
      removeFriend: (telegramId) => {
        const { friends, user } = get()
        set({
          friends: friends.filter((f) => f.telegramId !== telegramId),
          user: user
            ? { ...user, friends: user.friends.filter((id) => id !== telegramId) }
            : null,
        })
      },

      // Обновить статус подруги (активна в приложении или нет)
      updateFriendStatus: (telegramId, isActive) => {
        const { friends } = get()
        set({
          friends: friends.map((f) =>
            f.telegramId === telegramId ? { ...f, isActive } : f
          ),
        })
      },

      // Синхронизировать статусы подруг с сервером
      // Передаём список telegramId активных пользователей приложения
      syncFriends: (activeTelegramIds) => {
        const { friends } = get()
        set({
          friends: friends.map((f) => ({
            ...f,
            isActive: activeTelegramIds.includes(f.telegramId),
          })),
        })
      },

      logout: () => set({ user: null, isOnboarded: false, friends: [] }),
    }),
    {
      name: 'taro-user-store',
      partialize: (state) => ({
        user: state.user,
        isOnboarded: state.isOnboarded,
        friends: state.friends,
      }),
    }
  )
)
