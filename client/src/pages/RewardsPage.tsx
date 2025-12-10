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
    // Witch: slate/gray tones, Fairy: #C4A0A5 muted pink
    primary: isFairyTheme ? 'from-[#C4A0A5] to-[#B090A0]' : 'from-slate-500 to-slate-600',
    secondary: isFairyTheme ? 'from-[#C4A0A5]/25 to-[#B090A0]/25' : 'from-slate-500/20 to-slate-600/20',
    accent: isFairyTheme ? 'text-white' : 'text-slate-300',
    accentBg: isFairyTheme ? 'bg-[#C4A0A5]' : 'bg-slate-500',
    border: isFairyTheme ? 'border-[#C4A0A5]/40' : 'border-slate-500/30',
    glow: isFairyTheme ? 'rgba(196, 160, 165, 0.5)' : 'rgba(148, 163, 184, 0.4)',
    progressBg: isFairyTheme ? 'from-[#C4A0A5] to-[#B090A0]' : 'from-slate-400 to-slate-500',
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
          className={`w-10 h-10 border-2 ${isFairyTheme ? 'border-[#FC89AC]' : 'border-slate-400'} border-t-transparent rounded-full`}
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
              style={{ boxShadow: `0 0 40px ${themeColors.glow}` }}
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

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex justify-between mb-2">
            {milestones.map((m) => (
              <div
                key={m}
                className={`text-xs font-medium ${referralCount >= m ? themeColors.accent : 'text-white/40'}`}
              >
                {m}
              </div>
            ))}
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${themeColors.progressBg} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((referralCount / 10) * 100, 100)}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
          <p className="text-center text-white/60 text-xs mt-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            {referralCount} из 10 подруг
          </p>
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
            <img
              src={isFairyTheme ? '/icons/rewards-gift-fairy.png' : '/icons/rewards-gift-witch.png'}
              alt="Gift"
              className="w-36 h-36 object-contain flex-shrink-0"
            />
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
            className={`w-full py-4 ${isFairyTheme ? '!bg-[#C4A0A5] hover:!bg-[#d4b0b5] border-[#C4A0A5]/40' : 'bg-gradient-to-r from-slate-500 to-slate-600'}`}
          >
            Пригласить подругу
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default RewardsPage
