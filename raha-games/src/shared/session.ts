export const PUZZLES_PER_SESSION = 4
export const MIN_TARGET = 1
export const MAX_TARGET = 5

export const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[32, 50], [68, 50]],
  3: [[50, 33], [28, 63], [72, 63]],
  4: [[30, 33], [70, 33], [30, 67], [70, 67]],
  5: [[50, 28], [26, 48], [74, 48], [33, 70], [67, 70]],
}

export function randomTarget() {
  return Math.floor(Math.random() * (MAX_TARGET - MIN_TARGET + 1)) + MIN_TARGET
}

export function shuffle<T>(items: T[]) {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export function distractors(target: number) {
  const options = new Set<number>([target])
  while (options.size < 4) {
    options.add(randomTarget())
  }
  return shuffle([...options])
}
