import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import RuneBoard from './RuneBoard'
import SkillHotbar from './SkillHotbar'
import RuneInspector from './RuneInspector'
import Socket from './Socket'
import {
  CLASSES, SKILLS, UNIQUES, RUNESTONES, GEAR_SLOTS,
  find, legacySlotsToBoard, calculateBoardLinks,
} from '../data/game'

// Widok buildu z autentyczną planszą Rune Cast
export default function BuildSheet({ build }) {
  const cls = find(CLASSES, build.class)
  const equipment = build.data?.equipment || {}
  const [selectedCell, setSelectedCell] = useState(null)

  // Pobierz planszę z danych lub przekonwertuj ze starych slotów
  const board = useMemo(() => {
    if (build.data?.board && build.data.board.cells) {
      return build.data.board
    }
    if (build.data?.slots) {
      return legacySlotsToBoard(build.data.slots, 5, 6)
    }
    return null
  }, [build.data])

  const { links, skillsSummary, cellLinkStatus } = useMemo(() => {
    if (!board) return { links: [], skillsSummary: [], cellLinkStatus: {} }
    return calculateBoardLinks(board)
  }, [board])

  const activeCell = useMemo(() => {
    if (!selectedCell || !board) return null
    return board.cells.find((c) => c.id === selectedCell.id) || selectedCell
  }, [selectedCell, board])

  const activeSummary = useMemo(() => {
    if (!activeCell) return null
    return skillsSummary.find((s) => s.cellId === activeCell.id)
  }, [activeCell, skillsSummary])

  const activeLinkStatus = useMemo(() => {
    if (!activeCell) return null
    return cellLinkStatus[activeCell.id]
  }, [activeCell, cellLinkStatus])

  // Zbierz unikalne tagi skilli w buildzie
  const buildTags = useMemo(() => {
    if (!skillsSummary) return []
    return Array.from(
      new Set(skillsSummary.flatMap((s) => s.skill.tags || []))
    )
  }, [skillsSummary])

  const hasEquip = Object.values(equipment).some(Boolean)

  return (
    <section className="space-y-10">
      {/* Build Header */}
      <div className="rounded-2xl border border-edge/80 bg-panel/80 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white">{build.title}</h1>
            <p className="mt-1 font-display text-lg font-semibold" style={{ color: cls?.color || '#d9b25f' }}>
              {cls?.name || 'Klasa Nieznana'}
            </p>
          </div>
          {build.created_at && (
            <p className="text-xs text-mist">
              Utworzono: {new Date(build.created_at).toLocaleDateString('pl-PL')}
            </p>
          )}
        </div>

        {buildTags.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-edge/60 pt-4">
            <span className="mr-1 text-xs font-semibold text-mist">Tagi buildu:</span>
            {buildTags.map((t) => (
              <span key={t} className="rounded-full border border-edge bg-ink/60 px-2.5 py-0.5 text-xs text-gold/90">
                {t}
              </span>
            ))}
          </div>
        )}

        {build.description && (
          <p className="mt-4 max-w-prose whitespace-pre-line text-sm leading-relaxed text-mist">
            {build.description}
          </p>
        )}
      </div>

      {/* Rune Cast Board */}
      {board && (
        <div className="space-y-6">
          <RuneBoard
            board={board}
            selectedCell={activeCell}
            onSelectCell={setSelectedCell}
            readOnly={true}
          />

          {/* Active Skills Hotbar */}
          <SkillHotbar
            skillsSummary={skillsSummary}
            selectedCellId={activeCell?.id}
            onSelectSkillCell={(cell) => setSelectedCell(cell)}
          />

          {/* Selected Rune Inspector in Read-Only Mode */}
          <AnimatePresence>
            {activeCell && activeCell.runeId && (
              <RuneInspector
                cell={activeCell}
                onClose={() => setSelectedCell(null)}
                connectedLinks={activeSummary?.connectedLinks || []}
                linkedSkills={activeLinkStatus?.linkedSkills || []}
              />
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Unique Equipment & Runestones */}
      {hasEquip && (
        <div className="space-y-6 rounded-2xl border border-edge/80 bg-panel/80 p-6 shadow-xl backdrop-blur-sm">
          <div>
            <h2 className="font-display text-2xl font-bold text-gold">Ekwipunek Unikalny</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {GEAR_SLOTS.map((slotDef) => {
                const itemId = equipment[slotDef.key]
                if (!itemId) return null
                const item = find(UNIQUES, itemId)
                if (!item) return null
                return (
                  <div
                    key={slotDef.key}
                    className="flex flex-col items-center gap-2 rounded-xl border border-edge bg-ink/50 p-3 text-center"
                  >
                    <p className="text-[11px] font-semibold text-mist">{slotDef.label}</p>
                    <Socket item={item} round size={60} label={item.name} />
                    <p className="truncate text-xs font-bold text-gold w-full">{item.name}</p>
                    <div className="flex items-center gap-1 text-[10px] text-mist">
                      <span>T{item.tier}</span>
                      <span>•</span>
                      <a href={item.dbUrl} target="_blank" rel="noreferrer" className="text-mist hover:text-white">
                        baza ↗
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
