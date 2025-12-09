import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '../../store/useUserStore'
import { useCardsStore } from '../../store/useCardsStore'
import { useTelegram } from '../../providers/TelegramProvider'
import { Card, Button } from '../../components/ui'
import { MagicParticlesLight } from '../../components/effects'
import { getMoonPhase, getMoonEmoji, getMoonName, moonPhasesInfo, getAllMoonPhases } from '../../lib/moonPhase'
import { getRandomGreeting } from '../../lib/greetings'
import { getThemeEmoji } from '../../lib/themeEmojis'
import type { MoonPhase } from '../../types'

export function HomePage() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const { todayReading } = useCardsStore()
  const { hapticFeedback } = useTelegram()

  const moonPhase = getMoonPhase(new Date())

  // Сохраняем приветствие в state, чтобы оно не менялось при каждом рендере
  const [greeting] = useState(() => getRandomGreeting())
  const [showMoonModal, setShowMoonModal] = useState(false)
  const [expandedPhase, setExpandedPhase] = useState<MoonPhase | null>(null)
  const [activeTab, setActiveTab] = useState<'general' | 'beauty'>('general')

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
          variant="glass"
          className="mb-4 overflow-hidden relative cursor-pointer"
          onClick={() => {
            hapticFeedback('impact', 'light')
            navigate('/ask')
          }}
        >
          <div className="relative">
            {/* Title and description */}
            <div className="text-center mb-3">
              <h3 className="text-white font-display font-bold text-lg mb-0.5">
                {isFairyTheme ? 'Задай вопрос картам' : 'Вопроси судьбу'}
              </h3>
              <p className="text-white/60 text-xs">
                {isFairyTheme ? '1 вопрос в день — карты ответят' : 'Раскрой тайны через карты'}
              </p>
            </div>

            {/* Button with icon */}
            <motion.div
              className={`w-full rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 ${
                isFairyTheme
                  ? 'bg-gradient-to-r from-[#FC89AC]/20 to-pink-500/20 border border-[#FC89AC]/30'
                  : 'bg-gradient-to-r from-slate-500/20 to-slate-600/20 border border-slate-500/30'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className={`font-medium text-sm ${isFairyTheme ? 'text-[#FC89AC]' : 'text-slate-300'}`}>
                {isFairyTheme ? 'Спросить карты' : 'Задать вопрос'}
              </span>
              {/* Icon with glow - после текста */}
              <div className="relative">
                <motion.div
                  className={`absolute inset-0 rounded-full blur-md ${
                    isFairyTheme ? 'bg-[#FC89AC]' : 'bg-slate-400'
                  }`}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="relative w-7 h-7 rounded-full overflow-hidden">
                  <img
                    src={isFairyTheme ? '/icons/ask-fairy.png' : '/icons/ask-witch.png'}
                    alt="Ask cards"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
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
        <Card
          variant="glass"
          className="mb-4 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => {
            hapticFeedback('impact', 'light')
            setShowMoonModal(true)
          }}
        >
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
            <div className="flex-1">
              <p className="text-white/60 text-sm">Лунная фаза</p>
              <p className="text-white font-medium">{getMoonName(moonPhase)}</p>
            </div>
            <span className={`text-xs ${isFairyTheme ? 'text-[#FC89AC]/60' : 'text-slate-500'}`}>
              Подробнее
            </span>
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

      {/* Moon Phase Modal */}
      <AnimatePresence>
        {showMoonModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
              onClick={() => setShowMoonModal(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ duration: 0.3, type: 'spring', damping: 20, stiffness: 300 }}
              className="fixed inset-x-3 top-[5%] bottom-[5%] z-50 flex flex-col"
            >
              <Card
                variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'}
                className={`${isFairyTheme ? 'border-[#FC89AC]/30' : 'border-slate-400/30'} overflow-hidden flex flex-col h-full`}
              >
                {/* Header with animated moon cycle */}
                <div className="text-center pb-3 border-b border-white/10 flex-shrink-0">
                  {/* Animated orbiting moon cycle */}
                  <div className="relative h-16 mb-2">
                    <motion.div
                      className="absolute inset-0 flex justify-center items-center"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                    >
                      {getAllMoonPhases().map((phase, index) => {
                        const info = moonPhasesInfo[phase]
                        const isCurrentPhase = phase === moonPhase
                        const angle = (index / 8) * 360 - 90
                        const radius = 50
                        return (
                          <motion.div
                            key={phase}
                            className="absolute"
                            style={{
                              transform: `rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg)`,
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                              scale: isCurrentPhase ? 1.5 : 0.9,
                              opacity: isCurrentPhase ? 1 : 0.5
                            }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <motion.span
                              className="text-lg block"
                              style={{
                                filter: isFairyTheme
                                  ? 'sepia(100%) hue-rotate(290deg) saturate(3) brightness(1.1)'
                                  : 'grayscale(100%) brightness(1.8)'
                              }}
                              animate={isCurrentPhase ? {
                                scale: [1, 1.2, 1],
                                filter: isFairyTheme
                                  ? ['sepia(100%) hue-rotate(290deg) saturate(3) brightness(1.1)', 'sepia(100%) hue-rotate(290deg) saturate(4) brightness(1.3)', 'sepia(100%) hue-rotate(290deg) saturate(3) brightness(1.1)']
                                  : ['grayscale(100%) brightness(1.8)', 'grayscale(100%) brightness(2.2)', 'grayscale(100%) brightness(1.8)']
                              } : {}}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {info.emoji}
                            </motion.span>
                            {isCurrentPhase && (
                              <motion.div
                                className={`absolute -inset-2 rounded-full blur-lg ${
                                  isFairyTheme ? 'bg-[#FC89AC]' : 'bg-slate-300'
                                }`}
                                animate={{
                                  opacity: [0.3, 0.6, 0.3],
                                  scale: [0.8, 1.2, 0.8]
                                }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              />
                            )}
                          </motion.div>
                        )
                      })}
                    </motion.div>
                    {/* Center glow */}
                    <motion.div
                      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full blur-xl ${
                        isFairyTheme ? 'bg-[#FC89AC]/50' : 'bg-slate-400/50'
                      }`}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </div>
                  <h3 className="text-white font-display font-bold text-xl">
                    Лунный календарь
                  </h3>
                  <p className={`text-sm mt-0.5 ${isFairyTheme ? 'text-[#FC89AC]/70' : 'text-slate-400'}`}>
                    {moonPhasesInfo[moonPhase].name} — {moonPhasesInfo[moonPhase].description}
                  </p>
                </div>

                {/* Tab switcher */}
                <div className="flex gap-2 p-2 bg-black/20 mx-2 mt-2 rounded-xl flex-shrink-0">
                  <motion.button
                    onClick={() => setActiveTab('general')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === 'general'
                        ? isFairyTheme
                          ? 'bg-[#FC89AC] text-white shadow-lg shadow-[#FC89AC]/30'
                          : 'bg-slate-400 text-slate-900 shadow-lg shadow-slate-400/30'
                        : 'text-white/60 hover:text-white/80'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span style={{
                      filter: activeTab === 'general' ? 'none' : (isFairyTheme
                        ? 'sepia(100%) hue-rotate(290deg) saturate(3) brightness(1.1)'
                        : 'grayscale(100%) brightness(1.8)')
                    }}>
                      {moonPhasesInfo[moonPhase].emoji}
                    </span>
                    Энергия
                  </motion.button>
                  <motion.button
                    onClick={() => setActiveTab('beauty')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === 'beauty'
                        ? isFairyTheme
                          ? 'bg-[#FC89AC] text-white shadow-lg shadow-[#FC89AC]/30'
                          : 'bg-slate-400 text-slate-900 shadow-lg shadow-slate-400/30'
                        : 'text-white/60 hover:text-white/80'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>
                      {isFairyTheme ? '💅' : '✨'}
                    </span>
                    Бьюти
                  </motion.button>
                </div>

                {/* Content area with smooth scroll */}
                <div
                  className="flex-1 overflow-y-auto overscroll-contain py-3 px-1"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: isFairyTheme ? '#FC89AC40 transparent' : '#64748b40 transparent'
                  }}
                >
                  <AnimatePresence mode="wait">
                    {activeTab === 'general' ? (
                      <motion.div
                        key="general"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-2"
                      >
                        {getAllMoonPhases().map((phase, index) => {
                          const info = moonPhasesInfo[phase]
                          const isCurrentPhase = phase === moonPhase
                          const isExpanded = expandedPhase === phase

                          return (
                            <motion.div
                              key={phase}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className={`rounded-2xl transition-all duration-300 overflow-hidden ${
                                isCurrentPhase
                                  ? isFairyTheme
                                    ? 'bg-gradient-to-r from-[#FC89AC]/25 to-pink-500/15 border border-[#FC89AC]/40 shadow-lg shadow-[#FC89AC]/10'
                                    : 'bg-gradient-to-r from-slate-500/25 to-slate-600/15 border border-slate-400/40 shadow-lg shadow-slate-500/10'
                                  : 'bg-white/5 hover:bg-white/8'
                              }`}
                            >
                              {/* Collapsed header - always visible */}
                              <button
                                onClick={() => {
                                  hapticFeedback('selection')
                                  setExpandedPhase(isExpanded ? null : phase)
                                }}
                                className="w-full p-3 flex items-center gap-3 text-left"
                              >
                                {/* Animated Moon emoji */}
                                <motion.div
                                  className="flex-shrink-0 relative"
                                  animate={isCurrentPhase ? {
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                  } : {}}
                                  transition={{
                                    duration: 3,
                                    repeat: isCurrentPhase ? Infinity : 0,
                                    ease: 'easeInOut'
                                  }}
                                >
                                  <span
                                    className="text-2xl block"
                                    style={{
                                      filter: isFairyTheme
                                        ? 'sepia(100%) hue-rotate(290deg) saturate(3) brightness(1.1)'
                                        : 'grayscale(100%) brightness(2)'
                                    }}
                                  >
                                    {info.emoji}
                                  </span>
                                  {isCurrentPhase && (
                                    <motion.div
                                      className={`absolute -inset-2 rounded-full blur-md ${
                                        isFairyTheme ? 'bg-[#FC89AC]/40' : 'bg-slate-400/40'
                                      }`}
                                      animate={{
                                        opacity: [0.3, 0.6, 0.3],
                                        scale: [0.8, 1, 0.8]
                                      }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                    />
                                  )}
                                </motion.div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-semibold text-sm ${isCurrentPhase ? 'text-white' : 'text-white/90'}`}>
                                      {info.name}
                                    </span>
                                    {isCurrentPhase && (
                                      <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                          isFairyTheme
                                            ? 'bg-[#FC89AC] text-white'
                                            : 'bg-slate-400 text-slate-900'
                                        }`}
                                      >
                                        сейчас
                                      </motion.span>
                                    )}
                                  </div>
                                  <p className={`text-xs ${isCurrentPhase ? 'text-white/70' : 'text-white/50'} truncate`}>
                                    {info.description}
                                  </p>
                                </div>

                                {/* Expand icon */}
                                <motion.svg
                                  animate={{ rotate: isExpanded ? 180 : 0 }}
                                  transition={{ duration: 0.2 }}
                                  className={`w-4 h-4 ${isFairyTheme ? 'text-[#FC89AC]' : 'text-slate-400'}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </motion.svg>
                              </button>

                              {/* Expanded content */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className={`px-3 pb-3 pt-0 border-t ${isFairyTheme ? 'border-[#FC89AC]/20' : 'border-slate-500/20'}`}>
                                      <p className={`text-xs leading-relaxed mt-2 ${isCurrentPhase ? 'text-white/80' : 'text-white/60'}`}>
                                        {info.influence}
                                      </p>
                                      <p className={`text-xs mt-2 leading-relaxed ${
                                        isFairyTheme
                                          ? 'text-[#FC89AC]'
                                          : 'text-slate-300'
                                      }`}>
                                        {info.advice}
                                      </p>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          )
                        })}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="beauty"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-3"
                      >
                        {getAllMoonPhases().map((phase, index) => {
                          const info = moonPhasesInfo[phase]
                          const isCurrentPhase = phase === moonPhase
                          const isExpanded = expandedPhase === phase

                          return (
                            <motion.div
                              key={phase}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className={`rounded-2xl overflow-hidden ${
                                isCurrentPhase
                                  ? isFairyTheme
                                    ? 'bg-gradient-to-br from-[#FC89AC]/30 via-pink-500/20 to-rose-500/15 border border-[#FC89AC]/50 shadow-xl shadow-[#FC89AC]/20'
                                    : 'bg-gradient-to-br from-slate-500/30 via-slate-600/20 to-slate-700/15 border border-slate-400/50 shadow-xl shadow-slate-500/20'
                                  : 'bg-white/5 hover:bg-white/8'
                              }`}
                            >
                              {/* Header */}
                              <button
                                onClick={() => {
                                  hapticFeedback('selection')
                                  setExpandedPhase(isExpanded ? null : phase)
                                }}
                                className="w-full p-3 flex items-center gap-3 text-left"
                              >
                                <motion.span
                                  className="text-2xl"
                                  style={{
                                    filter: isFairyTheme
                                      ? 'sepia(100%) hue-rotate(290deg) saturate(3) brightness(1.1)'
                                      : 'grayscale(100%) brightness(2)'
                                  }}
                                  animate={isCurrentPhase ? { scale: [1, 1.15, 1] } : {}}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  {info.emoji}
                                </motion.span>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-semibold text-sm ${isCurrentPhase ? 'text-white' : 'text-white/90'}`}>
                                      {info.name}
                                    </span>
                                    {isCurrentPhase && (
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                        isFairyTheme ? 'bg-[#FC89AC] text-white' : 'bg-slate-400 text-slate-900'
                                      }`}>
                                        сейчас
                                      </span>
                                    )}
                                  </div>
                                  <p className={`text-xs ${isCurrentPhase ? 'text-white/70' : 'text-white/50'}`}>
                                    {info.beauty.tip}
                                  </p>
                                </div>
                                <motion.svg
                                  animate={{ rotate: isExpanded ? 180 : 0 }}
                                  className={`w-4 h-4 ${isFairyTheme ? 'text-[#FC89AC]' : 'text-slate-400'}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </motion.svg>
                              </button>

                              {/* Expanded beauty content */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className={`px-3 pb-3 space-y-3 border-t ${isFairyTheme ? 'border-[#FC89AC]/20' : 'border-slate-500/20'}`}>
                                      {/* Recommended */}
                                      <div className="mt-3">
                                        <div className="flex items-center gap-1.5 mb-2">
                                          <motion.span
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                          >
                                            {isFairyTheme ? '💖' : '✓'}
                                          </motion.span>
                                          <span className={`text-xs font-semibold ${isFairyTheme ? 'text-[#FC89AC]' : 'text-green-400'}`}>
                                            Рекомендуется
                                          </span>
                                        </div>
                                        <div className="space-y-1">
                                          {info.beauty.recommended.map((item, i) => (
                                            <motion.div
                                              key={i}
                                              initial={{ opacity: 0, x: -10 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              transition={{ delay: i * 0.05 }}
                                              className={`flex items-center gap-2 text-xs ${
                                                isFairyTheme ? 'text-pink-200' : 'text-slate-200'
                                              }`}
                                            >
                                              <span className={`w-1 h-1 rounded-full ${isFairyTheme ? 'bg-[#FC89AC]' : 'bg-green-400'}`} />
                                              {item}
                                            </motion.div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Avoid */}
                                      <div>
                                        <div className="flex items-center gap-1.5 mb-2">
                                          <motion.span
                                            animate={{ rotate: [0, 10, -10, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                          >
                                            {isFairyTheme ? '🚫' : '✗'}
                                          </motion.span>
                                          <span className={`text-xs font-semibold ${isFairyTheme ? 'text-rose-300' : 'text-red-400'}`}>
                                            Лучше избегать
                                          </span>
                                        </div>
                                        <div className="space-y-1">
                                          {info.beauty.avoid.map((item, i) => (
                                            <motion.div
                                              key={i}
                                              initial={{ opacity: 0, x: -10 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              transition={{ delay: i * 0.05 + 0.2 }}
                                              className={`flex items-center gap-2 text-xs ${
                                                isFairyTheme ? 'text-rose-200/70' : 'text-slate-300/70'
                                              }`}
                                            >
                                              <span className={`w-1 h-1 rounded-full ${isFairyTheme ? 'bg-rose-400' : 'bg-red-400'}`} />
                                              {item}
                                            </motion.div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Close button */}
                <div className="pt-3 border-t border-white/10 flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowMoonModal(false)
                      setExpandedPhase(null)
                      setActiveTab('general')
                    }}
                    className={`w-full py-3 rounded-xl font-medium text-sm transition-all ${
                      isFairyTheme
                        ? 'bg-gradient-to-r from-[#FC89AC] to-pink-500 text-white shadow-lg shadow-[#FC89AC]/30'
                        : 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg shadow-slate-500/30'
                    }`}
                  >
                    Понятно
                  </motion.button>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
