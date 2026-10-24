import { motion } from 'motion/react'
import SkillHex from './SkillHex'
import { CLASSES, SKILLS, LINKS, ELEMENTS, find, normalizeSlot } from '../data/game'

// Read-only build. The slots light up one after another when the page opens.
export default function BuildSheet({ build }) {
  const cls = find(CLASSES, build.class)
  const slots = (build.data?.slots || []).map(normalizeSlot)
  return (
    <section>
      <h1 className="font-display text-4xl font-bold">{build.title}</h1>
      <p className="mt-1 font-display text-lg" style={{ color: cls?.color }}>{cls?.name}</p>
      {build.description && <p className="mt-4 max-w-prose whitespace-pre-line text-mist">{build.description}</p>}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((s, i) => {
          const skill = find(SKILLS, s.skill)
          const linked = s.links.filter((l) => find(LINKS, l.r))
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="flex flex-col items-center gap-2 rounded-xl border border-edge bg-panel p-4"
            >
              <SkillHex slot={s} slotNo={i + 1} size={230} />
              <p className="font-display text-lg">{skill?.name || 'Pusty slot'}</p>
              {skill && <p className="text-xs text-mist">Linki: {linked.length}/{s.links.length}</p>}
              <ul className="flex flex-wrap justify-center gap-1.5">
                {linked.map((l, k) => {
                  const link = find(LINKS, l.r)
                  const col = ELEMENTS[l.c].hex
                  return (
                    <li key={k} className="rounded-full border px-2.5 py-0.5 text-xs"
                      style={{ borderColor: col + '99', color: col }}>{link.name}</li>
                  )
                })}
              </ul>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
