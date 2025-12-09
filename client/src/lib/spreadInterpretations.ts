import type { Card, User, ReadingType } from '../types'

interface SpreadCard {
  card: Card
  isReversed: boolean
}

interface PositionInterpretation {
  position: string
  cardName: string
  isReversed: boolean
  detailed: string
  advice: string
  keywords: string[]
}

interface FullInterpretation {
  greeting: string
  positions: PositionInterpretation[]
  generalSummary: string
  advice: string
  warning?: string
  positive: string
  timing?: string
}

export interface ClarifyingCardInterpretation {
  intro: string
  mainMessage: string
  deepAnalysis: string
  connectionToSpread: string
  additionalAdvice: string
  keywords: string[]
}

// Генерация приветствия на основе данных пользователя
function generateGreeting(user: User | null, spreadType: ReadingType): string {
  const name = user?.name || 'Дорогая'
  const zodiac = user?.zodiacSign
  const relationship = user?.relationshipStatus

  const greetings: Record<ReadingType, string[]> = {
    love: [
      `${name}, карты раскрыли тайны твоего сердца...`,
      `${name}, любовный расклад готов поведать тебе о чувствах...`,
      `${name}, давай посмотрим, что говорят карты о твоей любви...`,
    ],
    money: [
      `${name}, финансовый расклад открывает интересные перспективы...`,
      `${name}, карты показали путь к процветанию...`,
      `${name}, давай разберёмся с твоими денежными потоками...`,
    ],
    future: [
      `${name}, колесо судьбы начинает вращаться...`,
      `${name}, карты приоткрывают завесу будущего...`,
      `${name}, посмотрим, что готовит тебе вселенная...`,
    ],
    daily: [
      `${name}, твоя карта дня несёт важное послание...`,
    ],
    clarification: [
      `${name}, пояснительная карта добавляет ясности...`,
    ],
  }

  let greeting = greetings[spreadType][Math.floor(Math.random() * greetings[spreadType].length)]

  // Добавляем персонализацию по знаку зодиака
  if (zodiac && spreadType !== 'daily') {
    const zodiacAdditions: Record<string, string> = {
      'Овен': ' Твоя огненная натура сегодня особенно чувствительна к посланиям карт.',
      'Телец': ' Земная энергия помогает тебе увидеть практическую сторону вопроса.',
      'Близнецы': ' Твоя двойственность позволяет видеть ситуацию с разных сторон.',
      'Рак': ' Лунная энергия усиливает твою интуицию сегодня.',
      'Лев': ' Солнечная сила придаёт особый вес этому раскладу.',
      'Дева': ' Твоя внимательность к деталям поможет уловить все нюансы.',
      'Весы': ' Стремление к гармонии открывает новые грани толкования.',
      'Скорпион': ' Глубина твоего восприятия позволит понять скрытые смыслы.',
      'Стрелец': ' Твой оптимизм привлекает благоприятные послания.',
      'Козерог': ' Практичность поможет извлечь максимум пользы из расклада.',
      'Водолей': ' Твоя уникальность находит отражение в картах.',
      'Рыбы': ' Интуитивное восприятие особенно сильно сегодня.',
    }
    if (zodiacAdditions[zodiac]) {
      greeting += zodiacAdditions[zodiac]
    }
  }

  return greeting
}

// Генерация детальной интерпретации для позиции
function generatePositionInterpretation(
  card: Card,
  isReversed: boolean,
  positionName: string,
  positionDescription: string,
  spreadType: ReadingType,
  user: User | null
): PositionInterpretation {
  const meaning = isReversed ? card.meaningReversed : card.meaningUpright
  const relevantMeaning = spreadType === 'love' ? meaning.love :
                          spreadType === 'money' ? meaning.career :
                          meaning.general

  // Базовые шаблоны интерпретаций в зависимости от типа расклада и позиции
  const templates = {
    love: {
      'Ты сейчас': [
        `Карта "${card.nameRu}"${isReversed ? ' в перевёрнутом положении' : ''} в позиции "Ты сейчас" говорит о том, что в данный момент ты ${isReversed ? 'возможно, не до конца осознаёшь свои истинные чувства' : 'находишься в гармонии со своими эмоциями'}. ${relevantMeaning} Эта энергия ${card.element ? `связана со стихией ${card.element}` : 'очень сильна'}, что указывает на ${isReversed ? 'необходимость внутренней работы' : 'готовность к переменам в личной жизни'}.`,
        `"${card.nameRu}" раскрывает твоё текущее эмоциональное состояние. ${isReversed ? 'Перевёрнутое положение намекает на внутренние блоки или нерешённые вопросы.' : 'Прямое положение показывает открытость и готовность любить.'} ${relevantMeaning}`,
      ],
      'Он/Она': [
        `В позиции партнёра выпала карта "${card.nameRu}"${isReversed ? ' (перевёрнутая)' : ''}. Это говорит о том, что ${isReversed ? 'возможны скрытые сомнения или невысказанные чувства с его/её стороны' : 'партнёр испытывает к тебе искренние чувства'}. ${relevantMeaning} ${card.zodiacConnections?.length ? `Особенно это актуально для знаков: ${card.zodiacConnections.join(', ')}.` : ''}`,
        `"${card.nameRu}" в позиции партнёра — ${isReversed ? 'знак того, что нужно больше общения и понимания' : 'прекрасный знак взаимности'}. ${relevantMeaning}`,
      ],
      'Препятствие': [
        `Карта "${card.nameRu}"${isReversed ? ' в перевёрнутом виде' : ''} указывает на препятствие: ${isReversed ? 'внутренние страхи и неуверенность мешают развитию отношений' : 'внешние обстоятельства требуют вашего внимания'}. ${relevantMeaning} Но помни — любое препятствие можно преодолеть, если работать над ним вместе.`,
        `Преграда в виде "${card.nameRu}" — это ${isReversed ? 'твои собственные установки и убеждения' : 'временные трудности'}. ${relevantMeaning}`,
      ],
      'Будущее': [
        `"${card.nameRu}"${isReversed ? ' (перевёрнутая)' : ''} в позиции будущего — ${isReversed ? 'предупреждение о необходимости изменить что-то уже сейчас' : 'очень благоприятный знак'}! ${relevantMeaning} В ближайшие 2-3 месяца эта энергия будет особенно ощутима.`,
        `Будущее твоих отношений окрашено энергией "${card.nameRu}". ${isReversed ? 'Перевёрнутое положение советует не торопить события.' : 'Всё движется в правильном направлении.'} ${relevantMeaning}`,
      ],
    },
    money: {
      'Текущее состояние': [
        `"${card.nameRu}"${isReversed ? ' в перевёрнутом положении' : ''} описывает твоё текущее финансовое положение. ${isReversed ? 'Возможно, есть скрытые денежные утечки или неэффективные траты.' : 'Ты на верном пути к финансовой стабильности.'} ${relevantMeaning} ${card.element === 'Земля' ? 'Земная энергия карты особенно благоприятна для материальных вопросов.' : ''}`,
      ],
      'Скрытые возможности': [
        `Карта "${card.nameRu}" открывает скрытые возможности для заработка. ${isReversed ? 'Возможно, ты упускаешь очевидные шансы из-за страха или неуверенности.' : 'Обрати внимание на новые предложения и идеи!'} ${relevantMeaning}`,
      ],
      'Препятствия': [
        `"${card.nameRu}"${isReversed ? ' (перевёрнутая)' : ''} показывает, что мешает твоему финансовому росту: ${isReversed ? 'внутренние установки о деньгах, возможно, унаследованные от родителей' : 'конкретные внешние обстоятельства, которые можно изменить'}. ${relevantMeaning}`,
      ],
      'Результат': [
        `"${card.nameRu}" в позиции результата — ${isReversed ? 'знак того, что нужно пересмотреть стратегию' : 'отличный прогноз'}! ${relevantMeaning} ${isReversed ? 'Но при правильных действиях всё может измениться к лучшему.' : 'Следуй советам карт, и финансовый успех не заставит себя ждать.'}`,
      ],
    },
    future: {
      'Прошлое': [
        `"${card.nameRu}"${isReversed ? ' в перевёрнутом виде' : ''} в позиции прошлого показывает, какой опыт влияет на твоё настоящее. ${isReversed ? 'Есть незакрытые гештальты, которые тянут энергию.' : 'Прошлый опыт даёт тебе мудрость и силу.'} ${meaning.general}`,
      ],
      'Настоящее': [
        `"${card.nameRu}" — твоя точка силы прямо сейчас. ${isReversed ? 'Перевёрнутое положение говорит о том, что ты пока не используешь весь свой потенциал.' : 'Ты находишься в мощном энергетическом потоке.'} ${meaning.general} Используй эту энергию мудро!`,
      ],
      'Ближайшее будущее': [
        `В ближайшие 1-3 месяца энергия "${card.nameRu}" будет особенно активна. ${isReversed ? 'Будь внимательна к предупреждениям и не игнорируй знаки.' : 'Это благоприятное время для новых начинаний.'} ${meaning.general}`,
      ],
      'Далёкое будущее': [
        `"${card.nameRu}"${isReversed ? ' (перевёрнутая)' : ''} в далёком будущем (6-12 месяцев) — ${isReversed ? 'предупреждение о возможных трудностях, но у тебя есть время подготовиться' : 'прекрасная перспектива'}! ${meaning.general} ${card.zodiacConnections?.length ? `Особое значение это имеет для знаков ${card.zodiacConnections.join(', ')}.` : ''}`,
      ],
    },
  }

  const typeTemplates = templates[spreadType as keyof typeof templates] || templates.future
  const positionTemplates = typeTemplates[positionName as keyof typeof typeTemplates] || [
    `"${card.nameRu}"${isReversed ? ' в перевёрнутом положении' : ''} в этой позиции говорит следующее: ${meaning.general}`
  ]

  const detailed = positionTemplates[Math.floor(Math.random() * positionTemplates.length)]

  return {
    position: positionName,
    cardName: card.nameRu,
    isReversed,
    detailed,
    advice: meaning.advice,
    keywords: card.keywords,
  }
}

// Генерация общего резюме расклада
function generateGeneralSummary(
  cards: SpreadCard[],
  spreadType: ReadingType,
  user: User | null
): string {
  const name = user?.name || 'Дорогая'
  const reversedCount = cards.filter(c => c.isReversed).length
  const majorArcanaCount = cards.filter(c => c.card.arcana === 'major').length

  let summary = `${name}, `

  // Анализ общей картины
  if (majorArcanaCount >= 2) {
    summary += 'в твоём раскладе много карт Старших Арканов — это говорит о судьбоносном периоде в твоей жизни. Происходящее сейчас имеет глубокий кармический смысл. '
  }

  if (reversedCount === 0) {
    summary += 'Все карты выпали в прямом положении — это очень позитивный знак! Энергия течёт свободно, и ты на верном пути. '
  } else if (reversedCount >= cards.length / 2) {
    summary += 'Много перевёрнутых карт указывает на период внутренней работы. Сейчас важнее разобраться в себе, чем активно действовать. '
  }

  // Специфика по типу расклада
  const summaries: Record<string, string[]> = {
    love: [
      'Карты показывают, что в сфере отношений тебя ждут важные перемены. Главное — слушать своё сердце и не бояться проявлять чувства.',
      'Любовный расклад указывает на период эмоционального роста. Отношения требуют работы, но результат того стоит.',
      'Энергия любви окружает тебя. Будь открыта новым возможностям и не зацикливайся на прошлом.',
    ],
    money: [
      'Финансовая ситуация требует внимания, но карты показывают хороший потенциал. Главное — действовать обдуманно.',
      'Денежные потоки начинают меняться. Следуй интуиции в финансовых решениях.',
      'Материальная сфера активизируется. Это хорошее время для планирования и инвестиций.',
    ],
    future: [
      'Будущее формируется прямо сейчас твоими мыслями и действиями. Карты показывают направление, но выбор всегда за тобой.',
      'Впереди интересный период. События будут развиваться динамично — будь готова к переменам.',
      'Колесо судьбы крутится в твою пользу. Доверься процессу и не сопротивляйся переменам.',
    ],
  }

  summary += (summaries[spreadType] || summaries.future)[Math.floor(Math.random() * 3)]

  return summary
}

// Генерация совета
function generateAdvice(cards: SpreadCard[], spreadType: ReadingType): string {
  const advices: Record<string, string[]> = {
    love: [
      'Открой своё сердце и позволь любви войти в твою жизнь. Не бойся быть уязвимой — это делает тебя сильнее.',
      'Работай над коммуникацией. Говори о своих чувствах и слушай партнёра. Молчание разрушает больше, чем слова.',
      'Люби себя в первую очередь. Только наполнив свою чашу, ты сможешь делиться любовью с другими.',
    ],
    money: [
      'Создай чёткий финансовый план и придерживайся его. Маленькие шаги приводят к большим результатам.',
      'Ищи новые источники дохода. Не бойся выходить из зоны комфорта — там тебя ждут возможности.',
      'Благодари за то, что имеешь. Энергия благодарности привлекает изобилие.',
    ],
    future: [
      'Живи настоящим, но планируй будущее. Баланс между мечтами и реальностью — ключ к успеху.',
      'Доверяй своей интуиции. Внутренний голос знает больше, чем кажется.',
      'Будь открыта переменам. То, что сейчас пугает, может стать твоим величайшим благословением.',
    ],
  }

  return (advices[spreadType] || advices.future)[Math.floor(Math.random() * 3)]
}

// Генерация интерпретации пояснительной карты
export function generateClarifyingCardInterpretation(
  clarifyingCard: { card: Card; isReversed: boolean },
  originalCards: SpreadCard[],
  spreadType: ReadingType,
  user: User | null
): ClarifyingCardInterpretation {
  const name = user?.name || 'Дорогая'
  const card = clarifyingCard.card
  const isReversed = clarifyingCard.isReversed
  const meaning = isReversed ? card.meaningReversed : card.meaningUpright

  // Введение к пояснительной карте
  const introVariants = [
    `${name}, пояснительная карта "${card.nameRu}"${isReversed ? ' (перевёрнутая)' : ''} раскрывает глубинный смысл твоего расклада.`,
    `Дополнительная карта "${card.nameRu}"${isReversed ? ' в перевёрнутом положении' : ''} добавляет важные детали к общей картине.`,
    `${name}, карта-кларификатор "${card.nameRu}" проливает свет на скрытые аспекты ситуации.`,
  ]

  // Анализ связи с основным раскладом
  const majorCards = originalCards.filter(c => c.card.arcana === 'major')
  const reversedCount = originalCards.filter(c => c.isReversed).length

  // Генерация связи с основным раскладом
  const connectionTemplates: Record<string, string[]> = {
    love: [
      `Эта карта углубляет понимание эмоциональной динамики между вами. ${card.meaningUpright.love || meaning.general} Обрати особое внимание на то, как эта энергия взаимодействует с картами, выпавшими в позициях "Ты" и "Партнёр".`,
      `"${card.nameRu}" как пояснительная карта указывает на скрытые эмоциональные течения. ${isReversed ? 'Перевёрнутое положение говорит о том, что какие-то чувства подавлены или не выражены открыто.' : 'Эти чувства готовы проявиться в ближайшее время.'} В контексте твоих отношений это означает необходимость более глубокого диалога.`,
      `Пояснительная карта добавляет нюанс к любовному раскладу: ${meaning.love || meaning.general} Она показывает, что под поверхностью ситуации скрываются дополнительные факторы, влияющие на развитие отношений.`,
    ],
    money: [
      `В контексте финансов "${card.nameRu}" указывает на неочевидные факторы, влияющие на денежные потоки. ${meaning.career || meaning.general} Возможно, есть скрытые возможности или риски, которые стоит учесть.`,
      `Эта карта раскрывает подсознательные установки относительно денег. ${isReversed ? 'Перевёрнутое положение намекает на финансовые блоки или страхи, мешающие процветанию.' : 'Твоё отношение к деньгам находится в гармонии с твоими действиями.'} Работа над этим аспектом усилит позитивное влияние основного расклада.`,
      `"${card.nameRu}" дополняет картину финансовой ситуации: ${meaning.general} Обрати внимание на связь этой энергии с картой "Скрытые возможности" в основном раскладе.`,
    ],
    future: [
      `Пояснительная карта "${card.nameRu}" добавляет глубины к пониманию будущего. ${meaning.general} Она показывает, какая энергия будет сопровождать тебя на пути к реализации того, что показал основной расклад.`,
      `Эта карта раскрывает тонкие нити судьбы, не видимые в основном раскладе. ${isReversed ? 'Перевёрнутое положение предупреждает о необходимости быть более осознанной в своих выборах.' : 'Прямое положение подтверждает, что ты движешься в верном направлении.'} ${meaning.general}`,
      `"${card.nameRu}" как кларификатор указывает на ключевой фактор развития событий: ${meaning.general} Держи это знание при принятии важных решений.`,
    ],
  }

  const connectionVariants = connectionTemplates[spreadType] || connectionTemplates.future
  const connection = connectionVariants[Math.floor(Math.random() * connectionVariants.length)]

  // Глубокий анализ карты
  const deepAnalysisTemplates = [
    `Энергия ${card.element ? `стихии ${card.element}` : 'этой карты'} ${majorCards.length > 1 ? 'усиливается наличием нескольких Старших Арканов в раскладе' : 'гармонично дополняет энергетику расклада'}. ${isReversed ? 'Перевёрнутое положение призывает к внутренней работе и трансформации.' : 'Прямое положение указывает на активное проявление этой энергии во внешнем мире.'}\n\n${card.zodiacConnections?.length ? `Особую связь эта карта имеет со знаками: ${card.zodiacConnections.join(', ')}. Если это твой знак или знак значимого человека — послание особенно актуально.` : ''}`,

    `Карта "${card.nameRu}" традиционно связана с темой ${meaning.general.toLowerCase()}. В качестве пояснительной карты она говорит о том, что именно этот аспект требует особого внимания в твоей ситуации.\n\n${reversedCount > originalCards.length / 2 ? 'Учитывая большое количество перевёрнутых карт в основном раскладе, эта пояснительная карта указывает на период внутренней трансформации.' : 'Гармония основного расклада усиливается посланием этой карты.'}`,

    `Глубинное послание "${card.nameRu}": ${meaning.general}\n\n${isReversed ? 'В перевёрнутом положении карта призывает обратить внимание на то, что ты, возможно, избегаешь или не хочешь признавать. Это не негатив — это возможность для роста.' : 'Прямое положение подтверждает, что ты на верном пути. Доверься интуиции и следуй указаниям карт.'} ${card.keywords.length > 0 ? `Ключевые энергии: ${card.keywords.join(', ')}.` : ''}`,
  ]

  const deepAnalysis = deepAnalysisTemplates[Math.floor(Math.random() * deepAnalysisTemplates.length)]

  // Дополнительный совет
  const adviceTemplates = [
    `Главный совет пояснительной карты: ${meaning.advice} Интегрируй эту мудрость с общим посланием расклада для максимального понимания ситуации.`,
    `"${card.nameRu}" советует: ${meaning.advice} Помни, что эта карта появилась не случайно — она несёт именно то послание, которое тебе сейчас нужно услышать.`,
    `Практический совет от карты-кларификатора: ${meaning.advice} Применяй эту рекомендацию в контексте всего расклада — она поможет извлечь максимум пользы из полученной информации.`,
  ]

  return {
    intro: introVariants[Math.floor(Math.random() * introVariants.length)],
    mainMessage: `${meaning.general} ${isReversed ? 'Перевёрнутое положение добавляет оттенок внутренней работы и необходимости осознания.' : 'Прямое положение усиливает позитивное влияние карты.'}`,
    deepAnalysis,
    connectionToSpread: connection,
    additionalAdvice: adviceTemplates[Math.floor(Math.random() * adviceTemplates.length)],
    keywords: card.keywords,
  }
}

// Главная функция генерации полной интерпретации
export function generateFullInterpretation(
  cards: SpreadCard[],
  positions: Array<{ name: string; description: string }>,
  spreadType: ReadingType,
  user: User | null
): FullInterpretation {
  const greeting = generateGreeting(user, spreadType)

  const positionInterpretations = cards.map((card, i) =>
    generatePositionInterpretation(
      card.card,
      card.isReversed,
      positions[i].name,
      positions[i].description,
      spreadType,
      user
    )
  )

  const generalSummary = generateGeneralSummary(cards, spreadType, user)
  const advice = generateAdvice(cards, spreadType)

  // Позитивный аспект
  const positives = [
    'Помни, что карты показывают потенциал, а не приговор. Ты всегда можешь изменить свою судьбу своими действиями.',
    'Независимо от расклада, вселенная на твоей стороне. Верь в себя!',
    'Каждая карта — это возможность для роста. Используй эту мудрость во благо.',
  ]

  return {
    greeting,
    positions: positionInterpretations,
    generalSummary,
    advice,
    positive: positives[Math.floor(Math.random() * positives.length)],
    timing: spreadType === 'future' ? 'Расклад актуален на ближайшие 6-12 месяцев' :
            spreadType === 'love' ? 'Энергия расклада активна в течение 2-3 месяцев' :
            spreadType === 'money' ? 'Финансовые изменения ожидаются в течение 1-3 месяцев' : undefined,
  }
}
