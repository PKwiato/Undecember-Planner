import RUNES_DATA from './runes.json' with { type: 'json' }
import UNIQUES_DATA from './uniques.json' with { type: 'json' }
import RUNESTONES_DATA from './runestones.json' with { type: 'json' }

export const BASE_URL = 'https://undecember.thein.ru'

export const assetUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

export const iconSources = (kind, item) => {
  if (!item) return []
  const sources = []
  if (item.icon) {
    sources.push(assetUrl(item.icon))
  }
  // Local fallback if user downloaded files
  if (item.slug || item.id) {
    const id = item.slug || item.id
    sources.push(`${import.meta.env.BASE_URL}assets/${kind}/${id}.png`)
  }
  return sources
}

export const CLASSES = [
  { id: 'warrior', name: 'Wojownik (Warrior)', color: '#e0603a', primary: 'red' },
  { id: 'wizard', name: 'Czarodziej (Mage)', color: '#6b8cff', primary: 'blue' },
  { id: 'assassin', name: 'Zabójca (Shadow)', color: '#a35bff', primary: 'green' },
  { id: 'archer', name: 'Łucznik (Archer)', color: '#4fc38a', primary: 'green' },
]

export const RARITY = {
  normal: '#9aa0ae',
  magic: '#5b8def',
  rare: '#e8c25a',
  legend: '#ff7a3d',
  unique: '#e5453b',
}

// Kolory slotów: czerwony = Siła, niebieski = Inteligencja, zielony = Zręczność, biały = Uniwersalny
export const ELEMENTS = {
  red: { name: 'Siła (STR)', stat: 'Strength', hex: '#e0603a' },
  blue: { name: 'Inteligencja (INT)', stat: 'Intellect', hex: '#5b8def' },
  green: { name: 'Zręczność (DEX)', stat: 'Agility', hex: '#4fc38a' },
  white: { name: 'Uniwersalny (White)', stat: 'All', hex: '#ffffff' },
}

export const SLOT_COLORS = ['red', 'green', 'blue', 'white']
export const LINK_SLOTS = 6

export const RUNES = RUNES_DATA
export const SKILLS = RUNES_DATA.filter((r) => r.type === 'Skill')
export const LINKS = RUNES_DATA.filter((r) => r.type === 'LinkSkill')
export const UNIQUES = UNIQUES_DATA
export const RUNESTONES = RUNESTONES_DATA

// Legacy aliases mapping old IDs like s1..s6 to actual runes
const LEGACY_ALIASES = {
  s1: 'FireBall',
  s2: 'Whirlwind',
  s3: 'RapidShot',
  s4: 'FireBlow',
  s5: 'SummonFireOrbAbyssling',
  s6: 'CrossSlash',
  multishot: 'Multishot',
  piercing: 'Piercing',
  chain: 'Chain',
  'time-accel': 'TimeAcceleration',
  'finishing-blow': 'FinishingStrike',
  'fire-amp': 'AdditionalFireDMG',
  'phys-amp': 'AdditionalPhysicalDMG',
  'spell-amp': 'SpellDMGIncrease',
}

export function find(list, id) {
  if (!id) return null
  const target = LEGACY_ALIASES[id] || id
  return list.find((x) => x.id === target || x.slug === target || x.code === target || x.id === id || x.slug === id)
}

// Parser i reguły walidacji kompatybilności Link Runów ze skillami
const LINK_RULES_CACHE = new Map()

export function getLinkValidationRules(link) {
  if (!link) return { type: 'standard', andTags: [], orGroups: [], cannot: [] }
  const cacheKey = link.id || link.slug || link.name
  if (LINK_RULES_CACHE.has(cacheKey)) {
    return LINK_RULES_CACHE.get(cacheKey)
  }

  const desc = link.desc || ''
  const name = link.name || ''
  const id = link.id || link.slug || ''
  const rawReq = link.requires || []
  const cannot = (link.cannot || []).filter(Boolean)

  // Wyjątki / specyficzne przypadki:
  if (id === 'ReverseTime' || name === 'Reverse Time') {
    const rules = { type: 'standard', andTags: [], orGroups: [], cannot: ['Movement'] }
    LINK_RULES_CACHE.set(cacheKey, rules)
    return rules
  }
  if (id === 'Outlaw' || name === 'Outlaw') {
    const rules = { type: 'standard', andTags: ['Trap'], orGroups: [], cannot }
    LINK_RULES_CACHE.set(cacheKey, rules)
    return rules
  }
  if (id === 'LastingTrap' || name === 'Lasting Trap') {
    const rules = { type: 'standard', andTags: ['Overheat'], orGroups: [], cannot }
    LINK_RULES_CACHE.set(cacheKey, rules)
    return rules
  }
  if (id === 'TimeWarp' || name === 'Time Warp') {
    const rules = {
      type: 'standard',
      andTags: [],
      orGroups: [['Attack', 'Spell']],
      cannot: ['Channel', 'Totem', 'Sentry', 'Minion', 'Movement'],
    }
    LINK_RULES_CACHE.set(cacheKey, rules)
    return rules
  }
  if (id === 'UseCount' || name === 'Use Count') {
    const rules = { type: 'standard', andTags: [], orGroups: [], cannot }
    LINK_RULES_CACHE.set(cacheKey, rules)
    return rules
  }

  // Runy Wyzwalające (Trigger Runes - łączące skill aktywujący ze skillem docelowym)
  const isTrigger = Boolean(link.tags?.includes('Trigger') || name.toLowerCase().includes('activation'))
  if (isTrigger) {
    let act = []
    let target = []
    let targetCannot = ['Channel', 'Totem', 'Sentry', 'Minion', 'Movement', 'Toggle', 'Trap']

    if (name === 'Spell Activation on Attack Hit') {
      act = ['Attack', 'Strike']
      target = ['Spell']
      targetCannot = ['Attack', 'Channel', 'Totem', 'Sentry', 'Minion', 'Movement', 'Toggle', 'Trap']
    } else if (name === 'Spell Activation on Spell Hit') {
      act = ['Spell', 'Strike']
      target = ['Spell']
      targetCannot = ['Attack', 'Channel', 'Totem', 'Sentry', 'Minion', 'Movement', 'Toggle', 'Trap']
    } else if (name === 'Spell Activation on Hit') {
      act = ['Strike']
      target = ['Spell']
      targetCannot = [
        'Attack', 'Channel', 'Totem', 'Sentry', 'Minion', 'Movement', 'Toggle',
        'Shout', 'Attack Enhance', 'Defense Enhance', 'Trap',
      ]
    } else if (name === 'Spell Activation upon Enemy Kill') {
      act = ['Strike']
      target = ['Spell']
      targetCannot = ['Attack', 'Channel', 'Totem', 'Sentry', 'Minion', 'Movement', 'Toggle', 'Trap']
    } else if (name === 'Spell Activation while Channeling') {
      act = ['Channel']
      target = ['Spell']
      targetCannot = ['Attack', 'Channel', 'Totem', 'Sentry', 'Minion', 'Movement', 'Toggle', 'Trap']
    } else if (name === 'Buff Activation when Hit' || name === 'Buff Activation upon Crowd Control') {
      act = []
      target = ['Shout', 'Attack Enhance', 'Defense Enhance']
      targetCannot = ['Channel', 'Totem', 'Sentry', 'Minion', 'Movement', 'Toggle', 'Trap']
    } else if (name === 'Buff Activation upon using Movement Skill') {
      act = ['Movement']
      target = ['Shout', 'Attack Enhance', 'Defense Enhance']
      targetCannot = ['Channel', 'Totem', 'Sentry', 'Minion', 'Toggle']
    } else if (name === 'Totem Activation upon using Enhance Skill') {
      act = ['Attack Enhance', 'Defense Enhance']
      target = ['Totem']
      targetCannot = ['Channel', 'Sentry', 'Minion', 'Movement', 'Toggle']
    }

    const rules = { type: 'trigger', act, target, cannot, targetCannot }
    LINK_RULES_CACHE.set(cacheKey, rules)
    return rules
  }

  // Standardowe linki: parsowanie grup alternatywnych (OR)
  const orGroups = []
  const andTags = []

  if (desc.includes('any one of')) {
    if (desc.includes('any one of Strike, DoT')) orGroups.push(['Strike', 'DoT'])
    if (desc.includes('any one of Attack, Spell')) orGroups.push(['Attack', 'Spell'])
    if (desc.includes('any one of Fire, Cold, Lightning, Poison')) orGroups.push(['Fire', 'Cold', 'Lightning', 'Poison'])
    if (desc.includes('any one of Attack Seal, Defense Seal')) orGroups.push(['Attack Seal', 'Defense Seal'])
    if (desc.includes('any one of Bow, Sentry')) orGroups.push(['Bow', 'Sentry'])
    if (desc.includes('any one of Shout, Attack Enhance, Defense Enhance, Rapid Seal')) {
      orGroups.push(['Shout', 'Attack Enhance', 'Defense Enhance', 'Rapid Seal'])
    }

    const covered = new Set(orGroups.flat().map((t) => t.toLowerCase()))
    for (const t of rawReq) {
      if (!covered.has(t.toLowerCase())) {
        andTags.push(t)
      }
    }
    const rules = { type: 'standard', andTags, orGroups, cannot }
    LINK_RULES_CACHE.set(cacheKey, rules)
    return rules
  }

  const rules = { type: 'standard', andTags: rawReq, orGroups: [], cannot }
  LINK_RULES_CACHE.set(cacheKey, rules)
  return rules
}

// Sprawdza kompatybilność Link Runa ze skillem i kolorem slotu
export function canLink(skill, slotColor, link) {
  if (!skill) return { ok: false, reason: 'Najpierw wybierz skill' }
  if (slotColor !== 'white' && link.color !== slotColor) {
    const linkElem = ELEMENTS[link.color]?.name || link.stat
    const slotElem = ELEMENTS[slotColor]?.name || slotColor
    return { ok: false, reason: `Wymaga slotu ${linkElem} (obecny: ${slotElem})` }
  }

  const rules = getLinkValidationRules(link)

  // Obsługa run wyzwalających (Trigger Runes)
  if (rules.type === 'trigger') {
    const actMatches =
      rules.act.length > 0 &&
      rules.act.every((t) =>
        skill.tags?.some((st) => st.toLowerCase() === t.toLowerCase())
      )

    const targetHasForbidden = rules.targetCannot?.some((t) =>
      skill.tags?.some((st) => st.toLowerCase() === t.toLowerCase())
    )
    const targetMatches =
      !targetHasForbidden &&
      rules.target.length > 0 &&
      rules.target.some((t) =>
        skill.tags?.some((st) => st.toLowerCase() === t.toLowerCase())
      )

    if (actMatches || targetMatches) {
      return { ok: true }
    }

    const actPart = rules.act.length > 0 ? `aktywującego (${rules.act.join(', ')})` : null
    const targetPart = rules.target.length > 0 ? `docelowego (${rules.target.join(' / ')})` : null
    const parts = [actPart, targetPart].filter(Boolean).join(' lub ')
    return {
      ok: false,
      reason: `Wymaga skilla ${parts || 'kompatybilnego z wyzwalaczem'}`,
    }
  }

  // Sprawdzenie tagów zakazanych (cannot)
  if (rules.cannot && rules.cannot.length > 0) {
    const forbidden = rules.cannot.filter((t) =>
      skill.tags?.some((st) => st.toLowerCase() === t.toLowerCase())
    )
    if (forbidden.length > 0) {
      return { ok: false, reason: `Wykluczone przez tag: ${forbidden.join(', ')}` }
    }
  }

  // Sprawdzenie wymaganych tagów bezwzględnych (AND)
  if (rules.andTags && rules.andTags.length > 0) {
    const missing = rules.andTags.filter(
      (t) => !skill.tags?.some((st) => st.toLowerCase() === t.toLowerCase())
    )
    if (missing.length > 0) {
      return { ok: false, reason: `Wymaga tagu: ${missing.join(', ')}` }
    }
  }

  // Sprawdzenie grup alternatywnych (OR)
  if (rules.orGroups && rules.orGroups.length > 0) {
    for (const group of rules.orGroups) {
      const matches = group.some((t) =>
        skill.tags?.some((st) => st.toLowerCase() === t.toLowerCase())
      )
      if (!matches) {
        return {
          ok: false,
          reason: `Wymaga co najmniej jednego z tagów: ${group.join(', ')}`,
        }
      }
    }
  }

  return { ok: true }
}

// Pusty slot na skill + 6 linków
export const emptySlot = () => ({
  skill: null,
  links: Array.from({ length: LINK_SLOTS }, () => ({ c: 'red', r: null })),
})

// Normalizacja starych i nowych slotów
export const normalizeSlot = (s) => ({
  skill: s?.skill ?? null,
  links: Array.from({ length: LINK_SLOTS }, (_, k) => ({
    c: ELEMENTS[s?.links?.[k]?.c] ? s.links[k].c : 'red',
    r: s?.links?.[k]?.r ?? null,
  })),
})

// Zmiana skilla: dostosowuje sloty i usuwa linki, które przestały pasować
export function withSkill(slot, id) {
  const skill = find(SKILLS, id)
  return {
    skill: skill?.slug || id,
    links: slot.links.map((l) => {
      const c = l.r || !skill ? l.c : skill.color
      const link = find(LINKS, l.r)
      return { c, r: link && skill && canLink(skill, c, link).ok ? l.r : null }
    }),
  }
}

// Zmiana koloru slotu linku
export function withLinkColor(slot, k, c) {
  const skill = find(SKILLS, slot.skill)
  const link = find(LINKS, slot.links[k].r)
  return {
    ...slot,
    links: slot.links.map((l, j) =>
      j !== k ? l : { c, r: link && canLink(skill, c, link).ok ? l.r : null }
    ),
  }
}

// Przypisanie runa linku do konkretnego slotu
export const withLinkRune = (slot, k, r) => ({
  ...slot,
  links: slot.links.map((l, j) => (j === k ? { ...l, r } : l)),
})

// Pusty zestaw ekwipunku
export const emptyEquipment = () => ({
  weapon: null,
  helmet: null,
  bodyArmor: null,
  gloves: null,
  boots: null,
  shoulders: null,
  necklace: null,
  ring1: null,
  ring2: null,
  belt: null,
  runestone1: null,
  runestone2: null,
  runestone3: null,
})

export const GEAR_SLOTS = [
  { key: 'weapon', label: 'Broń / Tarcza', slot: 'Weapon' },
  { key: 'helmet', label: 'Hełm', slot: 'Helmet' },
  { key: 'bodyArmor', label: 'Zbroja', slot: 'BodyArmor' },
  { key: 'gloves', label: 'Rękawice', slot: 'Gloves' },
  { key: 'boots', label: 'Buty', slot: 'Boots' },
  { key: 'shoulders', label: 'Naramienniki', slot: 'Shoulders' },
  { key: 'necklace', label: 'Naszyjnik', slot: 'Necklace' },
  { key: 'ring1', label: 'Pierścień 1', slot: 'Ring' },
  { key: 'ring2', label: 'Pierścień 2', slot: 'Ring' },
  { key: 'belt', label: 'Pas', slot: 'Belt' },
]

export const RUNESTONE_SLOTS = [
  { key: 'runestone1', label: 'Kamień Runiczny 1' },
  { key: 'runestone2', label: 'Kamień Runiczny 2' },
  { key: 'runestone3', label: 'Kamień Runiczny 3' },
]

// ==========================================
// RUNE CAST BOARD (Siatka 30 slotów / Honeycomb)
// ==========================================

export const HEX_DIRECTIONS = [
  { dir: 0, name: 'NE', label: 'Północny-Wschód (NE)', angle: -60 },
  { dir: 1, name: 'E',  label: 'Wschód (E)',            angle: 0 },
  { dir: 2, name: 'SE', label: 'Południowy-Wschód (SE)', angle: 60 },
  { dir: 3, name: 'SW', label: 'Południowy-Zachód (SW)', angle: 120 },
  { dir: 4, name: 'W',  label: 'Zachód (W)',            angle: 180 },
  { dir: 5, name: 'NW', label: 'Północny-Zachód (NW)',   angle: 240 },
]

// Sąsiedzi dla siatki heksagonalnej z wierzchołkiem u góry (pointy-topped) w układzie odd-r
export function getNeighborCoord(r, c, dir) {
  const isOdd = r % 2 !== 0
  switch (dir) {
    case 0: // NE
      return isOdd ? { row: r - 1, col: c + 1 } : { row: r - 1, col: c }
    case 1: // E
      return { row: r, col: c + 1 }
    case 2: // SE
      return isOdd ? { row: r + 1, col: c + 1 } : { row: r + 1, col: c }
    case 3: // SW
      return isOdd ? { row: r + 1, col: c } : { row: r + 1, col: c - 1 }
    case 4: // W
      return { row: r, col: c - 1 }
    case 5: // NW
      return isOdd ? { row: r - 1, col: c } : { row: r - 1, col: c - 1 }
    default:
      return null
  }
}

export function getOppositeDirection(dir) {
  return (dir + 3) % 6
}

// Obliczenia metryki i pozycji heksagonów na planszy
export function getHexMetrics(radius = 42, padding = 24) {
  const R = radius
  const W = Math.sqrt(3) * R
  const H = 2 * R
  const vStep = 1.5 * R
  const hStep = W
  const apothem = (Math.sqrt(3) / 2) * R

  return {
    R,
    W,
    H,
    vStep,
    hStep,
    padding,
    getCellCenter: (row, col) => {
      const isOdd = row % 2 !== 0
      const x = padding + (col + (isOdd ? 0.5 : 0)) * hStep + W / 2
      const y = padding + row * vStep + H / 2
      return { x, y }
    },
    getEdgeMidpoint: (cx, cy, dir) => {
      const angleRad = ((-60 + dir * 60) * Math.PI) / 180
      return {
        x: cx + apothem * Math.cos(angleRad),
        y: cy + apothem * Math.sin(angleRad),
      }
    },
    getBoardDimensions: (rows, cols) => {
      const width = padding * 2 + (cols + 0.5) * hStep
      const height = padding * 2 + (rows > 0 ? (rows - 1) * vStep + H : H)
      return { width, height }
    },
  }
}

// Tworzy domyślną pustą planszę (np. 5 wierszy x 6 kolumn = 30 slotów jak w grze)
export function createDefaultBoard(rows = 5, cols = 6) {
  const cells = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        id: `c-${r}-${c}`,
        row: r,
        col: c,
        runeId: null,
        kind: null, // 'skill' | 'link' | null
        // 6 slotów dla skilli (kierunki NE, E, SE, SW, W, NW)
        slots: ['red', 'red', 'red', 'red', 'red', 'red'],
      })
    }
  }
  return {
    rows,
    cols,
    cells,
    runestones: [null, null, null],
  }
}

// Oblicza wszystkie aktywne połączenia między skillami a linkami na planszy
export function calculateBoardLinks(board) {
  if (!board || !board.cells) return { links: [], skillsSummary: [], cellLinkStatus: {} }

  const cellMap = new Map()
  for (const cell of board.cells) {
    cellMap.set(`${cell.row}_${cell.col}`, cell)
  }

  const links = []
  const skillsSummary = []
  const cellLinkStatus = {}

  for (const cell of board.cells) {
    if (cell.kind === 'skill' && cell.runeId) {
      const skill = find(SKILLS, cell.runeId)
      if (!skill) continue

      const connectedLinks = []
      const blockedLinks = []
      const skillSlots = cell.slots || ['red', 'red', 'red', 'red', 'red', 'red']

      for (let dir = 0; dir < 6; dir++) {
        const slotColor = skillSlots[dir]
        if (!slotColor) continue // brak aktywnego slotu na tej krawędzi

        const neighborCoord = getNeighborCoord(cell.row, cell.col, dir)
        if (!neighborCoord) continue

        const neighbor = cellMap.get(`${neighborCoord.row}_${neighborCoord.col}`)
        if (!neighbor || neighbor.kind !== 'link' || !neighbor.runeId) continue

        const linkRune = find(LINKS, neighbor.runeId)
        if (!linkRune) continue

        // Zasada Undecember: ten sam link rune nie może linkować się podwójnie do tego samego skilla
        if (connectedLinks.some((cl) => cl.link.id === linkRune.id || cl.link.slug === linkRune.slug)) {
          continue
        }

        const check = canLink(skill, slotColor, linkRune)
        if (check.ok) {
          const colorHex = slotColor === 'white' ? '#ffffff' : (ELEMENTS[slotColor]?.hex || '#d9b25f')
          const isTrigger = Boolean(linkRune.tags?.includes('Trigger') || linkRune.name?.toLowerCase().includes('activation'))
          const linkItem = {
            id: `${cell.id}-${dir}-${neighbor.id}`,
            skillCellId: cell.id,
            linkCellId: neighbor.id,
            skill,
            link: linkRune,
            slotColor,
            color: colorHex,
            direction: dir,
            isTrigger,
          }
          links.push(linkItem)
          connectedLinks.push({ link: linkRune, slotColor, cellId: neighbor.id, dir })

          if (!cellLinkStatus[neighbor.id]) cellLinkStatus[neighbor.id] = { linkedSkills: [], blockedSkills: [] }
          if (!cellLinkStatus[neighbor.id].linkedSkills) cellLinkStatus[neighbor.id].linkedSkills = []
          cellLinkStatus[neighbor.id].linkedSkills.push({ skill, slotColor, fromCellId: cell.id, dir })
        } else {
          blockedLinks.push({
            link: linkRune,
            slotColor,
            cellId: neighbor.id,
            dir,
            reason: check.reason,
          })
          if (!cellLinkStatus[neighbor.id]) cellLinkStatus[neighbor.id] = { linkedSkills: [], blockedSkills: [] }
          if (!cellLinkStatus[neighbor.id].blockedSkills) cellLinkStatus[neighbor.id].blockedSkills = []
          cellLinkStatus[neighbor.id].blockedSkills.push({
            skill,
            slotColor,
            fromCellId: cell.id,
            dir,
            reason: check.reason,
          })
        }
      }

      skillsSummary.push({
        cellId: cell.id,
        cell,
        skill,
        connectedLinks,
        blockedLinks,
        activeLinksCount: connectedLinks.length,
      })
    }
  }

  return { links, skillsSummary, cellLinkStatus }
}

// Synchronizuje stan planszy do formatu legacy (slots), zapewniając wsteczną kompatybilność
export function syncBoardToLegacySlots(board) {
  const { skillsSummary } = calculateBoardLinks(board)
  const legacySlots = Array.from({ length: 6 }, emptySlot)

  skillsSummary.slice(0, 6).forEach((summary, idx) => {
    const s = legacySlots[idx]
    s.skill = summary.skill.slug || summary.skill.id
    summary.connectedLinks.slice(0, 6).forEach((cl, linkIdx) => {
      s.links[linkIdx] = {
        c: cl.slotColor === 'white' ? summary.skill.color || 'red' : cl.slotColor,
        r: cl.link.slug || cl.link.id,
      }
    })
  })

  return legacySlots
}

// Konwertuje stary format builda (slots) do układu planszy
export function legacySlotsToBoard(legacySlots, rows = 5, cols = 6) {
  const board = createDefaultBoard(rows, cols)
  if (!legacySlots || !legacySlots.length) return board

  const cellMap = new Map()
  for (const cell of board.cells) {
    cellMap.set(`${cell.row}_${cell.col}`, cell)
  }

  // Punkty zakotwiczenia dla maksymalnie 6 skilli na planszy 5x6
  const anchors = [
    { row: 1, col: 1 },
    { row: 1, col: 4 },
    { row: 3, col: 1 },
    { row: 3, col: 4 },
    { row: 0, col: 2 },
    { row: 4, col: 2 },
  ]

  legacySlots.forEach((slot, i) => {
    if (!slot || !slot.skill) return
    const anchor = anchors[i]
    if (!anchor) return
    const skillCell = cellMap.get(`${anchor.row}_${anchor.col}`)
    if (!skillCell) return

    const skill = find(SKILLS, slot.skill)
    if (!skill) return

    skillCell.runeId = skill.slug || skill.id
    skillCell.kind = 'skill'
    skillCell.slots = Array.from({ length: 6 }, (_, k) => slot.links?.[k]?.c || skill.color || 'red')

    // Umieszcza linki w sąsiadujących komórkach, jeśli są puste
    if (slot.links) {
      slot.links.forEach((l, k) => {
        if (!l.r) return
        const link = find(LINKS, l.r)
        if (!link) return
        const nCoord = getNeighborCoord(anchor.row, anchor.col, k)
        if (!nCoord) return
        const nCell = cellMap.get(`${nCoord.row}_${nCoord.col}`)
        if (nCell && !nCell.runeId) {
          nCell.runeId = link.slug || link.id
          nCell.kind = 'link'
        }
      })
    }
  })

  return board
}
