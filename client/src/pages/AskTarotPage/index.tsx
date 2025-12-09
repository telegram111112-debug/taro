import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '../../store/useUserStore'
import { useTelegram } from '../../providers/TelegramProvider'
import { Header } from '../../components/layout'
import { Button, Card } from '../../components/ui'
import { CardDeck, CardFlip, TarotCard } from '../../components/tarot'
import { MagicParticles, FallingElements } from '../../components/effects'
import { allTarotCards } from '../../data/tarotCards'
import { getCurrentFairyBackground, getFairyBackgroundStyle } from '../../lib/fairyBackgrounds'
import { getCurrentWitchBackground, getWitchBackgroundStyle } from '../../lib/witchBackgrounds'
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
  const { user } = useUserStore()
  const { hapticFeedback, showBackButton, hideBackButton } = useTelegram()

  const [step, setStep] = useState<AskTarotStep>('input')
  const [question, setQuestion] = useState('')
  const [isShuffling, setIsShuffling] = useState(false)
  const [drawnCard, setDrawnCard] = useState<TarotCardType | null>(null)
  const [isReversed, setIsReversed] = useState(false)
  const [tarotAnswer, setTarotAnswer] = useState<TarotAnswer | null>(null)
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false)

  const selectedDeck = user?.deckTheme || 'fairy'
  const isWitchTheme = selectedDeck === 'witch'
  const isFairyTheme = selectedDeck === 'fairy'

  // Фоны для колод
  const fairyBackground = useMemo(() => getCurrentFairyBackground(), [])
  const witchBackground = useMemo(() => getCurrentWitchBackground(), [])

  useEffect(() => {
    showBackButton(() => navigate(-1))
    return () => hideBackButton()
  }, [])

  const handleSubmitQuestion = () => {
    if (!question.trim()) return
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
      console.log('Sending tarot ask request...', { userId, question, card: drawnCard.nameRu })

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

      console.log('Tarot API response:', response.data)

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
                  <span>1 вопрос в день</span>
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
                          ? 'bg-[#FC89AC]/30 text-white hover:bg-[#FC89AC]/40 border border-[#FC89AC]/40'
                          : 'bg-slate-500/30 text-slate-200 hover:bg-slate-500/40 border border-slate-400/30'
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
                className={`w-full ${isFairyTheme ? 'bg-[#FC89AC]/80' : 'bg-slate-600/80'}`}
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
            className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
            style={
              isFairyTheme
                ? getFairyBackgroundStyle(fairyBackground)
                : getWitchBackgroundStyle(witchBackground)
            }
          >
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
                  ? 'bg-black/30 border-[#FC89AC]/20'
                  : 'bg-black/40 border-slate-500/20'
              }`}>
                <p className={`text-xs mb-1.5 text-center ${isFairyTheme ? 'text-[#FC89AC]/70' : 'text-white/50'}`}>
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
            className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
          >
            <div className={`absolute inset-0 ${
              isFairyTheme
                ? 'bg-gradient-to-b from-[#FC89AC]/30 via-black/50 to-black/80'
                : 'bg-gradient-to-b from-slate-800/80 via-slate-900/60 to-black/80'
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
            className="min-h-screen p-4 pb-24"
          >
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
                  <p className={`mt-2 ${isFairyTheme ? 'text-[#FC89AC]' : 'text-slate-300'}`}>
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
                    isFairyTheme ? 'text-[#FC89AC]' : 'text-slate-300'
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
                      ? 'bg-gradient-to-r from-[#FC89AC]/10 to-pink-500/10 border border-[#FC89AC]/20'
                      : 'bg-gradient-to-r from-slate-500/10 to-slate-600/10 border border-slate-500/20'
                  }`}
                >
                  <h3 className={`text-sm font-medium mb-2 flex items-center gap-2 ${
                    isFairyTheme ? 'text-[#FC89AC]' : 'text-slate-300'
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
                    isFairyTheme ? 'text-[#FC89AC]/70' : 'text-slate-300/70'
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
                          ? 'bg-[#FC89AC]/10 text-[#FC89AC]/60'
                          : 'bg-slate-500/10 text-slate-300/60'
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
    </div>
  )
}
