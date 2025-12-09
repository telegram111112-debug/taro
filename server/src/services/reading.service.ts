import { prisma } from '../config/database.js'
import { ReadingType, DeckTheme } from '@prisma/client'
import { getMoonPhase } from '../utils/moonPhase.js'
import { InterpretationService } from './interpretation.service.js'

interface SpreadPosition {
  position: number
  meaning: string
}

const SPREAD_POSITIONS: Record<string, SpreadPosition[]> = {
  LOVE: [
    { position: 1, meaning: 'Ваши чувства' },
    { position: 2, meaning: 'Чувства партнера' },
    { position: 3, meaning: 'Основа отношений' },
    { position: 4, meaning: 'Прошлое влияние' },
    { position: 5, meaning: 'Будущее отношений' },
  ],
  MONEY: [
    { position: 1, meaning: 'Текущая финансовая ситуация' },
    { position: 2, meaning: 'Препятствия' },
    { position: 3, meaning: 'Скрытые возможности' },
    { position: 4, meaning: 'Совет' },
    { position: 5, meaning: 'Результат' },
  ],
  FUTURE: [
    { position: 1, meaning: 'Прошлое' },
    { position: 2, meaning: 'Настоящее' },
    { position: 3, meaning: 'Будущее' },
    { position: 4, meaning: 'Основа ситуации' },
    { position: 5, meaning: 'Внешние влияния' },
    { position: 6, meaning: 'Надежды и страхи' },
    { position: 7, meaning: 'Итог' },
  ],
}

export class ReadingService {
  private interpretationService: InterpretationService

  constructor() {
    this.interpretationService = new InterpretationService()
  }

  async getTodaysDailyReading(userId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return prisma.reading.findFirst({
      where: {
        userId,
        type: 'DAILY',
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        cards: {
          include: { card: true },
        },
      },
    })
  }

  async createDailyReading(userId: string, deckTheme?: DeckTheme) {
    // Get random card
    const card = await this.getRandomCard([])
    const isReversed = Math.random() > 0.5

    // Get moon phase
    const moonPhase = getMoonPhase(new Date())

    // Generate interpretation
    const interpretation = await this.interpretationService.generateDailyInterpretation(
      card,
      isReversed,
      moonPhase
    )

    // Create reading
    const reading = await prisma.reading.create({
      data: {
        userId,
        type: 'DAILY',
        moonPhase,
        deckTheme: deckTheme || 'witch',
        interpretation,
        cards: {
          create: {
            cardId: card.id,
            position: 1,
            positionMeaning: 'Карта дня',
            isReversed,
          },
        },
      },
      include: {
        cards: {
          include: { card: true },
        },
      },
    })

    // Add card to user's collection
    await this.addToCollection(userId, card.id)

    return reading
  }

  async createSpreadReading(
    userId: string,
    type: 'LOVE' | 'MONEY' | 'FUTURE',
    deckTheme?: DeckTheme
  ) {
    const positions = SPREAD_POSITIONS[type]
    const usedCardIds: string[] = []

    // Get moon phase
    const moonPhase = getMoonPhase(new Date())

    // Draw cards for each position
    const cardDraws = []
    for (const pos of positions) {
      const card = await this.getRandomCard(usedCardIds)
      usedCardIds.push(card.id)

      const isReversed = Math.random() > 0.5
      cardDraws.push({
        card,
        position: pos.position,
        positionMeaning: pos.meaning,
        isReversed,
      })
    }

    // Generate interpretation
    const interpretation = await this.interpretationService.generateSpreadInterpretation(
      type,
      cardDraws,
      moonPhase
    )

    // Create reading
    const reading = await prisma.reading.create({
      data: {
        userId,
        type: type as ReadingType,
        moonPhase,
        deckTheme: deckTheme || 'witch',
        interpretation,
        cards: {
          create: cardDraws.map(draw => ({
            cardId: draw.card.id,
            position: draw.position,
            positionMeaning: draw.positionMeaning,
            isReversed: draw.isReversed,
          })),
        },
      },
      include: {
        cards: {
          include: { card: true },
        },
      },
    })

    // Add cards to collection
    for (const draw of cardDraws) {
      await this.addToCollection(userId, draw.card.id)
    }

    return reading
  }

  async addClarificationCard(readingId: string) {
    const reading = await prisma.reading.findUnique({
      where: { id: readingId },
      include: { cards: true },
    })

    if (!reading) {
      throw new Error('Reading not found')
    }

    const usedCardIds = reading.cards.map(c => c.cardId)
    const card = await this.getRandomCard(usedCardIds)
    const isReversed = Math.random() > 0.5

    const maxPosition = Math.max(...reading.cards.map(c => c.position))

    const clarification = await prisma.readingCard.create({
      data: {
        readingId,
        cardId: card.id,
        position: maxPosition + 1,
        positionMeaning: 'Уточнение',
        isReversed,
      },
      include: { card: true },
    })

    // Add to collection
    await this.addToCollection(reading.userId, card.id)

    return {
      card: clarification.card,
      isReversed: clarification.isReversed,
      position: clarification.position,
      positionMeaning: clarification.positionMeaning,
    }
  }

  private async getRandomCard(excludeIds: string[]) {
    const cards = await prisma.card.findMany({
      where: {
        id: { notIn: excludeIds },
      },
    })

    if (cards.length === 0) {
      throw new Error('No cards available')
    }

    const randomIndex = Math.floor(Math.random() * cards.length)
    return cards[randomIndex]
  }

  private async addToCollection(userId: string, cardId: string) {
    const existing = await prisma.userCard.findUnique({
      where: {
        userId_cardId: { userId, cardId },
      },
    })

    if (existing) {
      await prisma.userCard.update({
        where: { id: existing.id },
        data: {
          count: { increment: 1 },
          lastSeenAt: new Date(),
        },
      })
    } else {
      await prisma.userCard.create({
        data: {
          userId,
          cardId,
          count: 1,
        },
      })
    }
  }
}
