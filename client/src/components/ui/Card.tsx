import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'glass' | 'mystic' | 'solid' | 'mystic-witch' | 'glass-witch' | 'mystic-fairy' | 'glass-fairy'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onClick?: () => void
  animated?: boolean
}

export function Card({
  children,
  className,
  variant = 'glass',
  padding = 'md',
  onClick,
  animated = false,
}: CardProps) {
  const variants = {
    glass: 'bg-white/5 backdrop-blur-md border-0',
    mystic:
      'bg-gradient-to-b from-mystic-900/50 to-mystic-950/50 backdrop-blur-md border border-mystic-500/20 shadow-mystic-500/10',
    solid: 'bg-mystic-900/80 border border-mystic-700/30',
    // Witch theme variants - тёмно-серый с прозрачностью (улучшенный контраст)
    'mystic-witch':
      'bg-gradient-to-b from-[#2a2a2a]/70 to-[#1f1f1f]/80 backdrop-blur-md border border-white/20 shadow-black/20',
    'glass-witch': 'bg-[#2a2a2a]/60 backdrop-blur-md border border-white/15',
    // Fairy theme variants - нежный розовый #C4A0A5 с прозрачностью (улучшенный контраст)
    'mystic-fairy':
      'bg-[#C4A0A5]/25 backdrop-blur-md border border-[#C4A0A5]/25 shadow-[#C4A0A5]/15',
    'glass-fairy': 'bg-[#C4A0A5]/25 backdrop-blur-md border border-[#C4A0A5]/20',
  }

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const Component = animated ? motion.div : 'div'
  const animationProps = animated
    ? {
        whileHover: { scale: 1.02 },
        whileTap: onClick ? { scale: 0.98 } : {},
      }
    : {}

  return (
    <Component
      className={clsx(
        'rounded-2xl shadow-xl',
        variants[variant],
        paddings[padding],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...animationProps}
    >
      {children}
    </Component>
  )
}
