import { describe, expect, it } from 'vitest'
import { createDefaultProgress, FAST_TRACK_SESSIONS, getPlayableStage, HIGHEST_IMPLEMENTED_STAGE, recordSessionResult, setCurrentStage } from './progress'

describe('progress helpers', () => {
  it('starts on stage 1 by default', () => {
    const progress = createDefaultProgress()
    expect(progress.currentStage).toBe(1)
    expect(progress.stages[1].sessionsCompleted).toBe(0)
  })

  it('marks mastery after one clearly successful session', () => {
    let progress = createDefaultProgress()

    for (let i = 0; i < FAST_TRACK_SESSIONS; i += 1) {
      progress = recordSessionResult(progress, 1, { correctAnswers: 4, totalAnswers: 4 })
    }

    expect(progress.stages[1].masteryReached).toBe(true)
  })

  it('never advances beyond the highest implemented stage', () => {
    let progress = createDefaultProgress()

    progress = recordSessionResult(progress, 1, { correctAnswers: 4, totalAnswers: 4 })
    expect(progress.currentStage).toBe(2)
    expect(getPlayableStage(8)).toBe(HIGHEST_IMPLEMENTED_STAGE)
  })

  it('allows a parent override to set the current stage directly', () => {
    const progress = createDefaultProgress()
    expect(setCurrentStage(progress, 5).currentStage).toBe(5)
  })
})
