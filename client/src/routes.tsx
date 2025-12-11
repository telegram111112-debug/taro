import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useUserStore } from './store/useUserStore'
import { useCardsStore } from './store/useCardsStore'
import { Layout } from './components/layout/Layout'

// Lazy-loaded pages для ускорения первоначальной загрузки
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })))
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })))
const DailyCardPage = lazy(() => import('./pages/DailyCardPage').then(m => ({ default: m.DailyCardPage })))
const SpreadPage = lazy(() => import('./pages/SpreadPage').then(m => ({ default: m.SpreadPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const GiftsPage = lazy(() => import('./pages/GiftsPage').then(m => ({ default: m.GiftsPage })))
const HistoryPage = lazy(() => import('./pages/HistoryPage').then(m => ({ default: m.HistoryPage })))
const ReferralsPage = lazy(() => import('./pages/ReferralsPage').then(m => ({ default: m.ReferralsPage })))
const RewardsPage = lazy(() => import('./pages/RewardsPage').then(m => ({ default: m.RewardsPage })))
const AskTarotPage = lazy(() => import('./pages/AskTarotPage').then(m => ({ default: m.AskTarotPage })))
const SurpriseDemo = lazy(() => import('./pages/SurpriseDemo').then(m => ({ default: m.SurpriseDemo })))

// Минимальный лоадер для Suspense
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  )
}

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

  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  )
}
