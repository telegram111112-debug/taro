import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/useUserStore'
import { useTelegram } from '../../providers/TelegramProvider'

interface BonusSpreadModalProps {
  isOpen: boolean
  onClose: () => void
}

const spreadTypes = [
  {
    type: 'love' as const,
    title: 'Любовь',
    emoji: '💖',
    description: 'Расклад на отношения',
    path: '/spread/love',
  },
  {
    type: 'money' as const,
    title: 'Деньги',
    emoji: '💰',
    description: 'Расклад на финансы',
    path: '/spread/money',
  },
  {
    type: 'future' as const,
    title: 'Будущее',
    emoji: '🔮',
    description: 'Расклад на будущее',
    path: '/spread/future',
  },
]

export function BonusSpreadModal({ isOpen, onClose }: BonusSpreadModalProps) {
  const navigate = useNavigate()
  const { user, claimBonusSpread } = useUserStore()
  const { hapticFeedback } = useTelegram()

  const isWitchTheme = user?.deckTheme === 'witch'
  const isFairyTheme = user?.deckTheme === 'fairy'

  const handleSelect = (type: 'love' | 'money' | 'future', path: string) => {
    hapticFeedback('notification', 'success')
    claimBonusSpread(type)
    onClose()
    navigate(path)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full max-w-sm rounded-3xl p-6 ${
              isWitchTheme
                ? 'bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] border border-white/20'
                : 'bg-gradient-to-b from-[#f5e6e8] to-[#e8d4d8] border border-[#C4A0A5]/30'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative elements */}
            <motion.div
              className={`absolute -top-3 left-1/2 -translate-x-1/2 text-4xl`}
              animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isFairyTheme ? '🦋' : '🌙'}
            </motion.div>

            {/* Sparkles animation */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-1 h-1 rounded-full ${
                  isFairyTheme ? 'bg-pink-300' : 'bg-yellow-300'
                }`}
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${10 + Math.random() * 80}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}

            {/* Header */}
            <div className="text-center mb-6 mt-4">
              <motion.h2
                className={`text-xl font-display font-semibold mb-2 ${
                  isWitchTheme ? 'text-white' : 'text-[#4A2A2A]'
                }`}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Подруга присоединилась!
              </motion.h2>
              <motion.p
                className={`text-sm ${
                  isWitchTheme ? 'text-white/60' : 'text-[#6B3A3A]/70'
                }`}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Выбери бонусный расклад на 4 карты
              </motion.p>
            </div>

            {/* Spread options */}
            <div className="space-y-3">
              {spreadTypes.map((spread, index) => (
                <motion.button
                  key={spread.type}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  onClick={() => handleSelect(spread.type, spread.path)}
                  className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${
                    isWitchTheme
                      ? 'bg-white/10 hover:bg-white/20 border border-white/10'
                      : 'bg-white/50 hover:bg-white/70 border border-[#C4A0A5]/20'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.span
                    className="text-3xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  >
                    {spread.emoji}
                  </motion.span>
                  <div className="text-left">
                    <p className={`font-semibold ${
                      isWitchTheme ? 'text-white' : 'text-[#4A2A2A]'
                    }`}>
                      {spread.title}
                    </p>
                    <p className={`text-xs ${
                      isWitchTheme ? 'text-white/50' : 'text-[#6B3A3A]/60'
                    }`}>
                      {spread.description}
                    </p>
                  </div>
                  <div className={`ml-auto ${
                    isWitchTheme ? 'text-white/30' : 'text-[#C4A0A5]'
                  }`}>
                    →
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Close button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={onClose}
              className={`w-full mt-4 py-2 text-sm ${
                isWitchTheme ? 'text-white/40 hover:text-white/60' : 'text-[#6B3A3A]/50 hover:text-[#6B3A3A]/70'
              } transition-colors`}
            >
              Выбрать позже
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
