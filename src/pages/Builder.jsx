import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import SkillHex from '../components/SkillHex'
import {
  CLASSES, SKILLS, LINKS, RARITY, ELEMENTS, SLOT_COLORS, find, canLink,
  emptySlot, withSkill, withLinkColor, withLinkRune,
} from '../data/game'
import { supabase } from '../lib/supabase'

export default function Builder() {
  const nav = useNavigate()
  const [b, setB] = useState({ title: '', description: '', cls: CLASSES[0].id, slots: Array.from({ length: 6 }, emptySlot) })
  const [pick, setPick] = useState(null) // { i, kind: 'skill' } | { i, kind: 'link', k }
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const update = (i, fn) => setB((s) => ({ ...s, slots: s.slots.map((x, j) => (j === i ? fn(x) : x)) }))

  const save = async () => {
    if (!b.title.trim()) return setErr('Wpisz nazwę buildu.')
    setBusy(true); setErr('')
    const { data, error } = await supabase.from('builds')
      .insert({ title: b.title.trim(), description: b.description.trim(), class: b.cls, data: { slots: b.slots } })
      .select('id').single()
    if (error) { setErr('Nie udało się zapisać buildu: ' + error.message); setBusy(false); return }
    nav('/build/' + data.id)
  }

  const slot = pick ? b.slots[pick.i] : null
  const skill = slot ? find(SKILLS, slot.skill) : null
  const linkColor = pick?.kind === 'link' ? slot.links[pick.k].c : null

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

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {b.slots.map((s, i) => {
          const sk = find(SKILLS, s.skill)
          return (
            <div key={i} className="flex flex-col items-center gap-2 rounded-xl border border-edge bg-panel p-4">
              <SkillHex slot={s} slotNo={i + 1} size={230}
                onSkill={() => setPick({ i, kind: 'skill' })}
                onLink={(k) => setPick({ i, kind: 'link', k })} />
              <p className="font-display text-lg">{sk?.name || 'Wybierz skill'}</p>
              {!sk && <p className="text-xs text-mist">Sloty linków odblokują się po wyborze skilla</p>}
            </div>
          )
        })}
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
              exit={{ y: 30, opacity: 0 }} className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-edge bg-panel p-5">
              {pick.kind === 'skill' ? (
                <>
                  <h2 className="mb-3 font-display text-xl">Wybierz skill</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {SKILLS.map((it) => (
                      <button key={it.id}
                        onClick={() => { update(pick.i, (x) => withSkill(x, it.id)); setPick(null) }}
                        className="rounded-lg border px-3 py-2 text-left hover:bg-white/5"
                        style={{ borderColor: RARITY[it.rarity] + '88', color: RARITY[it.rarity] }}>
                        {it.name}
                        <span className="mt-0.5 block text-xs" style={{ color: ELEMENTS[it.color].hex }}>
                          {ELEMENTS[it.color].name}
                        </span>
                      </button>
                    ))}
                    <button onClick={() => { update(pick.i, () => emptySlot()); setPick(null) }}
                      className="col-span-2 rounded-lg border border-edge px-3 py-2 text-mist">Wyczyść slot</button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="font-display text-xl">Link {pick.k + 1}: {skill?.name}</h2>
                  <p className="mb-2 mt-3 text-sm text-mist">Kolor slotu</p>
                  <div className="flex gap-2">
                    {SLOT_COLORS.map((c) => (
                      <button key={c} onClick={() => update(pick.i, (x) => withLinkColor(x, pick.k, c))}
                        aria-pressed={linkColor === c} className="rounded-full px-3 py-1 text-sm"
                        style={{
                          border: `1px solid ${ELEMENTS[c].hex}`, color: ELEMENTS[c].hex,
                          background: linkColor === c ? ELEMENTS[c].hex + '33' : 'transparent',
                        }}>{ELEMENTS[c].name}</button>
                    ))}
                  </div>
                  <p className="mb-2 mt-4 text-sm text-mist">Link Runy</p>
                  <div className="grid gap-2">
                    {LINKS.map((it) => {
                      const r = canLink(skill, linkColor, it)
                      return (
                        <button key={it.id} disabled={!r.ok}
                          onClick={() => { update(pick.i, (x) => withLinkRune(x, pick.k, it.id)); setPick(null) }}
                          className="rounded-lg border px-3 py-2 text-left enabled:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                          style={{ borderColor: ELEMENTS[it.color].hex + '88', color: RARITY[it.rarity] }}>
                          {it.name}
                          {!r.ok && <span className="mt-0.5 block text-xs text-mist">{r.reason}</span>}
                        </button>
                      )
                    })}
                    <button onClick={() => { update(pick.i, (x) => withLinkRune(x, pick.k, null)); setPick(null) }}
                      className="rounded-lg border border-edge px-3 py-2 text-mist">Wyczyść slot</button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
