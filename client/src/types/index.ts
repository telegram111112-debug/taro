// User types
export interface User {
  id: string
  telegramId: number
  name: string
  avatar?: string
  birthDate?: string
  birthTime?: string
  birthCity?: string
  zodiacSign?: string
  relationshipStatus?: RelationshipStatus
  streakCount: number
  streakLastDate?: string
  premiumUntil?: string
  timezone: string
  deckTheme: DeckTheme
  deckPermanent?: boolean
  createdAt: string
}

export type RelationshipStatus = 'single' | 'in_relationship' | 'complicated' | 'married'

export type DeckTheme = 'witch' | 'fairy'

// Card types
export type Arcana = 'major' | 'minor'
export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles'

export interface Card {
  id: string
  nameRu: string
  nameEn: string
  arcana: Arcana
  suit?: Suit
  number: number
  keywords: string[]
  meaningUpright: CardMeaning
  meaningReversed: CardMeaning
  zodiacConnections: string[]
  element?: string
}

export interface CardMeaning {
  general: string
  love: string
  career: string
  advice: string
}

// Reading types
export type ReadingType = 'daily' | 'love' | 'money' | 'future' | 'clarification'

export interface Reading {
  id: string
  userId: string
  type: ReadingType
  cards: ReadingCard[]
  interpretation: Interpretation
  feedback?: 'positive' | 'negative'
  moonPhase?: string
  createdAt: string
}

export interface ReadingCard {
  id: string
  cardId: string
  card: Card
  position: number
  isReversed: boolean
  positionMeaning?: string
}

export interface Interpretation {
  greeting: string
  cardName: string
  isReversed: boolean
  mainMeaning: string
  loveMeaning: string
  careerMeaning: string
  advice: string
  zodiacSpecial?: string
  moonSpecial?: string
}

// Spread positions
export interface SpreadPosition {
  name: string
  description: string
}

// Achievement types
export interface Achievement {
  id: string
  code: string
  name: string
  description: string
  icon: string
  conditionType: string
  conditionValue: number
  unlockedAt?: string
}

// Gift types
export type GiftType = 'love_spread' | 'money_spread' | 'future_spread' | 'clarification_card'

export interface Gift {
  id: string
  type: GiftType
  used: boolean
  createdAt: string
  usedAt?: string
}

// Collection
export interface CollectionItem {
  cardId: string
  card: Card
  firstReceivedAt: string
  timesReceived: number
}

// Stats
export interface UserStats {
  totalReadings: number
  dailyReadings: number
  spreadReadings: number
  collectionCount: number
  collectionTotal: number
  streakCount: number
  streakBest: number
  achievementsCount: number
  achievementsTotal: number
  positiveReadings: number
  negativeReadings: number
}

// Moon phase
export type MoonPhase =
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent'

// Telegram types
export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  photo_url?: string
}
