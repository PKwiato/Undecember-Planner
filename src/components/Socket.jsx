import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { RARITY, iconSources, assetUrl } from '../data/game'

// Socket. `kind` ('skills' | 'links' | 'uniques' | 'runestones') włącza ikonę z undecember.thein.ru,
// z zapasem lokalnym i fallbackiem na literę / '+'.
// `color` nadpisuje kolor ramki (np. kolor slotu linku).
// Hex: gdy zajęty, kręci się wokół niego runiczny pierścień.
export default function Socket({ item, size = 76, round = false, onClick, label, color, kind, disabled }) {
  const col = color || (item ? RARITY[item.rarity] || '#d9b25f' : '#3a2f5c')
  const [src, setSrc] = useState(0)
  useEffect(() => setSrc(0), [item?.id, item?.slug])

  const sources = item
    ? kind
      ? iconSources(kind, item)
      : item.icon
      ? [assetUrl(item.icon)]
      : []
    : []

  const Tag = onClick ? motion.button : motion.div
  const interactive = onClick && !disabled
  const tooltip = item ? `${item.name}${item.stat ? ` [${item.stat}]` : ''}` : label

  return (
    <Tag
      onClick={interactive ? onClick : undefined}
      title={tooltip}
      aria-label={label || tooltip}
      aria-disabled={onClick && disabled ? true : undefined}
      whileHover={interactive ? { scale: 1.08 } : undefined}
      whileTap={interactive ? { scale: 0.92 } : undefined}
      className={`relative grid place-items-center ${onClick && disabled ? 'cursor-not-allowed opacity-40' : ''}`}
      style={{ width: size, height: size }}
    >
      {item && !round && (
        <svg className="ring absolute inset-0 pointer-events-none" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <circle cx="50" cy="50" r="48" stroke={col} strokeWidth="1.5" strokeDasharray="3 7" opacity="0.8" />
        </svg>
      )}
      <motion.div
        key={item?.id || item?.slug || 'empty'}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 20 }}
        className={`grid place-items-center overflow-hidden ${round ? 'rounded-full' : 'hex'}`}
        style={{
          width: size * 0.82,
          height: size * 0.82,
          background: item ? `linear-gradient(145deg, ${col}44, #1e1736)` : '#1a1330',
          border: `2px solid ${item ? col : col + '88'}`,
          boxShadow: item ? `0 0 ${round ? 12 : 20}px ${col}66` : 'none',
        }}
      >
        {src < sources.length ? (
          <img
            src={sources[src]}
            alt={item?.name || ''}
            draggable={false}
            referrerPolicy="no-referrer"
            onError={() => setSrc((n) => n + 1)}
            className="h-full w-full object-contain p-[10%]"
          />
        ) : (
          <span className="font-display font-bold" style={{ color: item ? col : '#6d6390', fontSize: size * 0.28 }}>
            {item ? item.name[0] : onClick ? '+' : ''}
          </span>
        )}
      </motion.div>
    </Tag>
  )
}
