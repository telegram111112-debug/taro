import { Router } from 'express'
import { prisma } from '../config/database.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { AppError } from '../middleware/error.middleware.js'

// Gift types as strings (SQLite doesn't support enums)
const GiftType = {
  LOVE_SPREAD: 'LOVE_SPREAD',
  MONEY_SPREAD: 'MONEY_SPREAD',
  FUTURE_SPREAD: 'FUTURE_SPREAD',
  CLARIFICATION: 'CLARIFICATION',
} as const

export const giftsRoutes = Router()

giftsRoutes.use(authMiddleware)

// Get user's gifts
giftsRoutes.get('/', async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401)

    const gifts = await prisma.gift.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    })

    const available = gifts.filter(g => !g.used)
    const used = gifts.filter(g => g.used)

    // Group available by type
    const availableByType = {
      LOVE_SPREAD: available.filter(g => g.type === 'LOVE_SPREAD').length,
      MONEY_SPREAD: available.filter(g => g.type === 'MONEY_SPREAD').length,
      FUTURE_SPREAD: available.filter(g => g.type === 'FUTURE_SPREAD').length,
      CLARIFICATION: available.filter(g => g.type === 'CLARIFICATION').length,
    }

    res.json({
      available,
      used,
      availableByType,
      totalAvailable: available.length,
      totalUsed: used.length,
    })
  } catch (error) {
    next(error)
  }
})

// Get available gifts for specific spread type
giftsRoutes.get('/for-spread/:type', async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401)

    const { type } = req.params
    const giftType = `${type.toUpperCase()}_SPREAD`

    const gifts = await prisma.gift.findMany({
      where: {
        userId: req.user.id,
        type: giftType,
        used: false,
      },
      orderBy: { createdAt: 'asc' },
    })

    res.json({
      gifts,
      count: gifts.length,
      hasAvailable: gifts.length > 0,
    })
  } catch (error) {
    next(error)
  }
})

// Claim streak reward
giftsRoutes.post('/claim-streak-reward', async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401)

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    })

    if (!user) throw new AppError('User not found', 404)

    // Define streak rewards
    const streakRewards: Record<number, string[]> = {
      7: [GiftType.LOVE_SPREAD],
      14: [GiftType.MONEY_SPREAD],
      30: [GiftType.FUTURE_SPREAD, GiftType.CLARIFICATION],
      100: [GiftType.LOVE_SPREAD, GiftType.MONEY_SPREAD, GiftType.FUTURE_SPREAD],
    }

    // Check which rewards user can claim
    const claimableRewards: { streak: number; gifts: string[] }[] = []

    for (const [streak, gifts] of Object.entries(streakRewards)) {
      const streakNum = parseInt(streak)
      if (user.streakCount >= streakNum) {
        // Check if already claimed
        const alreadyClaimed = await prisma.gift.findFirst({
          where: {
            userId: user.id,
            reason: `STREAK_${streak}`,
          },
        })

        if (!alreadyClaimed) {
          claimableRewards.push({ streak: streakNum, gifts })
        }
      }
    }

    if (claimableRewards.length === 0) {
      return res.json({
        claimed: false,
        message: 'No rewards available to claim',
        nextReward: Object.keys(streakRewards)
          .map(Number)
          .find(s => s > user.streakCount),
      })
    }

    // Claim all available rewards
    const createdGifts = []
    for (const reward of claimableRewards) {
      for (const giftType of reward.gifts) {
        const gift = await prisma.gift.create({
          data: {
            userId: user.id,
            type: giftType,
            reason: `STREAK_${reward.streak}`,
          },
        })
        createdGifts.push(gift)
      }
    }

    res.json({
      claimed: true,
      gifts: createdGifts,
      streaksRewarded: claimableRewards.map(r => r.streak),
    })
  } catch (error) {
    next(error)
  }
})

// Admin: Grant gift to user (for testing/support)
giftsRoutes.post('/grant', async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401)

    // In production, add admin check here
    const { type, reason } = req.body

    const validTypes = Object.values(GiftType)
    if (!validTypes.includes(type)) {
      throw new AppError('Invalid gift type', 400)
    }

    const gift = await prisma.gift.create({
      data: {
        userId: req.user.id,
        type,
        reason: reason || 'ADMIN_GRANT',
      },
    })

    res.json({ gift })
  } catch (error) {
    next(error)
  }
})

export default giftsRoutes
