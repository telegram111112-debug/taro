# ТЕХНИЧЕСКАЯ КАРТА: Tarot Mini App

## Обзор проекта

**Название:** TaroПодружка / Карты Судьбы  
**Платформа:** Telegram Mini App (TWA - Telegram Web App)  
**Тип приложения:** SPA с PWA возможностями  

---

## 1. ТЕХНОЛОГИЧЕСКИЙ СТЕК

### Frontend
| Технология | Назначение | Почему |
|------------|------------|--------|
| **React 18+** | UI фреймворк | Компонентный подход, хуки, большое сообщество |
| **TypeScript** | Типизация | Надёжность кода, автодополнение |
| **Vite** | Сборщик | Быстрая сборка, HMR, оптимизация для продакшн |
| **TailwindCSS** | Стили | Быстрая вёрстка, мобильный first |
| **Framer Motion** | Анимации | Плавные анимации карт, переходы |
| **Zustand** | State management | Простой, лёгкий, без boilerplate |
| **React Query** | Серверный стейт | Кэширование, синхронизация, оффлайн |
| **@telegram-apps/sdk** | Telegram API | Официальный SDK для Mini Apps |

### Backend
| Технология | Назначение | Почему |
|------------|------------|--------|
| **Node.js + Express** | API сервер | Простота, скорость разработки |
| **TypeScript** | Типизация | Единый язык с фронтом |
| **PostgreSQL** | База данных | Реляционная структура, надёжность |
| **Prisma** | ORM | Типобезопасность, миграции, удобство |
| **Redis** | Кэш + сессии | Быстрый доступ, стрики, лимиты |
| **node-telegram-bot-api** | Telegram Bot | Уведомления, webhooks |

### Инфраструктура
| Технология | Назначение |
|------------|------------|
| **Railway / Render** | Хостинг backend + БД |
| **Vercel** | Хостинг frontend (Mini App) |
| **Cloudflare R2** | Хранение изображений карт |
| **GitHub Actions** | CI/CD |

---

## 2. АРХИТЕКТУРА ПРИЛОЖЕНИЯ

```
┌─────────────────────────────────────────────────────────────┐
│                    TELEGRAM CLIENT                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              TELEGRAM MINI APP (TWA)                │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │              REACT SPA                       │   │   │
│  │  │                                              │   │   │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │   │   │
│  │  │  │  Pages   │ │Components│ │  Hooks   │    │   │   │
│  │  │  └──────────┘ └──────────┘ └──────────┘    │   │   │
│  │  │                                              │   │   │
│  │  │  ┌──────────────────────────────────────┐  │   │   │
│  │  │  │         Zustand Store                │  │   │   │
│  │  │  │  - user   - cards   - readings       │  │   │   │
│  │  │  └──────────────────────────────────────┘  │   │   │
│  │  │                                              │   │   │
│  │  │  ┌──────────────────────────────────────┐  │   │   │
│  │  │  │         React Query                  │  │   │   │
│  │  │  │  - API calls  - Caching  - Sync      │  │   │   │
│  │  │  └──────────────────────────────────────┘  │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND API                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 Express Server                       │   │
│  │                                                      │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐      │   │
│  │  │  Routes    │ │ Middleware │ │ Controllers│      │   │
│  │  │            │ │            │ │            │      │   │
│  │  │ /auth      │ │ auth       │ │ auth       │      │   │
│  │  │ /user      │ │ validate   │ │ user       │      │   │
│  │  │ /cards     │ │ rateLimit  │ │ cards      │      │   │
│  │  │ /readings  │ │ telegram   │ │ readings   │      │   │
│  │  └────────────┘ └────────────┘ └────────────┘      │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │              Services Layer                   │  │   │
│  │  │                                               │  │   │
│  │  │  CardService   UserService   ReadingService  │  │   │
│  │  │  AstroService  NotificationService           │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│           ┌──────────────────┼──────────────────┐          │
│           ▼                  ▼                  ▼          │
│    ┌────────────┐    ┌────────────┐    ┌────────────┐     │
│    │ PostgreSQL │    │   Redis    │    │ Cloudflare │     │
│    │            │    │            │    │    R2      │     │
│    │ - Users    │    │ - Sessions │    │            │     │
│    │ - Cards    │    │ - Streaks  │    │ - Images   │     │
│    │ - Readings │    │ - Limits   │    │            │     │
│    │ - Stats    │    │ - Cache    │    │            │     │
│    └────────────┘    └────────────┘    └────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. СТРУКТУРА БАЗЫ ДАННЫХ

### ERD (Entity Relationship Diagram)

```
┌─────────────────────┐       ┌─────────────────────┐
│       users         │       │       cards         │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)             │       │ id (PK)             │
│ telegram_id (unique)│       │ name_ru             │
│ name                │       │ name_en             │
│ birth_date          │       │ arcana (major/minor)│
│ birth_time          │       │ suit (nullable)     │
│ birth_city          │       │ number              │
│ zodiac_sign         │       │ image_url           │
│ relationship_status │       │ keywords[]          │
│ streak_count        │       │ meaning_upright     │
│ streak_last_date    │       │ meaning_reversed    │
│ premium_until       │       │ meaning_love        │
│ created_at          │       │ meaning_career      │
│ updated_at          │       │ zodiac_connections[]│
└─────────────────────┘       │ element             │
         │                    └─────────────────────┘
         │                              │
         │ 1:N                          │
         ▼                              │
┌─────────────────────┐                 │
│     readings        │                 │
├─────────────────────┤                 │
│ id (PK)             │                 │
│ user_id (FK)        │◄────────────────┘
│ type (daily/love/   │       N:M (через reading_cards)
│       money/future) │
│ cards[]             │
│ interpretation      │
│ feedback (pos/neg)  │
│ moon_phase          │
│ created_at          │
└─────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐
│   reading_cards     │
├─────────────────────┤
│ id (PK)             │
│ reading_id (FK)     │
│ card_id (FK)        │
│ position            │
│ is_reversed         │
│ position_meaning    │
└─────────────────────┘

┌─────────────────────┐       ┌─────────────────────┐
│   user_collection   │       │   achievements      │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)             │       │ id (PK)             │
│ user_id (FK)        │       │ code (unique)       │
│ card_id (FK)        │       │ name                │
│ first_received_at   │       │ description         │
│ times_received      │       │ icon                │
└─────────────────────┘       │ condition_type      │
                              │ condition_value     │
┌─────────────────────┐       └─────────────────────┘
│ user_achievements   │                │
├─────────────────────┤                │
│ id (PK)             │◄───────────────┘
│ user_id (FK)        │       N:M
│ achievement_id (FK) │
│ unlocked_at         │
└─────────────────────┘

┌─────────────────────┐
│      gifts          │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │
│ type (love_spread/  │
│       money_spread/ │
│       future_spread)│
│ used                │
│ created_at          │
│ used_at             │
└─────────────────────┘
```

### Prisma Schema

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                 String    @id @default(cuid())
  telegramId         BigInt    @unique @map("telegram_id")
  name               String
  birthDate          DateTime? @map("birth_date")
  birthTime          String?   @map("birth_time")
  birthCity          String?   @map("birth_city")
  zodiacSign         String?   @map("zodiac_sign")
  relationshipStatus String?   @map("relationship_status")
  streakCount        Int       @default(0) @map("streak_count")
  streakLastDate     DateTime? @map("streak_last_date")
  premiumUntil       DateTime? @map("premium_until")
  timezone           String    @default("Europe/Moscow")
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  readings         Reading[]
  collection       UserCollection[]
  achievements     UserAchievement[]
  gifts            Gift[]
  referrals        Referral[]        @relation("referrer")
  referredBy       Referral?         @relation("referred")

  @@map("users")
}

model Card {
  id               String   @id @default(cuid())
  nameRu           String   @map("name_ru")
  nameEn           String   @map("name_en")
  arcana           Arcana
  suit             Suit?
  number           Int
  imageUrl         String   @map("image_url")
  keywords         String[]
  meaningUpright   Json     @map("meaning_upright")
  meaningReversed  Json     @map("meaning_reversed")
  zodiacConnections String[] @map("zodiac_connections")
  element          String?

  readingCards ReadingCard[]
  collections  UserCollection[]

  @@map("cards")
}

enum Arcana {
  MAJOR
  MINOR
}

enum Suit {
  WANDS
  CUPS
  SWORDS
  PENTACLES
}

model Reading {
  id              String       @id @default(cuid())
  userId          String       @map("user_id")
  type            ReadingType
  interpretation  Json
  feedback        Feedback?
  moonPhase       String?      @map("moon_phase")
  createdAt       DateTime     @default(now()) @map("created_at")

  user   User          @relation(fields: [userId], references: [id])
  cards  ReadingCard[]

  @@map("readings")
}

enum ReadingType {
  DAILY
  LOVE
  MONEY
  FUTURE
  CLARIFICATION
}

enum Feedback {
  POSITIVE
  NEGATIVE
}

model ReadingCard {
  id              String  @id @default(cuid())
  readingId       String  @map("reading_id")
  cardId          String  @map("card_id")
  position        Int
  isReversed      Boolean @default(false) @map("is_reversed")
  positionMeaning String? @map("position_meaning")

  reading Reading @relation(fields: [readingId], references: [id])
  card    Card    @relation(fields: [cardId], references: [id])

  @@map("reading_cards")
}

model UserCollection {
  id              String   @id @default(cuid())
  userId          String   @map("user_id")
  cardId          String   @map("card_id")
  firstReceivedAt DateTime @default(now()) @map("first_received_at")
  timesReceived   Int      @default(1) @map("times_received")

  user User @relation(fields: [userId], references: [id])
  card Card @relation(fields: [cardId], references: [id])

  @@unique([userId, cardId])
  @@map("user_collection")
}

model Achievement {
  id             String @id @default(cuid())
  code           String @unique
  name           String
  description    String
  icon           String
  conditionType  String @map("condition_type")
  conditionValue Int    @map("condition_value")

  users UserAchievement[]

  @@map("achievements")
}

model UserAchievement {
  id            String   @id @default(cuid())
  userId        String   @map("user_id")
  achievementId String   @map("achievement_id")
  unlockedAt    DateTime @default(now()) @map("unlocked_at")

  user        User        @relation(fields: [userId], references: [id])
  achievement Achievement @relation(fields: [achievementId], references: [id])

  @@unique([userId, achievementId])
  @@map("user_achievements")
}

model Gift {
  id        String    @id @default(cuid())
  userId    String    @map("user_id")
  type      GiftType
  used      Boolean   @default(false)
  createdAt DateTime  @default(now()) @map("created_at")
  usedAt    DateTime? @map("used_at")

  user User @relation(fields: [userId], references: [id])

  @@map("gifts")
}

enum GiftType {
  LOVE_SPREAD
  MONEY_SPREAD
  FUTURE_SPREAD
  CLARIFICATION_CARD
}

model Referral {
  id         String   @id @default(cuid())
  referrerId String   @map("referrer_id")
  referredId String   @unique @map("referred_id")
  createdAt  DateTime @default(now()) @map("created_at")

  referrer User @relation("referrer", fields: [referrerId], references: [id])
  referred User @relation("referred", fields: [referredId], references: [id])

  @@map("referrals")
}
```

---

## 4. СТРУКТУРА FRONTEND

```
src/
├── app/
│   ├── App.tsx                 # Главный компонент
│   ├── routes.tsx              # Роутинг
│   └── providers/
│       ├── TelegramProvider.tsx
│       ├── QueryProvider.tsx
│       └── ThemeProvider.tsx
│
├── pages/
│   ├── OnboardingPage/         # Первое знакомство
│   │   ├── OnboardingPage.tsx
│   │   ├── steps/
│   │   │   ├── WelcomeStep.tsx
│   │   │   ├── NameStep.tsx
│   │   │   ├── BirthDateStep.tsx
│   │   │   ├── BirthTimeStep.tsx
│   │   │   ├── CityStep.tsx
│   │   │   ├── RelationshipStep.tsx
│   │   │   └── GiftsStep.tsx
│   │   └── hooks/useOnboarding.ts
│   │
│   ├── HomePage/               # Главная
│   │   ├── HomePage.tsx
│   │   ├── components/
│   │   │   ├── DailyCardSection.tsx
│   │   │   ├── StreakBadge.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   └── MoonPhaseWidget.tsx
│   │   └── hooks/useHome.ts
│   │
│   ├── DailyCardPage/          # Карта дня
│   │   ├── DailyCardPage.tsx
│   │   ├── components/
│   │   │   ├── CardReveal.tsx
│   │   │   ├── CardInterpretation.tsx
│   │   │   ├── FeedbackButtons.tsx
│   │   │   └── ShareButton.tsx
│   │   └── hooks/useDailyCard.ts
│   │
│   ├── SpreadPage/             # Большие расклады
│   │   ├── SpreadPage.tsx
│   │   ├── components/
│   │   │   ├── SpreadLayout.tsx
│   │   │   ├── CardPosition.tsx
│   │   │   ├── SpreadInterpretation.tsx
│   │   │   └── ClarificationCard.tsx
│   │   ├── layouts/
│   │   │   ├── LoveSpreadLayout.tsx
│   │   │   ├── MoneySpreadLayout.tsx
│   │   │   └── FutureSpreadLayout.tsx
│   │   └── hooks/useSpread.ts
│   │
│   ├── CollectionPage/         # Коллекция карт
│   │   ├── CollectionPage.tsx
│   │   ├── components/
│   │   │   ├── CardGrid.tsx
│   │   │   ├── CardDetail.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── ArcanaFilter.tsx
│   │   └── hooks/useCollection.ts
│   │
│   ├── ProfilePage/            # Профиль
│   │   ├── ProfilePage.tsx
│   │   ├── components/
│   │   │   ├── UserStats.tsx
│   │   │   ├── AchievementsList.tsx
│   │   │   ├── GiftsList.tsx
│   │   │   ├── ReadingsHistory.tsx
│   │   │   └── ReferralSection.tsx
│   │   └── hooks/useProfile.ts
│   │
│   └── GiftsPage/              # Мои подарки
│       ├── GiftsPage.tsx
│       └── components/
│           └── GiftCard.tsx
│
├── components/
│   ├── ui/                     # Базовые UI компоненты
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Input.tsx
│   │   ├── DatePicker.tsx
│   │   └── Loader.tsx
│   │
│   ├── tarot/                  # Компоненты для Таро
│   │   ├── TarotCard.tsx       # Визуальная карта
│   │   ├── CardDeck.tsx        # Колода (анимация)
│   │   ├── CardFlip.tsx        # Переворот карты
│   │   └── MoonPhase.tsx       # Фаза луны
│   │
│   └── layout/
│       ├── Navigation.tsx
│       ├── Header.tsx
│       └── SafeArea.tsx
│
├── features/
│   ├── auth/
│   │   ├── hooks/useTelegramAuth.ts
│   │   └── utils/validateInitData.ts
│   │
│   ├── cards/
│   │   ├── api/cardsApi.ts
│   │   ├── hooks/useCards.ts
│   │   └── utils/cardUtils.ts
│   │
│   ├── readings/
│   │   ├── api/readingsApi.ts
│   │   ├── hooks/useReadings.ts
│   │   └── utils/interpretationBuilder.ts
│   │
│   ├── streaks/
│   │   ├── hooks/useStreaks.ts
│   │   └── utils/streakCalculator.ts
│   │
│   └── achievements/
│       ├── hooks/useAchievements.ts
│       └── utils/achievementChecker.ts
│
├── store/
│   ├── useUserStore.ts         # Zustand store для юзера
│   ├── useCardsStore.ts        # Store для карт
│   └── useUIStore.ts           # UI состояние
│
├── lib/
│   ├── telegram.ts             # Telegram SDK обёртка
│   ├── api.ts                  # Axios instance
│   ├── zodiac.ts               # Расчёт знака зодиака
│   ├── moonPhase.ts            # Расчёт фазы луны
│   └── analytics.ts            # Аналитика
│
├── assets/
│   ├── cards/                  # Изображения карт (или ссылки)
│   ├── icons/
│   └── sounds/                 # Звуки (опционально)
│
├── styles/
│   ├── globals.css
│   └── animations.css
│
└── types/
    ├── user.ts
    ├── card.ts
    ├── reading.ts
    └── telegram.ts
```

---

## 5. СТРУКТУРА BACKEND

```
src/
├── app.ts                      # Express app setup
├── server.ts                   # Server entry point
│
├── config/
│   ├── database.ts             # Prisma client
│   ├── redis.ts                # Redis client
│   ├── telegram.ts             # Bot config
│   └── env.ts                  # Environment variables
│
├── routes/
│   ├── index.ts                # Route aggregator
│   ├── auth.routes.ts          # /api/auth
│   ├── user.routes.ts          # /api/user
│   ├── cards.routes.ts         # /api/cards
│   ├── readings.routes.ts      # /api/readings
│   ├── achievements.routes.ts  # /api/achievements
│   └── gifts.routes.ts         # /api/gifts
│
├── controllers/
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── cards.controller.ts
│   ├── readings.controller.ts
│   ├── achievements.controller.ts
│   └── gifts.controller.ts
│
├── services/
│   ├── auth.service.ts         # Telegram auth validation
│   ├── user.service.ts         # User CRUD
│   ├── cards.service.ts        # Cards logic
│   ├── reading.service.ts      # Readings generation
│   ├── interpretation.service.ts # AI/Template interpretations
│   ├── streak.service.ts       # Streak calculations
│   ├── achievement.service.ts  # Achievement checking
│   ├── notification.service.ts # Push notifications
│   ├── moon.service.ts         # Moon phase calculations
│   └── zodiac.service.ts       # Zodiac calculations
│
├── middleware/
│   ├── auth.middleware.ts      # JWT/Telegram auth
│   ├── telegram.middleware.ts  # Init data validation
│   ├── rateLimit.middleware.ts # Rate limiting
│   ├── validate.middleware.ts  # Request validation
│   └── error.middleware.ts     # Error handling
│
├── utils/
│   ├── crypto.ts               # Hash verification
│   ├── random.ts               # Card randomization
│   ├── date.ts                 # Date utilities
│   └── response.ts             # Response formatters
│
├── jobs/
│   ├── scheduler.ts            # Job scheduler (node-cron)
│   ├── streakReset.job.ts      # Daily streak check
│   ├── notifications.job.ts    # Daily notifications
│   └── cleanup.job.ts          # Old data cleanup
│
├── bot/
│   ├── bot.ts                  # Telegram bot instance
│   ├── commands/
│   │   ├── start.ts
│   │   └── help.ts
│   └── handlers/
│       └── webAppData.ts
│
├── data/
│   ├── cards.json              # 78 карт (seed data)
│   ├── achievements.json       # Достижения (seed data)
│   └── interpretations/        # Шаблоны трактовок
│       ├── daily.ts
│       ├── love.ts
│       ├── money.ts
│       └── future.ts
│
├── types/
│   ├── express.d.ts            # Express extensions
│   ├── api.ts                  # API types
│   └── telegram.ts             # Telegram types
│
└── prisma/
    ├── schema.prisma
    ├── seed.ts                 # Database seeding
    └── migrations/
```

---

## 6. API ENDPOINTS

### Authentication
```
POST   /api/auth/telegram       # Авторизация через Telegram
GET    /api/auth/me             # Текущий пользователь
```

### User
```
GET    /api/user/profile        # Профиль пользователя
PUT    /api/user/profile        # Обновление профиля
GET    /api/user/stats          # Статистика пользователя
GET    /api/user/streak         # Информация о стрике
POST   /api/user/timezone       # Установка часового пояса
```

### Cards
```
GET    /api/cards               # Все карты (справочник)
GET    /api/cards/:id           # Конкретная карта
```

### Readings
```
POST   /api/readings/daily      # Получить карту дня
GET    /api/readings/daily      # Текущая карта дня (если есть)
POST   /api/readings/spread     # Создать расклад (type: love/money/future)
POST   /api/readings/:id/clarify # Пояснительная карта
POST   /api/readings/:id/feedback # Оценка расклада
GET    /api/readings/history    # История раскладов
```

### Collection
```
GET    /api/collection          # Коллекция пользователя
GET    /api/collection/stats    # Прогресс коллекции
```

### Achievements
```
GET    /api/achievements        # Все достижения
GET    /api/achievements/my     # Достижения пользователя
```

### Gifts
```
GET    /api/gifts               # Доступные подарки
POST   /api/gifts/:id/use       # Использовать подарок
```

### Referrals
```
GET    /api/referrals           # Реферальная информация
GET    /api/referrals/link      # Получить реф-ссылку
```

---

## 7. ОСНОВНЫЕ КОМПОНЕНТЫ И ЛОГИКА

### 7.1 Авторизация через Telegram

```typescript
// services/auth.service.ts
import crypto from 'crypto';

export class AuthService {
  validateInitData(initData: string): boolean {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash');
    
    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(process.env.BOT_TOKEN!)
      .digest();
    
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    return calculatedHash === hash;
  }
  
  parseInitData(initData: string): TelegramUser {
    const params = new URLSearchParams(initData);
    const user = JSON.parse(params.get('user') || '{}');
    return user;
  }
}
```

### 7.2 Генерация расклада

```typescript
// services/reading.service.ts
export class ReadingService {
  async createDailyReading(userId: string): Promise<Reading> {
    // Проверяем, есть ли уже карта на сегодня
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existing = await prisma.reading.findFirst({
      where: {
        userId,
        type: 'DAILY',
        createdAt: { gte: today }
      }
    });
    
    if (existing) {
      throw new Error('DAILY_CARD_ALREADY_DRAWN');
    }
    
    // Получаем вчерашнюю карту (чтобы не повторяться)
    const yesterdayCard = await this.getYesterdayCard(userId);
    
    // Выбираем случайную карту
    const card = await this.getRandomCard(yesterdayCard?.cardId);
    const isReversed = Math.random() < 0.3; // 30% шанс перевёрнутой
    
    // Получаем данные пользователя для персонализации
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    // Генерируем интерпретацию
    const interpretation = await this.interpretationService.generate({
      card,
      isReversed,
      type: 'DAILY',
      user,
      moonPhase: this.moonService.getCurrentPhase(),
    });
    
    // Создаём запись
    const reading = await prisma.reading.create({
      data: {
        userId,
        type: 'DAILY',
        interpretation,
        moonPhase: this.moonService.getCurrentPhase(),
        cards: {
          create: {
            cardId: card.id,
            position: 1,
            isReversed,
          }
        }
      },
      include: { cards: { include: { card: true } } }
    });
    
    // Обновляем коллекцию
    await this.updateCollection(userId, card.id);
    
    // Обновляем стрик
    await this.streakService.updateStreak(userId);
    
    // Проверяем достижения
    await this.achievementService.check(userId);
    
    return reading;
  }
  
  async createSpread(userId: string, type: SpreadType): Promise<Reading> {
    // Проверяем наличие подарка для данного типа расклада
    const gift = await this.giftService.checkGift(userId, type);
    
    if (!gift) {
      throw new Error('NO_GIFT_AVAILABLE');
    }
    
    const positions = this.getSpreadPositions(type);
    const cards = await this.getRandomCards(positions.length);
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    const interpretation = await this.interpretationService.generateSpread({
      cards,
      positions,
      type,
      user,
      moonPhase: this.moonService.getCurrentPhase(),
    });
    
    const reading = await prisma.reading.create({
      data: {
        userId,
        type,
        interpretation,
        moonPhase: this.moonService.getCurrentPhase(),
        cards: {
          create: cards.map((card, index) => ({
            cardId: card.id,
            position: index + 1,
            isReversed: Math.random() < 0.3,
            positionMeaning: positions[index].name,
          }))
        }
      },
      include: { cards: { include: { card: true } } }
    });
    
    // Отмечаем подарок использованным
    await this.giftService.useGift(gift.id);
    
    // Обновляем коллекцию
    for (const card of cards) {
      await this.updateCollection(userId, card.id);
    }
    
    return reading;
  }
  
  private getSpreadPositions(type: SpreadType): Position[] {
    switch (type) {
      case 'LOVE':
        return [
          { name: 'Ты сейчас', description: 'Как ты себя чувствуешь в отношениях' },
          { name: 'Он/Она', description: 'Что чувствует/думает партнёр' },
          { name: 'Препятствие', description: 'Что мешает гармонии' },
          { name: 'Будущее', description: 'К чему всё идёт' },
        ];
      case 'MONEY':
        return [
          { name: 'Текущее состояние', description: 'Где ты сейчас финансово' },
          { name: 'Скрытые возможности', description: 'Что ты упускаешь' },
          { name: 'Препятствия', description: 'Что мешает достатку' },
          { name: 'Результат', description: 'К чему приведут действия' },
        ];
      case 'FUTURE':
        return [
          { name: 'Прошлое', description: 'Что влияет на будущее' },
          { name: 'Настоящее', description: 'Точка силы' },
          { name: 'Ближайшее будущее', description: '1-3 месяца' },
          { name: 'Далёкое будущее', description: '6-12 месяцев' },
        ];
    }
  }
}
```

### 7.3 Система стриков

```typescript
// services/streak.service.ts
export class StreakService {
  async updateStreak(userId: string): Promise<StreakInfo> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let newStreakCount: number;
    
    if (!user.streakLastDate) {
      // Первый раз
      newStreakCount = 1;
    } else {
      const lastDate = new Date(user.streakLastDate);
      lastDate.setHours(0, 0, 0, 0);
      
      if (lastDate.getTime() === today.getTime()) {
        // Уже получал сегодня
        return { count: user.streakCount, lastDate: user.streakLastDate };
      } else if (lastDate.getTime() === yesterday.getTime()) {
        // Продолжаем стрик
        newStreakCount = user.streakCount + 1;
      } else {
        // Стрик сброшен
        newStreakCount = 1;
      }
    }
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        streakCount: newStreakCount,
        streakLastDate: today,
      }
    });
    
    // Проверяем награды за стрик
    await this.checkStreakRewards(userId, newStreakCount);
    
    return { count: newStreakCount, lastDate: today };
  }
  
  private async checkStreakRewards(userId: string, streak: number) {
    const rewards: Record<number, GiftType> = {
      7: 'CLARIFICATION_CARD',
      14: 'CLARIFICATION_CARD',
      30: 'LOVE_SPREAD', // Особый расклад
    };
    
    const reward = rewards[streak];
    if (reward) {
      await prisma.gift.create({
        data: { userId, type: reward }
      });
      
      // Отправляем уведомление
      await this.notificationService.send(userId, {
        type: 'STREAK_REWARD',
        data: { streak, reward }
      });
    }
  }
}
```

### 7.4 Генерация интерпретаций

```typescript
// services/interpretation.service.ts
export class InterpretationService {
  async generate(params: InterpretationParams): Promise<Interpretation> {
    const { card, isReversed, type, user, moonPhase } = params;
    
    const meaning = isReversed ? card.meaningReversed : card.meaningUpright;
    const zodiacBonus = this.getZodiacBonus(card, user.zodiacSign);
    const moonBonus = this.getMoonBonus(card, moonPhase);
    const relationshipContext = this.getRelationshipContext(
      meaning, 
      user.relationshipStatus
    );
    
    // Персонализированная трактовка
    return {
      greeting: this.getGreeting(user.name),
      cardName: card.nameRu,
      isReversed,
      mainMeaning: this.personalizeText(meaning.general, user),
      loveMeaning: relationshipContext,
      careerMeaning: meaning.career,
      advice: meaning.advice,
      zodiacSpecial: zodiacBonus,
      moonSpecial: moonBonus,
      timeOfDay: this.getTimeOfDayAdvice(),
    };
  }
  
  private getGreeting(name: string): string {
    const greetings = [
      `${name}, сегодня вселенная отправила тебе особое послание...`,
      `Девочка моя, ${name}, смотри что тебе выпало!`,
      `${name}! Карты сегодня говорят о тебе много интересного...`,
      `Ну что, ${name}, давай посмотрим что там вселенная приготовила?`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  private getZodiacBonus(card: Card, zodiacSign: string): string | null {
    if (card.zodiacConnections.includes(zodiacSign)) {
      return `Эта карта особенно резонирует с твоим знаком ${zodiacSign}! Её послание сейчас особенно важно для тебя.`;
    }
    
    // Дополнительные связи по стихиям
    const zodiacElements: Record<string, string> = {
      'Овен': 'Огонь', 'Лев': 'Огонь', 'Стрелец': 'Огонь',
      'Телец': 'Земля', 'Дева': 'Земля', 'Козерог': 'Земля',
      'Близнецы': 'Воздух', 'Весы': 'Воздух', 'Водолей': 'Воздух',
      'Рак': 'Вода', 'Скорпион': 'Вода', 'Рыбы': 'Вода',
    };
    
    if (card.element === zodiacElements[zodiacSign]) {
      return `Твоя стихия ${card.element} усиливает энергию этой карты сегодня.`;
    }
    
    return null;
  }
  
  private getMoonBonus(card: Card, moonPhase: string): string {
    const moonMessages: Record<string, string> = {
      'new_moon': 'В новолуние эта карта говорит о новых начинаниях...',
      'waxing_crescent': 'Растущая луна усиливает энергию роста...',
      'first_quarter': 'Луна в первой четверти - время действовать...',
      'waxing_gibbous': 'Почти полнолуние - энергия на максимуме...',
      'full_moon': 'В полнолуние карты говорят особенно ясно...',
      'waning_gibbous': 'Убывающая луна - время отпускать...',
      'last_quarter': 'Последняя четверть - завершение циклов...',
      'waning_crescent': 'Тёмная луна - время для внутренней работы...',
    };
    
    return moonMessages[moonPhase] || '';
  }
}
```

---

## 8. TELEGRAM MINI APP ИНТЕГРАЦИЯ

### 8.1 Инициализация SDK

```typescript
// lib/telegram.ts
import { init, miniApp, themeParams, viewport, backButton } from '@telegram-apps/sdk';

export async function initTelegramApp() {
  // Инициализация SDK
  await init();
  
  // Расширяем viewport
  if (viewport.mount.isAvailable()) {
    await viewport.mount();
    viewport.expand();
  }
  
  // Применяем тему Telegram
  if (themeParams.mount.isAvailable()) {
    themeParams.mount();
  }
  
  // Настраиваем кнопку "Назад"
  if (backButton.mount.isAvailable()) {
    backButton.mount();
  }
  
  // Сообщаем Telegram что приложение готово
  if (miniApp.ready.isAvailable()) {
    miniApp.ready();
  }
}

export function getTelegramInitData(): string {
  return window.Telegram?.WebApp?.initData || '';
}

export function getTelegramUser(): TelegramUser | null {
  return window.Telegram?.WebApp?.initDataUnsafe?.user || null;
}

export function hapticFeedback(type: 'impact' | 'notification' | 'selection') {
  window.Telegram?.WebApp?.HapticFeedback?.[type]?.();
}

export function showMainButton(text: string, onClick: () => void) {
  const btn = window.Telegram?.WebApp?.MainButton;
  if (btn) {
    btn.setText(text);
    btn.onClick(onClick);
    btn.show();
  }
}

export function hideMainButton() {
  window.Telegram?.WebApp?.MainButton?.hide();
}
```

### 8.2 Telegram Provider

```tsx
// app/providers/TelegramProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { initTelegramApp, getTelegramUser } from '@/lib/telegram';

interface TelegramContextValue {
  user: TelegramUser | null;
  isReady: boolean;
  colorScheme: 'light' | 'dark';
}

const TelegramContext = createContext<TelegramContextValue | null>(null);

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('dark');
  
  useEffect(() => {
    initTelegramApp().then(() => {
      setUser(getTelegramUser());
      setColorScheme(window.Telegram?.WebApp?.colorScheme || 'dark');
      setIsReady(true);
    });
  }, []);
  
  if (!isReady) {
    return <LoadingScreen />;
  }
  
  return (
    <TelegramContext.Provider value={{ user, isReady, colorScheme }}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider');
  }
  return context;
}
```

---

## 9. АНИМАЦИИ И UX

### 9.1 Анимация переворота карты

```tsx
// components/tarot/CardFlip.tsx
import { motion, AnimatePresence } from 'framer-motion';

interface CardFlipProps {
  card: Card;
  isRevealed: boolean;
  isReversed: boolean;
  onReveal: () => void;
}

export function CardFlip({ card, isRevealed, isReversed, onReveal }: CardFlipProps) {
  return (
    <div className="perspective-1000">
      <motion.div
        className="relative w-48 h-72 cursor-pointer"
        onClick={onReveal}
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Рубашка карты */}
        <motion.div
          className="absolute inset-0 backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <img 
            src="/cards/back.jpg" 
            alt="Card back"
            className="w-full h-full object-cover rounded-xl shadow-xl"
          />
        </motion.div>
        
        {/* Лицевая сторона */}
        <motion.div
          className="absolute inset-0"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <img 
            src={card.imageUrl} 
            alt={card.nameRu}
            className={`w-full h-full object-cover rounded-xl shadow-xl ${
              isReversed ? 'rotate-180' : ''
            }`}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
```

### 9.2 Анимация перемешивания колоды

```tsx
// components/tarot/CardDeck.tsx
import { motion } from 'framer-motion';

interface CardDeckProps {
  isShuffling: boolean;
  onShuffleComplete: () => void;
}

export function CardDeck({ isShuffling, onShuffleComplete }: CardDeckProps) {
  const cards = Array.from({ length: 7 }); // Визуальные карты для анимации
  
  return (
    <div className="relative w-48 h-72">
      <AnimatePresence>
        {cards.map((_, index) => (
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ x: 0, y: 0, rotate: 0 }}
            animate={isShuffling ? {
              x: [0, (index - 3) * 30, 0],
              y: [0, -20, 0],
              rotate: [0, (index - 3) * 5, 0],
            } : {}}
            transition={{
              duration: 0.5,
              repeat: isShuffling ? 3 : 0,
              delay: index * 0.05,
              onComplete: index === cards.length - 1 ? onShuffleComplete : undefined,
            }}
            style={{ zIndex: index }}
          >
            <img 
              src="/cards/back.jpg" 
              alt="Card"
              className="w-full h-full object-cover rounded-xl shadow-lg"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

---

## 10. ПЛАН РЕАЛИЗАЦИИ (ФАЗЫ)

### Фаза 1: MVP (2-3 недели)

**Неделя 1: Инфраструктура**
- [ ] Настройка проекта (Vite + React + TypeScript)
- [ ] Настройка backend (Express + Prisma + PostgreSQL)
- [ ] Интеграция Telegram Mini App SDK
- [ ] Авторизация через Telegram
- [ ] База данных: схема + миграции + seed карт

**Неделя 2: Основной функционал**
- [ ] Онбординг (сбор данных пользователя)
- [ ] Карта дня: логика + UI
- [ ] Базовая персонализация трактовок
- [ ] Коллекция карт (простая версия)
- [ ] Система стриков

**Неделя 3: Расклады + Polish**
- [ ] Большие расклады (3 типа)
- [ ] Система подарков
- [ ] Анимации карт
- [ ] Тестирование + багфикс
- [ ] Деплой MVP

### Фаза 2: Вовлечение (2 недели)

- [ ] Достижения (полная система)
- [ ] Лунный календарь интеграция
- [ ] Push-уведомления (напоминания о стрике)
- [ ] Пояснительные карты
- [ ] История раскладов
- [ ] Шеринг в соцсети (генерация картинок)

### Фаза 3: Рост (2 недели)

- [ ] Реферальная программа
- [ ] Расширенная персонализация (астрология)
- [ ] Особые расклады (Кельтский крест)
- [ ] Аналитика и A/B тесты
- [ ] Оптимизация производительности

### Фаза 4: Монетизация (1-2 недели)

- [ ] Telegram Stars интеграция
- [ ] Премиум-подписка
- [ ] Дополнительные расклады за оплату
- [ ] Особые колоды визуализации

---

## 11. ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ

### Frontend (.env)
```env
VITE_API_URL=https://api.tarobot.example.com
VITE_BOT_USERNAME=TaroBotUsername
```

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tarobot

# Redis
REDIS_URL=redis://localhost:6379

# Telegram
BOT_TOKEN=your_bot_token_here
WEBAPP_URL=https://tarobot.example.com

# Security
JWT_SECRET=your_jwt_secret_here

# External APIs (optional)
OPENAI_API_KEY=for_advanced_interpretations
```

---

## 12. ПОЛЕЗНЫЕ ССЫЛКИ

- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [Telegram Apps SDK](https://docs.telegram-mini-apps.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [TailwindCSS](https://tailwindcss.com/docs)

---

## 13. ЧЕКЛИСТ БЕЗОПАСНОСТИ

- [ ] Валидация initData на бэкенде (HMAC-SHA256)
- [ ] Rate limiting на все эндпоинты
- [ ] Санитизация пользовательского ввода
- [ ] HTTPS только
- [ ] CORS настроен правильно
- [ ] Переменные окружения не в коде
- [ ] SQL injection защита (Prisma)
- [ ] XSS защита (React по умолчанию)

---

*Документ создан для проекта TaroBot*  
*Версия 1.0*
