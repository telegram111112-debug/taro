import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTelegram } from '../providers/TelegramProvider'
import { useUserStore } from '../store/useUserStore'
import { Header } from '../components/layout'
import { Button, Card } from '../components/ui'
import { MagicParticlesLight } from '../components/effects'

interface FriendSpread {
  id: string
  type: 'daily' | 'love' | 'money' | 'future'
  cardName: string
  date: string
  summary: string
}

interface Friend {
  name: string
  joinedAt: string
  avatar?: string
  spreads?: FriendSpread[]
  title?: string // Звание подруги
}

interface ReferralInfo {
  referralCode: string
  referralLink: string
  shareText: string
  referralCount: number
  referredBy: string | null
  recentReferrals: Friend[]
}

// Звания для подруг
const friendTitles = [
  'Лучшая подруга',
  'Волшебница',
  'Звёздочка',
  'Магическая душа',
  'Хранительница тайн',
  'Лунная фея',
]

// Эмодзи для witch темы
const witchEmojis = ['🌙', '🔮', '✦', '☽', '⭐', '🌑']
// Эмодзи для fairy темы
const fairyEmojis = ['🌸', '💕', '🦋', '✨', '💗', '🌷']

export function ReferralsPage() {
  const { hapticFeedback } = useTelegram()
  const { user } = useUserStore()
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'friends' | 'invite'>('friends')
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [showShareSettings, setShowShareSettings] = useState(false)
  const [shareEnabled, setShareEnabled] = useState(true)

  const isWitchTheme = user?.deckTheme === 'witch' || !user?.deckTheme
  const isFairyTheme = user?.deckTheme === 'fairy'

  const mockReferralInfo: ReferralInfo = {
    referralCode: user?.referralCode || 'MAGIC123',
    referralLink: `https://t.me/taropodruga_bot?start=${user?.referralCode || 'MAGIC123'}`,
    shareText: '✨ Привет! Я нашла волшебное приложение с картами Таро! Каждый день оно раскрывает тайны и подсказывает путь. Переходи по ссылке — получишь расклад из 4-х карт в подарок! 💕',
    referralCount: 3,
    referredBy: null,
    recentReferrals: [
      { name: 'Анастасия', joinedAt: '2024-01-15', title: 'Лучшая подруга', spreads: [{ id: '1', type: 'daily', cardName: 'Звезда', date: '2024-01-15', summary: 'День полон надежды' }] },
      { name: 'Мария', joinedAt: '2024-01-14', title: 'Волшебница', spreads: [{ id: '2', type: 'love', cardName: 'Влюблённые', date: '2024-01-14', summary: 'Гармония в отношениях' }] },
      { name: 'Екатерина', joinedAt: '2024-01-13', title: 'Звёздочка', spreads: [] },
    ],
  }

  useEffect(() => {
    setTimeout(() => {
      setReferralInfo(mockReferralInfo)
      setLoading(false)
    }, 500)
  }, [])

  const handleCopyLink = async () => {
    if (!referralInfo) return
    hapticFeedback('impact', 'light')
    try {
      await navigator.clipboard.writeText(referralInfo.referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = () => {
    if (!referralInfo) return
    hapticFeedback('impact', 'medium')
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralInfo.referralLink)}&text=${encodeURIComponent(referralInfo.shareText)}`
    window.open(telegramShareUrl, '_blank')
  }

  const getSpreadTypeLabel = (type: string) => {
    const labels: Record<string, { label: string; emoji: string }> = {
      daily: { label: 'Карта дня', emoji: isFairyTheme ? '🌸' : '🌙' },
      love: { label: 'Любовь', emoji: '💕' },
      money: { label: 'Финансы', emoji: isFairyTheme ? '✨' : '💰' },
      future: { label: 'Будущее', emoji: '🔮' },
    }
    return labels[type] || { label: 'Расклад', emoji: '✦' }
  }

  const getFriendEmoji = (index: number) => {
    const emojis = isFairyTheme ? fairyEmojis : witchEmojis
    return emojis[index % emojis.length]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className={`w-10 h-10 border-2 border-t-transparent rounded-full ${isFairyTheme ? 'border-[#FC89AC]' : 'border-[#5a5a5a]'}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Background - такой же как на главной */}
      {isWitchTheme && (
        <>
          <div className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10" style={{ backgroundImage: 'url(/backgrounds/background-witch.jpg)' }} />
          <div className="fixed inset-0 bg-black/50 -z-10" />
        </>
      )}
      {isFairyTheme && (
        <>
          <div className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10" style={{ backgroundImage: 'url(/backgrounds/background-fairy.jpg)' }} />
          <div className="fixed inset-0 bg-black/40 -z-10" />
        </>
      )}

      <MagicParticlesLight />

      <div className="px-4 pb-24 pt-4">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <motion.div
            className="text-5xl mb-2"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {isFairyTheme ? '💝' : '🔮'}
          </motion.div>
          <h1 className="text-2xl font-display font-bold text-white mb-1">
            Магия дружбы
          </h1>
        </motion.div>

        {/* Banner Image - феи и ведьмы */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-4 rounded-2xl overflow-hidden border border-white/10"
        >
          <img
            src={isFairyTheme ? '/backgrounds/referrals-fairy.jpg' : '/backgrounds/referrals-witch.jpg'}
            alt="Magic friends"
            className="w-full h-32 object-cover"
          />
        </motion.div>

        {/* Tabs - Подруги первый */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 mb-4"
        >
          <button
            onClick={() => {
              hapticFeedback('impact', 'light')
              setActiveTab('friends')
            }}
            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'friends'
                ? isFairyTheme
                  ? 'bg-[#FC89AC] text-white shadow-lg shadow-[#FC89AC]/30'
                  : 'bg-[#3a3a3a] text-white shadow-lg shadow-black/30'
                : isFairyTheme
                  ? 'bg-[#FC89AC]/20 text-white/70'
                  : 'bg-[#2a2a2a]/80 text-gray-400'
            }`}
          >
            👯‍♀️ Подруги
          </button>
          <button
            onClick={() => {
              hapticFeedback('impact', 'light')
              setActiveTab('invite')
            }}
            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'invite'
                ? isFairyTheme
                  ? 'bg-[#FC89AC] text-white shadow-lg shadow-[#FC89AC]/30'
                  : 'bg-[#3a3a3a] text-white shadow-lg shadow-black/30'
                : isFairyTheme
                  ? 'bg-[#FC89AC]/20 text-white/70'
                  : 'bg-[#2a2a2a]/80 text-gray-400'
            }`}
          >
            💌 Пригласить
          </button>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Friends Tab */}
          {activeTab === 'friends' && (
            <motion.div
              key="friends"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {referralInfo?.recentReferrals && referralInfo.recentReferrals.length > 0 ? (
                <div className="space-y-3">
                  {referralInfo.recentReferrals.map((friend, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => {
                        hapticFeedback('impact', 'light')
                        setSelectedFriend(friend)
                      }}
                      className={`p-4 rounded-2xl cursor-pointer active:scale-[0.98] transition-all ${
                        isFairyTheme
                          ? 'bg-[#FC89AC]/15 border border-[#FC89AC]/30 backdrop-blur-sm'
                          : 'bg-[#2a2a2a]/90 border border-[#3a3a3a]/50 backdrop-blur-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        {friend.avatar ? (
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <img
                              src={friend.avatar}
                              alt={friend.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                            isFairyTheme
                              ? 'bg-gradient-to-br from-[#FC89AC] to-[#E879F9]'
                              : 'bg-gradient-to-br from-[#4a4a4a] to-[#2a2a2a]'
                          }`}>
                            {friend.name.charAt(0)}
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{friend.name}</p>
                          <p className="text-white/70 text-xs">
                            {friend.title || friendTitles[index % friendTitles.length]} • {formatDate(friend.joinedAt)}
                          </p>
                        </div>

                        {/* Emoji indicator */}
                        <motion.span
                          className="text-2xl"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                        >
                          {getFriendEmoji(index)}
                        </motion.span>
                      </div>
                    </motion.div>
                  ))}

                  {/* Share Settings Button - Компактная кнопка */}
                  <motion.button
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                    onClick={() => {
                      hapticFeedback('impact', 'light')
                      setShowShareSettings(true)
                    }}
                    className={`mx-auto mt-20 px-5 py-3 rounded-2xl font-medium transition-all active:scale-[0.98] relative overflow-hidden flex justify-center ${
                      isFairyTheme
                        ? 'bg-gradient-to-r from-[#4a3538] via-[#5a4045] to-[#4a3538] border border-[#6a4a50]/50 shadow-lg shadow-[#4a3538]/40'
                        : 'bg-gradient-to-r from-[#282828] via-[#323232] to-[#282828] border border-[#3a3a3a]/60 shadow-lg shadow-black/40'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Animated shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                    />

                    <div className="flex items-center gap-3 relative z-10">
                      {/* Icon - Left */}
                      <motion.div
                        className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <img
                          src={isFairyTheme ? '/icons/share-fairy.png' : '/icons/share-witch.png'}
                          alt="Share"
                          className="w-full h-full object-cover"
                        />
                      </motion.div>

                      {/* Text - Center */}
                      <span className="text-sm font-semibold text-white whitespace-nowrap">
                        Делиться раскладами
                      </span>

                      {/* Status indicator - Right */}
                      {shareEnabled && (
                        <motion.div
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            isFairyTheme ? 'bg-white/80' : 'bg-white/70'
                          }`}
                          animate={{
                            scale: [1, 1.3, 1],
                            boxShadow: isFairyTheme
                              ? ['0 0 6px 2px rgba(255, 255, 255, 0.4)', '0 0 12px 4px rgba(255, 255, 255, 0.6)', '0 0 6px 2px rgba(255, 255, 255, 0.4)']
                              : ['0 0 6px 2px rgba(255, 255, 255, 0.3)', '0 0 12px 4px rgba(255, 255, 255, 0.5)', '0 0 6px 2px rgba(255, 255, 255, 0.3)']
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </div>
                  </motion.button>
                </div>
              ) : (
                <div className={`text-center py-12 rounded-2xl ${
                  isFairyTheme ? 'bg-[#FC89AC]/10' : 'bg-[#2a2a2a]/80'
                }`}>
                  <motion.div
                    className="text-5xl mb-4"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {isFairyTheme ? '🦋' : '🌙'}
                  </motion.div>
                  <h3 className="text-white font-semibold mb-2">
                    {isFairyTheme ? 'Пока здесь пусто' : 'Круг пуст'}
                  </h3>
                  <p className="text-white/50 text-sm mb-4">
                    {isFairyTheme ? 'Пригласи первую подругу!' : 'Призови первую душу'}
                  </p>
                  <Button
                    onClick={() => setActiveTab('invite')}
                    variant={isFairyTheme ? 'primary-fairy' : 'primary'}
                  >
                    Пригласить
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Invite Tab */}
          {activeTab === 'invite' && (
            <motion.div
              key="invite"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Reward Info */}
              <Card variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'}>
                <div className="flex items-center gap-3">
                  <motion.div
                    className="text-4xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {isFairyTheme ? '🎁' : '🌟'}
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">За каждую подругу</h3>
                    <p className={`text-sm ${isFairyTheme ? 'text-white/80' : 'text-gray-400'}`}>
                      +1 расклад из 4-х карт обеим
                    </p>
                  </div>
                </div>
              </Card>

              {/* Share Link */}
              <Card variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'}>
                <h3 className={`text-sm font-semibold mb-3 ${isFairyTheme ? 'text-white' : 'text-gray-300'}`}>
                  Твоя ссылка
                </h3>
                <div className={`rounded-xl overflow-hidden flex mb-3 ${
                  isFairyTheme ? 'bg-white/10' : 'bg-[#3a3a3a]/80'
                }`}>
                  <div className="flex-1 px-3 py-3 overflow-hidden">
                    <p className="text-white/80 text-sm truncate">
                      {referralInfo?.referralLink}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-3 text-sm font-medium transition-all ${
                      copied
                        ? 'bg-green-500 text-white'
                        : isFairyTheme
                          ? 'bg-[#FC89AC] text-white'
                          : 'bg-[#4a4a4a] text-white'
                    }`}
                  >
                    {copied ? '✓ Готово' : 'Копировать'}
                  </button>
                </div>

                <Button
                  onClick={handleShare}
                  variant={isFairyTheme ? 'primary-fairy' : 'primary'}
                  className="w-full"
                  size="lg"
                >
                  <motion.span
                    className="mr-2 text-lg"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {isFairyTheme ? '💕' : '✨'}
                  </motion.span>
                  Отправить приглашение
                </Button>
              </Card>

              {/* How it works */}
              <Card variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'}>
                <h3 className={`text-sm font-semibold mb-4 text-center ${isFairyTheme ? 'text-white' : 'text-gray-300'}`}>
                  Как это работает
                </h3>
                <div className="space-y-3">
                  {[
                    { step: '1', text: 'Отправь ссылку подруге', emoji: isFairyTheme ? '💌' : '📨' },
                    { step: '2', text: 'Она переходит и запускает бота', emoji: isFairyTheme ? '🦋' : '✦' },
                    { step: '3', text: 'Вы обе получаете +1 расклад!', emoji: isFairyTheme ? '🎁' : '🌟' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        isFairyTheme ? 'bg-[#FC89AC]/15' : 'bg-[#3a3a3a]/60'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isFairyTheme ? 'bg-[#FC89AC] text-white' : 'bg-[#4a4a4a] text-white'
                      }`}>
                        {item.step}
                      </div>
                      <span className="text-white text-sm flex-1">{item.text}</span>
                      <span className="text-xl">{item.emoji}</span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Share Settings Modal */}
      <AnimatePresence>
        {showShareSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareSettings(false)}
          >
            {/* Animated backdrop with pulse */}
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              animate={{
                backgroundColor: ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.7)']
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Aurora / Light rays effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`ray-${i}`}
                  className={`absolute w-1 origin-bottom ${
                    isFairyTheme ? 'bg-gradient-to-t from-[#C4A0A5]/30 via-white/20 to-transparent' : 'bg-gradient-to-t from-white/20 via-[#5a5a5a]/20 to-transparent'
                  }`}
                  style={{
                    height: '120%',
                    left: `${15 + i * 17}%`,
                    bottom: '-20%',
                    transform: `rotate(${-15 + i * 7}deg)`,
                  }}
                  animate={{
                    opacity: [0, 0.6, 0],
                    scaleY: [0.5, 1, 0.5],
                    width: ['2px', '8px', '2px'],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            {/* Floating particles animation - increased to 30 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute rounded-full ${
                    isFairyTheme
                      ? i % 3 === 0 ? 'bg-[#C4A0A5]/50' : i % 3 === 1 ? 'bg-white/40' : 'bg-[#d4b0b5]/30'
                      : i % 3 === 0 ? 'bg-white/25' : i % 3 === 1 ? 'bg-[#6a6a6a]/40' : 'bg-[#4a4a4a]/30'
                  }`}
                  style={{
                    width: 3 + (i % 5) * 2,
                    height: 3 + (i % 5) * 2,
                    left: `${3 + (i * 3.3) % 94}%`,
                    top: `${5 + (i * 5.7) % 90}%`,
                  }}
                  animate={{
                    y: [-40, 40, -40],
                    x: [-20, 20, -20],
                    opacity: [0.1, 0.7, 0.1],
                    scale: [0.6, 1.4, 0.6],
                  }}
                  transition={{
                    duration: 2.5 + i * 0.15,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut',
                  }}
                />
              ))}

              {/* Floating emoji sparkles - increased to 10 */}
              {[...Array(10)].map((_, i) => (
                <motion.span
                  key={`emoji-${i}`}
                  className="absolute text-lg"
                  style={{
                    left: `${8 + i * 9}%`,
                    top: `${15 + (i % 4) * 20}%`,
                  }}
                  animate={{
                    y: [-25, 25, -25],
                    x: [-10, 10, -10],
                    rotate: [0, 360],
                    opacity: [0.2, 0.8, 0.2],
                    scale: [0.7, 1.3, 0.7],
                  }}
                  transition={{
                    duration: 3 + i * 0.4,
                    repeat: Infinity,
                    delay: i * 0.25,
                  }}
                >
                  {isFairyTheme
                    ? ['✧', '♡', '✦', '💕', '✧', '🦋', '♡', '✨', '💖', '✧'][i]
                    : ['✧', '☆', '✦', '🌙', '⭐', '✨', '☆', '✦', '🔮', '✧'][i]
                  }
                </motion.span>
              ))}

              {/* Rising sparkle lines */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`sparkle-line-${i}`}
                  className={`absolute w-px ${
                    isFairyTheme ? 'bg-gradient-to-t from-[#C4A0A5]/60 to-transparent' : 'bg-gradient-to-t from-white/30 to-transparent'
                  }`}
                  style={{
                    height: '30px',
                    left: `${10 + i * 11}%`,
                    bottom: '10%',
                  }}
                  animate={{
                    y: [0, -100, -200],
                    opacity: [0, 0.8, 0],
                    scale: [1, 1.5, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>

            {/* Multiple glowing orbs behind modal */}
            <motion.div
              className={`absolute w-80 h-80 rounded-full blur-3xl ${
                isFairyTheme ? 'bg-[#C4A0A5]/40' : 'bg-[#4a4a4a]/35'
              }`}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
              className={`absolute w-56 h-56 rounded-full blur-2xl ${
                isFairyTheme ? 'bg-white/25' : 'bg-white/15'
              }`}
              animate={{
                scale: [1.2, 0.9, 1.2],
                opacity: [0.2, 0.5, 0.2],
                x: [-30, 30, -30],
                y: [-20, 20, -20],
              }}
              transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div
              className={`absolute w-40 h-40 rounded-full blur-xl ${
                isFairyTheme ? 'bg-[#d4b0b5]/30' : 'bg-[#5a5a5a]/25'
              }`}
              animate={{
                scale: [0.8, 1.4, 0.8],
                opacity: [0.2, 0.4, 0.2],
                x: [40, -40, 40],
                y: [30, -30, 30],
              }}
              transition={{ duration: 6, repeat: Infinity, delay: 1 }}
            />

            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 100, rotateX: 45 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 100, rotateX: -45 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className={`relative w-full max-w-sm rounded-3xl overflow-hidden ${
                isFairyTheme ? 'bg-[#C4A0A5]' : 'bg-gradient-to-b from-[#3a3a3a] to-[#2a2a2a]'
              }`}
              onClick={(e) => e.stopPropagation()}
              style={{ perspective: 1000 }}
            >
              {/* Animated border glow */}
              <motion.div
                className={`absolute -inset-[1px] rounded-3xl ${
                  isFairyTheme
                    ? 'bg-gradient-to-r from-white/40 via-[#C4A0A5] to-white/40'
                    : 'bg-gradient-to-r from-[#4a4a4a]/40 via-white/20 to-[#4a4a4a]/40'
                }`}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ backgroundSize: '200% 200%' }}
              />
              <div className={`relative rounded-3xl ${
                isFairyTheme ? 'bg-[#C4A0A5]' : 'bg-gradient-to-b from-[#3a3a3a] to-[#2a2a2a]'
              }`}>

              {/* Multiple shimmer layers */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/5"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Decorative corner sparkles - both themes */}
              <>
                <motion.span
                  className={`absolute top-4 right-12 text-lg z-10 ${
                    isFairyTheme ? 'text-white/50' : 'text-white/30'
                  }`}
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  ✦
                </motion.span>
                <motion.span
                  className={`absolute top-12 right-4 text-sm z-10 ${
                    isFairyTheme ? 'text-white/40' : 'text-white/25'
                  }`}
                  animate={{
                    rotate: [360, 0],
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                >
                  ✧
                </motion.span>
                <motion.span
                  className={`absolute bottom-20 left-4 text-lg z-10 ${
                    isFairyTheme ? 'text-white/40' : 'text-white/20'
                  }`}
                  animate={{
                    rotate: [0, -360],
                    scale: [1.2, 0.9, 1.2],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                >
                  {isFairyTheme ? '♡' : '☆'}
                </motion.span>
                <motion.span
                  className={`absolute bottom-32 right-6 text-xs z-10 ${
                    isFairyTheme ? 'text-white/30' : 'text-white/20'
                  }`}
                  animate={{
                    y: [-5, 5, -5],
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {isFairyTheme ? '🦋' : '🌙'}
                </motion.span>
              </>

              {/* Header with wave animation */}
              <div className="relative px-5 pt-5 pb-4 flex items-center gap-4">
                <div className="flex-1">
                  <motion.h3
                    className="text-white font-bold text-lg"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, type: 'spring' }}
                  >
                    <motion.span
                      animate={{ opacity: [0.9, 1, 0.9] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Делиться результатами
                    </motion.span>
                  </motion.h3>
                  <motion.p
                    className="text-sm text-white/70"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  >
                    Настрой видимость раскладов
                  </motion.p>
                </div>
                <motion.button
                  onClick={() => setShowShareSettings(false)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-lg font-light relative overflow-hidden ${
                    isFairyTheme ? 'bg-white/20 text-white' : 'bg-[#4a4a4a] text-gray-300'
                  }`}
                  whileHover={{ scale: 1.15, rotate: 180 }}
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <motion.div
                    className={`absolute inset-0 ${
                      isFairyTheme ? 'bg-white/20' : 'bg-white/10'
                    }`}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  ×
                </motion.button>
              </div>

              {/* Content */}
              <div className="relative px-5 pb-6">
                {/* Toggle with glow effect */}
                <motion.div
                  className={`p-4 rounded-2xl mb-4 relative overflow-hidden ${
                    isFairyTheme ? 'bg-white/15 border border-white/25' : 'bg-[#3a3a3a]/70 border border-[#4a4a4a]/50'
                  }`}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  {/* Inner glow */}
                  <motion.div
                    className={`absolute inset-0 ${
                      isFairyTheme ? 'bg-white/5' : 'bg-white/5'
                    }`}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  <div className="flex items-center justify-between relative">
                    <div className="flex-1">
                      <p className="text-white font-medium">Расклады видны подругам</p>
                      <p className="text-xs text-white/60">
                        Подруги могут видеть твои расклады
                      </p>
                    </div>
                    <motion.button
                      onClick={() => {
                        hapticFeedback('impact', 'light')
                        setShareEnabled(!shareEnabled)
                      }}
                      className={`w-14 h-8 rounded-full transition-all relative ${
                        shareEnabled
                          ? isFairyTheme ? 'bg-white/50' : 'bg-[#5a5a5a]'
                          : isFairyTheme ? 'bg-white/20' : 'bg-[#3a3a3a]'
                      }`}
                      whileTap={{ scale: 0.9 }}
                    >
                      {/* Toggle glow when enabled */}
                      {shareEnabled && (
                        <motion.div
                          className={`absolute inset-0 rounded-full ${
                            isFairyTheme ? 'bg-white/30' : 'bg-white/20'
                          }`}
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                      <motion.div
                        className="w-6 h-6 rounded-full absolute top-1 shadow-lg bg-white"
                        animate={{
                          left: shareEnabled ? '1.75rem' : '0.25rem',
                          scale: shareEnabled ? [1, 1.2, 1] : 1,
                          boxShadow: shareEnabled
                            ? ['0 0 10px rgba(255,255,255,0.5)', '0 0 20px rgba(255,255,255,0.8)', '0 0 10px rgba(255,255,255,0.5)']
                            : '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      />
                    </motion.button>
                  </div>
                </motion.div>

                {/* Info with typing effect style */}
                <motion.p
                  className="text-xs text-center mb-4 text-white/60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.span
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    Когда функция включена, подруги смогут видеть твои расклады на вкладке "Подруги"
                  </motion.span>
                </motion.p>

                {/* Share Now Button - Epic version */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, type: 'spring' }}
                >
                  <motion.button
                    onClick={() => {
                      handleShare()
                      setShowShareSettings(false)
                    }}
                    className={`w-full py-4 rounded-2xl font-semibold text-lg mb-3 relative overflow-hidden ${
                      isFairyTheme
                        ? 'bg-white/30 text-white border border-white/40'
                        : 'bg-[#4a4a4a] text-white border border-[#5a5a5a]/30'
                    }`}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {/* Multiple shimmer layers */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                    />
                    <motion.div
                      className={`absolute inset-0 ${
                        isFairyTheme ? 'bg-white/10' : 'bg-white/5'
                      }`}
                      animate={{ opacity: [0, 0.3, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />

                    {/* Floating particles inside button */}
                    {[...Array(4)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute text-xs opacity-50"
                        style={{ left: `${20 + i * 20}%`, top: '50%' }}
                        animate={{
                          y: [-10, 10, -10],
                          opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      >
                        {isFairyTheme ? '✧' : '✦'}
                      </motion.span>
                    ))}

                    <span className="relative flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {isFairyTheme ? '💕' : '✨'}
                      </motion.span>
                      Поделиться сейчас
                    </span>
                  </motion.button>
                </motion.div>

                {/* Done Button */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                >
                  <motion.button
                    onClick={() => setShowShareSettings(false)}
                    className={`w-full py-4 rounded-2xl font-medium relative overflow-hidden ${
                      isFairyTheme
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'bg-[#3a3a3a] text-white border border-[#4a4a4a]'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
                    />
                    <span className="relative">Готово</span>
                  </motion.button>
                </motion.div>
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Friend Detail Modal */}
      <AnimatePresence>
        {selectedFriend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            onClick={() => setSelectedFriend(null)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`relative w-full max-h-[70vh] rounded-t-3xl overflow-hidden ${
                isFairyTheme ? 'bg-gradient-to-b from-[#2a1018] to-[#1a0a10]' : 'bg-[#1a1a1a]'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className={`w-10 h-1 rounded-full ${isFairyTheme ? 'bg-[#FC89AC]/40' : 'bg-[#4a4a4a]'}`} />
              </div>

              {/* Header */}
              <div className="px-5 pb-4 flex items-center gap-4 border-b border-white/10">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                  isFairyTheme ? 'bg-gradient-to-br from-[#FC89AC] to-[#E879F9]' : 'bg-gradient-to-br from-[#4a4a4a] to-[#2a2a2a]'
                }`}>
                  {selectedFriend.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">{selectedFriend.name}</h3>
                  <p className={`text-sm ${isFairyTheme ? 'text-white/70' : 'text-gray-400'}`}>
                    {selectedFriend.title} • {formatDate(selectedFriend.joinedAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFriend(null)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                    isFairyTheme ? 'bg-[#FC89AC]/20 text-white' : 'bg-[#3a3a3a] text-gray-400'
                  }`}
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="px-5 py-4 max-h-[50vh] overflow-y-auto">
                <h4 className={`text-sm font-medium mb-3 ${isFairyTheme ? 'text-white' : 'text-gray-400'}`}>
                  Расклады подруги
                </h4>

                {selectedFriend.spreads && selectedFriend.spreads.length > 0 ? (
                  <div className="space-y-3">
                    {selectedFriend.spreads.map((spread, idx) => {
                      const typeInfo = getSpreadTypeLabel(spread.type)
                      return (
                        <motion.div
                          key={spread.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`p-4 rounded-xl ${
                            isFairyTheme ? 'bg-[#FC89AC]/10' : 'bg-[#2a2a2a]/80'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">{typeInfo.emoji}</span>
                            <span className={`text-sm font-medium ${isFairyTheme ? 'text-white' : 'text-gray-300'}`}>
                              {typeInfo.label}
                            </span>
                            <span className="text-white/30 text-xs ml-auto">{formatDate(spread.date)}</span>
                          </div>
                          <p className="text-white font-medium">{spread.cardName}</p>
                          <p className="text-white/60 text-sm mt-1">{spread.summary}</p>
                        </motion.div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="text-4xl">{isFairyTheme ? '🦋' : '🌙'}</span>
                    <p className="text-white/50 text-sm mt-3">Подруга ещё не делала раскладов</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={`px-5 py-4 border-t ${isFairyTheme ? 'border-[#FC89AC]/20' : 'border-[#3a3a3a]'}`}>
                <Button
                  onClick={() => setSelectedFriend(null)}
                  variant="secondary"
                  className="w-full"
                >
                  Закрыть
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

export default ReferralsPage
