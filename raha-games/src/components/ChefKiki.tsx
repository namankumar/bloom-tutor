import { motion } from 'framer-motion'
import type { KikiExpression } from '../shared/types'
import { colors } from '../shared/tokens'

interface Props {
  expression: KikiExpression
}

const browOffset: Record<KikiExpression, number> = {
  encouraging: -4,
  correct: -7,
  hint: 3,
  sessionEnd: -3,
}

const mouthPath: Record<KikiExpression, string> = {
  encouraging: 'M 40 77 C 48 86 62 86 70 77',
  correct: 'M 36 74 C 48 92 64 92 76 74',
  hint: 'M 44 78 C 53 71 61 71 68 78',
  sessionEnd: 'M 36 74 C 48 92 64 92 76 74',
}

const eyeScale: Record<KikiExpression, number> = {
  encouraging: 1,
  correct: 0.7,
  hint: 1,
  sessionEnd: 0.15,
}

export default function ChefKiki({ expression }: Props) {
  const isHint = expression === 'hint'

  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        left: '2.5vw',
        bottom: '10vh',
        width: 'min(22vw, 210px)',
        minWidth: 150,
      }}
    >
      <svg viewBox="0 0 130 245" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="65" cy="34" rx="35" ry="11" fill={colors.warmWhite} stroke={colors.warmBrown} strokeWidth="3" />
        <path
          d="M42 35 L42 18 C42 4 88 4 88 18 L88 35 C104 42 109 62 98 77 C90 87 75 91 65 89 C55 91 40 87 32 77 C21 62 26 42 42 35 Z"
          fill={colors.warmWhite}
          stroke={colors.warmBrown}
          strokeWidth="3"
        />

        <circle cx="65" cy="90" r="34" fill={colors.peach} stroke="#7A4A2E" strokeWidth="3" />
        <ellipse cx="41" cy="95" rx="8" ry="5" fill={colors.terracotta} opacity="0.22" />
        <ellipse cx="89" cy="95" rx="8" ry="5" fill={colors.terracotta} opacity="0.22" />

        <motion.g animate={{ y: browOffset[expression] }} transition={{ duration: 0.25 }}>
          <path d="M43 72 C49 68 54 68 60 72" stroke={colors.warmBrown} strokeWidth="4" strokeLinecap="round" />
          <path d="M70 72 C76 68 81 68 87 72" stroke={colors.warmBrown} strokeWidth="4" strokeLinecap="round" />
        </motion.g>

        <motion.g animate={{ scaleY: eyeScale[expression] }} style={{ originX: '51px', originY: '86px' }} transition={{ duration: 0.25 }}>
          <ellipse cx="51" cy="86" rx="7.5" ry="9" fill={colors.warmWhite} />
          <ellipse cx="51" cy="87" rx="4" ry="5.5" fill={colors.darkWarmBrown} />
          <circle cx="52.5" cy="85" r="1.2" fill={colors.warmWhite} />
        </motion.g>
        <motion.g animate={{ scaleY: eyeScale[expression] }} style={{ originX: '79px', originY: '86px' }} transition={{ duration: 0.25 }}>
          <ellipse cx="79" cy="86" rx="7.5" ry="9" fill={colors.warmWhite} />
          <ellipse cx="79" cy="87" rx="4" ry="5.5" fill={colors.darkWarmBrown} />
          <circle cx="80.5" cy="85" r="1.2" fill={colors.warmWhite} />
        </motion.g>

        <path d="M65 89 C61 94 61 100 65 103 C69 100 69 94 65 89 Z" fill="#D99E8A" stroke={colors.warmBrown} strokeWidth="2" />

        <motion.path
          d={mouthPath[expression]}
          animate={{ d: mouthPath[expression] }}
          transition={{ duration: 0.25 }}
          stroke={colors.warmBrown}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        <path d="M39 132 C47 121 83 121 91 132 L98 205 C84 214 46 214 32 205 Z" fill={colors.warmWhite} stroke={colors.warmBrown} strokeWidth="3" />
        <path d="M42 139 C51 133 79 133 88 139 L92 208 C79 214 51 214 38 208 Z" fill={colors.terracotta} opacity="0.88" />
        <line x1="51" y1="141" x2="51" y2="207" stroke={colors.warmWhite} strokeWidth="4" opacity="0.8" />
        <line x1="64" y1="138" x2="64" y2="210" stroke={colors.warmWhite} strokeWidth="4" opacity="0.8" />
        <line x1="77" y1="141" x2="77" y2="207" stroke={colors.warmWhite} strokeWidth="4" opacity="0.8" />
        <ellipse cx="65" cy="147" rx="8" ry="5" fill={colors.warmWhite} opacity="0.72" />

        <path d="M31 145 C17 151 14 170 21 181" stroke={colors.peach} strokeWidth="12" strokeLinecap="round" />
        <path d="M99 145 C113 151 116 170 109 181" stroke={colors.peach} strokeWidth="12" strokeLinecap="round" />
        <path d="M19 182 C23 190 27 191 33 188" stroke={colors.peach} strokeWidth="10" strokeLinecap="round" />
        <path d="M111 182 C107 190 103 191 97 188" stroke={colors.peach} strokeWidth="10" strokeLinecap="round" />

        <motion.g animate={isHint ? { rotate: [0, -4, 4, 0] } : { rotate: 0 }} transition={{ duration: 0.4 }}>
          <path d="M48 216 C52 229 58 235 65 235 C72 235 78 229 82 216" stroke={colors.warmBrown} strokeWidth="3" strokeLinecap="round" />
        </motion.g>
      </svg>
    </motion.div>
  )
}
