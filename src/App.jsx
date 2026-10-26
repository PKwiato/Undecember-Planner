import { NavLink, Route, Routes } from 'react-router-dom'
import Builder from './pages/Builder'
import BuildView from './pages/BuildView'
import Browse from './pages/Browse'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthModal from './components/AuthModal'

const link = ({ isActive }) =>
  isActive
    ? 'text-gold font-bold border-b-2 border-gold pb-1 transition-colors'
    : 'text-mist hover:text-white pb-1 transition-colors'

function AppLayout() {
  const { user, loading, openAuthModal, signOut } = useAuth()

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 sm:py-8 flex flex-col justify-between">
      <div>
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-edge/60 pb-5">
          <div className="flex items-center gap-3">
            <a href="https://undecember.thein.ru/en/" target="_blank" rel="noreferrer" className="flex items-center gap-2 group">
              <img
                src="https://undecember.thein.ru/image/common/h1_logo.png"
                alt="Undecember Logo"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </a>
            <div className="border-l border-edge/80 pl-3">
              <h1 className="font-display text-xl font-bold tracking-wide text-gold">Build Planner</h1>
              <p className="text-xs text-mist">Zasilany bazą danych undecember.thein.ru</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <nav className="flex items-center gap-5 text-sm font-medium">
              <NavLink to="/" end className={link}>Kreator buildu</NavLink>
              <NavLink to="/builds" className={link}>Wszystkie buildy</NavLink>
              <a
                href="https://undecember.thein.ru/en/"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1.5 text-xs text-gold transition-colors hover:border-gold hover:bg-gold/20"
              >
                <span>Baza gry</span>
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </nav>

            {/* Auth status & actions */}
            <div className="flex items-center gap-3 border-l border-edge/60 pl-4">
              {loading ? (
                <div className="h-8 w-20 animate-pulse rounded-full bg-panel/60" />
              ) : user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-semibold text-white truncate max-w-[140px]" title={user.email}>
                      {user.email}
                    </span>
                    <span className="text-[10px] text-gold/80">Zalogowany</span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="rounded-full border border-edge/80 bg-panel px-3.5 py-1.5 text-xs font-medium text-mist hover:text-white hover:border-red-500/40 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    Wyloguj
                  </button>
                </div>
              ) : (
                <button
                  onClick={openAuthModal}
                  className="rounded-full bg-gold/15 border border-gold/50 px-4 py-1.5 text-xs font-display font-semibold text-gold hover:bg-gold hover:text-ink transition-all cursor-pointer shadow-sm shadow-gold/10"
                >
                  Zaloguj się
                </button>
              )}
            </div>
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Builder />} />
            <Route path="/builds" element={<Browse />} />
            <Route path="/build/:id" element={<BuildView />} />
          </Routes>
        </main>
      </div>

      <AuthModal />

      <footer className="mt-16 border-t border-edge/40 pt-6 text-center text-xs text-mist/70">
        <p>
          Wszystkie ikony, grafiki i dane pochodzą ze strony{' '}
          <a
            href="https://undecember.thein.ru/en/"
            target="_blank"
            rel="noreferrer"
            className="text-gold/90 hover:underline"
          >
            Game database - Undecember (undecember.thein.ru)
          </a>
          . Grafiki i prawa autorskie należą do LINE Games / Needs Games.
        </p>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  )
}
