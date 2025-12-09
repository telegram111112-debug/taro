import { Telegraf, Markup } from 'telegraf'
import { env } from '../config/env.js'

const WEBAPP_URL = env.WEBAPP_URL || 'https://your-webapp-url.com'

export const bot = new Telegraf(env.BOT_TOKEN)

// Start command
bot.start(async (ctx) => {
  const userName = ctx.from?.first_name || 'подружка'

  await ctx.reply(
    `✨ Привет, ${userName}! ✨

Добро пожаловать в мир Таро! 🔮

Я — твоя личная гадалка-подружка. Каждый день я буду открывать для тебя карту, которая поможет понять энергии дня и направит тебя по правильному пути.

🌙 *Что я умею:*
• Карта дня — узнай, что приготовила тебе судьба
• Расклады на любовь, деньги и будущее
• Коллекция карт — собери все 78 карт Таро
• Достижения и награды за постоянство

Готова узнать, что говорят звёзды? ✨`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.webApp('🔮 Открыть приложение', WEBAPP_URL)],
      ]),
    }
  )
})

// Help command
bot.help(async (ctx) => {
  await ctx.reply(
    `🔮 **Помощь по боту** 🔮

**Основные команды:**
/start — Начать работу с ботом
/daily — Получить карту дня
/help — Показать это сообщение

**Как пользоваться:**
1. Нажми кнопку "Открыть приложение"
2. Пройди небольшую анкету
3. Каждый день получай свою карту дня
4. Собирай коллекцию и достижения!

**Подсказки:**
• Карта дня доступна один раз в сутки
• За ежедневные посещения ты получаешь награды
• Собери все 78 карт в свою коллекцию

Если что-то не работает, напиши @support`,
    { parse_mode: 'Markdown' }
  )
})

// Daily card shortcut
bot.command('daily', async (ctx) => {
  await ctx.reply(
    '🌟 Хочешь узнать свою карту дня?\n\nОткрой приложение и получи персональное предсказание!',
    Markup.inlineKeyboard([
      [Markup.button.webApp('🔮 Получить карту дня', `${WEBAPP_URL}/daily`)],
    ])
  )
})

// Handle any text message
bot.on('text', async (ctx) => {
  await ctx.reply(
    '✨ Для получения предсказаний открой мини-приложение!',
    Markup.inlineKeyboard([
      [Markup.button.webApp('🔮 Открыть приложение', WEBAPP_URL)],
    ])
  )
})

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err)
  ctx.reply('Произошла ошибка. Попробуй позже или напиши @support')
})

// Initialize bot
export async function initBot() {
  try {
    // Set bot commands
    await bot.telegram.setMyCommands([
      { command: 'start', description: 'Начать работу с ботом' },
      { command: 'daily', description: 'Получить карту дня' },
      { command: 'help', description: 'Помощь' },
    ])

    // Set menu button
    await bot.telegram.setChatMenuButton({
      menuButton: {
        type: 'web_app',
        text: '🔮 Открыть',
        web_app: { url: WEBAPP_URL },
      },
    })

    console.log('Bot initialized successfully')
  } catch (error) {
    console.error('Failed to initialize bot:', error)
  }
}

// Start bot polling (for development)
export async function startBotPolling() {
  await initBot()
  await bot.launch()
  console.log('Bot started in polling mode')

  // Graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

// For webhook mode (production)
export function getBotWebhookCallback() {
  return bot.webhookCallback('/bot')
}
