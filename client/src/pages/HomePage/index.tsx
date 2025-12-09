import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUserStore } from '../../store/useUserStore'
import { useCardsStore } from '../../store/useCardsStore'
import { useTelegram } from '../../providers/TelegramProvider'
import { Card, Button } from '../../components/ui'
import { MagicParticlesLight } from '../../components/effects'
import { getMoonPhase, getMoonEmoji, getMoonName } from '../../lib/moonPhase'
import { getRandomGreeting } from '../../lib/greetings'
import { getThemeEmoji } from '../../lib/themeEmojis'

export function HomePage() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const { todayReading } = useCardsStore()
  const { hapticFeedback } = useTelegram()

  const moonPhase = getMoonPhase(new Date())
  const streakCount = user?.streakCount || 0
  const completedWeeks = Math.floor(streakCount / 7)

  // Сохраняем приветствие в state, чтобы оно не менялось при каждом рендере
  const [greeting] = useState(() => getRandomGreeting())

  const isFairyTheme = user?.deckTheme === 'fairy'
  const isWitchTheme = user?.deckTheme === 'witch' || !user?.deckTheme

  return (
    <div className="min-h-screen p-4 pb-24 relative">
      {/* Background based on theme */}
      {isWitchTheme && (
        <>
          <div
            className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
            style={{ backgroundImage: 'url(/backgrounds/background-witch.jpg)' }}
          />
          <div className="fixed inset-0 bg-black/60 -z-10" />
        </>
      )}
      {isFairyTheme && (
        <>
          <div
            className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
            style={{ backgroundImage: 'url(/backgrounds/background-fairy.jpg)' }}
          />
          <div className="fixed inset-0 bg-black/40 -z-10" />
        </>
      )}

      {/* Magic particles */}
      <MagicParticlesLight />

      {/* Header with greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mb-6 text-center"
      >
        <p className="text-white/60 text-sm text-center">
          {greeting}
        </p>
        <h1 className="text-2xl font-display font-bold text-white text-center">
          {user?.name || 'Путница'} {getThemeEmoji(user?.deckTheme, 'secondary')}
        </h1>
      </motion.div>

      {/* Ask Tarot Card - Вопрос картам */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        <Card
          variant={isFairyTheme ? 'mystic-fairy' : 'mystic-witch'}
          className="mb-4 overflow-hidden relative cursor-pointer"
          onClick={() => {
            hapticFeedback('impact', 'light')
            navigate('/ask')
          }}
        >
          {/* Animated sparkle background */}
          <div className="absolute inset-0 opacity-30">
            <motion.div
              className="absolute top-2 left-4 text-xs"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0 }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute top-4 right-8 text-xs"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            >
              {isFairyTheme ? '🦋' : '🌙'}
            </motion.div>
            <motion.div
              className="absolute bottom-3 left-8 text-xs"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            >
              {isFairyTheme ? '💫' : '✦'}
            </motion.div>
            <motion.div
              className="absolute bottom-2 right-4 text-xs"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
            >
              {isFairyTheme ? '⭐' : '☽'}
            </motion.div>
          </div>

          <div className="relative text-center">
            {/* Main icon */}
            <div className="flex flex-col items-center mb-4">
              <motion.div
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg mb-3 ${
                  isFairyTheme
                    ? 'bg-gradient-to-br from-[#FC89AC]/70 via-[#FC89AC]/80 to-[#FC89AC]'
                    : 'bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700'
                }`}
                animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span className="text-3xl">{isFairyTheme ? '🔮' : '🌙'}</span>
              </motion.div>
              <h3 className="text-white font-display font-bold text-xl mb-1">
                {isFairyTheme ? 'Задай вопрос картам' : 'Вопроси судьбу'}
              </h3>
              <p className="text-white/60 text-sm">
                {isFairyTheme ? '1 вопрос в день — карты ответят' : 'Раскрой тайны через карты'}
              </p>
            </div>

            {/* Button */}
            <motion.div
              className={`w-full rounded-xl p-4 flex items-center justify-center gap-3 ${
                isFairyTheme
                  ? 'bg-gradient-to-r from-[#FC89AC]/20 to-pink-500/20 border border-[#FC89AC]/30'
                  : 'bg-gradient-to-r from-slate-500/20 to-slate-600/20 border border-slate-500/30'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.span
                className="text-2xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {isFairyTheme ? '🦋' : '🔮'}
              </motion.span>
              <span className={`font-medium ${isFairyTheme ? 'text-[#FC89AC]' : 'text-slate-300'}`}>
                {isFairyTheme ? 'Спросить карты' : 'Задать вопрос'}
              </span>
              <span className="text-white/40">→</span>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Daily Card CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Card
          variant="glass"
          className="mb-4 overflow-hidden"
          onClick={() => {
            hapticFeedback('impact', 'light')
            navigate('/daily')
          }}
        >
          <div className="relative p-2">
            {/* Background decoration */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: isFairyTheme
                  ? 'radial-gradient(circle at 80% 20%, #e879f9, transparent 50%)'
                  : 'radial-gradient(circle at 80% 20%, #94a3b8, transparent 50%)',
              }}
            />

            <div className="relative flex items-center gap-4">
              <motion.div
                className={`w-20 h-28 rounded-xl overflow-hidden flex items-center justify-center bg-cover bg-center border ${
                  isFairyTheme ? 'border-[#FC89AC]/20' : 'border-slate-400/30'
                }`}
                style={{
                  backgroundImage: isFairyTheme
                    ? 'url(/backgrounds/card-preview-fairy.jpg)'
                    : 'url(/backgrounds/card-preview-witch.jpg)',
                }}
                animate={{ rotate: todayReading ? 0 : [0, 2, -2, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {todayReading && (
                  <motion.div
                    className="w-full h-full bg-black/50 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.span
                      className="text-3xl text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                    >
                      ✓
                    </motion.span>
                  </motion.div>
                )}
              </motion.div>

              <div className="flex-1">
                <h3 className="text-white font-display font-semibold text-lg mb-1">
                  {todayReading ? 'Твоя карта дня' : 'Карта дня'}
                </h3>
                <p className="text-white/60 text-sm mb-3">
                  {todayReading
                    ? 'Посмотри свой расклад'
                    : 'Узнай, что приготовила вселенная'}
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  {/* Glow effect for button */}
                  {!todayReading && (
                    <motion.div
                      className={`absolute inset-0 rounded-xl blur-md ${
                        isFairyTheme
                          ? 'bg-[#FC89AC]/40'
                          : 'bg-slate-400/60'
                      }`}
                      animate={{
                        opacity: [0.4, 0.8, 0.4],
                        scale: [1, 1.05, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  <Button
                    size="sm"
                    variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'}
                    className="w-full relative"
                  >
                    {todayReading ? 'Посмотреть' : 'Вытянуть карту'} {getThemeEmoji(user?.deckTheme, 'button')}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Moon Phase */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
      >
        <Card variant="glass" className="mb-4">
          <div className="flex items-center gap-4">
            <div
              className="text-4xl"
              style={{
                filter: isFairyTheme
                  ? 'sepia(100%) hue-rotate(290deg) saturate(3) brightness(1.1)'
                  : 'grayscale(100%) brightness(2)'
              }}
            >
              {getMoonEmoji(moonPhase)}
            </div>
            <div>
              <p className="text-white/60 text-sm">Лунная фаза</p>
              <p className="text-white font-medium">{getMoonName(moonPhase)}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions - Spreads */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.2 }}
        className="mb-4"
      >
        <h2 className="text-white/80 font-medium mb-3 text-center">Расклады</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { type: 'love', icon: isFairyTheme ? '/icons/spread-love-fairy.png' : '/icons/spread-love-witch.png', label: 'Любовь', size: 48 },
            { type: 'money', icon: isFairyTheme ? '/icons/spread-money-fairy.png' : '/icons/spread-money-witch.png', label: 'Деньги', size: 40 },
            { type: 'future', icon: '/icons/crystal-ball.png', label: 'Будущее', size: 40 },
          ].map(({ type, icon, label, size }) => (
            <Card
              key={type}
              variant="glass"
              padding="sm"
              onClick={() => {
                hapticFeedback('selection')
                navigate(`/spread/${type}`)
              }}
              className="text-center cursor-pointer hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 mx-auto mb-1 flex items-center justify-center">
                <img
                  src={icon}
                  alt={label}
                  style={{ width: size, height: size }}
                  className="object-contain"
                />
              </div>
              <span className="text-white/80 text-sm">{label}</span>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Available spreads */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.25 }}
      >
        <Link to="/gifts">
          <Card variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'} className={isFairyTheme ? 'border-[#FC89AC]/15' : 'border-slate-500/20'}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white font-medium">Доступные расклады {getThemeEmoji(user?.deckTheme, 'gift')}</p>
                <p className="text-white/50 text-sm">{completedWeeks > 0 ? `${completedWeeks} ${completedWeeks === 1 ? 'расклад' : completedWeeks < 5 ? 'расклада' : 'раскладов'} в подарок` : 'Заходи каждый день!'}</p>
              </div>
              <span className="text-white/40">{getThemeEmoji(user?.deckTheme, 'arrow')}</span>
            </div>
          </Card>
        </Link>
      </motion.div>

      {/* Invite friends */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.3 }}
        className="mt-4"
      >
        <Link to="/referrals">
          <Card variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'} className={isFairyTheme ? 'border-[#FC89AC]/15' : 'border-slate-500/20'}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white font-medium">Пригласи подругу {getThemeEmoji(user?.deckTheme, 'love')}</p>
                <p className="text-white/50 text-sm">Получи бесплатный расклад</p>
              </div>
              <span className="text-white/40">{getThemeEmoji(user?.deckTheme, 'arrow')}</span>
            </div>
          </Card>
        </Link>
      </motion.div>
    </div>
  )
}


function getDayWord(count: number): string {
  if (count === 0) return 'дней'
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'дней'
  if (lastDigit === 1) return 'день'
  if (lastDigit >= 2 && lastDigit <= 4) return 'дня'
  return 'дней'
}

function getNextRewardDays(streak: number): number {
  const rewards = [7, 14, 30, 100]
  for (const reward of rewards) {
    if (streak < reward) return reward - streak
  }
  return 100 - (streak % 100)
}
