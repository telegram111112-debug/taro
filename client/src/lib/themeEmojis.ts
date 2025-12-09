// Тематические эмодзи для разных тем
// Ведьма: мрачные, мистические, лунные
// Фея: нежные, розовые, блестящие

export const themeEmojis = {
  witch: {
    // Основные
    main: '🌙',
    secondary: '☽',
    accent: '✦',
    sparkle: '☆',

    // Действия
    fire: '🖤',
    love: '🖤',
    money: '🪙',
    future: '🔮',
    gift: '🎁',
    star: '⭐',

    // Расклады
    spreadLove: '🖤',
    spreadMoney: '🪙',
    spreadFuture: '🔮',

    // Декоративные
    decoration1: '🕯️',
    decoration2: '🦇',
    decoration3: '🕸️',
    decoration4: '☠️',

    // UI
    check: '✓',
    arrow: '→',
    button: '🌙',
  },
  fairy: {
    // Основные
    main: '🦋',
    secondary: '✨',
    accent: '💫',
    sparkle: '⭐',

    // Действия
    fire: '🔥',
    love: '💕',
    money: '💰',
    future: '🔮',
    gift: '🎀',
    star: '⭐',

    // Расклады
    spreadLove: '💕',
    spreadMoney: '💰',
    spreadFuture: '🔮',

    // Декоративные
    decoration1: '🌸',
    decoration2: '🦋',
    decoration3: '✨',
    decoration4: '💫',

    // UI
    check: '✓',
    arrow: '→',
    button: '✨',
  },
}

export type ThemeType = 'witch' | 'fairy'

export function getThemeEmoji(theme: ThemeType | undefined, key: keyof typeof themeEmojis.witch): string {
  const actualTheme = theme || 'witch'
  return themeEmojis[actualTheme][key]
}

// Хелпер для получения всех эмодзи темы
export function getThemeEmojis(theme: ThemeType | undefined) {
  const actualTheme = theme || 'witch'
  return themeEmojis[actualTheme]
}
