import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '../components/layout'
import { Card, Button } from '../components/ui'
import { MagicParticlesLight } from '../components/effects'
import { useUserStore } from '../store/useUserStore'
import { allTarotCards } from '../data/tarotCards'

interface HistoryReading {
  id: string
  type: 'daily' | 'love' | 'money' | 'future' | 'question'
  typeName: string
  cardId: number
  isReversed: boolean
  date: Date
  feedback: 'positive' | 'negative' | null
  question?: string
  interpretation?: string
}

// Моковые данные с реальными картами
const mockHistory: HistoryReading[] = [
  {
    id: '1',
    type: 'daily',
    typeName: 'Карта дня',
    cardId: 6, // Влюблённые
    isReversed: false,
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
    feedback: 'positive',
  },
  {
    id: '2',
    type: 'love',
    typeName: 'Расклад на любовь',
    cardId: 19, // Солнце
    isReversed: false,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    feedback: 'positive',
  },
  {
    id: '3',
    type: 'question',
    typeName: 'Вопрос картам',
    cardId: 2, // Верховная Жрица
    isReversed: true,
    date: new Date(Date.now() - 1000 * 60 * 60 * 48),
    feedback: null,
    question: 'Стоит ли мне менять работу?',
  },
  {
    id: '4',
    type: 'money',
    typeName: 'Расклад на деньги',
    cardId: 14, // Умеренность
    isReversed: false,
    date: new Date(Date.now() - 1000 * 60 * 60 * 72),
    feedback: 'positive',
  },
  {
    id: '5',
    type: 'daily',
    typeName: 'Карта дня',
    cardId: 17, // Звезда
    isReversed: false,
    date: new Date(Date.now() - 1000 * 60 * 60 * 96),
    feedback: null,
  },
]

export function HistoryPage() {
  const { user } = useUserStore()
  const [selectedReading, setSelectedReading] = useState<HistoryReading | null>(null)

  const isWitchTheme = user?.deckTheme === 'witch' || !user?.deckTheme
  const isFairyTheme = user?.deckTheme === 'fairy'

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) return 'Только что'
    if (hours < 24) return `${hours} ч. назад`
    if (days === 1) return 'Вчера'
    if (days < 7) return `${days} дн. назад`
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTypeIcon = (type: string) => {
    if (isFairyTheme) {
      switch (type) {
        case 'daily': return '🦋'
        case 'love': return '💕'
        case 'money': return '✨'
        case 'future': return '🔮'
        case 'question': return '💫'
        default: return '🌸'
      }
    }
    switch (type) {
      case 'daily': return '🌙'
      case 'love': return '🖤'
      case 'money': return '💰'
      case 'future': return '🔮'
      case 'question': return '✦'
      default: return '⭐'
    }
  }

  const getTypeColor = (type: string) => {
    if (isFairyTheme) {
      switch (type) {
        case 'daily': return 'from-[#C4A0A5]/30 to-pink-500/20'
        case 'love': return 'from-pink-500/30 to-rose-500/20'
        case 'money': return 'from-amber-400/30 to-yellow-500/20'
        case 'future': return 'from-[#C4A0A5]/30 to-pink-500/20'
        case 'question': return 'from-[#C4A0A5]/30 to-fuchsia-500/20'
        default: return 'from-[#C4A0A5]/30 to-pink-500/20'
      }
    }
    switch (type) {
      case 'daily': return 'from-black/30 to-black/20'
      case 'love': return 'from-black/30 to-black/20'
      case 'money': return 'from-amber-600/30 to-amber-700/20'
      case 'future': return 'from-black/30 to-black/20'
      case 'question': return 'from-black/30 to-black/20'
      default: return 'from-black/30 to-black/20'
    }
  }

  const getCard = (cardId: number) => {
    return allTarotCards.find(c => c.id === cardId) || allTarotCards[0]
  }

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

      <MagicParticlesLight />

      <Header showBack transparent />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-4 pb-4"
      >
        <motion.img
          src={isFairyTheme ? '/icons/history-fairy.png' : '/icons/history-witch.png'}
          alt="История раскладов"
          className="w-14 h-14 object-contain mx-auto mb-2"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <h1 className="text-xl font-display font-bold text-white">
          Твои расклады
        </h1>
        <p className="text-white/50 text-sm">
          {mockHistory.length} {mockHistory.length === 1 ? 'расклад' : mockHistory.length < 5 ? 'расклада' : 'раскладов'}
        </p>
      </motion.div>

      <div className="px-4">
        {mockHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isFairyTheme ? '🦋' : '🌙'}
            </motion.div>
            <h3 className="text-white font-semibold mb-2">История пока пуста</h3>
            <p className="text-white/50 text-sm">Сделай свой первый расклад!</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {mockHistory.map((item, i) => {
              const card = getCard(item.cardId)
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedReading(item)}
                  className="cursor-pointer"
                >
                  <div
                    className={`
                      relative overflow-hidden rounded-2xl p-3
                      backdrop-blur-md border transition-all
                      ${isFairyTheme
                        ? 'bg-[#C4A0A5]/10 border-[#C4A0A5]/20 hover:bg-[#C4A0A5]/15'
                        : 'bg-black/40 border-white/20 hover:bg-black/50'
                      }
                    `}
                  >
                    {/* Gradient accent */}
                    <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${getTypeColor(item.type)}`} />

                    <div className="flex items-center gap-3">
                      {/* Mini card preview */}
                      <div className="relative flex-shrink-0">
                        <motion.div
                          className={`
                            w-14 h-20 rounded-lg overflow-hidden shadow-lg
                            ${item.isReversed ? 'rotate-180' : ''}
                          `}
                          whileHover={{ scale: 1.05 }}
                        >
                          <img
                            src={`/cards/${user?.deckTheme || 'witch'}/${card.id}.jpg`}
                            alt={card.nameRu}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `/cards/${user?.deckTheme || 'witch'}/back.jpg`
                            }}
                          />
                        </motion.div>
                        {/* Type badge */}
                        <div className={`
                          absolute -bottom-1 -right-1 w-6 h-6 rounded-full
                          flex items-center justify-center text-sm
                          ${isFairyTheme ? 'bg-[#C4A0A5]' : 'bg-white/50'}
                          shadow-lg
                        `}>
                          {getTypeIcon(item.type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-white font-medium text-sm truncate">
                            {card.nameRu}
                          </p>
                          {item.isReversed && (
                            <span className="text-white/40 text-xs">перев.</span>
                          )}
                          {item.feedback === 'positive' && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-xs"
                            >
                              {isFairyTheme ? '💕' : '🖤'}
                            </motion.span>
                          )}
                        </div>
                        <p className={`text-xs ${isFairyTheme ? 'text-[#C4A0A5]/70' : 'text-white/60'}`}>
                          {item.typeName}
                        </p>
                        {item.question && (
                          <p className="text-white/40 text-xs truncate mt-0.5 italic">
                            «{item.question}»
                          </p>
                        )}
                      </div>

                      {/* Date & Arrow */}
                      <div className="flex items-center gap-2">
                        <p className="text-white/30 text-xs">{formatDate(item.date)}</p>
                        <motion.span
                          className="text-white/30 text-sm"
                          animate={{ x: [0, 3, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          →
                        </motion.span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedReading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            onClick={() => setSelectedReading(null)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`
                relative w-full max-h-[85vh] rounded-t-3xl overflow-hidden
                ${isFairyTheme
                  ? 'bg-gradient-to-b from-[#2a1018] to-[#1a0a10]'
                  : 'bg-gradient-to-b from-black/90 to-black'
                }
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className={`w-10 h-1 rounded-full ${isFairyTheme ? 'bg-[#C4A0A5]/40' : 'bg-white/40'}`} />
              </div>

              {/* Card showcase */}
              <div className="relative px-4 pb-4">
                <div className="flex justify-center mb-4">
                  <motion.div
                    initial={{ scale: 0.8, rotateY: 180 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className={`
                      relative w-32 h-48 rounded-xl overflow-hidden shadow-2xl
                      ${selectedReading.isReversed ? 'rotate-180' : ''}
                    `}
                  >
                    <img
                      src={`/cards/${user?.deckTheme || 'witch'}/${getCard(selectedReading.cardId).id}.jpg`}
                      alt={getCard(selectedReading.cardId).nameRu}
                      className="w-full h-full object-cover"
                    />
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%', y: '-100%' }}
                      animate={{ x: '100%', y: '100%' }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                  </motion.div>
                </div>

                {/* Card name */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-4"
                >
                  <h2 className="text-xl font-display font-bold text-white">
                    {getCard(selectedReading.cardId).nameRu}
                    {selectedReading.isReversed && (
                      <span className="text-white/40 text-sm font-normal ml-2">(перевёрнутая)</span>
                    )}
                  </h2>
                  <p className="text-white/50 text-sm">{getCard(selectedReading.cardId).nameEn}</p>
                </motion.div>

                {/* Meta info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-center gap-4 mb-4"
                >
                  <div className={`
                    px-3 py-1.5 rounded-full text-xs
                    ${isFairyTheme ? 'bg-[#C4A0A5]/20 text-[#C4A0A5]' : 'bg-black/40 text-white/80'}
                  `}>
                    {getTypeIcon(selectedReading.type)} {selectedReading.typeName}
                  </div>
                  <div className="text-white/40 text-xs">
                    {formatFullDate(selectedReading.date)}
                  </div>
                </motion.div>

                {/* Question if exists */}
                {selectedReading.question && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className={`
                      p-3 rounded-xl mb-4 text-center
                      ${isFairyTheme ? 'bg-[#C4A0A5]/10 border border-[#C4A0A5]/20' : 'bg-black/40 border border-white/20'}
                    `}
                  >
                    <p className="text-white/60 text-xs mb-1">Твой вопрос:</p>
                    <p className="text-white font-medium italic">«{selectedReading.question}»</p>
                  </motion.div>
                )}
              </div>

              {/* Scrollable content */}
              <div className="px-4 pb-6 max-h-[40vh] overflow-y-auto">
                {/* Interpretation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card variant={isFairyTheme ? 'mystic-fairy' : 'mystic-witch'} className="mb-4">
                    <div className="space-y-4">
                      {/* Main meaning */}
                      <div>
                        <h3 className={`text-sm font-medium mb-2 flex items-center gap-2 ${isFairyTheme ? 'text-[#C4A0A5]' : 'text-white/70'}`}>
                          <span>{isFairyTheme ? '🦋' : '🔮'}</span> Послание
                        </h3>
                        <p className="text-white/80 text-sm leading-relaxed">
                          {selectedReading.isReversed
                            ? getCard(selectedReading.cardId).meaningReversed.general
                            : getCard(selectedReading.cardId).meaningUpright.general}
                        </p>
                      </div>

                      {/* Keywords */}
                      <div className="flex flex-wrap gap-2">
                        {getCard(selectedReading.cardId).keywords.slice(0, 4).map((keyword, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-white/5 rounded-full text-xs text-white/50"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>

                      {/* Advice */}
                      <div className={`
                        p-3 rounded-xl
                        ${isFairyTheme
                          ? 'bg-gradient-to-r from-[#C4A0A5]/10 to-pink-500/10 border border-[#C4A0A5]/20'
                          : 'bg-gradient-to-r from-black/30 to-black/20 border border-white/20'
                        }
                      `}>
                        <h3 className={`text-xs font-medium mb-1 ${isFairyTheme ? 'text-[#C4A0A5]' : 'text-white/60'}`}>
                          Совет карты
                        </h3>
                        <p className="text-white/70 text-sm italic">
                          {selectedReading.isReversed
                            ? getCard(selectedReading.cardId).meaningReversed.advice
                            : getCard(selectedReading.cardId).meaningUpright.advice}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Feedback indicator */}
                {selectedReading.feedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mb-4"
                  >
                    <span className={`
                      inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs
                      ${selectedReading.feedback === 'positive'
                        ? isFairyTheme ? 'bg-[#C4A0A5]/20 text-[#C4A0A5]' : 'bg-black/40 text-white/70'
                        : 'bg-white/10 text-white/50'
                      }
                    `}>
                      {selectedReading.feedback === 'positive' ? (
                        <>{isFairyTheme ? '💕' : '🖤'} Отозвалось в сердце</>
                      ) : (
                        <>💔 Не отозвалось</>
                      )}
                    </span>
                  </motion.div>
                )}

                {/* Close button */}
                <Button
                  onClick={() => setSelectedReading(null)}
                  variant="secondary"
                  className="w-full"
                >
                  Закрыть
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
