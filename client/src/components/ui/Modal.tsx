import { ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'full'
  showClose?: boolean
  backgroundImage?: string
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  showClose = true,
  backgroundImage,
}: ModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full mx-4',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={clsx(
              'relative w-full overflow-hidden',
              !backgroundImage && 'bg-gradient-to-b from-mystic-900/95 to-mystic-950/95',
              'backdrop-blur-xl border border-white/10 shadow-2xl',
              'rounded-t-3xl sm:rounded-3xl p-6',
              sizes[size]
            )}
          >
            {/* Background Image */}
            {backgroundImage && (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${backgroundImage})` }}
                />
                <div className="absolute inset-0 bg-black/50" />
              </>
            )}
            {/* Close button */}
            {showClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              >
                <svg
                  className="w-5 h-5 text-white/70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}

            {/* Title */}
            {title && (
              <h2 className="text-xl font-display font-semibold text-white mb-4 pr-8 relative z-10">
                {title}
              </h2>
            )}

            {/* Content */}
            <div className="relative z-10">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
