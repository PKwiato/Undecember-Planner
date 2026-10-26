import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  SKILLS, LINKS, RUNESTONES, ELEMENTS, RARITY, find, iconSources, assetUrl,
} from '../data/game'

const POPULAR_TAGS = [
  'Attack', 'Spell', 'Melee', 'Projectile', 'Physical',
  'Fire', 'Cold', 'Lightning', 'Poison', 'Minion',
  'Area of Effect', 'Channel', 'Strike', 'Movement', 'Shout',
]

export default function RuneInventory({
  selectedRune,
  onSelectRune,
  onRuneDragStart,
  onDropToUnequip,
  activeTab = 'all',
  onTabChange,
}) {
  const [tab, setTab] = useState(activeTab) // 'all' | 'skills' | 'links' | 'runestones'
  const [statFilter, setStatFilter] = useState('all') // 'all' | 'Strength' | 'Agility' | 'Intellect'
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState(null)
  const [isDropZoneOver, setIsDropZoneOver] = useState(false)

  const handleTab = (newTab) => {
    setTab(newTab)
    if (onTabChange) onTabChange(newTab)
  }

  // Filter items based on tab, stat, tag, and search
  const items = useMemo(() => {
    let pool = []
    if (tab === 'all') pool = [...SKILLS, ...LINKS, ...RUNESTONES]
    else if (tab === 'skills') pool = SKILLS
    else if (tab === 'links') pool = LINKS
    else if (tab === 'runestones') pool = RUNESTONES

    return pool.filter((item) => {
      // Filter by stat / element
      if (statFilter !== 'all') {
        if (item.stat && item.stat !== statFilter && item.stat !== 'All') return false
      }

      // Filter by tag
      if (selectedTag) {
        const hasTag = item.tags?.includes(selectedTag) || item.requires?.includes(selectedTag)
        if (!hasTag) return false
      }

      // Filter by search string
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchName = item.name.toLowerCase().includes(q)
        const matchTag = item.tags?.some((t) => t.toLowerCase().includes(q))
        const matchReq = item.requires?.some((t) => t.toLowerCase().includes(q))
        const matchWeapon = item.weapons?.some((w) => w.toLowerCase().includes(q))
        if (!matchName && !matchTag && !matchReq && !matchWeapon) return false
      }

      return true
    })
  }, [tab, statFilter, selectedTag, search])

  const counts = useMemo(() => ({
    all: SKILLS.length + LINKS.length + RUNESTONES.length,
    skills: SKILLS.length,
    links: LINKS.length,
    runestones: RUNESTONES.length,
  }), [])

  return (
    <div
      className="flex h-full flex-col rounded-2xl border border-edge/80 bg-panel/90 shadow-xl backdrop-blur-md"
      onDragOver={(e) => {
        e.preventDefault()
        setIsDropZoneOver(true)
      }}
      onDragLeave={() => setIsDropZoneOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDropZoneOver(false)
        if (onDropToUnequip) onDropToUnequip(e)
      }}
    >
      {/* Drop zone overlay when dragging from board to inventory */}
      <AnimatePresence>
        {isDropZoneOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-2xl bg-ink/90 border-2 border-dashed border-red-400 p-6 backdrop-blur-sm"
          >
            <span className="text-3xl">🗑️</span>
            <p className="mt-2 font-display text-sm font-bold text-red-400">
              Upuść tutaj, aby usunąć runę z planszy
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Tabs */}
      <div className="border-b border-edge/80 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎒</span>
            <h2 className="font-display text-base font-bold text-gold">Skrytka Run</h2>
          </div>
          <span className="text-xs text-mist/70">
            {items.length} pozycji
          </span>
        </div>

        {/* Tab switcher */}
        <div className="mt-3 grid grid-cols-4 gap-1 rounded-xl bg-ink/60 p-1 text-xs font-semibold">
          <button
            onClick={() => handleTab('all')}
            className={`rounded-lg py-1.5 transition-colors ${
              tab === 'all' ? 'bg-gold font-bold text-ink shadow' : 'text-mist hover:text-white'
            }`}
          >
            Wszystkie ({counts.all})
          </button>
          <button
            onClick={() => handleTab('skills')}
            className={`rounded-lg py-1.5 transition-colors ${
              tab === 'skills' ? 'bg-gold font-bold text-ink shadow' : 'text-mist hover:text-white'
            }`}
          >
            Skille ({counts.skills})
          </button>
          <button
            onClick={() => handleTab('links')}
            className={`rounded-lg py-1.5 transition-colors ${
              tab === 'links' ? 'bg-gold font-bold text-ink shadow' : 'text-mist hover:text-white'
            }`}
          >
            Linki ({counts.links})
          </button>
          <button
            onClick={() => handleTab('runestones')}
            className={`rounded-lg py-1.5 transition-colors ${
              tab === 'runestones' ? 'bg-gold font-bold text-ink shadow' : 'text-mist hover:text-white'
            }`}
          >
            Kamienie ({counts.runestones})
          </button>
        </div>

        {/* Search input */}
        <div className="relative mt-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj runy, tagu lub broni..."
            className="w-full rounded-xl border border-edge bg-ink/70 px-3 py-2 pl-9 text-xs text-white placeholder-mist/50 outline-none transition-colors focus:border-gold"
          />
          <span className="absolute left-3 top-2.5 text-xs text-mist/60">🔍</span>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2 text-xs text-mist hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Stat / Color Filter buttons */}
        <div className="mt-3 flex items-center gap-1 text-[11px]">
          <button
            onClick={() => setStatFilter('all')}
            className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
              statFilter === 'all'
                ? 'bg-panel-card text-white border border-edge'
                : 'text-mist/70 hover:text-mist'
            }`}
          >
            Wszystkie
          </button>
          <button
            onClick={() => setStatFilter('Strength')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition-colors ${
              statFilter === 'Strength'
                ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                : 'text-mist/70 hover:text-red-400'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#e0603a]" />
            Siła
          </button>
          <button
            onClick={() => setStatFilter('Agility')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition-colors ${
              statFilter === 'Agility'
                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                : 'text-mist/70 hover:text-green-400'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#4fc38a]" />
            Zręczność
          </button>
          <button
            onClick={() => setStatFilter('Intellect')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition-colors ${
              statFilter === 'Intellect'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                : 'text-mist/70 hover:text-blue-400'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#5b8def]" />
            Inteligencja
          </button>
        </div>

        {/* Tag chips */}
        <div className="mt-2.5 flex flex-wrap gap-1">
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-all ${
                selectedTag === tag
                  ? 'bg-gold text-ink font-bold shadow'
                  : 'bg-ink/50 text-mist/80 hover:bg-panel-card hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Rune hint */}
      {selectedRune && (
        <div className="flex items-center justify-between bg-gold/15 px-4 py-2 border-b border-gold/30">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xs text-gold">Wybrano:</span>
            <span className="truncate text-xs font-bold text-white">{selectedRune.name}</span>
          </div>
          <button
            onClick={() => onSelectRune(null)}
            className="text-[11px] font-bold text-gold hover:underline"
          >
            Anuluj
          </button>
        </div>
      )}

      {/* Rune cards listing */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-[640px]">
        {items.length === 0 ? (
          <div className="py-12 text-center text-xs text-mist/60">
            Nie znaleziono żadnych run spełniających kryteria.
          </div>
        ) : (
          items.map((item) => {
            const kind = item.type === 'Skill'
              ? 'skill'
              : item.type === 'LinkSkill'
              ? 'link'
              : 'runestone'

            const isSelected = selectedRune?.id === item.id
            const col = ELEMENTS[item.color]?.hex || RARITY[item.rarity] || '#d9b25f'
            const sources = kind === 'skill'
              ? iconSources('skills', item)
              : kind === 'link'
              ? iconSources('links', item)
              : item.icon ? [assetUrl(item.icon)] : []

            return (
              <div
                key={item.id || item.slug}
                draggable
                onDragStart={(e) => {
                  const dragData = {
                    type: 'inventory',
                    id: item.slug || item.id,
                    kind,
                  }
                  e.dataTransfer.setData('application/json', JSON.stringify(dragData))
                  if (onRuneDragStart) onRuneDragStart(dragData)
                }}
                onClick={() => {
                  if (onSelectRune) {
                    onSelectRune(isSelected ? null : { ...item, kind })
                  }
                }}
                className={`group flex items-center gap-3 rounded-xl border p-2 text-left cursor-grab active:cursor-grabbing transition-all hover:bg-panel-card ${
                  isSelected
                    ? 'border-gold bg-gold/10 shadow-md shadow-gold/10'
                    : 'border-edge/60 bg-ink/40 hover:border-gold/50'
                }`}
              >
                {/* Mini icon */}
                <div
                  className={`relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden ${
                    kind === 'skill' ? 'hex' : 'rounded-full'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${col}33, #150f28)`,
                    border: `1.5px solid ${col}`,
                  }}
                >
                  {sources.length > 0 ? (
                    <img
                      src={sources[0]}
                      alt={item.name}
                      draggable={false}
                      className="h-full w-full object-contain p-1 pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="font-display text-xs font-bold" style={{ color: col }}>
                      {item.name[0]}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-bold text-white group-hover:text-gold transition-colors">
                      {item.name}
                    </span>
                    {item.color && (
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: col }}
                      />
                    )}
                  </div>

                  <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[10px] text-mist/70">
                    <span
                      className="rounded px-1 font-medium"
                      style={{
                        backgroundColor: col + '22',
                        color: col,
                      }}
                    >
                      {item.stat || item.slot || (kind === 'skill' ? 'Skill' : 'Link')}
                    </span>
                    {item.tags?.slice(0, 3).map((t) => (
                      <span key={t} className="rounded bg-panel px-1 text-mist/60">
                        {t}
                      </span>
                    ))}
                    {(item.tags?.length || 0) > 3 && (
                      <span className="text-mist/40">+{item.tags.length - 3}</span>
                    )}
                  </div>
                </div>

                {/* Drag handle hint */}
                <div className="shrink-0 text-mist/30 group-hover:text-gold transition-colors text-xs pr-1">
                  ⠿
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer tips */}
      <div className="border-t border-edge/80 p-3 text-[11px] text-mist/60 flex items-center justify-between">
        <span>💡 Przeciągnij runę na planszę</span>
        <span>Lub kliknij i wskaż slot</span>
      </div>
    </div>
  )
}
