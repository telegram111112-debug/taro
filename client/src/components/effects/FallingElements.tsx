import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface FallingElementsProps {
  theme: 'witch' | 'fairy'
  count?: number
  intensity?: 'light' | 'medium' | 'heavy'
}

// Элементы для ведьминской темы - готические, мистические
const witchElements = ['🥀', '🕯️', '🦇', '🌑', '🔮', '☠️', '🕸️', '⚰️', '🖤', '🌿']

// Элементы для фейской темы - милые, волшебные
const fairyElements = ['🌸', '🦋', '🌺', '💗', '🌷', '🍀', '🌈', '✨', '💫', '🎀']

export function FallingElements({
  theme,
  count,
  intensity = 'medium'
}: FallingElementsProps) {
  const particleCount = count ?? (intensity === 'light' ? 15 : intensity === 'medium' ? 25 : 40)
  const elements = theme === 'fairy' ? fairyElements : witchElements

  const particles = useMemo(() => {
    return [...Array(particleCount)].map((_, i) => ({
      id: i,
      element: elements[i % elements.length],
      startX: Math.random() * 100,
      duration: 10 + Math.random() * 15,
      delay: Math.random() * 8,
      size: theme === 'fairy' ? (0.8 + Math.random() * 0.6) : (0.7 + Math.random() * 0.5),
      swingAmount: 20 + Math.random() * 40,
      rotateAmount: theme === 'fairy' ? 360 : (Math.random() > 0.5 ? 180 : -180),
    }))
  }, [particleCount, elements, theme])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.startX}%`,
            top: '-10%',
            fontSize: `${particle.size}rem`,
            opacity: theme === 'fairy' ? 0.8 : 0.6,
            filter: theme === 'witch' ? 'drop-shadow(0 0 3px rgba(128, 90, 213, 0.5))' : 'drop-shadow(0 0 3px rgba(252, 137, 172, 0.5))',
          }}
          animate={{
            y: ['0vh', '120vh'],
            x: [
              '0%',
              `${particle.swingAmount}%`,
              `${-particle.swingAmount * 0.5}%`,
              `${particle.swingAmount * 0.3}%`,
              '0%'
            ],
            rotate: [0, particle.rotateAmount],
            scale: [1, 1.1, 0.9, 1.05, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {particle.element}
        </motion.div>
      ))}

      {/* Дополнительные светящиеся точки */}
      {[...Array(Math.floor(particleCount / 2))].map((_, i) => (
        <motion.div
          key={`glow-${i}`}
          className={`absolute w-1 h-1 rounded-full ${
            theme === 'fairy' ? 'bg-pink-300' : 'bg-purple-400'
          }`}
          style={{
            left: `${Math.random() * 100}%`,
            top: '-5%',
            boxShadow: theme === 'fairy'
              ? '0 0 6px 2px rgba(252, 137, 172, 0.6)'
              : '0 0 6px 2px rgba(139, 92, 246, 0.5)',
          }}
          animate={{
            y: ['0vh', '110vh'],
            opacity: [0, 0.8, 0.4, 0.8, 0],
            scale: [0.5, 1, 0.8, 1.2, 0.5],
          }}
          transition={{
            duration: 8 + Math.random() * 8,
            delay: Math.random() * 6,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}
