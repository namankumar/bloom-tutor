import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import KitchenScene from '../components/KitchenScene'
import ChefKiki from '../components/ChefKiki'
import SpeechBubble from '../components/SpeechBubble'
import DotPlate from '../components/DotPlate'
import NumberCard from '../components/NumberCard'
import SessionEnd from '../components/SessionEnd'
import StageBoard from '../components/StageBoard'
import StageLesson from '../components/StageLesson'
import { getAudioState, playCue, primeAudio, speak, stopAllAudio } from '../shared/audio'
import { getPlayableStage, loadProgress, recordSessionResult, saveProgress } from '../shared/progress'
import { colors, fonts } from '../shared/tokens'
import { PUZZLES_PER_SESSION } from '../shared/session'
import { buildStagePuzzle, getStageContent, STAGE_LESSONS } from '../shared/stages'
import type { CardState, GameProgress, KikiExpression, StageNum, StagePuzzle } from '../shared/types'

const CORRECT_ADVANCE_MS = 1800
const HINT_RESET_MS = 1100

export default function NumberKitchen() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState<GameProgress>(() => loadProgress())
  const currentStage = getPlayableStage(progress.currentStage)
  const [puzzlesDone, setPuzzlesDone] = useState(0)
  const [puzzle, setPuzzle] = useState<StagePuzzle>(() => buildStagePuzzle(currentStage))
  const [expression, setExpression] = useState<KikiExpression>('encouraging')
  const [speech, setSpeech] = useState('')
  const [cardState, setCardState] = useState<Record<number, CardState>>({})
  const [sessionComplete, setSessionComplete] = useState(false)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [inputLocked, setInputLocked] = useState(false)
  const inputLockedRef = useRef(false)
  const [showLesson, setShowLesson] = useState(() => {
    const p = loadProgress()
    const stage = getPlayableStage(p.currentStage)
    return stage >= 3 && !!STAGE_LESSONS[stage] && !p.stages[stage].masteryReached
  })
  const [wrongAnswers, setWrongAnswers] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [completedStage, setCompletedStage] = useState<StageNum>(1)
  const timersRef = useRef<number[]>([])
  const capabilities = useMemo(() => getAudioState(), [])
  const stageContent = useMemo(() => getStageContent(currentStage, puzzle), [currentStage, puzzle])

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []
  }

  const queueTimeout = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay)
    timersRef.current.push(timer)
  }

  const startPrompt = (withSpeech = false) => {
    setSpeech(stageContent.prompt)
    if (withSpeech) {
      speak(stageContent.speechPrompt, { priority: 'normal', interrupt: true })
    }
  }

  const lockInput = () => { inputLockedRef.current = true; setInputLocked(true) }
  const unlockInput = () => { inputLockedRef.current = false; setInputLocked(false) }

  const loadPuzzle = (stage: StageNum) => {
    clearTimers()
    stopAllAudio()
    setPuzzle(buildStagePuzzle(stage))
    setCardState({})
    setExpression('encouraging')
    unlockInput()
    setWrongAttempts(0)
    startPrompt(false)
  }

  function revealAndAdvance() {
    lockInput()
    setCardState({ [puzzle.target]: 'correct' })
    setExpression('hint')
    speak(`It was ${puzzle.target}.`, { priority: 'normal', interrupt: true })
    setSpeech(`It was ${puzzle.target}.`)
    queueTimeout(() => loadPuzzle(currentStage), CORRECT_ADVANCE_MS)
    // puzzlesDone NOT incremented — session extends until she earns the answer
  }

  useEffect(() => {
    void primeAudio()
    setSessionComplete(false)
    setPuzzlesDone(0)
    setWrongAnswers(0)
    setCorrectAnswers(0)
    setCompletedStage(currentStage)
    setPuzzle(buildStagePuzzle(currentStage))
  }, [currentStage])

  useEffect(() => {
    startPrompt(false)
    queueTimeout(() => {
      speak(stageContent.speechPrompt, { priority: 'normal' })
    }, 220)

    return () => {
      clearTimers()
      stopAllAudio()
    }
  }, [stageContent.prompt, stageContent.speechPrompt])

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  function repeatAfterHint() {
    setCardState({})
    setExpression('encouraging')
    setWrongAttempts(0)
    startPrompt(false)
  }

  async function playPrompt() {
    await primeAudio()
    playCue('prompt.replay', { intensity: 'low' })
    startPrompt(true)
  }

  function handleChoice(value: number) {
    if (inputLockedRef.current) return
    const target = puzzle.target
    const correct = value === target

    if (correct) {
      clearTimers()
      lockInput()
      setCardState({ [value]: 'correct' })
      setExpression('correct')
      setWrongAttempts(0)
      setCorrectAnswers((count) => count + 1)
      playCue('feedback.correct')
      setSpeech(stageContent.correctText)

      queueTimeout(() => {
        if (puzzlesDone + 1 >= PUZZLES_PER_SESSION) {
          stopAllAudio()
          setCompletedStage(currentStage)
          setSessionComplete(true)
          return
        }

        setPuzzlesDone((current) => current + 1)
        loadPuzzle(currentStage)
      }, CORRECT_ADVANCE_MS)
      return
    }

    clearTimers()
    lockInput()
    setCardState({ [value]: 'hint' })
    setExpression('hint')
    const nextWrongAttempts = wrongAttempts + 1
    setWrongAttempts(nextWrongAttempts)
    setWrongAnswers((count) => count + 1)
    playCue('feedback.retry', { intensity: 'low' })
    setSpeech(stageContent.retryText)

    if (nextWrongAttempts >= 2) {
      revealAndAdvance()
    } else {
      queueTimeout(() => {
        unlockInput()
        repeatAfterHint()
      }, HINT_RESET_MS)
    }
  }

  if (showLesson && STAGE_LESSONS[currentStage]) {
    return (
      <StageLesson
        lesson={STAGE_LESSONS[currentStage]!}
        onDone={() => setShowLesson(false)}
      />
    )
  }

  if (sessionComplete) {
    return (
      <SessionEnd
        stageLabel={getStageContent(completedStage, puzzle).stageName}
        onGoHome={() => {
          const nextProgress = recordSessionResult(progress, completedStage, {
            correctAnswers,
            totalAnswers: correctAnswers + wrongAnswers,
          })
          saveProgress(nextProgress)
          setProgress(nextProgress)
        }}
      />
    )
  }

  return (
    <KitchenScene>
      <ChefKiki expression={expression} />
      <SpeechBubble text={speech} expression={expression} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 22,
          width: 'min(92vw, 920px)',
        }}
      >
        <div
          style={{
            fontFamily: fonts.body,
            fontWeight: 800,
            fontSize: 24,
            color: colors.darkWarmBrown,
            textAlign: 'center',
          }}
        >
          {stageContent.title}
        </div>

        <div
          style={{
            marginTop: -6,
            fontFamily: fonts.body,
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: 0.4,
            color: colors.warmBrown,
            opacity: 0.72,
          }}
        >
          {stageContent.stageName}
        </div>

        {puzzle.kind === 'subitizing' ? <DotPlate count={puzzle.target} /> : <StageBoard puzzle={puzzle} />}

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
          {puzzle.choices.map((value) => (
            <NumberCard
              key={`${currentStage}-${puzzle.kind}-${puzzle.target}-${value}`}
              value={value}
              showDots={stageContent.renderNumberDots}
              state={cardState[value] ?? 'default'}
              disabled={inputLocked}
              onClick={() => handleChoice(value)}
            />
          ))}
        </motion.div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 18,
          right: 22,
          display: 'flex',
          gap: 8,
        }}
        aria-label="Session progress"
      >
        {Array.from({ length: PUZZLES_PER_SESSION }, (_, index) => (
          <div
            key={index}
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: index < puzzlesDone ? colors.correctGlow : colors.softShadow,
              border: `1px solid rgba(139,94,60,0.18)`,
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 18,
          left: 18,
          display: 'flex',
          gap: 10,
        }}
      >
        <button
          type="button"
          onClick={async () => {
            await primeAudio()
            stopAllAudio()
            playCue('ui.home', { intensity: 'medium' })
            navigate('/')
          }}
          style={{
            minWidth: 88,
            minHeight: 72,
            borderRadius: 22,
            border: `3px solid ${colors.warmBrown}`,
            background: 'rgba(255,250,242,0.94)',
            boxShadow: '0 8px 18px rgba(139,94,60,0.12)',
            color: colors.darkWarmBrown,
            fontFamily: fonts.body,
            fontSize: 20,
            fontWeight: 800,
            padding: '0 18px',
            cursor: 'pointer',
          }}
        >
          Home
        </button>

        <button
          type="button"
          onClick={playPrompt}
          style={{
            minWidth: 88,
            minHeight: 72,
            borderRadius: 22,
            border: `3px solid ${colors.warmBrown}`,
            background: colors.softBlue,
            boxShadow: '0 8px 18px rgba(139,94,60,0.12)',
            color: colors.warmWhite,
            fontFamily: fonts.body,
            fontSize: 18,
            fontWeight: 800,
            padding: '0 18px',
            cursor: 'pointer',
          }}
          aria-label="Hear the prompt again"
        >
          Say it
        </button>
      </div>

      {!capabilities.speechSupported && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            background: 'rgba(255,250,242,0.92)',
            border: `2px solid ${colors.softShadow}`,
            borderRadius: 14,
            padding: '8px 12px',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          Speech is off. Visual instructions stay on.
        </div>
      )}

      {capabilities.mode === 'tones_only' && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            background: 'rgba(255,250,242,0.92)',
            border: `2px solid ${colors.softShadow}`,
            borderRadius: 14,
            padding: '8px 12px',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          Sound cues are on. Spoken voice is off.
        </div>
      )}
    </KitchenScene>
  )
}
