import { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TelegramProvider } from './providers/TelegramProvider'
import { AppRoutes } from './routes'
import { preloadAllImages } from './lib/preloadImages'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

// Экран загрузки пока грузятся все фоны
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f1a] flex flex-col items-center justify-center">
      <div className="text-4xl mb-4">✨</div>
      <div className="w-12 h-12 border-2 border-white/20 border-t-white/80 rounded-full animate-spin mb-4" />
      <p className="text-white/60 text-sm">Загрузка...</p>
    </div>
  )
}

function App() {
  const [isLoading, setIsLoading] = useState(true)

  // Предзагрузка ВСЕХ фонов ДО показа приложения
  useEffect(() => {
    preloadAllImages().then(() => {
      setIsLoading(false)
    })
  }, [])

  // Показываем экран загрузки пока фоны не загружены
  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TelegramProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TelegramProvider>
    </QueryClientProvider>
  )
}

export default App
