import { Router } from 'express'
import { prisma } from '../config/database.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { AppError } from '../middleware/error.middleware.js'
import { ReadingService } from '../services/reading.service.js'
import { StreakService } from '../services/streak.service.js'

export const readingsRoutes = Router()

readingsRoutes.use(authMiddleware)

const readingService = new ReadingService()
const streakService = new StreakService()

// Get today's daily reading
readingsRoutes.get('/daily', async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401)

    const reading = await readingService.getTodaysDailyReading(req.user.id)

    if (!reading) {
      return res.json({ hasReading: false })
    }

    res.json({
      hasReading: true,
      reading: {
        id: reading.id,
        type: reading.type,
        cards: reading.cards.map(rc => ({
          ...rc,
          card: rc.card,
        })),
        interpretation: reading.interpretation,
        feedback: reading.feedback,
        moonPhase: reading.moonPhase,
        deckTheme: reading.deckTheme,
        createdAt: reading.createdAt,
      },
    })
  } catch (error) {
    next(error)
  }
})

// Create daily reading
readingsRoutes.post('/daily', async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401)

    const { deckTheme } = req.body

    // Check if already has today's reading
    const existing = await readingService.getTodaysDailyReading(req.user.id)
    if (existing) {
      throw new AppError('Карта дня уже получена сегодня', 400)
    }

    // Create reading
    const reading = await readingService.createDailyReading(req.user.id, deckTheme)

    // Update streak
    const streak = await streakService.updateStreak(req.user.id)

    res.json({
      reading: {
        id: reading.id,
        type: reading.type,
        cards: reading.cards.map(rc => ({
          ...rc,
          card: rc.card,
        })),
        interpretation: reading.interpretation,
        moonPhase: reading.moonPhase,
        deckTheme: reading.deckTheme,
        createdAt: reading.createdAt,
      },
      streak,
    })
  } catch (error) {
    next(error)
  }
})

// Create spread reading
readingsRoutes.post('/spread', async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401)

    const { type, deckTheme, giftId } = req.body

    if (!['love', 'money', 'future'].includes(type)) {
      throw new AppError('Invalid spread type', 400)
    }

    // Check if user has gift for this type
    const giftType = `${type.toUpperCase()}_SPREAD`
    const gift = await prisma.gift.findFirst({
      where: {
        userId: req.user.id,
        type: giftType as any,
        used: false,
        ...(giftId && { id: giftId }),
      },
    })

    if (!gift) {
      throw new AppError('Нет доступных подарков для этого типа расклада', 400)
    }

    // Create reading
    const reading = await readingService.createSpreadReading(
      req.user.id,
      type.toUpperCase() as any,
      deckTheme
    )

    // Mark gift as used
    await prisma.gift.update({
      where: { id: gift.id },
      data: { used: true, usedAt: new Date() },
    })

    res.json({
      reading: {
        id: reading.id,
        type: reading.type,
        cards: reading.cards.map(rc => ({
          ...rc,
          card: rc.card,
        })),
        interpretation: reading.interpretation,
        moonPhase: reading.moonPhase,
        deckTheme: reading.deckTheme,
        createdAt: reading.createdAt,
      },
    })
  } catch (error) {
    next(error)
  }
})

// Add clarification card
readingsRoutes.post('/:id/clarify', async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401)

    const { id } = req.params

    const reading = await prisma.reading.findFirst({
      where: { id, userId: req.user.id },
      include: { cards: true },
    })

    if (!reading) {
      throw new AppError('Reading not found', 404)
    }

    // Add clarification card
    const clarification = await readingService.addClarificationCard(id)

    res.json({ clarification })
  } catch (error) {
    next(error)
  }
})

// Submit feedback
readingsRoutes.post('/:id/feedback', async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401)

    const { id } = req.params
    const { feedback } = req.body

    if (!['positive', 'negative'].includes(feedback)) {
      throw new AppError('Invalid feedback', 400)
    }

    await prisma.reading.update({
      where: { id },
      data: { feedback: feedback.toUpperCase() as any },
    })

    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

// Get readings history
readingsRoutes.get('/history', async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401)

    const limit = parseInt(req.query.limit as string) || 20
    const offset = parseInt(req.query.offset as string) || 0

    const readings = await prisma.reading.findMany({
      where: { userId: req.user.id },
      include: {
        cards: {
          include: { card: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await prisma.reading.count({
      where: { userId: req.user.id },
    })

    res.json({
      readings: readings.map(r => ({
        id: r.id,
        type: r.type,
        cards: r.cards.map(rc => ({
          card: rc.card,
          isReversed: rc.isReversed,
          position: rc.position,
          positionMeaning: rc.positionMeaning,
        })),
        interpretation: r.interpretation,
        feedback: r.feedback,
        deckTheme: r.deckTheme,
        createdAt: r.createdAt,
      })),
      total,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    next(error)
  }
})

export default readingsRoutes
