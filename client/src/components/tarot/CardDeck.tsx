import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useUserStore } from '../../store/useUserStore'
import { getThemeConfig } from '../../lib/deckThemes'
import { useTelegram } from '../../providers/TelegramProvider'
import type { DeckTheme } from '../../types'

// Генерируем случайные параметры для каждой карты (уменьшенные значения для мобильных экранов)
const generateCardRandomness = (count: number) => {
  return Array.from({ length: count }, () => ({
    xOffset: (Math.random() - 0.5) * 20,
    yOffset: (Math.random() - 0.5) * 15,
    rotateOffset: (Math.random() - 0.5) * 10,
    delay: Math.random() * 0.05,
    scale: 0.98 + Math.random() * 0.04,
  }))
}

interface CardDeckProps {
  isShuffling?: boolean
  onShuffleComplete?: () => void
  onCardSelect?: () => void
  deckTheme?: DeckTheme
  cardsCount?: number
  // Новые пропсы для поочередного выбора
  requiredSelections?: number // Сколько карт нужно выбрать
  selectedCount?: number // Сколько уже выбрано
  positionNames?: string[] // Названия позиций для подсказки
}

export function CardDeck({
  isShuffling = false,
  onShuffleComplete,
  onCardSelect,
  deckTheme,
  cardsCount = 7,
  requiredSelections = 1,
  selectedCount = 0,
  positionNames = [],
}: CardDeckProps) {
  const { user } = useUserStore()
  const { hapticFeedback } = useTelegram()
  const theme = deckTheme || user?.deckTheme || 'witch'
  const themeConfig = getThemeConfig(theme)

  const [shufflePhase, setShufflePhase] = useState<'idle' | 'shuffling' | 'spreading' | 'ready'>('idle')
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [flyingCardIndex, setFlyingCardIndex] = useState<number | null>(null)

  // Случайные параметры для каждой карты (мемоизированы)
  const cardRandomness = useMemo(() => generateCardRandomness(cardsCount), [cardsCount])

  // Магические частицы во время перетасовки
  const [showParticles, setShowParticles] = useState(false)

  useEffect(() => {
    if (isShuffling && shufflePhase === 'idle') {
      setShufflePhase('shuffling')
      setShowParticles(true)

      // Haptic feedback during shuffle - более интенсивный
      const hapticInterval = setInterval(() => {
        hapticFeedback('impact', 'medium')
      }, 150)

      // End shuffle after animation (увеличено время для более эффектной анимации)
      setTimeout(() => {
        clearInterval(hapticInterval)
        hapticFeedback('notification', 'success')
        setShufflePhase('spreading')
        setShowParticles(false)

        setTimeout(() => {
          setShufflePhase('ready')
          onShuffleComplete?.()
        }, 1000)
      }, 2500)

      return () => clearInterval(hapticInterval)
    }
  }, [isShuffling])

  const handleCardClick = (index: number) => {
    if (shufflePhase !== 'ready' || selectedIndices.includes(index) || isAnimating) return
    if (selectedCount >= requiredSelections) return

    hapticFeedback('impact', 'medium')
    setIsAnimating(true)
    setFlyingCardIndex(index)
    setSelectedIndices(prev => [...prev, index])

    // Анимация вылета карты вверх, потом вызов callback
    setTimeout(() => {
      setFlyingCardIndex(null)
      onCardSelect?.()
      setIsAnimating(false)
    }, 800)
  }

  const cards = [...Array(cardsCount)]

  return (
    <div className="relative w-full h-80 flex items-center justify-center">
      {/* Магические частицы при перетасовке */}
      <AnimatePresence>
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-lg"
                initial={{
                  x: '50%',
                  y: '50%',
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  x: `${50 + Math.cos(i * Math.PI / 6) * 80}%`,
                  y: `${50 + Math.sin(i * Math.PI / 6) * 80}%`,
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1.5, 1, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeOut',
                }}
              >
                {theme === 'witch' ? ['✧', '☽', '✦', '⭐'][i % 4] : ['✨', '🦋', '💫', '⋆'][i % 4]}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Stacked deck (idle/shuffling) */}
      <AnimatePresence>
        {(shufflePhase === 'idle' || shufflePhase === 'shuffling') && (
          <div className="relative">
            {cards.map((_, index) => {
              const randomness = cardRandomness[index]
              return (
                <motion.div
                  key={index}
                  className="absolute w-24 h-36 rounded-xl shadow-lg"
                  style={{
                    background: theme === 'witch'
                      ? 'linear-gradient(135deg, #1a1a2e, #16213e)'
                      : 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
                    border: `2px solid ${themeConfig.colors.cardBorder}`,
                    zIndex: index,
                    boxShadow: shufflePhase === 'shuffling'
                      ? `0 10px 40px ${theme === 'witch' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(252, 137, 172, 0.3)'}`
                      : '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                  initial={{
                    x: 0,
                    y: index * -2,
                    rotate: 0,
                    scale: 1,
                  }}
                  animate={
                    shufflePhase === 'shuffling'
                      ? {
                          // Компактная анимация перемешивания для мобильных экранов
                          x: [
                            0,
                            // Волна влево (уменьшено)
                            -35 + randomness.xOffset,
                            // Собираемся в центр
                            0,
                            // Волна вправо (уменьшено)
                            35 - randomness.xOffset,
                            // Веерное раскрытие (уменьшено)
                            (index - 3) * 15,
                            // Обратная волна (уменьшено)
                            -(index - 3) * 10,
                            // Финальная сборка
                            0
                          ],
                          y: [
                            index * -2,
                            // Подъём с волной (уменьшено)
                            -25 - Math.sin(index * 0.5) * 10,
                            // Опускание
                            -5 + index * -2,
                            // Снова подъём (уменьшено)
                            -20 - Math.cos(index * 0.7) * 8,
                            // Веер вверх (уменьшено)
                            -30 + Math.abs(index - 3) * 4,
                            // Плавное опускание
                            -15 + index * -2,
                            // Возврат
                            index * -2
                          ],
                          rotate: [
                            0,
                            // Поворот влево (уменьшено)
                            -8 + randomness.rotateOffset,
                            // Выравнивание
                            3,
                            // Поворот вправо (уменьшено)
                            8 - randomness.rotateOffset,
                            // Веерный разворот (уменьшено)
                            (index - 3) * 6,
                            // Обратный поворот (уменьшено)
                            -(index - 3) * 4,
                            // Финальное выравнивание
                            0
                          ],
                          scale: [1, 1.03, 1.01, 1.04, 1.05, 1.02, 1],
                        }
                      : {
                          x: 0,
                          y: index * -2,
                          rotate: 0,
                          scale: 1,
                        }
                  }
                  transition={{
                    duration: 3,
                    times: [0, 0.15, 0.3, 0.45, 0.65, 0.85, 1],
                    ease: 'easeInOut',
                    delay: index * 0.02,
                  }}
                >
                  <DeckCardBack theme={theme} isShuffling={shufflePhase === 'shuffling'} />
                </motion.div>
              )
            })}

            {/* Центральное свечение при перетасовке */}
            {shufflePhase === 'shuffling' && (
              <motion.div
                className="absolute inset-0 -z-10 rounded-full blur-3xl"
                style={{
                  background: theme === 'witch'
                    ? 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(252, 137, 172, 0.4) 0%, transparent 70%)',
                  width: '200px',
                  height: '200px',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                animate={{
                  scale: [1, 1.5, 1.2, 1.6, 1],
                  opacity: [0.3, 0.7, 0.5, 0.8, 0.3],
                }}
                transition={{
                  duration: 2.5,
                  ease: 'easeInOut',
                }}
              />
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Spread cards (ready to pick) */}
      <AnimatePresence>
        {(shufflePhase === 'spreading' || shufflePhase === 'ready') && (
          <div className="relative w-full flex items-center justify-center">
            {cards.map((_, index) => {
              const isSelected = selectedIndices.includes(index)
              const isFlying = flyingCardIndex === index
              const center = (cardsCount - 1) / 2
              const angle = ((index - center) * 12) // Уменьшенный угол для более плотного веера
              const offsetX = (index - center) * 38 // Горизонтальный разброс
              const arcY = Math.pow(Math.abs(index - center), 1.5) * 3 // Дуга снизу
              const canSelect = shufflePhase === 'ready' && !isSelected && !isAnimating && selectedCount < requiredSelections

              // Вычисляем целевую позицию для полёта карты (вверх к ряду выбранных карт)
              const targetX = (selectedCount - 1.5) * 70 // Позиция в ряду выбранных карт
              const targetY = -280 // Вверх экрана

              return (
                <motion.div
                  key={index}
                  className={`absolute w-20 h-32 rounded-xl ${canSelect ? 'cursor-pointer' : ''}`}
                  style={{
                    background: theme === 'witch'
                      ? 'linear-gradient(135deg, #1a1a2e, #16213e)'
                      : 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
                    border: `2px solid ${themeConfig.colors.cardBorder}`,
                    zIndex: isFlying ? 100 : isSelected ? -1 : 10 + index,
                    transformOrigin: 'center bottom',
                  }}
                  initial={{
                    x: 0,
                    y: -50,
                    rotate: 0,
                    scale: 0.8,
                    opacity: 0,
                  }}
                  animate={{
                    x: isFlying ? targetX : isSelected ? offsetX * 2 : offsetX,
                    y: isFlying ? targetY : isSelected ? 100 : arcY,
                    rotate: isFlying ? 0 : isSelected ? angle * 3 : angle,
                    scale: isFlying ? 0.7 : isSelected ? 0.5 : 1,
                    opacity: isSelected && !isFlying ? 0 : 1,
                  }}
                  whileHover={canSelect ? {
                    y: arcY - 25,
                    scale: 1.08,
                    rotate: angle * 0.5,
                    zIndex: 30,
                    transition: { type: 'spring', stiffness: 400, damping: 25 }
                  } : {}}
                  transition={isFlying ? {
                    type: 'spring',
                    damping: 20,
                    stiffness: 120,
                    duration: 0.7,
                  } : {
                    type: 'spring',
                    damping: 18,
                    stiffness: 180,
                    delay: shufflePhase === 'spreading' ? index * 0.06 : 0,
                  }}
                  onClick={() => handleCardClick(index)}
                >
                  <DeckCardBack theme={theme} isHoverable={canSelect} />

                  {/* Glow эффект при наведении */}
                  {canSelect && (
                    <motion.div
                      className="absolute inset-0 -z-10 blur-lg rounded-xl opacity-0"
                      style={{
                        background: theme === 'witch'
                          ? 'rgba(139, 92, 246, 0.5)'
                          : 'rgba(252, 137, 172, 0.5)',
                      }}
                      whileHover={{ opacity: 0.6 }}
                    />
                  )}

                  {/* Glow и эффекты для летящей карты */}
                  {isFlying && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                          opacity: [0.5, 1, 0.5],
                          scale: [1, 1.3, 1],
                        }}
                        transition={{
                          duration: 0.4,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="absolute inset-0 -z-10 blur-2xl rounded-xl"
                        style={{ background: themeConfig.colors.primary }}
                      />
                      {/* Искры за летящей картой */}
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute text-sm"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0],
                            x: Math.cos(i * Math.PI / 4) * 40,
                            y: Math.sin(i * Math.PI / 4) * 50 + 30, // Сдвиг вниз для эффекта хвоста
                          }}
                          transition={{
                            duration: 0.6,
                            delay: i * 0.05,
                            ease: 'easeOut',
                          }}
                          style={{
                            left: '50%',
                            top: '50%',
                          }}
                        >
                          {theme === 'witch' ? '✧' : '✨'}
                        </motion.div>
                      ))}
                    </>
                  )}
                </motion.div>
              )
            })}

            {/* Подсветка снизу при раскладывании */}
            {shufflePhase === 'spreading' && (
              <motion.div
                className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-80 h-20 rounded-full blur-3xl -z-10"
                style={{
                  background: theme === 'witch'
                    ? 'rgba(139, 92, 246, 0.3)'
                    : 'rgba(252, 137, 172, 0.3)',
                }}
                initial={{ opacity: 0, scaleX: 0.5 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.8 }}
              />
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Instruction text */}
      <AnimatePresence mode="wait">
        {shufflePhase === 'ready' && selectedCount < requiredSelections && !isAnimating && (
          <motion.div
            key={selectedCount}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-0 text-center"
          >
            <p className="text-white/80 text-sm font-medium mb-1">
              {positionNames[selectedCount] || `Карта ${selectedCount + 1}`}
            </p>
            <p className="text-white/50 text-xs">
              Выбрано {selectedCount} из {requiredSelections}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Mini card back for deck display
function DeckCardBack({
  theme,
  isShuffling = false,
  isHoverable = false
}: {
  theme: DeckTheme
  isShuffling?: boolean
  isHoverable?: boolean
}) {
  if (theme === 'witch') {
    return (
      <div className="w-full h-full rounded-lg overflow-hidden relative">
        {/* Card back image */}
        <img
          src="/cards/card-back-witch.jpg"
          alt="Card back"
          className="w-full h-full object-cover"
        />

        {/* Shimmer эффект при hover */}
        {isHoverable && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
            animate={{ x: ['-100%', '200%'] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Glow эффект при shuffling */}
        {isShuffling && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
            }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>
    )
  }

  // Fairy theme - Custom image card back
  return (
    <div className="w-full h-full rounded-lg overflow-hidden relative">
      {/* Card back image */}
      <img
        src="/cards/card-back-fairy.jpg"
        alt="Card back"
        className="w-full h-full object-cover"
      />

      {/* Shimmer эффект при hover */}
      {isHoverable && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full"
          animate={{ x: ['-100%', '200%'] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Glow эффект при shuffling */}
      {isShuffling && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(252, 137, 172, 0.3) 0%, transparent 70%)',
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  )
}
