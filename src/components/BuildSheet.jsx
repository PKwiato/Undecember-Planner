import { motion } from 'motion/react'
import Socket from './Socket'
import { CLASSES, SKILLS, RUNES, find } from '../data/game'

// Read-only build. The slots light up one after another when the page opens.
export default function BuildSheet({ build }) {
  const cls = find(CLASSES, build.class)
  return (
    <section>
      <h1 className="font-display text-4xl font-bold">{build.title}</h1>
      <p className="mt-1 font-display text-lg" style={{ color: cls?.color }}>{cls?.name}</p>
      {build.description && <p className="mt-4 max-w-prose whitespace-pre-line text-mist">{build.description}</p>}
      <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3">
        {build.data.slots.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            className="flex flex-col items-center gap-3 rounded-xl border border-edge bg-panel p-5"
          >
            <Socket item={find(SKILLS, s.skill)} size={92} />
            <p className="text-sm text-mist">{find(SKILLS, s.skill)?.name || 'Pusty slot'}</p>
            <div className="flex gap-2">
              {s.runes.map((r, k) => <Socket key={k} round size={34} item={find(RUNES, r)} />)}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
