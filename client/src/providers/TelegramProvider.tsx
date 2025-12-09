import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { TelegramUser } from '../types'

interface TelegramContextValue {
  webApp: typeof window.Telegram.WebApp | null
  user: TelegramUser | null
  isReady: boolean
  colorScheme: 'light' | 'dark'
  initData: string
  hapticFeedback: (type: 'impact' | 'notification' | 'selection', style?: string) => void
  showMainButton: (text: string, onClick: () => void) => void
  hideMainButton: () => void
  showBackButton: (onClick: () => void) => void
  hideBackButton: () => void
  expand: () => void
  close: () => void
}

const TelegramContext = createContext<TelegramContextValue | null>(null)

interface TelegramProviderProps {
  children: ReactNode
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [isReady, setIsReady] = useState(false)
  const [webApp, setWebApp] = useState<typeof window.Telegram.WebApp | null>(null)
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('dark')
  const [initData, setInitData] = useState('')

  useEffect(() => {
    const tg = window.Telegram?.WebApp

    if (tg) {
      // Initialize
      tg.ready()
      tg.expand()

      // Set theme
      setColorScheme(tg.colorScheme || 'dark')

      // Set header color
      tg.setHeaderColor('#1a1a2e')
      tg.setBackgroundColor('#1a1a2e')

      // Get user data
      const userData = tg.initDataUnsafe?.user
      if (userData) {
        setUser(userData as TelegramUser)
      }

      setInitData(tg.initData || '')
      setWebApp(tg)
      setIsReady(true)

      // Listen for theme changes
      tg.onEvent('themeChanged', () => {
        setColorScheme(tg.colorScheme || 'dark')
      })
    } else {
      // Development mode - mock data
      console.log('Running outside Telegram - using mock data')
      setUser({
        id: 123456789,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        language_code: 'ru',
      })
      setIsReady(true)
    }
  }, [])

  const hapticFeedback = (type: 'impact' | 'notification' | 'selection', style?: string) => {
    if (!webApp?.HapticFeedback) return

    switch (type) {
      case 'impact':
        webApp.HapticFeedback.impactOccurred(style as 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' || 'medium')
        break
      case 'notification':
        webApp.HapticFeedback.notificationOccurred(style as 'error' | 'success' | 'warning' || 'success')
        break
      case 'selection':
        webApp.HapticFeedback.selectionChanged()
        break
    }
  }

  const showMainButton = (text: string, onClick: () => void) => {
    if (!webApp?.MainButton) return

    webApp.MainButton.setText(text)
    webApp.MainButton.onClick(onClick)
    webApp.MainButton.show()
    webApp.MainButton.setParams({
      color: '#8b5cf6',
      text_color: '#ffffff',
    })
  }

  const hideMainButton = () => {
    webApp?.MainButton?.hide()
  }

  const showBackButton = (onClick: () => void) => {
    if (!webApp?.BackButton) return

    webApp.BackButton.onClick(onClick)
    webApp.BackButton.show()
  }

  const hideBackButton = () => {
    webApp?.BackButton?.hide()
  }

  const expand = () => {
    webApp?.expand()
  }

  const close = () => {
    webApp?.close()
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-mystic-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <TelegramContext.Provider
      value={{
        webApp,
        user,
        isReady,
        colorScheme,
        initData,
        hapticFeedback,
        showMainButton,
        hideMainButton,
        showBackButton,
        hideBackButton,
        expand,
        close,
      }}
    >
      {children}
    </TelegramContext.Provider>
  )
}

export function useTelegram() {
  const context = useContext(TelegramContext)
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider')
  }
  return context
}

// Type declaration for Telegram WebApp
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void
        expand: () => void
        close: () => void
        initData: string
        initDataUnsafe: {
          user?: TelegramUser
          query_id?: string
          auth_date?: number
          hash?: string
        }
        colorScheme: 'light' | 'dark'
        themeParams: Record<string, string>
        setHeaderColor: (color: string) => void
        setBackgroundColor: (color: string) => void
        MainButton: {
          text: string
          color: string
          textColor: string
          isVisible: boolean
          isActive: boolean
          setText: (text: string) => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
          show: () => void
          hide: () => void
          setParams: (params: { color?: string; text_color?: string; is_active?: boolean }) => void
        }
        BackButton: {
          isVisible: boolean
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
          show: () => void
          hide: () => void
        }
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void
          selectionChanged: () => void
        }
        onEvent: (event: string, callback: () => void) => void
        offEvent: (event: string, callback: () => void) => void
      }
    }
  }
}
