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

// Фоны для AskTarotPage (shuffle, reveal, answer)
const ASK_TAROT_BACKGROUNDS = [
  '/backgrounds/ask-shuffle-fairy.jpg',
  '/backgrounds/ask-shuffle-witch.jpg',
  '/backgrounds/ask-reveal-fairy.jpg',
  '/backgrounds/ask-reveal-witch.jpg',
  '/backgrounds/ask-answer-fairy.jpg',
  '/backgrounds/ask-answer-witch.jpg',
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
  '/backgrounds/moon-calendar-witch.jpg',
  '/backgrounds/moon-calendar-fairy.jpg',
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

// Иконки онбординга
const ONBOARDING_IMAGES = [
  '/backgrounds/onboarding-welcome.jpg',
  '/backgrounds/onboarding.jpg',
  '/backgrounds/onboarding-relationship.jpg',
  '/backgrounds/onboarding-birthtime.jpg',
  '/icons/onboarding-luna.png',
  '/icons/onboarding/fairy.png',
  '/icons/onboarding/butterfly-left.png',
  '/icons/onboarding/butterfly-right.png',
  '/icons/onboarding/daily-card.png',
  '/icons/onboarding/question.png',
  '/icons/onboarding/spreads.png',
  '/icons/onboarding/streak.png',
]

// Кэш загруженных изображений
const loadedImages = new Set<string>()
const loadingImages = new Map<string, Promise<void>>()

// Предзагрузка одного изображения с улучшенным кэшированием
function preloadImage(src: string, priority: 'high' | 'low' = 'low'): Promise<void> {
  // Уже загружено
  if (loadedImages.has(src)) {
    return Promise.resolve()
  }

  // Уже загружается - вернуть существующий промис
  if (loadingImages.has(src)) {
    return loadingImages.get(src)!
  }

  const promise = new Promise<void>((resolve) => {
    // Используем fetch для лучшего кэширования браузером
    if ('fetch' in window) {
      fetch(src, {
        method: 'GET',
        cache: 'force-cache',
        priority: priority,
      } as RequestInit)
        .then(response => {
          if (response.ok) {
            return response.blob()
          }
          throw new Error(`Failed to fetch: ${src}`)
        })
        .then(() => {
          // Также создаем Image для гарантированного декодирования
          const img = new Image()
          img.decoding = 'async'
          img.onload = () => {
            loadedImages.add(src)
            loadingImages.delete(src)
            resolve()
          }
          img.onerror = () => {
            loadingImages.delete(src)
            resolve()
          }
          img.src = src
        })
        .catch(() => {
          // Fallback на обычную загрузку через Image
          const img = new Image()
          img.decoding = 'async'
          img.onload = () => {
            loadedImages.add(src)
            loadingImages.delete(src)
            resolve()
          }
          img.onerror = () => {
            console.warn(`Failed to preload: ${src}`)
            loadingImages.delete(src)
            resolve()
          }
          img.src = src
        })
    } else {
      // Fallback для старых браузеров
      const img = new Image()
      img.onload = () => {
        loadedImages.add(src)
        loadingImages.delete(src)
        resolve()
      }
      img.onerror = () => {
        console.warn(`Failed to preload: ${src}`)
        loadingImages.delete(src)
        resolve()
      }
      img.src = src
    }
  })

  loadingImages.set(src, promise)
  return promise
}

// Параллельная загрузка с ограничением concurrency для плавности
async function preloadImagesWithConcurrency(
  images: string[],
  concurrency: number = 3,
  priority: 'high' | 'low' = 'low'
): Promise<void> {
  const queue = [...images]
  const executing: Promise<void>[] = []

  while (queue.length > 0 || executing.length > 0) {
    // Заполняем очередь до лимита concurrency
    while (queue.length > 0 && executing.length < concurrency) {
      const src = queue.shift()!
      const promise = preloadImage(src, priority).then(() => {
        executing.splice(executing.indexOf(promise), 1)
      })
      executing.push(promise)
    }

    // Ждем завершения хотя бы одного
    if (executing.length > 0) {
      await Promise.race(executing)
    }
  }
}

// Быстрая параллельная загрузка всех изображений
async function preloadImagesParallel(images: string[], priority: 'high' | 'low' = 'low'): Promise<void> {
  await Promise.all(images.map(src => preloadImage(src, priority)))
}

// Основная функция предзагрузки - загружает ВСЕ фоны сразу
export async function preloadAllImages(): Promise<void> {
  // Загружаем все изображения параллельно с высоким приоритетом
  await Promise.all([
    preloadImagesParallel(CRITICAL_BACKGROUNDS, 'high'),
    preloadImagesParallel(ASK_TAROT_BACKGROUNDS, 'high'),
    preloadImagesParallel(SECONDARY_BACKGROUNDS, 'high'),
    preloadImagesParallel(ICONS, 'high'),
    preloadImagesParallel(ONBOARDING_IMAGES, 'high'),
  ])
}

// Предзагрузка только для конкретной темы - оптимизированная версия
export async function preloadThemeImages(theme: 'witch' | 'fairy'): Promise<void> {
  const themeBackgrounds = CRITICAL_BACKGROUNDS.filter(bg => bg.includes(theme))
  const themeAskTarot = ASK_TAROT_BACKGROUNDS.filter(bg => bg.includes(theme))
  const themeSecondary = SECONDARY_BACKGROUNDS.filter(bg => bg.includes(theme))
  const themeIcons = ICONS.filter(icon => icon.includes(theme))

  // Все критичные для темы - параллельно с высоким приоритетом
  await Promise.all([
    preloadImagesParallel(themeBackgrounds, 'high'),
    preloadImagesParallel(themeIcons, 'high'),
    preloadImagesParallel(themeAskTarot, 'high'),
  ])

  // Второстепенные в фоне
  preloadImagesWithConcurrency(themeSecondary, 2, 'low')
}

// Предзагрузка изображений для конкретной страницы
export async function preloadPageImages(page: 'ask-tarot' | 'spread' | 'referrals' | 'home'): Promise<void> {
  switch (page) {
    case 'ask-tarot':
      await preloadImagesParallel(ASK_TAROT_BACKGROUNDS, 'high')
      break
    case 'spread':
      await preloadImagesParallel([
        '/backgrounds/result-witch.jpg',
        '/backgrounds/result-fairy.jpg',
      ], 'high')
      break
    case 'referrals':
      await preloadImagesParallel([
        '/backgrounds/referrals-witch.jpg',
        '/backgrounds/referrals-fairy.jpg',
      ], 'high')
      break
    case 'home':
      await preloadImagesParallel(CRITICAL_BACKGROUNDS, 'high')
      break
  }
}

// Проверка загружено ли изображение
export function isImageLoaded(src: string): boolean {
  return loadedImages.has(src)
}

// Получить прогресс загрузки (0-100)
export function getPreloadProgress(): number {
  const allImages = [
    ...CRITICAL_BACKGROUNDS,
    ...ASK_TAROT_BACKGROUNDS,
    ...SECONDARY_BACKGROUNDS,
    ...ICONS,
  ]
  const loaded = allImages.filter(src => loadedImages.has(src)).length
  return Math.round((loaded / allImages.length) * 100)
}

// Принудительная предзагрузка конкретного изображения
export function preloadSingleImage(src: string): Promise<void> {
  return preloadImage(src, 'high')
}
