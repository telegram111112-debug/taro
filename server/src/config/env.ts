import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  DATABASE_URL: z.string().default('postgresql://localhost:5432/taro'),
  REDIS_URL: z.string().optional(),
  BOT_TOKEN: z.string().default(''),
  WEBAPP_URL: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().default('default-secret-change-in-production'),
  ANTHROPIC_API_KEY: z.string().default(''),
})

// Parse with defaults for development
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format())
  // In development, use defaults
  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️ Using default environment variables for development')
  }
}

export const env = parsed.success ? parsed.data : {
  NODE_ENV: 'development' as const,
  PORT: '3001',
  DATABASE_URL: 'postgresql://localhost:5432/taro',
  REDIS_URL: undefined,
  BOT_TOKEN: '',
  WEBAPP_URL: 'http://localhost:5173',
  JWT_SECRET: 'default-secret-change-in-production',
  ANTHROPIC_API_KEY: '',
}

export default env
