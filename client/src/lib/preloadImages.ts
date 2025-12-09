// Критически важные фоновые изображения для предзагрузки
const CRITICAL_BACKGROUNDS = [
  '/backgrounds/background-witch.jpg',
  '/backgrounds/background-fairy.jpg',
  '/backgrounds/card-preview-witch.jpg',
  '/backgrounds/card-preview-fairy.jpg',
  '/backgrounds/deck-witch.jpg',
  '/backgrounds/deck-fairy.jpg',
  '/backgrounds/selector-witch.jpg',
  '/backgrounds/selector-fairy.jpg',
]

// Второстепенные изображения (загружаются после критичных)
const SECONDARY_BACKGROUNDS = [
  '/backgrounds/referrals-witch.jpg',
  '/backgrounds/referrals-fairy.jpg',
  '/backgrounds/result-witch.jpg',
  '/backgrounds/result-fairy.jpg',
  '/backgrounds/wings-witch.jpg',
  '/backgrounds/wings-fairy.jpg',
  '/backgrounds/fountain-fairy.jpg',
  '/backgrounds/bathtub-witch.jpg',
  '/backgrounds/roses-witch.jpg',
  '/backgrounds/clouds-fairy.jpg',
]

// Иконки
const ICONS = [
  '/icons/share-fairy.png',
  '/icons/share-witch.png',
  '/icons/spread-love-fairy.png',
  '/icons/spread-love-witch.png',
  '/icons/spread-money-fairy.png',
  '/icons/spread-money-witch.png',
  '/icons/crystal-ball.png',
]

// Кэш загруженных изображений
const loadedImages = new Set<string>()

// Предзагрузка одного изображения
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (loadedImages.has(src)) {
      resolve()
      return
    }

    const img = new Image()
    img.onload = () => {
      loadedImages.add(src)
      resolve()
    }
    img.onerror = () => {
      console.warn(`Failed to preload: ${src}`)
      resolve() // Не блокируем при ошибке
    }
    img.src = src
  })
}

// Предзагрузка массива изображений
async function preloadImages(images: string[]): Promise<void> {
  await Promise.all(images.map(preloadImage))
}

// Основная функция предзагрузки
export async function preloadAllImages(): Promise<void> {
  // Сначала критичные (параллельно)
  await preloadImages(CRITICAL_BACKGROUNDS)

  // Затем иконки
  await preloadImages(ICONS)

  // Затем второстепенные (в фоне, не блокируя)
  preloadImages(SECONDARY_BACKGROUNDS)
}

// Предзагрузка только для конкретной темы
export async function preloadThemeImages(theme: 'witch' | 'fairy'): Promise<void> {
  const themeBackgrounds = CRITICAL_BACKGROUNDS.filter(bg => bg.includes(theme))
  const themeSecondary = SECONDARY_BACKGROUNDS.filter(bg => bg.includes(theme))
  const themeIcons = ICONS.filter(icon => icon.includes(theme))

  await preloadImages(themeBackgrounds)
  await preloadImages(themeIcons)
  preloadImages(themeSecondary)
}

// Проверка загружено ли изображение
export function isImageLoaded(src: string): boolean {
  return loadedImages.has(src)
}
