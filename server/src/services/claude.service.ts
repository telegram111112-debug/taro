import Anthropic from '@anthropic-ai/sdk'
import { env } from '../config/env.js'

const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
})

interface ReadingHistory {
  type: string
  interpretation: string
  feedback: string | null
  createdAt: Date
  cards: {
    nameRu: string
    isReversed: boolean
  }[]
}

interface TarotReadingRequest {
  question: string
  card: {
    id: number
    name: string
    nameRu: string
    arcana: 'major' | 'minor'
    suit?: string
    meaning: string
    reversedMeaning: string
  }
  isReversed: boolean
  userInfo: {
    name?: string
    age?: number
    zodiacSign?: string
    relationshipStatus?: string
    deckTheme?: 'witch' | 'fairy'
    birthDate?: string
    birthCity?: string
    streakCount?: number
  }
  userHistory?: {
    totalReadings: number
    readingsByType: { type: string; count: number }[]
    positiveFeadbackCount: number
    negativeFeadbackCount: number
    recentReadings: ReadingHistory[]
    previousQuestions: string[]
  }
}

interface TarotReadingResponse {
  greeting: string
  cardMeaning: string
  answer: string
  advice: string
}

export async function generateTarotReading(request: TarotReadingRequest): Promise<TarotReadingResponse> {
  const { question, card, isReversed, userInfo, userHistory } = request

  const themeStyle = userInfo.deckTheme === 'fairy'
    ? 'нежной, мягкой и сказочной феи. Используй образы цветов, бабочек, звёздного света и волшебных лесов.'
    : 'мудрой и загадочной ведьмы. Используй образы луны, звёзд, ночи, свечей и древних тайн.'

  // Собираем контекст о пользователе
  const userContext = []
  if (userInfo.name) userContext.push(`Имя: ${userInfo.name}`)
  if (userInfo.age) userContext.push(`Возраст: ${userInfo.age} лет`)
  if (userInfo.zodiacSign) userContext.push(`Знак зодиака: ${userInfo.zodiacSign}`)
  if (userInfo.relationshipStatus) {
    const statusMap: Record<string, string> = {
      single: 'не в отношениях',
      dating: 'встречается с кем-то',
      relationship: 'в отношениях',
      married: 'замужем/женат',
      complicated: 'всё сложно',
    }
    userContext.push(`Статус отношений: ${statusMap[userInfo.relationshipStatus] || userInfo.relationshipStatus}`)
  }
  if (userInfo.birthCity) userContext.push(`Место рождения: ${userInfo.birthCity}`)
  if (userInfo.streakCount && userInfo.streakCount > 0) {
    userContext.push(`Серия: ${userInfo.streakCount} дней подряд в приложении`)
  }

  // Анализ истории
  const historyContext = []
  if (userHistory) {
    if (userHistory.totalReadings > 0) {
      historyContext.push(`Всего раскладов: ${userHistory.totalReadings}`)
    }

    // Какие расклады чаще выбирает
    if (userHistory.readingsByType.length > 0) {
      const favoriteType = userHistory.readingsByType.reduce((a, b) => a.count > b.count ? a : b)
      const typeNames: Record<string, string> = {
        DAILY: 'карту дня',
        LOVE: 'расклады на любовь',
        MONEY: 'расклады на деньги',
        FUTURE: 'расклады на будущее',
        ASK: 'вопросы картам',
      }
      historyContext.push(`Чаще всего выбирает: ${typeNames[favoriteType.type] || favoriteType.type} (${favoriteType.count} раз)`)
    }

    // Удовлетворённость раскладами
    const totalFeedback = userHistory.positiveFeadbackCount + userHistory.negativeFeadbackCount
    if (totalFeedback > 0) {
      const satisfactionRate = Math.round((userHistory.positiveFeadbackCount / totalFeedback) * 100)
      historyContext.push(`Удовлетворённость раскладами: ${satisfactionRate}% (${userHistory.positiveFeadbackCount} из ${totalFeedback} отметили как точные)`)
    }

    // Последние вопросы (темы, которые волнуют)
    if (userHistory.previousQuestions && userHistory.previousQuestions.length > 0) {
      historyContext.push(`Предыдущие вопросы клиента: ${userHistory.previousQuestions.slice(0, 5).join('; ')}`)
    }

    // Последние расклады
    if (userHistory.recentReadings && userHistory.recentReadings.length > 0) {
      const recentCards = userHistory.recentReadings
        .slice(0, 3)
        .map(r => `${r.type}: ${r.cards.map(c => c.nameRu + (c.isReversed ? ' (перевёрн.)' : '')).join(', ')}`)
      historyContext.push(`Последние расклады: ${recentCards.join(' | ')}`)
    }
  }

  const systemPrompt = `Ты — профессиональный таролог с 20-летним опытом. Ты даёшь глубокие, персонализированные и точные предсказания.

Твой стиль общения — стиль ${themeStyle}

ВАЖНЫЕ ПРАВИЛА:
1. Всегда обращайся к клиенту на "ты" и по имени (если известно)
2. Твои ответы должны быть тёплыми, поддерживающими, но честными
3. Не используй слово "карта" - используй "символ", "знак", "послание"
4. Давай конкретные и практичные советы
5. Учитывай весь контекст: вопрос, данные о человеке, его историю и предпочтения
6. Отвечай на русском языке
7. Будь краткой, но содержательной (каждый раздел 2-4 предложения)
8. Если видишь паттерны в вопросах или раскладах - аккуратно их упомяни

${userContext.length > 0 ? `\n📌 ДАННЫЕ О КЛИЕНТЕ:\n${userContext.join('\n')}` : ''}

${historyContext.length > 0 ? `\n📊 ИСТОРИЯ КЛИЕНТА:\n${historyContext.join('\n')}` : ''}`

  const cardPosition = isReversed ? 'перевёрнутом положении' : 'прямом положении'
  const cardMeaningText = isReversed ? card.reversedMeaning : card.meaning

  const userPrompt = `Клиент задаёт вопрос: "${question}"

Выпала карта: ${card.nameRu} (${card.name}) в ${cardPosition}
${card.arcana === 'major' ? 'Это карта Старшего Аркана — её послание особенно значимо.' : `Масть: ${card.suit}`}

Базовое значение карты: ${cardMeaningText}

Дай расклад в формате JSON:
{
  "greeting": "Короткое приветствие с именем клиента, если известно (1 предложение)",
  "cardMeaning": "Значение выпавшей карты в контексте вопроса, учитывая данные клиента (2-3 предложения)",
  "answer": "Ответ на вопрос клиента на основе карты и его жизненной ситуации (3-4 предложения)",
  "advice": "Практический совет для клиента, учитывающий его историю и предпочтения (2-3 предложения)"
}

Верни ТОЛЬКО валидный JSON без markdown-разметки.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    // Очищаем ответ от возможной markdown-разметки
    let jsonText = content.text.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7)
    }
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3)
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3)
    }
    jsonText = jsonText.trim()

    const response = JSON.parse(jsonText) as TarotReadingResponse
    return response
  } catch (error) {
    console.error('Claude API error:', error)
    // Fallback ответ
    const greeting = userInfo.name
      ? (userInfo.deckTheme === 'fairy' ? `Милая ${userInfo.name}...` : `Дорогая ${userInfo.name}...`)
      : (userInfo.deckTheme === 'fairy' ? 'Милая путница...' : 'Дорогая путница...')

    return {
      greeting,
      cardMeaning: `${card.nameRu} ${isReversed ? 'в перевёрнутом положении' : ''} говорит о переменах и важных решениях в твоей жизни.`,
      answer: 'Карты указывают на то, что ответ на твой вопрос уже внутри тебя. Прислушайся к своей интуиции и доверься потоку жизни.',
      advice: 'Дай себе время на размышления. Не торопись с выводами и действиями.',
    }
  }
}
