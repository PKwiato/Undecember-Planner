import { motion } from 'motion/react'
import { RARITY } from '../data/game'

// Hex socket. When filled, a slow runic ring turns around it.
export default function Socket({ item, size = 76, round = false, onClick, label }) {
  const color = item ? RARITY[item.rarity] : '#3a2f5c'
  const shape = round ? 'rounded-full' : 'hex'
  const Tag = onClick ? motion.button : motion.div
  return (
    <Tag
      onClick={onClick}
      aria-label={label}
      whileHover={onClick ? { scale: 1.06 } : undefined}
      whileTap={onClick ? { scale: 0.94 } : undefined}
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      {item && !round && (
        <svg className="ring absolute inset-0" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="48" stroke={color} strokeWidth="1.5" strokeDasharray="3 7" />
        </svg>
      )}
      <motion.div
        key={item?.id || 'empty'}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 20 }}
        className={`grid place-items-center ${shape}`}
        style={{
          width: size * 0.82, height: size * 0.82,
          background: item ? `linear-gradient(145deg, ${color}55, #1e1736)` : '#1e1736',
          border: `2px solid ${color}`,
          boxShadow: item ? `0 0 18px ${color}66` : 'none',
        }}
      >
        <span className="font-display text-lg" style={{ color: item ? color : '#6d6390' }}>
          {item ? item.name.slice(-1) : '+'}
        </span>
      </motion.div>
    </Tag>
  )
}
