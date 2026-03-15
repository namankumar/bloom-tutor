import type { GameProgress, StageNum, StageProgress } from './types'

export const STAGE_SEQUENCE: StageNum[] = [1, 2, 3, 4, 5, 6, 7, 8]
export const HIGHEST_IMPLEMENTED_STAGE: StageNum = 8
export const FAST_TRACK_SESSIONS = 1
export const FAST_TRACK_ACCURACY = 0.9
export const STEADY_TRACK_SESSIONS = 2
export const STEADY_TRACK_ACCURACY = 0.8

const STORAGE_KEY = 'raha-games-progress'

function createStageProgress(): StageProgress {
  return {
    sessionsCompleted: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    masteryReached: false,
  }
}

export function createDefaultProgress(): GameProgress {
  return {
    currentStage: 1,
    stages: {
      1: createStageProgress(),
      2: createStageProgress(),
      3: createStageProgress(),
      4: createStageProgress(),
      5: createStageProgress(),
      6: createStageProgress(),
      7: createStageProgress(),
      8: createStageProgress(),
    },
    lastPlayedAt: null,
  }
}

function sanitizeStage(value: unknown): StageNum {
  return STAGE_SEQUENCE.includes(value as StageNum) ? (value as StageNum) : 1
}

export function loadProgress(): GameProgress {
  if (typeof window === 'undefined') {
    return createDefaultProgress()
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultProgress()
    const parsed = JSON.parse(raw) as Partial<GameProgress>
    const base = createDefaultProgress()

    for (const stage of STAGE_SEQUENCE) {
      const parsedStage = parsed.stages?.[stage]
      if (parsedStage) {
        base.stages[stage] = {
          sessionsCompleted: Number(parsedStage.sessionsCompleted) || 0,
          correctAnswers: Number(parsedStage.correctAnswers) || 0,
          totalAnswers: Number(parsedStage.totalAnswers) || 0,
          masteryReached: Boolean(parsedStage.masteryReached),
        }
      }
    }

    base.currentStage = sanitizeStage(parsed.currentStage)
    base.lastPlayedAt = typeof parsed.lastPlayedAt === 'string' ? parsed.lastPlayedAt : null
    base.currentStage = getPlayableStage(base.currentStage)
    return base
  } catch {
    return createDefaultProgress()
  }
}

export function saveProgress(progress: GameProgress) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function resetProgress() {
  const progress = createDefaultProgress()
  saveProgress(progress)
  return progress
}

export function getPlayableStage(stage: StageNum): StageNum {
  return stage > HIGHEST_IMPLEMENTED_STAGE ? HIGHEST_IMPLEMENTED_STAGE : stage
}

export function getNextStage(stage: StageNum): StageNum {
  const index = STAGE_SEQUENCE.indexOf(stage)
  if (index === -1 || index === STAGE_SEQUENCE.length - 1) return stage
  return STAGE_SEQUENCE[index + 1]
}

export function getStageAccuracy(stage: StageProgress) {
  if (stage.totalAnswers === 0) return 0
  return stage.correctAnswers / stage.totalAnswers
}

export function setCurrentStage(progress: GameProgress, stageNum: StageNum) {
  const next = {
    ...progress,
    currentStage: getPlayableStage(stageNum),
    lastPlayedAt: new Date().toISOString(),
  }
  saveProgress(next)
  return next
}

export function recordSessionResult(progress: GameProgress, stageNum: StageNum, result: { correctAnswers: number; totalAnswers: number }) {
  const nextProgress: GameProgress = {
    ...progress,
    stages: { ...progress.stages },
    lastPlayedAt: new Date().toISOString(),
  }

  const currentStage = {
    ...nextProgress.stages[stageNum],
  }

  currentStage.sessionsCompleted += 1
  currentStage.correctAnswers += result.correctAnswers
  currentStage.totalAnswers += result.totalAnswers

  const sessionAccuracy = result.totalAnswers === 0 ? 0 : result.correctAnswers / result.totalAnswers
  const accuracy = getStageAccuracy(currentStage)
  currentStage.masteryReached =
    sessionAccuracy >= FAST_TRACK_ACCURACY ||
    (currentStage.sessionsCompleted >= STEADY_TRACK_SESSIONS && accuracy >= STEADY_TRACK_ACCURACY)
  nextProgress.stages[stageNum] = currentStage

  if (currentStage.masteryReached) {
    nextProgress.currentStage = getPlayableStage(getNextStage(stageNum))
  } else {
    nextProgress.currentStage = getPlayableStage(stageNum)
  }

  return nextProgress
}
