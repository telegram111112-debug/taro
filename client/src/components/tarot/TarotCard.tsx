import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { useUserStore } from '../../store/useUserStore'
import { getThemeConfig } from '../../lib/deckThemes'
import type { Card, DeckTheme } from '../../types'

interface TarotCardProps {
  card?: Card
  isReversed?: boolean
  isRevealed?: boolean
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg'
  showName?: boolean
  onClick?: () => void
  className?: string
  deckTheme?: DeckTheme
}

export function TarotCard({
  card,
  isReversed = false,
  isRevealed = true,
  size = 'md',
  showName = false,
  onClick,
  className,
  deckTheme,
}: TarotCardProps) {
  const { user } = useUserStore()
  const theme = deckTheme || user?.deckTheme || 'witch'
  const themeConfig = getThemeConfig(theme)

  const sizes = {
    xxs: { width: 'w-[72px]', height: 'h-[108px]', text: 'text-[6px]' },
    xs: { width: 'w-12', height: 'h-20', text: 'text-[8px]' },
    sm: { width: 'w-20', height: 'h-32', text: 'text-xs' },
    md: { width: 'w-32', height: 'h-48', text: 'text-sm' },
    lg: { width: 'w-48', height: 'h-72', text: 'text-base' },
  }

  return (
    <div className={clsx('flex flex-col items-center gap-2', className)}>
      <motion.div
        className={clsx(
          'relative cursor-pointer perspective-1000',
          sizes[size].width,
          sizes[size].height
        )}
        onClick={onClick}
        whileHover={onClick ? { scale: 1.05 } : {}}
        whileTap={onClick ? { scale: 0.98 } : {}}
      >
        <motion.div
          className="relative w-full h-full preserve-3d"
          initial={false}
          animate={{ rotateY: isRevealed ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Card Back */}
          <div
            className={clsx(
              'absolute inset-0 backface-hidden rounded-xl overflow-hidden',
              'border-2 shadow-xl'
            )}
            style={{
              borderColor: themeConfig.colors.cardBorder,
              background: themeConfig.gradients.card,
            }}
          >
            <CardBack theme={theme} />
          </div>

          {/* Card Front */}
          <div
            className={clsx(
              'absolute inset-0 backface-hidden rounded-xl overflow-hidden rotate-y-180',
              'border-2 shadow-xl'
            )}
            style={{
              borderColor: themeConfig.colors.cardBorder,
              background: themeConfig.gradients.card,
            }}
          >
            {card && (
              <div
                className={clsx(
                  'w-full h-full flex items-center justify-center',
                  isReversed && 'rotate-180'
                )}
              >
                {/* Placeholder for card image */}
                <CardFace card={card} theme={theme} />
              </div>
            )}
          </div>
        </motion.div>

        {/* Glow effect when revealed */}
        {isRevealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 -z-10 blur-xl rounded-xl"
            style={{
              background: themeConfig.colors.primary,
              opacity: 0.3,
            }}
          />
        )}
      </motion.div>

      {/* Card Name */}
      {showName && card && isRevealed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={clsx('text-center', sizes[size].text)}
        >
          <p className="font-display font-semibold text-white">
            {card.nameRu}
          </p>
          {isReversed && (
            <p className="text-white/50 text-xs">(перевёрнутая)</p>
          )}
        </motion.div>
      )}
    </div>
  )
}

// Card Back Design
function CardBack({ theme }: { theme: DeckTheme }) {
  const themeConfig = getThemeConfig(theme)

  if (theme === 'witch') {
    return (
      <div className="w-full h-full relative overflow-hidden rounded-lg">
        {/* Card back image */}
        <img
          src="/cards/card-back-witch.jpg"
          alt="Card back"
          className="w-full h-full object-cover"
        />

        {/* Subtle shimmer effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%)',
            backgroundSize: '200% 200%',
          }}
          animate={{
            backgroundPosition: ['200% 200%', '-50% -50%'],
          }}
          transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
        />
      </div>
    )
  }

  // Fairy theme - Custom image card back
  return (
    <div className="w-full h-full relative overflow-hidden rounded-lg">
      {/* Card back image */}
      <img
        src="/cards/card-back-fairy.jpg"
        alt="Card back"
        className="w-full h-full object-cover"
      />

      {/* Subtle shimmer/glitter effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)',
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['200% 200%', '-50% -50%'],
        }}
        transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
      />
    </div>
  )
}

// Card Face Design
function CardFace({ card, theme }: { card: Card; theme: DeckTheme }) {
  const themeConfig = getThemeConfig(theme)
  const isWitch = theme === 'witch'
  const isFairy = theme === 'fairy'

  // Determine card category for styling
  const isMajorArcana = card.arcana === 'major'
  const suitColors = {
    wands: isWitch ? '#f97316' : '#d4a574', // Orange / Rose gold
    cups: isWitch ? '#3b82f6' : '#e8b4b8', // Blue / Dusty rose
    swords: isWitch ? '#6366f1' : '#c9a66b', // Indigo / Gold
    pentacles: isWitch ? '#22c55e' : '#c9a66b', // Green / Gold
  }

  if (isFairy) {
    // Vintage pink aesthetic style like the reference
    return (
      <div
        className="w-full h-full relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #1a1520 0%, #2d1f35 50%, #1a1520 100%)',
        }}
      >
        {/* Ornate outer gold/rose frame */}
        <div
          className="absolute inset-[2px] rounded-lg"
          style={{
            border: '2px solid',
            borderImage: 'linear-gradient(180deg, #d4a76a 0%, #e8b4b8 50%, #d4a76a 100%) 1',
          }}
        />

        {/* Inner decorative frame */}
        <div
          className="absolute inset-[6px] rounded"
          style={{
            border: '1px solid rgba(232, 180, 184, 0.4)',
          }}
        />

        {/* Top decorative elements */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
          <span className="text-[8px]" style={{ color: '#d4a76a' }}>✦</span>
          <span className="text-[10px] font-serif" style={{ color: '#e8b4b8' }}>
            {card.arcana === 'major' ? romanNumeral(card.number) : card.number}
          </span>
          <span className="text-[8px]" style={{ color: '#d4a76a' }}>✦</span>
        </div>

        {/* Corner ornaments */}
        <div className="absolute top-3 left-2 text-[10px]" style={{ color: '#d4a76a' }}>❀</div>
        <div className="absolute top-3 right-2 text-[10px]" style={{ color: '#d4a76a' }}>❀</div>

        {/* Main card illustration area */}
        <div className="absolute inset-[10px] top-[18px] bottom-[22px] rounded overflow-hidden">
          <div
            className="w-full h-full flex flex-col items-center justify-center relative"
            style={{
              background: isMajorArcana
                ? 'linear-gradient(180deg, rgba(232, 180, 184, 0.15) 0%, rgba(45, 31, 53, 0.9) 30%, rgba(26, 21, 32, 0.95) 100%)'
                : 'linear-gradient(180deg, rgba(212, 167, 106, 0.1) 0%, rgba(45, 31, 53, 0.9) 100%)',
            }}
          >
            {/* Decorative arch frame */}
            <div
              className="absolute top-1 left-1/2 -translate-x-1/2 w-[85%] h-[70%] rounded-t-full"
              style={{
                border: '1px solid rgba(212, 167, 106, 0.3)',
                borderBottom: 'none',
              }}
            />

            {/* Side candle decorations */}
            <div className="absolute bottom-2 left-2 text-[10px] opacity-70">🕯️</div>
            <div className="absolute bottom-2 right-2 text-[10px] opacity-70">🕯️</div>

            {/* Central symbol/illustration */}
            <div className="flex flex-col items-center justify-center">
              {/* Star/compass at top */}
              <div className="text-lg mb-1" style={{ color: '#d4a76a' }}>
                {isMajorArcana ? '✧' : '✦'}
              </div>

              {/* Main symbol */}
              <div
                className="text-3xl mb-2"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(232, 180, 184, 0.5))',
                }}
              >
                {isMajorArcana
                  ? getFairyMajorArcanaSymbol(card.number)
                  : getFairySuitSymbol(card.suit!)}
              </div>

              {/* Decorative roses */}
              <div className="flex gap-1 opacity-80">
                <span className="text-xs">🌹</span>
                <span className="text-[10px]" style={{ color: '#d4a76a' }}>✧</span>
                <span className="text-xs">🌹</span>
              </div>
            </div>

            {/* Side moon decorations for major arcana */}
            {isMajorArcana && (
              <>
                <div className="absolute top-1/4 left-2 text-[8px] opacity-50" style={{ color: '#e8b4b8' }}>☽</div>
                <div className="absolute top-1/4 right-2 text-[8px] opacity-50" style={{ color: '#e8b4b8' }}>☾</div>
              </>
            )}
          </div>
        </div>

        {/* Bottom name plate */}
        <div
          className="absolute bottom-[4px] left-[8px] right-[8px] h-[16px] flex items-center justify-center rounded-sm"
          style={{
            background: 'linear-gradient(180deg, rgba(248, 238, 239, 0.95) 0%, rgba(232, 214, 216, 0.9) 100%)',
            border: '1px solid #d4a76a',
          }}
        >
          <span
            className="text-[8px] font-serif font-bold uppercase tracking-wider"
            style={{ color: '#2d1f35' }}
          >
            {card.nameEn || card.nameRu}
          </span>
        </div>

        {/* Bottom corner ornaments */}
        <div className="absolute bottom-[22px] left-2 text-[8px]" style={{ color: '#d4a76a' }}>❀</div>
        <div className="absolute bottom-[22px] right-2 text-[8px]" style={{ color: '#d4a76a' }}>❀</div>

        {/* Symbol at very bottom */}
        <div className="absolute bottom-[1px] left-1/2 -translate-x-1/2 text-[6px]" style={{ color: '#d4a76a' }}>
          ♡
        </div>
      </div>
    )
  }

  // Witch theme (default)
  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-900 via-black to-gray-900 p-2">
      {/* Card number */}
      <div className="text-center text-white text-xs font-medium opacity-60">
        {card.arcana === 'major' ? romanNumeral(card.number) : card.number}
      </div>

      {/* Card image placeholder */}
      <div className="flex-1 flex items-center justify-center my-2">
        <div
          className="w-full aspect-[3/4] rounded-lg flex items-center justify-center text-4xl"
          style={{
            background: isMajorArcana
              ? themeConfig.gradients.card
              : `linear-gradient(135deg, ${suitColors[card.suit!]}20, ${suitColors[card.suit!]}10)`,
            border: `1px solid ${isMajorArcana ? themeConfig.colors.accent : suitColors[card.suit!]}30`,
          }}
        >
          {isMajorArcana ? (
            getMajorArcanaSymbol(card.number, isWitch)
          ) : (
            getSuitSymbol(card.suit!, isWitch)
          )}
        </div>
      </div>

      {/* Card name */}
      <div className="text-center text-white font-display text-xs font-semibold leading-tight">
        {card.nameRu}
      </div>
    </div>
  )
}

// Helper functions
function romanNumeral(num: number): string {
  const numerals = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
    'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI']
  return numerals[num] || num.toString()
}

function getMajorArcanaSymbol(number: number, isWitch: boolean): string {
  const witchSymbols = ['🃏', '🎭', '📿', '👑', '🏛️', '⛓️', '💕', '🏹', '💪', '🏔️',
    '🎰', '⚖️', '🔄', '💀', '⏳', '😈', '🗼', '⭐', '🌙', '☀️', '📯', '🌍']
  const fairySymbols = ['🃏', '✨', '🔮', '👸', '🏰', '💒', '💖', '🦄', '🌸', '🏔️',
    '🎠', '⚖️', '🦋', '🌺', '⏳', '🖤', '🗼', '⭐', '🌙', '☀️', '📯', '🌍']
  return (isWitch ? witchSymbols : fairySymbols)[number] || '✨'
}

function getSuitSymbol(suit: string, isWitch: boolean): string {
  const symbols = {
    wands: isWitch ? '🪄' : '💫',
    cups: isWitch ? '🏆' : '💝',
    swords: isWitch ? '⚔️' : '🗡️',
    pentacles: isWitch ? '⭐' : '🌟',
  }
  return symbols[suit as keyof typeof symbols] || '✨'
}

// Fairy-specific symbols for major arcana - romantic & ethereal
function getFairyMajorArcanaSymbol(number: number): string {
  const symbols = [
    '🦋',  // 0 - The Fool - свободная бабочка
    '✨',  // 1 - The Magician - волшебная искра
    '🌙',  // 2 - The High Priestess - луна
    '👸',  // 3 - The Empress - императрица
    '🏰',  // 4 - The Emperor - замок
    '🕊️',  // 5 - The Hierophant - голубь
    '💕',  // 6 - The Lovers - сердца
    '🦄',  // 7 - The Chariot - единорог
    '🌸',  // 8 - Strength - цветок
    '🔮',  // 9 - The Hermit - кристалл
    '🎠',  // 10 - Wheel of Fortune - карусель
    '⚖️',  // 11 - Justice - весы
    '🌺',  // 12 - The Hanged Man - цветок лотоса
    '🥀',  // 13 - Death - увядшая роза (трансформация)
    '💫',  // 14 - Temperance - звезда
    '🖤',  // 15 - The Devil - тёмное сердце
    '⚡',  // 16 - The Tower - молния
    '⭐',  // 17 - The Star - звезда
    '🌛',  // 18 - The Moon - полумесяц
    '☀️',  // 19 - The Sun - солнце
    '👼',  // 20 - Judgement - ангел
    '🌍',  // 21 - The World - мир
  ]
  return symbols[number] || '✨'
}

// Fairy-specific symbols for suits - romantic style
function getFairySuitSymbol(suit: string): string {
  const symbols: Record<string, string> = {
    wands: '🌹',     // Розы для жезлов - страсть
    cups: '💖',      // Сердце для кубков - любовь
    swords: '🦋',    // Бабочка для мечей - трансформация
    pentacles: '🌸', // Цветок для пентаклей - рост
  }
  return symbols[suit] || '✨'
}
