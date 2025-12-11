import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Navigation } from './Navigation'
import { BonusSpreadModal } from '../modals/BonusSpreadModal'
import { useUserStore } from '../../store/useUserStore'
import { useTelegram } from '../../providers/TelegramProvider'
import { getThemeCSSVars } from '../../lib/deckThemes'

export function Layout() {
  const { user, updateUser, pendingBonusSpread, clearPendingBonus } = useUserStore()
  const { user: tgUser } = useTelegram()

  // Синхронизируем аватар из Telegram при каждом запуске
  useEffect(() => {
    if (tgUser?.photo_url) {
      updateUser({ avatar: tgUser.photo_url })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tgUser?.photo_url])
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

      {/* Bonus spread modal (when friend joins) */}
      <BonusSpreadModal
        isOpen={pendingBonusSpread}
        onClose={clearPendingBonus}
      />
    </div>
  )
}
