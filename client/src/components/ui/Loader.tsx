import { clsx } from 'clsx'
import { motion } from 'framer-motion'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function Loader({ size = 'md', className, text }: LoaderProps) {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  }

  return (
    <div className={clsx('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={clsx(
          'border-mystic-500 border-t-transparent rounded-full animate-spin',
          sizes[size]
        )}
      />
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white/60 text-sm"
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

export function PageLoader({ text = 'Загрузка...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader size="lg" text={text} />
    </div>
  )
}

export function MysticLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          className="w-20 h-20 rounded-full border-2 border-mystic-500/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        {/* Inner ring */}
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-gold-400/50"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        {/* Center glow */}
        <motion.div
          className="absolute inset-4 rounded-full bg-mystic-500/20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {/* Star icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-2xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✨
          </motion.span>
        </div>
      </div>
      <motion.p
        className="text-white/60 text-sm"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Карты перемешиваются...
      </motion.p>
    </div>
  )
}
