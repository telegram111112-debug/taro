import { Card } from '@prisma/client'

interface CardDraw {
  card: Card
  position: number
  positionMeaning: string
  isReversed: boolean
}

export class InterpretationService {
  async generateDailyInterpretation(
    card: Card,
    isReversed: boolean,
    moonPhase: string
  ): Promise<string> {
    const meaning = isReversed ? card.reversedMeaning : card.uprightMeaning
    const keywords = isReversed ? card.reversedKeywords : card.uprightKeywords

    const moonInfluence = this.getMoonInfluence(moonPhase)

    // Generate interpretation text
    const interpretation = `
**${card.nameRu}** ${isReversed ? '(перевернутая)' : ''}

${card.description}

**Значение карты дня:**
${meaning}

**Ключевые слова:** ${keywords.join(', ')}

**Влияние луны (${this.getMoonPhaseName(moonPhase)}):**
${moonInfluence}

**Совет на день:**
${this.generateDailyAdvice(card, isReversed)}
    `.trim()

    return interpretation
  }

  async generateSpreadInterpretation(
    spreadType: string,
    cards: CardDraw[],
    moonPhase: string
  ): Promise<string> {
    const spreadTitle = this.getSpreadTitle(spreadType)

    let interpretation = `**${spreadTitle}**\n\n`

    // Individual card interpretations
    for (const draw of cards) {
      const meaning = draw.isReversed
        ? draw.card.reversedMeaning
        : draw.card.uprightMeaning

      interpretation += `**Позиция ${draw.position}: ${draw.positionMeaning}**\n`
      interpretation += `*${draw.card.nameRu}* ${draw.isReversed ? '(перевернутая)' : ''}\n`
      interpretation += `${meaning}\n\n`
    }

    // Overall reading
    interpretation += `**Общий вывод:**\n`
    interpretation += this.generateOverallConclusion(spreadType, cards)
    interpretation += `\n\n**Влияние луны (${this.getMoonPhaseName(moonPhase)}):**\n`
    interpretation += this.getMoonInfluence(moonPhase)

    return interpretation.trim()
  }

  private getSpreadTitle(type: string): string {
    const titles: Record<string, string> = {
      LOVE: 'Расклад на любовь и отношения',
      MONEY: 'Расклад на финансы и карьеру',
      FUTURE: 'Расклад на будущее',
    }
    return titles[type] || 'Расклад Таро'
  }

  private generateDailyAdvice(card: Card, isReversed: boolean): string {
    const advices: Record<string, { upright: string; reversed: string }> = {
      // Major Arcana
      'the-fool': {
        upright: 'Сегодня отличный день для новых начинаний. Доверьтесь интуиции и не бойтесь рисковать.',
        reversed: 'Будьте осторожны с импульсивными решениями. Подумайте дважды, прежде чем действовать.',
      },
      'the-magician': {
        upright: 'У вас есть все необходимые ресурсы для успеха. Действуйте уверенно!',
        reversed: 'Проверьте свои намерения и убедитесь, что используете свои таланты во благо.',
      },
      'the-high-priestess': {
        upright: 'Прислушайтесь к своей интуиции. Ответы уже внутри вас.',
        reversed: 'Не игнорируйте свой внутренний голос. Найдите время для тишины и размышлений.',
      },
    }

    const advice = advices[card.slug]
    if (advice) {
      return isReversed ? advice.reversed : advice.upright
    }

    // Generic advice based on arcana
    if (card.arcana === 'MAJOR') {
      return isReversed
        ? 'Обратите внимание на внутренние блоки и скрытые препятствия. День для самоанализа.'
        : 'Важный день с большим потенциалом. Будьте открыты для значимых событий.'
    }

    // Generic advice based on suit
    const suitAdvice: Record<string, { upright: string; reversed: string }> = {
      WANDS: {
        upright: 'День полон энергии и творчества. Действуйте смело!',
        reversed: 'Направьте свою энергию конструктивно. Избегайте конфликтов.',
      },
      CUPS: {
        upright: 'Хороший день для эмоциональных связей и творчества.',
        reversed: 'Обратите внимание на свои эмоции. Не подавляйте чувства.',
      },
      SWORDS: {
        upright: 'Ясность мысли поможет вам принять верные решения.',
        reversed: 'Избегайте негативного мышления. Будьте честны с собой.',
      },
      PENTACLES: {
        upright: 'Сосредоточьтесь на практических делах и финансах.',
        reversed: 'Не переоценивайте материальные ценности. Ищите баланс.',
      },
    }

    const suit = card.suit as string
    if (suit && suitAdvice[suit]) {
      return isReversed ? suitAdvice[suit].reversed : suitAdvice[suit].upright
    }

    return isReversed
      ? 'Обратите внимание на области, требующие вашего внимания и работы над собой.'
      : 'Будьте открыты новым возможностям и доверяйте процессу.'
  }

  private generateOverallConclusion(type: string, cards: CardDraw[]): string {
    const majorCount = cards.filter(c => c.card.arcana === 'MAJOR').length
    const reversedCount = cards.filter(c => c.isReversed).length

    let conclusion = ''

    if (majorCount >= cards.length / 2) {
      conclusion += 'Наличие нескольких карт Старших Арканов указывает на значимость этого периода в вашей жизни. '
    }

    if (reversedCount >= cards.length / 2) {
      conclusion += 'Много перевернутых карт говорит о необходимости внутренней работы и преодоления препятствий. '
    }

    // Type-specific conclusions
    switch (type) {
      case 'LOVE':
        conclusion += 'В отношениях важно сохранять открытость и честность. Доверяйте своему сердцу.'
        break
      case 'MONEY':
        conclusion += 'Финансовый успех требует баланса между амбициями и практичностью. Планируйте мудро.'
        break
      case 'FUTURE':
        conclusion += 'Будущее формируется вашими сегодняшними решениями. Будьте осознанны в своих выборах.'
        break
      default:
        conclusion += 'Карты показывают путь, но выбор всегда остается за вами.'
    }

    return conclusion
  }

  private getMoonPhaseName(phase: string): string {
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

  private getMoonInfluence(phase: string): string {
    const influences: Record<string, string> = {
      new: 'Новолуние усиливает энергию новых начинаний. Время для посева намерений и планирования.',
      waxing_crescent: 'Растущая луна поддерживает рост и развитие ваших планов. Набирайте силу.',
      first_quarter: 'Время принятия решений и преодоления первых препятствий на пути к цели.',
      waxing_gibbous: 'Энергия нарастает. Доработайте детали и подготовьтесь к кульминации.',
      full: 'Полнолуние усиливает интуицию и эмоции. Время для завершения важных дел и сбора урожая.',
      waning_gibbous: 'Время благодарности и обмена знаниями. Делитесь достигнутым.',
      last_quarter: 'Период отпускания старого и освобождения от того, что больше не служит вам.',
      waning_crescent: 'Время отдыха, медитации и подготовки к новому циклу.',
    }
    return influences[phase] || 'Луна влияет на ваше подсознание и интуицию.'
  }
}
