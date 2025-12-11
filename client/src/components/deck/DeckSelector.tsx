import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '../../store/useUserStore'
import { useTelegram } from '../../providers/TelegramProvider'
import { MagicParticles } from '../effects'
import type { DeckTheme } from '../../types'

interface DeckSelectorProps {
  onSelect: (theme: DeckTheme) => void
  showPermanentOption?: boolean
  showBackButton?: boolean
}

export function DeckSelector({ onSelect, showPermanentOption = true, showBackButton = true }: DeckSelectorProps) {
  const navigate = useNavigate()
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
      className="fixed inset-0 flex flex-col items-center justify-center p-6 overflow-hidden"
      style={{
        backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        touchAction: 'none',
      }}
    >
      {/* Затемнение для читаемости контента */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Back Button */}
      {showBackButton && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
          onClick={() => {
            hapticFeedback('impact', 'light')
            navigate('/')
          }}
          className={`
            absolute top-6 left-4 z-20 flex items-center gap-2 px-4 py-2.5 rounded-2xl
            backdrop-blur-md transition-all duration-300
            ${user?.deckTheme === 'fairy'
              ? 'bg-[#C4A0A5]/20 border border-[#C4A0A5]/30 text-white hover:bg-[#C4A0A5]/30'
              : 'bg-black/40 border border-white/20 text-white hover:bg-black/50'
            }
          `}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-sm font-medium">Главная</span>
        </motion.button>
      )}

      {/* Magic particles based on hovered/selected deck */}
      <MagicParticles
        theme={selectedDeck || 'witch'}
        intensity="light"
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
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
                    ? 'ring-2 ring-white/50'
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
                  ? 'ring-4 ring-white shadow-lg shadow-white/30'
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.25 }}
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
                    ? 'ring-2 ring-[#C4A0A5]/50'
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
                  ? 'ring-4 ring-[#C4A0A5] shadow-lg shadow-[#C4A0A5]/50'
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col gap-3 w-full max-w-xs relative z-10"
          >
            <button
              onClick={handleConfirm}
              className={`
                w-full py-4 text-lg rounded-2xl font-medium transition-all
                ${selectedDeck === 'witch'
                  ? 'bg-[#3a3a3a] text-white border border-white/20 shadow-lg shadow-black/30 hover:bg-[#4a4a4a]'
                  : 'bg-[#C4A0A5] text-white border border-[#C4A0A5]/30 shadow-lg shadow-[#C4A0A5]/30 hover:bg-[#d4b0b5]'
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
                    ? 'text-white/60 hover:text-white'
                    : 'text-white/60 hover:text-white'
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
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            onClick={() => setShowConfirmPermanent(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`
                rounded-3xl p-6 max-w-sm w-full
                ${selectedDeck === 'witch'
                  ? 'bg-[#3a3a3a] border border-white/20'
                  : 'bg-gradient-to-b from-[#3a2a2d] via-[#2f2325] to-[#3a2a2d] border border-[#C4A0A5]/30'
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
                      ? 'bg-[#2a2a2a] text-white border border-white/20 hover:bg-[#4a4a4a]'
                      : 'bg-[#C4A0A5]/10 text-[#C4A0A5] border border-[#C4A0A5]/20 hover:bg-[#C4A0A5]/20'
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
                      ? 'bg-[#4a4a4a] text-white border border-white/30 shadow-lg shadow-black/30 hover:bg-[#5a5a5a]'
                      : 'bg-[#C4A0A5] text-white border border-[#C4A0A5]/30 shadow-lg shadow-[#C4A0A5]/50 hover:bg-[#d4b0b5]'
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
