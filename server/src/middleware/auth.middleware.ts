import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { prisma } from '../config/database.js'
import { AppError } from './error.middleware.js'

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        telegramId: bigint
        name: string
      }
      telegramUser?: TelegramUser
    }
  }
}

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

export function validateInitData(initData: string): { isValid: boolean; user?: TelegramUser } {
  try {
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')

    if (!hash) return { isValid: false }

    params.delete('hash')

    // Sort params alphabetically
    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    // Create secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(process.env.BOT_TOKEN || '')
      .digest()

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')

    if (calculatedHash !== hash) {
      return { isValid: false }
    }

    // Parse user data
    const userStr = params.get('user')
    if (userStr) {
      const user = JSON.parse(userStr) as TelegramUser
      return { isValid: true, user }
    }

    return { isValid: true }
  } catch (error) {
    console.error('Init data validation error:', error)
    return { isValid: false }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const initData = req.headers['x-telegram-init-data'] as string

    if (!initData) {
      throw new AppError('Unauthorized: No init data', 401)
    }

    const { isValid, user: telegramUser } = validateInitData(initData)

    if (!isValid || !telegramUser) {
      throw new AppError('Unauthorized: Invalid init data', 401)
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramUser.id) },
    })

    if (!user) {
      // User will be created during onboarding
      req.telegramUser = telegramUser
      return next()
    }

    req.user = {
      id: user.id,
      telegramId: user.telegramId,
      name: user.name,
    }
    req.telegramUser = telegramUser

    next()
  } catch (error) {
    next(error)
  }
}

// Type for authenticated requests
export interface AuthRequest extends Request {
  user?: {
    id: string
    telegramId: bigint
    name: string
  }
  telegramUser?: TelegramUser
}

// Optional auth - doesn't throw if no auth
export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const initData = req.headers['x-telegram-init-data'] as string

    if (initData) {
      const { isValid, user: telegramUser } = validateInitData(initData)

      if (isValid && telegramUser) {
        const user = await prisma.user.findUnique({
          where: { telegramId: BigInt(telegramUser.id) },
        })

        if (user) {
          req.user = {
            id: user.id,
            telegramId: user.telegramId,
            name: user.name,
          }
        }
        req.telegramUser = telegramUser
      }
    }

    next()
  } catch (error) {
    // Continue without auth
    next()
  }
}
