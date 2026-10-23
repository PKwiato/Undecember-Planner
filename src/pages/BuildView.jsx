import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import BuildSheet from '../components/BuildSheet'
import { supabase } from '../lib/supabase'

export default function BuildView() {
  const { id } = useParams()
  const [build, setBuild] = useState(null)
  const [state, setState] = useState('loading')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    supabase.from('builds').select('*').eq('id', id).maybeSingle().then(({ data, error }) => {
      if (error || !data) return setState('missing')
      setBuild(data); setState('ok')
    })
  }, [id])

  const copy = async () => {
    await navigator.clipboard.writeText(location.href)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  if (state === 'loading') return <p className="text-mist">Ładowanie buildu…</p>
  if (state === 'missing') return <p className="text-mist">Nie znaleziono buildu. Sprawdź, czy link jest kompletny.</p>
  return (
    <>
      <BuildSheet build={build} />
      <button onClick={copy} className="mt-8 rounded-full border border-gold px-6 py-2 text-gold">
        {copied ? 'Skopiowano link' : 'Kopiuj link do buildu'}
      </button>
    </>
  )
}
