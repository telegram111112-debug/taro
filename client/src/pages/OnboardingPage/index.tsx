import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '../../store/useUserStore'
import { useTelegram } from '../../providers/TelegramProvider'
import { Button, Input } from '../../components/ui'
import type { DeckTheme, RelationshipStatus } from '../../types'

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
      streakCount: 0,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      deckTheme: formData.deckTheme,
      createdAt: new Date().toISOString(),
    }

    setUser(newUser)
    setOnboarded(true)
  }

  // Используем тему fairy по умолчанию для регистрации
  const isFairyTheme = formData.deckTheme === 'fairy'

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: isFairyTheme ? 'url(/backgrounds/background-fairy.jpg)' : 'url(/backgrounds/background-witch.jpg)' }}
      />
      <div className={`fixed inset-0 -z-10 ${isFairyTheme ? 'bg-black/40' : 'bg-black/60'}`} />

      <AnimatePresence mode="wait">
        {/* Welcome */}
        {step === 'welcome' && (
          <OnboardingScreen key="welcome">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="text-6xl mb-6"
              >
                🔮
              </motion.div>
              <h1 className="text-3xl font-display font-bold text-white mb-4">
                Привет! Я Луна
              </h1>
              <p className="text-white/70 mb-2">
                Твоя персональная подруга-таролог
              </p>
              <p className="text-white/50 text-sm mb-8">
                Карты Таро — это не просто гадание.
                Это разговор с самой собой через древние символы.
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
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-display font-semibold text-white mb-2">
                  Как тебя зовут?
                </h2>
                <p className="text-white/50 text-sm mb-6">
                  Так я буду обращаться к тебе в раскладах
                </p>
              </motion.div>

              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Твоё имя"
                error={errors.name}
                autoFocus
              />

              <div className="mt-8 flex gap-3">
                <Button variant="ghost" onClick={() => goToStep('welcome')}>
                  Назад
                </Button>
                <Button
                  variant="primary-fairy"
                  className="flex-1"
                  onClick={() => {
                    if (!formData.name.trim()) {
                      setErrors({ name: 'Введи своё имя' })
                      return
                    }
                    goToStep('birthdate')
                  }}
                >
                  Продолжить
                </Button>
              </div>
            </div>
          </OnboardingScreen>
        )}

        {/* Birth Date */}
        {step === 'birthdate' && (
          <OnboardingScreen key="birthdate">
            <div>
              <h2 className="text-2xl font-display font-semibold text-white mb-2">
                {formData.name}, когда твой день рождения?
              </h2>
              <p className="text-white/50 text-sm mb-6">
                Это важно для персонализации раскладов по знаку зодиака
              </p>

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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-xl bg-[#C4A0A5]/20 border border-[#C4A0A5]/30"
                >
                  <p className="text-[#d4b0b5] text-sm">
                    ✨ {getZodiacSign(formData.birthDate)}! Отличный знак для работы с картами
                  </p>
                </motion.div>
              )}

              <div className="mt-8 flex gap-3">
                <Button variant="ghost" onClick={() => goToStep('name')}>
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
            <div>
              <h2 className="text-2xl font-display font-semibold text-white mb-2">
                Во сколько ты родилась?
              </h2>
              <p className="text-white/50 text-sm mb-6">
                Это поможет с более точными астрологическими аспектами
              </p>

              <Input
                value={formData.birthTime}
                onChange={(e) => handleInputChange('birthTime', e.target.value)}
                placeholder="Например: 14:30 или не знаю"
              />

              <div className="mt-8 flex gap-3">
                <Button variant="ghost" onClick={() => goToStep('birthdate')}>
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
            <div>
              <h2 className="text-2xl font-display font-semibold text-white mb-2">
                Где ты родилась?
              </h2>
              <p className="text-white/50 text-sm mb-6">
                Город рождения для полной астрологической картины
              </p>

              <Input
                value={formData.birthCity}
                onChange={(e) => handleInputChange('birthCity', e.target.value)}
                placeholder="Например: Москва"
              />

              <div className="mt-8 flex gap-3">
                <Button variant="ghost" onClick={() => goToStep('birthtime')}>
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
            <div>
              <h2 className="text-2xl font-display font-semibold text-white mb-2">
                Какой у тебя статус отношений?
              </h2>
              <p className="text-white/50 text-sm mb-6">
                Для персонализации раскладов на любовь
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'single', label: '💔 Свободна', emoji: '🦋' },
                  { value: 'in_relationship', label: '💕 В отношениях', emoji: '💑' },
                  { value: 'complicated', label: '🤷‍♀️ Всё сложно', emoji: '🌪️' },
                  { value: 'married', label: '💍 Замужем', emoji: '👰' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => {
                      handleInputChange('relationshipStatus', value)
                      hapticFeedback('selection')
                    }}
                    className={`
                      p-4 rounded-xl text-left transition-all
                      ${formData.relationshipStatus === value
                        ? 'bg-[#C4A0A5]/30 border-2 border-[#C4A0A5]'
                        : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                      }
                    `}
                  >
                    <span className="text-white">{label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex gap-3">
                <Button variant="ghost" onClick={() => goToStep('city')}>
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

        {/* Gifts */}
        {step === 'gifts' && (
          <OnboardingScreen key="gifts">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
                className="text-6xl mb-6"
              >
                🎁
              </motion.div>
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                {formData.name}, у меня для тебя сюрприз!
              </h2>
              <p className="text-white/70 mb-6">
                Тебе доступны 3 расширенных расклада на 4 карты:
              </p>

              <div className="space-y-3 mb-6">
                {[
                  { icon: formData.deckTheme === 'fairy' ? '/icons/spread-love-fairy.png' : '/icons/spread-love-witch.png', text: 'Расклад на отношения' },
                  { icon: formData.deckTheme === 'fairy' ? '/icons/spread-money-fairy.png' : '/icons/spread-money-witch.png', text: 'Расклад на деньги' },
                  { icon: '/icons/crystal-ball.png', text: 'Расклад на будущее' },
                ].map(({ icon, text }, i) => (
                  <motion.div
                    key={text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
                  >
                    <img src={icon} alt="" className="w-8 h-8 object-contain" />
                    <span className="text-white">{text}</span>
                    <span className="ml-auto text-gold-400 text-sm">4 карты</span>
                  </motion.div>
                ))}
              </div>

              <p className="text-white/50 text-sm mb-6">
                Каждый день тебя ждёт бесплатная карта дня, а для глубокого анализа — расклады из 4 карт в разделе «Расклады»
              </p>

              <Button onClick={handleComplete} variant="primary-fairy" className="w-full">
                Начать гадать! ✨
              </Button>
            </div>
          </OnboardingScreen>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      {step !== 'welcome' && step !== 'complete' && (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-2">
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

// Wrapper component for animation
function OnboardingScreen({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex items-center justify-center p-6"
    >
      <div className="w-full max-w-sm">{children}</div>
    </motion.div>
  )
}
