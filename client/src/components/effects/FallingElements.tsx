import { motion } from 'framer-motion'
import { useMemo, memo } from 'react'

interface FallingElementsProps {
  theme: 'witch' | 'fairy'
  count?: number
  intensity?: 'light' | 'medium' | 'heavy'
}

// Элементы для фейской темы - милые, волшебные
const fairyElements = ['🌸', '🦋', '🌺', '💗', '🌷', '🍀', '🌈', '✨', '💫', '🎀']

// Мистические руны для ведьминской темы
const witchRunes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ']

export const FallingElements = memo(function FallingElements({
  theme,
  count,
  intensity = 'medium'
}: FallingElementsProps) {
  const particleCount = count ?? (intensity === 'light' ? 15 : intensity === 'medium' ? 25 : 40)

  // Для фейской темы - падающие элементы с эмодзи
  const fairyParticles = useMemo(() => {
    return [...Array(particleCount)].map((_, i) => ({
      id: i,
      element: fairyElements[i % fairyElements.length],
      startX: Math.random() * 100,
      duration: 10 + Math.random() * 15,
      delay: Math.random() * 8,
      size: 0.8 + Math.random() * 0.6,
      swingAmount: 20 + Math.random() * 40,
      rotateAmount: 360,
    }))
  }, [particleCount])

  // Для ведьминской темы - мистические орбы
  const witchOrbs = useMemo(() => {
    return [...Array(Math.floor(particleCount * 0.4))].map((_, i) => ({
      id: i,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      size: 4 + Math.random() * 8,
      duration: 15 + Math.random() * 10,
      delay: Math.random() * 5,
      driftX: (Math.random() - 0.5) * 100,
      driftY: (Math.random() - 0.5) * 50,
    }))
  }, [particleCount])

  // Плавающие руны для ведьминской темы
  const witchRuneParticles = useMemo(() => {
    return [...Array(Math.floor(particleCount * 0.3))].map((_, i) => ({
      id: i,
      rune: witchRunes[Math.floor(Math.random() * witchRunes.length)],
      startX: Math.random() * 100,
      startY: 100 + Math.random() * 20,
      duration: 12 + Math.random() * 8,
      delay: Math.random() * 6,
      size: 14 + Math.random() * 10,
    }))
  }, [particleCount])

  // Вертикальные линии света для ведьминской темы
  const lightBeams = useMemo(() => {
    return [...Array(Math.floor(particleCount * 0.15))].map((_, i) => ({
      id: i,
      startX: Math.random() * 100,
      width: 1 + Math.random() * 2,
      duration: 8 + Math.random() * 6,
      delay: Math.random() * 10,
    }))
  }, [particleCount])

  // Мерцающие звёзды/точки для ведьминской темы
  const witchStars = useMemo(() => {
    return [...Array(Math.floor(particleCount * 0.5))].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 4,
    }))
  }, [particleCount])

  // Мемоизируем данные для светящихся точек (для обеих тем)
  const glowParticles = useMemo(() => {
    return [...Array(Math.floor(particleCount / 2))].map((_, i) => ({
      id: i,
      startX: Math.random() * 100,
      duration: 8 + Math.random() * 8,
      delay: Math.random() * 6,
    }))
  }, [particleCount])

  // Рендер для фейской темы
  if (theme === 'fairy') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {fairyParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.startX}%`,
              top: '-10%',
              fontSize: `${particle.size}rem`,
              opacity: 0.8,
              filter: 'drop-shadow(0 0 3px rgba(196, 160, 165, 0.5))',
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

        {/* Светящиеся точки для фейской темы */}
        {glowParticles.map((glow) => (
          <motion.div
            key={`glow-${glow.id}`}
            className="absolute w-1 h-1 rounded-full bg-[#C4A0A5]"
            style={{
              left: `${glow.startX}%`,
              top: '-5%',
              boxShadow: '0 0 6px 2px rgba(196, 160, 165, 0.6)',
            }}
            animate={{
              y: ['0vh', '110vh'],
              opacity: [0, 0.8, 0.4, 0.8, 0],
              scale: [0.5, 1, 0.8, 1.2, 0.5],
            }}
            transition={{
              duration: glow.duration,
              delay: glow.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    )
  }

  // Рендер для ведьминской темы - полностью новая мистическая анимация
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Мистические светящиеся орбы */}
      {witchOrbs.map((orb) => (
        <motion.div
          key={`orb-${orb.id}`}
          className="absolute rounded-full"
          style={{
            left: `${orb.startX}%`,
            top: `${orb.startY}%`,
            width: orb.size,
            height: orb.size,
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 40%, transparent 70%)',
            boxShadow: `0 0 ${orb.size * 2}px ${orb.size / 2}px rgba(255, 255, 255, 0.15)`,
          }}
          animate={{
            x: [0, orb.driftX, orb.driftX * 0.5, orb.driftX * -0.3, 0],
            y: [0, orb.driftY, orb.driftY * -0.5, orb.driftY * 0.8, 0],
            opacity: [0.2, 0.5, 0.3, 0.6, 0.2],
            scale: [1, 1.3, 0.9, 1.2, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Плавающие руны (всплывают снизу вверх) */}
      {witchRuneParticles.map((rune) => (
        <motion.div
          key={`rune-${rune.id}`}
          className="absolute font-serif"
          style={{
            left: `${rune.startX}%`,
            bottom: '-10%',
            fontSize: rune.size,
            color: 'rgba(255, 255, 255, 0.15)',
            textShadow: '0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.1)',
          }}
          animate={{
            y: [0, -window.innerHeight * 1.2],
            opacity: [0, 0.4, 0.6, 0.4, 0],
            rotate: [0, 15, -10, 5, 0],
            scale: [0.8, 1, 1.1, 1, 0.9],
          }}
          transition={{
            duration: rune.duration,
            delay: rune.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        >
          {rune.rune}
        </motion.div>
      ))}

      {/* Вертикальные лучи света */}
      {lightBeams.map((beam) => (
        <motion.div
          key={`beam-${beam.id}`}
          className="absolute"
          style={{
            left: `${beam.startX}%`,
            top: 0,
            width: beam.width,
            height: '100%',
            background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.05) 20%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.05) 80%, transparent 100%)',
          }}
          animate={{
            opacity: [0, 0.6, 0.3, 0.7, 0],
            scaleY: [0.5, 1, 0.8, 1, 0.5],
          }}
          transition={{
            duration: beam.duration,
            delay: beam.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Мерцающие звёзды/точки */}
      {witchStars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0, 0.8, 0, 0.6, 0],
            scale: [0.5, 1.5, 0.8, 1.2, 0.5],
            boxShadow: [
              '0 0 2px 1px rgba(255,255,255,0.2)',
              '0 0 8px 3px rgba(255,255,255,0.4)',
              '0 0 3px 1px rgba(255,255,255,0.1)',
              '0 0 6px 2px rgba(255,255,255,0.3)',
              '0 0 2px 1px rgba(255,255,255,0.2)',
            ],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Туманная дымка внизу */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)',
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Мистический туман сверху */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-24"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, transparent 100%)',
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
})
