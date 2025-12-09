import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const initData = window.Telegram?.WebApp?.initData
  if (initData) {
    config.headers['X-Telegram-Init-Data'] = initData
  }
  return config
})

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// API endpoints
export const authApi = {
  login: (initData: string) =>
    api.post('/auth/telegram', { initData }),

  me: () =>
    api.get('/auth/me'),
}

export const userApi = {
  getProfile: () =>
    api.get('/user/profile'),

  updateProfile: (data: Record<string, unknown>) =>
    api.put('/user/profile', data),

  getStats: () =>
    api.get('/user/stats'),

  getStreak: () =>
    api.get('/user/streak'),

  setTimezone: (timezone: string) =>
    api.post('/user/timezone', { timezone }),

  setDeckTheme: (theme: 'witch' | 'fairy') =>
    api.post('/user/deck-theme', { theme }),
}

export const cardsApi = {
  getAll: () =>
    api.get('/cards'),

  getById: (id: string) =>
    api.get(`/cards/${id}`),
}

export const readingsApi = {
  getDaily: () =>
    api.get('/readings/daily'),

  createDaily: () =>
    api.post('/readings/daily'),

  createSpread: (type: string) =>
    api.post('/readings/spread', { type }),

  addClarification: (readingId: string) =>
    api.post(`/readings/${readingId}/clarify`),

  submitFeedback: (readingId: string, feedback: 'positive' | 'negative') =>
    api.post(`/readings/${readingId}/feedback`, { feedback }),

  getHistory: (limit?: number, offset?: number) =>
    api.get('/readings/history', { params: { limit, offset } }),
}

export const collectionApi = {
  get: () =>
    api.get('/collection'),

  getStats: () =>
    api.get('/collection/stats'),
}

export const achievementsApi = {
  getAll: () =>
    api.get('/achievements'),

  getMy: () =>
    api.get('/achievements/my'),
}

export const giftsApi = {
  get: () =>
    api.get('/gifts'),

  use: (giftId: string) =>
    api.post(`/gifts/${giftId}/use`),
}

export const referralsApi = {
  get: () =>
    api.get('/referrals'),

  getLink: () =>
    api.get('/referrals/link'),
}

export const tarotApi = {
  ask: (userId: string, question: string, card: Record<string, unknown>, isReversed: boolean) =>
    api.post('/tarot/ask', { userId, question, card, isReversed }),

  canAsk: (userId: string) =>
    api.get(`/tarot/can-ask/${userId}`),
}
