import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '../store/useUserStore'
import { useCardsStore } from '../store/useCardsStore'
import { useTelegram } from '../providers/TelegramProvider'
import { Header } from '../components/layout'
import { Button, Card, MysticLoader } from '../components/ui'
import { TarotCard, CardDeck } from '../components/tarot'
import { DeckSelector } from '../components/deck/DeckSelector'
import { getThemeConfig } from '../lib/deckThemes'
import { getThemeEmoji } from '../lib/themeEmojis'
import { generateFullInterpretation, generateClarifyingCardInterpretation, ClarifyingCardInterpretation } from '../lib/spreadInterpretations'
import { drawCardsForSpread, drawSingleCard } from '../data/tarotCards'
import { getCurrentFairyBackground } from '../lib/fairyBackgrounds'
import { getCurrentWitchBackground } from '../lib/witchBackgrounds'
import type { DeckTheme, Card as TarotCardType, ReadingType } from '../types'

// Получить фон по дню недели (синхронизировано с DailyCardPage)
const getShuffleBackground = (theme: DeckTheme): string => {
  if (theme === 'fairy') {
    return getCurrentFairyBackground().imagePath
  }
  return getCurrentWitchBackground().imagePath
}

const spreadConfigs = {
  love: {
    name: 'Путь Сердца',
    emojiKey: 'spreadLove' as const,
    positions: [
      { name: 'Ты сейчас', description: 'Как ты себя чувствуешь в отношениях' },
      { name: 'Он/Она', description: 'Что чувствует/думает партнёр' },
      { name: 'Препятствие', description: 'Что мешает гармонии' },
      { name: 'Будущее', description: 'К чему всё идёт' },
    ],
  },
  money: {
    name: 'Золотой Путь',
    emojiKey: 'spreadMoney' as const,
    positions: [
      { name: 'Текущее состояние', description: 'Где ты сейчас финансово' },
      { name: 'Скрытые возможности', description: 'Что ты упускаешь' },
      { name: 'Препятствия', description: 'Что мешает достатку' },
      { name: 'Результат', description: 'К чему приведут действия' },
    ],
  },
  future: {
    name: 'Колесо Судьбы',
    emojiKey: 'spreadFuture' as const,
    positions: [
      { name: 'Прошлое', description: 'Что влияет на будущее' },
      { name: 'Настоящее', description: 'Точка силы' },
      { name: 'Ближайшее будущее', description: '1-3 месяца' },
      { name: 'Далёкое будущее', description: '6-12 месяцев' },
    ],
  },
}

type SpreadStep = 'intro' | 'deck_select' | 'shuffle' | 'reveal' | 'interpretation'

export function SpreadPage() {
  const { type } = useParams<{ type: string }>()
  const navigate = useNavigate()
  const { user } = useUserStore()
  const { addFeedback } = useCardsStore()
  const { hapticFeedback, showBackButton, hideBackButton } = useTelegram()

  const spreadConfig = spreadConfigs[type as keyof typeof spreadConfigs]
  const hasPermanentDeck = user?.deckPermanent === true

  const [step, setStep] = useState<SpreadStep>('intro')
  const [selectedDeck, setSelectedDeck] = useState<DeckTheme>(user?.deckTheme || 'witch')
  const [isShuffling, setIsShuffling] = useState(false)
  const [cards, setCards] = useState<Array<{ card: TarotCardType; isReversed: boolean }>>([])
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set())
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  const [clarifyingCard, setClarifyingCard] = useState<{ card: TarotCardType; isReversed: boolean } | null>(null)
  const [clarifyingInterpretation, setClarifyingInterpretation] = useState<ClarifyingCardInterpretation | null>(null)
  const [showClarifyingCard, setShowClarifyingCard] = useState(false)
  const [isDrawingClarifyingCard, setIsDrawingClarifyingCard] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState(false)

  const themeConfig = getThemeConfig(selectedDeck)

  useEffect(() => {
    showBackButton(() => navigate(-1))
    return () => hideBackButton()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!spreadConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/60">Расклад не найден</p>
      </div>
    )
  }

  const handleStart = () => {
    hapticFeedback('impact', 'light')
    if (hasPermanentDeck) {
      setStep('shuffle')
      setIsShuffling(true)
    } else {
      setStep('deck_select')
    }
  }

  // Обработчик отзыва о раскладе
  const handleFeedback = (feedback: 'positive' | 'negative') => {
    hapticFeedback('notification', feedback === 'positive' ? 'success' : 'warning')
    setFeedbackGiven(true)

    // Сохраняем отзыв
    const readingType = type as 'love' | 'money' | 'future'
    addFeedback({
      readingType,
      feedback,
      cards: cards.map(c => c.card.id),
    })
  }

  const handleDeckSelect = (theme: DeckTheme) => {
    setSelectedDeck(theme)
    setStep('shuffle')
    setIsShuffling(true)
  }

  const handleShuffleComplete = () => {
    setIsShuffling(false)
  }

  // Предварительно вытягиваем все карты для расклада (но показываем по одной)
  const [predrawnCards, setPredrawnCards] = useState<Array<{ card: TarotCardType; isReversed: boolean }>>([])

  const handleCardSelect = () => {
    hapticFeedback('notification', 'success')

    // При первом выборе - вытягиваем все карты заранее
    if (predrawnCards.length === 0) {
      const allCards = drawCardsForSpread(spreadConfig.positions.length)
      setPredrawnCards(allCards)
      // Добавляем первую карту
      setCards([allCards[0]])
    } else {
      // Добавляем следующую карту из предвытянутых
      const nextIndex = cards.length
      if (nextIndex < predrawnCards.length) {
        setCards(prev => [...prev, predrawnCards[nextIndex]])
      }
    }

    // Если выбрали все карты - переходим к раскрытию с паузой 1 секунда
    if (cards.length + 1 >= spreadConfig.positions.length) {
      setTimeout(() => {
        setStep('reveal')
      }, 1000)
    }
  }

  const handleRevealCard = (index: number) => {
    // Если карта уже открыта - ничего не делаем
    if (revealedCards.has(index)) return

    hapticFeedback('impact', 'medium')
    const newRevealedCards = new Set(revealedCards)
    newRevealedCards.add(index)
    setRevealedCards(newRevealedCards)

    // Если все карты открыты - переходим к интерпретации
    if (newRevealedCards.size === spreadConfig.positions.length) {
      setTimeout(() => {
        setStep('interpretation')
      }, 1000)
    }
  }

  const isWitchTheme = selectedDeck === 'witch'
  const isFairyTheme = selectedDeck === 'fairy'

  // Функция вытягивания пояснительной карты
  const handleDrawClarifyingCard = () => {
    hapticFeedback('impact', 'medium')
    setIsDrawingClarifyingCard(true)

    // Имитация анимации вытягивания
    setTimeout(() => {
      // Вытягиваем карту, исключая уже вытянутые в раскладе
      const usedCardIds = cards.map(c => c.card.id)
      const newClarifyingCard = drawSingleCard(usedCardIds)
      setClarifyingCard(newClarifyingCard)

      // Генерация интерпретации
      const interp = generateClarifyingCardInterpretation(
        newClarifyingCard,
        cards,
        type as ReadingType,
        user
      )
      setClarifyingInterpretation(interp)
      setIsDrawingClarifyingCard(false)
      setShowClarifyingCard(true)
      hapticFeedback('notification', 'success')
    }, 2300)
  }

  // Генерация полной интерпретации
  const interpretation = useMemo(() => {
    if (cards.length === 0) return null
    return generateFullInterpretation(
      cards,
      spreadConfig.positions,
      type as ReadingType,
      user
    )
  }, [cards, spreadConfig.positions, type, user])

  // Определяем фон: на шаге shuffle используем динамический фон по дню недели
  const isShuffleStep = step === 'shuffle'
  const backgroundImage = isShuffleStep
    ? getShuffleBackground(selectedDeck)
    : isWitchTheme
      ? '/backgrounds/background-witch.jpg'
      : '/backgrounds/background-fairy.jpg'

  return (
    <div className="min-h-screen relative">
      {/* Background based on theme and step */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10 transition-all duration-500"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className={`fixed inset-0 -z-10 transition-all duration-500 ${
        isWitchTheme ? 'bg-black/60' : 'bg-black/40'
      }`} />
      {step !== 'deck_select' && (
        <Header
          title={`${spreadConfig.name} ${getThemeEmoji(selectedDeck, spreadConfig.emojiKey)}`}
          showBack={step === 'intro'}
        />
      )}

      <AnimatePresence mode="wait">
        {/* Intro */}
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="min-h-screen flex flex-col items-center justify-center p-6 pb-20"
          >
            <div className="text-center mb-10">
              <div className="text-6xl mb-4">
                {spreadConfig.emojiKey === 'spreadFuture' && (
                  <img
                    src="/icons/crystal-ball.png"
                    alt="Будущее"
                    className="w-16 h-16 mx-auto object-contain"
                  />
                )}
                {spreadConfig.emojiKey === 'spreadLove' && (
                  <img
                    src={isFairyTheme ? '/icons/spread-love-fairy.png' : '/icons/spread-love-witch.png'}
                    alt="Любовь"
                    className="w-16 h-16 mx-auto object-contain"
                  />
                )}
                {spreadConfig.emojiKey === 'spreadMoney' && (
                  <img
                    src={isFairyTheme ? '/icons/spread-money-fairy.png' : '/icons/spread-money-witch.png'}
                    alt="Деньги"
                    className="w-16 h-16 mx-auto object-contain"
                  />
                )}
              </div>
              <h2 className="text-2xl font-display font-bold text-white mb-2 text-center">
                {spreadConfig.name}
              </h2>
              <p className="text-white/60 text-center">
                Расклад из {spreadConfig.positions.length} карт
              </p>
            </div>

            {/* Позиции карт - без рамки, читабельный текст */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full max-w-sm mb-10"
            >
              {/* Positions list */}
              <div className="space-y-4">
                {spreadConfig.positions.map((pos, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: i * 0.06, ease: 'easeOut' }}
                    className="flex items-center gap-4"
                  >
                    {/* Number */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0 ${
                        isFairyTheme
                          ? 'bg-[#C4A0A5]/80 text-white'
                          : 'bg-white/30 text-white border border-white/40'
                      }`}
                      style={{
                        textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                      }}
                    >
                      {i + 1}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-white font-semibold text-base"
                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                      >
                        {pos.name}
                      </p>
                      <p
                        className={`text-sm ${isFairyTheme ? 'text-white/80' : 'text-white/70'}`}
                        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}
                      >
                        {pos.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Epic Start Button */}
            <motion.button
              onClick={handleStart}
              className={`relative overflow-hidden px-10 py-5 rounded-2xl font-bold text-lg transition-all ${
                isFairyTheme
                  ? 'bg-gradient-to-r from-[#C4A0A5] via-[#d4b0b5] to-[#C4A0A5] text-white'
                  : 'bg-gradient-to-r from-[#3a3a3a] via-[#4a4a4a] to-[#3a3a3a] text-white border border-white/20'
              }`}
              style={{
                boxShadow: isFairyTheme
                  ? '0 8px 32px rgba(196, 160, 165, 0.4), 0 0 60px rgba(196, 160, 165, 0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
                  : '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 60px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Animated gradient overlay */}
              <motion.div
                className={`absolute inset-0 ${
                  isFairyTheme
                    ? 'bg-gradient-to-r from-transparent via-white/30 to-transparent'
                    : 'bg-gradient-to-r from-transparent via-white/15 to-transparent'
                }`}
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
              />

              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-1.5 h-1.5 rounded-full ${
                    isFairyTheme ? 'bg-white/50' : 'bg-white/30'
                  }`}
                  style={{
                    left: `${15 + i * 14}%`,
                    top: '50%',
                  }}
                  animate={{
                    y: [-12, 12, -12],
                    opacity: [0.2, 0.8, 0.2],
                    scale: [0.5, 1.2, 0.5],
                  }}
                  transition={{
                    duration: 2 + i * 0.3,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}

              {/* Glowing border effect */}
              <motion.div
                className={`absolute -inset-[1px] rounded-2xl ${
                  isFairyTheme
                    ? 'bg-gradient-to-r from-[#C4A0A5]/0 via-white/50 to-[#C4A0A5]/0'
                    : 'bg-gradient-to-r from-white/0 via-white/30 to-white/0'
                }`}
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ zIndex: -1 }}
              />

              {/* Content */}
              <span className="relative flex items-center justify-center gap-3">
                <motion.span
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {isFairyTheme ? '✨' : '🌙'}
                </motion.span>
                Начать расклад
                <motion.span
                  animate={{
                    rotate: [0, -10, 10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  {isFairyTheme ? '🦋' : '✦'}
                </motion.span>
              </span>
            </motion.button>
          </motion.div>
        )}

        {/* Deck Select */}
        {step === 'deck_select' && (
          <motion.div
            key="deck_select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <DeckSelector onSelect={handleDeckSelect} />
          </motion.div>
        )}

        {/* Shuffle & Card Selection */}
        {step === 'shuffle' && (
          <motion.div
            key="shuffle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-screen flex flex-col items-center justify-center p-6 overflow-hidden"
            style={{ touchAction: 'none' }}
          >
            {/* Показываем уже выбранные карты сверху с эпичными эффектами */}
            {cards.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-1 mb-6 justify-center relative"
              >
                {/* Общее свечение за картами */}
                <motion.div
                  className="absolute inset-0 -z-10 blur-3xl"
                  style={{
                    background: isFairyTheme
                      ? 'radial-gradient(ellipse at center, rgba(196, 160, 165, 0.3) 0%, transparent 70%)'
                      : 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {cards.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      damping: 12,
                      stiffness: 100,
                    }}
                    className="text-center relative"
                  >
                    {/* Индивидуальное свечение карты */}
                    <motion.div
                      className="absolute inset-0 -z-10 blur-xl rounded-xl"
                      style={{
                        background: isFairyTheme
                          ? 'rgba(196, 160, 165, 0.4)'
                          : 'rgba(255, 255, 255, 0.4)',
                      }}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.4, 0.7, 0.4],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: 'easeInOut',
                      }}
                    />

                    {/* Номер позиции - бейдж */}
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: i * 0.1 + 0.3, type: 'spring', damping: 10 }}
                      className={`
                        absolute -top-2 -right-2 w-6 h-6 rounded-full z-10
                        flex items-center justify-center text-xs font-bold
                        ${isFairyTheme
                          ? 'bg-[#C4A0A5] text-white shadow-lg shadow-[#C4A0A5]/50'
                          : 'bg-gradient-to-br from-white to-gray-200 text-gray-800 shadow-lg shadow-white/30'
                        }
                      `}
                    >
                      {i + 1}
                    </motion.div>

                    {/* Контейнер карты с кольцом */}
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', damping: 15 }}
                    >
                      {/* Декоративное кольцо вокруг карты */}
                      <motion.div
                        className={`
                          absolute -inset-1 rounded-xl
                          ${isFairyTheme
                            ? 'bg-gradient-to-br from-pink-400/30 via-rose-300/20 to-pink-500/30'
                            : 'bg-gradient-to-br from-white/40 via-white/30 to-white/40'
                          }
                        `}
                        animate={{
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                      <TarotCard
                        card={c.card}
                        isReversed={c.isReversed}
                        isRevealed={false}
                        size="xxs"
                        deckTheme={selectedDeck}
                      />
                    </motion.div>

                  </motion.div>
                ))}
              </motion.div>
            )}

            <CardDeck
              isShuffling={isShuffling}
              onShuffleComplete={handleShuffleComplete}
              onCardSelect={handleCardSelect}
              deckTheme={selectedDeck}
              cardsCount={spreadConfig.positions.length + 3}
              requiredSelections={spreadConfig.positions.length}
              selectedCount={cards.length}
              positionNames={spreadConfig.positions.map(p => p.name)}
            />
          </motion.div>
        )}

        {/* Reveal */}
        {step === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="p-4 pb-24 min-h-screen flex flex-col"
          >
            <p className="text-center text-white/60 text-sm mb-4">
              Нажимай на карты в любом порядке {getThemeEmoji(selectedDeck, 'main')}
            </p>

            <div className="grid grid-cols-2 gap-3 flex-1">
              {spreadConfig.positions.map((pos, i) => {
                const isRevealed = revealedCards.has(i)
                const isClickable = !isRevealed

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut', delay: i * 0.08 }}
                    className="flex flex-col items-center"
                  >
                    {/* Название позиции с подложкой для читаемости */}
                    <div className={`px-3 py-1.5 rounded-full mb-2 backdrop-blur-sm ${
                      isWitchTheme
                        ? 'bg-black/50 border border-white/20'
                        : 'bg-[#C4A0A5]/30 border border-[#C4A0A5]/40'
                    }`}>
                      <p className={`text-sm text-center font-display font-medium ${
                        isWitchTheme ? 'text-white' : 'text-white'
                      }`}>
                        {pos.name}
                      </p>
                    </div>
                    <motion.div
                      onClick={() => handleRevealCard(i)}
                      className={`relative cursor-pointer ${isClickable ? 'animate-pulse' : ''}`}
                      whileHover={isClickable ? { scale: 1.02 } : {}}
                      whileTap={isClickable ? { scale: 0.98 } : {}}
                    >
                      {/* Свечение вокруг карты для witch темы - белое */}
                      {isWitchTheme && !isRevealed && (
                        <motion.div
                          className="absolute -inset-2 rounded-xl blur-lg z-0"
                          style={{
                            background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
                          }}
                          animate={{
                            opacity: [0.4, 0.7, 0.4],
                            scale: [1, 1.05, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                      {/* Свечение вокруг карты для fairy темы - розовое */}
                      {isFairyTheme && !isRevealed && (
                        <motion.div
                          className="absolute -inset-2 rounded-xl blur-lg z-0"
                          style={{
                            background: 'radial-gradient(ellipse at center, rgba(196, 160, 165, 0.4) 0%, transparent 70%)',
                          }}
                          animate={{
                            opacity: [0.4, 0.7, 0.4],
                            scale: [1, 1.05, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                      <TarotCard
                        card={cards[i]?.card}
                        isReversed={cards[i]?.isReversed}
                        isRevealed={isRevealed}
                        size="lg"
                        deckTheme={selectedDeck}
                      />
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Interpretation */}
        {step === 'interpretation' && interpretation && (
          <motion.div
            key="interpretation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="p-4 pb-24"
          >
            {/* Приветствие */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="mb-6"
            >
              <Card variant={isWitchTheme ? 'mystic-witch' : 'mystic-fairy'} className={isWitchTheme ? 'border-white/20' : 'border-[#C4A0A5]/30'}>
                <p className="text-white/90 leading-relaxed text-center italic">
                  {interpretation.greeting}
                </p>
              </Card>
            </motion.div>

            {/* Cards overview */}
            <div className="flex justify-center gap-2 mb-6 overflow-x-auto py-2">
              {cards.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: i * 0.05 }}
                  onClick={() => setSelectedPosition(i)}
                  className={`flex-shrink-0 cursor-pointer transition-transform ${
                    selectedPosition === i
                      ? 'ring-2 ring-gold-400 rounded-xl scale-105'
                      : 'hover:scale-105'
                  }`}
                >
                  <TarotCard
                    card={c.card}
                    isReversed={c.isReversed}
                    isRevealed={true}
                    size="sm"
                    deckTheme={selectedDeck}
                  />
                </motion.div>
              ))}
            </div>

            {/* Selected card interpretation */}
            {selectedPosition !== null && (
              <motion.div
                key={selectedPosition}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <Card variant={isWitchTheme ? 'mystic-witch' : 'mystic-fairy'} className="mb-4">
                  {/* Заголовок позиции */}
                  <div className={`flex items-center gap-3 mb-4 pb-3 border-b ${isWitchTheme ? 'border-white/10' : 'border-[#C4A0A5]/20'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isWitchTheme ? 'bg-gold-500/20' : 'bg-[#C4A0A5]/20'}`}>
                      <span className={`font-bold text-sm ${isWitchTheme ? 'text-gold-400' : 'text-[#C4A0A5]'}`}>{selectedPosition + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {spreadConfig.positions[selectedPosition].name}
                      </p>
                      <p className="text-white/50 text-xs">
                        {spreadConfig.positions[selectedPosition].description}
                      </p>
                    </div>
                  </div>

                  {/* Название карты */}
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-white font-display font-semibold text-lg">
                      {cards[selectedPosition].card.nameRu}
                    </h3>
                    {cards[selectedPosition].isReversed && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                        перевёрнутая
                      </span>
                    )}
                  </div>

                  {/* Ключевые слова */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {interpretation.positions[selectedPosition].keywords.map((keyword, ki) => (
                      <span
                        key={ki}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          isWitchTheme
                            ? 'bg-white/10 text-white/80 border border-white/20'
                            : 'bg-[#1a1a2e]/60 text-white/90 border border-[#C4A0A5]/40 backdrop-blur-sm'
                        }`}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>

                  {/* Детальная интерпретация */}
                  <p className="text-white/85 leading-relaxed mb-4">
                    {interpretation.positions[selectedPosition].detailed}
                  </p>

                  {/* Совет карты */}
                  <div className={`rounded-xl p-3 ${isWitchTheme ? 'bg-white/5' : 'bg-[#C4A0A5]/10'}`}>
                    <p className={`text-xs mb-1 ${isWitchTheme ? 'text-white/60' : 'text-[#C4A0A5]/70'}`}>Совет карты:</p>
                    <p className="text-white/90 text-sm italic">
                      "{interpretation.positions[selectedPosition].advice}"
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}

            {selectedPosition === null && (
              <Card variant={isWitchTheme ? 'glass-witch' : 'glass-fairy'} className="mb-4">
                <p className={`text-center ${isWitchTheme ? 'text-white/60' : 'text-[#C4A0A5]/80'}`}>
                  Нажми на карту выше, чтобы увидеть подробное толкование {getThemeEmoji(selectedDeck, 'main')}
                </p>
              </Card>
            )}

            {/* General interpretation - Общий итог */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card variant={isWitchTheme ? 'glass-witch' : 'glass-fairy'} className="mb-4">
                <h3 className={`font-display font-semibold mb-3 flex items-center gap-2 ${isWitchTheme ? 'text-white' : 'text-[#4A2A2A]'}`}>
                  <span className="text-xl">{getThemeEmoji(selectedDeck, 'future')}</span>
                  Общий итог расклада
                </h3>
                <p className={`leading-relaxed mb-4 ${isWitchTheme ? 'text-white/85' : 'text-[#4A2A2A]/90'}`}>
                  {interpretation.generalSummary}
                </p>

                {/* Совет */}
                <div className={`bg-gradient-to-r rounded-xl p-4 mb-4 border-l-2 ${
                  isWitchTheme
                    ? 'from-gold-500/10 to-transparent border-gold-500/50'
                    : 'from-[#8B5A5A]/20 to-transparent border-[#8B5A5A]/60'
                }`}>
                  <p className={`text-xs mb-1 uppercase tracking-wide ${isWitchTheme ? 'text-white/60' : 'text-[#6B3A3A]'}`}>Главный совет</p>
                  <p className={`leading-relaxed ${isWitchTheme ? 'text-white/90' : 'text-[#4A2A2A]'}`}>
                    {interpretation.advice}
                  </p>
                </div>

                {/* Позитивное послание */}
                <p className={`text-sm text-center italic ${isWitchTheme ? 'text-white/70' : 'text-[#6B3A3A]/90'}`}>
                  {interpretation.positive}
                </p>

                {/* Таймлайн */}
                {interpretation.timing && (
                  <div className={`mt-4 pt-3 border-t ${isWitchTheme ? 'border-white/10' : 'border-[#8B5A5A]/30'}`}>
                    <p className={`text-xs text-center ${isWitchTheme ? 'text-white/50' : 'text-[#6B3A3A]/80'}`}>
                      ⏱ {interpretation.timing}
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Clarification card section - новый дизайн под тему */}
            {!clarifyingCard && !isDrawingClarifyingCard && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
                className="mb-4"
              >
                <div className={`relative overflow-hidden rounded-2xl ${
                  isWitchTheme
                    ? 'bg-[#2a2a2a]/15 border border-white/20 backdrop-blur-sm'
                    : 'bg-[#C4A0A5]/30 border border-[#C4A0A5]/50 backdrop-blur-sm'
                }`}>
                  {/* Анимированный фон с частицами */}
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={`absolute w-2 h-2 rounded-full ${
                          isWitchTheme ? 'bg-white/30' : 'bg-white/40'
                        }`}
                        style={{
                          left: `${10 + i * 12}%`,
                          top: `${20 + (i % 3) * 25}%`,
                        }}
                        animate={{
                          y: [-10, 10, -10],
                          opacity: [0.3, 0.6, 0.3],
                          scale: [0.8, 1.2, 0.8],
                        }}
                        transition={{
                          duration: 3 + i * 0.3,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>

                  {/* Свечение */}
                  <motion.div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-3xl ${
                      isWitchTheme ? 'bg-white/10' : 'bg-white/20'
                    }`}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />

                  <div className="relative p-6 text-center">
                    {/* Иконка */}
                    <motion.div
                      className="relative w-20 h-20 mx-auto mb-4"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      {/* Кольца вокруг иконки */}
                      <motion.div
                        className={`absolute inset-0 rounded-full border-2 ${
                          isWitchTheme ? 'border-white/30' : 'border-white/50'
                        }`}
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div
                        className={`absolute inset-0 rounded-full border ${
                          isWitchTheme ? 'border-white/20' : 'border-white/30'
                        }`}
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                      />
                      <div className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden ${
                        isWitchTheme
                          ? 'bg-gradient-to-br from-white/20 to-white/5 border border-white/30'
                          : 'bg-gradient-to-br from-white/30 to-white/10 border border-white/40'
                      }`}>
                        <img
                          src={isWitchTheme ? '/icons/clarifying-witch.png' : '/icons/clarifying-fairy.png'}
                          alt="Пояснительная карта"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </motion.div>

                    <h4 className={`font-display font-bold text-xl mb-2 ${
                      isWitchTheme ? 'text-white' : 'text-white'
                    }`}>
                      Пояснительная карта
                    </h4>
                    <p className={`text-sm mb-5 ${
                      isWitchTheme ? 'text-white/60' : 'text-white/70'
                    }`}>
                      Вытяни дополнительную карту для глубокого понимания расклада
                    </p>

                    <motion.button
                      onClick={handleDrawClarifyingCard}
                      className={`w-full py-4 rounded-2xl font-medium transition-all relative overflow-hidden ${
                        isWitchTheme
                          ? 'bg-[#6a6a6a] text-white'
                          : 'bg-[#C4A0A5] text-white'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="relative flex items-center justify-center gap-2">
                        Вытянуть карту
                        <motion.span
                          animate={{ rotate: [0, 15, -15, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {isWitchTheme ? '🌙' : '✨'}
                        </motion.span>
                      </span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Drawing animation - эпичная анимация вытягивания 2.3 сек */}
            {isDrawingClarifyingCard && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="mb-4"
              >
                <div className={`relative overflow-hidden rounded-3xl py-20 ${
                  isWitchTheme
                    ? 'bg-gradient-to-b from-[#1a1a1a]/40 to-[#2a2a2a]/30 border border-white/25 backdrop-blur-md'
                    : 'bg-gradient-to-b from-[#C4A0A5]/20 to-[#B090A0]/15 border border-[#C4A0A5]/50 backdrop-blur-md'
                }`}>
                  {/* Внешнее свечение контейнера */}
                  <motion.div
                    className={`absolute -inset-1 rounded-3xl blur-xl ${
                      isWitchTheme ? 'bg-white/10' : 'bg-[#C4A0A5]/20'
                    }`}
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  {/* Магические руны/символы по углам - увеличенные */}
                  {['✧', '⋆', '✦', '★', '◇', '❖'].map((symbol, i) => (
                    <motion.span
                      key={i}
                      className={`absolute text-3xl ${
                        isWitchTheme ? 'text-white/50' : 'text-[#C4A0A5]/60'
                      }`}
                      style={{
                        top: i < 2 ? '8%' : i < 4 ? '45%' : '82%',
                        left: i % 2 === 0 ? '6%' : '88%',
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        rotate: [0, 360],
                        scale: [0.5, 1.4, 0.8, 1.2, 0.5],
                        opacity: [0, 0.7, 0.3, 0.7, 0],
                      }}
                      transition={{
                        rotate: { duration: 8 + i * 1.5, repeat: Infinity, ease: 'linear' },
                        scale: { duration: 2.3, repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' },
                        opacity: { duration: 2.3, repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' },
                      }}
                    >
                      {symbol}
                    </motion.span>
                  ))}

                  {/* Магические круги - 5 колец */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {[0, 1, 2, 3, 4].map((ring) => (
                      <motion.div
                        key={ring}
                        className={`absolute rounded-full ${
                          ring % 2 === 0 ? 'border-2' : 'border border-dashed'
                        } ${
                          isWitchTheme ? 'border-white/35' : 'border-[#C4A0A5]/50'
                        }`}
                        style={{
                          width: 60 + ring * 45,
                          height: 60 + ring * 45,
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          rotate: ring % 2 === 0 ? 360 : -360,
                          scale: [0.8, 1.1, 0.9, 1.05, 0.8],
                          opacity: [0.2, 0.6, 0.3, 0.5, 0.2],
                        }}
                        transition={{
                          rotate: { duration: 7 + ring * 1.8, repeat: Infinity, ease: 'linear' },
                          scale: { duration: 2.3, repeat: Infinity, delay: ring * 0.15, ease: 'easeInOut' },
                          opacity: { duration: 2.3, repeat: Infinity, delay: ring * 0.15, ease: 'easeInOut' },
                        }}
                      />
                    ))}
                  </div>

                  {/* Летящие частицы к центру - 24 частицы с волновым эффектом */}
                  {[...Array(24)].map((_, i) => {
                    const angle = (i / 24) * 360
                    const rad = (angle * Math.PI) / 180
                    return (
                      <motion.div
                        key={i}
                        className={`absolute rounded-full ${
                          isWitchTheme
                            ? i % 3 === 0 ? 'bg-white' : i % 3 === 1 ? 'bg-white/80' : 'bg-white/60'
                            : i % 3 === 0 ? 'bg-[#C4A0A5]' : i % 3 === 1 ? 'bg-[#B090A0]' : 'bg-[#d4b0b5]'
                        }`}
                        style={{
                          width: 3 + (i % 4),
                          height: 3 + (i % 4),
                          left: '50%',
                          top: '50%',
                        }}
                        animate={{
                          x: [Math.cos(rad) * 200, Math.cos(rad) * 100, 0],
                          y: [Math.sin(rad) * 200, Math.sin(rad) * 100, 0],
                          opacity: [0, 0.9, 1, 0],
                          scale: [0.2, 0.8, 1.5, 0],
                        }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          delay: i * 0.08,
                          ease: [0.25, 0.1, 0.25, 1],
                        }}
                      />
                    )
                  })}

                  {/* Мерцающие звёздочки вокруг - 16 штук */}
                  {[...Array(16)].map((_, i) => {
                    const angle = (i / 16) * 360
                    const rad = (angle * Math.PI) / 180
                    const radius = 90 + (i % 4) * 25
                    return (
                      <motion.div
                        key={`star-${i}`}
                        className={`absolute ${
                          isWitchTheme ? 'text-white' : 'text-[#C4A0A5]'
                        }`}
                        style={{
                          fontSize: 10 + (i % 3) * 4,
                          left: `calc(50% + ${Math.cos(rad) * radius}px)`,
                          top: `calc(50% + ${Math.sin(rad) * radius}px)`,
                        }}
                        animate={{
                          opacity: [0, 1, 0.5, 1, 0],
                          scale: [0.3, 1.2, 0.8, 1.4, 0.3],
                          rotate: [0, 90, 180, 270, 360],
                        }}
                        transition={{
                          duration: 2.3,
                          repeat: Infinity,
                          delay: i * 0.12,
                          ease: 'easeInOut',
                        }}
                      >
                        {i % 2 === 0 ? '✦' : '✧'}
                      </motion.div>
                    )
                  })}

                  {/* Спиральные лучи - 12 лучей */}
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={`ray-${i}`}
                      className={`absolute left-1/2 top-1/2 origin-bottom ${
                        isWitchTheme
                          ? 'bg-gradient-to-t from-white/50 via-white/20 to-transparent'
                          : 'bg-gradient-to-t from-[#C4A0A5]/60 via-[#C4A0A5]/25 to-transparent'
                      }`}
                      style={{
                        width: 2 + (i % 2),
                        height: '140px',
                        transform: `rotate(${i * 30}deg) translateX(-50%)`,
                        transformOrigin: 'bottom center',
                      }}
                      animate={{
                        opacity: [0.05, 0.6, 0.2, 0.5, 0.05],
                        scaleY: [0.3, 1, 0.6, 0.9, 0.3],
                      }}
                      transition={{
                        duration: 2.3,
                        repeat: Infinity,
                        delay: i * 0.12,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}

                  {/* Волны энергии от центра */}
                  {[0, 1, 2].map((wave) => (
                    <motion.div
                      key={`wave-${wave}`}
                      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${
                        isWitchTheme ? 'border-white/40' : 'border-[#C4A0A5]/50'
                      }`}
                      initial={{ width: 20, height: 20, opacity: 0.8 }}
                      animate={{
                        width: [20, 250],
                        height: [20, 250],
                        opacity: [0.8, 0],
                      }}
                      transition={{
                        duration: 2.3,
                        repeat: Infinity,
                        delay: wave * 0.7,
                        ease: 'easeOut',
                      }}
                    />
                  ))}

                  {/* Центральное свечение - 4 слоя */}
                  <motion.div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full blur-3xl ${
                      isWitchTheme ? 'bg-white/25' : 'bg-[#C4A0A5]/35'
                    }`}
                    animate={{
                      scale: [1, 1.4, 1.1, 1.3, 1],
                      opacity: [0.15, 0.4, 0.25, 0.35, 0.15],
                    }}
                    transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full blur-2xl ${
                      isWitchTheme ? 'bg-white/40' : 'bg-[#C4A0A5]/50'
                    }`}
                    animate={{
                      scale: [1, 1.6, 1.2, 1.5, 1],
                      opacity: [0.3, 0.6, 0.4, 0.55, 0.3],
                    }}
                    transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                  />
                  <motion.div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full blur-xl ${
                      isWitchTheme ? 'bg-white/60' : 'bg-[#C4A0A5]/70'
                    }`}
                    animate={{
                      scale: [1, 2, 1.3, 1.8, 1],
                      opacity: [0.4, 0.9, 0.5, 0.8, 0.4],
                    }}
                    transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                  />
                  <motion.div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full blur-lg ${
                      isWitchTheme ? 'bg-white/80' : 'bg-white/60'
                    }`}
                    animate={{
                      scale: [0.8, 1.8, 1, 1.5, 0.8],
                      opacity: [0.5, 1, 0.6, 0.9, 0.5],
                    }}
                    transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                  />

                  {/* Карта появляется в центре - улучшенная анимация */}
                  <div className="relative flex flex-col items-center justify-center">
                    <motion.div
                      initial={{ rotateY: 0, scale: 0.3, opacity: 0 }}
                      animate={{
                        rotateY: [0, 180, 360, 540, 720],
                        scale: [0.3, 0.9, 1.15, 0.95, 1.1, 0.3],
                        opacity: [0, 1, 1, 1, 1, 0],
                      }}
                      transition={{
                        duration: 2.3,
                        repeat: Infinity,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                      className={`w-20 h-28 rounded-xl relative ${
                        isWitchTheme
                          ? 'bg-gradient-to-br from-[#4a4a4a] via-[#3a3a3a] to-[#2a2a2a] border-2 border-white/60'
                          : 'bg-gradient-to-br from-[#e8d5d8] via-[#d4b0b5] to-[#C4A0A5] border-2 border-[#C4A0A5]/70'
                      }`}
                      style={{
                        boxShadow: isWitchTheme
                          ? '0 0 50px rgba(255,255,255,0.7), 0 0 100px rgba(255,255,255,0.4), 0 0 150px rgba(255,255,255,0.2)'
                          : '0 0 50px rgba(196,160,165,0.7), 0 0 100px rgba(196,160,165,0.4), 0 0 150px rgba(196,160,165,0.2)',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      {/* Символ на карте - пульсирующий */}
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{
                          opacity: [0.2, 1, 0.5, 0.9, 0.2],
                          scale: [0.8, 1.2, 1, 1.1, 0.8],
                        }}
                        transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <span className={`text-3xl ${
                          isWitchTheme ? 'text-white/70' : 'text-white/80'
                        }`}>
                          {isWitchTheme ? '☽' : '♡'}
                        </span>
                      </motion.div>

                      {/* Блик на карте */}
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/40 via-transparent to-transparent"
                        animate={{
                          opacity: [0.3, 0.7, 0.3],
                        }}
                        transition={{ duration: 1.15, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </motion.div>

                    {/* Текст с плавной анимацией */}
                    <motion.p
                      className={`mt-8 font-semibold text-xl ${
                        isWitchTheme ? 'text-white' : 'text-white'
                      }`}
                      animate={{
                        opacity: [0.4, 1, 0.6, 1, 0.4],
                        y: [3, 0, 2, 0, 3],
                      }}
                      transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut' }}
                      style={{
                        textShadow: isWitchTheme
                          ? '0 0 20px rgba(255,255,255,0.5)'
                          : '0 0 20px rgba(196,160,165,0.5)',
                      }}
                    >
                      Вытягиваем карту...
                    </motion.p>

                    {/* Дополнительный текст с волновым эффектом */}
                    <motion.p
                      className={`text-sm mt-2 font-medium ${
                        isWitchTheme ? 'text-white/60' : 'text-white/70'
                      }`}
                      animate={{
                        opacity: [0.2, 0.8, 0.4, 0.7, 0.2],
                        y: [0, -4, -1, -3, 0],
                        letterSpacing: ['0px', '2px', '1px', '2px', '0px'],
                      }}
                      transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {isWitchTheme ? '✧ магия раскрывается ✧' : '✧ судьба открывается ✧'}
                    </motion.p>

                    {/* Дополнительные декоративные точки под текстом */}
                    <motion.div className="flex gap-2 mt-3">
                      {[0, 1, 2].map((dot) => (
                        <motion.div
                          key={dot}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isWitchTheme ? 'bg-white/50' : 'bg-[#C4A0A5]/60'
                          }`}
                          animate={{
                            scale: [0.5, 1.5, 0.5],
                            opacity: [0.3, 1, 0.3],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: dot * 0.25,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Clarifying card result - тематический дизайн */}
            {showClarifyingCard && clarifyingCard && clarifyingInterpretation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="mb-4"
              >
                <div className={`relative overflow-hidden rounded-2xl ${
                  isWitchTheme
                    ? 'bg-[#2a2a2a]/15 border border-white/20 backdrop-blur-sm'
                    : 'bg-[#C4A0A5]/30 border border-[#C4A0A5]/50 backdrop-blur-sm'
                }`}>
                  {/* Декоративные элементы на фоне */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={`absolute w-1.5 h-1.5 rounded-full ${
                          isWitchTheme ? 'bg-white/20' : 'bg-white/30'
                        }`}
                        style={{
                          left: `${15 + i * 15}%`,
                          top: `${10 + (i % 2) * 80}%`,
                        }}
                        animate={{
                          opacity: [0.2, 0.5, 0.2],
                          scale: [0.8, 1.2, 0.8],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                      />
                    ))}
                  </div>

                  {/* Header */}
                  <div className={`relative p-4 border-b ${
                    isWitchTheme ? 'border-white/10' : 'border-white/20'
                  }`}>
                    <div className="flex items-center gap-3">
                      <motion.div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isWitchTheme
                            ? 'bg-gradient-to-br from-white/20 to-white/5 border border-white/30'
                            : 'bg-gradient-to-br from-white/30 to-white/10 border border-white/40'
                        }`}
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        <span className="text-xl">{isWitchTheme ? '🌙' : '✨'}</span>
                      </motion.div>
                      <div>
                        <h3 className={`font-display font-bold ${
                          isWitchTheme ? 'text-white' : 'text-white'
                        }`}>
                          Пояснительная карта
                        </h3>
                        <p className={`text-xs ${
                          isWitchTheme ? 'text-white/50' : 'text-white/60'
                        }`}>Дополнительная ясность</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Card display с эффектами */}
                    <div className="flex justify-center mb-5 relative">
                      {/* Свечение за картой */}
                      <motion.div
                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-56 rounded-2xl blur-2xl ${
                          isWitchTheme ? 'bg-white/20' : 'bg-white/25'
                        }`}
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <motion.div
                        initial={{ rotateY: 180, opacity: 0, scale: 0.8 }}
                        animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, type: 'spring', damping: 15 }}
                        style={{ perspective: 1000 }}
                      >
                        <TarotCard
                          card={clarifyingCard.card}
                          isReversed={clarifyingCard.isReversed}
                          isRevealed={true}
                          size="md"
                          deckTheme={selectedDeck}
                        />
                      </motion.div>
                    </div>

                    {/* Card name */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
                      className="text-center mb-4"
                    >
                      <h4 className={`font-display font-bold text-xl mb-1 ${
                        isWitchTheme ? 'text-white' : 'text-white'
                      }`}>
                        {clarifyingCard.card.nameRu}
                      </h4>
                      {clarifyingCard.isReversed && (
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          isWitchTheme
                            ? 'bg-white/10 text-white/70 border border-white/20'
                            : 'bg-white/20 text-white border border-white/30'
                        }`}>
                          перевёрнутая
                        </span>
                      )}
                    </motion.div>

                    {/* Keywords */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex flex-wrap gap-1.5 justify-center mb-5"
                    >
                      {clarifyingInterpretation.keywords.map((keyword, ki) => (
                        <motion.span
                          key={ki}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.25 + ki * 0.04 }}
                          className={`text-xs px-3 py-1.5 rounded-full ${
                            isWitchTheme
                              ? 'bg-white/10 text-white/80 border border-white/20'
                              : 'bg-white/20 text-white border border-white/30'
                          }`}
                        >
                          {keyword}
                        </motion.span>
                      ))}
                    </motion.div>

                    {/* Intro */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
                      className={`rounded-xl p-4 mb-4 ${
                        isWitchTheme
                          ? 'bg-white/5 border border-white/10'
                          : 'bg-white/15 border border-white/20'
                      }`}
                    >
                      <p className={`text-sm italic text-center leading-relaxed ${
                        isWitchTheme ? 'text-white/90' : 'text-white'
                      }`}>
                        {clarifyingInterpretation.intro}
                      </p>
                    </motion.div>

                    {/* Main message */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.35 }}
                      className="mb-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isWitchTheme ? 'bg-white/50' : 'bg-white/80'
                        }`} />
                        <h5 className={`text-xs uppercase tracking-wider font-medium ${
                          isWitchTheme ? 'text-white/60' : 'text-white/70'
                        }`}>
                          Главное послание
                        </h5>
                      </div>
                      <p className={`leading-relaxed ${
                        isWitchTheme ? 'text-white/85' : 'text-white/90'
                      }`}>
                        {clarifyingInterpretation.mainMessage}
                      </p>
                    </motion.div>

                    {/* Deep analysis */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.4 }}
                      className="mb-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isWitchTheme ? 'bg-white/50' : 'bg-white/80'
                        }`} />
                        <h5 className={`text-xs uppercase tracking-wider font-medium ${
                          isWitchTheme ? 'text-white/60' : 'text-white/70'
                        }`}>
                          Глубинный анализ
                        </h5>
                      </div>
                      <p className={`leading-relaxed whitespace-pre-line ${
                        isWitchTheme ? 'text-white/85' : 'text-white/90'
                      }`}>
                        {clarifyingInterpretation.deepAnalysis}
                      </p>
                    </motion.div>

                    {/* Connection to spread */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.45 }}
                      className={`rounded-xl p-4 mb-4 border-l-4 ${
                        isWitchTheme
                          ? 'bg-white/5 border-l-white/40'
                          : 'bg-white/15 border-l-white/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className={`text-xs uppercase tracking-wider font-medium ${
                          isWitchTheme ? 'text-white/60' : 'text-white/70'
                        }`}>
                          Связь с раскладом
                        </h5>
                      </div>
                      <p className={`leading-relaxed ${
                        isWitchTheme ? 'text-white/90' : 'text-white'
                      }`}>
                        {clarifyingInterpretation.connectionToSpread}
                      </p>
                    </motion.div>

                    {/* Additional advice */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.5 }}
                      className={`rounded-xl p-4 border-l-4 ${
                        isWitchTheme
                          ? 'bg-gradient-to-r from-white/10 to-white/5 border-l-white/60'
                          : 'bg-gradient-to-r from-white/20 to-white/10 border-l-white/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span>{isWitchTheme ? '🌙' : '💫'}</span>
                        <h5 className={`text-xs uppercase tracking-wider font-medium ${
                          isWitchTheme ? 'text-white/60' : 'text-white/70'
                        }`}>
                          Совет карты
                        </h5>
                      </div>
                      <p className={`leading-relaxed italic ${
                        isWitchTheme ? 'text-white/90' : 'text-white'
                      }`}>
                        {clarifyingInterpretation.additionalAdvice}
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Feedback */}
            {!feedbackGiven ? (
              <div className="flex gap-3 mb-4">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => handleFeedback('negative')}
                >
                  Не попало {isWitchTheme ? '🖤' : '💔'}
                </Button>
                <button
                  onClick={() => handleFeedback('positive')}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all active:scale-95 ${
                    isFairyTheme
                      ? 'bg-[#C4A0A5] text-white hover:bg-[#b8949a]'
                      : 'bg-[#6a6a6a] text-white hover:bg-[#7a7a7a]'
                  }`}
                >
                  В точку! {getThemeEmoji(selectedDeck, 'love')}
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 mb-4"
              >
                <span className="text-2xl">💫</span>
                <p className={`mt-2 ${isWitchTheme ? 'text-white/70' : 'text-[#6B3A3A]/80'}`}>
                  Спасибо за отзыв!
                </p>
              </motion.div>
            )}

            {/* На главную */}
            <Button
              onClick={() => navigate('/')}
              variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'}
              className="w-full"
            >
              На главную 🏠
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
