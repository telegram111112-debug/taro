import { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '../components/layout'
import { Card, Button, Modal } from '../components/ui'
import { TarotCard } from '../components/tarot'
import { useUserStore } from '../store/useUserStore'
import { getThemeConfig } from '../lib/deckThemes'
import type { Card as TarotCardType, Arcana, Suit } from '../types'

// Mock data
const mockCollection = [
  {
    id: 'major_06_lovers',
    nameRu: 'Влюблённые',
    nameEn: 'The Lovers',
    arcana: 'major' as Arcana,
    number: 6,
    keywords: ['любовь', 'выбор'],
    meaningUpright: { general: '', love: '', career: '', advice: '' },
    meaningReversed: { general: '', love: '', career: '', advice: '' },
    zodiacConnections: [],
    collected: true,
    timesReceived: 3,
  },
  {
    id: 'major_19_sun',
    nameRu: 'Солнце',
    nameEn: 'The Sun',
    arcana: 'major' as Arcana,
    number: 19,
    keywords: ['радость', 'успех'],
    meaningUpright: { general: '', love: '', career: '', advice: '' },
    meaningReversed: { general: '', love: '', career: '', advice: '' },
    zodiacConnections: [],
    collected: true,
    timesReceived: 1,
  },
]

type FilterType = 'all' | 'major' | 'wands' | 'cups' | 'swords' | 'pentacles'

export function CollectionPage() {
  const { user } = useUserStore()
  const themeConfig = getThemeConfig(user?.deckTheme || 'witch')

  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedCard, setSelectedCard] = useState<(typeof mockCollection)[0] | null>(null)

  const collectedCount = mockCollection.filter(c => c.collected).length
  const totalCards = 78

  const filters: { key: FilterType; label: string; emoji: string }[] = [
    { key: 'all', label: 'Все', emoji: '🎴' },
    { key: 'major', label: 'Старшие', emoji: '⭐' },
    { key: 'wands', label: 'Жезлы', emoji: '🪄' },
    { key: 'cups', label: 'Кубки', emoji: '🏆' },
    { key: 'swords', label: 'Мечи', emoji: '⚔️' },
    { key: 'pentacles', label: 'Пентакли', emoji: '⭐' },
  ]

  const isWitchTheme = user?.deckTheme === 'witch' || !user?.deckTheme
  const isFairyTheme = user?.deckTheme === 'fairy'

  return (
    <div className="min-h-screen pb-24 relative">
      <Header title="Коллекция" />

      {/* Progress */}
      <div className="px-4 mb-4">
        <Card variant="mystic">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Собрано карт</span>
            <span className="text-white font-bold">{collectedCount}/{totalCards}</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: themeConfig.gradients.button }}
              initial={{ width: 0 }}
              animate={{ width: `${(collectedCount / totalCards) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/40">
            <span>Старшие: 2/22</span>
            <span>Младшие: 0/56</span>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
          {filters.map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`
                flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium
                transition-all duration-200
                ${filter === key
                  ? 'bg-mystic-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
                }
              `}
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="px-4">
        <div className="grid grid-cols-4 gap-2">
          {/* Show collected cards */}
          {mockCollection.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: i * 0.05 }}
              onClick={() => setSelectedCard(card)}
              className="cursor-pointer"
            >
              <div className="aspect-[2/3] rounded-lg overflow-hidden border border-mystic-500/30 bg-mystic-900/50 relative">
                <TarotCard
                  card={card as TarotCardType}
                  isRevealed={true}
                  size="sm"
                  deckTheme={user?.deckTheme}
                  className="w-full h-full"
                />
                {card.timesReceived > 1 && (
                  <div className="absolute top-1 right-1 bg-gold-500 text-black text-[10px] font-bold px-1 rounded">
                    x{card.timesReceived}
                  </div>
                )}
              </div>
              <p className="text-white/60 text-[10px] text-center mt-1 truncate">
                {card.nameRu}
              </p>
            </motion.div>
          ))}

          {/* Show locked cards placeholders */}
          {[...Array(20)].map((_, i) => (
            <div key={`locked-${i}`} className="opacity-30">
              <div className="aspect-[2/3] rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
                <span className="text-2xl">❓</span>
              </div>
              <p className="text-white/30 text-[10px] text-center mt-1">???</p>
            </div>
          ))}
        </div>
      </div>

      {/* Card Detail Modal */}
      <Modal
        isOpen={selectedCard !== null}
        onClose={() => setSelectedCard(null)}
        title={selectedCard?.nameRu}
      >
        {selectedCard && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <TarotCard
                card={selectedCard as TarotCardType}
                isRevealed={true}
                size="md"
                showName={false}
                deckTheme={user?.deckTheme}
              />
            </div>

            <div className="text-center">
              <p className="text-white/60 text-sm">
                Получена {selectedCard.timesReceived} раз(а)
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-white/80 text-sm">
                <span className="text-gold-400">Ключевые слова:</span>{' '}
                {selectedCard.keywords.join(', ')}
              </p>
              <p className="text-white/80 text-sm">
                <span className="text-gold-400">Аркан:</span>{' '}
                {selectedCard.arcana === 'major' ? 'Старший' : 'Младший'}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
