import { bot } from './bot.js'
import { prisma } from '../config/database.js'
import { getMoonPhase, getMoonPhaseName, getMoonEmoji } from '../utils/moonPhase.js'

/**
 * Send daily reminder to user
 */
export async function sendDailyReminder(telegramId: bigint) {
  try {
    const moonPhase = getMoonPhase(new Date())
    const moonName = getMoonPhaseName(moonPhase)
    const moonEmoji = getMoonEmoji(moonPhase)

    await bot.telegram.sendMessage(
      telegramId.toString(),
      `${moonEmoji} Доброе утро, подружка!

Сегодня ${moonName} — особенное время для гадания.

Твоя карта дня уже ждёт тебя! ✨
Узнай, что приготовила судьба на сегодня.`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔮 Получить карту дня', web_app: { url: process.env.WEBAPP_URL || '' } }],
          ],
        },
      }
    )
    return true
  } catch (error) {
    console.error('Failed to send daily reminder:', error)
    return false
  }
}

/**
 * Send streak reminder to user who might lose their streak
 */
export async function sendStreakReminder(telegramId: bigint, streakCount: number) {
  try {
    await bot.telegram.sendMessage(
      telegramId.toString(),
      `🔥 Эй, подружка!

Твой стрик: ${streakCount} дней!
Не забудь получить карту дня, чтобы не потерять свой прогресс!

До конца дня осталось совсем немного времени ⏰`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔮 Получить карту дня', web_app: { url: process.env.WEBAPP_URL || '' } }],
          ],
        },
      }
    )
    return true
  } catch (error) {
    console.error('Failed to send streak reminder:', error)
    return false
  }
}

/**
 * Send achievement notification
 */
export async function sendAchievementNotification(
  telegramId: bigint,
  achievementName: string,
  achievementIcon: string
) {
  try {
    await bot.telegram.sendMessage(
      telegramId.toString(),
      `🎉 Поздравляю!

Ты получила новое достижение:
${achievementIcon} **${achievementName}**

Продолжай в том же духе! ✨`,
      { parse_mode: 'Markdown' }
    )
    return true
  } catch (error) {
    console.error('Failed to send achievement notification:', error)
    return false
  }
}

/**
 * Send streak reward notification
 */
export async function sendStreakRewardNotification(
  telegramId: bigint,
  streakDays: number,
  rewardDescription: string
) {
  try {
    await bot.telegram.sendMessage(
      telegramId.toString(),
      `🎁 Награда за стрик!

Ты не пропускала карту дня ${streakDays} дней подряд!

Твоя награда: ${rewardDescription}

Открой приложение, чтобы использовать подарок! 🔮`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🎁 Открыть подарки', web_app: { url: `${process.env.WEBAPP_URL}/gifts` } }],
          ],
        },
      }
    )
    return true
  } catch (error) {
    console.error('Failed to send streak reward notification:', error)
    return false
  }
}

/**
 * Send morning notifications to all users who enabled them
 */
export async function sendMorningNotifications() {
  console.log('Sending morning notifications...')

  // Get all users (in production, filter by notification preferences)
  const users = await prisma.user.findMany({
    select: {
      telegramId: true,
      timezone: true,
    },
  })

  let sent = 0
  let failed = 0

  for (const user of users) {
    // Check if it's morning in user's timezone (8-10 AM)
    const now = new Date()
    // Simple timezone handling - in production use proper library
    const userHour = now.getUTCHours() // Would need proper timezone conversion

    // For now, send to everyone (in production, check timezone)
    const success = await sendDailyReminder(user.telegramId)
    if (success) {
      sent++
    } else {
      failed++
    }

    // Rate limiting - don't exceed Telegram's limits
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  console.log(`Morning notifications sent: ${sent} success, ${failed} failed`)
  return { sent, failed }
}

/**
 * Send evening streak reminders to users who haven't claimed their daily card
 */
export async function sendEveningStreakReminders() {
  console.log('Sending evening streak reminders...')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Find users with active streaks who haven't claimed today
  const users = await prisma.user.findMany({
    where: {
      streakCount: { gt: 0 },
      streakLastDate: { lt: today },
    },
    select: {
      telegramId: true,
      streakCount: true,
    },
  })

  let sent = 0
  let failed = 0

  for (const user of users) {
    const success = await sendStreakReminder(user.telegramId, user.streakCount)
    if (success) {
      sent++
    } else {
      failed++
    }

    await new Promise(resolve => setTimeout(resolve, 50))
  }

  console.log(`Streak reminders sent: ${sent} success, ${failed} failed`)
  return { sent, failed }
}
