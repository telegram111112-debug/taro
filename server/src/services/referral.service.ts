import { prisma } from '../config/database.js'
import { nanoid } from 'nanoid'

// Rewards for referrals
const REFERRAL_REWARDS = {
  1: { type: 'LOVE_SPREAD', description: 'Расклад на любовь' },
  3: { type: 'MONEY_SPREAD', description: 'Расклад на деньги' },
  5: { type: 'FUTURE_SPREAD', description: 'Расклад на будущее' },
  10: { type: 'CLARIFICATION', description: 'Карта уточнения' },
} as const

export class ReferralService {
  // Generate unique referral code for user
  static generateReferralCode(): string {
    return nanoid(8).toUpperCase()
  }

  // Get referral link for Telegram bot
  static getReferralLink(botUsername: string, referralCode: string): string {
    return `https://t.me/${botUsername}?start=ref_${referralCode}`
  }

  // Process referral when new user registers
  async processReferral(newUserId: string, referralCode: string): Promise<{
    success: boolean
    referrerName?: string
    error?: string
  }> {
    try {
      // Find referrer by code
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
      })

      if (!referrer) {
        return { success: false, error: 'Реферальный код не найден' }
      }

      // Get new user
      const newUser = await prisma.user.findUnique({
        where: { id: newUserId },
      })

      if (!newUser) {
        return { success: false, error: 'Пользователь не найден' }
      }

      // Can't refer yourself
      if (referrer.id === newUserId) {
        return { success: false, error: 'Нельзя пригласить себя' }
      }

      // Already has referrer
      if (newUser.referredById) {
        return { success: false, error: 'У тебя уже есть пригласивший' }
      }

      // Update new user with referrer
      await prisma.user.update({
        where: { id: newUserId },
        data: { referredById: referrer.id },
      })

      // Increment referrer's count
      const updatedReferrer = await prisma.user.update({
        where: { id: referrer.id },
        data: { referralCount: { increment: 1 } },
      })

      // Check and grant rewards
      await this.checkAndGrantRewards(referrer.id, updatedReferrer.referralCount)

      // Grant welcome bonus to new user
      await prisma.gift.create({
        data: {
          userId: newUserId,
          type: 'LOVE_SPREAD',
          reason: 'REFERRAL_WELCOME',
        },
      })

      return { success: true, referrerName: referrer.name }
    } catch (error) {
      console.error('Referral processing error:', error)
      return { success: false, error: 'Ошибка при обработке приглашения' }
    }
  }

  // Check milestones and grant rewards
  async checkAndGrantRewards(userId: string, referralCount: number) {
    const milestones = Object.keys(REFERRAL_REWARDS).map(Number)

    for (const milestone of milestones) {
      if (referralCount >= milestone) {
        // Check if already received this reward
        const existingReward = await prisma.gift.findFirst({
          where: {
            userId,
            reason: `REFERRAL_MILESTONE_${milestone}`,
          },
        })

        if (!existingReward) {
          const reward = REFERRAL_REWARDS[milestone as keyof typeof REFERRAL_REWARDS]
          await prisma.gift.create({
            data: {
              userId,
              type: reward.type,
              reason: `REFERRAL_MILESTONE_${milestone}`,
            },
          })
        }
      }
    }
  }

  // Get user's referral info
  async getReferralInfo(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        referrals: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        referredBy: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Calculate next reward
    const milestones = Object.keys(REFERRAL_REWARDS).map(Number).sort((a, b) => a - b)
    const nextMilestone = milestones.find(m => m > user.referralCount)
    const nextReward = nextMilestone ? REFERRAL_REWARDS[nextMilestone as keyof typeof REFERRAL_REWARDS] : null

    // Get earned rewards
    const earnedRewards = await prisma.gift.findMany({
      where: {
        userId,
        reason: { startsWith: 'REFERRAL_' },
      },
      select: {
        type: true,
        reason: true,
        createdAt: true,
        used: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return {
      referralCode: user.referralCode,
      referralCount: user.referralCount,
      referredBy: user.referredBy?.name || null,
      recentReferrals: user.referrals.map(r => ({
        name: r.name,
        joinedAt: r.createdAt,
      })),
      nextReward: nextMilestone ? {
        milestone: nextMilestone,
        remaining: nextMilestone - user.referralCount,
        reward: nextReward,
      } : null,
      earnedRewards: earnedRewards.map(r => ({
        type: r.type,
        reason: r.reason,
        used: r.used,
        earnedAt: r.createdAt,
      })),
      milestones: milestones.map(m => ({
        count: m,
        reward: REFERRAL_REWARDS[m as keyof typeof REFERRAL_REWARDS],
        achieved: user.referralCount >= m,
      })),
    }
  }

  // Get leaderboard
  async getLeaderboard(limit = 10) {
    const topReferrers = await prisma.user.findMany({
      where: {
        referralCount: { gt: 0 },
      },
      orderBy: { referralCount: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        referralCount: true,
      },
    })

    return topReferrers.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      count: user.referralCount,
    }))
  }
}
