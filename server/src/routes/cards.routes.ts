import { Router } from 'express'
import { prisma } from '../config/database.js'
import { optionalAuthMiddleware } from '../middleware/auth.middleware.js'
import { AppError } from '../middleware/error.middleware.js'

export const cardsRoutes = Router()

// Get all cards (public)
cardsRoutes.get('/', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const { arcana, suit } = req.query

    const where: any = {}
    if (arcana) where.arcana = arcana.toString().toUpperCase()
    if (suit) where.suit = suit.toString().toUpperCase()

    const cards = await prisma.card.findMany({
      where,
      orderBy: [
        { arcana: 'asc' },
        { suit: 'asc' },
        { number: 'asc' },
      ],
    })

    res.json(cards)
  } catch (error) {
    next(error)
  }
})

// Get single card
cardsRoutes.get('/:id', async (req, res, next) => {
  try {
    const card = await prisma.card.findUnique({
      where: { id: req.params.id },
    })

    if (!card) {
      throw new AppError('Card not found', 404)
    }

    res.json(card)
  } catch (error) {
    next(error)
  }
})

export default cardsRoutes
