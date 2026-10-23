import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import Socket from '../components/Socket'
import { CLASSES, SKILLS, RUNES, RARITY, find } from '../data/game'
import { supabase } from '../lib/supabase'

const empty = () => Array.from({ length: 6 }, () => ({ skill: null, runes: [null, null, null] }))

export default function Builder() {
  const nav = useNavigate()
  const [b, setB] = useState({ title: '', description: '', cls: CLASSES[0].id, slots: empty() })
  const [pick, setPick] = useState(null) // { i, kind: 'skill' | 'rune', r }
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const choose = (id) => {
    const { i, kind, r } = pick
    setB((s) => ({
      ...s,
      slots: s.slots.map((x, j) => j !== i ? x : kind === 'skill'
        ? { ...x, skill: id }
        : { ...x, runes: x.runes.map((v, k) => (k === r ? id : v)) }),
    }))
    setPick(null)
  }

  const save = async () => {
    if (!b.title.trim()) return setErr('Wpisz nazwę buildu.')
    setBusy(true); setErr('')
    const { data, error } = await supabase.from('builds')
      .insert({ title: b.title.trim(), description: b.description.trim(), class: b.cls, data: { slots: b.slots } })
      .select('id').single()
    if (error) { setErr('Nie udało się zapisać buildu: ' + error.message); setBusy(false); return }
    nav('/build/' + data.id)
  }

  const list = pick?.kind === 'rune' ? RUNES : SKILLS

  return (
    <section>
      <input value={b.title} onChange={(e) => setB({ ...b, title: e.target.value })} maxLength={80}
        placeholder="Nazwa buildu"
        className="w-full border-b border-edge bg-transparent pb-2 font-display text-4xl outline-none focus:border-gold" />
      <div className="mt-6 flex flex-wrap gap-2">
        {CLASSES.map((c) => (
          <button key={c.id} onClick={() => setB({ ...b, cls: c.id })} className="relative rounded-full px-4 py-2">
            {b.cls === c.id && (
              <motion.span layoutId="cls" className="absolute inset-0 rounded-full"
                style={{ background: c.color + '44', border: `1px solid ${c.color}` }} />
            )}
            <span className="relative">{c.name}</span>
          </button>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3">
        {b.slots.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-3 rounded-xl border border-edge bg-panel p-5">
            <Socket size={92} item={find(SKILLS, s.skill)} label={`Skill, slot ${i + 1}`}
              onClick={() => setPick({ i, kind: 'skill' })} />
            <p className="text-sm text-mist">{find(SKILLS, s.skill)?.name || 'Wybierz skill'}</p>
            <div className="flex gap-2">
              {s.runes.map((r, k) => (
                <Socket key={k} round size={34} item={find(RUNES, r)} label={`Runa ${k + 1}, slot ${i + 1}`}
                  onClick={() => setPick({ i, kind: 'rune', r: k })} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <textarea value={b.description} onChange={(e) => setB({ ...b, description: e.target.value })}
        maxLength={2000} rows={4} placeholder="Opis: jak grać, na jakie staty celować…"
        className="mt-8 w-full rounded-xl border border-edge bg-panel p-4 outline-none focus:border-gold" />
      {err && <p role="alert" className="mt-3 text-red-400">{err}</p>}
      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={save} disabled={busy}
        className="mt-6 rounded-full bg-gold px-8 py-3 font-display font-bold text-ink disabled:opacity-50">
        {busy ? 'Zapisywanie…' : 'Zapisz build'}
      </motion.button>

      <AnimatePresence>
        {pick && (
          <motion.div className="fixed inset-0 z-10 grid place-items-center bg-black/70 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPick(null)}>
            <motion.div onClick={(e) => e.stopPropagation()} initial={{ y: 30, scale: 0.95 }} animate={{ y: 0, scale: 1 }}
              exit={{ y: 30, opacity: 0 }} className="w-full max-w-md rounded-2xl border border-edge bg-panel p-5">
              <h2 className="mb-3 font-display text-xl">{pick.kind === 'rune' ? 'Wybierz runę' : 'Wybierz skill'}</h2>
              <div className="grid grid-cols-2 gap-2">
                {list.map((it) => (
                  <button key={it.id} onClick={() => choose(it.id)}
                    className="rounded-lg border px-3 py-2 text-left hover:bg-white/5"
                    style={{ borderColor: RARITY[it.rarity] + '88', color: RARITY[it.rarity] }}>{it.name}</button>
                ))}
                <button onClick={() => choose(null)} className="col-span-2 rounded-lg border border-edge px-3 py-2 text-mist">
                  Wyczyść slot
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
