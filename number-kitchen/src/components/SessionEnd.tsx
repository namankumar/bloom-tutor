import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ChefKiki from './ChefKiki'
import { playCue, primeAudio, speak, stopAllAudio } from '../shared/audio'
import { colors, fonts } from '../shared/tokens'

interface Props {
  onGoHome?: () => void
  stageLabel?: string
}

export default function SessionEnd({ onGoHome, stageLabel }: Props) {
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    void primeAudio().then(() => {
      if (cancelled) return
      playCue('feedback.complete')
      window.setTimeout(() => {
        if (cancelled) return
        speak('Great cooking today. See you soon.', { priority: 'normal' })
      }, 260)
    })
    return () => {
      cancelled = true
      stopAllAudio()
    }
  }, [])

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        background: colors.cream,
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 1440 1024"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <rect width="1440" height="1024" fill={colors.cream} />
        <ellipse cx="720" cy="790" rx="310" ry="54" fill="#D2BB93" opacity="0.34" />
        <rect x="470" y="630" width="500" height="42" rx="18" fill="#C4A47C" />
        <rect x="510" y="668" width="30" height="120" rx="15" fill="#B89468" />
        <rect x="900" y="668" width="30" height="120" rx="15" fill="#B89468" />
        <ellipse cx="720" cy="580" rx="120" ry="38" fill="#F0E8D8" stroke="#C4A47C" strokeWidth="6" />
        <ellipse cx="720" cy="565" rx="94" ry="28" fill="#D4704A" opacity="0.95" />
      </svg>

      <motion.div
        animate={{ y: [0, -12, 0], opacity: [0.4, 0.9, 0.4] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        style={{ position: 'absolute', left: '48%', top: '47%', width: 14, height: 70, borderRadius: 999, background: 'linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0))', filter: 'blur(2px)' }}
      />
      <motion.div
        animate={{ y: [0, -16, 0], opacity: [0.35, 0.85, 0.35] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut', delay: 0.35 }}
        style={{ position: 'absolute', left: '51%', top: '46%', width: 16, height: 76, borderRadius: 999, background: 'linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0))', filter: 'blur(2px)' }}
      />

      <div style={{ position: 'absolute', left: '18%', bottom: '18%' }}>
        <ChefKiki expression="sessionEnd" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        style={{
          position: 'absolute',
          top: '22%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          fontFamily: fonts.body,
          fontWeight: 700,
          fontSize: 32,
          color: colors.darkWarmBrown,
        }}
      >
        Great cooking today!
      </motion.div>

      {stageLabel ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: fonts.body,
            fontWeight: 700,
            fontSize: 18,
            color: colors.warmBrown,
            opacity: 0.74,
          }}
        >
          {stageLabel}
        </motion.div>
      ) : null}

      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        onClick={async () => {
          await primeAudio()
          stopAllAudio()
          onGoHome?.()
          playCue('ui.home', { intensity: 'medium' })
          navigate('/')
        }}
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '10%',
          transform: 'translateX(-50%)',
          width: 84,
          height: 84,
          borderRadius: 22,
          border: `3px solid ${colors.warmBrown}`,
          background: colors.sageGreen,
          boxShadow: '0 10px 20px rgba(139,94,60,0.18)',
          cursor: 'pointer',
        }}
        aria-label="Go home"
      >
        <svg viewBox="0 0 100 100" width="46" height="46" aria-hidden="true">
          <path d="M20 48 L50 22 L80 48" fill="none" stroke={colors.warmWhite} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M28 45 V77 H72 V45" fill="none" stroke={colors.warmWhite} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="45" y="58" width="12" height="19" rx="5" fill={colors.warmWhite} />
        </svg>
      </motion.button>
    </div>
  )
}
