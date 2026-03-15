import { describe, expect, it } from 'vitest'
import { distractors, DOT_POSITIONS, MAX_TARGET, MIN_TARGET } from './session'

describe('session helpers', () => {
  it('always returns four choices with the target included once', () => {
    const target = 3
    const choices = distractors(target)
    expect(choices).toHaveLength(4)
    expect(choices.filter((value) => value === target)).toHaveLength(1)
  })

  it('only returns choices in the subitizing range', () => {
    const choices = distractors(4)
    expect(choices.every((value) => value >= MIN_TARGET && value <= MAX_TARGET)).toBe(true)
  })

  it('uses canonical fixed dot layouts for 1 through 5', () => {
    expect(Object.keys(DOT_POSITIONS)).toEqual(['1', '2', '3', '4', '5'])
    expect(DOT_POSITIONS[4]).toEqual([
      [30, 33],
      [70, 33],
      [30, 67],
      [70, 67],
    ])
  })
})
