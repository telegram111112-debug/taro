import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TarotCard } from './TarotCard'
import { useTelegram } from '../../providers/TelegramProvider'
import type { Card, DeckTheme } from '../../types'

interface CardFlipProps {
  card: Card
  isReversed: boolean
  onReveal?: () => void
  deckTheme?: DeckTheme
  autoReveal?: boolean
  revealDelay?: number
}

export function CardFlip({
  card,
  isReversed,
  onReveal,
  deckTheme,
  autoReveal = false,
  revealDelay = 1500,
}: CardFlipProps) {
  const [isRevealed, setIsRevealed] = useState(autoReveal)
  const [showSparkles, setShowSparkles] = useState(false)
  const [showGlow, setShowGlow] = useState(false)
  const [showRings, setShowRings] = useState(false)
  const { hapticFeedback } = useTelegram()

  const isFairy = deckTheme === 'fairy'

  // Символы для разных тем
  const themeSymbols = isFairy
    ? ['✨', '🦋', '💫', '⭐', '✧', '💖', '🌸', '✦']
    : ['✧', '☽', '✦', '⭐', '🌙', '💜', '🔮', '☆']

  const handleReveal = () => {
    if (isRevealed) return

    hapticFeedback('impact', 'heavy')
    setShowGlow(true)
    setShowRings(true)

    // Задержка перед искрами
    setTimeout(() => {
      setShowSparkles(true)
      setIsRevealed(true)
    }, 200)

    setTimeout(() => {
      hapticFeedback('notification', 'success')
      setShowSparkles(false)
      setShowGlow(false)
      setShowRings(false)
      onReveal?.()
    }, 1000)
  }

  return (
    <div className="relative">
      {/* Пульсирующее свечение перед раскрытием */}
      <AnimatePresence>
        {showGlow && (
          <motion.div
            className="absolute inset-0 -z-10 rounded-2xl blur-3xl"
            style={{
              background: isFairy
                ? 'radial-gradient(circle, rgba(252, 137, 172, 0.6) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%)',
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0.3, 0.8, 0.5],
              scale: [0.8, 1.3, 1.1],
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.8 }}
          />
        )}
      </AnimatePresence>

      {/* Расширяющиеся кольца */}
      <AnimatePresence>
        {showRings && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 border-2 rounded-2xl pointer-events-none"
                style={{
                  borderColor: isFairy
                    ? 'rgba(252, 137, 172, 0.5)'
                    : 'rgba(139, 92, 246, 0.5)',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: [0, 0.8, 0],
                  scale: [0.9, 1.5 + i * 0.3, 2 + i * 0.4],
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.15,
                  ease: 'easeOut',
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Sparkles on reveal - улучшенная версия */}
      <AnimatePresence>
        {showSparkles && (
          <>
            {/* Основной взрыв искр */}
            {[...Array(12)].map((_, i) => {
              const angle = (i * Math.PI * 2) / 12
              const distance = 80 + Math.random() * 40
              return (
                <motion.div
                  key={`spark-${i}`}
                  className="absolute text-lg pointer-events-none"
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: 0,
                    y: 0,
                  }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1.2, 1.5, 0],
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    rotate: [0, 180, 360],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.9,
                    delay: i * 0.03,
                    ease: 'easeOut',
                  }}
                  style={{
                    left: '50%',
                    top: '50%',
                    marginLeft: '-10px',
                    marginTop: '-10px',
                  }}
                >
                  {themeSymbols[i % themeSymbols.length]}
                </motion.div>
              )
            })}

            {/* Вторая волна - мелкие частицы */}
            {[...Array(16)].map((_, i) => {
              const angle = (i * Math.PI * 2) / 16 + Math.PI / 16
              const distance = 50 + Math.random() * 60
              return (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-2 h-2 rounded-full pointer-events-none"
                  style={{
                    background: isFairy
                      ? `rgba(252, 137, 172, ${0.6 + Math.random() * 0.4})`
                      : `rgba(139, 92, 246, ${0.6 + Math.random() * 0.4})`,
                    boxShadow: isFairy
                      ? '0 0 6px rgba(252, 137, 172, 0.8)'
                      : '0 0 6px rgba(139, 92, 246, 0.8)',
                  }}
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: 0,
                    y: 0,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1 + Math.random(), 0],
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                  }}
                  transition={{
                    duration: 0.7,
                    delay: 0.1 + i * 0.02,
                    ease: 'easeOut',
                  }}
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                />
              )
            })}

            {/* Вертикальные лучи света */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={`ray-${i}`}
                className="absolute pointer-events-none"
                style={{
                  width: '2px',
                  height: '100px',
                  left: '50%',
                  top: '50%',
                  marginLeft: '-1px',
                  marginTop: '-50px',
                  background: isFairy
                    ? 'linear-gradient(to bottom, transparent, rgba(252, 137, 172, 0.8), transparent)'
                    : 'linear-gradient(to bottom, transparent, rgba(139, 92, 246, 0.8), transparent)',
                  transformOrigin: 'center',
                }}
                initial={{
                  opacity: 0,
                  scaleY: 0,
                  rotate: i * 45,
                }}
                animate={{
                  opacity: [0, 0.8, 0],
                  scaleY: [0, 1.5, 0],
                  rotate: i * 45,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.1,
                  ease: 'easeOut',
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* The card */}
      <motion.div
        animate={!isRevealed ? {
          y: [0, -5, 0],
          rotateY: [0, 5, 0, -5, 0],
        } : {}}
        transition={{
          duration: 3,
          repeat: isRevealed ? 0 : Infinity,
          ease: 'easeInOut',
        }}
      >
        <TarotCard
          card={card}
          isReversed={isReversed}
          isRevealed={isRevealed}
          size="lg"
          showName={true}
          onClick={handleReveal}
          deckTheme={deckTheme}
        />
      </motion.div>

      {/* Tap hint - улучшенная версия */}
      {!isRevealed && (
        <motion.div
          className="absolute -bottom-12 left-0 right-0 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center gap-2"
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {isFairy ? '🦋' : '☽'}
            </motion.span>
            <span className="text-white/70 text-sm font-medium">
              Нажми, чтобы открыть
            </span>
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
            >
              {isFairy ? '🦋' : '☽'}
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
