import { motion } from 'framer-motion'
import { colors, fonts, spacing } from '../shared/tokens'
import type { CardState } from '../shared/types'
import { DOT_POSITIONS } from '../shared/session'

interface Props {
  value: number
  state?: CardState
  showDots?: boolean
  disabled?: boolean
  onClick: () => void
}

const backgrounds: Record<CardState, string> = {
  default: 'linear-gradient(180deg, #FFFBF4 0%, #FFF3DD 100%)',
  correct: colors.correctGlow,
  hint: colors.hintWarm,
}

const borderColors: Record<CardState, string> = {
  default: '#C4A47C',
  correct: '#5A9E6F',
  hint: '#C9A840',
}

export default function NumberCard({ value, state = 'default', showDots = value >= 1 && value <= 5, disabled = false, onClick }: Props) {
  const positions = DOT_POSITIONS[value] ?? []

  return (
    <motion.button
      type="button"
      whileTap={disabled ? {} : { scale: 0.95 }}
      animate={state === 'hint' ? { rotate: [0, -3, 3, 0] } : state === 'correct' ? { scale: [1, 1.08, 1] } : { scale: 1, rotate: 0 }}
      transition={{ duration: 0.3 }}
      onClick={disabled ? undefined : onClick}
      style={{
        minWidth: spacing.touchTarget + 16,
        minHeight: spacing.touchTarget + 16,
        width: 112,
        height: 136,
        borderRadius: 24,
        border: `3px solid ${borderColors[state]}`,
        background: backgrounds[state],
        boxShadow: '0 8px 18px rgba(139,94,60,0.18)',
        color: colors.darkWarmBrown,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        fontFamily: fonts.number,
        fontWeight: 700,
        fontSize: 52,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        position: 'relative',
        overflow: 'hidden',
        padding: '12px 10px 14px',
      }}
      aria-label={String(value)}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(180deg, rgba(139,94,60,0.06) 0px, rgba(139,94,60,0.06) 2px, transparent 2px, transparent 11px)',
          opacity: 0.22,
        }}
      />
      {showDots ? (
        <div
          style={{
            position: 'relative',
            width: 66,
            height: 54,
            borderRadius: 18,
            background: 'rgba(255,255,255,0.76)',
            border: '2px solid rgba(139,94,60,0.12)',
          }}
        >
          {positions.map(([x, y], index) => (
            <div
              key={`${value}-${index}`}
              style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                width: value <= 3 ? 11 : 9,
                height: value <= 3 ? 11 : 9,
                borderRadius: '50%',
                background: colors.terracotta,
                boxShadow: 'inset -1px -2px 0 rgba(0,0,0,0.08)',
              }}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            position: 'relative',
            width: 66,
            height: 54,
            borderRadius: 18,
            background: 'rgba(255,255,255,0.56)',
            border: '2px solid rgba(139,94,60,0.08)',
          }}
        />
      )}
      <span style={{ position: 'relative', lineHeight: 1 }}>{value}</span>
    </motion.button>
  )
}
