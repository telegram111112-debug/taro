import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'primary-fairy' | 'secondary' | 'ghost' | 'danger' | 'glass-fairy' | 'glass-witch'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'

    const variants = {
      primary:
        'bg-gradient-to-r from-mystic-500 to-primary-500 text-white shadow-lg shadow-mystic-500/30 hover:shadow-xl hover:shadow-mystic-500/40',
      'primary-fairy':
        'bg-[#C4A0A5] text-white shadow-lg shadow-[#C4A0A5]/30 hover:bg-[#d4b0b5] hover:shadow-xl hover:shadow-[#C4A0A5]/40',
      secondary:
        'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20',
      ghost:
        'text-mystic-300 hover:text-white hover:bg-white/10',
      danger:
        'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30',
      'glass-fairy':
        'bg-[#C4A0A5] backdrop-blur-md border border-[#C4A0A5]/40 text-white shadow-lg shadow-[#C4A0A5]/30 hover:bg-[#d4b0b5]',
      'glass-witch':
        'bg-black/40 backdrop-blur-md border border-white/20 text-white shadow-lg shadow-black/20 hover:bg-black/50',
    }

    const sizes = {
      sm: 'text-sm py-2 px-4 gap-1.5',
      md: 'text-base py-3 px-6 gap-2',
      lg: 'text-lg py-4 px-8 gap-2.5',
    }

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
