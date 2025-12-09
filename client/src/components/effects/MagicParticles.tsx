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

export function MagicParticles({
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

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(particleCount)].map((_, i) => {
        const symbol = symbols[i % symbols.length]
        const startX = Math.random() * 100
        const duration = 8 + Math.random() * 12
        const delay = Math.random() * 5
        const size = actualTheme === 'fairy'
          ? (0.6 + Math.random() * 0.8)
          : (0.5 + Math.random() * 0.6)

        return (
          <motion.div
            key={i}
            className="absolute text-lg"
            style={{
              left: `${startX}%`,
              top: '-5%',
              fontSize: `${size}rem`,
              opacity: actualTheme === 'fairy' ? 0.7 : 0.5,
            }}
            animate={{
              y: ['0vh', '110vh'],
              x: [
                '0%',
                `${(Math.random() - 0.5) * 50}%`,
                `${(Math.random() - 0.5) * 30}%`,
                '0%'
              ],
              rotate: actualTheme === 'fairy'
                ? [0, 180, 360]
                : [0, 10, -10, 0],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration,
              delay,
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
}

// Легкая версия для страниц с контентом
export function MagicParticlesLight() {
  return <MagicParticles intensity="light" />
}

// Более интенсивная для специальных страниц
export function MagicParticlesHeavy() {
  return <MagicParticles intensity="heavy" />
}
