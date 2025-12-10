import { Outlet } from 'react-router-dom'
import { Navigation } from './Navigation'
import { useUserStore } from '../../store/useUserStore'
import { getThemeCSSVars } from '../../lib/deckThemes'

export function Layout() {
  const { user } = useUserStore()
  const theme = user?.deckTheme || 'witch'
  const themeVars = getThemeCSSVars(theme)

  const isWitchTheme = theme === 'witch'
  const isFairyTheme = theme === 'fairy'

  return (
    <div
      className="min-h-screen flex flex-col safe-area-top"
      style={themeVars as React.CSSProperties}
    >
      {/* Global background - always visible during transitions */}
      {isWitchTheme && (
        <>
          <div
            className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
            style={{ backgroundImage: 'url(/backgrounds/background-witch.jpg)' }}
          />
          <div className="fixed inset-0 bg-black/60 -z-10" />
        </>
      )}
      {isFairyTheme && (
        <>
          <div
            className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
            style={{ backgroundImage: 'url(/backgrounds/background-fairy.jpg)' }}
          />
          <div className="fixed inset-0 bg-black/40 -z-10" />
        </>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <Navigation />
    </div>
  )
}
