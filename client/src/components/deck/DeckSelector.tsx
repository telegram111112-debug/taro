import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '../../store/useUserStore'
import { useTelegram } from '../../providers/TelegramProvider'
import { MagicParticles } from '../effects'
import type { DeckTheme } from '../../types'

interface DeckSelectorProps {
  onSelect: (theme: DeckTheme) => void
  showPermanentOption?: boolean
}

export function DeckSelector({ onSelect, showPermanentOption = true }: DeckSelectorProps) {
  const { user, setDeckTheme, updateUser } = useUserStore()
  const { hapticFeedback } = useTelegram()
  const [selectedDeck, setSelectedDeck] = useState<DeckTheme | null>(null)
  const [showConfirmPermanent, setShowConfirmPermanent] = useState(false)

  const handleSelectDeck = (theme: DeckTheme) => {
    hapticFeedback('selection')
    setSelectedDeck(theme)
  }

  const handleConfirm = () => {
    if (!selectedDeck) return
    hapticFeedback('impact', 'medium')
    // Сохраняем тему на сегодня (deckPermanent: false - выбор на день)
    setDeckTheme(selectedDeck)
    updateUser({ deckTheme: selectedDeck, deckPermanent: false })
    onSelect(selectedDeck)
  }

  const handleSetPermanent = () => {
    if (!selectedDeck) return
    hapticFeedback('notification', 'success')
    setDeckTheme(selectedDeck)
    updateUser({ deckTheme: selectedDeck, deckPermanent: true })
    onSelect(selectedDeck)
  }

  // Определяем фоновую картинку на основе текущей темы пользователя
  const backgroundImage = user?.deckTheme === 'fairy'
    ? 'url(/backgrounds/fountain-fairy.jpg)'
    : 'url(/backgrounds/bathtub-witch.jpg)'

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative"
      style={{
        backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Затемнение для читаемости контента */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Magic particles based on hovered/selected deck */}
      <MagicParticles
        theme={selectedDeck || 'witch'}
        intensity="light"
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative z-10"
      >
        <h2 className="text-2xl font-display font-semibold text-white mb-2">
          Выбери колоду своего дня
        </h2>
        <p className="text-white/60">
          Кто ты сегодня?
        </p>
      </motion.div>

      {/* Deck Options */}
      <div className="flex gap-4 mb-8 relative z-10">
        {/* Witch Deck */}
        <motion.button
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => handleSelectDeck('witch')}
          className={`relative group ${selectedDeck === 'witch' ? 'scale-105' : ''}`}
        >
          {/* Стопка карт с анимацией перемешивания */}
          <div className="relative w-36 h-52">
            {/* Карты в стопке */}
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className={`
                  absolute inset-0 w-full h-full rounded-2xl overflow-hidden
                  ${selectedDeck === 'witch'
                    ? 'ring-2 ring-purple-500/50'
                    : 'ring-1 ring-white/10'
                  }
                `}
                style={{
                  zIndex: 5 - i,
                  backgroundImage: i === 0 ? 'url(/backgrounds/selector-witch.jpg)' : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: i > 0 ? '#1a1625' : undefined,
                }}
                animate={{
                  x: [0, (i % 2 === 0 ? 1 : -1) * (3 + i * 2), 0],
                  y: [i * -2, i * -2 + (i % 2 === 0 ? -3 : 3), i * -2],
                  rotate: [i * -1, i * -1 + (i % 2 === 0 ? 2 : -2), i * -1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
            {/* Основная карта сверху */}
            <motion.div
              className={`
                absolute inset-0 w-full h-full rounded-2xl overflow-hidden
                transition-all duration-300
                ${selectedDeck === 'witch'
                  ? 'ring-4 ring-purple-500 shadow-lg shadow-purple-500/50'
                  : 'ring-2 ring-white/20 hover:ring-white/40'
                }
              `}
              style={{ zIndex: 10 }}
              animate={{
                y: [0, -5, 0],
                rotate: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: 'url(/backgrounds/selector-witch.jpg)' }}
              />
            </motion.div>
          </div>

          <p className="text-center mt-3 font-medium text-white">
            Прекрасная ведьма 🌙
          </p>
        </motion.button>

        {/* Fairy Deck */}
        <motion.button
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => handleSelectDeck('fairy')}
          className={`relative group ${selectedDeck === 'fairy' ? 'scale-105' : ''}`}
        >
          {/* Стопка карт с анимацией перемешивания */}
          <div className="relative w-36 h-52">
            {/* Карты в стопке */}
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className={`
                  absolute inset-0 w-full h-full rounded-2xl overflow-hidden
                  ${selectedDeck === 'fairy'
                    ? 'ring-2 ring-pink-400/50'
                    : 'ring-1 ring-white/10'
                  }
                `}
                style={{
                  zIndex: 5 - i,
                  backgroundImage: i === 0 ? 'url(/backgrounds/selector-fairy.jpg)' : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: i > 0 ? '#2a1a2e' : undefined,
                }}
                animate={{
                  x: [0, (i % 2 === 0 ? -1 : 1) * (3 + i * 2), 0],
                  y: [i * -2, i * -2 + (i % 2 === 0 ? -3 : 3), i * -2],
                  rotate: [i * 1, i * 1 + (i % 2 === 0 ? -2 : 2), i * 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
            {/* Основная карта сверху */}
            <motion.div
              className={`
                absolute inset-0 w-full h-full rounded-2xl overflow-hidden
                transition-all duration-300
                ${selectedDeck === 'fairy'
                  ? 'ring-4 ring-pink-400 shadow-lg shadow-pink-400/50'
                  : 'ring-2 ring-white/20 hover:ring-white/40'
                }
              `}
              style={{ zIndex: 10 }}
              animate={{
                y: [0, -5, 0],
                rotate: [0, -1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: 'url(/backgrounds/selector-fairy.jpg)' }}
              />
            </motion.div>
          </div>

          <p className="text-center mt-3 font-medium text-white">
            Нежная фея 🦋
          </p>
        </motion.button>
      </div>

      {/* Action Buttons */}
      <AnimatePresence>
        {selectedDeck && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col gap-3 w-full max-w-xs relative z-10"
          >
            <button
              onClick={handleConfirm}
              className={`
                w-full py-4 text-lg rounded-2xl font-medium transition-all
                ${selectedDeck === 'witch'
                  ? 'bg-gradient-to-r from-purple-900 via-purple-800 to-slate-900 text-purple-100 border border-purple-500/30 shadow-lg shadow-purple-900/50 hover:shadow-purple-800/60'
                  : 'bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white border border-pink-300/30 shadow-lg shadow-pink-400/50 hover:shadow-pink-400/60'
                }
              `}
            >
              {selectedDeck === 'witch' ? 'Выбрать на сегодня 🌙' : 'Выбрать на сегодня 🦋'}
            </button>

            {showPermanentOption && (
              <button
                onClick={() => setShowConfirmPermanent(true)}
                className={`
                  text-sm transition-colors
                  ${selectedDeck === 'witch'
                    ? 'text-purple-300/60 hover:text-purple-200'
                    : 'text-pink-200/60 hover:text-pink-100'
                  }
                `}
              >
                {selectedDeck === 'witch' ? 'Выбрать эту колоду навсегда 🔮' : 'Выбрать эту колоду навсегда 💖'}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permanent Selection Confirmation */}
      <AnimatePresence>
        {showConfirmPermanent && selectedDeck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            onClick={() => setShowConfirmPermanent(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`
                rounded-3xl p-6 max-w-sm w-full
                ${selectedDeck === 'witch'
                  ? 'bg-gradient-to-b from-slate-900 via-purple-950 to-slate-950 border border-purple-500/20'
                  : 'bg-gradient-to-b from-pink-950 via-rose-950 to-pink-950 border border-pink-400/20'
                }
              `}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">
                  {selectedDeck === 'witch' ? '🌙' : '🦋'}
                </div>
                <h3 className="text-xl font-display font-semibold text-white mb-2">
                  Выбрать навсегда?
                </h3>
                <p className="text-white/60 text-sm">
                  Колода "{selectedDeck === 'witch' ? 'Прекрасная ведьма' : 'Нежная фея'}"
                  будет использоваться во всех твоих раскладах.
                </p>
                <p className="text-white/40 text-xs mt-2">
                  Ты всегда сможешь изменить это в настройках профиля
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmPermanent(false)}
                  className={`
                    flex-1 py-3 rounded-xl font-medium transition-all
                    ${selectedDeck === 'witch'
                      ? 'bg-slate-800/50 text-purple-200 border border-purple-500/20 hover:bg-slate-700/50'
                      : 'bg-pink-100/10 text-pink-200 border border-pink-300/20 hover:bg-pink-100/20'
                    }
                  `}
                >
                  Отмена
                </button>
                <button
                  onClick={handleSetPermanent}
                  className={`
                    flex-1 py-3 rounded-xl font-medium transition-all
                    ${selectedDeck === 'witch'
                      ? 'bg-gradient-to-r from-purple-800 to-purple-900 text-purple-100 border border-purple-500/30 shadow-lg shadow-purple-900/50'
                      : 'bg-gradient-to-r from-pink-400 to-rose-400 text-white border border-pink-300/30 shadow-lg shadow-pink-400/50'
                    }
                  `}
                >
                  {selectedDeck === 'witch' ? 'Да, навсегда 🔮' : 'Да, навсегда 💖'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
