import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import RuneCell from './RuneCell'
import {
  SKILLS, LINKS, RUNESTONES, ELEMENTS, RARITY, HEX_DIRECTIONS,
  getHexMetrics, calculateBoardLinks, getNeighborCoord, getOppositeDirection,
  find, iconSources, assetUrl,
} from '../data/game'

export default function RuneBoard({
  board,
  onUpdateBoard,
  selectedCell,
  onSelectCell,
  selectedRune,
  onClearSelectedRune,
  readOnly = false,
}) {
  const [dragOverCellId, setDragOverCellId] = useState(null)
  const [isExpanded, setIsExpanded] = useState(board.cols > 6 || board.rows > 5)

  // Hex grid metrics (radius = 38 on mobile / 44 on desktop)
  const metrics = useMemo(() => {
    return getHexMetrics(44, 28)
  }, [])

  const { width: boardWidth, height: boardHeight } = useMemo(() => {
    return metrics.getBoardDimensions(board.rows, board.cols)
  }, [board.rows, board.cols, metrics])

  // Active links, summaries and status
  const { links, skillsSummary, cellLinkStatus } = useMemo(() => {
    return calculateBoardLinks(board)
  }, [board])

  // Helper to update a single cell
  const updateCell = (cellId, patch) => {
    const newCells = board.cells.map((c) => (c.id === cellId ? { ...c, ...patch } : c))
    onUpdateBoard({ ...board, cells: newCells })
  }

  // Handle Drag & Drop
  const handleDragStart = (e, cell) => {
    if (readOnly || !cell.runeId) return
    const dragData = {
      type: 'board',
      fromCellId: cell.id,
      runeId: cell.runeId,
      kind: cell.kind,
      slots: cell.slots,
    }
    e.dataTransfer.setData('application/json', JSON.stringify(dragData))
  }

  const handleDragOver = (e, targetCell) => {
    if (readOnly) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverCellId !== targetCell.id) {
      setDragOverCellId(targetCell.id)
    }
  }

  const handleDragLeave = (e, targetCell) => {
    if (dragOverCellId === targetCell.id) {
      setDragOverCellId(null)
    }
  }

  const handleDrop = (e, targetCell) => {
    if (readOnly) return
    e.preventDefault()
    setDragOverCellId(null)

    let raw = e.dataTransfer.getData('application/json')
    if (!raw) return
    let data
    try {
      data = JSON.parse(raw)
    } catch {
      return
    }

    // Dropped from Rune Inventory
    if (data.type === 'inventory') {
      const runeId = data.id
      const kind = data.kind

      if (kind === 'runestone') {
        // Runestones go into Runestone slots, or handle separately
        return
      }

      const rune = kind === 'skill' ? find(SKILLS, runeId) : find(LINKS, runeId)
      if (!rune) return

      let initialSlots = targetCell.slots || ['red', 'red', 'red', 'red', 'red', 'red']
      if (kind === 'skill') {
        const skillColor = rune.color || 'red'
        initialSlots = Array.from({ length: 6 }, () => skillColor)
      }

      updateCell(targetCell.id, {
        runeId,
        kind,
        slots: initialSlots,
      })
      if (onClearSelectedRune) onClearSelectedRune()
    }
    // Moved or swapped from another cell on the board
    else if (data.type === 'board') {
      const sourceCellId = data.fromCellId
      if (sourceCellId === targetCell.id) return

      const sourceCell = board.cells.find((c) => c.id === sourceCellId)
      if (!sourceCell) return

      // Swap or move
      const newCells = board.cells.map((c) => {
        if (c.id === targetCell.id) {
          return {
            ...c,
            runeId: sourceCell.runeId,
            kind: sourceCell.kind,
            slots: sourceCell.slots,
          }
        }
        if (c.id === sourceCellId) {
          return {
            ...c,
            runeId: targetCell.runeId,
            kind: targetCell.kind,
            slots: targetCell.slots,
          }
        }
        return c
      })

      onUpdateBoard({ ...board, cells: newCells })
    }
  }

  // Handle Click-to-place from inventory
  const handleCellClick = (cell) => {
    if (readOnly) {
      if (onSelectCell) onSelectCell(cell)
      return
    }

    if (selectedRune) {
      if (selectedRune.kind === 'runestone') return
      const runeId = selectedRune.slug || selectedRune.id
      const kind = selectedRune.kind
      const rune = kind === 'skill' ? find(SKILLS, runeId) : find(LINKS, runeId)
      let initialSlots = cell.slots || ['red', 'red', 'red', 'red', 'red', 'red']
      if (kind === 'skill' && rune) {
        const skillColor = rune.color || 'red'
        initialSlots = Array.from({ length: 6 }, () => skillColor)
      }

      updateCell(cell.id, {
        runeId,
        kind,
        slots: initialSlots,
      })
      if (onClearSelectedRune) onClearSelectedRune()
      return
    }

    if (onSelectCell) onSelectCell(cell)
  }

  // Pip (facet) click on skill runes
  const handlePipClick = (cell, dir) => {
    if (readOnly || cell.kind !== 'skill') return
    const current = cell.slots?.[dir] || 'red'
    const order = ['red', 'green', 'blue', 'white', null]
    const nextIdx = (order.indexOf(current) + 1) % order.length
    const nextColor = order[nextIdx]
    const updated = [...(cell.slots || ['red', 'red', 'red', 'red', 'red', 'red'])]
    updated[dir] = nextColor
    updateCell(cell.id, { slots: updated })
  }

  const handleRemoveRune = (cell) => {
    if (readOnly) return
    updateCell(cell.id, { runeId: null, kind: null })
  }

  // Tool actions
  const handleClearBoard = () => {
    if (readOnly) return
    if (!window.confirm('Czy na pewno chcesz wyczyścić całą planszę run?')) return
    const newCells = board.cells.map((c) => ({
      ...c,
      runeId: null,
      kind: null,
      slots: ['red', 'red', 'red', 'red', 'red', 'red'],
    }))
    onUpdateBoard({ ...board, cells: newCells })
  }

  const handleSetAllWhite = () => {
    if (readOnly) return
    const newCells = board.cells.map((c) => {
      if (c.kind === 'skill') {
        return { ...c, slots: ['white', 'white', 'white', 'white', 'white', 'white'] }
      }
      return c
    })
    onUpdateBoard({ ...board, cells: newCells })
  }

  const handleAutoAlignAll = () => {
    if (readOnly) return
    const cellMap = new Map()
    for (const c of board.cells) cellMap.set(`${c.row}_${c.col}`, c)

    const newCells = board.cells.map((c) => {
      if (c.kind !== 'skill') return c
      const skill = find(SKILLS, c.runeId)
      if (!skill) return c

      const updatedSlots = [...(c.slots || ['red', 'red', 'red', 'red', 'red', 'red'])]
      for (let dir = 0; dir < 6; dir++) {
        const nCoord = getNeighborCoord(c.row, c.col, dir)
        if (!nCoord) continue
        const neighbor = cellMap.get(`${nCoord.row}_${nCoord.col}`)
        if (neighbor && neighbor.kind === 'link' && neighbor.runeId) {
          const link = find(LINKS, neighbor.runeId)
          if (link) {
            updatedSlots[dir] = link.color || 'red'
          }
        }
      }
      return { ...c, slots: updatedSlots }
    })

    onUpdateBoard({ ...board, cells: newCells })
  }

  const handleToggleExpansion = () => {
    if (readOnly) return
    const newCols = isExpanded ? 6 : 7
    setIsExpanded(!isExpanded)

    const existingMap = new Map()
    for (const c of board.cells) existingMap.set(`${c.row}_${c.col}`, c)

    const newCells = []
    for (let r = 0; r < board.rows; r++) {
      for (let c = 0; c < newCols; c++) {
        const existing = existingMap.get(`${r}_${c}`)
        if (existing) {
          newCells.push(existing)
        } else {
          newCells.push({
            id: `c-${r}-${c}`,
            row: r,
            col: c,
            runeId: null,
            kind: null,
            slots: ['red', 'red', 'red', 'red', 'red', 'red'],
          })
        }
      }
    }

    onUpdateBoard({ ...board, cols: newCols, cells: newCells })
  }

  // Runestones handler
  const handleRunestoneDrop = (index, e) => {
    if (readOnly) return
    e.preventDefault()
    let raw = e.dataTransfer.getData('application/json')
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      if (data.kind === 'runestone') {
        const current = [...(board.runestones || [null, null, null])]
        current[index] = data.id
        onUpdateBoard({ ...board, runestones: current })
      }
    } catch {}
  }

  const occupiedCount = board.cells.filter((c) => c.runeId).length

  return (
    <div className="flex flex-col rounded-3xl border border-edge/80 bg-panel/75 p-5 shadow-2xl backdrop-blur-lg">
      {/* Top Header & Board Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-edge/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔮</span>
            <h2 className="font-display text-xl font-bold tracking-tight text-white">
              Siatka Run (Rune Cast Board)
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-mist">
            Zajęto: <span className="font-bold text-gold">{occupiedCount}</span> / {board.cells.length} slotów
            {links.length > 0 && (
              <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-bold text-gold">
                {links.length} {links.length === 1 ? 'aktywne połączenie' : 'aktywnych połączeń'}
              </span>
            )}
          </p>
        </div>

        {/* Quick actions toolbar */}
        {!readOnly && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSetAllWhite}
              title="Ustawia wszystkie sloty skilli na uniwersalne białe (dowolny kolor linku)"
              className="flex items-center gap-1 rounded-xl border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/20"
            >
              <span>🌟</span>
              <span>6x Białe</span>
            </button>
            <button
              onClick={handleAutoAlignAll}
              title="Automatycznie dopasowuje kolory slotów skilli do sąsiadujących linków"
              className="flex items-center gap-1 rounded-xl border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-bold text-gold transition-colors hover:bg-gold/20"
            >
              <span>🎯</span>
              <span>Dopasuj sloty</span>
            </button>
            <button
              onClick={handleToggleExpansion}
              title="Rozszerza planszę o dodatkowe sloty (Traum's Crystals)"
              className="flex items-center gap-1 rounded-xl border border-edge bg-ink/60 px-3 py-1.5 text-xs font-medium text-mist transition-colors hover:text-white"
            >
              <span>📐</span>
              <span>{isExpanded ? 'Standard (30)' : '+7 Slotów (Traum)'}</span>
            </button>
            <button
              onClick={handleClearBoard}
              title="Wyczyść wszystkie runy z planszy"
              className="flex items-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20"
            >
              <span>🧹</span>
              <span>Wyczyść</span>
            </button>
          </div>
        )}
      </div>

      {/* 3 Runestones Sockets at top of the board */}
      <div className="mt-4 flex items-center justify-between rounded-2xl border border-edge/60 bg-ink/40 p-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-mist">
            Kamienie Runiczne (Runestones):
          </span>
          <span className="text-[11px] text-mist/60">(przeciągnij ze Skrytki Run)</span>
        </div>

        <div className="flex items-center gap-3">
          {[0, 1, 2].map((idx) => {
            const stoneId = board.runestones?.[idx]
            const stone = stoneId ? find(RUNESTONES, stoneId) : null

            return (
              <div
                key={idx}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleRunestoneDrop(idx, e)}
                className="group relative flex items-center gap-2 rounded-xl border border-edge bg-panel p-1.5 transition-all hover:border-gold/60"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/40 bg-ink/70"
                  style={{
                    boxShadow: stone ? '0 0 8px #d9b25f44' : 'none',
                  }}
                >
                  {stone ? (
                    <img
                      src={assetUrl(stone.icon)}
                      alt={stone.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <span className="text-xs text-mist/40">💎</span>
                  )}
                </div>
                <div className="pr-1 text-left">
                  <p className="text-[11px] font-bold text-gold truncate max-w-[100px]">
                    {stone ? stone.name : `Slot ${idx + 1}`}
                  </p>
                  <p className="text-[9px] text-mist/60">
                    {stone ? `Tier ${stone.tier}` : 'Pusty'}
                  </p>
                </div>
                {!readOnly && stone && (
                  <button
                    onClick={() => {
                      const updated = [...(board.runestones || [null, null, null])]
                      updated[idx] = null
                      onUpdateBoard({ ...board, runestones: updated })
                    }}
                    className="text-xs text-red-400 opacity-60 hover:opacity-100"
                    title="Usuń Runestone"
                  >
                    ✕
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Interactive Hexagon Canvas Area */}
      <div className="relative mt-6 flex justify-center overflow-x-auto py-2">
        <div
          className="relative select-none"
          style={{
            width: boardWidth,
            height: boardHeight,
            minWidth: boardWidth,
            minHeight: boardHeight,
          }}
        >
          {/* SVG Connection Beams Layer */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{ width: boardWidth, height: boardHeight }}
          >
            <defs>
              <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#d9b25f" />
              </filter>
            </defs>

            {/* Glowing lines for active links */}
            {links.map((link) => {
              const skillCell = board.cells.find((c) => c.id === link.skillCellId)
              const linkCell = board.cells.find((c) => c.id === link.linkCellId)
              if (!skillCell || !linkCell) return null

              const fromCenter = metrics.getCellCenter(skillCell.row, skillCell.col)
              const toCenter = metrics.getCellCenter(linkCell.row, linkCell.col)

              return (
                <g key={link.id}>
                  {/* Background halo glow */}
                  <line
                    x1={fromCenter.x}
                    y1={fromCenter.y}
                    x2={toCenter.x}
                    y2={toCenter.y}
                    stroke={link.color}
                    strokeWidth="7"
                    strokeOpacity="0.25"
                    strokeLinecap="round"
                  />
                  {/* Core energy beam with living pulse animation */}
                  <line
                    x1={fromCenter.x}
                    y1={fromCenter.y}
                    x2={toCenter.x}
                    y2={toCenter.y}
                    stroke={link.color}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray="8 5"
                    className="animate-beam-flow"
                    style={{
                      filter: `drop-shadow(0 0 6px ${link.color})`,
                    }}
                  />
                  {/* Energy nodes at centers */}
                  <circle cx={fromCenter.x} cy={fromCenter.y} r="3" fill={link.color} />
                  <circle cx={toCenter.x} cy={toCenter.y} r="3" fill={link.color} />
                </g>
              )
            })}
          </svg>

          {/* HTML Cells Overlay */}
          {board.cells.map((cell) => {
            const summary = skillsSummary.find((s) => s.cellId === cell.id)
            const linkStatus = cellLinkStatus[cell.id]

            return (
              <RuneCell
                key={cell.id}
                cell={cell}
                metrics={metrics}
                isSelected={selectedCell?.id === cell.id}
                isDragOver={dragOverCellId === cell.id}
                connectedLinksCount={summary?.activeLinksCount || 0}
                linkedSkillsCount={linkStatus?.linkedSkills?.length || 0}
                onSelect={handleCellClick}
                onPipClick={handlePipClick}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onRemove={handleRemoveRune}
                readOnly={readOnly}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
