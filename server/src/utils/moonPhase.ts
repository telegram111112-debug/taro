/**
 * Calculate moon phase for a given date
 * Returns one of: new, waxing_crescent, first_quarter, waxing_gibbous,
 *                 full, waning_gibbous, last_quarter, waning_crescent
 */
export function getMoonPhase(date: Date): string {
  // Known new moon date for reference (January 6, 2000)
  const knownNewMoon = new Date(2000, 0, 6, 18, 14, 0)

  // Lunar cycle is approximately 29.53 days
  const lunarCycle = 29.53058867

  // Calculate days since known new moon
  const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24)

  // Calculate current position in lunar cycle (0 to 29.53)
  const lunarAge = daysSinceNewMoon % lunarCycle

  // Normalize to positive
  const normalizedAge = lunarAge < 0 ? lunarAge + lunarCycle : lunarAge

  // Determine phase based on lunar age
  // Each phase is approximately 3.69 days (29.53 / 8)
  const phaseLength = lunarCycle / 8

  if (normalizedAge < phaseLength) {
    return 'new'
  } else if (normalizedAge < phaseLength * 2) {
    return 'waxing_crescent'
  } else if (normalizedAge < phaseLength * 3) {
    return 'first_quarter'
  } else if (normalizedAge < phaseLength * 4) {
    return 'waxing_gibbous'
  } else if (normalizedAge < phaseLength * 5) {
    return 'full'
  } else if (normalizedAge < phaseLength * 6) {
    return 'waning_gibbous'
  } else if (normalizedAge < phaseLength * 7) {
    return 'last_quarter'
  } else {
    return 'waning_crescent'
  }
}

/**
 * Get moon phase emoji
 */
export function getMoonEmoji(phase: string): string {
  const emojis: Record<string, string> = {
    new: '🌑',
    waxing_crescent: '🌒',
    first_quarter: '🌓',
    waxing_gibbous: '🌔',
    full: '🌕',
    waning_gibbous: '🌖',
    last_quarter: '🌗',
    waning_crescent: '🌘',
  }
  return emojis[phase] || '🌙'
}

/**
 * Get moon phase display name in Russian
 */
export function getMoonPhaseName(phase: string): string {
  const names: Record<string, string> = {
    new: 'Новолуние',
    waxing_crescent: 'Растущий серп',
    first_quarter: 'Первая четверть',
    waxing_gibbous: 'Растущая луна',
    full: 'Полнолуние',
    waning_gibbous: 'Убывающая луна',
    last_quarter: 'Последняя четверть',
    waning_crescent: 'Убывающий серп',
  }
  return names[phase] || phase
}

/**
 * Get moon phase influence description
 */
export function getMoonInfluence(phase: string): string {
  const influences: Record<string, string> = {
    new: 'Идеальное время для новых начинаний, посева намерений и планирования.',
    waxing_crescent: 'Время действий и первых шагов к цели. Энергия нарастает.',
    first_quarter: 'Время решений и преодоления препятствий. Будьте настойчивы.',
    waxing_gibbous: 'Доработайте планы и подготовьтесь к кульминации.',
    full: 'Максимальная энергия и интуиция. Время сбора урожая и завершения дел.',
    waning_gibbous: 'Время благодарности и передачи знаний. Делитесь достигнутым.',
    last_quarter: 'Отпустите старое. Освободитесь от того, что больше не служит вам.',
    waning_crescent: 'Время отдыха и медитации. Подготовьтесь к новому циклу.',
  }
  return influences[phase] || ''
}
