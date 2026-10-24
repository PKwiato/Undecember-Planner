// PRZYKŁADOWE DANE. Zastąp własnymi po sprawdzeniu aktualnego patcha gry.
// Zasady linkowania (jak w grze): Link Rune wchodzi do slotu Skill Runa, jeśli
// 1) kolor slotu = kolor Link Runa, oraz 2) skill ma wszystkie tagi z `requires`.

export const CLASSES = [
  { id: 'warrior', name: 'Wojownik', color: '#e0603a' },
  { id: 'wizard', name: 'Czarodziej', color: '#6b8cff' },
  { id: 'assassin', name: 'Zabójca', color: '#a35bff' },
  { id: 'archer', name: 'Łucznik', color: '#4fc38a' },
]
export const RARITY = { normal: '#9aa0ae', magic: '#5b8def', rare: '#e8c25a', legend: '#ff7a3d' }

// Kolory slotów: czerwony = Siła, niebieski = Inteligencja, zielony = Zręczność
export const ELEMENTS = {
  red: { name: 'Siła', hex: '#e0603a' },
  blue: { name: 'Inteligencja', hex: '#5b8def' },
  green: { name: 'Zręczność', hex: '#4fc38a' },
}
export const SLOT_COLORS = ['red', 'blue', 'green']
export const LINK_SLOTS = 6

export const TAGS = {
  spell: 'Czar', projectile: 'Pocisk', fire: 'Ogień',
  melee: 'Wręcz', physical: 'Fizyczny', summon: 'Przywołanie',
}

// id = nazwa pliku ikony: public/assets/skills/<id>.png
export const SKILLS = [
  { id: 's1', name: 'Fire Ball', rarity: 'rare', color: 'blue', tags: ['spell', 'projectile', 'fire'] },
  { id: 's2', name: 'Whirlwind', rarity: 'magic', color: 'red', tags: ['melee', 'physical'] },
  { id: 's3', name: 'Skill C', rarity: 'legend', color: 'green', tags: ['projectile', 'physical'] },
  { id: 's4', name: 'Skill D', rarity: 'normal', color: 'red', tags: ['melee', 'fire'] },
  { id: 's5', name: 'Skill E', rarity: 'rare', color: 'blue', tags: ['spell', 'summon'] },
  { id: 's6', name: 'Skill F', rarity: 'magic', color: 'green', tags: ['melee', 'physical'] },
]

// id = nazwa pliku ikony: public/assets/links/<id>.png
export const LINKS = [
  { id: 'multishot', name: 'Multishot', rarity: 'rare', color: 'green', requires: ['projectile'] },
  { id: 'piercing', name: 'Piercing', rarity: 'magic', color: 'green', requires: ['projectile'] },
  { id: 'chain', name: 'Chain', rarity: 'magic', color: 'blue', requires: ['projectile'] },
  { id: 'time-accel', name: 'Time Acceleration', rarity: 'rare', color: 'blue', requires: [] },
  { id: 'finishing-blow', name: 'Finishing Blow', rarity: 'legend', color: 'red', requires: ['summon'] },
  { id: 'fire-amp', name: 'Fire Amplify', rarity: 'magic', color: 'red', requires: ['fire'] },
  { id: 'phys-amp', name: 'Physical Amplify', rarity: 'normal', color: 'red', requires: ['physical'] },
  { id: 'spell-amp', name: 'Spell Amplify', rarity: 'magic', color: 'blue', requires: ['spell'] },
]

export const find = (list, id) => list.find((x) => x.id === id)

export const iconUrl = (kind, id) => `${import.meta.env.BASE_URL}assets/${kind}/${id}.png`

// Czy Link Rune może wejść do slotu o danym kolorze w danym skillu?
export function canLink(skill, slotColor, link) {
  if (!skill) return { ok: false, reason: 'Najpierw wybierz skill' }
  if (link.color !== slotColor) {
    return { ok: false, reason: `Kolor runa: ${ELEMENTS[link.color].name}, slot: ${ELEMENTS[slotColor].name}` }
  }
  const missing = (link.requires || []).filter((t) => !skill.tags.includes(t))
  if (missing.length) return { ok: false, reason: 'Skill musi mieć tag: ' + missing.map((t) => TAGS[t]).join(', ') }
  return { ok: true }
}

// Slot buildu: { skill, links: [{ c: kolor slotu, r: id link runa | null }] x6 }
export const emptySlot = () => ({
  skill: null,
  links: Array.from({ length: LINK_SLOTS }, () => ({ c: 'red', r: null })),
})

// Stare buildy (z polem `runes`) i niekompletne dane trafiają tu i dostają poprawny kształt.
export const normalizeSlot = (s) => ({
  skill: s?.skill ?? null,
  links: Array.from({ length: LINK_SLOTS }, (_, k) => ({
    c: ELEMENTS[s?.links?.[k]?.c] ? s.links[k].c : 'red',
    r: s?.links?.[k]?.r ?? null,
  })),
})

// Zmiana skilla: puste sloty biorą kolor skilla, runy które przestały pasować wypadają.
export function withSkill(slot, id) {
  const skill = find(SKILLS, id)
  return {
    skill: id,
    links: slot.links.map((l) => {
      const c = l.r || !skill ? l.c : skill.color
      const link = find(LINKS, l.r)
      return { c, r: link && skill && canLink(skill, c, link).ok ? l.r : null }
    }),
  }
}
export function withLinkColor(slot, k, c) {
  const skill = find(SKILLS, slot.skill)
  const link = find(LINKS, slot.links[k].r)
  return {
    ...slot,
    links: slot.links.map((l, j) => j !== k ? l : { c, r: link && canLink(skill, c, link).ok ? l.r : null }),
  }
}
export const withLinkRune = (slot, k, r) => ({
  ...slot,
  links: slot.links.map((l, j) => (j === k ? { ...l, r } : l)),
})
