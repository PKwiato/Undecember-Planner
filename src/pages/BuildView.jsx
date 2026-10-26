import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import BuildSheet from '../components/BuildSheet'
import { supabase } from '../lib/supabase'

export default function BuildView() {
  const { id } = useParams()
  const [build, setBuild] = useState(null)
  const [state, setState] = useState('loading')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    supabase
      .from('builds')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) return setState('missing')
        setBuild(data)
        setState('ok')
      })
  }, [id])

  const copy = async () => {
    await navigator.clipboard.writeText(location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (state === 'loading') {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-lg text-mist">Ładowanie danych buildu…</p>
      </div>
    )
  }

  if (state === 'missing') {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-xl text-mist">Nie znaleziono buildu.</p>
        <p className="mt-2 text-sm text-mist/70">Sprawdź, czy adres URL jest kompletny.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-gold px-6 py-2.5 font-display text-sm font-bold text-ink hover:bg-gold-hover"
        >
          Stwórz nowy build
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to="/builds" className="text-xs text-mist hover:text-white">
          ← Wróć do listy buildów
        </Link>
        <div className="flex gap-2">
          <button
            onClick={copy}
            className="flex items-center gap-1.5 rounded-full border border-gold/60 bg-gold/10 px-5 py-2 text-xs font-bold text-gold transition-colors hover:border-gold hover:bg-gold/20"
          >
            <span>{copied ? '✓ Skopiowano link do schowka!' : 'Kopiuj link do buildu'}</span>
          </button>
          <Link
            to="/"
            className="rounded-full border border-edge bg-panel px-5 py-2 text-xs font-semibold text-mist hover:text-white"
          >
            + Nowy build
          </Link>
        </div>
      </div>

      <BuildSheet build={build} />
    </div>
  )
}
