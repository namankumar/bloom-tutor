import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { playCue, primeAudio } from '../shared/audio'
import { loadProgress, resetProgress, setCurrentStage, STAGE_SEQUENCE } from '../shared/progress'
import { colors, fonts } from '../shared/tokens'

function PotIcon() {
  return (
    <svg viewBox="0 0 120 120" width="72" height="72" aria-hidden="true">
      <ellipse cx="60" cy="74" rx="38" ry="20" fill="#F0E8D8" stroke={colors.warmBrown} strokeWidth="5" />
      <rect x="28" y="52" width="64" height="26" rx="10" fill={colors.terracotta} stroke={colors.warmBrown} strokeWidth="5" />
      <path d="M39 49 C44 35 76 35 81 49" fill="none" stroke={colors.warmBrown} strokeWidth="5" strokeLinecap="round" />
      <path d="M47 41 C47 33 53 27 60 27 C67 27 73 33 73 41" fill="none" stroke={colors.goldenYellow} strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

export default function HomeScreen() {
  const navigate = useNavigate()
  const [showParentPanel, setShowParentPanel] = useState(false)
  const [progress, setProgress] = useState(() => loadProgress())

  async function start() {
    await primeAudio()
    playCue('ui.tap', { intensity: 'low' })
    navigate('/number-kitchen')
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at top right, rgba(242,184,75,0.25), transparent 30%), linear-gradient(180deg, #FFF9F0 0%, #FDF6E9 100%)',
        padding: '6vw',
      }}
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={start}
        style={{
          width: 'min(70vw, 360px)',
          minHeight: 248,
          borderRadius: 36,
          border: `4px solid ${colors.warmBrown}`,
          background: 'linear-gradient(180deg, #D97B57 0%, #D4704A 100%)',
          boxShadow: '0 18px 34px rgba(139,94,60,0.18)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 24,
          cursor: 'pointer',
          color: colors.warmWhite,
        }}
      >
        <PotIcon />
        <div
          style={{
            fontFamily: fonts.body,
            fontWeight: 700,
            fontSize: 28,
            lineHeight: 1.1,
          }}
        >
          Play Number Kitchen
        </div>
        <div
          style={{
            fontFamily: fonts.body,
            fontWeight: 700,
            fontSize: 18,
            lineHeight: 1.2,
            opacity: 0.94,
          }}
        >
          Tap to start
        </div>
      </motion.button>

      <button
        type="button"
        onClick={() => setShowParentPanel((value) => !value)}
        style={{
          position: 'absolute',
          right: 18,
          bottom: 18,
          minWidth: 88,
          minHeight: 52,
          borderRadius: 18,
          border: `2px solid ${colors.softShadow}`,
          background: 'rgba(255,250,242,0.88)',
          color: colors.warmBrown,
          fontFamily: fonts.body,
          fontSize: 16,
          fontWeight: 800,
          padding: '8px 14px',
          cursor: 'pointer',
        }}
      >
        Parent
      </button>

      {showParentPanel ? (
        <div
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            width: 'min(88vw, 360px)',
            borderRadius: 24,
            border: `3px solid ${colors.softShadow}`,
            background: 'rgba(255,250,242,0.97)',
            boxShadow: '0 18px 34px rgba(139,94,60,0.18)',
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ fontFamily: fonts.body, fontWeight: 800, fontSize: 22, color: colors.darkWarmBrown }}>Parent Panel</div>
          <div style={{ fontFamily: fonts.body, fontWeight: 700, fontSize: 16, color: colors.warmBrown }}>
            Current stage: {progress.currentStage}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(56px, 1fr))',
              gap: 10,
            }}
          >
            {STAGE_SEQUENCE.map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={() => {
                  const next = setCurrentStage(progress, stage)
                  setProgress(next)
                }}
                style={{
                  minHeight: 56,
                  borderRadius: 16,
                  border: `2px solid ${progress.currentStage === stage ? colors.warmBrown : colors.softShadow}`,
                  background: progress.currentStage === stage ? colors.goldenYellow : colors.warmWhite,
                  color: colors.darkWarmBrown,
                  fontFamily: fonts.number,
                  fontSize: 28,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {stage}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setProgress(resetProgress())}
            style={{
              minHeight: 52,
              borderRadius: 16,
              border: `2px solid ${colors.softShadow}`,
              background: colors.peach,
              color: colors.darkWarmBrown,
              fontFamily: fonts.body,
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Reset Progress
          </button>
        </div>
      ) : null}
    </div>
  )
}
