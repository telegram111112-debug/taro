import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '../store/useUserStore'
import { allTarotCards } from '../data/tarotCards'
import { Button } from './ui/Button'

interface SurpriseCardModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SurpriseCardModal({ isOpen, onClose }: SurpriseCardModalProps) {
  const { user } = useUserStore()
  const isFairyTheme = user?.deckTheme === 'fairy'

  const [step, setStep] = useState<'appearing' | 'revealed' | 'interpretation'>('appearing')
  const [randomCard] = useState(() => allTarotCards[Math.floor(Math.random() * allTarotCards.length)])
  const [isReversed] = useState(() => Math.random() > 0.7)

  const cardBackImage = isFairyTheme ? '/cards/card-back-fairy.jpg' : '/cards/card-back-witch.jpg'

  useEffect(() => {
    if (isOpen) {
      setStep('appearing')
    }
  }, [isOpen])

  // Пользователь нажимает на карту, чтобы перевернуть её
  const handleCardClick = () => {
    if (step === 'appearing') {
      setStep('revealed')
    }
  }

  const handleShowInterpretation = () => {
    setStep('interpretation')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop with dramatic effect */}
          <motion.div
            className="absolute inset-0 bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Magical particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 rounded-full ${
                  isFairyTheme ? 'bg-[#FC89AC]' : 'bg-purple-400'
                }`}
                initial={{
                  x: '50vw',
                  y: '50vh',
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`,
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              />
            ))}
          </div>

          {/* Card animation */}
          <div className="relative z-10 flex flex-col items-center">
            {step === 'appearing' && (
              <>
                {/* Title */}
                <motion.div
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div
                    className="text-5xl mb-4"
                    animate={{
                      scale: [1, 1.3, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {isFairyTheme ? '✨' : '🔮'}
                  </motion.div>
                  <h2 className={`text-2xl font-display font-bold ${
                    isFairyTheme ? 'text-[#FC89AC]' : 'text-purple-300'
                  }`}>
                    Карта сама выпрыгнула из колоды!
                  </h2>
                  <p className="text-white/60 mt-2">
                    Вселенная хочет тебе что-то сказать...
                  </p>
                </motion.div>

                {/* Card appearing animation - jumping from bottom */}
                <motion.div
                  className="relative cursor-pointer"
                  onClick={handleCardClick}
                  initial={{
                    y: 500,
                    rotate: 720,
                    scale: 0.3,
                  }}
                  animate={{
                    y: 0,
                    rotate: 0,
                    scale: 1,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 100,
                    damping: 15,
                    duration: 1.5,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Glow effect */}
                  <motion.div
                    className={`absolute inset-0 rounded-2xl blur-xl ${
                      isFairyTheme ? 'bg-[#FC89AC]' : 'bg-purple-500'
                    }`}
                    animate={{
                      opacity: [0.3, 0.7, 0.3],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  {/* Card back */}
                  <div className="relative w-48 h-72 rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src={cardBackImage}
                      alt="Card back"
                      className="w-full h-full object-cover"
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </motion.div>

                {/* Подсказка для нажатия */}
                <motion.p
                  className="text-white/50 text-sm mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                >
                  Нажми на карту, чтобы узнать послание
                </motion.p>
              </>
            )}

            {step === 'revealed' && (
              <>
                {/* Card flip animation */}
                <motion.div
                  className="relative perspective-1000"
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: 180 }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Glow effect */}
                  <motion.div
                    className={`absolute inset-0 rounded-2xl blur-xl ${
                      isFairyTheme ? 'bg-[#FC89AC]' : 'bg-purple-500'
                    }`}
                    animate={{
                      opacity: [0.5, 0.9, 0.5],
                      scale: [1, 1.15, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  {/* Card front (revealed) */}
                  <motion.div
                    className={`relative w-56 h-80 rounded-2xl overflow-hidden shadow-2xl ${
                      isReversed ? 'rotate-180' : ''
                    }`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <div className={`w-full h-full flex flex-col items-center justify-center p-4 ${
                      isFairyTheme
                        ? 'bg-gradient-to-b from-[#FC89AC]/30 to-pink-900/80'
                        : 'bg-gradient-to-b from-purple-800/50 to-purple-950/90'
                    }`}>
                      <div className="text-6xl mb-4">
                        {randomCard.arcana === 'major' ? '🌟' :
                         randomCard.suit === 'wands' ? '🔥' :
                         randomCard.suit === 'cups' ? '💧' :
                         randomCard.suit === 'swords' ? '💨' : '🌍'}
                      </div>
                      <h3 className="text-white text-xl font-display font-bold text-center">
                        {randomCard.nameRu}
                      </h3>
                      {isReversed && (
                        <span className="text-white/60 text-sm mt-1">(перевёрнутая)</span>
                      )}
                      <p className="text-white/50 text-sm mt-2 text-center">
                        {randomCard.keywords.slice(0, 3).join(' • ')}
                      </p>
                    </div>
                  </motion.div>

                  {/* Card back */}
                  <div
                    className="absolute top-0 left-0 w-56 h-80 rounded-2xl overflow-hidden shadow-2xl"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <img
                      src={cardBackImage}
                      alt="Card back"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>

                {/* Card name and button */}
                <motion.div
                  className="mt-8 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <h3 className={`text-2xl font-display font-bold mb-2 ${
                    isFairyTheme ? 'text-[#FC89AC]' : 'text-purple-300'
                  }`}>
                    {randomCard.nameRu}
                    {isReversed && ' (перевёрнутая)'}
                  </h3>
                  <p className="text-white/60 mb-6">
                    {randomCard.arcana === 'major' ? 'Старший Аркан' : 'Младший Аркан'}
                  </p>
                  <Button
                    onClick={handleShowInterpretation}
                    variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'}
                    size="lg"
                  >
                    Узнать толкование
                  </Button>
                </motion.div>
              </>
            )}

            {step === 'interpretation' && (
              <motion.div
                className="w-full max-w-md px-4 max-h-[80vh] overflow-y-auto"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className={`rounded-3xl p-6 ${
                  isFairyTheme
                    ? 'bg-gradient-to-b from-[#FC89AC]/20 to-pink-900/40'
                    : 'bg-gradient-to-b from-purple-800/30 to-purple-950/50'
                } backdrop-blur-xl border border-white/10`}>
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-2">
                      {randomCard.arcana === 'major' ? '🌟' :
                       randomCard.suit === 'wands' ? '🔥' :
                       randomCard.suit === 'cups' ? '💧' :
                       randomCard.suit === 'swords' ? '💨' : '🌍'}
                    </div>
                    <h3 className={`text-2xl font-display font-bold ${
                      isFairyTheme ? 'text-[#FC89AC]' : 'text-purple-300'
                    }`}>
                      {randomCard.nameRu}
                      {isReversed && ' (перевёрнутая)'}
                    </h3>
                  </div>

                  <div className="space-y-4 text-white/80 text-sm leading-relaxed">
                    <div>
                      <h4 className={`font-semibold mb-2 ${
                        isFairyTheme ? 'text-[#FC89AC]' : 'text-purple-300'
                      }`}>
                        Общее значение
                      </h4>
                      <p>
                        {isReversed
                          ? randomCard.meaningReversed.general
                          : randomCard.meaningUpright.general}
                      </p>
                    </div>

                    <div>
                      <h4 className={`font-semibold mb-2 ${
                        isFairyTheme ? 'text-[#FC89AC]' : 'text-purple-300'
                      }`}>
                        Совет дня
                      </h4>
                      <p>
                        {isReversed
                          ? randomCard.meaningReversed.advice
                          : randomCard.meaningUpright.advice}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <Button
                      onClick={onClose}
                      variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'}
                      size="lg"
                      className="w-full"
                    >
                      Понятно
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Close button for appearing/revealed states */}
          {step !== 'interpretation' && (
            <motion.button
              className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
