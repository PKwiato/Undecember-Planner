import { motion } from 'motion/react'
import { ELEMENTS, find, SKILLS, iconSources, assetUrl } from '../data/game'

export default function SkillHotbar({
  skillsSummary = [],
  selectedCellId,
  onSelectSkillCell,
}) {
  return (
    <div className="rounded-2xl border border-edge/80 bg-panel/90 p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">⚔️</span>
          <h3 className="font-display text-sm font-bold text-gold">
            Aktywne Umiejętności w Buildzie (Skill Bar)
          </h3>
        </div>
        <span className="text-xs text-mist/70">
          {skillsSummary.length} {skillsSummary.length === 1 ? 'skill' : 'skilli'} na planszy
        </span>
      </div>

      {skillsSummary.length === 0 ? (
        <p className="mt-3 text-center text-xs text-mist/50 italic py-4">
          Przeciągnij runy umiejętności ze Skrytki Run na planszę, aby skomponować build.
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {skillsSummary.map((summary) => {
            const { skill, cell, connectedLinks, activeLinksCount } = summary
            const isSelected = selectedCellId === cell.id
            const col = ELEMENTS[skill.color]?.hex || '#d9b25f'
            const sources = iconSources('skills', skill)

            return (
              <motion.div
                key={cell.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => onSelectSkillCell && onSelectSkillCell(cell)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 transition-all ${
                  isSelected
                    ? 'border-gold bg-gold/15 shadow-md shadow-gold/10'
                    : 'border-edge/70 bg-ink/50 hover:border-gold/50 hover:bg-panel-card'
                }`}
              >
                {/* Skill mini hex */}
                <div
                  className="hex relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${col}44, #120d24)`,
                    border: `1.5px solid ${col}`,
                    boxShadow: `0 0 10px ${col}44`,
                  }}
                >
                  {sources.length > 0 ? (
                    <img
                      src={sources[0]}
                      alt={skill.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-contain p-1 pointer-events-none"
                    />
                  ) : (
                    <span className="font-display text-xs font-bold" style={{ color: col }}>
                      {skill.name[0]}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-xs font-bold text-white">
                      {skill.name}
                    </span>
                    <span
                      className="rounded-full px-1.5 py-0.2 text-[9px] font-bold shadow"
                      style={{
                        backgroundColor: activeLinksCount > 0 ? '#d9b25f22' : '#3a2e54',
                        color: activeLinksCount > 0 ? '#d9b25f' : '#b3a9cc',
                        border: `1px solid ${activeLinksCount > 0 ? '#d9b25f66' : '#3a2e54'}`,
                      }}
                    >
                      {activeLinksCount}/6 linków
                    </span>
                  </div>

                  {/* Connected link icons */}
                  <div className="mt-1 flex items-center gap-1 overflow-hidden">
                    {connectedLinks.length === 0 ? (
                      <span className="text-[10px] text-mist/40 italic">Brak linków</span>
                    ) : (
                      connectedLinks.map((cl, i) => {
                        const linkCol = ELEMENTS[cl.link.color]?.hex || '#d9b25f'
                        const linkSources = iconSources('links', cl.link)
                        return (
                          <div
                            key={i}
                            title={`${cl.link.name} (${cl.link.stat})`}
                            className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full overflow-hidden"
                            style={{
                              border: `1px solid ${linkCol}`,
                              backgroundColor: `${linkCol}22`,
                            }}
                          >
                            {linkSources.length > 0 ? (
                              <img
                                src={linkSources[0]}
                                alt={cl.link.name}
                                referrerPolicy="no-referrer"
                                className="h-full w-full object-contain p-0.5"
                              />
                            ) : (
                              <span className="text-[8px] font-bold" style={{ color: linkCol }}>
                                {cl.link.name[0]}
                              </span>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
