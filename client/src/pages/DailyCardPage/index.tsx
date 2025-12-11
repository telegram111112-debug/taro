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
import { getCurrentFairyBackground } from '../../lib/fairyBackgrounds'
import { getCurrentWitchBackground } from '../../lib/witchBackgrounds'
import { getCurrentDayTheme } from '../../lib/dayThemes'
import { allTarotCards } from '../../data/tarotCards'
import { getZodiacCardExplanation, getZodiacEmoji } from '../../lib/zodiacEmojis'
import type { DeckTheme, Card as TarotCardType, Reading } from '../../types'

type DailyCardStep = 'deck_select' | 'ritual' | 'shuffle' | 'reveal' | 'interpretation'

// Helper to check if date is today
function isSameDay(dateString: string): boolean {
  const readingDate = new Date(dateString)
  const today = new Date()
  return (
    readingDate.getDate() === today.getDate() &&
    readingDate.getMonth() === today.getMonth() &&
    readingDate.getFullYear() === today.getFullYear()
  )
}

export function DailyCardPage() {
  const navigate = useNavigate()
  const { user, canGetDailyCard, useDailyCard, canAskQuestion } = useUserStore()
  const { todayReading, todayReadingDate, setTodayReading, addToCollection, addFeedback } = useCardsStore()
  const { hapticFeedback, showBackButton, hideBackButton } = useTelegram()
  const [showLimitModal, setShowLimitModal] = useState(false)

  // Check if today's reading is valid (from today)
  const validTodayReading = todayReading && todayReadingDate && isSameDay(todayReadingDate) ? todayReading : null

  // Check if user has permanent deck choice
  const hasPermanentDeck = user?.deckPermanent === true

  // Initialize drawnCard from validTodayReading if available
  const initialCard = validTodayReading?.cards?.[0]?.card || null
  const initialReversed = validTodayReading?.cards?.[0]?.isReversed || false

  const [step, setStep] = useState<DailyCardStep>(
    validTodayReading && initialCard ? 'interpretation' : (hasPermanentDeck ? 'ritual' : 'deck_select')
  )
  const [selectedDeck, setSelectedDeck] = useState<DeckTheme>(user?.deckTheme || 'witch')
  const [isShuffling, setIsShuffling] = useState(false)
  const [drawnCard, setDrawnCard] = useState<TarotCardType | null>(initialCard)
  const [isReversed, setIsReversed] = useState(initialReversed)
  const [showFullInterpretation, setShowFullInterpretation] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState(false)
  const [selectedZodiac, setSelectedZodiac] = useState<string | null>(null)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    // Проверяем лимит карты дня
    if (!canGetDailyCard()) {
      hapticFeedback('notification', 'error')
      setShowLimitModal(true)
      return
    }

    // Списываем карту дня
    const success = useDailyCard()
    if (!success) {
      setShowLimitModal(true)
      return
    }

    hapticFeedback('notification', 'success')
    // Select random card from our expanded deck
    const randomCard = allTarotCards[Math.floor(Math.random() * allTarotCards.length)]
    const reversed = Math.random() < 0.3
    setDrawnCard(randomCard)
    setIsReversed(reversed)
    setStep('reveal')

    // Save reading to store for persistence
    const reading: Reading = {
      id: `daily-${Date.now()}`,
      userId: user?.id || 'anonymous',
      type: 'daily',
      cards: [{
        id: `card-${Date.now()}`,
        cardId: randomCard.id,
        card: randomCard,
        position: 0,
        isReversed: reversed,
      }],
      interpretation: {
        greeting: '',
        cardName: randomCard.nameRu,
        isReversed: reversed,
        mainMeaning: reversed ? randomCard.meaningReversed.general : randomCard.meaningUpright.general,
        loveMeaning: reversed ? randomCard.meaningReversed.love : randomCard.meaningUpright.love,
        careerMeaning: reversed ? randomCard.meaningReversed.career : randomCard.meaningUpright.career,
        advice: reversed ? randomCard.meaningReversed.advice : randomCard.meaningUpright.advice,
      },
      moonPhase: getMoonPhase(new Date()),
      createdAt: new Date().toISOString(),
    }
    setTodayReading(reading)

    // Add to collection
    addToCollection({
      cardId: randomCard.id,
      unlockedAt: new Date().toISOString(),
      timesReceived: 1,
    })
  }

  const handleCardRevealed = () => {
    // Задержка 1с чтобы карта осталась на экране
    setTimeout(() => {
      setStep('interpretation')
    }, 1000)
  }

  const handleFeedback = (feedback: 'positive' | 'negative') => {
    hapticFeedback('notification', feedback === 'positive' ? 'success' : 'warning')
    setFeedbackGiven(true)

    // Сохраняем отзыв
    addFeedback({
      readingType: 'daily',
      feedback,
      cards: card ? [card.id] : [],
    })
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              className="mb-8 max-w-sm relative z-10"
            >
              {/* Backdrop panel for readability - розовый оттенок для фей */}
              <div className={`rounded-2xl p-6 backdrop-blur-md border ${
                selectedDeck === 'fairy'
                  ? 'bg-[#C4A0A5]/30 border-[#C4A0A5]/50'
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

            {/* День и настроение */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
              className="mb-6 relative z-10"
            >
              <div className={`backdrop-blur-md rounded-full px-4 py-2 ${
                selectedDeck === 'fairy'
                  ? 'bg-[#C4A0A5]/30 border border-[#C4A0A5]/50'
                  : 'bg-black/40 border border-white/20'
              }`}>
                <p className={`text-sm font-medium ${selectedDeck === 'fairy' ? 'text-white drop-shadow-sm' : 'text-white/70'}`}>
                  {selectedDeck === 'fairy' ? '✨' : '🌙'} {dayTheme.dayName} — {dayTheme.mood}
                </p>
              </div>
            </motion.div>

            {/* Action button - розовая кнопка для фей */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.4 }}
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
            transition={{ duration: 0.4, ease: 'easeOut' }}
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
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

        {/* Reveal Card - пользователь нажимает чтобы открыть */}
        {step === 'reveal' && drawnCard && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
          >
            {/* Background */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
              style={{
                backgroundImage: selectedDeck === 'fairy'
                  ? 'url(/backgrounds/result-fairy.jpg)'
                  : 'url(/backgrounds/result-witch.jpg)',
              }}
            />
            {/* Overlay */}
            <div className={`absolute inset-0 -z-10 ${
              selectedDeck === 'fairy'
                ? 'bg-gradient-to-b from-black/30 via-black/40 to-black/60'
                : 'bg-gradient-to-b from-black/40 via-black/50 to-black/70'
            }`} />

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
                  <h3 className={`text-sm font-medium mb-3 flex items-center gap-2 ${selectedDeck === 'fairy' ? 'text-[#C4A0A5]' : 'text-white/70'}`}>
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

                {/* Астрологическая связь - кликабельные знаки зодиака (всегда видны) */}
                {drawnCard.zodiacConnections && drawnCard.zodiacConnections.length > 0 && (
                  <div className="flex flex-col items-center gap-3 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-center gap-4 text-white/50 text-sm">
                      <span>⚡ Элемент: {drawnCard.element}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {drawnCard.zodiacConnections.map((sign) => (
                        <motion.button
                          key={sign}
                          onClick={() => {
                            hapticFeedback('selection')
                            setSelectedZodiac(sign)
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            selectedDeck === 'fairy'
                              ? 'bg-[#C4A0A5]/20 border border-[#C4A0A5]/30 text-[#C4A0A5] hover:bg-[#C4A0A5]/30'
                              : 'bg-black/40 border border-white/20 text-white/70 hover:bg-black/50 hover:text-white'
                          }`}
                        >
                          {getZodiacEmoji(sign)} {sign}
                        </motion.button>
                      ))}
                    </div>
                    <p className="text-white/40 text-xs">Нажми на знак, чтобы узнать больше</p>
                  </div>
                )}

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
                        <h3 className={`font-medium mb-3 flex items-center gap-2 ${selectedDeck === 'fairy' ? 'text-[#C4A0A5]' : 'text-white/70'}`}>
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
                        <h3 className={`font-medium mb-3 flex items-center gap-2 ${selectedDeck === 'fairy' ? 'text-[#C4A0A5]/80' : 'text-white/60'}`}>
                          <span>💼</span> В делах и финансах
                        </h3>
                        <p className="text-white/80 leading-relaxed whitespace-pre-line">
                          {isReversed
                            ? drawnCard.meaningReversed.career
                            : drawnCard.meaningUpright.career}
                        </p>
                      </div>

                      {/* Совет */}
                      <div className={`bg-gradient-to-r rounded-xl p-4 border ${selectedDeck === 'fairy' ? 'from-[#C4A0A5]/10 to-pink-500/10 border-[#C4A0A5]/20' : 'bg-black/40 border-white/20'}`}>
                        <h3 className={`font-medium mb-3 flex items-center gap-2 ${selectedDeck === 'fairy' ? 'text-[#C4A0A5]' : 'text-white/70'}`}>
                          <span>💡</span> Совет карты
                        </h3>
                        <p className="text-white/90 leading-relaxed italic whitespace-pre-line">
                          {isReversed
                            ? drawnCard.meaningReversed.advice
                            : drawnCard.meaningUpright.advice}
                        </p>
                      </div>

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
                  className={`w-full py-3 text-center text-sm transition-colors border-t border-white/10 mt-2 ${selectedDeck === 'fairy' ? 'text-[#C4A0A5] hover:text-[#C4A0A5]/80' : 'text-white/60 hover:text-white/80'}`}
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
                    variant={selectedDeck === 'fairy' ? 'glass-fairy' : 'glass-witch'}
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

            {/* Кнопка возврата на главную */}
            <div className="mt-4">
              <Button
                onClick={() => navigate('/')}
                variant={selectedDeck === 'fairy' ? 'glass-fairy' : 'glass-witch'}
                size="lg"
                className="w-full"
              >
                На главную
              </Button>
            </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модальное окно с объяснением связи знака зодиака и карты */}
      <AnimatePresence>
        {selectedZodiac && drawnCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedZodiac(null)}
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
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-sm rounded-3xl overflow-hidden ${
                selectedDeck === 'fairy'
                  ? 'bg-gradient-to-b from-[#C4A0A5]/30 to-[#8B6B70]/30'
                  : 'bg-gradient-to-b from-black/80 to-gray-900/80'
              } backdrop-blur-xl border ${
                selectedDeck === 'fairy'
                  ? 'border-[#C4A0A5]/30'
                  : 'border-white/10'
              } shadow-2xl`}
            >
              {/* Decorative top gradient */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                selectedDeck === 'fairy'
                  ? 'bg-gradient-to-r from-transparent via-[#C4A0A5] to-transparent'
                  : 'bg-gradient-to-r from-transparent via-white/40 to-transparent'
              }`} />

              <div className="relative p-6">
                {/* Header with zodiac symbol */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="flex justify-center mb-4"
                >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
                    selectedDeck === 'fairy'
                      ? 'bg-[#C4A0A5]/20 border-2 border-[#C4A0A5]/40'
                      : 'bg-white/10 border-2 border-white/20'
                  }`}>
                    <motion.span
                      animate={{
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    >
                      {getZodiacEmoji(selectedZodiac)}
                    </motion.span>
                  </div>
                </motion.div>

                {/* Connection badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring' }}
                  className="flex justify-center mb-2"
                >
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                    selectedDeck === 'fairy'
                      ? 'bg-[#C4A0A5]/20 text-[#C4A0A5] border border-[#C4A0A5]/30'
                      : 'bg-white/10 text-white/70 border border-white/20'
                  }`}>
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      🔗
                    </motion.span>
                    <span>Астрологическая связь</span>
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`text-xl font-semibold text-center mb-4 ${
                    selectedDeck === 'fairy' ? 'text-[#C4A0A5]' : 'text-white'
                  }`}
                >
                  {getZodiacCardExplanation(selectedZodiac, drawnCard.nameRu, drawnCard.element).title}
                </motion.h3>

                {/* Explanation text */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <p className="text-white/80 text-sm leading-relaxed text-center">
                    {getZodiacCardExplanation(selectedZodiac, drawnCard.nameRu, drawnCard.element).explanation}
                  </p>

                  {/* Divider */}
                  <div className={`h-px w-full ${
                    selectedDeck === 'fairy'
                      ? 'bg-gradient-to-r from-transparent via-[#C4A0A5]/30 to-transparent'
                      : 'bg-gradient-to-r from-transparent via-white/20 to-transparent'
                  }`} />

                  {/* Daily message */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                    className={`p-4 rounded-xl ${
                      selectedDeck === 'fairy'
                        ? 'bg-[#C4A0A5]/10 border border-[#C4A0A5]/20'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <motion.span
                        className="text-2xl"
                        animate={{
                          scale: [1, 1.3, 1],
                          rotate: [0, 15, -15, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      >
                        ✨
                      </motion.span>
                      <p className="text-white/70 text-sm italic">
                        {getZodiacCardExplanation(selectedZodiac, drawnCard.nameRu, drawnCard.element).dailyMessage}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Close button */}
                <motion.button
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedZodiac(null)}
                  className={`w-full mt-6 py-3 rounded-xl font-medium transition-all relative overflow-hidden ${
                    selectedDeck === 'fairy'
                      ? 'bg-gradient-to-r from-[#C4A0A5]/30 via-[#C4A0A5]/40 to-[#C4A0A5]/30 border border-[#C4A0A5]/40 text-white'
                      : 'bg-gradient-to-r from-white/10 via-white/20 to-white/10 border border-white/20 text-white'
                  }`}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Понятно
                    <motion.span
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

      {/* Модальное окно лимита карты дня */}
      <AnimatePresence>
        {showLimitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            onClick={() => setShowLimitModal(false)}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 ${selectedDeck === 'fairy' ? 'bg-[#C4A0A5]/20' : 'bg-[#2a2a2a]/40'} backdrop-blur-md`}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative max-w-sm w-full rounded-3xl p-6 text-center overflow-hidden border-2 ${
                selectedDeck === 'fairy'
                  ? 'border-[#C4A0A5]/40 bg-gradient-to-b from-[#2a1f2d] via-[#1f1a22] to-[#1a1518]'
                  : 'border-[#4a4a4a]/50 bg-gradient-to-b from-[#2a2a2a] via-[#1f1f1f] to-[#1a1a1a]'
              }`}
              style={{
                backgroundImage: selectedDeck === 'fairy'
                  ? 'url(/backgrounds/modal-daily-limit-fairy.jpg)'
                  : 'url(/backgrounds/modal-daily-limit-witch.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Decorative glow */}
              <motion.div
                className={`absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl ${
                  selectedDeck === 'fairy' ? 'bg-[#C4A0A5]/20' : 'bg-[#5a5a5a]/20'
                }`}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              {/* Text content with dark overlay for readability */}
              <div className={`relative z-10 rounded-2xl p-4 mb-4 ${
                selectedDeck === 'fairy'
                  ? 'bg-black/50 backdrop-blur-sm'
                  : 'bg-black/60 backdrop-blur-sm'
              }`}>
                {/* Icon */}
                <motion.div
                  className="mb-3"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                >
                  <motion.div
                    className="text-5xl"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {selectedDeck === 'fairy' ? '🎴' : '🃏'}
                  </motion.div>
                </motion.div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-display font-bold mb-3 text-white"
                >
                  Карта дня уже открыта
                </motion.h3>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white text-sm leading-relaxed"
                >
                  {selectedDeck === 'fairy'
                    ? 'Сегодняшнее послание уже получено. Новая карта будет ждать тебя завтра ✨'
                    : 'Послание дня уже раскрыто. Завтра карты расскажут новое 🌙'}
                </motion.p>
              </div>

              {/* Sparkles for fairy theme */}
              {selectedDeck === 'fairy' && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-[#C4A0A5] rounded-full"
                      style={{
                        left: `${20 + i * 12}%`,
                        top: `${30 + (i % 3) * 20}%`,
                      }}
                      animate={{
                        opacity: [0.2, 0.8, 0.2],
                        scale: [1, 1.5, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Button with animation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="relative z-10"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Button
                    onClick={() => {
                      setShowLimitModal(false)
                      navigate('/')
                    }}
                    variant={selectedDeck === 'fairy' ? 'primary-fairy' : 'primary'}
                    className={`w-full ${
                      selectedDeck === 'fairy'
                        ? 'bg-[#C4A0A5] hover:bg-[#d4b0b5]'
                        : 'bg-[#4a4a4a] hover:bg-[#5a5a5a]'
                    }`}
                  >
                    {selectedDeck === 'fairy' ? 'На главную ✨' : 'На главную 🌙'}
                  </Button>
                </motion.div>
              </motion.div>

              {/* Hint - only show if question is still available */}
              {canAskQuestion() && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-white/60 text-xs mt-4 relative z-10"
                >
                  {selectedDeck === 'fairy'
                    ? 'Попробуй задать вопрос картам 💫'
                    : 'Вопрос картам ещё доступен'}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
