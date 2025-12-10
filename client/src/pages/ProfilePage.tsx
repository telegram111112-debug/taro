import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '../components/layout'
import { Card, Button, Modal } from '../components/ui'
import { MagicParticlesLight } from '../components/effects'
import { useUserStore } from '../store/useUserStore'
import { getThemeConfig } from '../lib/deckThemes'
import { getZodiacEmoji } from '../lib/zodiacEmojis'
import { getDailyHoroscope, getZodiacSymbol, getColorExplanation, getMoodExplanation, ZodiacSign } from '../lib/horoscope'
import type { DeckTheme } from '../types'

// Аватарки для выбора
const FAIRY_AVATARS = [
  '/avatars/fairy-1.png',
  '/avatars/fairy-2.png',
  '/avatars/fairy-3.png',
]

const WITCH_AVATARS = [
  '/avatars/witch-1.png',
  '/avatars/witch-2.png',
  '/avatars/witch-3.png',
]

export function ProfilePage() {
  const { user, updateUser, setDeckTheme } = useUserStore()
  const themeConfig = getThemeConfig(user?.deckTheme || 'witch')

  const [showDeckModal, setShowDeckModal] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [expandedHoroscope, setExpandedHoroscope] = useState(false)
  const [selectedHoroscopeDetail, setSelectedHoroscopeDetail] = useState<'color' | 'mood' | null>(null)

  const handleChangeDeck = (theme: DeckTheme) => {
    setDeckTheme(theme)
    updateUser({ deckTheme: theme, deckPermanent: false })
    setShowDeckModal(false)
  }

  const stats = {
    totalReadings: 5,
    streak: user?.streakCount || 0,
  }

  const isWitchTheme = user?.deckTheme === 'witch' || !user?.deckTheme
  const isFairyTheme = user?.deckTheme === 'fairy'

  // Получаем гороскоп для знака зодиака пользователя
  const horoscope = getDailyHoroscope(user?.zodiacSign as ZodiacSign | undefined)

  return (
    <div className="min-h-screen pb-24 relative">
      {/* Magic particles */}
      <MagicParticlesLight />

      <Header />

      {/* User Info - только имя и дата (без рамки) */}
      <div className="px-4 mb-4">
        <div className="flex flex-col items-center justify-center py-2">
          <h2 className="text-xl tracking-wide text-white italic text-center"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 500,
            fontStyle: 'italic',
            textShadow: isFairyTheme
              ? '0 0 20px rgba(252, 137, 172, 0.3)'
              : '0 0 20px rgba(148, 163, 184, 0.2)'
          }}
          >
            {user?.name || 'Путница'}
          </h2>
          {user?.birthDate && (
            <p className={`text-xs mt-1 tracking-widest ${
              isFairyTheme
                ? 'text-[#C4A0A5]/60'
                : 'text-white/60'
            }`}
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 300,
              letterSpacing: '0.15em'
            }}
            >
              {new Date(user.birthDate).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }).replace(/\./g, ' / ')}
            </p>
          )}
        </div>
      </div>

      {/* Daily Horoscope */}
      {horoscope && user?.zodiacSign && (
        <div className="px-4 mb-4">
          <div>
            <div
              className="relative rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => setExpandedHoroscope(!expandedHoroscope)}
            >
              {/* Background image */}
              <img
                src={isFairyTheme ? '/backgrounds/horoscope-fairy.jpg' : '/backgrounds/horoscope-witch.jpg'}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
              {/* Overlay for readability */}
              <div className={`absolute inset-0 ${
                isFairyTheme ? 'bg-gradient-to-b from-black/30 via-black/40 to-black/50' : 'bg-black/40'
              }`} />

              {/* Content */}
              <div className="relative z-10 p-4">
                {/* Header - centered */}
                <div className="flex flex-col items-center text-center mb-3">
                  <span className="text-3xl mb-1 drop-shadow-lg">{getZodiacSymbol(user.zodiacSign as ZodiacSign)}</span>
                  <h3 className="text-white font-medium drop-shadow-md">Гороскоп на сегодня</h3>
                  <p className="text-white/80 text-xs drop-shadow-sm">{user.zodiacSign}</p>
                  <motion.span
                    className="text-white/40 text-sm mt-1"
                    animate={{ rotate: expandedHoroscope ? 180 : 0 }}
                  >
                    ▼
                  </motion.span>
                </div>

                {/* General prediction - centered */}
                <p className="text-white text-sm leading-relaxed mb-3 text-center drop-shadow-md">
                  {horoscope.general}
                </p>

                {/* Quick stats row - centered - clickable buttons */}
                <div className="flex gap-3 flex-wrap justify-center">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedHoroscopeDetail('color')
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 transition-all backdrop-blur-sm shadow-lg ${
                      isFairyTheme
                        ? 'bg-white/20 border border-[#C4A0A5]/40 hover:bg-white/30'
                        : 'bg-white/15 border border-white/20 hover:bg-white/25'
                    }`}
                  >
                    <span className="text-sm drop-shadow-sm">🎨</span>
                    <span className="text-white text-xs capitalize font-medium drop-shadow-sm">{horoscope.luckyColor}</span>
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedHoroscopeDetail('mood')
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 transition-all backdrop-blur-sm shadow-lg ${
                      isFairyTheme
                        ? 'bg-white/20 border border-[#C4A0A5]/40 hover:bg-white/30'
                        : 'bg-white/15 border border-white/20 hover:bg-white/25'
                    }`}
                  >
                    <span className="text-sm drop-shadow-sm">💫</span>
                    <span className="text-white text-xs font-medium drop-shadow-sm">{horoscope.mood}</span>
                  </motion.button>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {expandedHoroscope && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t border-white/10 space-y-4 text-center">
                        {/* Love */}
                        <div>
                          <div className="flex items-center gap-2 mb-1 justify-center">
                            <span className="text-sm">{isWitchTheme ? '🖤' : '💕'}</span>
                            <span className="text-white/60 text-xs uppercase tracking-wide">Любовь</span>
                          </div>
                          <p className="text-white/80 text-sm">{horoscope.love}</p>
                        </div>

                        {/* Compatibility */}
                        <div className="bg-white/10 rounded-lg p-3">
                          <div className="flex items-center gap-2 justify-center">
                            <span className="text-sm">✨</span>
                            <span className="text-white/60 text-xs">Совместимость сегодня:</span>
                            <span className="text-gold-400 text-sm font-medium">
                              {getZodiacSymbol(horoscope.compatibility)} {horoscope.compatibility}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Раскладов', value: stats.totalReadings, emoji: '🔮' },
            { label: 'Дней', value: stats.streak, emoji: '🔥' },
          ].map((stat) => (
            <div key={stat.label}>
              <Card variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'} className="text-center py-3">
                <span className="text-lg">{stat.emoji}</span>
                <p className="font-bold text-white mt-1 text-xl">
                  {stat.value}
                </p>
                <p className="text-white/50 text-[10px]">{stat.label}</p>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Avatar */}
      <div className="px-4 mb-3">
        <div>
          <Card
            variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'}
            onClick={() => setShowAvatarModal(true)}
            className="cursor-pointer hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user?.avatar ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <span className="text-2xl w-8 flex-shrink-0">{isFairyTheme ? '🦋' : '🌙'}</span>
                )}
                <div>
                  <p className="text-white font-medium">Аватар</p>
                  <p className="text-white/50 text-sm">{user?.avatar ? 'Выбрано' : 'Не выбрано'}</p>
                </div>
              </div>
              <span className="text-white/40">→</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Deck Theme */}
      <div className="px-4 mb-3">
        <div>
          <Card
            variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'}
            onClick={() => setShowDeckModal(true)}
            className="cursor-pointer hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl w-8 flex-shrink-0">{themeConfig.emoji.main}</span>
                <div>
                  <p className="text-white font-medium">Тема колоды</p>
                  <p className="text-white/50 text-sm">{themeConfig.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user?.deckPermanent && (
                  <span className="text-xs bg-gold-500/20 text-gold-400 px-2 py-1 rounded">
                    Навсегда
                  </span>
                )}
                <span className="text-white/40">→</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* History */}
      <div className="px-4 mb-3">
        <div>
          <Link to="/history">
            <Card variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'} className="hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl w-8 flex-shrink-0">📜</span>
                  <div>
                    <p className="text-white font-medium">История раскладов</p>
                  </div>
                </div>
                <span className="text-white/40">→</span>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Rewards */}
      <div className="px-4 mb-3">
        <div>
          <Link to="/rewards">
            <Card variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'} className="hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl w-8 flex-shrink-0">🎁</span>
                  <div>
                    <p className="text-white font-medium">Награды</p>
                  </div>
                </div>
                <span className="text-white/40">→</span>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Motivational quote based on theme */}
      <div className="px-4 mt-6">
        <p className="text-center text-white/40 text-xs italic">
          {isWitchTheme
            ? '«Истинная магия — в познании себя»'
            : '«Каждый день — новая страница твоей сказки»'
          }
        </p>
      </div>

      {/* Deck Theme Modal */}
      <Modal
        isOpen={showDeckModal}
        onClose={() => setShowDeckModal(false)}
        size="lg"
        backgroundImage={isWitchTheme ? '/backgrounds/roses-witch.jpg' : '/backgrounds/clouds-fairy.jpg'}
      >
        <div className="space-y-4">
          <p className="text-white/60 text-sm text-center">
            Выбери тему, которая тебе ближе
          </p>

          <div className="flex gap-4 justify-center">
            {/* Witch */}
            <button
              onClick={() => handleChangeDeck('witch')}
              className={`
                p-4 rounded-xl border-2 transition-all
                ${user?.deckTheme === 'witch'
                  ? 'border-white/60 bg-white/20'
                  : 'border-white/10 hover:border-white/30'
                }
              `}
            >
              <div
                className="w-24 h-32 rounded-lg bg-cover bg-center mb-2 overflow-hidden"
                style={{ backgroundImage: 'url(/backgrounds/deck-witch.jpg)' }}
              >
                <div className="w-full h-full bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2">
                  <span className="text-2xl">🌙</span>
                </div>
              </div>
              <p className="text-white text-sm font-medium text-center">Ведьма</p>
            </button>

            {/* Fairy */}
            <button
              onClick={() => handleChangeDeck('fairy')}
              className={`
                p-4 rounded-xl border-2 transition-all
                ${user?.deckTheme === 'fairy'
                  ? 'border-[#C4A0A5] bg-[#C4A0A5]/10'
                  : 'border-white/10 hover:border-white/30'
                }
              `}
            >
              <div
                className="w-24 h-32 rounded-lg bg-cover bg-center mb-2 overflow-hidden"
                style={{ backgroundImage: 'url(/backgrounds/deck-fairy.jpg)' }}
              >
                <div className="w-full h-full bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2">
                  <span className="text-2xl">🦋</span>
                </div>
              </div>
              <p className="text-white text-sm font-medium text-center">Фея</p>
            </button>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              className={`flex-1 ${isWitchTheme ? 'bg-black/40 border-white/20 hover:bg-black/50' : 'bg-[#D4A5B9]/30 border-[#D4A5B9]/40 hover:bg-[#D4A5B9]/40'}`}
              onClick={() => {
                updateUser({ deckPermanent: false })
                setShowDeckModal(false)
              }}
            >
              Выбирать каждый день
            </Button>
            <Button
              variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'}
              className={`flex-1 ${isWitchTheme ? 'bg-black/50 border-white/30' : 'bg-[#E8B4C8]/40 border-[#E8B4C8]/50'}`}
              onClick={() => {
                updateUser({ deckPermanent: true })
                setShowDeckModal(false)
              }}
            >
              Оставить навсегда
            </Button>
          </div>
        </div>
      </Modal>

      {/* Avatar Selection Modal - переработанный дизайн */}
      <Modal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        size="lg"
        backgroundImage={isWitchTheme ? '/backgrounds/roses-witch.jpg' : '/backgrounds/clouds-fairy.jpg'}
      >
        <div className="space-y-6">
          {/* Заголовок */}
          <div className="text-center">
            <motion.div
              className="text-4xl mb-2"
              style={{ willChange: 'transform', transform: 'translateZ(0)' }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isFairyTheme ? '✨' : '🌙'}
            </motion.div>
            <h3 className="text-white text-xl font-display mb-1">
              {isFairyTheme ? 'Выбери свою фею' : 'Выбери свою ведьму'}
            </h3>
          </div>

          {/* Аватарки - крупные карточки */}
          <div className={`grid gap-2 grid-cols-3`}>
            {(isFairyTheme ? FAIRY_AVATARS : WITCH_AVATARS).map((avatarPath, index) => {
              const isSelected = user?.avatar === avatarPath
              return (
                <motion.button
                  key={avatarPath}
                  onClick={() => {
                    updateUser({ avatar: avatarPath })
                    setShowAvatarModal(false)
                  }}
                  className={`relative aspect-square rounded-2xl overflow-hidden ${
                    isSelected
                      ? isFairyTheme
                        ? 'ring-3 ring-[#C4A0A5] ring-offset-2 ring-offset-black/50'
                        : 'ring-3 ring-white/60 ring-offset-2 ring-offset-black/50'
                      : ''
                  }`}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.4,
                    ease: 'easeOut',
                    delay: index * 0.08
                  }}
                >
                  {/* Фоновое свечение */}
                  <motion.div
                    className={`absolute inset-0 ${
                      isFairyTheme
                        ? 'bg-gradient-to-t from-[#C4A0A5]/30 to-transparent'
                        : 'bg-gradient-to-t from-white/20 to-transparent'
                    }`}
                    style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
                    animate={{
                      opacity: isSelected ? [0.5, 0.8, 0.5] : 0.3,
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  {/* Изображение аватара */}
                  <img
                    src={avatarPath}
                    alt={`Avatar ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Оверлей при наведении */}
                  <div className={`absolute inset-0 transition-opacity ${
                    isFairyTheme
                      ? 'bg-[#C4A0A5]/0 hover:bg-[#C4A0A5]/10'
                      : 'bg-white/0 hover:bg-white/10'
                  }`} />

                  {/* Галочка выбора */}
                  {isSelected && (
                    <motion.div
                      className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                        isFairyTheme ? 'bg-[#C4A0A5]' : 'bg-white/60'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      <span className="text-white text-xs">✓</span>
                    </motion.div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      </Modal>

      {/* Horoscope Detail Modal (Color/Mood) */}
      <AnimatePresence>
        {selectedHoroscopeDetail && horoscope && user?.zodiacSign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedHoroscopeDetail(null)}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-sm rounded-3xl overflow-hidden border ${
                isFairyTheme
                  ? 'border-[#C4A0A5]/30'
                  : 'border-white/10'
              } shadow-2xl`}
            >
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(/backgrounds/horoscope-${selectedHoroscopeDetail}-${isFairyTheme ? 'fairy' : 'witch'}.jpg)`
                }}
              />
              {/* Dark overlay for readability */}
              <div className={`absolute inset-0 ${
                isFairyTheme
                  ? 'bg-gradient-to-b from-black/40 via-black/50 to-black/60'
                  : 'bg-gradient-to-b from-black/50 via-black/60 to-black/70'
              }`} />

              {/* Decorative top gradient */}
              <div className={`absolute top-0 left-0 right-0 h-1 z-10 ${
                isFairyTheme
                  ? 'bg-gradient-to-r from-transparent via-[#C4A0A5] to-transparent'
                  : 'bg-gradient-to-r from-transparent via-white/40 to-transparent'
              }`} />

              <div className="relative p-6">
                {/* Empty space at top */}
                <div className="h-40 mb-4" />

                {/* Day badge with dynamic emoji */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
                  className="flex justify-center mb-4"
                >
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                    isFairyTheme
                      ? 'bg-[#C4A0A5]/20 text-[#C4A0A5] border border-[#C4A0A5]/30'
                      : 'bg-white/10 text-white/70 border border-white/20'
                  }`}>
                    <motion.span
                      style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.15, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    >
                      {selectedHoroscopeDetail === 'color'
                        ? getColorExplanation(horoscope.luckyColor, user.zodiacSign as ZodiacSign).emoji
                        : getMoodExplanation(horoscope.mood, user.zodiacSign as ZodiacSign).emoji
                      }
                    </motion.span>
                    <span>{selectedHoroscopeDetail === 'color' ? 'Твой цвет на сегодня' : 'Твой настрой на сегодня'}</span>
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
                  className={`text-xl font-semibold text-center mb-4 ${
                    isFairyTheme ? 'text-[#C4A0A5]' : 'text-white'
                  }`}
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
                >
                  {selectedHoroscopeDetail === 'color'
                    ? getColorExplanation(horoscope.luckyColor, user.zodiacSign as ZodiacSign).title
                    : getMoodExplanation(horoscope.mood, user.zodiacSign as ZodiacSign).title
                  }
                </motion.h3>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
                  className="space-y-4"
                >
                  {/* Meaning */}
                  <p
                    className="text-white text-sm leading-relaxed text-center"
                    style={{ textShadow: '0 2px 6px rgba(0,0,0,0.7)' }}
                  >
                    {selectedHoroscopeDetail === 'color'
                      ? getColorExplanation(horoscope.luckyColor, user.zodiacSign as ZodiacSign).meaning
                      : getMoodExplanation(horoscope.mood, user.zodiacSign as ZodiacSign).meaning
                    }
                  </p>

                  {/* Divider */}
                  <div className={`h-px w-full ${
                    isFairyTheme
                      ? 'bg-gradient-to-r from-transparent via-[#C4A0A5]/30 to-transparent'
                      : 'bg-gradient-to-r from-transparent via-white/20 to-transparent'
                  }`} />

                  {/* Advice */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut', delay: 0.25 }}
                    className={`p-4 rounded-xl ${
                      isFairyTheme
                        ? 'bg-[#C4A0A5]/10 border border-[#C4A0A5]/20'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <motion.span
                        className="text-2xl"
                        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      >
                        💡
                      </motion.span>
                      <p
                        className="text-white text-sm italic"
                        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
                      >
                        {selectedHoroscopeDetail === 'color'
                          ? getColorExplanation(horoscope.luckyColor, user.zodiacSign as ZodiacSign).advice
                          : getMoodExplanation(horoscope.mood, user.zodiacSign as ZodiacSign).advice
                        }
                      </p>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Close button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedHoroscopeDetail(null)}
                  className={`w-full mt-6 py-3 rounded-xl font-medium transition-all relative overflow-hidden ${
                    isFairyTheme
                      ? 'bg-gradient-to-r from-[#C4A0A5]/30 via-[#C4A0A5]/40 to-[#C4A0A5]/30 border border-[#C4A0A5]/40 text-white'
                      : 'bg-gradient-to-r from-white/10 via-white/20 to-white/10 border border-white/20 text-white'
                  }`}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Понятно
                    <motion.span
                      style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                      animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      ✨
                    </motion.span>
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
