import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import RuneBoard from '../components/RuneBoard'
import RuneInventory from '../components/RuneInventory'
import RuneInspector from '../components/RuneInspector'
import SkillHotbar from '../components/SkillHotbar'
import Socket from '../components/Socket'
import {
  CLASSES, UNIQUES, RUNESTONES, GEAR_SLOTS, LINKS,
  find, createDefaultBoard, calculateBoardLinks, syncBoardToLegacySlots,
  getNeighborCoord, emptyEquipment,
} from '../data/game'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Builder() {
  const nav = useNavigate()
  const { user, openAuthModal } = useAuth()
  const [b, setB] = useState({
    title: '',
    description: '',
    cls: CLASSES[0].id,
    board: createDefaultBoard(5, 6),
    equipment: emptyEquipment(),
  })

  const [tab, setTab] = useState('skills') // 'skills' | 'equipment'
  const [selectedCell, setSelectedCell] = useState(null)
  const [selectedRune, setSelectedRune] = useState(null)
  const [pick, setPick] = useState(null) // gear or runestone picker modal
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  // Calculate board links dynamically
  const { links, skillsSummary, cellLinkStatus } = useMemo(() => {
    return calculateBoardLinks(b.board)
  }, [b.board])

  // Current selected cell on the board
  const activeCell = useMemo(() => {
    if (!selectedCell) return null
    return b.board.cells.find((c) => c.id === selectedCell.id) || selectedCell
  }, [selectedCell, b.board.cells])

  const activeSummary = useMemo(() => {
    if (!activeCell) return null
    return skillsSummary.find((s) => s.cellId === activeCell.id)
  }, [activeCell, skillsSummary])

  const activeLinkStatus = useMemo(() => {
    if (!activeCell) return null
    return cellLinkStatus[activeCell.id]
  }, [activeCell, cellLinkStatus])

  // Update board
  const handleUpdateBoard = (newBoard) => {
    setB((prev) => ({
      ...prev,
      board: newBoard,
      equipment: {
        ...prev.equipment,
        runestone1: newBoard.runestones?.[0] || null,
        runestone2: newBoard.runestones?.[1] || null,
        runestone3: newBoard.runestones?.[2] || null,
      },
    }))
  }

  // Update gear
  const updateGear = (key, val) =>
    setB((s) => ({ ...s, equipment: { ...s.equipment, [key]: val } }))

  // Save build to Supabase
  const save = async () => {
    if (!user) {
      setErr('Musisz być zalogowany, aby zapisać build w bazie.')
      openAuthModal()
      return
    }

    if (!b.title.trim()) return setErr('Wpisz nazwę buildu.')
    setBusy(true)
    setErr('')

    const legacySlots = syncBoardToLegacySlots(b.board)

    const { data, error } = await supabase
      .from('builds')
      .insert({
        user_id: user.id,
        title: b.title.trim(),
        description: b.description.trim(),
        class: b.cls,
        data: {
          board: b.board,
          slots: legacySlots,
          equipment: b.equipment,
        },
      })
      .select('id')
      .single()

    if (error) {
      setErr('Nie udało się zapisać buildu: ' + error.message)
      setBusy(false)
      return
    }
    nav('/build/' + data.id)
  }

  // Gear & Runestones modal filtering
  const openPicker = (pickerConfig) => {
    setSearch('')
    setPick(pickerConfig)
  }

  const filteredUniques = useMemo(() => {
    if (pick?.kind !== 'gear') return []
    return UNIQUES.filter((u) => {
      if (pick.slotType && u.slot !== pick.slotType && pick.slotType !== 'Armor') return false
      if (search.trim()) {
        const q = search.toLowerCase()
        if (!u.name.toLowerCase().includes(q) && !u.slot.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [pick, search])

  const filteredRunestones = useMemo(() => {
    if (pick?.kind !== 'runestone') return []
    return RUNESTONES.filter((r) => {
      if (search.trim() && !r.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [pick, search])

  // Slot customizers
  const handleUpdateSlots = (cell, updatedSlots) => {
    const newCells = b.board.cells.map((c) => (c.id === cell.id ? { ...c, slots: updatedSlots } : c))
    handleUpdateBoard({ ...b.board, cells: newCells })
  }

  const handleRotateSlots = (cell) => {
    const s = cell.slots || ['red', 'red', 'red', 'red', 'red', 'red']
    const rotated = [s[5], s[0], s[1], s[2], s[3], s[4]]
    handleUpdateSlots(cell, rotated)
  }

  const handleMaxWhiteSlots = (cell) => {
    handleUpdateSlots(cell, ['white', 'white', 'white', 'white', 'white', 'white'])
  }

  const handleAutoAlignSlots = (cell) => {
    const cellMap = new Map()
    for (const c of b.board.cells) cellMap.set(`${c.row}_${c.col}`, c)
    const updated = [...(cell.slots || ['red', 'red', 'red', 'red', 'red', 'red'])]

    for (let dir = 0; dir < 6; dir++) {
      const nCoord = getNeighborCoord(cell.row, cell.col, dir)
      if (!nCoord) continue
      const neighbor = cellMap.get(`${nCoord.row}_${nCoord.col}`)
      if (neighbor && neighbor.kind === 'link' && neighbor.runeId) {
        const link = find(LINKS, neighbor.runeId)
        if (link) updated[dir] = link.color || 'red'
      }
    }
    handleUpdateSlots(cell, updated)
  }

  const handleRemoveRune = (cell) => {
    const newCells = b.board.cells.map((c) =>
      c.id === cell.id ? { ...c, runeId: null, kind: null } : c
    )
    handleUpdateBoard({ ...b.board, cells: newCells })
    setSelectedCell(null)
  }

  const handleDropToUnequip = (e) => {
    let raw = e.dataTransfer.getData('application/json')
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      if (data.type === 'board' && data.fromCellId) {
        const newCells = b.board.cells.map((c) =>
          c.id === data.fromCellId ? { ...c, runeId: null, kind: null } : c
        )
        handleUpdateBoard({ ...b.board, cells: newCells })
        if (selectedCell?.id === data.fromCellId) setSelectedCell(null)
      }
    } catch {}
  }

  return (
    <section className="space-y-6">
      {/* Title & Class Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={b.title}
          onChange={(e) => setB({ ...b, title: e.target.value })}
          maxLength={80}
          placeholder="Nazwa buildu (np. Whirlwind Berserker)"
          className="w-full border-b border-edge bg-transparent pb-2 font-display text-3xl font-bold outline-none focus:border-gold sm:text-4xl text-white placeholder-mist/40"
        />
      </div>

      {/* Class selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-mist">Klasa:</span>
        {CLASSES.map((c) => (
          <button
            key={c.id}
            onClick={() => setB({ ...b, cls: c.id })}
            className="relative rounded-full px-4 py-1.5 text-sm transition-colors"
          >
            {b.cls === c.id && (
              <motion.span
                layoutId="cls"
                className="absolute inset-0 rounded-full"
                style={{ background: c.color + '33', border: `1.5px solid ${c.color}` }}
              />
            )}
            <span className="relative font-medium" style={{ color: b.cls === c.id ? c.color : '#efeaff' }}>
              {c.name}
            </span>
          </button>
        ))}
      </div>

      {/* Tabs: Rune Cast vs Equipment */}
      <div className="flex border-b border-edge">
        <button
          onClick={() => setTab('skills')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 font-display text-sm font-semibold transition-colors ${
            tab === 'skills' ? 'border-gold text-gold' : 'border-transparent text-mist hover:text-white'
          }`}
        >
          <span>Układ Run (Rune Cast)</span>
          <span className="rounded-full bg-panel px-2 py-0.5 text-xs text-mist">
            {skillsSummary.length} skilli • {links.length} linków
          </span>
        </button>
        <button
          onClick={() => setTab('equipment')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 font-display text-sm font-semibold transition-colors ${
            tab === 'equipment' ? 'border-gold text-gold' : 'border-transparent text-mist hover:text-white'
          }`}
        >
          <span>Ekwipunek Unikalny</span>
          <span className="rounded-full bg-panel px-2 py-0.5 text-xs text-mist">10 slotów</span>
        </button>
      </div>

      {/* TAB 1: RUNE CAST - UNIFIED BOARD & INVENTORY */}
      {tab === 'skills' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Main area: Rune Board, Hotbar, Inspector */}
          <div className="space-y-6 lg:col-span-7 xl:col-span-8">
            {/* The Unified Honeycomb Board */}
            <RuneBoard
              board={b.board}
              onUpdateBoard={handleUpdateBoard}
              selectedCell={activeCell}
              onSelectCell={setSelectedCell}
              selectedRune={selectedRune}
              onClearSelectedRune={() => setSelectedRune(null)}
            />

            {/* Active Skills Hotbar */}
            <SkillHotbar
              skillsSummary={skillsSummary}
              selectedCellId={activeCell?.id}
              onSelectSkillCell={(cell) => setSelectedCell(cell)}
            />

            {/* Selected Rune Inspector */}
            <AnimatePresence>
              {activeCell && activeCell.runeId && (
                <RuneInspector
                  cell={activeCell}
                  onClose={() => setSelectedCell(null)}
                  onUpdateSlots={handleUpdateSlots}
                  onRemoveRune={handleRemoveRune}
                  onRotateSlots={handleRotateSlots}
                  onMaxWhiteSlots={handleMaxWhiteSlots}
                  onAutoAlignSlots={handleAutoAlignSlots}
                  connectedLinks={activeSummary?.connectedLinks || []}
                  linkedSkills={activeLinkStatus?.linkedSkills || []}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Side area: Rune Bag / Inventory */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-6">
              <RuneInventory
                selectedRune={selectedRune}
                onSelectRune={setSelectedRune}
                onDropToUnequip={handleDropToUnequip}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EQUIPMENT & RUNESTONES */}
      {tab === 'equipment' && (
        <div className="space-y-8 rounded-2xl border border-edge/80 bg-panel/80 p-6 shadow-xl backdrop-blur-md">
          <div>
            <h3 className="font-display text-xl font-bold text-gold">Ekwipunek Unikalny</h3>
            <p className="text-sm text-mist">
              Wybierz unikalne przedmioty z bazy danych undecember.thein.ru (707 unikatów) dla swojego buildu.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {GEAR_SLOTS.map((slotDef) => {
                const itemId = b.equipment[slotDef.key]
                const item = itemId ? find(UNIQUES, itemId) : null
                return (
                  <div
                    key={slotDef.key}
                    className="flex flex-col items-center gap-2 rounded-xl border border-edge/80 bg-panel/70 p-3 text-center transition-colors hover:border-gold/50"
                  >
                    <p className="text-xs font-semibold text-mist">{slotDef.label}</p>
                    <Socket
                      item={item}
                      round
                      size={68}
                      onClick={() => openPicker({ kind: 'gear', slotKey: slotDef.key, slotType: slotDef.slot })}
                      label={slotDef.label}
                    />
                    <div className="min-h-[42px] w-full">
                      {item ? (
                        <>
                          <p className="truncate text-xs font-bold text-gold">{item.name}</p>
                          <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-mist">
                            <span>T{item.tier}</span>
                            <span>•</span>
                            <a
                              href={item.dbUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-mist hover:text-white"
                            >
                              baza ↗
                            </a>
                            <span>•</span>
                            <button
                              onClick={() => updateGear(slotDef.key, null)}
                              className="text-red-400 hover:underline"
                            >
                              usuń
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() => openPicker({ kind: 'gear', slotKey: slotDef.key, slotType: slotDef.slot })}
                          className="text-xs text-mist/60 hover:text-gold"
                        >
                          + Dodaj unikat
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Description & Save */}
      <div className="rounded-2xl border border-edge/80 bg-panel/80 p-5 shadow-lg backdrop-blur-sm">
        <label className="block font-display text-sm font-semibold uppercase tracking-wider text-gold">
          Opis Buildu i Porady
        </label>
        <textarea
          value={b.description}
          onChange={(e) => setB({ ...b, description: e.target.value })}
          maxLength={3000}
          rows={4}
          placeholder="Opisz strategię buildu: główne źródło obrażeń, rotację umiejętności, priorytety statystyk w Zodiacie i sprzęcie..."
          className="mt-2 w-full rounded-xl border border-edge bg-ink/50 p-4 text-sm text-white outline-none transition-colors focus:border-gold placeholder-mist/40"
        />

        {err && <p role="alert" className="mt-3 text-sm font-medium text-red-400">{err}</p>}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-mist">
            {user
              ? `Twój build zostanie przypisany do Twojego konta (${user.email}).`
              : 'Wymagane logowanie do zapisu buildu. Zaloguj się lub utwórz konto, aby kontynuować.'}
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={user ? save : openAuthModal}
            disabled={busy}
            className="rounded-full bg-gold px-8 py-3 font-display font-bold text-ink shadow-lg shadow-gold/20 transition-all hover:bg-gold-hover disabled:opacity-50 cursor-pointer text-center whitespace-nowrap"
          >
            {busy
              ? 'Zapisywanie w bazie…'
              : user
              ? 'Zapisz build'
              : 'Zaloguj się i zapisz'}
          </motion.button>
        </div>
      </div>

      {/* MODAL PICKER (Gear & Runestones) */}
      <AnimatePresence>
        {pick && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPick(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 24, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl border border-edge bg-[#151026] shadow-2xl overflow-hidden"
            >
              {/* MODAL: UNIQUE GEAR SELECTION */}
              {pick.kind === 'gear' && (
                <>
                  <div className="border-b border-edge/80 p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-display text-xl font-bold text-gold">
                          Wybierz Ekwipunek Unikalny ({pick.slotType})
                        </h2>
                        <p className="text-xs text-mist">
                          Wybierz spośród unikatów z oficjalnej bazy danych Undecember
                        </p>
                      </div>
                      <button
                        onClick={() => setPick(null)}
                        className="rounded-full p-2 text-mist hover:bg-white/10 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Szukaj przedmiotu po nazwie..."
                        className="w-full rounded-xl border border-edge bg-ink/70 px-4 py-2 text-sm text-white outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {filteredUniques.map((u) => (
                        <div
                          key={u.slug}
                          onClick={() => {
                            updateGear(pick.slotKey, u.slug)
                            setPick(null)
                          }}
                          className="group flex cursor-pointer items-center gap-3 rounded-xl border border-edge/60 bg-panel/70 p-3 transition-all hover:border-gold hover:bg-panel"
                        >
                          <Socket item={u} round size={48} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="truncate font-display font-bold text-sm text-gold group-hover:text-gold-hover">
                                {u.name}
                              </p>
                              <a
                                href={u.dbUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] text-mist/60 hover:text-gold"
                              >
                                thein.ru ↗
                              </a>
                            </div>
                            <p className="text-xs text-mist">
                              Tier {u.tier} • {u.stat} • {u.slot}
                            </p>
                          </div>
                        </div>
                      ))}
                      {filteredUniques.length === 0 && (
                        <div className="col-span-2 py-10 text-center text-mist">
                          Brak przedmiotów spełniających kryteria.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between border-t border-edge/80 p-4">
                    <button
                      onClick={() => {
                        updateGear(pick.slotKey, null)
                        setPick(null)
                      }}
                      className="rounded-lg border border-red-500/30 px-4 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
                    >
                      Usuń przedmiot
                    </button>
                    <button
                      onClick={() => setPick(null)}
                      className="rounded-lg border border-edge px-4 py-1.5 text-xs text-mist hover:text-white"
                    >
                      Anuluj
                    </button>
                  </div>
                </>
              )}

              {/* MODAL: RUNESTONE SELECTION */}
              {pick.kind === 'runestone' && (
                <>
                  <div className="border-b border-edge/80 p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-display text-xl font-bold text-gold">
                          Wybierz Kamień Runiczny (Runestone)
                        </h2>
                        <p className="text-xs text-mist">
                          Dostępnych 90 kamieni runicznych z bazy undecember.thein.ru
                        </p>
                      </div>
                      <button
                        onClick={() => setPick(null)}
                        className="rounded-full p-2 text-mist hover:bg-white/10 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mt-4">
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Szukaj Runestone po nazwie..."
                        className="w-full rounded-xl border border-edge bg-ink/70 px-4 py-2 text-sm text-white outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {filteredRunestones.map((r) => (
                        <div
                          key={r.slug}
                          onClick={() => {
                            updateGear(pick.slotKey, r.slug)
                            setPick(null)
                          }}
                          className="group flex cursor-pointer items-center gap-3 rounded-xl border border-edge/60 bg-panel/70 p-3 transition-all hover:border-gold hover:bg-panel"
                        >
                          <Socket item={r} size={48} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="truncate font-display font-bold text-sm text-white group-hover:text-gold">
                                {r.name}
                              </p>
                              <a
                                href={r.dbUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] text-mist/60 hover:text-gold"
                              >
                                thein.ru ↗
                              </a>
                            </div>
                            <p className="text-xs text-mist capitalize">{r.rarity}</p>
                          </div>
                        </div>
                      ))}
                      {filteredRunestones.length === 0 && (
                        <div className="col-span-2 py-10 text-center text-mist">
                          Brak Runestones spełniających kryteria.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between border-t border-edge/80 p-4">
                    <button
                      onClick={() => {
                        updateGear(pick.slotKey, null)
                        setPick(null)
                      }}
                      className="rounded-lg border border-red-500/30 px-4 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
                    >
                      Usuń Runestone
                    </button>
                    <button
                      onClick={() => setPick(null)}
                      className="rounded-lg border border-edge px-4 py-1.5 text-xs text-mist hover:text-white"
                    >
                      Anuluj
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
