export type KikiExpression = 'encouraging' | 'correct' | 'hint' | 'sessionEnd'

export type CardState = 'default' | 'correct' | 'hint'

export type StageNum = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export type CueId =
  | 'ui.tap'
  | 'ui.home'
  | 'prompt.replay'
  | 'feedback.correct'
  | 'feedback.retry'
  | 'feedback.complete'
  | 'feedback.unlock'
  | 'count.tick'
  | 'count.finish'

export type CueVariant = 0 | 1 | 2

export type SpeechPriority = 'low' | 'normal' | 'high'

export type AudioMode = 'full' | 'speech_only' | 'tones_only' | 'silent_visual'

export interface AudioCapabilities {
  speechSupported: boolean
  toneSupported: boolean
  initialized: boolean
}

export interface StageProgress {
  sessionsCompleted: number
  correctAnswers: number
  totalAnswers: number
  masteryReached: boolean
}

export interface GameProgress {
  currentStage: StageNum
  stages: Record<StageNum, StageProgress>
  lastPlayedAt: string | null
}

export interface SubitizingPuzzle {
  kind: 'subitizing'
  target: number
  choices: number[]
}

export interface CountingPuzzle {
  kind: 'counting'
  target: number
  choices: number[]
  item: 'tomato' | 'strawberry'
}

export interface TenFramePuzzle {
  kind: 'tenframe'
  filled: number
  ask: 'filled' | 'empty'
  target: number
  choices: number[]
}

export interface NumberBondPuzzle {
  kind: 'numberBond'
  whole: number
  part: number
  target: number
  choices: number[]
}

export interface AdditionPuzzle {
  kind: 'addition'
  left: number
  right: number
  target: number
  choices: number[]
}

export interface PlaceValuePuzzle {
  kind: 'placeValue'
  tens: number
  ones: number
  target: number
  choices: number[]
}

export interface SkipCountingPuzzle {
  kind: 'skipCounting'
  step: 2 | 5 | 10
  groups: number
  target: number
  choices: number[]
}

export interface MultiplicationPuzzle {
  kind: 'multiplication'
  groups: number
  each: number
  target: number
  choices: number[]
}

export type StagePuzzle =
  | SubitizingPuzzle
  | CountingPuzzle
  | TenFramePuzzle
  | NumberBondPuzzle
  | AdditionPuzzle
  | PlaceValuePuzzle
  | SkipCountingPuzzle
  | MultiplicationPuzzle

export interface SessionState {
  puzzlesDone: number
  currentTarget: number
  sessionComplete: boolean
}
