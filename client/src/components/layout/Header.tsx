import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTelegram } from '../../providers/TelegramProvider'

interface HeaderProps {
  title?: string
  subtitle?: string
  showBack?: boolean
  rightContent?: ReactNode
  transparent?: boolean
}

export function Header({
  title,
  subtitle,
  showBack = false,
  rightContent,
  transparent = false,
}: HeaderProps) {
  const navigate = useNavigate()
  const { hapticFeedback } = useTelegram()

  const handleBack = () => {
    hapticFeedback('impact', 'light')
    navigate(-1)
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        sticky top-0 z-30 px-4 py-3
        ${transparent ? '' : 'bg-black/50 backdrop-blur-xl border-b border-white/5'}
      `}
    >
      <div className="flex items-center justify-between">
        {/* Left - Back button or spacer */}
        <div className="w-10">
          {showBack && (
            <button
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Center - Title */}
        <div className="flex-1 text-center">
          {title && (
            <h1 className="text-lg font-display font-semibold text-white">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-xs text-white/50">{subtitle}</p>
          )}
        </div>

        {/* Right - Custom content or spacer */}
        <div className="w-10 flex justify-end">
          {rightContent}
        </div>
      </div>
    </motion.header>
  )
}
