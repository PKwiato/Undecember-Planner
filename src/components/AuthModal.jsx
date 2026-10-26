import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../context/AuthContext'

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, signIn, signUp } = useAuth()
  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  if (!isAuthModalOpen) return null

  const resetState = () => {
    setEmail('')
    setPassword('')
    setErr('')
    setMsg('')
    setBusy(false)
  }

  const handleClose = () => {
    resetState()
    closeAuthModal()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    setMsg('')

    if (!email.trim() || !password) {
      setErr('Wypełnij wszystkie pola.')
      return
    }

    setBusy(true)

    try {
      if (tab === 'login') {
        const { error } = await signIn(email.trim(), password)
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErr('Nieprawidłowy adres e-mail lub hasło.')
          } else {
            setErr(error.message)
          }
          setBusy(false)
          return
        }
        handleClose()
      } else {
        const { data, error } = await signUp(email.trim(), password)
        if (error) {
          setErr(error.message)
          setBusy(false)
          return
        }
        // Jeśli Supabase wymaga potwierdzenia maila, sesja może być null
        if (data?.user && !data?.session) {
          setMsg('Konto utworzone! Sprawdź swoją skrzynkę e-mail, aby aktywować konto przed zalogowaniem.')
          setBusy(false)
        } else {
          handleClose()
        }
      }
    } catch (e) {
      setErr('Wystąpił nieoczekiwany błąd: ' + e.message)
      setBusy(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-ink/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-md rounded-2xl border border-edge/80 bg-panel/95 p-6 shadow-2xl backdrop-blur-xl"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-mist/60 hover:text-white transition-colors text-lg"
          >
            ✕
          </button>

          {/* Header tabs */}
          <div className="flex border-b border-edge/60 mb-6">
            <button
              type="button"
              onClick={() => {
                setTab('login')
                setErr('')
                setMsg('')
              }}
              className={`pb-3 text-sm font-display font-semibold transition-colors flex-1 ${
                tab === 'login'
                  ? 'border-b-2 border-gold text-gold'
                  : 'text-mist hover:text-white'
              }`}
            >
              Logowanie
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register')
                setErr('')
                setMsg('')
              }}
              className={`pb-3 text-sm font-display font-semibold transition-colors flex-1 ${
                tab === 'register'
                  ? 'border-b-2 border-gold text-gold'
                  : 'text-mist hover:text-white'
              }`}
            >
              Rejestracja
            </button>
          </div>

          <p className="text-xs text-mist/80 mb-5">
            {tab === 'login'
              ? 'Zaloguj się, aby zapisywać i zarządzać swoimi buildami w chmurze.'
              : 'Utwórz konto, aby przypisywać swoje buildy do profilu i edytować je w przyszłości.'}
          </p>

          {err && (
            <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
              {err}
            </div>
          )}

          {msg && (
            <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Adres e-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="twoj@email.com"
                className="w-full rounded-xl border border-edge/80 bg-ink/60 px-3.5 py-2.5 text-sm text-white placeholder-mist/40 focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Hasło</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-edge/80 bg-ink/60 px-3.5 py-2.5 text-sm text-white placeholder-mist/40 focus:border-gold focus:outline-none"
              />
              {tab === 'register' && (
                <p className="mt-1 text-[11px] text-mist/60">Hasło musi mieć minimum 6 znaków.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-6 w-full rounded-xl bg-gold py-2.5 font-display text-sm font-bold text-ink shadow-lg shadow-gold/20 transition-all hover:bg-gold-hover disabled:opacity-50 cursor-pointer"
            >
              {busy
                ? 'Przetwarzanie…'
                : tab === 'login'
                ? 'Zaloguj się'
                : 'Załóż konto'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
