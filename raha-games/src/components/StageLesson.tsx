import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import KitchenScene from './KitchenScene'
import ChefKiki from './ChefKiki'
import StageBoard from './StageBoard'
import NumberCard from './NumberCard'
import { cancelSpeech, playCue, primeAudio, speakAsync } from '../shared/audio'
import { colors, fonts, spacing } from '../shared/tokens'
import { shuffle } from '../shared/session'
import type { StageLesson } from '../shared/stages'
import type { CardState, KikiExpression } from '../shared/types'

interface Props {
  lesson: StageLesson
  onDone: () => void
}

export default function StageLessonComponent({ lesson, onDone }: Props) {
  const [beatIndex, setBeatIndex] = useState(0)
  const [canAdvance, setCanAdvance] = useState(false)
  const [tryCardStates, setTryCardStates] = useState<Record<number, CardState>>({})
  const [expression, setExpression] = useState<KikiExpression>('encouraging')

  const beat = lesson.beats[beatIndex]
  const isLast = beatIndex === lesson.beats.length - 1
  const isTryIt = !!beat.tryIt

  const tryChoices = useMemo(
    () => (beat.tryIt ? shuffle([beat.examplePuzzle.target, beat.tryIt.wrongChoice]) : []),
    [beatIndex],
  )

  useEffect(() => {
    void primeAudio()
    setCanAdvance(false)
    setTryCardStates({})
    setExpression('encouraging')
    cancelSpeech()
    let cancelled = false
    speakAsync(beat.label, { interrupt: true }).then(() => {
      if (!cancelled && !isTryIt) setCanAdvance(true)
    })
    return () => {
      cancelled = true
      cancelSpeech()
    }
  }, [beatIndex])

  function advance() {
    if (!canAdvance) return
    if (isLast) {
      onDone()
    } else {
      setBeatIndex((i) => i + 1)
    }
  }

  function handleTryChoice(value: number) {
    const correct = value === beat.examplePuzzle.target
    if (correct) {
      setTryCardStates({ [value]: 'correct' })
      setExpression('correct')
      playCue('feedback.correct')
      setTimeout(() => {
        if (isLast) {
          onDone()
        } else {
          setBeatIndex((i) => i + 1)
        }
      }, 1400)
    } else {
      setTryCardStates({ [value]: 'hint' })
      playCue('feedback.retry', { intensity: 'low' })
      setTimeout(() => setTryCardStates({}), 1100)
    }
  }

  return (
    <KitchenScene>
      <ChefKiki expression={expression} />

      <div
        style={{
          position: 'absolute',
          top: 18,
          right: 22,
          fontFamily: fonts.body,
          fontWeight: 700,
          fontSize: 15,
          color: colors.warmBrown,
          opacity: 0.6,
        }}
      >
        {beatIndex + 1} / {lesson.beats.length}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          width: 'min(92vw, 920px)',
        }}
      >
        <StageBoard puzzle={beat.examplePuzzle} />

        {beat.revealAnswer !== undefined && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.35 }}
            style={{
              background: colors.correctGlow,
              border: '3px solid #5A9E6F',
              borderRadius: 20,
              padding: '10px 32px',
              fontFamily: fonts.number,
              fontWeight: 700,
              fontSize: 52,
              color: colors.darkWarmBrown,
            }}
          >
            {beat.revealAnswer}
          </motion.div>
        )}

        <div
          style={{
            fontFamily: fonts.body,
            fontWeight: 700,
            fontSize: 20,
            color: colors.darkWarmBrown,
            textAlign: 'center',
            maxWidth: 520,
            lineHeight: 1.5,
            background: 'rgba(255,250,242,0.92)',
            border: `2px solid ${colors.softShadow}`,
            borderRadius: 18,
            padding: '14px 24px',
          }}
        >
          {beat.label}
        </div>

        {isTryIt && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(112px, 132px))',
              gap: 18,
              justifyContent: 'center',
            }}
          >
            {tryChoices.map((value) => (
              <NumberCard
                key={value}
                value={value}
                state={tryCardStates[value] ?? 'default'}
                onClick={() => handleTryChoice(value)}
              />
            ))}
          </motion.div>
        )}

        {!isTryIt && (
          <motion.button
            type="button"
            whileTap={canAdvance ? { scale: 0.96 } : {}}
            onClick={advance}
            disabled={!canAdvance}
            style={{
              minWidth: 160,
              minHeight: spacing.touchTarget,
              borderRadius: 22,
              border: `3px solid ${canAdvance ? colors.warmBrown : colors.softShadow}`,
              background: canAdvance ? colors.goldenYellow : 'rgba(255,250,242,0.6)',
              boxShadow: canAdvance ? '0 8px 18px rgba(139,94,60,0.18)' : 'none',
              color: canAdvance ? colors.darkWarmBrown : colors.warmBrown,
              fontFamily: fonts.body,
              fontSize: 20,
              fontWeight: 800,
              cursor: canAdvance ? 'pointer' : 'default',
              opacity: canAdvance ? 1 : 0.55,
              transition: 'opacity 0.3s, background 0.3s, border-color 0.3s',
            }}
          >
            {isLast ? "Let's go!" : 'Next →'}
          </motion.button>
        )}
      </div>
    </KitchenScene>
  )
}
