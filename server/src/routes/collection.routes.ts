import { Router } from 'express'
import { prisma } from '../config/database.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { AppError } from '../middleware/error.middleware.js'

export const collectionRoutes = Router()

collectionRoutes.use(authMiddleware)

// Get user's card collection
collectionRoutes.get('/', async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401)

    const collection = await prisma.userCard.findMany({
      where: { userId: req.user.id },
      include: { card: true },
      orderBy: [
        { card: { arcana: 'asc' } },
        { card: { suit: 'asc' } },
        { card: { number: 'asc' } },
      ],
    })

    // Get all cards for showing locked ones
    const allCards = await prisma.card.findMany({
      orderBy: [
        { arcana: 'asc' },
        { suit: 'asc' },
        { number: 'asc' },
      ],
    })

    const collectedIds = new Set(collection.map(c => c.cardId))

    res.json({
      collected: collection.map(c => ({
        card: c.card,
        count: c.count,
        firstSeenAt: c.firstSeenAt,
        lastSeenAt: c.lastSeenAt,
      })),
      allCards: allCards.map(card => ({
        ...card,
        isCollected: collectedIds.has(card.id),
      })),
      stats: {
        collected: collection.length,
        total: allCards.length,
        percentage: Math.round((collection.length / allCards.length) * 100),
      },
    })
  } catch (error) {
    next(error)
  }
})

// Get single card from collection
collectionRoutes.get('/:cardId', async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401)

    const { cardId } = req.params

    const userCard = await prisma.userCard.findUnique({
      where: {
        userId_cardId: {
          userId: req.user.id,
          cardId,
        },
      },
      include: { card: true },
    })

    if (!userCard) {
      // Return card info but mark as not collected
      const card = await prisma.card.findUnique({
        where: { id: cardId },
      })

      if (!card) {
        throw new AppError('Card not found', 404)
      }

      return res.json({
        card,
        isCollected: false,
      })
    }

    res.json({
      card: userCard.card,
      isCollected: true,
      count: userCard.count,
      firstSeenAt: userCard.firstSeenAt,
      lastSeenAt: userCard.lastSeenAt,
    })
  } catch (error) {
    next(error)
  }
})

// Get collection statistics
collectionRoutes.get('/stats/overview', async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401)

    const collection = await prisma.userCard.findMany({
      where: { userId: req.user.id },
      include: { card: true },
    })

    const totalCards = await prisma.card.count()

    // Count by arcana
    const majorArcana = collection.filter(c => c.card.arcana === 'MAJOR').length
    const minorArcana = collection.filter(c => c.card.arcana === 'MINOR').length

    // Count by suit
    const suits = {
      wands: collection.filter(c => c.card.suit === 'WANDS').length,
      cups: collection.filter(c => c.card.suit === 'CUPS').length,
      swords: collection.filter(c => c.card.suit === 'SWORDS').length,
      pentacles: collection.filter(c => c.card.suit === 'PENTACLES').length,
    }

    // Most seen cards
    const mostSeen = collection
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(c => ({
        card: c.card,
        count: c.count,
      }))

    // Recently collected
    const recentlyCollected = collection
      .sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime())
      .slice(0, 5)
      .map(c => ({
        card: c.card,
        lastSeenAt: c.lastSeenAt,
      }))

    res.json({
      total: {
        collected: collection.length,
        total: totalCards,
        percentage: Math.round((collection.length / totalCards) * 100),
      },
      arcana: {
        major: { collected: majorArcana, total: 22 },
        minor: { collected: minorArcana, total: 56 },
      },
      suits,
      mostSeen,
      recentlyCollected,
    })
  } catch (error) {
    next(error)
  }
})

export default collectionRoutes
