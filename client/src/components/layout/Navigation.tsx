import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { useTelegram } from '../../providers/TelegramProvider'

const navItems = [
  {
    path: '/',
    label: 'Главная',
    icon: '🏠',
    activeIcon: '✨',
  },
  {
    path: '/daily',
    label: 'Карта дня',
    icon: '🔮',
    activeIcon: '🌟',
  },
  {
    path: '/referrals',
    label: 'Подруги',
    icon: '💝',
    activeIcon: '💕',
  },
  {
    path: '/profile',
    label: 'Профиль',
    icon: '👤',
    activeIcon: '💜',
  },
]

export function Navigation() {
  const location = useLocation()
  const { hapticFeedback } = useTelegram()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 safe-area-bottom z-40">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => hapticFeedback('selection')}
              className={clsx(
                'flex flex-col items-center justify-center gap-0.5 w-16 h-full',
                'transition-colors duration-200',
                isActive ? 'text-white' : 'text-white/50'
              )}
            >
              <motion.span
                className="text-xl"
                animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {isActive ? item.activeIcon : item.icon}
              </motion.span>
              <span className="text-[10px] font-medium">
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-1 w-1 h-1 rounded-full bg-mystic-400"
                />
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
