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

export function AppRoutes() {
  const { user, isOnboarded } = useUserStore()

  // If user hasn't completed onboarding, show onboarding
  if (!isOnboarded) {
    return (
      <Routes>
        <Route path="*" element={<OnboardingPage />} />
      </Routes>
    )
  }

  return (
    <Routes>
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
    </Routes>
  )
}
