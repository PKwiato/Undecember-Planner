import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import {
  SKILLS, LINKS, ELEMENTS, RARITY, HEX_DIRECTIONS, find, iconSources, assetUrl,
} from '../data/game'

// Pojedyncza komórka heksagonalna na planszy Rune Cast
export default function RuneCell({
  cell,
  metrics,
  isSelected,
  isDragOver,
  connectedLinksCount,
  linkedSkillsCount,
  onSelect,
  onPipClick,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemove,
  readOnly = false,
}) {
  const { R, W, H, getCellCenter, getEdgeMidpoint } = metrics
  const center = getCellCenter(cell.row, cell.col)
  const left = center.x - W / 2
  const top = center.y - H / 2

  const rune = cell.kind === 'skill'
    ? find(SKILLS, cell.runeId)
    : cell.kind === 'link'
    ? find(LINKS, cell.runeId)
    : null

  const [srcIndex, setSrcIndex] = useState(0)
  useEffect(() => setSrcIndex(0), [cell.runeId])

  const sources = rune
    ? cell.kind === 'skill'
      ? iconSources('skills', rune)
      : cell.kind === 'link'
      ? iconSources('links', rune)
      : rune.icon
      ? [assetUrl(rune.icon)]
      : []
    : []

  // Kolor obramowania
  const baseColor = rune
    ? cell.kind === 'skill'
      ? ELEMENTS[rune.color]?.hex || RARITY[rune.rarity] || '#d9b25f'
      : ELEMENTS[rune.color]?.hex || '#5b8def'
    : '#2d2347'

  const borderGlow = rune
    ? isSelected
      ? '0 0 16px #d9b25f, 0 0 30px #d9b25f88'
      : `0 0 12px ${baseColor}66`
    : isDragOver
    ? '0 0 14px #d9b25f, inset 0 0 10px #d9b25f44'
    : 'none'

  const handleContextMenu = (e) => {
    e.preventDefault()
    if (!readOnly && rune && onRemove) {
      onRemove(cell)
    }
  }

  return (
    <div
      className="absolute select-none"
      style={{
        left,
        top,
        width: W,
        height: H,
        zIndex: isSelected ? 20 : isDragOver ? 15 : rune ? 10 : 2,
      }}
      onDragOver={(e) => {
        if (!readOnly && onDragOver) onDragOver(e, cell)
      }}
      onDragLeave={(e) => {
        if (!readOnly && onDragLeave) onDragLeave(e, cell)
      }}
      onDrop={(e) => {
        if (!readOnly && onDrop) onDrop(e, cell)
      }}
      onContextMenu={handleContextMenu}
    >
      {/* Ciało Heksagonu */}
      <div
        draggable={!readOnly && Boolean(rune)}
        onDragStart={(e) => {
          if (!readOnly && onDragStart) onDragStart(e, cell)
        }}
        onClick={() => {
          if (onSelect) onSelect(cell)
        }}
        title={
          rune
            ? `${rune.name} (${rune.type === 'Skill' ? 'Skill' : 'Link'})\n[Kliknij, aby zarządzać • Prawy przycisk usuwa]`
            : `Pusty slot (${cell.row + 1}, ${cell.col + 1}) - przeciągnij runę tutaj`
        }
        className={`hex group relative h-full w-full cursor-pointer transition-all duration-200 ${
          !readOnly && rune ? 'cursor-grab active:cursor-grabbing hover:scale-105' : 'hover:scale-[1.02]'
        }`}
        style={{
          background: rune
            ? `radial-gradient(circle at 50% 50%, ${baseColor}33 0%, #150f29 70%, #0d0a17 100%)`
            : isDragOver
            ? 'radial-gradient(circle at 50% 50%, #d9b25f33 0%, #1e1638 100%)'
            : 'radial-gradient(circle at 50% 50%, #1a1330 0%, #100b21 100%)',
          boxShadow: borderGlow,
          border: `1.5px solid ${
            isSelected
              ? '#d9b25f'
              : isDragOver
              ? '#d9b25f'
              : rune
              ? baseColor
              : '#2a2046'
          }`,
        }}
      >
        {/* Runiczny wirujący pierścień dla skilli */}
        {cell.kind === 'skill' && rune && (
          <svg className="ring pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="46" stroke={baseColor} strokeWidth="1.2" strokeDasharray="3 7" opacity="0.6" />
          </svg>
        )}

        {/* Ikona runa lub wskaźnik pustego slotu */}
        <div className="absolute inset-0 flex items-center justify-center p-[15%]">
          {rune ? (
            srcIndex < sources.length ? (
              <img
                src={sources[srcIndex]}
                alt={rune.name}
                draggable={false}
                referrerPolicy="no-referrer"
                onError={() => setSrcIndex((n) => n + 1)}
                className={`h-full w-full object-contain pointer-events-none drop-shadow-md ${
                  cell.kind === 'link' ? 'scale-90' : 'scale-100'
                }`}
              />
            ) : (
              <span
                className="font-display font-bold pointer-events-none"
                style={{ color: baseColor, fontSize: R * 0.55 }}
              >
                {rune.name[0]}
              </span>
            )
          ) : (
            <div className="flex flex-col items-center justify-center opacity-30 transition-opacity group-hover:opacity-75">
              <span className="text-xl font-bold text-mist/60">+</span>
              <span className="text-[9px] font-mono text-mist/40">{cell.row + 1},{cell.col + 1}</span>
            </div>
          )}
        </div>

        {/* Etykieta podsumowania połączeń */}
        {cell.kind === 'skill' && rune && (
          <div className="absolute bottom-1 left-0 right-0 text-center pointer-events-none">
            <span
              className="rounded-full bg-ink/90 px-1.5 py-0.2 text-[9px] font-bold tracking-tight shadow"
              style={{ color: connectedLinksCount > 0 ? '#d9b25f' : '#b3a9cc' }}
            >
              {connectedLinksCount}/6
            </span>
          </div>
        )}

        {cell.kind === 'link' && rune && linkedSkillsCount > 0 && (
          <div className="absolute top-1 right-2 pointer-events-none">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gold text-[8px] font-black text-ink shadow">
              {linkedSkillsCount}
            </span>
          </div>
        )}
      </div>

      {/* Wskaźniki slotów na krawędziach (dla Skill Runes) */}
      {cell.kind === 'skill' && rune && cell.slots && (
        <div className="pointer-events-none absolute inset-0">
          {HEX_DIRECTIONS.map((d) => {
            const edgePos = getEdgeMidpoint(center.x, center.y, d.dir)
            const pipX = edgePos.x - left
            const pipY = edgePos.y - top
            const slotColor = cell.slots[d.dir]
            const colorHex = slotColor === 'white'
              ? '#ffffff'
              : slotColor
              ? ELEMENTS[slotColor]?.hex || '#d9b25f'
              : '#3a2e54'

            return (
              <button
                key={d.dir}
                type="button"
                disabled={readOnly}
                onClick={(e) => {
                  e.stopPropagation()
                  if (!readOnly && onPipClick) onPipClick(cell, d.dir)
                }}
                title={`Kierunek ${d.name} (${d.label}): ${slotColor ? ELEMENTS[slotColor]?.name || slotColor : 'Zablokowany'}\nKliknij, aby zmienić kolor slotu`}
                className={`pointer-events-auto absolute z-20 flex h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-150 ${
                  readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-140'
                }`}
                style={{
                  left: pipX,
                  top: pipY,
                  backgroundColor: slotColor ? colorHex : '#1e1635',
                  border: `1.5px solid ${slotColor ? (slotColor === 'white' ? '#fff' : colorHex) : '#3a2e54'}`,
                  boxShadow: slotColor ? `0 0 6px ${colorHex}` : 'none',
                }}
              >
                {slotColor === 'white' && (
                  <span className="text-[7px] font-black text-ink">W</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
