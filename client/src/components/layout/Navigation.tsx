import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { useTelegram } from '../../providers/TelegramProvider'
import { useUserStore } from '../../store/useUserStore'

// Страницы, где навигация должна быть скрыта
const hiddenOnPages = ['/daily', '/ask', '/spread']

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
    isProfile: true,
  },
]

export function Navigation() {
  const location = useLocation()
  const { hapticFeedback } = useTelegram()
  const { user } = useUserStore()

  const isFairyTheme = user?.deckTheme === 'fairy'

  // Проверяем, нужно ли скрыть навигацию на текущей странице
  const shouldHide = hiddenOnPages.some(page => location.pathname.startsWith(page))

  return (
    <AnimatePresence>
    {!shouldHide && (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx(
      "fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t safe-area-bottom z-40",
      isFairyTheme
        ? "bg-[#FC89AC]/20 border-[#FC89AC]/20"
        : "bg-[#2a2a2a]/95 border-[#3a3a3a]/50"
    )}>
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const isProfileWithAvatar = item.isProfile && user?.avatar

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => hapticFeedback('selection')}
              className={clsx(
                'flex flex-col items-center justify-center gap-0.5 w-16 h-full relative',
                'transition-colors duration-200',
                isActive ? 'text-white' : 'text-white/50'
              )}
            >
              {isProfileWithAvatar ? (
                <motion.div
                  className={clsx(
                    'w-10 h-10 rounded-full overflow-hidden',
                    isActive && (isFairyTheme
                      ? 'ring-2 ring-[#FC89AC] ring-offset-1 ring-offset-transparent'
                      : 'ring-2 ring-slate-400 ring-offset-1 ring-offset-transparent')
                  )}
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ) : (
                <motion.span
                  className="text-xl"
                  animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {isActive ? item.activeIcon : item.icon}
                </motion.span>
              )}
              <span className="text-[10px] font-medium">
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className={clsx(
                    'absolute bottom-1 w-1 h-1 rounded-full',
                    isFairyTheme ? 'bg-[#FC89AC]' : 'bg-slate-400'
                  )}
                />
              )}
            </NavLink>
          )
        })}
      </div>
    </motion.nav>
    )}
    </AnimatePresence>
  )
}
