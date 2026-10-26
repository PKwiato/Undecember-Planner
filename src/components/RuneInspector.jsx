import { motion } from 'motion/react'
import {
  SKILLS, LINKS, ELEMENTS, HEX_DIRECTIONS, find, iconSources, assetUrl,
} from '../data/game'

export default function RuneInspector({
  cell,
  onClose,
  onUpdateSlots,
  onRemoveRune,
  connectedLinks = [],
  linkedSkills = [],
  onRotateSlots,
  onAutoAlignSlots,
  onMaxWhiteSlots,
}) {
  if (!cell || !cell.runeId) return null

  const rune = cell.kind === 'skill'
    ? find(SKILLS, cell.runeId)
    : cell.kind === 'link'
    ? find(LINKS, cell.runeId)
    : null

  if (!rune) return null

  const isSkill = cell.kind === 'skill'
  const baseColor = ELEMENTS[rune.color]?.hex || '#d9b25f'
  const sources = isSkill
    ? iconSources('skills', rune)
    : iconSources('links', rune)

  const cycleSlotColor = (dir) => {
    if (!isSkill) return
    const current = cell.slots?.[dir] || 'red'
    const order = ['red', 'green', 'blue', 'white', null]
    const nextIdx = (order.indexOf(current) + 1) % order.length
    const nextColor = order[nextIdx]
    const updated = [...(cell.slots || ['red', 'red', 'red', 'red', 'red', 'red'])]
    updated[dir] = nextColor
    if (onUpdateSlots) onUpdateSlots(cell, updated)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className="rounded-2xl border border-edge/90 bg-panel/95 p-5 shadow-2xl backdrop-blur-md"
    >
      {/* Header with Rune Icon and Name */}
      <div className="flex items-start justify-between gap-3 border-b border-edge/80 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden ${
              isSkill ? 'hex' : 'rounded-full'
            }`}
            style={{
              background: `linear-gradient(135deg, ${baseColor}44, #130e24)`,
              border: `2px solid ${baseColor}`,
              boxShadow: `0 0 16px ${baseColor}55`,
            }}
          >
            {sources.length > 0 ? (
              <img
                src={sources[0]}
                alt={rune.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain p-1.5"
              />
            ) : (
              <span className="font-display text-lg font-bold" style={{ color: baseColor }}>
                {rune.name[0]}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-white">{rune.name}</h3>
              <span
                className="rounded px-2 py-0.5 text-[10px] font-bold"
                style={{
                  backgroundColor: baseColor + '25',
                  color: baseColor,
                  border: `1px solid ${baseColor}55`,
                }}
              >
                {isSkill ? 'Skill Rune' : 'Link Rune'}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-mist">
              <span>{rune.stat}</span>
              {rune.dbUrl && (
                <>
                  <span>•</span>
                  <a
                    href={rune.dbUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gold hover:underline"
                  >
                    Baza thein.ru ↗
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1 text-mist hover:bg-panel-card hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Tags */}
      {rune.tags && rune.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {rune.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-medium text-gold/90 border border-edge/60"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      {rune.desc && (
        <p className="mt-2.5 text-xs text-mist/90 leading-relaxed bg-ink/30 p-2.5 rounded-xl border border-edge/50">
          {rune.desc}
        </p>
      )}

      {/* SKILL RUNES: 6 Slot Directions Editor */}
      {isSkill && (
        <div className="mt-4 border-t border-edge/80 pt-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-gold">
              Sloty Linków na krawędziach (6 kierunków)
            </h4>
            <span className="text-[11px] text-mist/70">
              Połączone: {connectedLinks.length}/6
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-3 gap-2">
            {HEX_DIRECTIONS.map((d) => {
              const currentColor = cell.slots?.[d.dir]
              const colHex = currentColor === 'white'
                ? '#ffffff'
                : currentColor
                ? ELEMENTS[currentColor]?.hex || '#d9b25f'
                : '#3a2e54'

              return (
                <button
                  key={d.dir}
                  onClick={() => cycleSlotColor(d.dir)}
                  className="flex items-center justify-between gap-1.5 rounded-xl border border-edge/70 bg-ink/50 px-2.5 py-1.5 text-left transition-all hover:border-gold/60 hover:bg-panel-card"
                >
                  <span className="text-[11px] font-mono text-mist">{d.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full shadow"
                      style={{ backgroundColor: currentColor ? colHex : '#2d2442' }}
                    />
                    <span className="text-[10px] font-bold" style={{ color: currentColor ? colHex : '#6d6288' }}>
                      {currentColor ? (currentColor === 'white' ? 'Biały' : currentColor.toUpperCase()) : 'Brak'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Quick slot preset buttons */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <button
              onClick={() => onMaxWhiteSlots && onMaxWhiteSlots(cell)}
              className="flex items-center gap-1 rounded-lg border border-white/40 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white transition-colors hover:bg-white/20"
            >
              <span>🌟</span>
              <span>6x Białe (Uniwersalne)</span>
            </button>
            <button
              onClick={() => onAutoAlignSlots && onAutoAlignSlots(cell)}
              className="flex items-center gap-1 rounded-lg border border-gold/40 bg-gold/10 px-2.5 py-1 text-[11px] font-bold text-gold transition-colors hover:bg-gold/20"
            >
              <span>🎯</span>
              <span>Dopasuj do sąsiadów</span>
            </button>
            <button
              onClick={() => onRotateSlots && onRotateSlots(cell)}
              className="flex items-center gap-1 rounded-lg border border-edge bg-ink/60 px-2.5 py-1 text-[11px] font-medium text-mist hover:text-white"
            >
              <span>🔄</span>
              <span>Obróć o 60°</span>
            </button>
          </div>

          {/* Connected Links list */}
          <div className="mt-3.5">
            <p className="text-[11px] font-semibold text-mist/80">Aktywnie połączone linki:</p>
            {connectedLinks.length === 0 ? (
              <p className="mt-1 text-xs text-mist/50 italic">
                Brak sąsiadujących zgodnych linków. Umieść link runy w sąsiednich slotach planszy.
              </p>
            ) : (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {connectedLinks.map((cl, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 rounded-lg bg-panel-card px-2 py-0.5 text-xs border border-edge text-mist"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: ELEMENTS[cl.link.color]?.hex || '#d9b25f' }}
                    />
                    <span className="font-medium text-white">{cl.link.name}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LINK RUNES: Linked Skills */}
      {!isSkill && (
        <div className="mt-4 border-t border-edge/80 pt-4">
          <p className="text-[11px] font-semibold text-mist/80">Wspiera skille:</p>
          {linkedSkills.length === 0 ? (
            <p className="mt-1 text-xs text-mist/50 italic">
              Ta runa nie jest aktualnie połączona z żadnym skillem. Umieść ją obok kompatybilnego skilla z pasującym kolorem slotu.
            </p>
          ) : (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {linkedSkills.map((ls, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 rounded-lg bg-panel-card px-2 py-0.5 text-xs border border-edge text-mist"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: ELEMENTS[ls.skill.color]?.hex || '#d9b25f' }}
                  />
                  <span className="font-bold text-gold">{ls.skill.name}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Danger Zone: Remove Rune */}
      <div className="mt-5 flex items-center justify-between border-t border-edge/80 pt-3">
        <span className="text-[11px] text-mist/60">Pozycja: ({cell.row + 1}, {cell.col + 1})</span>
        <button
          onClick={() => {
            if (onRemoveRune) onRemoveRune(cell)
          }}
          className="rounded-lg px-3 py-1 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          Usuń runę z planszy
        </button>
      </div>
    </motion.div>
  )
}
