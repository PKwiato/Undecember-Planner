import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { supabase } from '../lib/supabase'
import { CLASSES, SKILLS, find } from '../data/game'
import { useAuth } from '../context/AuthContext'
import Socket from '../components/Socket'

export default function Browse() {
  const { user } = useAuth()
  const [rows, setRows] = useState(null)
  const [filter, setFilter] = useState('all') // 'all' | 'my'

  useEffect(() => {
    supabase
      .from('builds')
      .select('id,title,class,data,created_at,user_id')
      .order('created_at', { ascending: false })
      .limit(48)
      .then(({ data }) => setRows(data || []))
  }, [])

  const filteredRows = useMemo(() => {
    if (!rows) return []
    if (filter === 'my' && user) {
      return rows.filter((r) => r.user_id === user.id)
    }
    return rows
  }, [rows, filter, user])

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-white">Przeglądaj Buildy</h1>
          <p className="mt-1 text-sm text-mist">Odkryj buildy stworzone przez społeczność Undecember</p>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex rounded-full border border-edge bg-panel/80 p-1">
              <button
                onClick={() => setFilter('all')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  filter === 'all' ? 'bg-gold text-ink font-bold' : 'text-mist hover:text-white'
                }`}
              >
                Wszystkie ({rows.length})
              </button>
              <button
                onClick={() => setFilter('my')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  filter === 'my' ? 'bg-gold text-ink font-bold' : 'text-mist hover:text-white'
                }`}
              >
                Moje buildy ({rows.filter((r) => r.user_id === user.id).length})
              </button>
            </div>
          )}
          <Link
            to="/"
            className="rounded-full bg-gold px-5 py-2 font-display text-xs font-bold text-ink hover:bg-gold-hover"
          >
            + Nowy build
          </Link>
        </div>
      </div>

      {filter === 'my' && filteredRows.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-mist">Nie zapisałeś jeszcze żadnego buildu na tym koncie.</p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-full bg-gold px-6 py-2 font-display text-xs font-bold text-ink hover:bg-gold-hover"
          >
            Stwórz swój build ⚔
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRows.map((r, i) => {
            const c = find(CLASSES, r.class)
            const isMine = user && r.user_id === user.id
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
                  className="group relative flex items-center gap-4 rounded-2xl border bg-panel/80 p-5 shadow-lg backdrop-blur-sm transition-all hover:bg-panel hover:shadow-gold/5"
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
                    <div className="flex items-center gap-2">
                      <p className="truncate font-display text-lg font-bold text-white group-hover:text-gold transition-colors">
                        {r.title}
                      </p>
                      {isMine && (
                        <span className="shrink-0 rounded bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold text-gold">
                          Twój
                        </span>
                      )}
                    </div>
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
      )}
    </section>
  )
}
