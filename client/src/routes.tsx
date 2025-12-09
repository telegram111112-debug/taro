import { Routes, Route, Navigate } from 'react-router-dom'
import { useUserStore } from './store/useUserStore'
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

export function AppRoutes() {
  const { user, isOnboarded } = useUserStore()

  // Demo route - доступен всегда без авторизации
  return (
    <Routes>
      {/* Demo route outside auth */}
      <Route path="/surprise-demo" element={<SurpriseDemo />} />

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
