import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '../../store/useUserStore'
import { useTelegram } from '../../providers/TelegramProvider'
import { Button, Input } from '../../components/ui'
import { getNameMeaning } from '../../lib/namesMeanings'
import type { DeckTheme, RelationshipStatus } from '../../types'

// Уникальные фразы для каждого знака зодиака
const zodiacPhrases: Record<string, { emoji: string; message: string; tarotConnection: string }> = {
  'Овен': {
    emoji: '♈',
    message: 'Огненная энергия Овна делает тебя прирождённым лидером',
    tarotConnection: 'Карты усилят твою интуицию и помогут направить страсть в нужное русло'
  },
  'Телец': {
    emoji: '♉',
    message: 'Земная мудрость Тельца дарит тебе терпение и чувственность',
    tarotConnection: 'Таро раскроет секреты изобилия и поможет укрепить твои ценности'
  },
  'Близнецы': {
    emoji: '♊',
    message: 'Воздушная лёгкость Близнецов наделяет тебя даром общения',
    tarotConnection: 'Карты помогут найти ответы среди множества твоих идей'
  },
  'Рак': {
    emoji: '♋',
    message: 'Водная глубина Рака делает тебя невероятно интуитивной',
    tarotConnection: 'Таро станет мостом к твоим самым сокровенным чувствам'
  },
  'Лев': {
    emoji: '♌',
    message: 'Солнечное сияние Льва озаряет всё вокруг тебя',
    tarotConnection: 'Карты усилят твой природный магнетизм и творческую силу'
  },
  'Дева': {
    emoji: '♍',
    message: 'Земная проницательность Девы дарит тебе дар видеть детали',
    tarotConnection: 'Таро поможет найти гармонию между анализом и интуицией'
  },
  'Весы': {
    emoji: '♎',
    message: 'Воздушная гармония Весов наполняет тебя чувством красоты',
    tarotConnection: 'Карты помогут найти баланс в отношениях и решениях'
  },
  'Скорпион': {
    emoji: '♏',
    message: 'Водная глубина Скорпиона делает тебя мастером трансформаций',
    tarotConnection: 'Таро раскроет тайны и поможет в твоём духовном перерождении'
  },
  'Стрелец': {
    emoji: '♐',
    message: 'Огненный оптимизм Стрельца ведёт тебя к новым горизонтам',
    tarotConnection: 'Карты станут твоим компасом в поиске истины и приключений'
  },
  'Козерог': {
    emoji: '♑',
    message: 'Земная сила Козерога даёт тебе несгибаемую волю',
    tarotConnection: 'Таро поддержит тебя на пути к вершинам и мудрым решениям'
  },
  'Водолей': {
    emoji: '♒',
    message: 'Воздушная уникальность Водолея делает тебя провидцем',
    tarotConnection: 'Карты откроют нестандартные решения и новые возможности'
  },
  'Рыбы': {
    emoji: '♓',
    message: 'Водная мистика Рыб дарит тебе связь с тонкими мирами',
    tarotConnection: 'Таро усилит твой природный дар предвидения и интуиции'
  },
}

type OnboardingStep =
  | 'welcome'
  | 'name'
  | 'birthdate'
  | 'birthtime'
  | 'city'
  | 'relationship'
  | 'gifts'
  | 'complete'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { user: tgUser, hapticFeedback } = useTelegram()
  const { setUser, setOnboarded } = useUserStore()

  const [step, setStep] = useState<OnboardingStep>('welcome')
  const [formData, setFormData] = useState({
    name: tgUser?.first_name || '',
    birthDate: '',
    birthTime: '',
    birthCity: '',
    relationshipStatus: '' as RelationshipStatus | '',
    deckTheme: 'fairy' as DeckTheme, // По умолчанию розовая тема
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const goToStep = (nextStep: OnboardingStep) => {
    hapticFeedback('impact', 'light')
    setStep(nextStep)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  // Автоформатирование времени с двоеточием
  const handleBirthTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value

    // Удаляем всё кроме цифр
    const digits = value.replace(/\D/g, '')

    // Форматируем с двоеточием (HH:MM)
    let formatted = ''
    if (digits.length > 0) {
      // Ограничиваем первую цифру часов (0-2)
      const firstDigit = parseInt(digits[0])
      formatted = digits.slice(0, Math.min(2, digits.length))

      // Проверяем валидность часов (00-23)
      if (digits.length >= 2) {
        const hours = parseInt(digits.slice(0, 2))
        if (hours > 23) {
          formatted = '23'
        }
      }
    }
    if (digits.length > 2) {
      // Проверяем валидность минут (00-59)
      let minutes = digits.slice(2, 4)
      if (parseInt(minutes) > 59) {
        minutes = '59'
      }
      formatted += ':' + minutes
    }

    setFormData((prev) => ({ ...prev, birthTime: formatted }))
    setErrors((prev) => ({ ...prev, birthTime: '' }))
  }

  // Автоформатирование даты с точками
  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value

    // Удаляем всё кроме цифр
    const digits = value.replace(/\D/g, '')

    // Форматируем с точками
    let formatted = ''
    if (digits.length > 0) {
      formatted = digits.slice(0, 2)
    }
    if (digits.length > 2) {
      formatted += '.' + digits.slice(2, 4)
    }
    if (digits.length > 4) {
      formatted += '.' + digits.slice(4, 8)
    }

    setFormData((prev) => ({ ...prev, birthDate: formatted }))
    setErrors((prev) => ({ ...prev, birthDate: '' }))
  }

  const validateBirthDate = (date: string) => {
    const regex = /^\d{2}\.\d{2}\.\d{4}$/
    if (!regex.test(date)) return false
    const [day, month, year] = date.split('.').map(Number)
    const dateObj = new Date(year, month - 1, day)
    return dateObj.getDate() === day &&
      dateObj.getMonth() === month - 1 &&
      year >= 1920 && year <= 2010
  }

  const getZodiacSign = (date: string): string => {
    const [day, month] = date.split('.').map(Number)
    const signs = [
      { sign: 'Козерог', end: [1, 19] },
      { sign: 'Водолей', end: [2, 18] },
      { sign: 'Рыбы', end: [3, 20] },
      { sign: 'Овен', end: [4, 19] },
      { sign: 'Телец', end: [5, 20] },
      { sign: 'Близнецы', end: [6, 20] },
      { sign: 'Рак', end: [7, 22] },
      { sign: 'Лев', end: [8, 22] },
      { sign: 'Дева', end: [9, 22] },
      { sign: 'Весы', end: [10, 22] },
      { sign: 'Скорпион', end: [11, 21] },
      { sign: 'Стрелец', end: [12, 21] },
      { sign: 'Козерог', end: [12, 31] },
    ]

    for (const { sign, end } of signs) {
      if (month < end[0] || (month === end[0] && day <= end[1])) {
        return sign
      }
    }
    return 'Козерог'
  }

  const handleComplete = async () => {
    hapticFeedback('notification', 'success')

    const zodiacSign = getZodiacSign(formData.birthDate)

    // Create user object
    const newUser = {
      id: 'temp-' + Date.now(),
      telegramId: tgUser?.id || 0,
      name: formData.name,
      birthDate: formData.birthDate,
      birthTime: formData.birthTime || undefined,
      birthCity: formData.birthCity || undefined,
      zodiacSign,
      relationshipStatus: formData.relationshipStatus as RelationshipStatus,
      streakCount: 1,
      streakLastDate: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      deckTheme: formData.deckTheme,
      createdAt: new Date().toISOString(),
      // Начальные еженедельные расклады
      weeklyLoveSpreads: 1,
      weeklyMoneySpreads: 1,
      weeklyFutureSpreads: 1,
      weeklyLastRefill: new Date().toISOString(),
    }

    setUser(newUser)
    setOnboarded(true)
    // Явно перенаправляем на главную страницу
    navigate('/', { replace: true })
  }

  // Используем тему fairy по умолчанию для регистрации
  const isFairyTheme = formData.deckTheme === 'fairy'

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background - разный фон для разных шагов с плавным переходом */}
      <motion.div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        initial={false}
        animate={{
          backgroundImage: step === 'welcome'
            ? 'url(/backgrounds/onboarding-welcome.jpg)'
            : step === 'relationship'
              ? 'url(/backgrounds/onboarding-relationship.jpg)'
              : step === 'birthtime'
                ? 'url(/backgrounds/onboarding-birthtime.jpg)'
                : 'url(/backgrounds/onboarding.jpg)'
        }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        style={{
          backgroundImage: step === 'welcome'
            ? 'url(/backgrounds/onboarding-welcome.jpg)'
            : step === 'relationship'
              ? 'url(/backgrounds/onboarding-relationship.jpg)'
              : step === 'birthtime'
                ? 'url(/backgrounds/onboarding-birthtime.jpg)'
                : 'url(/backgrounds/onboarding.jpg)'
        }}
      />
      <motion.div
        className="fixed inset-0 -z-10"
        initial={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
        animate={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
        transition={{ duration: 0.6 }}
      />

      {/* Magical floating particles - плавное появление */}
      <AnimatePresence>
        {step !== 'welcome' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="fixed inset-0 pointer-events-none overflow-hidden z-0"
          >
            {/* Светящиеся частицы */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(196,160,165,0.6) 0%, rgba(196,160,165,0) 70%)',
                  boxShadow: '0 0 8px rgba(196,160,165,0.4)',
                  left: `${10 + (i * 10) % 80}%`,
                  top: `${15 + (i * 12) % 70}%`,
                }}
                animate={{
                  y: [0, -20, -10, -25, 0],
                  x: [0, 8, -4, 10, 0],
                  opacity: [0.2, 0.5, 0.3, 0.6, 0.2],
                  scale: [1, 1.2, 1.1, 1.3, 1],
                }}
                transition={{
                  duration: 8 + (i % 4) * 2,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: 'easeInOut',
                }}
              />
            ))}
            {/* Мерцающие звёздочки - меньше и нежнее */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                className="absolute text-[#C4A0A5]"
                style={{
                  left: `${8 + (i * 18) % 84}%`,
                  top: `${12 + (i * 15) % 76}%`,
                  fontSize: '8px',
                  filter: 'drop-shadow(0 0 3px rgba(196,160,165,0.6))',
                }}
                animate={{
                  opacity: [0.1, 0.6, 0.1],
                  scale: [0.9, 1.1, 0.9],
                }}
                transition={{
                  duration: 4 + (i % 3),
                  repeat: Infinity,
                  delay: i * 1.2,
                  ease: 'easeInOut',
                }}
              >
                ✦
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* Welcome */}
        {step === 'welcome' && (
          <OnboardingScreen key="welcome">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', delay: 0.2, damping: 12 }}
                className="mb-6 relative"
              >
                {/* Мягкое свечение под иконкой */}
                <motion.div
                  className="absolute inset-0 mx-auto w-16 h-16 rounded-full bg-[#C4A0A5]/30 blur-xl"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <motion.img
                  src="/icons/onboarding-luna.png"
                  alt="Луна"
                  className="w-20 h-20 mx-auto object-contain relative z-10"
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(196,160,165,0.4)) drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                  }}
                  animate={{
                    y: [0, -6, -3, -6, 0],
                    rotate: [0, 1.5, -1.5, 1, 0],
                    scale: [1, 1.02, 1.01, 1.02, 1],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: [0.45, 0, 0.55, 1],
                    times: [0, 0.25, 0.5, 0.75, 1],
                  }}
                />
              </motion.div>
              <h1
                className="text-3xl font-display font-bold text-white mb-4"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
              >
                Привет! Я Луна
              </h1>
              <p
                className="text-white mb-2"
                style={{ textShadow: '0 2px 6px rgba(0,0,0,0.7)' }}
              >
                Твоя персональная подруга-таролог
              </p>
              <p
                className="text-white/80 text-sm mb-8"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
              >
                Карты Таро — это не просто гадание,
                <br />
                это искренний разговор с самой собой через древние символы.
              </p>
              <Button onClick={() => goToStep('name')} variant="primary-fairy" className="w-full">
                Давай познакомимся! 💫
              </Button>
            </div>
          </OnboardingScreen>
        )}

        {/* Name */}
        {step === 'name' && (
          <OnboardingScreen key="name">
            <NameStepContent
              name={formData.name}
              error={errors.name}
              onNameChange={(value) => handleInputChange('name', value)}
              onBack={() => goToStep('welcome')}
              onContinue={() => {
                if (!formData.name.trim()) {
                  setErrors({ name: 'Введи своё имя' })
                  return
                }
                goToStep('birthdate')
              }}
            />
          </OnboardingScreen>
        )}

        {/* Birth Date */}
        {step === 'birthdate' && (
          <OnboardingScreen key="birthdate">
            <div className="text-center">
              <motion.h2
                className="text-2xl font-display font-semibold text-white mb-2"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                {formData.name}, когда твой день рождения?
              </motion.h2>
              <motion.p
                className="text-white/80 text-sm mb-6"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Это важно для персонализации раскладов по знаку зодиака
              </motion.p>

              <Input
                value={formData.birthDate}
                onChange={handleBirthDateChange}
                placeholder="ДД.ММ.ГГГГ"
                hint="Например: 15.03.1995"
                error={errors.birthDate}
                inputMode="numeric"
                maxLength={10}
              />

              {formData.birthDate && validateBirthDate(formData.birthDate) && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="mt-4 p-4 rounded-xl bg-[#C4A0A5]/20 border border-[#C4A0A5]/30 backdrop-blur-sm"
                >
                  {(() => {
                    const sign = getZodiacSign(formData.birthDate)
                    const phrase = zodiacPhrases[sign]
                    return (
                      <div className="text-left space-y-2">
                        <p className="text-white font-semibold text-base" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                          {phrase?.emoji} {sign}
                        </p>
                        <p className="text-white/90 text-sm" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                          {phrase?.message}
                        </p>
                        <p className="text-[#d4b8bc] text-xs italic">
                          ✨ {phrase?.tarotConnection}
                        </p>
                      </div>
                    )
                  })()}
                </motion.div>
              )}

              <div className="mt-8 flex gap-3">
                <Button variant="ghost" onClick={() => goToStep('name')} className="!text-[#C4A0A5] hover:!text-[#d4b0b5]">
                  Назад
                </Button>
                <Button
                  variant="primary-fairy"
                  className="flex-1"
                  onClick={() => {
                    if (!validateBirthDate(formData.birthDate)) {
                      setErrors({ birthDate: 'Введи дату в формате ДД.ММ.ГГГГ' })
                      return
                    }
                    goToStep('birthtime')
                  }}
                >
                  Продолжить
                </Button>
              </div>
            </div>
          </OnboardingScreen>
        )}

        {/* Birth Time */}
        {step === 'birthtime' && (
          <OnboardingScreen key="birthtime">
            <div className="text-center">
              <motion.h2
                className="text-2xl font-display font-semibold text-white mb-2"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                Во сколько ты родилась?
              </motion.h2>
              <motion.p
                className="text-white/80 text-sm mb-6"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Это поможет с более точными астрологическими аспектами
              </motion.p>

              <Input
                value={formData.birthTime}
                onChange={handleBirthTimeChange}
                placeholder="Например: 14:30"
                inputMode="numeric"
                maxLength={5}
              />

              <div className="mt-8 flex gap-3">
                <Button variant="ghost" onClick={() => goToStep('birthdate')} className="!text-[#C4A0A5] hover:!text-[#d4b0b5]">
                  Назад
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, birthTime: '' }))
                    goToStep('city')
                  }}
                >
                  Не знаю
                </Button>
                <Button variant="primary-fairy" className="flex-1" onClick={() => goToStep('city')}>
                  Продолжить
                </Button>
              </div>
            </div>
          </OnboardingScreen>
        )}

        {/* City */}
        {step === 'city' && (
          <OnboardingScreen key="city">
            <div className="text-center">
              <motion.h2
                className="text-2xl font-display font-semibold text-white mb-2"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                Где ты родилась?
              </motion.h2>
              <motion.p
                className="text-white/80 text-sm mb-6"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Город рождения для полной астрологической картины
              </motion.p>

              <Input
                value={formData.birthCity}
                onChange={(e) => handleInputChange('birthCity', e.target.value)}
                placeholder="Например: Москва"
              />

              <div className="mt-8 flex gap-3">
                <Button variant="ghost" onClick={() => goToStep('birthtime')} className="!text-[#C4A0A5] hover:!text-[#d4b0b5]">
                  Назад
                </Button>
                <Button variant="primary-fairy" className="flex-1" onClick={() => goToStep('relationship')}>
                  Продолжить
                </Button>
              </div>
            </div>
          </OnboardingScreen>
        )}

        {/* Relationship Status */}
        {step === 'relationship' && (
          <OnboardingScreen key="relationship">
            <div className="text-center">
              <h2
                className="text-2xl font-display font-semibold text-white mb-2"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
              >
                Какой у тебя статус отношений?
              </h2>
              <p
                className="text-white/80 text-sm mb-6"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}
              >
                Для персонализации раскладов на любовь
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'single', label: 'Свободна', emoji: '🦋' },
                  { value: 'in_relationship', label: 'В отношениях', emoji: '💕' },
                  { value: 'complicated', label: 'Всё сложно', emoji: '✨' },
                  { value: 'married', label: 'Замужем', emoji: '💍' },
                ].map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    onClick={() => {
                      handleInputChange('relationshipStatus', value)
                      hapticFeedback('selection')
                    }}
                    className={`
                      relative py-4 px-4 rounded-xl text-center transition-all duration-200
                      backdrop-blur-sm
                      ${formData.relationshipStatus === value
                        ? 'bg-[#C4A0A5]/35 border-2 border-[#C4A0A5]/70 scale-[1.02]'
                        : 'bg-[#C4A0A5]/10 border border-[#C4A0A5]/25 hover:bg-[#C4A0A5]/20 active:scale-95'
                      }
                    `}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-lg transition-transform duration-200 ${
                        formData.relationshipStatus === value ? 'scale-110' : ''
                      }`}>
                        {emoji}
                      </span>
                      <span
                        className={`text-sm font-medium transition-colors duration-200 ${
                          formData.relationshipStatus === value
                            ? 'text-white'
                            : 'text-white/80'
                        }`}
                        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                      >
                        {label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex gap-3">
                <Button variant="ghost" onClick={() => goToStep('city')} className="!text-[#C4A0A5] hover:!text-[#d4b0b5]">
                  Назад
                </Button>
                <Button
                  variant="primary-fairy"
                  className="flex-1"
                  disabled={!formData.relationshipStatus}
                  onClick={() => goToStep('gifts')}
                >
                  Продолжить
                </Button>
              </div>
            </div>
          </OnboardingScreen>
        )}

        {/* What you get - фейская тема */}
        {step === 'gifts' && (
          <OnboardingScreen key="gifts">
            <div className="text-center relative">
              {/* Розовое свечение сверху */}
              <motion.div
                className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(196,160,165,0.25) 0%, transparent 60%)',
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Летающие бабочки - левая - плавная нежная анимация */}
              <motion.img
                src="/icons/onboarding/butterfly-left.png"
                alt=""
                className="absolute w-10 h-10 pointer-events-none"
                style={{
                  left: '8%',
                  top: '8%',
                  filter: 'drop-shadow(0 2px 8px rgba(196,160,165,0.4))',
                }}
                animate={{
                  x: [0, 15, 8, 20, 12, 0],
                  y: [0, -12, -6, -18, -10, 0],
                  rotate: [-5, 8, -3, 10, 5, -5],
                  scale: [1, 1.05, 1, 1.08, 1.02, 1],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: [0.45, 0.05, 0.55, 0.95],
                }}
              />
              {/* Летающие бабочки - правая - плавная нежная анимация */}
              <motion.img
                src="/icons/onboarding/butterfly-right.png"
                alt=""
                className="absolute w-10 h-10 pointer-events-none"
                style={{
                  right: '8%',
                  top: '15%',
                  filter: 'drop-shadow(0 2px 8px rgba(196,160,165,0.4))',
                }}
                animate={{
                  x: [0, -12, -5, -18, -8, 0],
                  y: [0, -8, -15, -5, -12, 0],
                  rotate: [5, -8, 3, -10, -5, 5],
                  scale: [1, 1.08, 1.02, 1.05, 1, 1],
                }}
                transition={{
                  duration: 14,
                  repeat: Infinity,
                  ease: [0.45, 0.05, 0.55, 0.95],
                  delay: 1,
                }}
              />

              {/* Главная анимированная иконка - фея с мягким свечением */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                className="relative mb-6"
              >
                {/* Мягкое пульсирующее свечение под феей */}
                <motion.div
                  className="absolute inset-0 mx-auto w-24 h-24 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(196,160,165,0.5) 0%, transparent 70%)',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                  animate={{
                    scale: [1, 1.4, 1.2, 1.5, 1],
                    opacity: [0.4, 0.7, 0.5, 0.8, 0.4],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <motion.img
                  src="/icons/onboarding/fairy.png"
                  alt=""
                  className="w-24 h-24 mx-auto relative z-10 object-contain"
                  animate={{
                    y: [0, -10, -4, -12, -6, 0],
                    rotate: [0, 3, -2, 4, -1, 0],
                    scale: [1, 1.02, 1, 1.03, 1.01, 1],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: [0.45, 0.05, 0.55, 0.95],
                  }}
                  style={{
                    filter: 'drop-shadow(0 0 30px rgba(196,160,165,0.7)) drop-shadow(0 4px 15px rgba(0,0,0,0.3))',
                  }}
                />
              </motion.div>

              {/* Заголовок */}
              <motion.h2
                className="text-2xl font-display font-bold text-white mb-2"
                style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Волшебство ждёт тебя
              </motion.h2>

              {/* Подзаголовок */}
              <motion.p
                className="text-white/60 text-sm mb-8"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {formData.name}, твои магические возможности
              </motion.p>

              {/* Три главных элемента - без рамок, одного размера */}
              <div className="space-y-4 mb-8">
                {[
                  { icon: '/icons/onboarding/daily-card.png', title: 'Карта дня', desc: 'Твоё личное послание от Вселенной' },
                  { icon: '/icons/onboarding/question.png', title: 'Вопрос картам', desc: 'Один ответ судьбы каждый день' },
                  { icon: '/icons/onboarding/spreads.png', title: 'Расклады из 4-х карт', desc: 'Любовь · Деньги · Будущее' },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + i * 0.15 }}
                    className="flex items-center gap-4 bg-white/8 backdrop-blur-md rounded-2xl p-4 border border-[#C4A0A5]/30"
                  >
                    {/* Иконка с свечением */}
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 rounded-full bg-[#C4A0A5]/30 blur-md"
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0.4, 0.7, 0.4],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: i * 0.3,
                        }}
                      />
                      <motion.img
                        src={item.icon}
                        alt=""
                        className="w-12 h-12 object-contain relative z-10"
                        style={{
                          filter: 'drop-shadow(0 0 12px rgba(196,160,165,0.6)) drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                        }}
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 3, -3, 0],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: i * 0.5,
                        }}
                      />
                    </div>
                    <div className="text-left flex-1">
                      <p
                        className="text-white font-semibold text-sm"
                        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                      >
                        {item.title}
                      </p>
                      <p className="text-white/60 text-xs">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Бонус за серию - такого же размера как остальные */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="mb-6 flex items-center gap-4 bg-white/8 backdrop-blur-md rounded-2xl p-4 border border-[#C4A0A5]/30"
              >
                {/* Иконка с свечением */}
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-[#C4A0A5]/30 blur-md"
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.4, 0.7, 0.4],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.9,
                    }}
                  />
                  <motion.img
                    src="/icons/onboarding/streak.png"
                    alt=""
                    className="w-12 h-12 object-contain relative z-10"
                    style={{
                      filter: 'drop-shadow(0 0 12px rgba(196,160,165,0.6)) drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, -3, 3, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 1.5,
                    }}
                  />
                </div>
                <span className="text-white/90 text-sm text-left font-medium">Заходи каждый день — расклады пополняются</span>
              </motion.div>

              {/* Кнопка с эффектом свечения и анимацией */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="relative"
              >
                <motion.div
                  className="absolute inset-0 bg-[#C4A0A5]/40 rounded-2xl blur-2xl -z-10"
                  animate={{ scale: [0.9, 1.08, 0.9], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
                <motion.div
                  animate={{
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Button
                    onClick={handleComplete}
                    variant="primary-fairy"
                    className="w-full py-4 text-base font-semibold"
                  >
                    ✨ Начать волшебство
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </OnboardingScreen>
        )}
      </AnimatePresence>

      {/* Progress dots - не показываем на gifts чтобы не наслаивались на кнопку */}
      {step !== 'welcome' && step !== 'complete' && step !== 'gifts' && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
          {['name', 'birthdate', 'birthtime', 'city', 'relationship', 'gifts'].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors ${
                s === step ? 'bg-[#C4A0A5]' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Wrapper component for animation with smoother transitions
function OnboardingScreen({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
        opacity: { duration: 0.4 }
      }}
      className="min-h-screen flex items-center justify-center p-6"
    >
      <div className="w-full max-w-sm">{children}</div>
    </motion.div>
  )
}

// Отдельный компонент для шага с именем с отображением значения
function NameStepContent({
  name,
  error,
  onNameChange,
  onBack,
  onContinue,
}: {
  name: string
  error?: string
  onNameChange: (value: string) => void
  onBack: () => void
  onContinue: () => void
}) {
  const nameMeaning = useMemo(() => getNameMeaning(name), [name])

  return (
    <div className="text-center">
      <motion.h2
        className="text-2xl font-display font-semibold text-white mb-2"
        style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        Как тебя зовут?
      </motion.h2>
      <motion.p
        className="text-white/80 text-sm mb-6"
        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Так я буду обращаться к тебе в раскладах
      </motion.p>

      <Input
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Твоё имя"
        error={error}
        autoFocus
      />

      {/* Отображение значения имени */}
      <AnimatePresence mode="wait">
        {name.trim().length >= 2 && nameMeaning.meaning && (
          <motion.div
            key={name.trim().toLowerCase()}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="mt-4 p-3 rounded-xl bg-[#C4A0A5]/15 border border-[#C4A0A5]/25 backdrop-blur-sm"
          >
            <p className="text-white/90 text-sm" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
              <span className="text-[#C4A0A5]">✨</span>{' '}
              {nameMeaning.intro}{' '}
              <span className="text-white font-medium">{name.trim()}</span>
              {' — '}
              <span className="text-[#d4b8bc] italic">{nameMeaning.meaning}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 flex gap-3">
        <Button variant="ghost" onClick={onBack} className="!text-[#C4A0A5] hover:!text-[#d4b0b5]">
          Назад
        </Button>
        <Button
          variant="primary-fairy"
          className="flex-1"
          onClick={onContinue}
        >
          Продолжить
        </Button>
      </div>
    </div>
  )
}
