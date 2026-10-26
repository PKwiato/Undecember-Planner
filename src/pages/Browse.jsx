import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { supabase } from '../lib/supabase'
import { CLASSES, SKILLS, find } from '../data/game'
import { PRESET_BUILDS } from '../data/presetBuilds'
import { useAuth } from '../context/AuthContext'
import Socket from '../components/Socket'

export default function Browse() {
  const { user } = useAuth()
  const [rows, setRows] = useState(null)
  const [filter, setFilter] = useState('meta') // 'meta' | 'all' | 'my'

  useEffect(() => {
    supabase
      .from('builds')
      .select('id,title,class,data,created_at,user_id')
      .order('created_at', { ascending: false })
      .limit(48)
      .then(({ data }) => setRows(data || []))
      .catch(() => setRows([]))
  }, [])

  const filteredRows = useMemo(() => {
    if (filter === 'meta') return PRESET_BUILDS
    if (!rows) return []
    if (filter === 'my' && user) {
      return rows.filter((r) => r.user_id === user.id)
    }
    return rows
  }, [rows, filter, user])

  const communityCount = rows?.length || 0
  const myCount = (rows && user) ? rows.filter((r) => r.user_id === user.id).length : 0

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-white">Przeglądaj Buildy</h1>
          <p className="mt-1 text-sm text-mist">
            Oficjalne wzorce meta (Mag, Wojownik, Łucznik) oraz buildy społeczności
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-full border border-edge bg-panel/80 p-1">
            <button
              onClick={() => setFilter('meta')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                filter === 'meta' ? 'bg-gold text-ink font-bold shadow' : 'text-mist hover:text-white'
              }`}
            >
              🔥 Wzorce Meta ({PRESET_BUILDS.length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-gold text-ink font-bold shadow' : 'text-mist hover:text-white'
              }`}
            >
              Społeczność ({communityCount})
            </button>
            {user && (
              <button
                onClick={() => setFilter('my')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  filter === 'my' ? 'bg-gold text-ink font-bold shadow' : 'text-mist hover:text-white'
                }`}
              >
                Moje buildy ({myCount})
              </button>
            )}
          </div>

          <Link
            to="/"
            className="rounded-full bg-gold px-5 py-2 font-display text-xs font-bold text-ink hover:bg-gold-hover"
          >
            + Nowy build
          </Link>
        </div>
      </div>

      {filter === 'all' && rows && rows.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg text-mist">Nie ma jeszcze buildów graczy w bazie danych.</p>
          <p className="mt-2 text-sm text-mist/70">
            Skorzystaj z gotowych wzorców Meta powyżej lub stwórz i zapisz pierwszy własny build!
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-full bg-gold px-6 py-2.5 font-display text-sm font-bold text-ink hover:bg-gold-hover"
          >
            Stwórz swój pierwszy build ⚔
          </Link>
        </div>
      )}

      {filter === 'my' && myCount === 0 && (
        <div className="py-16 text-center">
          <p className="text-mist">Nie zapisałeś jeszcze żadnego buildu na tym koncie.</p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-full bg-gold px-6 py-2 font-display text-xs font-bold text-ink hover:bg-gold-hover"
          >
            Stwórz swój build ⚔
          </Link>
        </div>
      )}

      {filteredRows.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          {filteredRows.map((r, i) => {
            const c = find(CLASSES, r.class)
            const isMine = user && r.user_id === user.id
            const isPreset = String(r.id).startsWith('preset-')

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
                  className="group relative flex flex-col justify-between gap-4 rounded-2xl border bg-panel/80 p-5 shadow-lg backdrop-blur-sm transition-all hover:bg-panel hover:border-gold/50 hover:shadow-gold/10"
                  style={{ borderColor: (c?.color || '#3a2f5c') + '55' }}
                >
                  <div className="flex items-start gap-4">
                    {mainSkill ? (
                      <Socket item={mainSkill} kind="skills" size={60} />
                    ) : (
                      <div
                        className="grid h-14 w-14 place-items-center rounded-xl font-display text-lg font-bold"
                        style={{ background: (c?.color || '#3a2f5c') + '22', color: c?.color || '#d9b25f' }}
                      >
                        UD
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-display text-lg font-bold text-white group-hover:text-gold transition-colors">
                          {r.title}
                        </p>
                        {isPreset && (
                          <span className="shrink-0 rounded-full border border-gold/40 bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
                            {r.badge || 'Wzorzec Meta'}
                          </span>
                        )}
                        {isMine && (
                          <span className="shrink-0 rounded bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold text-gold">
                            Twój
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
                        <span className="font-semibold" style={{ color: c?.color }}>
                          {c?.name}
                        </span>
                        {r.difficulty && (
                          <span className="text-mist">
                            Poziom: <span className="text-white/80">{r.difficulty}</span>
                          </span>
                        )}
                      </div>

                      {mainSkill && (
                        <p className="mt-1 truncate text-xs text-mist/80">
                          Główna umiejętność: <span className="font-semibold text-white/90">{mainSkill.name}</span>
                        </p>
                      )}

                      {r.playstyle && (
                        <p className="mt-1 line-clamp-1 text-xs text-mist/70 italic">
                          "{r.playstyle}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-edge/60 pt-3 text-xs">
                    <span className="text-mist text-[11px]">
                      {isPreset ? 'Autor: ' + (r.author || 'Undecember Meta') : 'Data: ' + new Date(r.created_at).toLocaleDateString('pl-PL')}
                    </span>
                    <span className="font-semibold text-gold group-hover:underline">
                      Zobacz szczegóły i układ planszy →
                    </span>
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
