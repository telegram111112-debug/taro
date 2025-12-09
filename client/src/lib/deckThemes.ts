import type { DeckTheme } from '../types'

export interface DeckThemeConfig {
  id: DeckTheme
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    cardBg: string
    cardBorder: string
    text: string
    textMuted: string
  }
  gradients: {
    main: string
    card: string
    button: string
  }
  emoji: {
    main: string
    decorative: string[]
  }
  cardBack: {
    pattern: string
    symbol: string
  }
}

export const deckThemes: Record<DeckTheme, DeckThemeConfig> = {
  witch: {
    id: 'witch',
    name: 'Прекрасная ведьма',
    description: 'Тёмная магия, лунный свет, таинственность',
    colors: {
      primary: '#8b5cf6', // Purple
      secondary: '#6366f1', // Indigo
      accent: '#c4b5fd', // Light purple
      background: '#0f0f1a',
      cardBg: '#1a1a2e',
      cardBorder: 'rgba(139, 92, 246, 0.3)',
      text: '#ffffff',
      textMuted: 'rgba(255, 255, 255, 0.6)',
    },
    gradients: {
      main: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      card: 'linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
      button: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    },
    emoji: {
      main: '🌙',
      decorative: ['🕯️', '🔮', '⭐', '🦇', '🕸️', '🖤', '✨'],
    },
    cardBack: {
      pattern: 'stars',
      symbol: '☽',
    },
  },
  fairy: {
    id: 'fairy',
    name: 'Нежная фея',
    description: 'Розы, сердечки, золото и нежность',
    colors: {
      primary: '#d4a574', // Rose gold
      secondary: '#e8b4b8', // Dusty rose
      accent: '#f5e6e8', // Cream pink
      gold: '#c9a66b', // Antique gold
      background: '#2a1f1f',
      cardBg: 'linear-gradient(145deg, #f5e6e8 0%, #e8d4d6 50%, #dcc5c7 100%)',
      cardBorder: 'rgba(201, 166, 107, 0.6)',
      text: '#4a3535',
      textMuted: 'rgba(74, 53, 53, 0.7)',
    },
    gradients: {
      main: 'linear-gradient(135deg, #e8d4d6 0%, #f5e6e8 50%, #fdf2f4 100%)',
      card: 'linear-gradient(145deg, rgba(201, 166, 107, 0.3) 0%, rgba(232, 180, 184, 0.2) 50%, rgba(245, 230, 232, 0.4) 100%)',
      button: 'linear-gradient(135deg, #d4a574 0%, #c9a66b 50%, #b8956a 100%)',
      cardFrame: 'linear-gradient(135deg, #c9a66b 0%, #e8d4a8 25%, #c9a66b 50%, #e8d4a8 75%, #c9a66b 100%)',
    },
    emoji: {
      main: '🌹',
      decorative: ['💕', '🌸', '✨', '🦋', '💗', '🎀', '🌷', '💖'],
    },
    cardBack: {
      pattern: 'roses',
      symbol: '♡',
      ornaments: ['roses', 'hearts', 'swirls'],
    },
  },
}

export function getThemeConfig(theme: DeckTheme): DeckThemeConfig {
  return deckThemes[theme]
}

// CSS custom properties for theme
export function getThemeCSSVars(theme: DeckTheme): Record<string, string> {
  const config = deckThemes[theme]
  return {
    '--theme-primary': config.colors.primary,
    '--theme-secondary': config.colors.secondary,
    '--theme-accent': config.colors.accent,
    '--theme-background': config.colors.background,
    '--theme-card-bg': config.colors.cardBg,
    '--theme-card-border': config.colors.cardBorder,
    '--theme-gradient-main': config.gradients.main,
    '--theme-gradient-card': config.gradients.card,
    '--theme-gradient-button': config.gradients.button,
  }
}
