import { Router } from 'express'
import { prisma } from '../config/database.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { AppError } from '../middleware/error.middleware.js'

export const achievementsRoutes = Router()

achievementsRoutes.use(authMiddleware)

// Get all achievements with user progress
achievementsRoutes.get('/', async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401)

    const allAchievements = await prisma.achievement.findMany({
      orderBy: { order: 'asc' },
    })

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: req.user.id },
      include: { achievement: true },
    })

    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId))

    // Get user stats for progress calculation
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        _count: {
          select: {
            readings: true,
            collection: true,
          },
        },
      },
    })

    if (!user) throw new AppError('User not found', 404)

    const achievements = allAchievements.map(achievement => {
      const isUnlocked = unlockedIds.has(achievement.id)
      const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id)

      // Calculate progress based on achievement type
      let progress = 0
      let target = 1

      if (achievement.code.startsWith('READINGS_')) {
        target = parseInt(achievement.code.split('_')[1]) || 1
        progress = Math.min(user._count.readings, target)
      } else if (achievement.code.startsWith('STREAK_')) {
        target = parseInt(achievement.code.split('_')[1]) || 1
        progress = Math.min(user.streakCount, target)
      } else if (achievement.code.startsWith('COLLECTION_')) {
        target = parseInt(achievement.code.split('_')[1]) || 1
        progress = Math.min(user._count.collection, target)
      } else if (isUnlocked) {
        progress = 1
        target = 1
      }

      return {
        ...achievement,
        isUnlocked,
        unlockedAt: userAchievement?.unlockedAt,
        progress,
        target,
        progressPercent: Math.round((progress / target) * 100),
      }
    })

    res.json({
      achievements,
      stats: {
        unlocked: userAchievements.length,
        total: allAchievements.length,
        percentage: Math.round((userAchievements.length / allAchievements.length) * 100),
      },
    })
  } catch (error) {
    next(error)
  }
})

// Check and unlock achievements
achievementsRoutes.post('/check', async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401)

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        _count: {
          select: {
            readings: true,
            collection: true,
          },
        },
        achievements: true,
      },
    })

    if (!user) throw new AppError('User not found', 404)

    const unlockedIds = new Set(user.achievements.map(ua => ua.achievementId))
    const allAchievements = await prisma.achievement.findMany()

    const newlyUnlocked = []

    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.id)) continue

      let shouldUnlock = false

      // Check achievement conditions
      if (achievement.code === 'FIRST_READING' && user._count.readings >= 1) {
        shouldUnlock = true
      } else if (achievement.code === 'READINGS_10' && user._count.readings >= 10) {
        shouldUnlock = true
      } else if (achievement.code === 'READINGS_50' && user._count.readings >= 50) {
        shouldUnlock = true
      } else if (achievement.code === 'READINGS_100' && user._count.readings >= 100) {
        shouldUnlock = true
      } else if (achievement.code === 'STREAK_7' && user.streakCount >= 7) {
        shouldUnlock = true
      } else if (achievement.code === 'STREAK_30' && user.streakCount >= 30) {
        shouldUnlock = true
      } else if (achievement.code === 'STREAK_100' && user.streakCount >= 100) {
        shouldUnlock = true
      } else if (achievement.code === 'COLLECTION_22' && user._count.collection >= 22) {
        shouldUnlock = true
      } else if (achievement.code === 'COLLECTION_78' && user._count.collection >= 78) {
        shouldUnlock = true
      }

      if (shouldUnlock) {
        await prisma.userAchievement.create({
          data: {
            userId: user.id,
            achievementId: achievement.id,
          },
        })
        newlyUnlocked.push(achievement)
      }
    }

    res.json({
      newlyUnlocked,
      count: newlyUnlocked.length,
    })
  } catch (error) {
    next(error)
  }
})

// Get single achievement details
achievementsRoutes.get('/:id', async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401)

    const { id } = req.params

    const achievement = await prisma.achievement.findUnique({
      where: { id },
    })

    if (!achievement) {
      throw new AppError('Achievement not found', 404)
    }

    const userAchievement = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId: req.user.id,
          achievementId: id,
        },
      },
    })

    res.json({
      ...achievement,
      isUnlocked: !!userAchievement,
      unlockedAt: userAchievement?.unlockedAt,
    })
  } catch (error) {
    next(error)
  }
})

export default achievementsRoutes
