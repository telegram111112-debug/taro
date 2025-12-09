import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { generateTarotReading } from '../services/claude.service.js'

const router = Router()
const prisma = new PrismaClient()

// POST /api/tarot/ask - Задать вопрос картам
router.post('/ask', async (req: Request, res: Response) => {
  try {
    const { userId, question, card, isReversed } = req.body

    if (!userId || !question || !card) {
      return res.status(400).json({ error: 'Missing required fields: userId, question, card' })
    }

    // Получаем данные пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Вычисляем возраст
    let age: number | undefined
    if (user.birthDate) {
      const today = new Date()
      const birth = new Date(user.birthDate)
      age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }
    }

    // Получаем историю раскладов пользователя
    const readings = await prisma.reading.findMany({
      where: { userId },
      include: {
        cards: {
          include: {
            card: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Статистика по типам раскладов
    const readingsByType = readings.reduce((acc, r) => {
      const existing = acc.find(x => x.type === r.type)
      if (existing) {
        existing.count++
      } else {
        acc.push({ type: r.type, count: 1 })
      }
      return acc
    }, [] as { type: string; count: number }[])

    // Подсчёт фидбэка
    const positiveFeadbackCount = readings.filter(r => r.feedback === 'POSITIVE').length
    const negativeFeadbackCount = readings.filter(r => r.feedback === 'NEGATIVE').length

    // Последние расклады
    const recentReadings = readings.slice(0, 5).map(r => ({
      type: r.type,
      interpretation: r.interpretation,
      feedback: r.feedback,
      createdAt: r.createdAt,
      cards: r.cards.map(c => ({
        nameRu: c.card.nameRu,
        isReversed: c.isReversed,
      })),
    }))

    // Извлекаем предыдущие вопросы из интерпретаций (если это ASK тип)
    const previousQuestions = readings
      .filter(r => r.type === 'ASK')
      .slice(0, 10)
      .map(r => {
        // Пытаемся извлечь вопрос из интерпретации
        const match = r.interpretation.match(/Вопрос: "(.+?)"/i)
        return match ? match[1] : null
      })
      .filter(Boolean) as string[]

    // Генерируем ответ через Claude
    const response = await generateTarotReading({
      question,
      card: {
        id: card.id,
        name: card.name || card.nameEn,
        nameRu: card.nameRu,
        arcana: card.arcana,
        suit: card.suit,
        meaning: card.uprightMeaning || card.meaning,
        reversedMeaning: card.reversedMeaning,
      },
      isReversed: isReversed || false,
      userInfo: {
        name: user.name,
        age,
        zodiacSign: user.zodiacSign || undefined,
        relationshipStatus: user.relationshipStatus || undefined,
        deckTheme: (user.deckTheme as 'witch' | 'fairy') || 'witch',
        birthCity: user.birthCity || undefined,
        streakCount: user.streakCount,
      },
      userHistory: {
        totalReadings: readings.length,
        readingsByType,
        positiveFeadbackCount,
        negativeFeadbackCount,
        recentReadings,
        previousQuestions,
      },
    })

    // Сохраняем расклад в базу данных
    const cardInDb = await prisma.card.findFirst({
      where: {
        OR: [
          { slug: card.slug },
          { nameRu: card.nameRu },
          { nameEn: card.name || card.nameEn },
        ],
      },
    })

    if (cardInDb) {
      await prisma.reading.create({
        data: {
          userId,
          type: 'ASK',
          interpretation: `Вопрос: "${question}"\n\n${response.greeting}\n\n${response.cardMeaning}\n\n${response.answer}\n\n${response.advice}`,
          deckTheme: user.deckTheme,
          cards: {
            create: {
              cardId: cardInDb.id,
              position: 0,
              isReversed: isReversed || false,
              positionMeaning: response.cardMeaning,
            },
          },
        },
      })

      // Обновляем коллекцию пользователя
      await prisma.userCard.upsert({
        where: {
          userId_cardId: {
            userId,
            cardId: cardInDb.id,
          },
        },
        create: {
          userId,
          cardId: cardInDb.id,
          count: 1,
        },
        update: {
          count: { increment: 1 },
          lastSeenAt: new Date(),
        },
      })
    }

    return res.json({
      success: true,
      reading: response,
    })
  } catch (error) {
    console.error('Error in /api/tarot/ask:', error)
    return res.status(500).json({ error: 'Failed to generate tarot reading' })
  }
})

// GET /api/tarot/can-ask - Проверить, может ли пользователь задать вопрос сегодня
router.get('/can-ask/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params

    // Проверяем, задавал ли пользователь вопрос сегодня
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayReading = await prisma.reading.findFirst({
      where: {
        userId,
        type: 'ASK',
        createdAt: {
          gte: today,
        },
      },
    })

    return res.json({
      canAsk: !todayReading,
      lastAskDate: todayReading?.createdAt || null,
    })
  } catch (error) {
    console.error('Error in /api/tarot/can-ask:', error)
    return res.status(500).json({ error: 'Failed to check ask status' })
  }
})

export { router as tarotRoutes }
