// Фоновые изображения для фейской колоды по дням недели
// Каждый день имеет свою уникальную волшебную атмосферу

export interface FairyBackground {
  dayName: string
  dayNameEn: string
  imagePath: string
  fallbackGradient: string
  mood: string
  description: string
}

// Фоны привязаны к дням недели (0 = воскресенье)
// Пути закодированы для корректной работы с русскими именами
export const fairyBackgrounds: Record<number, FairyBackground> = {
  // Воскресенье - Лунное сияние в розовых облаках
  0: {
    dayName: 'Воскресенье',
    dayNameEn: 'Sunday',
    imagePath: '/backgrounds/%D0%9B%D1%83%D0%BD%D0%B0%20%D0%B2%20%D1%80%D0%BE%D0%B7%D0%BE%D0%B2%D1%8B%D1%85%20%D0%BE%D0%B1%D0%BB%D0%B0%D0%BA%D0%B0%D1%85.jpg',
    fallbackGradient: 'linear-gradient(180deg, #2d1b4e 0%, #4a2c6a 30%, #e8a4c4 70%, #f5d0e0 100%)',
    mood: 'Лунная магия',
    description: 'Луна в розовых облаках дарит волшебство и покой',
  },
  // Понедельник - Розовая лестница в небеса
  1: {
    dayName: 'Понедельник',
    dayNameEn: 'Monday',
    imagePath: '/backgrounds/%D0%A0%D0%BE%D0%B7%D0%BE%D0%B2%D0%B0%D1%8F%20%D0%BB%D0%B5%D1%81%D1%82%D0%BD%D0%B8%D1%86%D0%B0%20%D0%B2%20%D0%BD%D0%B5%D0%B1%D0%B5%D1%81%D0%B0.jpg',
    fallbackGradient: 'linear-gradient(180deg, #1a1a3a 0%, #3d2a5a 30%, #d4a5c7 70%, #f0c8d8 100%)',
    mood: 'Путь к мечтам',
    description: 'Волшебная лестница ведёт к исполнению желаний',
  },
  // Вторник - Храм лунных фаз
  2: {
    dayName: 'Вторник',
    dayNameEn: 'Tuesday',
    imagePath: '/backgrounds/%D0%A5%D1%80%D0%B0%D0%BC%20%D1%81%20%D0%BB%D1%83%D0%BD%D0%BD%D1%8B%D0%BC%D0%B8%20%D1%84%D0%B0%D0%B7%D0%B0%D0%BC%D0%B8.jpg',
    fallbackGradient: 'linear-gradient(180deg, #0f1628 0%, #1e2847 30%, #4a3a6a 70%, #7a5a8a 100%)',
    mood: 'Тайны луны',
    description: 'Древний храм хранит секреты лунных циклов',
  },
  // Среда - Лебединое озеро у дворца
  3: {
    dayName: 'Среда',
    dayNameEn: 'Wednesday',
    imagePath: '/backgrounds/%D0%9B%D0%B5%D0%B1%D0%B5%D0%B4%D0%B8%20%D1%83%20%D0%B4%D0%B2%D0%BE%D1%80%D1%86%D0%B0.jpg',
    fallbackGradient: 'linear-gradient(180deg, #2a3a5a 0%, #4a5a7a 30%, #8a7aaa 60%, #d4b8c8 100%)',
    mood: 'Гармония и красота',
    description: 'Лебеди на озере у сказочного дворца приносят любовь',
  },
  // Четверг - Розовый зал с золотыми колоннами
  4: {
    dayName: 'Четверг',
    dayNameEn: 'Thursday',
    imagePath: '/backgrounds/%D0%A0%D0%BE%D0%B7%D0%BE%D0%B2%D1%8B%D0%B9%20%D0%B7%D0%B0%D0%BB%20%D1%81%20%D0%BA%D0%BE%D0%BB%D0%BE%D0%BD%D0%BD%D0%B0%D0%BC%D0%B8.jpg',
    fallbackGradient: 'linear-gradient(180deg, #3a2a4a 0%, #6a4a7a 30%, #c48ab0 60%, #f0c0d8 100%)',
    mood: 'Изобилие и роскошь',
    description: 'Золотой бальный зал исполнен волшебного света',
  },
  // Пятница - Хрустальный замок в розовых садах
  5: {
    dayName: 'Пятница',
    dayNameEn: 'Friday',
    imagePath: '/backgrounds/%D0%A5%D1%80%D1%83%D1%81%D1%82%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9%20%D0%B7%D0%B0%D0%BC%D0%BE%D0%BA.jpg',
    fallbackGradient: 'linear-gradient(180deg, #4a3a6a 0%, #7a5a9a 30%, #b88ac0 60%, #e8c0d8 100%)',
    mood: 'Сказочная любовь',
    description: 'Замок принцессы среди цветущих садов',
  },
  // Суббота - Арка из роз с фонарями
  6: {
    dayName: 'Суббота',
    dayNameEn: 'Saturday',
    imagePath: '/backgrounds/%D0%90%D1%80%D0%BA%D0%B0%20%D0%B8%D0%B7%20%D1%80%D0%BE%D0%B7.jpg',
    fallbackGradient: 'linear-gradient(180deg, #2a1a3a 0%, #5a3a6a 30%, #a87a9a 60%, #d8a8c0 100%)',
    mood: 'Романтика и тайны',
    description: 'Волшебный туннель из роз ведёт в мир грёз',
  },
}

// Получить фон для текущего дня
export function getCurrentFairyBackground(): FairyBackground {
  const dayOfWeek = new Date().getDay()
  return fairyBackgrounds[dayOfWeek]
}

// Получить фон для конкретного дня
export function getFairyBackground(dayOfWeek: number): FairyBackground {
  return fairyBackgrounds[dayOfWeek] || fairyBackgrounds[0]
}

// Получить случайный фон (для разнообразия)
export function getRandomFairyBackground(): FairyBackground {
  const days = Object.keys(fairyBackgrounds).map(Number)
  const randomDay = days[Math.floor(Math.random() * days.length)]
  return fairyBackgrounds[randomDay]
}

// CSS стиль фона с fallback на градиент
export function getFairyBackgroundStyle(background: FairyBackground): React.CSSProperties {
  return {
    backgroundImage: `url(${background.imagePath}), ${background.fallbackGradient}`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }
}

// Только градиент (если изображения нет)
export function getFairyGradientStyle(background: FairyBackground): React.CSSProperties {
  return {
    background: background.fallbackGradient,
  }
}
