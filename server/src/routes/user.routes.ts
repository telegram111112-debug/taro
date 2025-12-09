import { Router } from 'express'
import { prisma } from '../config/database.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { AppError } from '../middleware/error.middleware.js'

export const userRoutes = Router()

userRoutes.use(authMiddleware)

// Get user profile
userRoutes.get('/profile', async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401)

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    })

    if (!user) throw new AppError('User not found', 404)

    res.json({
      id: user.id,
      name: user.name,
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      birthCity: user.birthCity,
      zodiacSign: user.zodiacSign,
      relationshipStatus: user.relationshipStatus,
      deckTheme: user.deckTheme,
      deckPermanent: user.deckPermanent,
      timezone: user.timezone,
    })
  } catch (error) {
    next(error)
  }
})

// Update user profile
userRoutes.put('/profile', async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401)

    const { name, birthDate, birthTime, birthCity, zodiacSign, relationshipStatus, deckTheme, deckPermanent } = req.body

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(birthDate && { birthDate: new Date(birthDate) }),
        ...(birthTime !== undefined && { birthTime }),
        ...(birthCity !== undefined && { birthCity }),
        ...(zodiacSign && { zodiacSign }),
        ...(relationshipStatus && { relationshipStatus }),
        ...(deckTheme && { deckTheme }),
        ...(deckPermanent !== undefined && { deckPermanent }),
      },
    })

    res.json({ success: true, user })
  } catch (error) {
    next(error)
  }
})

// Get user stats
userRoutes.get('/stats', async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401)

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        _count: {
          select: {
            readings: true,
            collection: true,
            achievements: true,
          },
        },
        readings: {
          select: { feedback: true, type: true },
        },
      },
    })

    if (!user) throw new AppError('User not found', 404)

    const dailyReadings = user.readings.filter(r => r.type === 'DAILY').length
    const spreadReadings = user.readings.filter(r => r.type !== 'DAILY').length
    const positiveReadings = user.readings.filter(r => r.feedback === 'POSITIVE').length
    const negativeReadings = user.readings.filter(r => r.feedback === 'NEGATIVE').length

    // Get total achievements count
    const totalAchievements = await prisma.achievement.count()

    res.json({
      totalReadings: user._count.readings,
      dailyReadings,
      spreadReadings,
      collectionCount: user._count.collection,
      collectionTotal: 78,
      streakCount: user.streakCount,
      achievementsCount: user._count.achievements,
      achievementsTotal: totalAchievements,
      positiveReadings,
      negativeReadings,
    })
  } catch (error) {
    next(error)
  }
})

// Get streak info
userRoutes.get('/streak', async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401)

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        streakCount: true,
        streakLastDate: true,
      },
    })

    if (!user) throw new AppError('User not found', 404)

    // Check if streak is still active
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const lastDate = user.streakLastDate ? new Date(user.streakLastDate) : null
    lastDate?.setHours(0, 0, 0, 0)

    let isActive = false
    let canClaimToday = true

    if (lastDate) {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      isActive = lastDate.getTime() >= yesterday.getTime()
      canClaimToday = lastDate.getTime() < today.getTime()
    }

    // Calculate next reward
    const rewards = [7, 14, 30, 100]
    let nextReward = rewards.find(r => r > user.streakCount) || rewards[rewards.length - 1]
    let daysUntilReward = nextReward - user.streakCount

    res.json({
      count: user.streakCount,
      lastDate: user.streakLastDate,
      isActive,
      canClaimToday,
      nextReward,
      daysUntilReward,
    })
  } catch (error) {
    next(error)
  }
})

// Set deck theme
userRoutes.post('/deck-theme', async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401)

    const { theme, permanent } = req.body

    if (!['witch', 'fairy'].includes(theme)) {
      throw new AppError('Invalid deck theme', 400)
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        deckTheme: theme,
        deckPermanent: permanent || false,
      },
    })

    res.json({ success: true, theme, permanent })
  } catch (error) {
    next(error)
  }
})

// Set timezone
userRoutes.post('/timezone', async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401)

    const { timezone } = req.body

    await prisma.user.update({
      where: { id: req.user.id },
      data: { timezone },
    })

    res.json({ success: true, timezone })
  } catch (error) {
    next(error)
  }
})

export default userRoutes
