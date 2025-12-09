import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '../components/layout'
import { Card, Button, Modal } from '../components/ui'
import { MagicParticlesLight } from '../components/effects'
import { useUserStore } from '../store/useUserStore'
import { getThemeConfig } from '../lib/deckThemes'
import { getZodiacEmoji } from '../lib/zodiacEmojis'
import { getDailyHoroscope, getZodiacSymbol, ZodiacSign } from '../lib/horoscope'
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
                ? 'text-[#FC89AC]/60'
                : 'text-slate-400/70'
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
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
                isFairyTheme ? 'bg-black/20' : 'bg-black/40'
              }`} />

              {/* Content */}
              <div className="relative z-10 p-4">
                {/* Header - centered */}
                <div className="flex flex-col items-center text-center mb-3">
                  <span className="text-3xl mb-1">{getZodiacSymbol(user.zodiacSign as ZodiacSign)}</span>
                  <h3 className="text-white font-medium">Гороскоп на сегодня</h3>
                  <p className="text-white/60 text-xs">{user.zodiacSign}</p>
                  <motion.span
                    className="text-white/40 text-sm mt-1"
                    animate={{ rotate: expandedHoroscope ? 180 : 0 }}
                  >
                    ▼
                  </motion.span>
                </div>

                {/* General prediction - centered */}
                <p className="text-white/90 text-sm leading-relaxed mb-3 text-center">
                  {horoscope.general}
                </p>

                {/* Quick stats row - centered */}
                <div className="flex gap-3 flex-wrap justify-center">
                  <div className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-1">
                    <span className="text-xs">🎨</span>
                    <span className="text-white/80 text-xs capitalize">{horoscope.luckyColor}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-1">
                    <span className="text-xs">💫</span>
                    <span className="text-white/80 text-xs">{horoscope.mood}</span>
                  </div>
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
          </motion.div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Раскладов', value: stats.totalReadings, emoji: '🔮' },
            { label: 'Дней', value: stats.streak, emoji: '🔥' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Card variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'} className="text-center py-3">
                <span className="text-lg">{stat.emoji}</span>
                <p className="font-bold text-white mt-1 text-xl">
                  {stat.value}
                </p>
                <p className="text-white/50 text-[10px]">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Settings: Avatar + Theme */}
      <div className="px-4 mb-4 space-y-3">
        {/* Avatar selection - первым */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card
            variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'}
            onClick={() => setShowAvatarModal(true)}
            className="cursor-pointer hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user?.avatar ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <span className="text-2xl">{isFairyTheme ? '🦋' : '🌙'}</span>
                )}
                <div>
                  <p className="text-white font-medium">Аватар</p>
                  <p className="text-white/50 text-sm">{user?.avatar ? 'Выбрано' : 'Не выбрано'}</p>
                </div>
              </div>
              <span className="text-white/40">→</span>
            </div>
          </Card>
        </motion.div>

        {/* Deck Theme - вторым */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card
            variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'}
            onClick={() => setShowDeckModal(true)}
            className="cursor-pointer hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{themeConfig.emoji.main}</span>
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
        </motion.div>
      </div>

      {/* Menu Items */}
      <div className="px-4 space-y-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/history">
            <Card variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'} className="hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📜</span>
                  <span className="text-white">История раскладов</span>
                </div>
                <span className="text-white/40">→</span>
              </div>
            </Card>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <Link to="/rewards">
            <Card variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'} className="hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎁</span>
                  <span className="text-white">Награды</span>
                </div>
                <span className="text-white/40">→</span>
              </div>
            </Card>
          </Link>
        </motion.div>
      </div>

      {/* Motivational quote based on theme */}
      <motion.div
        className="px-4 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <p className="text-center text-white/40 text-xs italic">
          {isWitchTheme
            ? '«Истинная магия — в познании себя»'
            : '«Каждый день — новая страница твоей сказки»'
          }
        </p>
      </motion.div>

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
                  ? 'border-slate-400 bg-slate-500/20'
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
                  ? 'border-[#FC89AC] bg-[#FC89AC]/10'
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
              className={`flex-1 ${isWitchTheme ? 'bg-slate-700/50 border-slate-500/30 hover:bg-slate-600/50' : 'bg-[#D4A5B9]/30 border-[#D4A5B9]/40 hover:bg-[#D4A5B9]/40'}`}
              onClick={() => {
                updateUser({ deckPermanent: false })
                setShowDeckModal(false)
              }}
            >
              Выбирать каждый день
            </Button>
            <Button
              variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'}
              className={`flex-1 ${isWitchTheme ? 'bg-slate-600/60 border-slate-400/40' : 'bg-[#E8B4C8]/40 border-[#E8B4C8]/50'}`}
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
                        ? 'ring-3 ring-[#FC89AC] ring-offset-2 ring-offset-black/50'
                        : 'ring-3 ring-slate-300 ring-offset-2 ring-offset-black/50'
                      : ''
                  }`}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: index * 0.1,
                    type: 'spring',
                    stiffness: 200,
                    damping: 15
                  }}
                >
                  {/* Фоновое свечение */}
                  <motion.div
                    className={`absolute inset-0 ${
                      isFairyTheme
                        ? 'bg-gradient-to-t from-[#FC89AC]/30 to-transparent'
                        : 'bg-gradient-to-t from-slate-500/30 to-transparent'
                    }`}
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
                      ? 'bg-[#FC89AC]/0 hover:bg-[#FC89AC]/10'
                      : 'bg-slate-400/0 hover:bg-slate-400/10'
                  }`} />

                  {/* Галочка выбора */}
                  {isSelected && (
                    <motion.div
                      className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                        isFairyTheme ? 'bg-[#FC89AC]' : 'bg-slate-500'
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
    </div>
  )
}
