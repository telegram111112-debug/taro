import { prisma } from '../config/database.js'

// Gift types as strings (SQLite doesn't support enums)
const GiftType = {
  LOVE_SPREAD: 'LOVE_SPREAD',
  MONEY_SPREAD: 'MONEY_SPREAD',
  FUTURE_SPREAD: 'FUTURE_SPREAD',
  CLARIFICATION: 'CLARIFICATION',
} as const

type GiftTypeValue = typeof GiftType[keyof typeof GiftType]

interface StreakReward {
  days: number
  gifts: GiftTypeValue[]
  description: string
}

const STREAK_REWARDS: StreakReward[] = [
  {
    days: 7,
    gifts: [GiftType.LOVE_SPREAD],
    description: 'Расклад на любовь',
  },
  {
    days: 14,
    gifts: [GiftType.MONEY_SPREAD],
    description: 'Расклад на деньги',
  },
  {
    days: 30,
    gifts: [GiftType.FUTURE_SPREAD, GiftType.CLARIFICATION],
    description: 'Расклад на будущее + Карта уточнения',
  },
  {
    days: 100,
    gifts: [GiftType.LOVE_SPREAD, GiftType.MONEY_SPREAD, GiftType.FUTURE_SPREAD],
    description: 'Все виды раскладов',
  },
]

export class StreakService {
  async updateStreak(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const lastStreakDate = user.streakLastDate
      ? new Date(user.streakLastDate.getFullYear(), user.streakLastDate.getMonth(), user.streakLastDate.getDate())
      : null

    let newStreakCount = user.streakCount

    if (!lastStreakDate) {
      // First reading ever
      newStreakCount = 1
    } else {
      const daysDiff = Math.floor((today.getTime() - lastStreakDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === 0) {
        // Already claimed today, no change
        return {
          count: user.streakCount,
          lastDate: user.streakLastDate,
          isNewDay: false,
          reward: null,
        }
      } else if (daysDiff === 1) {
        // Consecutive day
        newStreakCount = user.streakCount + 1
      } else {
        // Streak broken
        newStreakCount = 1
      }
    }

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        streakCount: newStreakCount,
        streakLastDate: today,
      },
    })

    // Check for streak rewards
    const reward = await this.checkAndGrantReward(userId, newStreakCount)

    return {
      count: newStreakCount,
      lastDate: today,
      isNewDay: true,
      reward,
    }
  }

  async checkAndGrantReward(userId: string, streakCount: number) {
    const reward = STREAK_REWARDS.find(r => r.days === streakCount)

    if (!reward) {
      return null
    }

    // Check if already received this reward
    const existingReward = await prisma.gift.findFirst({
      where: {
        userId,
        reason: `STREAK_${reward.days}`,
      },
    })

    if (existingReward) {
      return null
    }

    // Grant rewards
    const grantedGifts = []
    for (const giftType of reward.gifts) {
      const gift = await prisma.gift.create({
        data: {
          userId,
          type: giftType,
          reason: `STREAK_${reward.days}`,
        },
      })
      grantedGifts.push(gift)
    }

    return {
      streakDays: reward.days,
      description: reward.description,
      gifts: grantedGifts,
    }
  }

  async getStreakInfo(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        streakCount: true,
        streakLastDate: true,
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const lastStreakDate = user.streakLastDate
      ? new Date(user.streakLastDate.getFullYear(), user.streakLastDate.getMonth(), user.streakLastDate.getDate())
      : null

    let isActive = false
    let canClaimToday = true

    if (lastStreakDate) {
      const daysDiff = Math.floor((today.getTime() - lastStreakDate.getTime()) / (1000 * 60 * 60 * 24))
      isActive = daysDiff <= 1
      canClaimToday = daysDiff >= 1
    }

    // Find next reward
    const nextReward = STREAK_REWARDS.find(r => r.days > user.streakCount)
    const daysUntilReward = nextReward ? nextReward.days - user.streakCount : null

    // Get claimed rewards
    const claimedRewards = await prisma.gift.findMany({
      where: {
        userId,
        reason: { startsWith: 'STREAK_' },
      },
      select: { reason: true },
    })

    const claimedStreaks = claimedRewards.map(r => parseInt(r.reason!.replace('STREAK_', '')))

    return {
      count: user.streakCount,
      lastDate: user.streakLastDate,
      isActive,
      canClaimToday,
      nextReward: nextReward ? {
        days: nextReward.days,
        description: nextReward.description,
        daysRemaining: daysUntilReward,
      } : null,
      allRewards: STREAK_REWARDS.map(r => ({
        ...r,
        isClaimed: claimedStreaks.includes(r.days),
        isAchieved: user.streakCount >= r.days,
      })),
    }
  }
}
