import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { supabase } from '../lib/supabase'
import { CLASSES, SKILLS, find } from '../data/game'
import Socket from '../components/Socket'

export default function Browse() {
  const [rows, setRows] = useState(null)

  useEffect(() => {
    supabase
      .from('builds')
      .select('id,title,class,data,created_at')
      .order('created_at', { ascending: false })
      .limit(48)
      .then(({ data }) => setRows(data || []))
  }, [])

  if (!rows) return <p className="text-mist">Ładowanie buildów…</p>
  if (!rows.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-mist">Nie ma jeszcze żadnych buildów w bazie.</p>
        <Link
          to="/"
          className="mt-4 inline-block rounded-full bg-gold px-6 py-2.5 font-display text-sm font-bold text-ink hover:bg-gold-hover"
        >
          Stwórz swój pierwszy build ⚔
        </Link>
      </div>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-white">Przeglądaj Buildy</h1>
          <p className="mt-1 text-sm text-mist">Odkryj buildy stworzone przez społeczność Undecember</p>
        </div>
        <Link
          to="/"
          className="rounded-full bg-gold px-5 py-2 font-display text-xs font-bold text-ink hover:bg-gold-hover"
        >
          + Nowy build
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r, i) => {
          const c = find(CLASSES, r.class)
          const firstSkillId =
            r.data?.slots?.find((s) => s.skill)?.skill ||
            r.data?.board?.cells?.find((cell) => cell.kind === 'skill' && cell.runeId)?.runeId
          const mainSkill = firstSkillId ? find(SKILLS, firstSkillId) : null

          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 8) * 0.05 }}
            >
              <Link
                to={`/build/${r.id}`}
                className="group flex items-center gap-4 rounded-2xl border bg-panel/80 p-5 shadow-lg backdrop-blur-sm transition-all hover:bg-panel hover:shadow-gold/5"
                style={{ borderColor: (c?.color || '#3a2f5c') + '55' }}
              >
                {mainSkill ? (
                  <Socket item={mainSkill} kind="skills" size={54} />
                ) : (
                  <div
                    className="grid h-12 w-12 place-items-center rounded-xl font-display text-lg font-bold"
                    style={{ background: (c?.color || '#3a2f5c') + '22', color: c?.color || '#d9b25f' }}
                  >
                    UD
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate font-display text-lg font-bold text-white group-hover:text-gold transition-colors">
                    {r.title}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold" style={{ color: c?.color }}>
                    {c?.name}
                  </p>
                  {mainSkill && (
                    <p className="mt-1 truncate text-[11px] text-mist/70">
                      Główny skill: <span className="text-white/90">{mainSkill.name}</span>
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
