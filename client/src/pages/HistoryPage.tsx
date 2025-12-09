import { motion } from 'framer-motion'
import { Header } from '../components/layout'
import { Card } from '../components/ui'
import { useUserStore } from '../store/useUserStore'
import { getThemeEmoji } from '../lib/themeEmojis'

const mockHistory = [
  {
    id: '1',
    type: 'daily',
    typeName: 'Карта дня',
    emoji: '🔮',
    card: 'Влюблённые',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
    feedback: 'positive',
  },
  {
    id: '2',
    type: 'love',
    typeName: 'На любовь',
    emoji: '💕',
    card: '4 карты',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    feedback: 'positive',
  },
  {
    id: '3',
    type: 'daily',
    typeName: 'Карта дня',
    emoji: '🔮',
    card: 'Солнце',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48),
    feedback: null,
  },
]

export function HistoryPage() {
  const { user } = useUserStore()

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) return 'Только что'
    if (hours < 24) return `${hours} ч. назад`
    if (days === 1) return 'Вчера'
    if (days < 7) return `${days} дн. назад`
    return date.toLocaleDateString('ru')
  }

  const isWitchTheme = user?.deckTheme === 'witch' || !user?.deckTheme
  const isFairyTheme = user?.deckTheme === 'fairy'

  return (
    <div className="min-h-screen pb-24 relative">
      {/* Background based on theme */}
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
      <Header title={`История ${getThemeEmoji(user?.deckTheme, 'decoration1')}`} showBack />

      <div className="px-4">
        {mockHistory.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">{getThemeEmoji(user?.deckTheme, 'future')}</span>
            <p className="text-white/60 text-center">История пока пуста</p>
            <p className="text-white/40 text-sm text-center">Сделай свой первый расклад!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockHistory.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15, delay: i * 0.03 }}
              >
                <Card variant="glass" className="cursor-pointer hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/10">
                      <span className="text-2xl">
                        {item.type === 'daily' ? getThemeEmoji(user?.deckTheme, 'future') :
                         item.type === 'love' ? getThemeEmoji(user?.deckTheme, 'spreadLove') :
                         getThemeEmoji(user?.deckTheme, 'spreadMoney')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{item.typeName}</p>
                        {item.feedback === 'positive' && (
                          <span className="text-xs">{getThemeEmoji(user?.deckTheme, 'love')}</span>
                        )}
                      </div>
                      <p className="text-white/50 text-sm">{item.card}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/40 text-xs">{formatDate(item.date)}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
