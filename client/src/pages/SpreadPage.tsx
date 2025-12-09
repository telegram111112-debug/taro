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
  const [revealedCount, setRevealedCount] = useState(0)
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

    // Если выбрали все карты - переходим к раскрытию
    if (cards.length + 1 >= spreadConfig.positions.length) {
      setTimeout(() => {
        setStep('reveal')
      }, 800)
    }
  }

  const handleRevealCard = (index: number) => {
    if (index !== revealedCount) return
    hapticFeedback('impact', 'medium')
    setRevealedCount((prev) => prev + 1)

    if (revealedCount + 1 === spreadConfig.positions.length) {
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
                className="flex gap-3 mb-6 flex-wrap justify-center relative"
              >
                {/* Общее свечение за картами */}
                <motion.div
                  className="absolute inset-0 -z-10 blur-3xl"
                  style={{
                    background: isFairyTheme
                      ? 'radial-gradient(ellipse at center, rgba(252, 137, 172, 0.3) 0%, transparent 70%)'
                      : 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
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
                    initial={{ scale: 0, rotate: -180, y: 50 }}
                    animate={{ scale: 1, rotate: 0, y: 0 }}
                    transition={{
                      type: 'spring',
                      damping: 12,
                      stiffness: 100,
                      delay: i * 0.1,
                    }}
                    className="text-center relative"
                  >
                    {/* Индивидуальное свечение карты */}
                    <motion.div
                      className="absolute inset-0 -z-10 blur-xl rounded-xl"
                      style={{
                        background: isFairyTheme
                          ? 'rgba(252, 137, 172, 0.4)'
                          : 'rgba(139, 92, 246, 0.4)',
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
                          : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/50'
                        }
                      `}
                    >
                      {i + 1}
                    </motion.div>

                    {/* Название позиции */}
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 + 0.2 }}
                      className={`
                        text-xs mb-1 font-medium
                        ${isFairyTheme ? 'text-pink-200' : 'text-purple-200'}
                      `}
                    >
                      {spreadConfig.positions[i].name}
                    </motion.p>

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
                            : 'bg-gradient-to-br from-violet-500/30 via-purple-400/20 to-indigo-500/30'
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
                        size="xs"
                        deckTheme={selectedDeck}
                      />
                    </motion.div>

                    {/* Магические частицы вокруг новой карты */}
                    {i === cards.length - 1 && (
                      <>
                        {[...Array(6)].map((_, j) => (
                          <motion.div
                            key={j}
                            className="absolute text-xs pointer-events-none"
                            style={{
                              left: '50%',
                              top: '50%',
                            }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                              opacity: [0, 1, 0],
                              scale: [0, 1, 0],
                              x: Math.cos((j / 6) * Math.PI * 2) * 40 - 6,
                              y: Math.sin((j / 6) * Math.PI * 2) * 40 - 6,
                            }}
                            transition={{
                              duration: 1.5,
                              delay: j * 0.1,
                              repeat: 2,
                            }}
                          >
                            {isFairyTheme
                              ? ['✨', '💫', '⭐', '🌟', '⋆', '💖'][j]
                              : ['✧', '☆', '✦', '⋆', '✶', '★'][j]
                            }
                          </motion.div>
                        ))}
                      </>
                    )}
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
            className="p-4 pb-24"
          >
            <p className="text-center text-white/60 text-sm mb-6">
              Нажимай на карты по очереди {getThemeEmoji(selectedDeck, 'main')}
            </p>

            <div className="grid grid-cols-2 gap-4">
              {spreadConfig.positions.map((pos, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <p className="text-white/60 text-xs mb-2 text-center">
                    {pos.name}
                  </p>
                  <div
                    onClick={() => handleRevealCard(i)}
                    className={`${i < revealedCount ? '' : i === revealedCount ? 'animate-pulse cursor-pointer' : 'opacity-50'}`}
                  >
                    <TarotCard
                      card={cards[i]?.card}
                      isReversed={cards[i]?.isReversed}
                      isRevealed={i < revealedCount}
                      size="sm"
                      deckTheme={selectedDeck}
                    />
                  </div>
                </motion.div>
              ))}
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

            {/* Clarification card section */}
            {!clarifyingCard && !isDrawingClarifyingCard && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card variant="mystic" className="mb-4 border-gold-500/20">
                  <div className="text-center">
                    <motion.div
                      className="text-3xl mb-2"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      🔮
                    </motion.div>
                    <h4 className="text-white font-medium mb-2">Пояснительная карта</h4>
                    <p className="text-white/60 text-sm mb-4">
                      Вытяни дополнительную карту, чтобы получить более глубокое понимание расклада
                    </p>
                    <Button onClick={handleDrawClarifyingCard} variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'} className="w-full">
                      Вытянуть карту {getThemeEmoji(selectedDeck, 'button')}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Drawing animation */}
            {isDrawingClarifyingCard && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card variant="mystic" className="mb-4">
                  <div className="text-center py-8">
                    <motion.div
                      className="text-5xl mb-4"
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      🌟
                    </motion.div>
                    <p className="text-white/80">Вытягиваем пояснительную карту...</p>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Clarifying card result */}
            {showClarifyingCard && clarifyingCard && clarifyingInterpretation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <Card variant="mystic" className="border-gold-500/30 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-gold-500/10 to-transparent p-4 -mx-4 -mt-4 mb-4 border-b border-gold-500/20">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="text-2xl"
                      >
                        ✨
                      </motion.div>
                      <div>
                        <h3 className="text-white font-display font-semibold">
                          Пояснительная карта
                        </h3>
                        <p className="text-white/50 text-xs">Дополнительная ясность</p>
                      </div>
                    </div>
                  </div>

                  {/* Card display */}
                  <div className="flex justify-center mb-4">
                    <motion.div
                      initial={{ rotateY: 180, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      transition={{ duration: 0.6, type: 'spring' }}
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
                  <div className="text-center mb-4">
                    <h4 className="text-white font-display font-bold text-lg">
                      {clarifyingCard.card.nameRu}
                    </h4>
                    {clarifyingCard.isReversed && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                        перевёрнутая
                      </span>
                    )}
                  </div>

                  {/* Keywords */}
                  <div className="flex flex-wrap gap-1 justify-center mb-4">
                    {clarifyingInterpretation.keywords.map((keyword, ki) => (
                      <span
                        key={ki}
                        className="text-xs px-2 py-1 rounded-full bg-gold-500/10 text-gold-300 border border-gold-500/20"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>

                  {/* Intro */}
                  <div className="bg-white/5 rounded-xl p-3 mb-4">
                    <p className="text-white/90 text-sm italic text-center">
                      {clarifyingInterpretation.intro}
                    </p>
                  </div>

                  {/* Main message */}
                  <div className="mb-4">
                    <h5 className="text-white/70 text-xs uppercase tracking-wide mb-2">
                      Главное послание
                    </h5>
                    <p className="text-white/85 leading-relaxed">
                      {clarifyingInterpretation.mainMessage}
                    </p>
                  </div>

                  {/* Deep analysis */}
                  <div className="mb-4">
                    <h5 className="text-white/70 text-xs uppercase tracking-wide mb-2">
                      Глубинный анализ
                    </h5>
                    <p className="text-white/85 leading-relaxed whitespace-pre-line">
                      {clarifyingInterpretation.deepAnalysis}
                    </p>
                  </div>

                  {/* Connection to spread */}
                  <div className={`bg-gradient-to-r rounded-xl p-4 mb-4 border-l-2 ${isFairyTheme ? 'from-[#FC89AC]/10 to-pink-500/10 border-[#FC89AC]/50' : 'from-slate-500/10 to-slate-600/10 border-slate-500/50'}`}>
                    <h5 className="text-white/70 text-xs uppercase tracking-wide mb-2">
                      Связь с раскладом
                    </h5>
                    <p className="text-white/90 leading-relaxed">
                      {clarifyingInterpretation.connectionToSpread}
                    </p>
                  </div>

                  {/* Additional advice */}
                  <div className="bg-gradient-to-r from-gold-500/10 to-transparent rounded-xl p-4 border-l-2 border-gold-500/50">
                    <h5 className="text-white/70 text-xs uppercase tracking-wide mb-2">
                      Совет карты
                    </h5>
                    <p className="text-white/90 leading-relaxed italic">
                      {clarifyingInterpretation.additionalAdvice}
                    </p>
                  </div>
                </Card>
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
