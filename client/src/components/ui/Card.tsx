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
    // Witch theme variants - тёмно-серый с прозрачностью
    'mystic-witch':
      'bg-gradient-to-b from-slate-800/15 to-slate-900/20 backdrop-blur-md border border-slate-500/20 shadow-slate-500/10',
    'glass-witch': 'bg-slate-900/10 backdrop-blur-md border border-slate-500/15',
    // Fairy theme variants - нежный розовый #FC89AC с прозрачностью
    'mystic-fairy':
      'bg-[#FC89AC]/15 backdrop-blur-md border border-[#FC89AC]/20 shadow-[#FC89AC]/10',
    'glass-fairy': 'bg-[#FC89AC]/15 backdrop-blur-md border border-[#FC89AC]/15',
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
