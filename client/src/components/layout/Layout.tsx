import { Outlet } from 'react-router-dom'
import { Navigation } from './Navigation'
import { useUserStore } from '../../store/useUserStore'
import { getThemeCSSVars } from '../../lib/deckThemes'

export function Layout() {
  const { user } = useUserStore()
  const theme = user?.deckTheme || 'witch'
  const themeVars = getThemeCSSVars(theme)

  return (
    <div
      className="min-h-screen flex flex-col safe-area-top"
      style={themeVars as React.CSSProperties}
    >
      {/* Main content */}
      <main className="flex-1 overflow-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <Navigation />
    </div>
  )
}
