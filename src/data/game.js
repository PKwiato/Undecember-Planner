// PRZYKŁADOWE DANE. Zastąp własnymi po sprawdzeniu aktualnego patcha gry.
export const CLASSES = [
  { id: 'warrior', name: 'Wojownik', color: '#e0603a' },
  { id: 'wizard', name: 'Czarodziej', color: '#6b8cff' },
  { id: 'assassin', name: 'Zabójca', color: '#a35bff' },
  { id: 'archer', name: 'Łucznik', color: '#4fc38a' },
]
export const RARITY = { normal: '#9aa0ae', magic: '#5b8def', rare: '#e8c25a', legend: '#ff7a3d' }
export const SKILLS = [
  { id: 's1', name: 'Skill A', rarity: 'rare' },
  { id: 's2', name: 'Skill B', rarity: 'magic' },
  { id: 's3', name: 'Skill C', rarity: 'legend' },
  { id: 's4', name: 'Skill D', rarity: 'normal' },
  { id: 's5', name: 'Skill E', rarity: 'rare' },
  { id: 's6', name: 'Skill F', rarity: 'magic' },
]
export const RUNES = [
  { id: 'r1', name: 'Rune 1', rarity: 'magic' },
  { id: 'r2', name: 'Rune 2', rarity: 'rare' },
  { id: 'r3', name: 'Rune 3', rarity: 'legend' },
  { id: 'r4', name: 'Rune 4', rarity: 'normal' },
]
export const find = (list, id) => list.find((x) => x.id === id)
