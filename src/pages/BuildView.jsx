import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import BuildSheet from '../components/BuildSheet'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { getPresetBuild } from '../data/presetBuilds.js'

export default function BuildView() {
  const { id } = useParams()
  const nav = useNavigate()
  const { user } = useAuth()
  const [build, setBuild] = useState(null)
  const [state, setState] = useState('loading')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (id?.startsWith('preset-')) {
      const preset = getPresetBuild(id)
      if (preset) {
        setBuild(preset)
        setState('ok')
        return
      }
    }

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

  const customizeInBuilder = () => {
    if (!build) return
    nav('/', { state: { loadBuild: build } })
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

  const isMine = user && build?.user_id === user.id

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/builds" className="text-xs text-mist hover:text-white">
            ← Wróć do listy buildów
          </Link>
          {isMine && (
            <span className="rounded-full border border-gold/40 bg-gold/15 px-3 py-0.5 text-xs font-semibold text-gold">
              Twój autorski build
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={customizeInBuilder}
            className="flex items-center gap-1.5 rounded-full bg-gold px-5 py-2 text-xs font-bold text-ink transition-colors hover:bg-gold-hover cursor-pointer"
          >
            <span>⚔ Dostosuj w Kreatorze</span>
          </button>
          <button
            onClick={copy}
            className="flex items-center gap-1.5 rounded-full border border-gold/60 bg-gold/10 px-5 py-2 text-xs font-bold text-gold transition-colors hover:border-gold hover:bg-gold/20 cursor-pointer"
          >
            <span>{copied ? '✓ Skopiowano link!' : 'Kopiuj link do buildu'}</span>
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
