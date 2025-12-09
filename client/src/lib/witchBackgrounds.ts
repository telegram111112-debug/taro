// Фоновые изображения для тёмной колоды по дням недели
// Каждый день имеет свою уникальную мистическую атмосферу

export interface WitchBackground {
  dayName: string
  dayNameEn: string
  imagePath: string
  fallbackGradient: string
  mood: string
  description: string
}

// Фоны привязаны к дням недели (0 = воскресенье)
// Пути закодированы для корректной работы с русскими именами
export const witchBackgrounds: Record<number, WitchBackground> = {
  // Воскресенье - Комната ведьмы со свечами и книгами
  0: {
    dayName: 'Воскресенье',
    dayNameEn: 'Sunday',
    imagePath: '/backgrounds/%D0%9A%D0%BE%D0%BC%D0%BD%D0%B0%D1%82%D0%B0%20%D0%B2%D0%B5%D0%B4%D1%8C%D0%BC%D1%8B%20%D1%81%D0%BE%20%D1%81%D0%B2%D0%B5%D1%87%D0%B0%D0%BC%D0%B8%20%D0%B8%20%D0%BA%D0%BD%D0%B8%D0%B3%D0%B0%D0%BC%D0%B8.jpg',
    fallbackGradient: 'linear-gradient(180deg, #1a0a1a 0%, #2d1b2d 30%, #4a2040 70%, #6b3050 100%)',
    mood: 'Древняя мудрость',
    description: 'Комната ведьмы хранит тайны веков',
  },
  // Понедельник - Силуэт демоницы с крыльями
  1: {
    dayName: 'Понедельник',
    dayNameEn: 'Monday',
    imagePath: '/backgrounds/%D0%A1%D0%B8%D0%BB%D1%83%D1%8D%D1%82%20%D0%B4%D0%B5%D0%BC%D0%BE%D0%BD%D0%B8%D1%86%D1%8B%20%D1%81%20%D0%BA%D1%80%D1%8B%D0%BB%D1%8C%D1%8F%D0%BC%D0%B8.jpg',
    fallbackGradient: 'linear-gradient(180deg, #0a0a15 0%, #1a1a2a 30%, #2a2a3a 70%, #3a3a4a 100%)',
    mood: 'Тёмная сила',
    description: 'Крылатая тень несёт послание из мира теней',
  },
  // Вторник - Вороны в ночном небе у луны
  2: {
    dayName: 'Вторник',
    dayNameEn: 'Tuesday',
    imagePath: '/backgrounds/%D0%92%D0%BE%D1%80%D0%BE%D0%BD%D1%8B%20%D0%B2%20%D0%BD%D0%BE%D1%87%D0%BD%D0%BE%D0%BC%20%D0%BD%D0%B5%D0%B1%D0%B5%20%D1%83%20%D0%BB%D1%83%D0%BD%D1%8B.jpg',
    fallbackGradient: 'linear-gradient(180deg, #0f0f15 0%, #1a1a25 30%, #252530 70%, #353545 100%)',
    mood: 'Вестники судьбы',
    description: 'Вороны кружат у луны, неся тайные знаки',
  },
  // Среда - Ведьма в туманном лесу
  3: {
    dayName: 'Среда',
    dayNameEn: 'Wednesday',
    imagePath: '/backgrounds/%D0%92%D0%B5%D0%B4%D1%8C%D0%BC%D0%B0%20%D0%B2%20%D1%82%D1%83%D0%BC%D0%B0%D0%BD%D0%BD%D0%BE%D0%BC%20%D0%BB%D0%B5%D1%81%D1%83.jpg',
    fallbackGradient: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 30%, #2a2a2a 60%, #404040 100%)',
    mood: 'Лесная магия',
    description: 'Ведьма в туманном лесу плетёт заклинания',
  },
  // Четверг - Девушка с полумесяцем
  4: {
    dayName: 'Четверг',
    dayNameEn: 'Thursday',
    imagePath: '/backgrounds/%D0%94%D0%B5%D0%B2%D1%83%D1%88%D0%BA%D0%B0%20%D1%81%20%D0%BF%D0%BE%D0%BB%D1%83%D0%BC%D0%B5%D1%81%D1%8F%D1%86%D0%B5%D0%BC.jpg',
    fallbackGradient: 'linear-gradient(180deg, #15151f 0%, #25252f 30%, #35354a 60%, #454560 100%)',
    mood: 'Лунная ведьма',
    description: 'Под светом молодой луны раскрываются тайны',
  },
  // Пятница - Призрак в старинной комнате
  5: {
    dayName: 'Пятница',
    dayNameEn: 'Friday',
    imagePath: '/backgrounds/%D0%9F%D1%80%D0%B8%D0%B7%D1%80%D0%B0%D0%BA%20%D0%B2%20%D1%81%D1%82%D0%B0%D1%80%D0%B8%D0%BD%D0%BD%D0%BE%D0%B9%20%D0%BA%D0%BE%D0%BC%D0%BD%D0%B0%D1%82%D0%B5.jpg',
    fallbackGradient: 'linear-gradient(180deg, #0a0a0f 0%, #151520 30%, #202030 60%, #303045 100%)',
    mood: 'Шёпот духов',
    description: 'Призрачный танец в старинном зале',
  },
  // Суббота - Руки с зеркалом
  6: {
    dayName: 'Суббота',
    dayNameEn: 'Saturday',
    imagePath: '/backgrounds/%D0%A0%D1%83%D0%BA%D0%B8%20%D1%81%20%D0%B7%D0%B5%D1%80%D0%BA%D0%B0%D0%BB%D0%BE%D0%BC.jpg',
    fallbackGradient: 'linear-gradient(180deg, #050508 0%, #101015 30%, #1a1a25 60%, #252535 100%)',
    mood: 'Зеркало судьбы',
    description: 'В зеркале отражается то, что скрыто от глаз',
  },
}

// Получить фон для текущего дня
export function getCurrentWitchBackground(): WitchBackground {
  const dayOfWeek = new Date().getDay()
  return witchBackgrounds[dayOfWeek]
}

// Получить фон для конкретного дня
export function getWitchBackground(dayOfWeek: number): WitchBackground {
  return witchBackgrounds[dayOfWeek] || witchBackgrounds[0]
}

// Получить случайный фон (для разнообразия)
export function getRandomWitchBackground(): WitchBackground {
  const days = Object.keys(witchBackgrounds).map(Number)
  const randomDay = days[Math.floor(Math.random() * days.length)]
  return witchBackgrounds[randomDay]
}

// CSS стиль фона с fallback на градиент
export function getWitchBackgroundStyle(background: WitchBackground): React.CSSProperties {
  return {
    backgroundImage: `url(${background.imagePath}), ${background.fallbackGradient}`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }
}

// Только градиент (если изображения нет)
export function getWitchGradientStyle(background: WitchBackground): React.CSSProperties {
  return {
    background: background.fallbackGradient,
  }
}
