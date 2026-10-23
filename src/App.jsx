import { NavLink, Route, Routes } from 'react-router-dom'
import Builder from './pages/Builder'
import BuildView from './pages/BuildView'
import Browse from './pages/Browse'

const link = ({ isActive }) => (isActive ? 'text-gold' : 'text-mist hover:text-white')

export default function App() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <nav className="mb-10 flex items-center gap-6">
        <span className="font-display text-xl font-bold text-gold">Undecember Builds</span>
        <NavLink to="/" end className={link}>Nowy build</NavLink>
        <NavLink to="/builds" className={link}>Wszystkie buildy</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Builder />} />
        <Route path="/builds" element={<Browse />} />
        <Route path="/build/:id" element={<BuildView />} />
      </Routes>
    </div>
  )
}
