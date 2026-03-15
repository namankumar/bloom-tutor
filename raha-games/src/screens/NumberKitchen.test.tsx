import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import NumberKitchen from './NumberKitchen'

const timeoutCallbacks = new Map<number, () => void>()
let timerId = 0

vi.mock('../shared/audio', () => ({
  initAudio: vi.fn(),
  primeAudio: vi.fn(() => Promise.resolve()),
  playCue: vi.fn(),
  speak: vi.fn(),
  stopAllAudio: vi.fn(),
  getAudioState: () => ({ speechSupported: true, toneSupported: true, initialized: true, mode: 'full' }),
}))

vi.mock('../shared/session', () => ({
  PUZZLES_PER_SESSION: 4,
  MIN_TARGET: 1,
  MAX_TARGET: 5,
  randomTarget: vi.fn(() => 3),
  distractors: vi.fn(() => [3, 1, 4, 5]),
  shuffle: vi.fn((items: number[]) => items),
  DOT_POSITIONS: {
    1: [[50, 50]],
    2: [[32, 50], [68, 50]],
    3: [[50, 33], [28, 63], [72, 63]],
    4: [[30, 33], [70, 33], [30, 67], [70, 67]],
    5: [[50, 28], [26, 48], [74, 48], [33, 70], [67, 70]],
  },
}))

beforeEach(() => {
  timeoutCallbacks.clear()
  timerId = 0
  window.localStorage.clear()
  vi.stubGlobal(
    'setTimeout',
    vi.fn((callback: TimerHandler) => {
      timerId += 1
      timeoutCallbacks.set(timerId, callback as () => void)
      return timerId
    }),
  )
  vi.stubGlobal(
    'clearTimeout',
    vi.fn((id: number) => {
      timeoutCallbacks.delete(id)
    }),
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

async function flushAllTimers() {
  act(() => {
    while (timeoutCallbacks.size > 0) {
      for (const [id, callback] of [...timeoutCallbacks]) {
        timeoutCallbacks.delete(id)
        callback()
      }
    }
  })
  await act(async () => {
    await Promise.resolve()
  })
}

describe('NumberKitchen', () => {
  it('shows four answer cards alongside the visible plate', () => {
    render(
      <MemoryRouter>
        <NumberKitchen />
      </MemoryRouter>,
    )

    const choiceButtons = screen
      .getAllByRole('button')
      .filter((button) => ['1', '3', '4', '5'].includes(button.getAttribute('aria-label') ?? ''))
    expect(choiceButtons).toHaveLength(4)
    expect(screen.getByText('Tap the card that looks the same.')).toBeInTheDocument()
  })

  it('wrong answer does not end the session', async () => {
    render(
      <MemoryRouter>
        <NumberKitchen />
      </MemoryRouter>,
    )

    const wrongButtons = screen.getAllByRole('button', { name: '1' })
    fireEvent.click(wrongButtons[wrongButtons.length - 1])
    await flushAllTimers()

    expect(screen.queryByText('Great cooking today!')).not.toBeInTheDocument()
  })

  it('correct answers keep the session moving to the next puzzle', async () => {
    render(
      <MemoryRouter>
        <NumberKitchen />
      </MemoryRouter>,
    )

    const correctButtons = screen.getAllByRole('button', { name: '3' })
    fireEvent.click(correctButtons[correctButtons.length - 1])
    await flushAllTimers()

    expect(screen.getByText('Tap the card that looks the same.')).toBeInTheDocument()
    expect(screen.getByLabelText('Session progress')).toBeInTheDocument()
    expect(screen.queryByText('Great cooking today!')).not.toBeInTheDocument()
  })

  it('loads the current saved stage automatically', () => {
    window.localStorage.setItem(
      'raha-games-progress',
      JSON.stringify({
        currentStage: 2,
        stages: {
          1: { sessionsCompleted: 3, correctAnswers: 12, totalAnswers: 12, masteryReached: true },
          2: { sessionsCompleted: 0, correctAnswers: 0, totalAnswers: 0, masteryReached: false },
          3: { sessionsCompleted: 0, correctAnswers: 0, totalAnswers: 0, masteryReached: false },
          4: { sessionsCompleted: 0, correctAnswers: 0, totalAnswers: 0, masteryReached: false },
          5: { sessionsCompleted: 0, correctAnswers: 0, totalAnswers: 0, masteryReached: false },
          6: { sessionsCompleted: 0, correctAnswers: 0, totalAnswers: 0, masteryReached: false },
          7: { sessionsCompleted: 0, correctAnswers: 0, totalAnswers: 0, masteryReached: false },
          8: { sessionsCompleted: 0, correctAnswers: 0, totalAnswers: 0, masteryReached: false },
        },
      }),
    )

    render(
      <MemoryRouter>
        <NumberKitchen />
      </MemoryRouter>,
    )

    expect(screen.getAllByText('Counting Bowl').length).toBeGreaterThan(0)
    expect(screen.getByText('Count the fruit in the bowl.')).toBeInTheDocument()
  })
})
