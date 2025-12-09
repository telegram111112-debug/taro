// Эмодзи для каждого знака зодиака
export const zodiacEmojis: Record<string, string> = {
  // Русские названия
  'Овен': '♈',
  'Телец': '♉',
  'Близнецы': '♊',
  'Рак': '♋',
  'Лев': '♌',
  'Дева': '♍',
  'Весы': '♎',
  'Скорпион': '♏',
  'Стрелец': '♐',
  'Козерог': '♑',
  'Водолей': '♒',
  'Рыбы': '♓',
  // Английские названия (на случай если используются)
  'Aries': '♈',
  'Taurus': '♉',
  'Gemini': '♊',
  'Cancer': '♋',
  'Leo': '♌',
  'Virgo': '♍',
  'Libra': '♎',
  'Scorpio': '♏',
  'Sagittarius': '♐',
  'Capricorn': '♑',
  'Aquarius': '♒',
  'Pisces': '♓',
}

// Получить эмодзи по названию знака
export function getZodiacEmoji(zodiacSign: string | undefined): string {
  if (!zodiacSign) return '✨'
  return zodiacEmojis[zodiacSign] || '✨'
}

// Дополнительные характеристики знаков (для будущего использования)
export const zodiacInfo: Record<string, { element: string; emoji: string; elementEmoji: string }> = {
  'Овен': { element: 'Огонь', emoji: '♈', elementEmoji: '🔥' },
  'Телец': { element: 'Земля', emoji: '♉', elementEmoji: '🌍' },
  'Близнецы': { element: 'Воздух', emoji: '♊', elementEmoji: '💨' },
  'Рак': { element: 'Вода', emoji: '♋', elementEmoji: '💧' },
  'Лев': { element: 'Огонь', emoji: '♌', elementEmoji: '🔥' },
  'Дева': { element: 'Земля', emoji: '♍', elementEmoji: '🌍' },
  'Весы': { element: 'Воздух', emoji: '♎', elementEmoji: '💨' },
  'Скорпион': { element: 'Вода', emoji: '♏', elementEmoji: '💧' },
  'Стрелец': { element: 'Огонь', emoji: '♐', elementEmoji: '🔥' },
  'Козерог': { element: 'Земля', emoji: '♑', elementEmoji: '🌍' },
  'Водолей': { element: 'Воздух', emoji: '♒', elementEmoji: '💨' },
  'Рыбы': { element: 'Вода', emoji: '♓', elementEmoji: '💧' },
}
