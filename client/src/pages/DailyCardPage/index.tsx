import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '../../store/useUserStore'
import { useCardsStore } from '../../store/useCardsStore'
import { useTelegram } from '../../providers/TelegramProvider'
import { Header } from '../../components/layout'
import { Button, Card } from '../../components/ui'
import { CardDeck, CardFlip, TarotCard } from '../../components/tarot'
import { DeckSelector } from '../../components/deck/DeckSelector'
import { MagicParticles, FallingElements } from '../../components/effects'
import { getThemeConfig } from '../../lib/deckThemes'
import { getMoonPhase, getMoonName, getMoonMessage, getMoonEmoji } from '../../lib/moonPhase'
import { getUniquePreparationText } from '../../lib/preparationTexts'
import { createShareMessage, shareToTelegram } from '../../lib/sharing'
import { getCurrentFairyBackground, getFairyBackgroundStyle } from '../../lib/fairyBackgrounds'
import { getCurrentWitchBackground, getWitchBackgroundStyle } from '../../lib/witchBackgrounds'
import { getCurrentDayTheme, getDayGradient } from '../../lib/dayThemes'
import { allTarotCards } from '../../data/tarotCards'
import type { DeckTheme, Card as TarotCardType } from '../../types'

type DailyCardStep = 'deck_select' | 'ritual' | 'shuffle' | 'reveal' | 'interpretation'

export function DailyCardPage() {
  const navigate = useNavigate()
  const { user, updateUser } = useUserStore()
  const { todayReading, setTodayReading } = useCardsStore()
  const { hapticFeedback, showBackButton, hideBackButton } = useTelegram()

  // Check if user has permanent deck choice
  const hasPermanentDeck = user?.deckPermanent === true

  const [step, setStep] = useState<DailyCardStep>(
    todayReading ? 'interpretation' : (hasPermanentDeck ? 'ritual' : 'deck_select')
  )
  const [selectedDeck, setSelectedDeck] = useState<DeckTheme>(user?.deckTheme || 'witch')
  const [isShuffling, setIsShuffling] = useState(false)
  const [drawnCard, setDrawnCard] = useState<TarotCardType | null>(null)
  const [isReversed, setIsReversed] = useState(false)
  const [showFullInterpretation, setShowFullInterpretation] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState(false)

  const themeConfig = getThemeConfig(selectedDeck)
  const moonPhase = getMoonPhase(new Date())

  // Фоны для колод по дню недели
  const fairyBackground = useMemo(() => getCurrentFairyBackground(), [])
  const witchBackground = useMemo(() => getCurrentWitchBackground(), [])
  const dayTheme = useMemo(() => getCurrentDayTheme(), [])

  // Preload фонов для результата (чтобы не было задержки)
  useEffect(() => {
    const preloadImages = [
      '/backgrounds/result-fairy.jpg',
      '/backgrounds/result-witch.jpg',
    ]
    preloadImages.forEach(src => {
      const img = new Image()
      img.src = src
    })
  }, [])

  // Получаем уникальный текст подготовки для этого дня/времени
  const preparationText = useMemo(() => getUniquePreparationText(), [])

  useEffect(() => {
    showBackButton(() => navigate(-1))
    return () => hideBackButton()
  }, [])

  // If already has today's reading, show it
  useEffect(() => {
    if (todayReading) {
      setStep('interpretation')
    }
  }, [todayReading])

  const handleDeckSelect = (theme: DeckTheme) => {
    setSelectedDeck(theme)
    setStep('ritual')
  }

  const handleStartShuffle = () => {
    hapticFeedback('impact', 'medium')
    setStep('shuffle')
    setIsShuffling(true)
  }

  const handleShuffleComplete = () => {
    setIsShuffling(false)
  }

  const handleCardSelect = () => {
    hapticFeedback('notification', 'success')
    // Select random card from our expanded deck
    const randomCard = allTarotCards[Math.floor(Math.random() * allTarotCards.length)]
    const reversed = Math.random() < 0.3
    setDrawnCard(randomCard)
    setIsReversed(reversed)
    setStep('reveal')
  }

  const handleCardRevealed = () => {
    setTimeout(() => {
      setStep('interpretation')
    }, 500)
  }

  const handleFeedback = (feedback: 'positive' | 'negative') => {
    hapticFeedback('notification', feedback === 'positive' ? 'success' : 'warning')
    setFeedbackGiven(true)
    // Save feedback to API
    console.log('Feedback:', feedback)
  }

  const handleShare = () => {
    if (!drawnCard) return
    hapticFeedback('impact', 'medium')

    const shareText = createShareMessage(
      drawnCard,
      isReversed,
      `https://t.me/taropodruga_bot?start=${user?.referralCode || ''}`,
      'mystical'
    )
    shareToTelegram(shareText)
  }

  return (
    <div className="min-h-screen">
      {step !== 'deck_select' && step !== 'interpretation' && (
        <Header
          showBack={true}
          transparent={true}
        />
      )}

      <AnimatePresence mode="wait">
        {/* Deck Selection (if not permanent) */}
        {step === 'deck_select' && (
          <motion.div
            key="deck_select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DeckSelector
              onSelect={handleDeckSelect}
              showPermanentOption={true}
            />
          </motion.div>
        )}

        {/* Ritual / Preparation - С ФОНОМ КРЫЛЬЕВ */}
        {step === 'ritual' && (
          <motion.div
            key="ritual"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
          >
            {/* Фон с крыльями */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: selectedDeck === 'fairy'
                  ? 'url(/backgrounds/wings-fairy.jpg)'
                  : 'url(/backgrounds/wings-witch.jpg)',
              }}
            />
            {/* Затемнение для читаемости текста - нежнее для фей */}
            <div className={`absolute inset-0 ${
              selectedDeck === 'fairy'
                ? 'bg-gradient-to-b from-[#1a0a10]/30 via-transparent to-[#1a0a10]/40'
                : 'bg-gradient-to-b from-black/50 via-black/30 to-black/60'
            }`} />

            {/* Magic particles */}
            <MagicParticles theme={selectedDeck} intensity="medium" />

            {/* Падающие тематические элементы */}
            <FallingElements theme={selectedDeck} intensity="medium" />

            {/* Main preparation text */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8 max-w-sm relative z-10"
            >
              {/* Backdrop panel for readability - розовый оттенок для фей */}
              <div className={`rounded-2xl p-6 backdrop-blur-md border ${
                selectedDeck === 'fairy'
                  ? 'bg-[#FC89AC]/30 border-[#FC89AC]/50'
                  : 'bg-black/60 border-white/10'
              }`}>
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  {themeConfig.emoji.main}
                </motion.div>
                <h2 className={`text-2xl font-display font-semibold mb-3 ${
                  selectedDeck === 'fairy' ? 'text-white drop-shadow-lg' : 'text-white'
                }`}>
                  {preparationText.title}
                </h2>
                <p className={`leading-relaxed ${
                  selectedDeck === 'fairy' ? 'text-white/80 drop-shadow-md' : 'text-white/70'
                }`}>
                  {preparationText.subtitle}
                </p>
              </div>
            </motion.div>

            {/* Moon info - розовая карточка для фей */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8 w-full max-w-sm relative z-10"
            >
              <div className={`rounded-xl p-4 backdrop-blur-md border ${
                selectedDeck === 'fairy'
                  ? 'bg-[#FC89AC]/30 border-[#FC89AC]/50'
                  : 'bg-white/5 border-white/10'
              }`}>
                <div className="flex items-center justify-center gap-4">
                  <motion.span
                    className="text-3xl"
                    style={{
                      filter: selectedDeck === 'witch'
                        ? 'grayscale(100%) brightness(2)'
                        : 'sepia(100%) hue-rotate(290deg) saturate(3) brightness(1.1)'
                    }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {getMoonEmoji(moonPhase)}
                  </motion.span>
                  <div className="text-left">
                    <span className={`font-semibold block text-base ${
                      selectedDeck === 'fairy' ? 'text-white drop-shadow-lg' : 'text-white'
                    }`}>{getMoonName(moonPhase)}</span>
                    <p className={`text-sm ${
                      selectedDeck === 'fairy' ? 'text-white/90' : 'text-white/50'
                    }`}>
                      {getMoonMessage(moonPhase)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* День и настроение */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-6 relative z-10"
            >
              <div className={`backdrop-blur-md rounded-full px-4 py-2 ${
                selectedDeck === 'fairy'
                  ? 'bg-[#FC89AC]/30 border border-[#FC89AC]/50'
                  : 'bg-slate-700/40 border border-slate-500/30'
              }`}>
                <p className={`text-sm font-medium ${selectedDeck === 'fairy' ? 'text-white drop-shadow-sm' : 'text-slate-300'}`}>
                  {selectedDeck === 'fairy' ? '✨' : '🌙'} {dayTheme.dayName} — {dayTheme.mood}
                </p>
              </div>
            </motion.div>

            {/* Action button - розовая кнопка для фей */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="relative z-10 flex justify-center w-full"
            >
              <Button
                onClick={handleStartShuffle}
                size="lg"
                variant={selectedDeck === 'fairy' ? 'glass-fairy' : 'glass-witch'}
                className="px-12 shadow-lg"
              >
                Я готова
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Shuffle & Select - ДНЕВНЫЕ ФОНЫ МЕНЯЮТСЯ ПО ДНЯМ НЕДЕЛИ */}
        {step === 'shuffle' && (
          <motion.div
            key="shuffle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
          >
            {/* Фон - меняется по дням недели из witchBackgrounds/fairyBackgrounds */}
            <div
              className="fixed inset-0 -z-10"
              style={{
                backgroundImage: selectedDeck === 'fairy'
                  ? `url(${fairyBackground.imagePath})`
                  : `url(${witchBackground.imagePath})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />
            {/* Оверлей - усиленный для читаемости текста */}
            <div className={`fixed inset-0 -z-10 ${
              selectedDeck === 'fairy'
                ? 'bg-gradient-to-b from-black/40 via-black/30 to-black/50'
                : 'bg-gradient-to-b from-black/50 via-black/40 to-black/60'
            }`} />

            {/* Падающие тематические элементы */}
            <FallingElements theme={selectedDeck} intensity="heavy" />

            <div className="relative z-10">
              <CardDeck
                isShuffling={isShuffling}
                onShuffleComplete={handleShuffleComplete}
                onCardSelect={handleCardSelect}
                deckTheme={selectedDeck}
              />
            </div>

            {/* Описание дня - с фоновой подложкой для читаемости */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-8 left-0 right-0 text-center px-6 z-10"
            >
              <div className="inline-block bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2">
                <p className="text-white/80 text-sm italic">
                  {selectedDeck === 'fairy' ? fairyBackground.description : witchBackground.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Reveal Card */}
        {step === 'reveal' && drawnCard && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center p-6 relative"
            style={{
              backgroundImage: selectedDeck === 'fairy'
                ? 'url(/backgrounds/result-fairy.jpg)'
                : 'url(/backgrounds/result-witch.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Оверлей - усиленный для фокуса на карте */}
            <div className={`absolute inset-0 ${
              selectedDeck === 'fairy'
                ? 'bg-gradient-to-b from-black/40 via-black/30 to-black/50'
                : 'bg-gradient-to-b from-black/60 via-black/50 to-black/70'
            }`} />

            {/* Падающие тематические элементы */}
            <FallingElements theme={selectedDeck} intensity="medium" />

            <div className="relative z-10">
              <CardFlip
                card={drawnCard}
                isReversed={isReversed}
                onReveal={handleCardRevealed}
                deckTheme={selectedDeck}
              />
            </div>
          </motion.div>
        )}

        {/* Interpretation - РАСШИРЕННЫЕ ТРАКТОВКИ */}
        {step === 'interpretation' && drawnCard && (
          <motion.div
            key="interpretation"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen relative"
          >
            {/* Фон для страницы интерпретации - без анимации для мгновенной загрузки */}
            <div
              className="fixed inset-0 -z-10"
              style={{
                backgroundImage: selectedDeck === 'fairy'
                  ? 'url(/backgrounds/result-fairy.jpg)'
                  : 'url(/backgrounds/result-witch.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />
            <div className={`fixed inset-0 -z-10 ${
              selectedDeck === 'fairy'
                ? 'bg-gradient-to-b from-black/60 via-black/50 to-black/70'
                : 'bg-gradient-to-b from-black/70 via-black/60 to-black/80'
            }`} />

            <div className="p-4 pb-24">
            {/* Card display - центрировано */}
            <div className="flex justify-center mb-6">
              <TarotCard
                card={drawnCard}
                isReversed={isReversed}
                isRevealed={true}
                size="md"
                showName={true}
                deckTheme={selectedDeck}
              />
            </div>

            {/* Interpretation content - профессиональный стиль */}
            <Card variant={selectedDeck === 'fairy' ? 'mystic-fairy' : 'mystic-witch'} className="mb-4">
              <div className="space-y-5">
                {/* Приветствие */}
                <div className="text-center pb-3 border-b border-white/10">
                  <motion.span
                    className="text-3xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {selectedDeck === 'fairy' ? '✨' : '🌙'}
                  </motion.span>
                  <h2 className="text-xl font-display font-bold text-white mt-2">
                    {drawnCard.nameRu}
                    {isReversed && <span className="text-white/50 text-sm ml-2">(перевёрнутая)</span>}
                  </h2>
                  <p className="text-white/50 text-sm">{drawnCard.nameEn}</p>
                </div>

                {/* Основное послание */}
                <div>
                  <h3 className={`text-sm font-medium mb-3 flex items-center gap-2 ${selectedDeck === 'fairy' ? 'text-[#FC89AC]' : 'text-slate-300'}`}>
                    <span>{selectedDeck === 'fairy' ? '🦋' : '🔮'}</span> Послание для тебя
                  </h3>
                  <p className="text-white/90 leading-relaxed whitespace-pre-line">
                    {isReversed
                      ? drawnCard.meaningReversed.general
                      : drawnCard.meaningUpright.general}
                  </p>
                </div>

                {/* Ключевые слова */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {drawnCard.keywords.map((keyword, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-white/5 rounded-full text-xs text-white/60"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>

                {/* Развёрнутая трактовка */}
                <AnimatePresence>
                  {showFullInterpretation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-5 pt-3 border-t border-white/10"
                    >
                      {/* В любви */}
                      <div>
                        <h3 className={`font-medium mb-3 flex items-center gap-2 ${selectedDeck === 'fairy' ? 'text-[#FC89AC]' : 'text-slate-300'}`}>
                          <span>{selectedDeck === 'fairy' ? '💕' : '🖤'}</span> В любви и отношениях
                        </h3>
                        <p className="text-white/80 leading-relaxed whitespace-pre-line">
                          {isReversed
                            ? drawnCard.meaningReversed.love
                            : drawnCard.meaningUpright.love}
                        </p>
                      </div>

                      {/* В карьере */}
                      <div>
                        <h3 className={`font-medium mb-3 flex items-center gap-2 ${selectedDeck === 'fairy' ? 'text-[#FC89AC]/80' : 'text-slate-400'}`}>
                          <span>💼</span> В делах и финансах
                        </h3>
                        <p className="text-white/80 leading-relaxed whitespace-pre-line">
                          {isReversed
                            ? drawnCard.meaningReversed.career
                            : drawnCard.meaningUpright.career}
                        </p>
                      </div>

                      {/* Совет */}
                      <div className={`bg-gradient-to-r rounded-xl p-4 border ${selectedDeck === 'fairy' ? 'from-[#FC89AC]/10 to-pink-500/10 border-[#FC89AC]/20' : 'from-slate-500/10 to-slate-600/10 border-slate-500/20'}`}>
                        <h3 className={`font-medium mb-3 flex items-center gap-2 ${selectedDeck === 'fairy' ? 'text-[#FC89AC]' : 'text-slate-300'}`}>
                          <span>💡</span> Совет карты
                        </h3>
                        <p className="text-white/90 leading-relaxed italic whitespace-pre-line">
                          {isReversed
                            ? drawnCard.meaningReversed.advice
                            : drawnCard.meaningUpright.advice}
                        </p>
                      </div>

                      {/* Астрологическая связь */}
                      {drawnCard.zodiacConnections && drawnCard.zodiacConnections.length > 0 && (
                        <div className="flex items-center justify-center gap-4 text-white/50 text-sm">
                          <span>⚡ Элемент: {drawnCard.element}</span>
                          <span>♈ {drawnCard.zodiacConnections.join(', ')}</span>
                        </div>
                      )}

                      {/* Особое для знака зодиака */}
                      {user?.zodiacSign && drawnCard.zodiacConnections?.includes(user.zodiacSign) && (
                        <motion.div
                          initial={{ scale: 0.95 }}
                          animate={{ scale: 1 }}
                          className="p-4 rounded-xl bg-gold-500/10 border border-gold-500/30 text-center"
                        >
                          <span className="text-2xl">⭐</span>
                          <h3 className="text-gold-400 font-medium mt-2 mb-1">
                            Особое послание для {user.zodiacSign}
                          </h3>
                          <p className="text-white/80 text-sm">
                            Эта карта находится в особом резонансе с энергией твоего знака!
                            Её послание сейчас особенно важно для тебя — прислушайся к нему внимательнее.
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Кнопка развернуть/свернуть */}
                <button
                  onClick={() => setShowFullInterpretation(!showFullInterpretation)}
                  className={`w-full py-3 text-center text-sm transition-colors border-t border-white/10 mt-2 ${selectedDeck === 'fairy' ? 'text-[#FC89AC] hover:text-[#FC89AC]/80' : 'text-slate-400 hover:text-slate-300'}`}
                >
                  {showFullInterpretation ? '↑ Свернуть' : '↓ Читать полную трактовку...'}
                </button>
              </div>
            </Card>

            {/* Feedback */}
            {!feedbackGiven ? (
              <Card variant={selectedDeck === 'fairy' ? 'glass-fairy' : 'glass-witch'} className="mb-4">
                <p className="text-white/60 text-sm text-center mb-3">
                  Насколько это отозвалось в тебе?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => handleFeedback('negative')}
                  >
                    💔 Мимо
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleFeedback('positive')}
                  >
                    {selectedDeck === 'fairy' ? '💕' : '🖤'} В точку!
                  </Button>
                </div>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <span className="text-2xl">💫</span>
                <p className="text-white/60 text-sm mt-2">Спасибо за отзыв!</p>
              </motion.div>
            )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
