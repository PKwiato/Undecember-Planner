import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { supabase } from '../lib/supabase'
import { CLASSES, find } from '../data/game'

export default function Browse() {
  const [rows, setRows] = useState(null)
  useEffect(() => {
    supabase.from('builds').select('id,title,class,created_at').order('created_at', { ascending: false }).limit(48)
      .then(({ data }) => setRows(data || []))
  }, [])

  if (!rows) return <p className="text-mist">Ładowanie buildów…</p>
  if (!rows.length) return <p className="text-mist">Nie ma jeszcze żadnych buildów. <Link to="/" className="text-gold">Stwórz pierwszy.</Link></p>
  return (
    <section>
      <h1 className="font-display text-4xl font-bold">Buildy</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {rows.map((r, i) => {
          const c = find(CLASSES, r.class)
          return (
            <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 8) * 0.05 }}>
              <Link to={`/build/${r.id}`} className="block rounded-xl border bg-panel p-5 hover:bg-white/5"
                style={{ borderColor: (c?.color || '#3a2f5c') + '88' }}>
                <p className="font-display text-xl">{r.title}</p>
                <p className="mt-1 text-sm" style={{ color: c?.color }}>{c?.name}</p>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
