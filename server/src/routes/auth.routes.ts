import { Router } from 'express'
import { prisma } from '../config/database.js'
import { validateInitData, authMiddleware } from '../middleware/auth.middleware.js'
import { AppError } from '../middleware/error.middleware.js'
import { ReferralService } from '../services/referral.service.js'

// Gift types as strings (SQLite doesn't support enums)
const GiftType = {
  LOVE_SPREAD: 'LOVE_SPREAD',
  MONEY_SPREAD: 'MONEY_SPREAD',
  FUTURE_SPREAD: 'FUTURE_SPREAD',
  CLARIFICATION: 'CLARIFICATION',
} as const

const referralService = new ReferralService()

export const authRoutes = Router()

// Login / Register via Telegram
authRoutes.post('/telegram', async (req, res, next) => {
  try {
    const { initData, userData } = req.body

    if (!initData) {
      throw new AppError('Init data required', 400)
    }

    const { isValid, user: telegramUser } = validateInitData(initData)

    if (!isValid || !telegramUser) {
      throw new AppError('Invalid init data', 401)
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramUser.id) },
      include: {
        gifts: true,
        _count: {
          select: {
            readings: true,
            collection: true,
            achievements: true,
          },
        },
      },
    })

    const isNewUser = !user

    if (isNewUser && userData) {
      // Generate unique referral code
      const referralCode = ReferralService.generateReferralCode()

      // Create new user with onboarding data
      user = await prisma.user.create({
        data: {
          telegramId: BigInt(telegramUser.id),
          name: userData.name || telegramUser.first_name,
          birthDate: userData.birthDate ? new Date(userData.birthDate.split('.').reverse().join('-')) : null,
          birthTime: userData.birthTime || null,
          birthCity: userData.birthCity || null,
          zodiacSign: userData.zodiacSign || null,
          relationshipStatus: userData.relationshipStatus || null,
          deckTheme: userData.deckTheme || 'witch',
          deckPermanent: userData.deckPermanent || false,
          timezone: userData.timezone || 'Europe/Moscow',
          referralCode,
          // Create welcome gifts
          gifts: {
            create: [
              { type: GiftType.LOVE_SPREAD },
              { type: GiftType.MONEY_SPREAD },
              { type: GiftType.FUTURE_SPREAD },
            ],
          },
        },
        include: {
          gifts: true,
          _count: {
            select: {
              readings: true,
              collection: true,
              achievements: true,
            },
          },
        },
      })

      // Process referral if user came via referral link
      if (userData.referralCode) {
        await referralService.processReferral(user.id, userData.referralCode)
      }
    }

    if (!user) {
      // Return that onboarding is needed
      return res.json({
        isNewUser: true,
        telegramUser,
      })
    }

    res.json({
      isNewUser,
      user: {
        id: user.id,
        telegramId: user.telegramId.toString(),
        name: user.name,
        birthDate: user.birthDate,
        birthTime: user.birthTime,
        birthCity: user.birthCity,
        zodiacSign: user.zodiacSign,
        relationshipStatus: user.relationshipStatus,
        streakCount: user.streakCount,
        streakLastDate: user.streakLastDate,
        premiumUntil: user.premiumUntil,
        deckTheme: user.deckTheme,
        deckPermanent: user.deckPermanent,
        timezone: user.timezone,
        createdAt: user.createdAt,
        stats: user._count,
        gifts: user.gifts,
      },
    })
  } catch (error) {
    next(error)
  }
})

// Get current user
authRoutes.get('/me', authMiddleware, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401)
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        gifts: { where: { used: false } },
        _count: {
          select: {
            readings: true,
            collection: true,
            achievements: true,
          },
        },
      },
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    res.json({
      id: user.id,
      telegramId: user.telegramId.toString(),
      name: user.name,
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      birthCity: user.birthCity,
      zodiacSign: user.zodiacSign,
      relationshipStatus: user.relationshipStatus,
      streakCount: user.streakCount,
      streakLastDate: user.streakLastDate,
      premiumUntil: user.premiumUntil,
      deckTheme: user.deckTheme,
      deckPermanent: user.deckPermanent,
      timezone: user.timezone,
      referralCode: user.referralCode,
      referralCount: user.referralCount,
      createdAt: user.createdAt,
      stats: user._count,
      availableGifts: user.gifts.length,
    })
  } catch (error) {
    next(error)
  }
})

export default authRoutes
