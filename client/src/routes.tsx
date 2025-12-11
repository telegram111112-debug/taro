import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useUserStore } from './store/useUserStore'
import { useCardsStore } from './store/useCardsStore'
import { Layout } from './components/layout/Layout'
import { OnboardingPage } from './pages/OnboardingPage'
import { HomePage } from './pages/HomePage'
import { DailyCardPage } from './pages/DailyCardPage'
import { SpreadPage } from './pages/SpreadPage'
import { ProfilePage } from './pages/ProfilePage'
import { GiftsPage } from './pages/GiftsPage'
import { HistoryPage } from './pages/HistoryPage'
import { ReferralsPage } from './pages/ReferralsPage'
import { RewardsPage } from './pages/RewardsPage'
import { AskTarotPage } from './pages/AskTarotPage'
import { SurpriseDemo } from './pages/SurpriseDemo'

// Компонент для демо-режима - сбрасывает onboarding и показывает регистрацию
function DemoOnboarding() {
  const { logout } = useUserStore()

  useEffect(() => {
    // Сбрасываем состояние при входе на демо
    logout()
  }, [logout])

  return <OnboardingPage />
}

// Компонент для dev-режима - пропускает онбоардинг с тестовым пользователем
function DevSkipOnboarding() {
  const { setUser, setOnboarded } = useUserStore()

  useEffect(() => {
    // Всегда пересоздаём тестового пользователя с актуальными полями
    setUser({
      id: 'dev-user-123',
      telegramId: 123456789,
      name: 'Тестовая',
      birthDate: '15.03.1995',
      birthTime: '14:30',
      birthCity: 'Москва',
      zodiacSign: 'Рыбы',
      relationshipStatus: 'single',
      streakCount: 3,
      streakLastDate: new Date().toISOString(),
      timezone: 'Europe/Moscow',
      deckTheme: 'fairy',
      createdAt: new Date().toISOString(),
      weeklyLoveSpreads: 1,
      weeklyMoneySpreads: 1,
      weeklyFutureSpreads: 1,
      weeklyLastRefill: new Date().toISOString(),
      questionsUsedToday: 0,
      friends: [],
    })
    setOnboarded(true)
  }, [setUser, setOnboarded])

  return <Navigate to="/" replace />
}

// Компонент для сброса карты дня (для тестирования)
function ResetDailyCard() {
  const { updateUser } = useUserStore()
  const { setTodayReading } = useCardsStore()

  useEffect(() => {
    // Сбрасываем карту дня в обоих сторах
    updateUser({ lastDailyCardDate: undefined })
    setTodayReading(null)
    console.log('✅ Карта дня сброшена!')
  }, [updateUser, setTodayReading])

  return <Navigate to="/daily" replace />
}

export function AppRoutes() {
  const { isOnboarded } = useUserStore()
  const [hasHydrated, setHasHydrated] = useState(false)

  // Ждём загрузки данных из localStorage
  useEffect(() => {
    const unsubscribe = useUserStore.persist.onFinishHydration(() => {
      setHasHydrated(true)
    })

    // Проверяем, если уже загружено
    if (useUserStore.persist.hasHydrated()) {
      setHasHydrated(true)
    }

    return unsubscribe
  }, [])

  // Показываем загрузку пока данные не загружены
  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
        <div className="text-white/60 text-lg">✨</div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Dev routes - доступны всегда */}
      <Route path="/surprise-demo" element={<SurpriseDemo />} />
      <Route path="/demo" element={<DemoOnboarding />} />
      <Route path="/dev" element={<DevSkipOnboarding />} />
      <Route path="/reset-daily" element={<ResetDailyCard />} />

      {/* Main app routes */}
      {!isOnboarded ? (
        <Route path="*" element={<OnboardingPage />} />
      ) : (
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/daily" element={<DailyCardPage />} />
          <Route path="/spread/:type" element={<SpreadPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/gifts" element={<GiftsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/referrals" element={<ReferralsPage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/ask" element={<AskTarotPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      )}
    </Routes>
  )
}
