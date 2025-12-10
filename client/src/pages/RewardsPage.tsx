import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUserStore } from '../store/useUserStore'
import { Header } from '../components/layout'
import { Button } from '../components/ui'
import { MagicParticlesLight } from '../components/effects'
import { useNavigate } from 'react-router-dom'

export function RewardsPage() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const [loading, setLoading] = useState(true)
  const [referralCount] = useState(3) // mock data
  const [totalSpreads] = useState(3) // mock data

  const milestones = [1, 3, 5, 10]

  useEffect(() => {
    setTimeout(() => setLoading(false), 300)
  }, [])

  const isWitchTheme = user?.deckTheme === 'witch' || !user?.deckTheme
  const isFairyTheme = user?.deckTheme === 'fairy'

  // Theme colors matching HomePage
  const themeColors = {
    // Witch: neutral gray tones, Fairy: #C4A0A5 muted pink
    primary: isFairyTheme ? 'from-[#C4A0A5] to-[#B090A0]' : 'from-white/60 to-white/50',
    secondary: isFairyTheme ? 'from-[#C4A0A5]/25 to-[#B090A0]/25' : 'from-black/20 to-black/30',
    accent: isFairyTheme ? 'text-white' : 'text-white/80',
    accentBg: isFairyTheme ? 'bg-[#C4A0A5]' : 'bg-white/50',
    border: isFairyTheme ? 'border-[#C4A0A5]/40' : 'border-white/20',
    glow: isFairyTheme ? 'rgba(196, 160, 165, 0.5)' : 'rgba(255, 255, 255, 0.4)',
    progressBg: isFairyTheme ? 'from-[#C4A0A5] to-[#B090A0]' : 'from-white/60 to-white/50',
  }

  // Theme-specific emojis
  const emojis = {
    achieved: isFairyTheme ? '🦋' : '🔮',
    pending: isFairyTheme ? '✨' : '🌙',
    gift: isFairyTheme ? '💕' : '💫',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className={`w-10 h-10 border-2 ${isFairyTheme ? 'border-[#C4A0A5]' : 'border-white/60'} border-t-transparent rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: `url(/backgrounds/background-${isWitchTheme ? 'witch' : 'fairy'}.jpg)` }}
      />
      <div className={`fixed inset-0 -z-10 ${isWitchTheme ? 'bg-black/60' : 'bg-black/55'}`} />

      <MagicParticlesLight />

      <Header title="Награды" />

      <div className="p-4 pb-24">
        {/* Stats Circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <motion.div
              className={`w-32 h-32 rounded-full bg-gradient-to-br ${themeColors.primary} flex flex-col items-center justify-center shadow-2xl`}
              style={{
                boxShadow: `0 0 40px ${themeColors.glow}`,
                willChange: 'transform, box-shadow',
                transform: 'translateZ(0)',
              }}
              animate={{ boxShadow: [`0 0 30px ${themeColors.glow}`, `0 0 50px ${themeColors.glow}`, `0 0 30px ${themeColors.glow}`] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-4xl font-bold text-white">{totalSpreads}</span>
              <span className="text-white/80 text-xs">раскладов</span>
            </motion.div>

            {/* Decorative ring */}
            <div className={`absolute inset-0 rounded-full border-2 ${themeColors.border} scale-110`} />
          </div>
        </motion.div>

        {/* Progress bar - Epic animated version */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 relative"
        >
          {/* Milestone markers with animations */}
          <div className="flex justify-between mb-3 relative">
            {milestones.map((m, i) => {
              const achieved = referralCount >= m
              const isNext = referralCount < m && (i === 0 || referralCount >= milestones[i - 1])
              return (
                <div key={m} className="relative flex flex-col items-center">
                  {/* Floating sparkle for next milestone */}
                  {isNext && (
                    <motion.span
                      className={`absolute -top-4 text-sm ${isFairyTheme ? 'text-[#C4A0A5]' : 'text-white/60'}`}
                      style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
                      animate={{
                        y: [-2, 2, -2],
                        opacity: [0.5, 1, 0.5],
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {isFairyTheme ? '✧' : '☆'}
                    </motion.span>
                  )}

                  {/* Achievement glow ring */}
                  {achieved && (
                    <motion.div
                      className={`absolute -inset-1 rounded-full ${
                        isFairyTheme ? 'bg-[#C4A0A5]/30' : 'bg-white/20'
                      }`}
                      style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    />
                  )}

                  <motion.div
                    className={`text-xs font-bold relative z-10 ${
                      achieved
                        ? themeColors.accent
                        : isNext
                          ? isFairyTheme ? 'text-[#C4A0A5]/80' : 'text-white/60'
                          : 'text-white/30'
                    }`}
                    animate={achieved ? {
                      scale: [1, 1.1, 1],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  >
                    {m}
                  </motion.div>
                </div>
              )
            })}
          </div>

          {/* Progress bar container with glow */}
          <div className="relative">
            {/* Background glow under progress */}
            <motion.div
              className={`absolute -inset-1 rounded-full blur-md ${
                isFairyTheme ? 'bg-[#C4A0A5]/20' : 'bg-white/10'
              }`}
              style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
              animate={{
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Track */}
            <div className="h-3 bg-white/10 rounded-full overflow-hidden relative backdrop-blur-sm border border-white/5">
              {/* Animated progress fill */}
              <motion.div
                className={`h-full bg-gradient-to-r ${themeColors.progressBg} rounded-full relative overflow-hidden`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((referralCount / 10) * 100, 100)}%` }}
                transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />

                {/* Sparkle particles inside progress */}
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute w-1 h-1 rounded-full ${
                      isFairyTheme ? 'bg-white/60' : 'bg-white/50'
                    }`}
                    style={{
                      left: `${20 + i * 15}%`,
                      top: '50%',
                      willChange: 'transform, opacity',
                      transform: 'translateZ(0)',
                    }}
                    animate={{
                      y: [-4, 4, -4],
                      opacity: [0.3, 0.8, 0.3],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 1.5 + i * 0.2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </motion.div>

              {/* Milestone dots on track */}
              {milestones.map((m, i) => {
                const position = (m / 10) * 100
                const achieved = referralCount >= m
                return (
                  <motion.div
                    key={m}
                    className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border ${
                      achieved
                        ? isFairyTheme
                          ? 'bg-white border-[#C4A0A5] shadow-lg shadow-[#C4A0A5]/50'
                          : 'bg-white border-white/50 shadow-lg shadow-white/30'
                        : 'bg-white/20 border-white/30'
                    }`}
                    style={{
                      left: `${position}%`,
                      transform: 'translate(-50%, -50%) translateZ(0)',
                      willChange: achieved ? 'transform, box-shadow' : 'auto',
                    }}
                    animate={achieved ? {
                      scale: [1, 1.3, 1],
                      boxShadow: isFairyTheme
                        ? ['0 0 5px rgba(196,160,165,0.5)', '0 0 15px rgba(196,160,165,0.8)', '0 0 5px rgba(196,160,165,0.5)']
                        : ['0 0 5px rgba(255,255,255,0.3)', '0 0 15px rgba(255,255,255,0.6)', '0 0 5px rgba(255,255,255,0.3)']
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                  />
                )
              })}
            </div>

            {/* Floating particles around progress bar */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-1.5 h-1.5 rounded-full ${
                  isFairyTheme ? 'bg-[#C4A0A5]/50' : 'bg-white/30'
                }`}
                style={{
                  left: `${10 + i * 15}%`,
                  top: i % 2 === 0 ? '-8px' : 'calc(100% + 4px)',
                  willChange: 'transform, opacity',
                  transform: 'translateZ(0)',
                }}
                animate={{
                  y: i % 2 === 0 ? [-3, 3, -3] : [3, -3, 3],
                  x: [-2, 2, -2],
                  opacity: [0.2, 0.6, 0.2],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>

          {/* Animated text */}
          <motion.p
            className="text-center text-white/70 text-xs mt-3 font-medium"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <motion.span
              className={`inline-block mr-1 ${isFairyTheme ? 'text-[#C4A0A5]' : 'text-white/80'}`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {referralCount}
            </motion.span>
            из 10 подруг
            <motion.span
              className="inline-block ml-1"
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isFairyTheme ? '💕' : '✨'}
            </motion.span>
          </motion.p>
        </motion.div>

        {/* Milestones Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-4 gap-2 mb-6"
        >
          {milestones.map((count, i) => {
            const achieved = referralCount >= count
            return (
              <motion.div
                key={count}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className={`
                  relative p-3 rounded-2xl text-center
                  ${achieved
                    ? `bg-gradient-to-br ${themeColors.secondary} ${themeColors.border} border`
                    : 'bg-white/5 border border-white/10'
                  }
                `}
              >
                <motion.div
                  className="text-2xl mb-1"
                  animate={achieved ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {achieved ? emojis.achieved : emojis.pending}
                </motion.div>
                <p className={`text-lg font-bold ${achieved ? themeColors.accent : 'text-white/40'}`}>
                  +{count}
                </p>
                <p className="text-[10px] text-white/60" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>расклад</p>

                {achieved && (
                  <motion.div
                    className={`absolute -top-1 -right-1 w-5 h-5 ${themeColors.accentBg} rounded-full flex items-center justify-center`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <span className="text-white text-xs">✓</span>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </motion.div>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl p-4 bg-gradient-to-br ${themeColors.secondary} ${themeColors.border} border mb-4`}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="relative flex-shrink-0"
              style={{ willChange: 'filter', transform: 'translateZ(0)' }}
              animate={{
                filter: [
                  'drop-shadow(0 0 8px rgba(255,255,255,0.3))',
                  'drop-shadow(0 0 15px rgba(255,255,255,0.5))',
                  'drop-shadow(0 0 8px rgba(255,255,255,0.3))',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <img
                src={isFairyTheme ? '/icons/rewards-gift-fairy.png' : '/icons/rewards-gift-witch.png'}
                alt="Gift"
                className="w-36 h-36 object-contain brightness-125 contrast-110"
              />
            </motion.div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">1 подруга = 1 расклад</p>
              <p className="text-white/60 text-xs" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Вы обе получите подарок</p>
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={() => navigate('/referrals')}
            variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'}
            className={`w-full py-4 ${isFairyTheme ? '!bg-[#C4A0A5] hover:!bg-[#d4b0b5] border-[#C4A0A5]/40' : 'bg-gradient-to-r from-white/60 to-white/50 text-black'}`}
          >
            Пригласить подругу
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default RewardsPage
