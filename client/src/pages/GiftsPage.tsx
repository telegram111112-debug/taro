import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Header } from '../components/layout'
import { Card, Button } from '../components/ui'
import { useTelegram } from '../providers/TelegramProvider'
import { useUserStore } from '../store/useUserStore'
import { getThemeEmoji } from '../lib/themeEmojis'

const gifts = [
  {
    id: '1',
    type: 'love_spread',
    name: 'Расклад на любовь',
    description: 'Узнай, что ждёт тебя в отношениях',
    emojiKey: 'spreadLove' as const,
    cards: 4,
    used: false,
  },
  {
    id: '2',
    type: 'money_spread',
    name: 'Расклад на деньги',
    description: 'Открой финансовые возможности',
    emojiKey: 'spreadMoney' as const,
    cards: 4,
    used: false,
  },
  {
    id: '3',
    type: 'future_spread',
    name: 'Расклад на будущее',
    description: 'Загляни в грядущее',
    emojiKey: 'spreadFuture' as const,
    cards: 4,
    used: false,
  },
]

export function GiftsPage() {
  const navigate = useNavigate()
  const { hapticFeedback } = useTelegram()
  const { user } = useUserStore()

  const handleUseGift = (type: string) => {
    hapticFeedback('impact', 'medium')
    const spreadType = type.replace('_spread', '')
    navigate(`/spread/${spreadType}`)
  }

  const availableGifts = gifts.filter(g => !g.used)
  const usedGifts = gifts.filter(g => g.used)

  const isWitchTheme = user?.deckTheme === 'witch' || !user?.deckTheme
  const isFairyTheme = user?.deckTheme === 'fairy'

  return (
    <div className="min-h-screen pb-24 relative">
      <Header title={`Мои подарки ${getThemeEmoji(user?.deckTheme, 'gift')}`} showBack />

      <div className="px-4">
        {/* Available gifts */}
        {availableGifts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-white/80 font-medium mb-3 text-center">
              Доступные подарки ({availableGifts.length})
            </h2>
            <div className="space-y-3">
              {availableGifts.map((gift, i) => (
                <motion.div
                  key={gift.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: i * 0.03 }}
                >
                  <Card variant="mystic" className="border-white/10">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/10">
                        {gift.emojiKey === 'spreadFuture' ? (
                          <img
                            src="/icons/crystal-ball.png"
                            alt="Хрустальный шар"
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <span className="text-3xl">{getThemeEmoji(user?.deckTheme, gift.emojiKey)}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{gift.name}</h3>
                        <p className="text-white/50 text-sm mb-2">{gift.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/50">
                            {gift.cards} карты
                          </span>
                          <Button
                            size="sm"
                            variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'}
                            onClick={() => handleUseGift(gift.type)}
                          >
                            Использовать {getThemeEmoji(user?.deckTheme, 'button')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <Card variant="glass" className="mb-6">
          <div className="flex items-start gap-3">
            <span className="text-xl">{getThemeEmoji(user?.deckTheme, 'star')}</span>
            <div>
              <p className="text-white/80 text-sm text-center">
                Подарочные расклады можно использовать в любое время.
                Они не сгорают!
              </p>
            </div>
          </div>
        </Card>

        {/* How to get more */}
        <div>
          <h2 className="text-white/80 font-medium mb-3 text-center">
            Как получить больше подарков?
          </h2>
          <div className="space-y-2">
            <Card variant="glass" className="flex items-center gap-3">
              <span className="text-xl">{getThemeEmoji(user?.deckTheme, 'fire')}</span>
              <div>
                <p className="text-white text-sm">7 дней серии</p>
                <p className="text-white/50 text-xs">+1 расклад из 4-х карт на выбор</p>
              </div>
            </Card>
            <Card variant="glass" className="flex items-center gap-3">
              <span className="text-xl">{getThemeEmoji(user?.deckTheme, 'fire')}</span>
              <div>
                <p className="text-white text-sm">14 дней серии</p>
                <p className="text-white/50 text-xs">+1 расклад из 4-х карт на выбор</p>
              </div>
            </Card>
            <Card variant="glass" className="flex items-center gap-3">
              <span className="text-xl">{getThemeEmoji(user?.deckTheme, 'fire')}</span>
              <div>
                <p className="text-white text-sm">30 дней серии</p>
                <p className="text-white/50 text-xs">+1 расклад из 4-х карт на выбор</p>
              </div>
            </Card>
            <Card variant="glass" className="flex items-center gap-3">
              <span className="text-xl">{getThemeEmoji(user?.deckTheme, 'love')}</span>
              <div>
                <p className="text-white text-sm">Пригласи подругу</p>
                <p className="text-white/50 text-xs">+1 расклад для вас обеих</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Used gifts */}
        {usedGifts.length > 0 && (
          <div className="mt-6">
            <h2 className="text-white/50 font-medium mb-3 text-center">
              Использованные
            </h2>
            <div className="space-y-2 opacity-50">
              {usedGifts.map((gift) => (
                <Card key={gift.id} variant="glass">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getThemeEmoji(user?.deckTheme, gift.emojiKey)}</span>
                    <span className="text-white/60 line-through">{gift.name}</span>
                    <span className="ml-auto text-white/40 text-xs">Использован</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
