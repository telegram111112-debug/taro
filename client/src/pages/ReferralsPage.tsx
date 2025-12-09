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
          className={`w-10 h-10 border-2 border-t-transparent rounded-full ${isFairyTheme ? 'border-[#FC89AC]' : 'border-slate-400'}`}
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
                  ? 'bg-[#FC89AC]/20 text-[#FC89AC]'
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
                  ? 'bg-[#FC89AC]/20 text-[#FC89AC]'
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

                  {/* Share Settings Button - Большая кнопка с иконкой */}
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    onClick={() => {
                      hapticFeedback('impact', 'light')
                      setShowShareSettings(true)
                    }}
                    className={`w-full p-4 mt-8 rounded-2xl font-medium transition-all active:scale-[0.98] ${
                      isFairyTheme
                        ? 'bg-gradient-to-r from-[#FC89AC]/20 via-[#E879F9]/15 to-[#FC89AC]/20 border-2 border-[#FC89AC]/40 shadow-lg shadow-[#FC89AC]/10'
                        : 'bg-[#2a2a2a]/90 border-2 border-[#3a3a3a]/50 shadow-lg shadow-black/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <motion.div
                        className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <img
                          src={isFairyTheme ? '/icons/share-fairy.png' : '/icons/share-witch.png'}
                          alt="Share"
                          className="w-full h-full object-cover"
                        />
                      </motion.div>

                      {/* Text */}
                      <div className="flex-1 text-left">
                        <p className={`text-base font-semibold ${isFairyTheme ? 'text-white' : 'text-white'}`}>
                          Делиться раскладами
                        </p>
                      </div>

                      {/* Status indicator - glowing dot */}
                      {shareEnabled && (
                        <motion.div
                          className={`w-3 h-3 rounded-full ${
                            isFairyTheme
                              ? 'bg-[#FC89AC]'
                              : 'bg-white'
                          }`}
                          animate={{
                            boxShadow: isFairyTheme
                              ? ['0 0 4px 2px rgba(252, 137, 172, 0.4)', '0 0 8px 4px rgba(252, 137, 172, 0.6)', '0 0 4px 2px rgba(252, 137, 172, 0.4)']
                              : ['0 0 4px 2px rgba(255, 255, 255, 0.3)', '0 0 8px 4px rgba(255, 255, 255, 0.5)', '0 0 4px 2px rgba(255, 255, 255, 0.3)']
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </div>
                  </motion.button>
                </div>
              ) : (
                <div className={`text-center py-12 rounded-2xl ${
                  isFairyTheme ? 'bg-[#FC89AC]/10' : 'bg-slate-800/40'
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
                    <p className={`text-sm ${isFairyTheme ? 'text-[#FC89AC]' : 'text-slate-400'}`}>
                      +1 расклад из 4-х карт обеим
                    </p>
                  </div>
                </div>
              </Card>

              {/* Share Link */}
              <Card variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'}>
                <h3 className={`text-sm font-semibold mb-3 ${isFairyTheme ? 'text-[#FC89AC]' : 'text-slate-300'}`}>
                  Твоя ссылка
                </h3>
                <div className={`rounded-xl overflow-hidden flex mb-3 ${
                  isFairyTheme ? 'bg-white/10' : 'bg-slate-700/50'
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
                          : 'bg-slate-600 text-white'
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
                <h3 className={`text-sm font-semibold mb-4 text-center ${isFairyTheme ? 'text-[#FC89AC]' : 'text-slate-300'}`}>
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
                        isFairyTheme ? 'bg-[#FC89AC]/15' : 'bg-slate-700/40'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isFairyTheme ? 'bg-[#FC89AC] text-white' : 'bg-slate-600 text-white'
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
            className="fixed inset-0 z-50 flex items-end justify-center"
            onClick={() => setShowShareSettings(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`relative w-full rounded-t-3xl overflow-hidden ${
                isFairyTheme ? 'bg-gradient-to-b from-[#2a1018] to-[#1a0a10]' : 'bg-slate-900'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className={`w-10 h-1 rounded-full ${isFairyTheme ? 'bg-[#FC89AC]/40' : 'bg-slate-600'}`} />
              </div>

              {/* Header */}
              <div className="px-5 pb-4 flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">Делиться результатами</h3>
                  <p className={`text-sm ${isFairyTheme ? 'text-[#FC89AC]/70' : 'text-slate-400'}`}>
                    Настрой видимость раскладов
                  </p>
                </div>
                <button
                  onClick={() => setShowShareSettings(false)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isFairyTheme ? 'bg-[#FC89AC]/20 text-[#FC89AC]' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="px-5 pb-6">
                {/* Toggle */}
                <div className={`p-4 rounded-xl mb-4 ${
                  isFairyTheme ? 'bg-[#FC89AC]/10 border border-[#FC89AC]/20' : 'bg-slate-800/50 border border-slate-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white font-medium">Расклады видны подругам</p>
                      <p className={`text-xs ${isFairyTheme ? 'text-[#FC89AC]/60' : 'text-slate-500'}`}>
                        Подруги могут видеть твои расклады
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        hapticFeedback('impact', 'light')
                        setShareEnabled(!shareEnabled)
                      }}
                      className={`w-14 h-8 rounded-full transition-all relative ${
                        shareEnabled
                          ? isFairyTheme ? 'bg-[#FC89AC]' : 'bg-slate-500'
                          : isFairyTheme ? 'bg-[#FC89AC]/30' : 'bg-slate-700'
                      }`}
                    >
                      <motion.div
                        className="w-6 h-6 bg-white rounded-full absolute top-1"
                        animate={{ left: shareEnabled ? '1.75rem' : '0.25rem' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <p className={`text-xs text-center mb-4 ${isFairyTheme ? 'text-[#FC89AC]/50' : 'text-slate-500'}`}>
                  Когда функция включена, подруги смогут видеть твои расклады на вкладке "Подруги"
                </p>

                {/* Share Now Button */}
                <Button
                  onClick={() => {
                    handleShare()
                    setShowShareSettings(false)
                  }}
                  variant={isFairyTheme ? 'primary-fairy' : 'primary'}
                  className="w-full mb-3"
                  size="lg"
                >
                  Поделиться сейчас
                </Button>

                {/* Done Button */}
                <Button
                  onClick={() => setShowShareSettings(false)}
                  variant="secondary"
                  className="w-full"
                >
                  Готово
                </Button>
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
                isFairyTheme ? 'bg-gradient-to-b from-[#2a1018] to-[#1a0a10]' : 'bg-slate-900'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className={`w-10 h-1 rounded-full ${isFairyTheme ? 'bg-[#FC89AC]/40' : 'bg-slate-600'}`} />
              </div>

              {/* Header */}
              <div className="px-5 pb-4 flex items-center gap-4 border-b border-white/10">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                  isFairyTheme ? 'bg-gradient-to-br from-[#FC89AC] to-[#E879F9]' : 'bg-gradient-to-br from-slate-500 to-slate-700'
                }`}>
                  {selectedFriend.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">{selectedFriend.name}</h3>
                  <p className={`text-sm ${isFairyTheme ? 'text-[#FC89AC]/70' : 'text-slate-400'}`}>
                    {selectedFriend.title} • {formatDate(selectedFriend.joinedAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFriend(null)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                    isFairyTheme ? 'bg-[#FC89AC]/20 text-[#FC89AC]' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="px-5 py-4 max-h-[50vh] overflow-y-auto">
                <h4 className={`text-sm font-medium mb-3 ${isFairyTheme ? 'text-[#FC89AC]' : 'text-slate-400'}`}>
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
                            isFairyTheme ? 'bg-[#FC89AC]/10' : 'bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">{typeInfo.emoji}</span>
                            <span className={`text-sm font-medium ${isFairyTheme ? 'text-[#FC89AC]' : 'text-slate-300'}`}>
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
              <div className={`px-5 py-4 border-t ${isFairyTheme ? 'border-[#FC89AC]/20' : 'border-slate-700'}`}>
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
