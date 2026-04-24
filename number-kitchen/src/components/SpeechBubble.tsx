import { AnimatePresence, motion } from 'framer-motion'
import type { KikiExpression } from '../shared/types'
import { colors, fonts } from '../shared/tokens'

interface Props {
  text: string
  expression?: KikiExpression
}

const bubbleTone: Record<KikiExpression, { accent: string; badge: string; badgeLabel: string; glow: string }> = {
  encouraging: {
    accent: colors.softBlue,
    badge: 'o',
    badgeLabel: 'Let us try',
    glow: 'rgba(127,179,200,0.24)',
  },
  correct: {
    accent: colors.correctGlow,
    badge: 'yes',
    badgeLabel: 'That is right',
    glow: 'rgba(168,213,162,0.3)',
  },
  hint: {
    accent: colors.hintWarm,
    badge: 'look',
    badgeLabel: 'Try again gently',
    glow: 'rgba(247,226,176,0.34)',
  },
  sessionEnd: {
    accent: colors.peach,
    badge: 'home',
    badgeLabel: 'All done',
    glow: 'rgba(232,180,160,0.28)',
  },
}

export default function SpeechBubble({ text, expression = 'encouraging' }: Props) {
  const tone = bubbleTone[expression]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={text}
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'absolute',
          left: 'calc(2.5vw + min(22vw, 210px) + 16px)',
          bottom: 'calc(10vh + 110px)',
          maxWidth: 'min(32vw, 360px)',
          minWidth: 220,
          background: colors.warmWhite,
          border: `3px solid ${colors.softShadow}`,
          borderRadius: 22,
          borderBottomLeftRadius: 6,
          padding: '14px 18px 16px',
          boxShadow: '0 10px 28px rgba(139,94,60,0.12)',
          fontFamily: fonts.body,
          fontWeight: 700,
          fontSize: 26,
          lineHeight: 1.25,
          color: colors.warmBrown,
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 16,
            top: 14,
            width: 56,
            height: 56,
            borderRadius: 18,
            background: tone.accent,
            boxShadow: `0 0 0 10px ${tone.glow}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.darkWarmBrown,
            fontSize: expression === 'correct' ? 18 : expression === 'hint' ? 14 : 16,
            fontWeight: 800,
            letterSpacing: expression === 'hint' ? 0.4 : 0,
            textTransform: 'lowercase',
          }}
        >
          {tone.badge}
        </div>
        <div
          aria-label={tone.badgeLabel}
          style={{
            position: 'absolute',
            inset: '12px 12px auto auto',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: tone.accent,
            opacity: 0.9,
          }}
        />
        <div
          style={{
            paddingLeft: 70,
            minHeight: 56,
            display: 'flex',
            alignItems: 'center',
          }}
        >
        {text}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
