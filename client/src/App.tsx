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

// Запускаем предзагрузку сразу при импорте модуля (до рендера)
preloadAllImages()

function App() {
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
