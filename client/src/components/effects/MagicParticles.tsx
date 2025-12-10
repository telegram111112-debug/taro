import { useMemo, memo } from 'react'
import { motion } from 'framer-motion'
import { useUserStore } from '../../store/useUserStore'

// Символы для ведьминской темы
const witchSymbols = ['🌙', '⭐', '✦', '☆', '✧']

// Символы для фейской темы
const fairySymbols = ['✨', '🦋', '💫', '✧', '⋆']

interface MagicParticlesProps {
  count?: number
  theme?: 'witch' | 'fairy' | 'auto'
  intensity?: 'light' | 'medium' | 'heavy'
}

export const MagicParticles = memo(function MagicParticles({
  count,
  theme = 'auto',
  intensity = 'medium'
}: MagicParticlesProps) {
  const { user } = useUserStore()

  const actualTheme = theme === 'auto'
    ? (user?.deckTheme || 'witch')
    : theme

  const particleCount = count ?? (intensity === 'light' ? 8 : intensity === 'medium' ? 15 : 25)
  const symbols = actualTheme === 'fairy' ? fairySymbols : witchSymbols

  // Мемоизируем случайные значения для каждой частицы
  const particleData = useMemo(() => {
    return [...Array(particleCount)].map((_, i) => ({
      startX: Math.random() * 100,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 5,
      sizeFairy: 0.6 + Math.random() * 0.8,
      sizeWitch: 0.5 + Math.random() * 0.6,
      xOffset1: (Math.random() - 0.5) * 50,
      xOffset2: (Math.random() - 0.5) * 30,
    }))
  }, [particleCount])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particleData.map((particle, i) => {
        const symbol = symbols[i % symbols.length]
        const size = actualTheme === 'fairy' ? particle.sizeFairy : particle.sizeWitch

        return (
          <motion.div
            key={i}
            className="absolute text-lg"
            style={{
              left: `${particle.startX}%`,
              top: '-5%',
              fontSize: `${size}rem`,
              opacity: actualTheme === 'fairy' ? 0.7 : 0.5,
              willChange: 'transform',
              transform: 'translateZ(0)',
            }}
            animate={{
              y: ['0vh', '110vh'],
              x: [
                '0%',
                `${particle.xOffset1}%`,
                `${particle.xOffset2}%`,
                '0%'
              ],
              rotate: actualTheme === 'fairy'
                ? [0, 180, 360]
                : [0, 10, -10, 0],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {symbol}
          </motion.div>
        )
      })}
    </div>
  )
})

// Легкая версия для страниц с контентом
export function MagicParticlesLight() {
  return <MagicParticles intensity="light" />
}

// Более интенсивная для специальных страниц
export function MagicParticlesHeavy() {
  return <MagicParticles intensity="heavy" />
}
