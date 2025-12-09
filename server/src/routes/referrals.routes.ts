import { Router, Request, Response } from 'express'
import { ReferralService } from '../services/referral.service.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js'

const router = Router()
const referralService = new ReferralService()

// Get bot username from env
const BOT_USERNAME = process.env.BOT_USERNAME || 'TaroPodrugaBot'

// Get user's referral info
router.get('/info', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const info = await referralService.getReferralInfo(req.user.id)

    // Add referral link
    const referralLink = ReferralService.getReferralLink(BOT_USERNAME, info.referralCode)

    return res.json({
      ...info,
      referralLink,
      shareText: `🔮 Привет, подружка! Я нашла классное приложение для гаданий на Таро!\n\nПрисоединяйся — там бесплатные ежедневные расклады и красивые карты!\n\n${referralLink}`,
    })
  } catch (error) {
    console.error('Get referral info error:', error)
    return res.status(500).json({ error: 'Server error' })
  }
})

// Process referral code (called during registration)
router.post('/apply', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { referralCode } = req.body

    if (!referralCode || typeof referralCode !== 'string') {
      return res.status(400).json({ error: 'Referral code required' })
    }

    const result = await referralService.processReferral(req.user.id, referralCode.toUpperCase())

    if (result.success) {
      return res.json({
        success: true,
        message: `Ты присоединилась по приглашению ${result.referrerName}! 🎉 Держи подарок — расклад на любовь! 💕`,
        bonus: {
          type: 'LOVE_SPREAD',
          description: 'Расклад на любовь',
        },
      })
    } else {
      return res.status(400).json({
        success: false,
        error: result.error,
      })
    }
  } catch (error) {
    console.error('Apply referral error:', error)
    return res.status(500).json({ error: 'Server error' })
  }
})

// Get referral leaderboard
router.get('/leaderboard', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const leaderboard = await referralService.getLeaderboard(20)
    return res.json(leaderboard)
  } catch (error) {
    console.error('Leaderboard error:', error)
    return res.status(500).json({ error: 'Server error' })
  }
})

export default router
