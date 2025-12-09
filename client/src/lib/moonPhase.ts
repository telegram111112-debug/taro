import type { MoonPhase } from '../types'

// Calculate moon phase based on date
export function getMoonPhase(date: Date): MoonPhase {
  // Known new moon: January 6, 2000
  const knownNewMoon = new Date(2000, 0, 6, 18, 14)
  const lunarCycle = 29.53058867 // days

  const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24)
  const currentCycleDay = daysSinceNewMoon % lunarCycle

  if (currentCycleDay < 1.84566) return 'new_moon'
  if (currentCycleDay < 5.53699) return 'waxing_crescent'
  if (currentCycleDay < 9.22831) return 'first_quarter'
  if (currentCycleDay < 12.91963) return 'waxing_gibbous'
  if (currentCycleDay < 16.61096) return 'full_moon'
  if (currentCycleDay < 20.30228) return 'waning_gibbous'
  if (currentCycleDay < 23.99361) return 'last_quarter'
  if (currentCycleDay < 27.68493) return 'waning_crescent'
  return 'new_moon'
}

export function getMoonEmoji(phase: MoonPhase): string {
  const emojis: Record<MoonPhase, string> = {
    new_moon: '🌑',
    waxing_crescent: '🌒',
    first_quarter: '🌓',
    waxing_gibbous: '🌔',
    full_moon: '🌕',
    waning_gibbous: '🌖',
    last_quarter: '🌗',
    waning_crescent: '🌘',
  }
  return emojis[phase]
}

export function getMoonName(phase: MoonPhase): string {
  const names: Record<MoonPhase, string> = {
    new_moon: 'Новолуние',
    waxing_crescent: 'Растущий серп',
    first_quarter: 'Первая четверть',
    waxing_gibbous: 'Растущая луна',
    full_moon: 'Полнолуние',
    waning_gibbous: 'Убывающая луна',
    last_quarter: 'Последняя четверть',
    waning_crescent: 'Убывающий серп',
  }
  return names[phase]
}

export function getMoonMessage(phase: MoonPhase): string {
  const messages: Record<MoonPhase, string> = {
    new_moon: 'Время новых начинаний. Загадай желание и начни что-то новое.',
    waxing_crescent: 'Энергия роста. Хорошее время для планов и намерений.',
    first_quarter: 'Время действовать! Преодолевай препятствия на пути к цели.',
    waxing_gibbous: 'Почти полнолуние. Дорабатывай детали и готовься к кульминации.',
    full_moon: 'Максимальная энергия! Карты особенно точны. Время проявления.',
    waning_gibbous: 'Время благодарности. Делись тем, чему научилась.',
    last_quarter: 'Отпускай старое. Освободи место для нового.',
    waning_crescent: 'Время отдыха и восстановления. Слушай интуицию.',
  }
  return messages[phase]
}

export function isMoonPowerful(phase: MoonPhase): boolean {
  return phase === 'full_moon' || phase === 'new_moon'
}
