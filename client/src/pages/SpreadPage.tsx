import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '../store/useUserStore'
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

  const themeConfig = getThemeConfig(selectedDeck)

  useEffect(() => {
    showBackButton(() => navigate(-1))
    return () => hideBackButton()
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
    }, 1500)
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-screen flex flex-col items-center justify-center p-6"
          >
            <div className="text-center mb-8">
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

            <Card variant="glass" className="w-full max-w-sm mb-8">
              <h3 className="text-white/80 font-medium mb-3">Позиции карт:</h3>
              <div className="space-y-2">
                {spreadConfig.positions.map((pos, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-gold-400 font-medium">{i + 1}.</span>
                    <div>
                      <p className="text-white text-sm font-medium">{pos.name}</p>
                      <p className="text-white/50 text-xs">{pos.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Button onClick={handleStart} size="lg" variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'}>
              Начать расклад {getThemeEmoji(selectedDeck, 'button')}
            </Button>
          </motion.div>
        )}

        {/* Deck Select */}
        {step === 'deck_select' && (
          <motion.div
            key="deck_select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
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
            transition={{ duration: 0.15 }}
            className="min-h-screen flex flex-col items-center justify-center p-6"
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
                      ? 'radial-gradient(ellipse at center, rgba(252, 137, 172, 0.3) 0%, transparent 70%)'
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
                          ? 'rgba(252, 137, 172, 0.4)'
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
                          ? 'bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-lg shadow-pink-500/50'
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
            transition={{ duration: 0.15 }}
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
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    {/* Название позиции с подложкой для читаемости */}
                    <div className={`px-3 py-1.5 rounded-full mb-2 backdrop-blur-sm ${
                      isWitchTheme
                        ? 'bg-black/50 border border-white/20'
                        : 'bg-[#FC89AC]/30 border border-[#FC89AC]/40'
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
                            background: 'radial-gradient(ellipse at center, rgba(252, 137, 172, 0.4) 0%, transparent 70%)',
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
            transition={{ duration: 0.15 }}
            className="p-4 pb-24"
          >
            {/* Приветствие */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card variant="mystic" className="border-gold-500/30">
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
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card variant="mystic" className="mb-4">
                  {/* Заголовок позиции */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                    <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center">
                      <span className="text-gold-400 font-bold text-sm">{selectedPosition + 1}</span>
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
                  <div className="flex flex-wrap gap-1 mb-4">
                    {interpretation.positions[selectedPosition].keywords.map((keyword, ki) => (
                      <span
                        key={ki}
                        className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60"
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
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-white/60 text-xs mb-1">Совет карты:</p>
                    <p className="text-white/90 text-sm italic">
                      "{interpretation.positions[selectedPosition].advice}"
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}

            {selectedPosition === null && (
              <Card variant="glass" className="mb-4">
                <p className="text-center text-white/60">
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
              <Card variant="glass" className="mb-4">
                <h3 className="font-display font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="text-xl">{getThemeEmoji(selectedDeck, 'future')}</span>
                  Общий итог расклада
                </h3>
                <p className="text-white/85 leading-relaxed mb-4">
                  {interpretation.generalSummary}
                </p>

                {/* Совет */}
                <div className="bg-gradient-to-r from-gold-500/10 to-transparent rounded-xl p-4 mb-4 border-l-2 border-gold-500/50">
                  <p className="text-white/60 text-xs mb-1 uppercase tracking-wide">Главный совет</p>
                  <p className="text-white/90 leading-relaxed">
                    {interpretation.advice}
                  </p>
                </div>

                {/* Позитивное послание */}
                <p className="text-white/70 text-sm text-center italic">
                  {interpretation.positive}
                </p>

                {/* Таймлайн */}
                {interpretation.timing && (
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <p className="text-white/50 text-xs text-center">
                      ⏱ {interpretation.timing}
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Clarification card section - новый дизайн под тему */}
            {!clarifyingCard && !isDrawingClarifyingCard && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: 'spring', damping: 20 }}
                className="mb-4"
              >
                <div className={`relative overflow-hidden rounded-2xl ${
                  isWitchTheme
                    ? 'bg-gradient-to-br from-[#2a2a2a] via-[#3a3a3a] to-[#2a2a2a] border border-white/20'
                    : 'bg-gradient-to-br from-[#FC89AC] via-[#E879A0] to-[#D46A90] border border-[#FC89AC]/60'
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
                      <div className={`w-full h-full rounded-full flex items-center justify-center ${
                        isWitchTheme
                          ? 'bg-gradient-to-br from-white/20 to-white/5 border border-white/30'
                          : 'bg-gradient-to-br from-white/30 to-white/10 border border-white/40'
                      }`}>
                        <img
                          src="/icons/crystal-ball.png"
                          alt="Пояснительная карта"
                          className="w-12 h-12 object-contain"
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
                      className={`w-full py-4 rounded-xl font-medium transition-all relative overflow-hidden ${
                        isWitchTheme
                          ? 'bg-gradient-to-r from-white/20 to-white/10 text-white border border-white/30 hover:from-white/30 hover:to-white/20'
                          : 'bg-gradient-to-r from-[#FC89AC] to-[#F472B6] text-white shadow-lg shadow-[#FC89AC]/30 hover:shadow-xl hover:shadow-[#FC89AC]/40'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Shimmer эффект */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      />
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

            {/* Drawing animation - эпичная анимация вытягивания */}
            {isDrawingClarifyingCard && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4"
              >
                <div className={`relative overflow-hidden rounded-2xl py-16 ${
                  isWitchTheme
                    ? 'bg-gradient-to-br from-[#2a2a2a] via-[#3a3a3a] to-[#2a2a2a] border border-white/20'
                    : 'bg-gradient-to-br from-[#FC89AC] via-[#E879A0] to-[#D46A90] border border-[#FC89AC]/60'
                }`}>
                  {/* Магические руны/символы по углам */}
                  {['✧', '⋆', '✦', '★'].map((symbol, i) => (
                    <motion.span
                      key={i}
                      className={`absolute text-2xl ${
                        isWitchTheme ? 'text-white/40' : 'text-[#FC89AC]/50'
                      }`}
                      style={{
                        top: i < 2 ? '12%' : '78%',
                        left: i % 2 === 0 ? '8%' : '84%',
                      }}
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.6, 0.2],
                      }}
                      transition={{
                        rotate: { duration: 6 + i, repeat: Infinity, ease: 'linear' },
                        scale: { duration: 2, repeat: Infinity, delay: i * 0.3 },
                        opacity: { duration: 2, repeat: Infinity, delay: i * 0.3 },
                      }}
                    >
                      {symbol}
                    </motion.span>
                  ))}

                  {/* Магические круги */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {[0, 1, 2, 3].map((ring) => (
                      <motion.div
                        key={ring}
                        className={`absolute rounded-full ${
                          ring % 2 === 0 ? 'border-2' : 'border border-dashed'
                        } ${
                          isWitchTheme ? 'border-white/30' : 'border-[#FC89AC]/40'
                        }`}
                        style={{
                          width: 80 + ring * 50,
                          height: 80 + ring * 50,
                        }}
                        animate={{
                          rotate: ring % 2 === 0 ? 360 : -360,
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          rotate: { duration: 6 + ring * 2, repeat: Infinity, ease: 'linear' },
                          scale: { duration: 1.5, repeat: Infinity, delay: ring * 0.2 },
                        }}
                      />
                    ))}
                  </div>

                  {/* Летящие частицы к центру - основные */}
                  {[...Array(20)].map((_, i) => {
                    const angle = (i / 20) * 360
                    const rad = (angle * Math.PI) / 180
                    return (
                      <motion.div
                        key={i}
                        className={`absolute w-2.5 h-2.5 rounded-full ${
                          isWitchTheme ? 'bg-white' : 'bg-[#FC89AC]'
                        }`}
                        style={{
                          left: '50%',
                          top: '50%',
                        }}
                        animate={{
                          x: [Math.cos(rad) * 180, 0],
                          y: [Math.sin(rad) * 180, 0],
                          opacity: [0, 1, 0],
                          scale: [0.3, 1.2, 0],
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: i * 0.06,
                          ease: 'easeIn',
                        }}
                      />
                    )
                  })}

                  {/* Мерцающие звёздочки вокруг */}
                  {[...Array(12)].map((_, i) => {
                    const angle = (i / 12) * 360
                    const rad = (angle * Math.PI) / 180
                    const radius = 100 + (i % 3) * 30
                    return (
                      <motion.div
                        key={`star-${i}`}
                        className={`absolute text-sm ${
                          isWitchTheme ? 'text-white' : 'text-[#FC89AC]'
                        }`}
                        style={{
                          left: `calc(50% + ${Math.cos(rad) * radius}px)`,
                          top: `calc(50% + ${Math.sin(rad) * radius}px)`,
                        }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0.5, 1.5, 0.5],
                          rotate: [0, 180, 360],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.12,
                        }}
                      >
                        ✦
                      </motion.div>
                    )
                  })}

                  {/* Спиральные лучи */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={`ray-${i}`}
                      className={`absolute left-1/2 top-1/2 w-1 origin-bottom ${
                        isWitchTheme ? 'bg-gradient-to-t from-white/40 to-transparent' : 'bg-gradient-to-t from-[#FC89AC]/50 to-transparent'
                      }`}
                      style={{
                        height: '120px',
                        transform: `rotate(${i * 45}deg) translateX(-50%)`,
                        transformOrigin: 'bottom center',
                      }}
                      animate={{
                        opacity: [0.1, 0.5, 0.1],
                        scaleY: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}

                  {/* Центральное свечение - многослойное */}
                  <motion.div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-3xl ${
                      isWitchTheme ? 'bg-white/30' : 'bg-[#FC89AC]/40'
                    }`}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full blur-xl ${
                      isWitchTheme ? 'bg-white/60' : 'bg-[#FC89AC]/70'
                    }`}
                    animate={{
                      scale: [1, 2, 1],
                      opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />

                  {/* Карта появляется в центре */}
                  <div className="relative flex flex-col items-center justify-center">
                    <motion.div
                      animate={{
                        rotateY: [0, 180, 360],
                        scale: [0.8, 1.1, 0.8],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className={`w-16 h-24 rounded-lg relative ${
                        isWitchTheme
                          ? 'bg-gradient-to-br from-[#3a3a3a] to-[#2a2a2a] border-2 border-white/50'
                          : 'bg-gradient-to-br from-[#fce7f3] to-[#fbcfe8] border-2 border-[#FC89AC]/60'
                      }`}
                      style={{
                        boxShadow: isWitchTheme
                          ? '0 0 40px rgba(255,255,255,0.6), 0 0 80px rgba(255,255,255,0.3)'
                          : '0 0 40px rgba(252,137,172,0.6), 0 0 80px rgba(252,137,172,0.3)',
                      }}
                    >
                      {/* Символ на карте */}
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <span className={`text-2xl ${
                          isWitchTheme ? 'text-white/60' : 'text-white/70'
                        }`}>
                          {isWitchTheme ? '☽' : '♡'}
                        </span>
                      </motion.div>
                    </motion.div>
                    <motion.p
                      className={`mt-6 font-medium text-lg ${
                        isWitchTheme ? 'text-white' : 'text-white'
                      }`}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Вытягиваем карту...
                    </motion.p>
                    {/* Дополнительный текст с эффектом */}
                    <motion.p
                      className={`text-sm mt-1 ${
                        isWitchTheme ? 'text-white/50' : 'text-white/60'
                      }`}
                      animate={{
                        opacity: [0.3, 0.7, 0.3],
                        y: [0, -3, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {isWitchTheme ? '✧ магия раскрывается ✧' : '✧ судьба открывается ✧'}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Clarifying card result - тематический дизайн */}
            {showClarifyingCard && clarifyingCard && clarifyingInterpretation && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 20 }}
                className="mb-4"
              >
                <div className={`relative overflow-hidden rounded-2xl ${
                  isWitchTheme
                    ? 'bg-gradient-to-br from-[#2a2a2a] via-[#3a3a3a] to-[#2a2a2a] border border-white/20'
                    : 'bg-gradient-to-br from-[#FC89AC] via-[#E879A0] to-[#D46A90] border border-[#FC89AC]/60'
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
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
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
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + ki * 0.05 }}
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
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
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
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
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
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
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
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
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
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
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
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1">
                Не попало {isWitchTheme ? '🖤' : '💔'}
              </Button>
              <Button variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'} className="flex-1">
                В точку! {getThemeEmoji(selectedDeck, 'love')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
