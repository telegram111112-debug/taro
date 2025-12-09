import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { errorHandler } from './middleware/error.middleware.js'
import { routes } from './routes/index.js'
import { startBotPolling, getBotWebhookCallback } from './bot/bot.js'
import { env } from './config/env.js'

const app = express()
const PORT = env.PORT || 3001
const IS_PRODUCTION = env.NODE_ENV === 'production'

// Security middleware
app.use(helmet())
app.use(cors({
  origin: env.WEBAPP_URL || '*',
  credentials: true,
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
})
app.use('/api/', limiter)

// Body parsing
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
app.use('/api', routes)

// Bot webhook (for production)
if (IS_PRODUCTION && env.BOT_TOKEN) {
  app.use('/bot', getBotWebhookCallback())
}

// Error handling
app.use(errorHandler)

// Start server
async function start() {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📡 API: http://localhost:${PORT}/api`)
    console.log(`🌍 Environment: ${env.NODE_ENV}`)
  })

  // Initialize Telegram bot
  if (env.BOT_TOKEN) {
    if (IS_PRODUCTION) {
      console.log('🤖 Bot running in webhook mode')
    } else {
      await startBotPolling()
      console.log('🤖 Bot running in polling mode')
    }
  } else {
    console.log('⚠️ BOT_TOKEN not set, bot disabled')
  }
}

start().catch(console.error)

export default app
