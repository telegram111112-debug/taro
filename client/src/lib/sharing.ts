// Утилиты для шаринга результатов раскладов

import type { Card } from '../types'

interface ShareReadingOptions {
  card: Card
  isReversed: boolean
  userName?: string
  referralLink?: string
}

// Генерация текста для шаринга карты дня
export function generateDailyCardShareText(options: ShareReadingOptions): string {
  const { card, isReversed, userName, referralLink } = options

  const cardStatus = isReversed ? ' (перевёрнутая)' : ''
  const userPart = userName ? `${userName} ` : 'Я '

  const mysticalPhrases = [
    'Вселенная шепнула мне сегодня',
    'Мой магический расклад на сегодня',
    'Звёзды приоткрыли завесу',
    'Моя карта судьбы на сегодня',
    'Таро раскрыло мне секрет дня',
  ]

  const randomPhrase = mysticalPhrases[Math.floor(Math.random() * mysticalPhrases.length)]

  let text = `✨ ${randomPhrase}!\n\n`
  text += `🔮 ${card.nameRu}${cardStatus}\n\n`
  text += `💫 ${isReversed ? card.meaningReversed.general : card.meaningUpright.general}\n\n`

  if (referralLink) {
    text += `💝 Хочешь узнать свою карту дня?\n${referralLink}`
  }

  return text
}

// Генерация текста для шаринга расклада из 4-х карт
export function generateSpreadShareText(
  spreadType: 'love' | 'money' | 'future',
  cards: Card[],
  referralLink?: string
): string {
  const spreadNames = {
    love: '💕 Расклад на любовь',
    money: '💰 Расклад на деньги',
    future: '🔮 Расклад на будущее',
  }

  let text = `✨ ${spreadNames[spreadType]}\n\n`
  text += `Мои карты:\n`

  cards.forEach((card, index) => {
    const emoji = index === 0 ? '1️⃣' : index === 1 ? '2️⃣' : '3️⃣'
    text += `${emoji} ${card.nameRu}\n`
  })

  text += `\n🌟 Попробуй и ты!\n`

  if (referralLink) {
    text += `${referralLink}`
  }

  return text
}

// Функция для шаринга в Telegram
export function shareToTelegram(text: string, url?: string): void {
  // Проверяем, доступен ли Telegram WebApp API
  const tg = (window as unknown as { Telegram?: { WebApp?: {
    openTelegramLink: (url: string) => void
    switchInlineQuery: (query: string, choose_chat_types?: string[]) => void
  }}}).Telegram?.WebApp

  // Формируем URL для шаринга
  const shareUrl = url
    ? `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
    : `https://t.me/share/url?text=${encodeURIComponent(text)}`

  if (tg?.openTelegramLink) {
    // Используем Telegram WebApp API для открытия ссылки
    tg.openTelegramLink(shareUrl)
  } else {
    // Fallback для браузера
    window.open(shareUrl, '_blank')
  }
}

// Функция для копирования в буфер обмена
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback для старых браузеров
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch {
      return false
    }
  }
}

// Генерация красивой картинки для шаринга (базовая версия)
export function generateShareImageData(card: Card, isReversed: boolean): string {
  // Возвращаем placeholder - в реальном приложении здесь была бы генерация изображения
  return `Карта дня: ${card.nameRu}${isReversed ? ' (перевёрнутая)' : ''}`
}

// Различные шаблоны сообщений для разнообразия
export const shareTemplates = {
  mystical: [
    '✨ Таро раскрыло мне тайну этого дня...',
    '🌙 Луна прошептала мне послание...',
    '🔮 Магия карт открыла мне путь...',
    '⭐ Звёзды сложились в моё предсказание...',
    '💫 Вселенная отправила мне знак...',
  ],
  playful: [
    '💖 Угадай, что мне выпало сегодня!',
    '🎴 Мой магический расклад на сегодня!',
    '✨ Посмотри, какая красота мне выпала!',
    '🌟 Вселенная балует меня!',
    '💕 Моё послание от карт!',
  ],
  inviting: [
    '💝 Хочешь узнать своё будущее?',
    '🔮 Давай погадаем вместе!',
    '✨ Присоединяйся к магии!',
    '🌙 Карты ждут тебя!',
    '💫 Узнай свою карту дня!',
  ],
}

// Получение случайного шаблона
export function getRandomTemplate(type: keyof typeof shareTemplates): string {
  const templates = shareTemplates[type]
  return templates[Math.floor(Math.random() * templates.length)]
}

// Генерация полного сообщения для шаринга
export function createShareMessage(
  card: Card,
  isReversed: boolean,
  referralLink?: string,
  style: 'mystical' | 'playful' | 'inviting' = 'mystical'
): string {
  const intro = getRandomTemplate(style)
  const cardStatus = isReversed ? ' (перевёрнутая)' : ''

  let message = `${intro}\n\n`
  message += `🔮 ${card.nameRu}${cardStatus}\n\n`

  // Короткое описание
  const meaning = isReversed
    ? card.meaningReversed.general
    : card.meaningUpright.general

  // Берём первые 100 символов для краткости
  const shortMeaning = meaning.length > 100
    ? meaning.substring(0, 97) + '...'
    : meaning

  message += `💫 ${shortMeaning}\n\n`

  if (referralLink) {
    message += `💝 Попробуй и ты!\n${referralLink}`
  }

  return message
}

// Статистика для геймификации шаринга
export interface SharingStats {
  totalShares: number
  telegramShares: number
  copyShares: number
  friendsJoined: number
}

export function getSharingStats(): SharingStats {
  const stored = localStorage.getItem('sharingStats')
  if (stored) {
    return JSON.parse(stored)
  }
  return {
    totalShares: 0,
    telegramShares: 0,
    copyShares: 0,
    friendsJoined: 0,
  }
}

export function updateSharingStats(
  type: 'telegram' | 'copy',
  friendJoined = false
): void {
  const stats = getSharingStats()
  stats.totalShares++

  if (type === 'telegram') {
    stats.telegramShares++
  } else {
    stats.copyShares++
  }

  if (friendJoined) {
    stats.friendsJoined++
  }

  localStorage.setItem('sharingStats', JSON.stringify(stats))
}
