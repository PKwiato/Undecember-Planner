import {
  createDefaultBoard,
  syncBoardToLegacySlots,
  emptyEquipment,
} from './game.js'

// Funkcja pomocnicza do tworzenia planszy maga
function createMageBoard() {
  const board = createDefaultBoard(5, 6)
  const getCell = (r, c) => board.cells.find((cell) => cell.row === r && cell.col === c)

  // 1. Kula Ognia (Fire Ball) na (1, 1)
  const fb = getCell(1, 1)
  fb.kind = 'skill'
  fb.runeId = 'FireBall'
  fb.slots = ['red', 'blue', 'red', 'green', 'blue', 'blue']

  getCell(0, 2).kind = 'link'
  getCell(0, 2).runeId = 'ConcentratedAreaDMG' // NE (dir 0)
  getCell(1, 2).kind = 'link'
  getCell(1, 2).runeId = 'SpellActivationOnSpellHit' // E (dir 1) - Trigger do Meteor!
  getCell(2, 2).kind = 'link'
  getCell(2, 2).runeId = 'AdditionalFireDMG' // SE (dir 2)
  getCell(2, 1).kind = 'link'
  getCell(2, 1).runeId = 'Multishot' // SW (dir 3)
  getCell(1, 0).kind = 'link'
  getCell(1, 0).runeId = 'SpellDMGIncrease' // W (dir 4)
  getCell(0, 1).kind = 'link'
  getCell(0, 1).runeId = 'ManaStorm' // NW (dir 5)

  // 2. Meteor na (1, 3) - wyzwalany automatycznie przy trafieniu Kulą Ognia
  const met = getCell(1, 3)
  met.kind = 'skill'
  met.runeId = 'Meteor'
  met.slots = ['red', 'blue', 'blue', 'red', 'blue', 'blue']

  getCell(0, 4).kind = 'link'
  getCell(0, 4).runeId = 'FirePenetration' // NE (dir 0)
  getCell(1, 4).kind = 'link'
  getCell(1, 4).runeId = 'ElementDMGAmplification' // E (dir 1)
  getCell(2, 4).kind = 'link'
  getCell(2, 4).runeId = 'QuickCast' // SE (dir 2)
  getCell(2, 3).kind = 'link'
  getCell(2, 3).runeId = 'BurningFlame' // SW (dir 3)
  // W (dir 4) to komórka (1, 2) - SpellActivationOnSpellHit łączący oba zaklęcia!
  getCell(0, 3).kind = 'link'
  getCell(0, 3).runeId = 'Harmony' // NW (dir 5)

  // 3. Teleport na (4, 1) - mobilność i ucieczka
  const tp = getCell(4, 1)
  tp.kind = 'skill'
  tp.runeId = 'Teleport'
  tp.slots = ['blue', 'red', 'white', 'white', 'white', 'white']
  getCell(3, 1).kind = 'link'
  getCell(3, 1).runeId = 'UseCount' // NE (dir 0)
  getCell(4, 2).kind = 'link'
  getCell(4, 2).runeId = 'DecreaseDuration' // E (dir 1)

  board.runestones = [
    'DMGAmplificationMagicRunestone',
    'AreaOfEffectMagicRunestone',
    'ResourceCostMagicRunestone',
  ]
  return board
}

// Funkcja pomocnicza do tworzenia planszy wojownika (Whirlwind)
function createWarriorBoard() {
  const board = createDefaultBoard(5, 6)
  const getCell = (r, c) => board.cells.find((cell) => cell.row === r && cell.col === c)

  // 1. Trąba Powietrzna (Whirlwind) na (1, 1)
  const ww = getCell(1, 1)
  ww.kind = 'skill'
  ww.runeId = 'Whirlwind'
  ww.slots = ['red', 'red', 'red', 'red', 'red', 'green']

  getCell(0, 2).kind = 'link'
  getCell(0, 2).runeId = 'AdditionalPhysicalDMG' // NE (dir 0)
  getCell(1, 2).kind = 'link'
  getCell(1, 2).runeId = 'MeleeDMGAmplification' // E (dir 1)
  getCell(2, 2).kind = 'link'
  getCell(2, 2).runeId = 'Savagery' // SE (dir 2)
  getCell(2, 1).kind = 'link'
  getCell(2, 1).runeId = 'IronWill' // SW (dir 3) - skalowanie z max HP
  getCell(1, 0).kind = 'link'
  getCell(1, 0).runeId = 'GripStrength' // W (dir 4)
  getCell(0, 1).kind = 'link'
  getCell(0, 1).runeId = 'QuickAttack' // NW (dir 5)

  // 2. Topory Iluzji (Illusion Axe) na (1, 4) - pasywne wirujące ostrza
  const ia = getCell(1, 4)
  ia.kind = 'skill'
  ia.runeId = 'IllusionAxe'
  ia.slots = ['red', 'red', 'red', 'red', 'white', 'red']

  getCell(0, 5).kind = 'link'
  getCell(0, 5).runeId = 'ConcentratedAreaDMG' // NE (dir 0)
  getCell(1, 5).kind = 'link'
  getCell(1, 5).runeId = 'AreaEffect' // E (dir 1)
  getCell(2, 5).kind = 'link'
  getCell(2, 5).runeId = 'Bloodthirst' // SE (dir 2)
  getCell(2, 4).kind = 'link'
  getCell(2, 4).runeId = 'AttackDMGIncrease' // SW (dir 3)
  getCell(0, 4).kind = 'link'
  getCell(0, 4).runeId = 'ArmorPenetration' // NW (dir 5)

  // 3. Skok Bojowy (Leap Attack) na (4, 1)
  const leap = getCell(4, 1)
  leap.kind = 'skill'
  leap.runeId = 'LeapAttack'
  leap.slots = ['blue', 'red', 'white', 'white', 'white', 'white']
  getCell(3, 1).kind = 'link'
  getCell(3, 1).runeId = 'UseCount' // NE (dir 0)
  getCell(4, 2).kind = 'link'
  getCell(4, 2).runeId = 'AdditionalPhysicalDMG' // E (dir 1)

  board.runestones = [
    'DMGAmplificationMagicRunestone',
    'AreaOfEffectMagicRunestone',
    'HPRecoveryMagicRunestone',
  ]
  return board
}

// Funkcja pomocnicza do tworzenia planszy łucznika
function createArcherBoard() {
  const board = createDefaultBoard(5, 6)
  const getCell = (r, c) => board.cells.find((cell) => cell.row === r && cell.col === c)

  // 1. Wystrzał Rozproszony (Spread Shot) na (1, 1) - czyszczenie ekranu
  const ss = getCell(1, 1)
  ss.kind = 'skill'
  ss.runeId = 'SpreadShot'
  ss.slots = ['green', 'red', 'green', 'green', 'green', 'green']

  getCell(0, 2).kind = 'link'
  getCell(0, 2).runeId = 'Multishot' // NE (dir 0)
  getCell(1, 2).kind = 'link'
  getCell(1, 2).runeId = 'AdditionalPhysicalDMG' // E (dir 1)
  getCell(2, 2).kind = 'link'
  getCell(2, 2).runeId = 'QuickAttack' // SE (dir 2)
  getCell(2, 1).kind = 'link'
  getCell(2, 1).runeId = 'FindWeakness' // SW (dir 3) - Crit Rate
  getCell(1, 0).kind = 'link'
  getCell(1, 0).runeId = 'ProjectileAcceleration' // W (dir 4)
  getCell(0, 1).kind = 'link'
  getCell(0, 1).runeId = 'AmplifyPhysicalProjectileDMG' // NW (dir 5)

  // 2. Przeszywająca Strzała (Piercing Arrow) na (1, 4) - bossing i elity
  const pa = getCell(1, 4)
  pa.kind = 'skill'
  pa.runeId = 'PiercingArrow'
  pa.slots = ['green', 'green', 'green', 'green', 'green', 'red']

  getCell(0, 5).kind = 'link'
  getCell(0, 5).runeId = 'EliteSlayer' // NE (dir 0)
  getCell(1, 5).kind = 'link'
  getCell(1, 5).runeId = 'Precision' // E (dir 1)
  getCell(2, 5).kind = 'link'
  getCell(2, 5).runeId = 'Piercing' // SE (dir 2)
  getCell(2, 4).kind = 'link'
  getCell(2, 4).runeId = 'Aim' // SW (dir 3)
  getCell(1, 3).kind = 'link'
  getCell(1, 3).runeId = 'QuickAttack' // W (dir 4)
  getCell(0, 4).kind = 'link'
  getCell(0, 4).runeId = 'AttackDMGIncrease' // NW (dir 5)

  // 3. Przewrót (Roll) na (4, 1)
  const roll = getCell(4, 1)
  roll.kind = 'skill'
  roll.runeId = 'Roll'
  roll.slots = ['blue', 'red', 'white', 'white', 'white', 'white']
  getCell(3, 1).kind = 'link'
  getCell(3, 1).runeId = 'UseCount' // NE (dir 0)
  getCell(4, 2).kind = 'link'
  getCell(4, 2).runeId = 'DecreaseDuration' // E (dir 1)

  board.runestones = [
    'CriticalDMGMagicRunestone',
    'DMGAmplificationMagicRunestone',
    'ResourceCostMagicRunestone',
  ]
  return board
}

// Funkcja pomocnicza do tworzenia planszy wojownika DoT (Wheel Slash)
function createWheelSlashBoard() {
  const board = createDefaultBoard(5, 6)
  const getCell = (r, c) => board.cells.find((cell) => cell.row === r && cell.col === c)

  // 1. Cięcie Kołowe (Wheel Slash) na (1, 2)
  const ws = getCell(1, 2)
  ws.kind = 'skill'
  ws.runeId = 'WheelSlash'
  ws.slots = ['red', 'red', 'green', 'red', 'blue', 'red']

  getCell(0, 3).kind = 'link'
  getCell(0, 3).runeId = 'IronWill' // NE (dir 0)
  getCell(1, 3).kind = 'link'
  getCell(1, 3).runeId = 'GripStrength' // E (dir 1)
  getCell(2, 3).kind = 'link'
  getCell(2, 3).runeId = 'QuickAttack' // SE (dir 2)
  getCell(2, 2).kind = 'link'
  getCell(2, 2).runeId = 'AdditionalPhysicalDMG' // SW (dir 3)
  getCell(1, 1).kind = 'link'
  getCell(1, 1).runeId = 'DoTEnhancement' // W (dir 4)
  getCell(0, 2).kind = 'link'
  getCell(0, 2).runeId = 'Savagery' // NW (dir 5)

  // 2. Skok Bojowy (Leap Attack) na (4, 1)
  const leap = getCell(4, 1)
  leap.kind = 'skill'
  leap.runeId = 'LeapAttack'
  leap.slots = ['blue', 'red', 'white', 'white', 'white', 'white']
  getCell(3, 1).kind = 'link'
  getCell(3, 1).runeId = 'UseCount'
  getCell(4, 2).kind = 'link'
  getCell(4, 2).runeId = 'AdditionalPhysicalDMG'

  board.runestones = [
    'DMGAmplificationMagicRunestone',
    'AreaOfEffectMagicRunestone',
    'HPRecoveryMagicRunestone',
  ]
  return board
}

const mageBoard = createMageBoard()
const warriorBoard = createWarriorBoard()
const archerBoard = createArcherBoard()
const wheelSlashBoard = createWheelSlashBoard()

export const PRESET_BUILDS = [
  {
    id: 'preset-mage-fireball-meteor',
    title: 'Mag Ognia: Kula Ognia & Deszcz Meteorów (Fire Ball + Meteor)',
    class: 'wizard',
    category: 'Mag (Mage)',
    badge: 'Meta S-Tier',
    difficulty: 'Średni',
    playstyle: 'Rzucanie zaklęć z dystansu, potężny burst AoE',
    author: 'Undecember Meta',
    created_at: '2026-10-26T18:00:00.000Z',
    description: `Jeden z najbardziej widowiskowych i niszczycielskich buildów czarodzieja w Undecember. 

Główna mechanika:
Kula Ognia (Fire Ball) rzucana jest masowo (wsparta przez Wielostrzał i Burzę Many), a dzięki połączeniu runą "Spell Activation on Spell Hit" każde uderzenie kuli automatycznie wyzwala gigantyczny Meteor spadający prosto na głowy wrogów i bossów.

Wskazówki dotyczące Zodiaku i Statystyk:
• Inteligencja (INT) jako priorytet pod skalowanie obrażeń zaklęć i barierę energetyczną.
• Zodiak: Inwestuj w węzły Obrażeń od Żywiołów (Element DMG), Obrażenia od Ognia, Przebicie Żywiołów oraz Zwiększenie Obszaru Działania.
• Ekwipunek: Szukaj Różdżek (Wand) lub Kosturów (Staff) z wysokim Cast Speed i % Fire DMG. Na biżuterii zbieraj płaskie obrażenia od ognia i regenerację many.`,
    data: {
      board: mageBoard,
      slots: syncBoardToLegacySlots(mageBoard),
      equipment: {
        ...emptyEquipment(),
        weapon: 'WillOfFire',
        helmet: 'StarChasersHelmet',
        bodyArmor: 'StarChasersArmor',
        gloves: 'FirebirdChill',
        boots: 'StarChasersBoots',
        shoulders: 'DutyOfFlame',
        necklace: 'SparkFirePendant',
        ring1: 'StarChasersRing',
        belt: 'StarChasersBelt',
        runestone1: 'DMGAmplificationMagicRunestone',
        runestone2: 'AreaOfEffectMagicRunestone',
        runestone3: 'ResourceCostMagicRunestone',
      },
    },
  },

  {
    id: 'preset-warrior-whirlwind',
    title: 'Wojownik Berserker: Trąba Powietrzna & Topory Iluzji (Whirlwind)',
    class: 'warrior',
    category: 'Wojownik (Warrior)',
    badge: 'Najlepszy Starter',
    difficulty: 'Łatwy',
    playstyle: 'Maksymalna mobilność w walce wręcz (Spin-to-Win)',
    author: 'Undecember Meta',
    created_at: '2026-10-26T18:15:00.000Z',
    description: `Klasyczny i niezawodny archetyp wojownika barbarzyńcy.

Główna mechanika:
Trąba Powietrzna (Whirlwind) pozwala nieprzerwanie poruszać się po mapie zadając nieustanne obrażenia fizyczne. W tle wspierają nas Topory Iluzji (Illusion Axe), które automatycznie wirują wokół postaci przy każdym ataku. Do pokonywania przeszkód i doskoku służy Skok Bojowy (Leap Attack).

Wskazówki dotyczące Zodiaku i Statystyk:
• Siła (STR) jako główny atrybut zwiększający zdrowie i obrażenia broni dwuręcznych.
• Żelazna Wola (Iron Will) sprawia, że im większa pula Twojego maksymalnego życia, tym potężniejszy mnożnik obrażeń otrzymujesz!
• Zodiak: Maksymalne Zdrowie (HP), Pancerz, Obrażenia w Zwarciu (Melee DMG) oraz Kradzież Życia (Life Leech).
• Ekwipunek: Dwuręczny Topór lub Miecz o wysokich bazowych obrażeniach fizycznych, pancerz ze zbroją i życiem.`,
    data: {
      board: warriorBoard,
      slots: syncBoardToLegacySlots(warriorBoard),
      equipment: {
        ...emptyEquipment(),
        weapon: 'StarChasersTwo-HandedAxe',
        helmet: 'StarChasersHelmet',
        bodyArmor: 'StarChasersArmor',
        gloves: 'StarChasersGauntlets',
        boots: 'StarChasersBoots',
        shoulders: 'StarChasersSpaulders',
        necklace: 'StarChasersNecklace',
        ring1: 'StarChasersRing',
        belt: 'StarChasersBelt',
        runestone1: 'DMGAmplificationMagicRunestone',
        runestone2: 'AreaOfEffectMagicRunestone',
        runestone3: 'HPRecoveryMagicRunestone',
      },
    },
  },

  {
    id: 'preset-archer-spreadshot',
    title: 'Łucznik Snajper: Wystrzał Rozproszony & Przeszywająca Strzała (Spread Shot)',
    class: 'archer',
    category: 'Łucznik (Archer)',
    badge: 'Wysoki DPS Dystansowy',
    difficulty: 'Średni',
    playstyle: 'Bezpieczny zasięg, szybki kiting, krytyki niszczące ekran',
    author: 'Undecember Meta',
    created_at: '2026-10-26T18:30:00.000Z',
    description: `Król czyszczenia map i bezpiecznej progresji przez wszystkie akty i Chaos Dungeony.

Główna mechanika:
Wystrzał Rozproszony (Spread Shot) w połączeniu z Wielostrzałem tworzy potężną ścianę strzał rozbijającą grupy wrogów z daleka. Do walki z twardymi bossami używamy Przeszywającej Strzały (Piercing Arrow), która skupia obrażenia i nakłada wysokie trafienia krytyczne. Przewrót (Roll) zapewnia stałą mobilność.

Wskazówki dotyczące Zodiaku i Statystyk:
• Zręczność (DEX) jako fundament pod celność, uniki i obrażenia łuku.
• Krytyki: Inwestuj w Szansę na Trafienie Krytyczne (Crit Rate) oraz Mnożnik Obrażeń Krytycznych (Crit DMG).
• Szybkość Ataku: Im wyższy Attack Speed na łuku (minimum 1.2+ bazy), tym płynniejsza animacja i szybszy dps.
• Ekwipunek: Łuk i Kołczan z afiksami pod Flat Physical DMG, Attack Speed i Crit. Zbroja z unikami (Dodge).`,
    data: {
      board: archerBoard,
      slots: syncBoardToLegacySlots(archerBoard),
      equipment: {
        ...emptyEquipment(),
        weapon: 'StarChasersBow',
        helmet: 'StarChasersHelmet',
        bodyArmor: 'TwilightVeil',
        gloves: 'MortalGrasp',
        boots: 'StarChasersBoots',
        shoulders: 'StarChasersSpaulders',
        necklace: 'StarChasersNecklace',
        ring1: 'StarChasersRing',
        belt: 'StarChasersBelt',
        runestone1: 'CriticalDMGMagicRunestone',
        runestone2: 'DMGAmplificationMagicRunestone',
        runestone3: 'ResourceCostMagicRunestone',
      },
    },
  },

  {
    id: 'preset-warrior-wheelslash',
    title: 'Wojownik Krwawego Cięcia (Wheel Slash Physical DoT)',
    class: 'warrior',
    category: 'Wojownik (Warrior)',
    badge: 'Boss Melter Meta',
    difficulty: 'Zaawansowany',
    playstyle: 'Cięcie w zwarciu, kumulujące się krwawienie DoT, wysoki pancerz',
    author: 'Undecember Meta',
    created_at: '2026-10-26T18:45:00.000Z',
    description: `Jeden z najpotężniejszych buildów pod obrażenia rozłożone w czasie (DoT) w historii Undecember.

Główna mechanika:
Cięcie Kołowe (Wheel Slash) zadaje szybkie serie obrażeń fizycznych nakładających niszczycielskie krwawienie. Skalowane przez Żelazną Wolę (Iron Will), Siłę Chwytu oraz Wzmocnienie DoT, pozwala topić punkty życia najtrudniejszych bossów bez ryzyka przestojów w zadawaniu obrażeń.

Wskazówki dotyczące Zodiaku i Statystyk:
• Pula Zdrowia: Maksymalizuj HP na każdym elemencie ekwipunku ze względu na potężne skalowanie runy Iron Will.
• Szybkość Ataku: Kluczowa dla szybkiego nakładania maksymalnych ładunków krwawienia.
• Zodiak: Drzewka pod Obrażenia DoT, Obrażenia Fizyczne, Regenerację Zdrowia i Redukcję Obrażeń.`,
    data: {
      board: wheelSlashBoard,
      slots: syncBoardToLegacySlots(wheelSlashBoard),
      equipment: {
        ...emptyEquipment(),
        weapon: 'StarChasersTwo-HandedAxe',
        helmet: 'StarChasersHelmet',
        bodyArmor: 'StarChasersArmor',
        gloves: 'StarChasersGauntlets',
        boots: 'StarChasersBoots',
        shoulders: 'StarChasersSpaulders',
        necklace: 'StarChasersNecklace',
        ring1: 'StarChasersRing',
        belt: 'StarChasersBelt',
        runestone1: 'DMGAmplificationMagicRunestone',
        runestone2: 'AreaOfEffectMagicRunestone',
        runestone3: 'HPRecoveryMagicRunestone',
      },
    },
  },
]

export function getPresetBuild(id) {
  if (!id) return null
  return PRESET_BUILDS.find((p) => p.id === id) || null
}
