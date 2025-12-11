import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '../../store/useUserStore'
import { useCardsStore } from '../../store/useCardsStore'
import { useTelegram } from '../../providers/TelegramProvider'
import { Header } from '../../components/layout'
import { Button, Card, Modal } from '../../components/ui'
import { CardDeck, CardFlip, TarotCard } from '../../components/tarot'
import { MagicParticles, FallingElements } from '../../components/effects'
import { allTarotCards } from '../../data/tarotCards'
import { tarotApi } from '../../lib/api'
import type { Card as TarotCardType } from '../../types'

type AskTarotStep = 'input' | 'shuffle' | 'reveal' | 'answer'

interface TarotAnswer {
  greeting: string
  cardMeaning: string
  answer: string
  advice: string
}

export function AskTarotPage() {
  const navigate = useNavigate()
  const {
    user,
    canAskQuestion,
    useQuestion,
    getRemainingQuestions,
    getMaxQuestionsPerDay,
    getActiveFriendsCount,
  } = useUserStore()
  const { todayReading } = useCardsStore()
  const { hapticFeedback, showBackButton, hideBackButton } = useTelegram()

  // Проверяем, можно ли ещё открыть карту дня (если todayReading уже есть - значит уже открыта)
  const canShowDailyCardButton = !todayReading

  const [step, setStep] = useState<AskTarotStep>('input')
  const [question, setQuestion] = useState('')
  const [isShuffling, setIsShuffling] = useState(false)
  const [drawnCard, setDrawnCard] = useState<TarotCardType | null>(null)
  const [isReversed, setIsReversed] = useState(false)
  const [tarotAnswer, setTarotAnswer] = useState<TarotAnswer | null>(null)
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)

  const selectedDeck = user?.deckTheme || 'fairy'
  const isFairyTheme = selectedDeck === 'fairy'

  // Проверяем, можно ли задавать вопрос
  const canAsk = canAskQuestion()
  const remainingQuestions = getRemainingQuestions()
  const maxQuestions = getMaxQuestionsPerDay()
  const activeFriends = getActiveFriendsCount()

  useEffect(() => {
    showBackButton(() => navigate(-1))
    return () => hideBackButton()
  }, [])

  // Показываем модалку лимита сразу при заходе, если лимит исчерпан
  useEffect(() => {
    if (!canAsk) {
      setShowLimitModal(true)
    }
  }, [canAsk])

  const handleSubmitQuestion = () => {
    if (!question.trim()) return

    // Проверяем лимит вопросов
    if (!canAsk) {
      hapticFeedback('notification', 'error')
      setShowLimitModal(true)
      return
    }

    // Используем вопрос (списываем из лимита)
    const success = useQuestion()
    if (!success) {
      setShowLimitModal(true)
      return
    }

    hapticFeedback('impact', 'medium')
    setStep('shuffle')
    setIsShuffling(true)
  }

  const handleShuffleComplete = () => {
    setIsShuffling(false)
  }

  const handleCardSelect = () => {
    hapticFeedback('notification', 'success')
    // Выбираем случайную карту из всех 78
    const randomCard = allTarotCards[Math.floor(Math.random() * allTarotCards.length)]
    const reversed = Math.random() < 0.3 // 30% шанс перевёрнутой карты
    setDrawnCard(randomCard)
    setIsReversed(reversed)
    setStep('reveal')
  }

  const handleCardRevealed = async () => {
    if (!drawnCard) return

    setIsGeneratingAnswer(true)

    // Используем user.id если есть, иначе генерируем временный
    const userId = user?.id || `temp-${Date.now()}`

    try {
      // Отправляем запрос на сервер с Claude API
      const response = await tarotApi.ask(
        userId,
        question,
        {
          id: drawnCard.id,
          name: drawnCard.nameEn,
          nameRu: drawnCard.nameRu,
          arcana: drawnCard.arcana,
          suit: drawnCard.suit,
          slug: drawnCard.slug,
          uprightMeaning: drawnCard.meaningUpright?.general || '',
          reversedMeaning: drawnCard.meaningReversed?.general || '',
        },
        isReversed
      )

      if (response.data.success && response.data.reading) {
        setTarotAnswer(response.data.reading)
        setStep('answer')
      } else {
        console.warn('API returned success=false, using fallback')
        // Fallback на локальную генерацию при ошибке
        const meaning = isReversed ? drawnCard.meaningReversed : drawnCard.meaningUpright
        setTarotAnswer({
          greeting: user?.name ? `Дорогая ${user.name}...` : 'Дорогая путница...',
          cardMeaning: `${drawnCard.nameRu} говорит о переменах в твоей жизни. ${meaning?.general || ''}`,
          answer: meaning?.advice || 'Карты указывают на то, что ответ уже внутри тебя.',
          advice: 'Прислушайся к своей интуиции и доверься потоку жизни.',
        })
        setStep('answer')
      }
    } catch (error) {
      console.error('Error getting tarot reading:', error)
      // Fallback при ошибке сети
      const meaning = isReversed ? drawnCard.meaningReversed : drawnCard.meaningUpright
      setTarotAnswer({
        greeting: user?.name ? `Дорогая ${user.name}...` : 'Дорогая путница...',
        cardMeaning: `${drawnCard.nameRu} говорит о переменах в твоей жизни. ${meaning?.general || ''}`,
        answer: meaning?.advice || 'Карты указывают на то, что ответ уже внутри тебя.',
        advice: 'Прислушайся к своей интуиции и доверься потоку жизни.',
      })
      setStep('answer')
    } finally {
      setIsGeneratingAnswer(false)
    }
  }

  const handleNewQuestion = () => {
    setStep('input')
    setQuestion('')
    setDrawnCard(null)
    setTarotAnswer(null)
  }

  // Примеры вопросов
  const exampleQuestions = isFairyTheme
    ? [
        'Что ждёт меня в любви?',
        'Стоит ли мне менять работу?',
        'Как привлечь удачу?',
      ]
    : [
        'Что скрывает от меня судьба?',
        'Какие перемены меня ждут?',
        'На что обратить внимание?',
      ]

  return (
    <div className="min-h-screen">
      {step !== 'shuffle' && step !== 'reveal' && (
        <Header
          title="Вопрос картам"
          showBack
          transparent={step === 'input'}
        />
      )}

      <AnimatePresence mode="wait">
        {/* Input Question */}
        {step === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex flex-col p-6 pt-20 relative"
          >
            {/* Background */}
            <div
              className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
              style={{
                backgroundImage: isFairyTheme
                  ? 'url(/backgrounds/background-fairy.jpg)'
                  : 'url(/backgrounds/background-witch.jpg)',
              }}
            />
            <div className={`fixed inset-0 -z-10 ${isFairyTheme ? 'bg-black/50' : 'bg-black/60'}`} />

            <MagicParticles theme={selectedDeck} intensity="light" />

            <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
              >
                <div className="text-5xl mb-4">
                  {isFairyTheme ? '✨' : '🌙'}
                </div>
                <h1 className={`text-2xl font-display font-bold mb-2 ${isFairyTheme ? 'text-white drop-shadow-lg' : 'text-white'}`}>
                  Задай вопрос картам
                </h1>
                <p className={`text-sm ${isFairyTheme ? 'text-white/80 drop-shadow-md' : 'text-white/60'}`}>
                  Сформулируй свой вопрос — карты дадут ответ
                </p>
              </motion.div>

              {/* Question Input */}
              <Card variant="glass" className={isFairyTheme ? 'bg-black/40 backdrop-blur-md' : ''}>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={isFairyTheme
                    ? "Напиши свой вопрос... Например: Что ждёт меня в ближайшем будущем?"
                    : "Задай свой вопрос тьме... Например: Какие тайны скрывает моя судьба?"
                  }
                  className={`
                    w-full h-32 bg-transparent border-none outline-none resize-none
                    text-white placeholder-white/50 text-lg
                  `}
                  maxLength={200}
                />
                <div className="flex justify-between items-center mt-2 text-white/50 text-xs">
                  <div className="flex items-center gap-1">
                    <span className={remainingQuestions > 0 ? 'text-white/70' : 'text-red-400'}>
                      {remainingQuestions}/{maxQuestions} вопросов
                    </span>
                    {activeFriends > 0 && (
                      <span className={`${isFairyTheme ? 'text-[#C4A0A5]' : 'text-purple-400'}`}>
                        (+{activeFriends} 👭)
                      </span>
                    )}
                  </div>
                  <span>{question.length}/200</span>
                </div>
              </Card>

              {/* Example Questions */}
              <div className="mb-6 mt-4">
                <p className={`text-xs mb-2 text-center ${isFairyTheme ? 'text-white/70' : 'text-white/50'}`}>Примеры вопросов:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {exampleQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setQuestion(q)}
                      className={`
                        px-3 py-1.5 rounded-full text-xs transition-all
                        ${isFairyTheme
                          ? 'bg-[#C4A0A5]/30 text-white hover:bg-[#C4A0A5]/40 border border-[#C4A0A5]/40'
                          : 'bg-black/40 text-white/80 hover:bg-black/50 border border-white/20'
                        }
                      `}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitQuestion}
                disabled={!question.trim()}
                size="lg"
                variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'}
                className={`w-full ${isFairyTheme ? 'bg-[#C4A0A5]/80' : 'bg-black/40 border border-white/20 hover:bg-black/50'}`}
              >
                {isFairyTheme ? 'Спросить карты 💫' : 'Вопросить судьбу 🌙'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Shuffle */}
        {step === 'shuffle' && (
          <motion.div
            key="shuffle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
            style={{ touchAction: 'none' }}
          >
            {/* Unique background for shuffle screen */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
              style={{
                backgroundImage: isFairyTheme
                  ? 'url(/backgrounds/ask-shuffle-fairy.jpg)'
                  : 'url(/backgrounds/ask-shuffle-witch.jpg)',
              }}
            />
            <div className={`absolute inset-0 ${
              isFairyTheme
                ? 'bg-gradient-to-b from-black/30 via-black/10 to-black/50'
                : 'bg-gradient-to-b from-black/50 via-black/30 to-black/60'
            }`} />

            <FallingElements theme={selectedDeck} intensity="heavy" />

            {/* Question Display */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-16 left-4 right-4 z-10"
            >
              <div className={`backdrop-blur-md rounded-2xl p-4 max-w-md mx-auto border ${
                isFairyTheme
                  ? 'bg-black/30 border-[#C4A0A5]/20'
                  : 'bg-black/40 border-white/20'
              }`}>
                <p className={`text-xs mb-1.5 text-center ${isFairyTheme ? 'text-[#C4A0A5]/70' : 'text-white/50'}`}>
                  Твой вопрос:
                </p>
                <p className="text-white text-sm text-center leading-relaxed">
                  "{question}"
                </p>
              </div>
            </motion.div>

            <div className="relative z-10">
              <CardDeck
                isShuffling={isShuffling}
                onShuffleComplete={handleShuffleComplete}
                onCardSelect={handleCardSelect}
                deckTheme={selectedDeck}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-8 left-0 right-0 text-center px-6 z-10"
            >
              <div className="inline-block bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2">
                <p className="text-white/80 text-sm">
                  {isShuffling ? 'Карты перемешиваются...' : 'Выбери свою карту'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Reveal */}
        {step === 'reveal' && drawnCard && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
            style={{ touchAction: 'none' }}
          >
            {/* Unique background for reveal screen */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
              style={{
                backgroundImage: isFairyTheme
                  ? 'url(/backgrounds/ask-reveal-fairy.jpg)'
                  : 'url(/backgrounds/ask-reveal-witch.jpg)',
              }}
            />
            {/* Overlay gradient */}
            <div className={`absolute inset-0 ${
              isFairyTheme
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

        {/* Answer */}
        {step === 'answer' && drawnCard && tarotAnswer && (
          <motion.div
            key="answer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen p-4 pb-24 relative"
          >
            {/* Unique background for answer screen */}
            <div
              className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
              style={{
                backgroundImage: isFairyTheme
                  ? 'url(/backgrounds/ask-answer-fairy.jpg)'
                  : 'url(/backgrounds/ask-answer-witch.jpg)',
              }}
            />
            <div className={`fixed inset-0 -z-10 ${isFairyTheme ? 'bg-black/60' : 'bg-black/70'}`} />
            {/* Card display */}
            <div className="flex justify-center mb-6">
              <TarotCard
                card={drawnCard}
                isReversed={isReversed}
                isRevealed={true}
                size="sm"
                showName={true}
                deckTheme={selectedDeck}
              />
            </div>

            {/* Question reminder */}
            <Card variant="glass" className="mb-4">
              <p className="text-white/50 text-xs mb-1">Твой вопрос:</p>
              <p className="text-white text-sm italic">"{question}"</p>
            </Card>

            {/* Tarot Answer */}
            <Card variant={isFairyTheme ? 'mystic-fairy' : 'mystic-witch'} className="mb-4">
              <div className="space-y-4">
                {/* Greeting */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center pb-3 border-b border-white/10"
                >
                  <motion.span
                    className="text-3xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {isFairyTheme ? '✨' : '🌙'}
                  </motion.span>
                  <p className={`mt-2 ${isFairyTheme ? 'text-[#C4A0A5]' : 'text-white/70'}`}>
                    {tarotAnswer.greeting}
                  </p>
                </motion.div>

                {/* Card Meaning */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className={`text-sm font-medium mb-2 flex items-center gap-2 ${
                    isFairyTheme ? 'text-[#C4A0A5]' : 'text-white/70'
                  }`}>
                    <span>{isFairyTheme ? '🦋' : '🔮'}</span> Значение карты
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {tarotAnswer.cardMeaning}
                  </p>
                </motion.div>

                {/* Answer */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`p-4 rounded-xl ${
                    isFairyTheme
                      ? 'bg-gradient-to-r from-[#C4A0A5]/10 to-[#B090A0]/10 border border-[#C4A0A5]/20'
                      : 'bg-black/40 border border-white/20'
                  }`}
                >
                  <h3 className={`text-sm font-medium mb-2 flex items-center gap-2 ${
                    isFairyTheme ? 'text-[#C4A0A5]' : 'text-white/70'
                  }`}>
                    <span>{isFairyTheme ? '💕' : '🌟'}</span> Ответ карт
                  </h3>
                  <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">
                    {tarotAnswer.answer}
                  </p>
                </motion.div>

                {/* Advice */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className={`text-sm italic ${
                    isFairyTheme ? 'text-[#C4A0A5]/70' : 'text-white/60'
                  }`}>
                    {tarotAnswer.advice}
                  </p>
                </motion.div>

                {/* Keywords */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-wrap gap-2 justify-center pt-3 border-t border-white/10"
                >
                  {drawnCard.keywords.slice(0, 4).map((keyword, i) => (
                    <span
                      key={i}
                      className={`px-2 py-1 rounded-full text-xs ${
                        isFairyTheme
                          ? 'bg-[#C4A0A5]/10 text-[#C4A0A5]/60'
                          : 'bg-black/30 text-white/60'
                      }`}
                    >
                      {keyword}
                    </span>
                  ))}
                </motion.div>
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/')}
                variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'}
                className="w-full"
              >
                На главную 🏠
              </Button>
            </div>
          </motion.div>
        )}

        {/* Loading Answer */}
        {isGeneratingAnswer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          >
            <div className="text-center">
              <motion.div
                className="text-5xl mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                {isFairyTheme ? '✨' : '🌙'}
              </motion.div>
              <p className="text-white/80">Карты формируют ответ...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модальное окно лимита вопросов */}
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
              className={`absolute inset-0 ${isFairyTheme ? 'bg-[#C4A0A5]/20' : 'bg-[#2a2a2a]/40'} backdrop-blur-md`}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative max-w-sm w-full rounded-3xl p-6 pt-12 text-center overflow-hidden border-2 ${
                isFairyTheme
                  ? 'border-[#C4A0A5]/40 bg-gradient-to-b from-[#2a1f2d] via-[#1f1a22] to-[#1a1518]'
                  : 'border-[#4a4a4a]/50 bg-gradient-to-b from-[#2a2a2a] via-[#1f1f1f] to-[#1a1a1a]'
              }`}
              style={{
                backgroundImage: isFairyTheme
                  ? 'url(/backgrounds/modal-limit-fairy.jpg)'
                  : 'url(/backgrounds/modal-limit-witch.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Decorative glow */}
              <motion.div
                className={`absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl ${
                  isFairyTheme ? 'bg-[#C4A0A5]/20' : 'bg-[#5a5a5a]/20'
                }`}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              {/* Text content - без рамки, с усиленной тенью для читаемости */}
              <div className="relative z-10 p-4 mb-4">
                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-display font-bold mb-3 text-white"
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 4px 20px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.8)' }}
                >
                  Карты отдыхают
                </motion.h3>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white text-sm mb-3 leading-relaxed font-medium"
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 4px 20px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.8)' }}
                >
                  Сегодня ты уже задала {maxQuestions} {maxQuestions === 1 ? 'вопрос' : maxQuestions < 5 ? 'вопроса' : 'вопросов'}.
                  <br />
                  Завтра карты снова откроют тебе тайны {isFairyTheme ? '✨' : '🌙'}
                </motion.p>

                {/* Friends bonus hint - кликабельная кнопка с искрящимися эмодзи */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  onClick={() => {
                    setShowLimitModal(false)
                    navigate('/referrals?tab=invite')
                  }}
                  className="relative text-white text-xs font-medium active:scale-95 transition-transform flex items-center gap-1"
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 4px 20px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.8)' }}
                >
                  {/* Искорка слева */}
                  <motion.span
                    className="text-base"
                    style={{
                      filter: isFairyTheme ? 'drop-shadow(0 0 4px #ff9ec4) drop-shadow(0 0 8px #ff69b4)' : 'drop-shadow(0 0 3px #fff)',
                    }}
                    animate={{
                      opacity: [0.7, 1, 0.7],
                      filter: isFairyTheme
                        ? [
                            'drop-shadow(0 0 2px #ff9ec4)',
                            'drop-shadow(0 0 6px #ff69b4) drop-shadow(0 0 10px #ff9ec4)',
                            'drop-shadow(0 0 2px #ff9ec4)',
                          ]
                        : [
                            'drop-shadow(0 0 2px #fff)',
                            'drop-shadow(0 0 5px #fff)',
                            'drop-shadow(0 0 2px #fff)',
                          ],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    ✨
                  </motion.span>
                  {/* Текст */}
                  <span>Пригласи подругу — получи +1 вопрос каждый день</span>
                  {/* Искорка справа */}
                  <motion.span
                    className="text-base"
                    style={{
                      filter: isFairyTheme ? 'drop-shadow(0 0 4px #ff9ec4) drop-shadow(0 0 8px #ff69b4)' : 'drop-shadow(0 0 3px #fff)',
                    }}
                    animate={{
                      opacity: [1, 0.7, 1],
                      filter: isFairyTheme
                        ? [
                            'drop-shadow(0 0 6px #ff69b4) drop-shadow(0 0 10px #ff9ec4)',
                            'drop-shadow(0 0 2px #ff9ec4)',
                            'drop-shadow(0 0 6px #ff69b4) drop-shadow(0 0 10px #ff9ec4)',
                          ]
                        : [
                            'drop-shadow(0 0 5px #fff)',
                            'drop-shadow(0 0 2px #fff)',
                            'drop-shadow(0 0 5px #fff)',
                          ],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    ✨
                  </motion.span>
                </motion.button>
              </div>

              {/* Sparkles for fairy theme */}
              {isFairyTheme && (
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

              {/* Button with stronger animation */}
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
                    variant="secondary"
                    className={`w-full !border-0 ${
                      isFairyTheme
                        ? '!bg-[#C4A0A5] hover:!bg-[#d4b0b5] text-white'
                        : '!bg-[#3a3a3a] hover:!bg-[#4a4a4a] text-white'
                    }`}
                  >
                    До завтра {isFairyTheme ? '💫' : '🔮'}
                  </Button>
                </motion.div>
              </motion.div>

              {/* Кнопка Карта дня - показываем только если карта дня ещё не открыта сегодня */}
              {canShowDailyCardButton && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="relative z-10 mt-3"
                >
                  <motion.button
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    onClick={() => {
                      setShowLimitModal(false)
                      navigate('/daily')
                    }}
                    className="text-sm text-white/80 active:scale-95"
                    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
                  >
                    {isFairyTheme
                      ? 'Загляни в Карту дня ✨'
                      : 'Загляни в Карту дня 🌙'}
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
