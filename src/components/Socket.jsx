import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { RARITY, iconUrl } from '../data/game'

// Socket. `kind` ('skills' | 'links') włącza ikonę z public/assets/<kind>/<id>.png,
// bez pliku pokazuje literę. `color` nadpisuje kolor ramki (np. kolor slotu linku).
// Hex: gdy zajęty, kręci się wokół niego runiczny pierścień.
export default function Socket({ item, size = 76, round = false, onClick, label, color, kind, disabled }) {
  const col = color || (item ? RARITY[item.rarity] : '#3a2f5c')
  const [broken, setBroken] = useState(false)
  useEffect(() => setBroken(false), [item?.id])
  const Tag = onClick ? motion.button : motion.div
  const interactive = onClick && !disabled
  return (
    <Tag
      onClick={interactive ? onClick : undefined}
      aria-label={label}
      aria-disabled={onClick && disabled ? true : undefined}
      whileHover={interactive ? { scale: 1.08 } : undefined}
      whileTap={interactive ? { scale: 0.92 } : undefined}
      className={`relative grid place-items-center ${onClick && disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      style={{ width: size, height: size }}
    >
      {item && !round && (
        <svg className="ring absolute inset-0" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <circle cx="50" cy="50" r="48" stroke={col} strokeWidth="1.5" strokeDasharray="3 7" />
        </svg>
      )}
      <motion.div
        key={item?.id || 'empty'}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 20 }}
        className={`grid place-items-center overflow-hidden ${round ? 'rounded-full' : 'hex'}`}
        style={{
          width: size * 0.82, height: size * 0.82,
          background: item ? `linear-gradient(145deg, ${col}55, #1e1736)` : '#1e1736',
          border: `2px solid ${item ? col : col + '88'}`,
          boxShadow: item ? `0 0 ${round ? 10 : 18}px ${col}88` : 'none',
        }}
      >
        {item && kind && !broken ? (
          <img src={iconUrl(kind, item.id)} alt="" draggable={false} onError={() => setBroken(true)}
            className="h-full w-full object-contain p-[10%]" />
        ) : (
          <span className="font-display" style={{ color: item ? col : '#6d6390', fontSize: size * 0.28 }}>
            {item ? item.name[0] : onClick ? '+' : ''}
          </span>
        )}
      </motion.div>
    </Tag>
  )
}
