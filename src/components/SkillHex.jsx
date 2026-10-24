import { motion } from 'motion/react'
import Socket from './Socket'
import { ELEMENTS, SKILLS, LINKS, LINK_SLOTS, find } from '../data/game'

// Skill w środku + 6 slotów linków na wierzchołkach heksagonu (jak w Rune Cast).
// Bez onSkill/onLink to widok tylko do odczytu.
export default function SkillHex({ slot, size = 240, onSkill, onLink, slotNo = 1 }) {
  const skill = find(SKILLS, slot.skill)
  const c = size / 2
  const R = size * 0.36
  const pts = Array.from({ length: LINK_SLOTS }, (_, k) => {
    const a = ((-90 + 60 * k) * Math.PI) / 180
    return { x: c + R * Math.cos(a), y: c + R * Math.sin(a) }
  })
  const skillSize = size * 0.36
  const linkSize = size * 0.19

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg className="absolute inset-0" width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden="true">
        <polygon points={pts.map((p) => `${p.x},${p.y}`).join(' ')} stroke="#3a2f5c" strokeWidth="1" strokeDasharray="2 5" />
        {pts.map((p, k) => {
          const l = slot.links[k]
          const col = ELEMENTS[l.c].hex
          return find(LINKS, l.r) ? (
            <motion.line key={`${k}-${l.r}`} x1={c} y1={c} x2={p.x} y2={p.y} stroke={col} strokeWidth="3"
              strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${col})` }}
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
          ) : (
            <line key={`${k}-empty`} x1={c} y1={c} x2={p.x} y2={p.y} stroke={col} strokeOpacity="0.25"
              strokeWidth="1" strokeDasharray="3 5" />
          )
        })}
      </svg>

      <div className="absolute" style={{ left: c - skillSize / 2, top: c - skillSize / 2 }}>
        <Socket size={skillSize} item={skill} kind="skills" label={`Skill, slot ${slotNo}`} onClick={onSkill} />
      </div>

      {pts.map((p, k) => {
        const l = slot.links[k]
        const link = find(LINKS, l.r)
        return (
          <div key={k} className="absolute" style={{ left: p.x - linkSize / 2, top: p.y - linkSize / 2 }}>
            <Socket round size={linkSize} item={link} kind="links" color={ELEMENTS[l.c].hex}
              label={`Link ${k + 1}, slot ${slotNo}: ${link?.name || 'pusty'} (${ELEMENTS[l.c].name})`}
              onClick={onLink ? () => onLink(k) : undefined} disabled={!skill} />
          </div>
        )
      })}
    </div>
  )
}
