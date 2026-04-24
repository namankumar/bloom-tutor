import { distractors, MAX_TARGET, MIN_TARGET, shuffle } from './session'
import type { StageNum, StagePuzzle } from './types'

export const STAGE_NAMES: Record<StageNum, string> = {
  1: 'Dot Plates',
  2: 'Counting Bowl',
  3: 'Ten Frames',
  4: 'Number Bonds',
  5: 'Adding Bowls',
  6: 'Tens and Ones',
  7: 'Skip Counting',
  8: 'Dinner Groups',
}

export interface StageContent {
  title: string
  stageName: string
  prompt: string
  speechPrompt: string
  correctText: string
  retryText: string
  renderNumberDots: boolean
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function boundedChoices(target: number, min: number, max: number) {
  const options = new Set<number>([target])
  let radius = 1

  while (options.size < 4) {
    if (target - radius >= min) options.add(target - radius)
    if (options.size < 4 && target + radius <= max) options.add(target + radius)
    radius += 1

    if (radius > max - min + 2) {
      options.add(randomBetween(min, max))
    }
  }

  return shuffle([...options].slice(0, 4))
}

export interface StageLessonBeat {
  examplePuzzle: StagePuzzle
  label: string
  revealAnswer?: number
  tryIt?: { wrongChoice: number }
}

export interface StageLesson {
  beats: StageLessonBeat[]
}

export const STAGE_LESSONS: Partial<Record<StageNum, StageLesson>> = {
  3: {
    beats: [
      {
        examplePuzzle: { kind: 'tenframe', filled: 7, ask: 'filled', target: 7, choices: [] },
        label: 'This frame always has ten spots. Let me count the eggs. One, two, three, four, five, six, seven. There are seven eggs.',
        revealAnswer: 7,
      },
      {
        examplePuzzle: { kind: 'tenframe', filled: 7, ask: 'empty', target: 3, choices: [] },
        label: 'Now look at the empty spots. One, two, three. There are three empty spots.',
        revealAnswer: 3,
      },
      {
        examplePuzzle: { kind: 'tenframe', filled: 4, ask: 'filled', target: 4, choices: [] },
        label: 'Let me try another one. One, two, three, four. There are four eggs.',
        revealAnswer: 4,
      },
      {
        examplePuzzle: { kind: 'tenframe', filled: 6, ask: 'filled', target: 6, choices: [] },
        label: 'Now you try. Count the eggs in this frame.',
        tryIt: { wrongChoice: 4 },
      },
    ],
  },
  4: {
    beats: [
      {
        examplePuzzle: { kind: 'numberBond', whole: 7, part: 4, target: 3, choices: [] },
        label: 'The big bowl holds seven. It splits into two smaller bowls. Four goes in one. Three goes in the other.',
        revealAnswer: 3,
      },
      {
        examplePuzzle: { kind: 'numberBond', whole: 8, part: 5, target: 3, choices: [] },
        label: 'The big bowl holds eight. One small bowl has five. I take eight away five. Eight, seven, six, five. That leaves three. The missing part is three.',
        revealAnswer: 3,
      },
      {
        examplePuzzle: { kind: 'numberBond', whole: 9, part: 4, target: 5, choices: [] },
        label: 'Big bowl is nine. One part is four. Nine take away four leaves five.',
        revealAnswer: 5,
      },
      {
        examplePuzzle: { kind: 'numberBond', whole: 6, part: 2, target: 4, choices: [] },
        label: 'Now you try. The big bowl is six. One part is two. Find the missing part.',
        tryIt: { wrongChoice: 3 },
      },
    ],
  },
  5: {
    beats: [
      {
        examplePuzzle: { kind: 'addition', left: 3, right: 4, target: 7, choices: [] },
        label: 'I see two bowls. The left bowl has three. The right bowl has four. I count on from three. Four, five, six, seven. All together there are seven.',
        revealAnswer: 7,
      },
      {
        examplePuzzle: { kind: 'addition', left: 2, right: 5, target: 7, choices: [] },
        label: 'Left bowl has two. Right bowl has five. I count on from two. Three, four, five, six, seven. Seven altogether.',
        revealAnswer: 7,
      },
      {
        examplePuzzle: { kind: 'addition', left: 4, right: 3, target: 7, choices: [] },
        label: 'Now you try. Count each bowl, then put them together.',
        tryIt: { wrongChoice: 6 },
      },
    ],
  },
  6: {
    beats: [
      {
        examplePuzzle: { kind: 'placeValue', tens: 1, ones: 0, target: 10, choices: [] },
        label: 'This carton holds exactly ten eggs. Always ten. Never more, never less.',
        revealAnswer: 10,
      },
      {
        examplePuzzle: { kind: 'placeValue', tens: 2, ones: 0, target: 20, choices: [] },
        label: 'Two cartons. I count by tens. Ten, twenty. Two cartons makes twenty eggs.',
        revealAnswer: 20,
      },
      {
        examplePuzzle: { kind: 'placeValue', tens: 2, ones: 3, target: 23, choices: [] },
        label: 'Two cartons and three loose eggs. Two cartons: ten, twenty. Then three loose: twenty-one, twenty-two, twenty-three. The answer is twenty-three.',
        revealAnswer: 23,
      },
      {
        examplePuzzle: { kind: 'placeValue', tens: 1, ones: 5, target: 15, choices: [] },
        label: 'Now you try. Count the cartons by tens, then add the loose eggs.',
        tryIt: { wrongChoice: 14 },
      },
    ],
  },
  7: {
    beats: [
      {
        examplePuzzle: { kind: 'skipCounting', step: 2, groups: 3, target: 6, choices: [] },
        label: 'Each group has two things. I skip count by twos. Two, four, six. Three groups of two makes six.',
        revealAnswer: 6,
      },
      {
        examplePuzzle: { kind: 'skipCounting', step: 5, groups: 3, target: 15, choices: [] },
        label: 'Each group has five things. I skip count by fives. Five, ten, fifteen. Three groups of five makes fifteen.',
        revealAnswer: 15,
      },
      {
        examplePuzzle: { kind: 'skipCounting', step: 10, groups: 3, target: 30, choices: [] },
        label: 'Each group has ten things. Ten, twenty, thirty. The answer is thirty.',
        revealAnswer: 30,
      },
      {
        examplePuzzle: { kind: 'skipCounting', step: 2, groups: 4, target: 8, choices: [] },
        label: 'Now you try. Each group has two. Skip count with the groups.',
        tryIt: { wrongChoice: 6 },
      },
    ],
  },
  8: {
    beats: [
      {
        examplePuzzle: { kind: 'multiplication', groups: 3, each: 4, target: 12, choices: [] },
        label: 'Three plates. Each plate has four things. I skip count by fours. Four, eight, twelve. Three plates of four makes twelve.',
        revealAnswer: 12,
      },
      {
        examplePuzzle: { kind: 'multiplication', groups: 2, each: 5, target: 10, choices: [] },
        label: 'Two plates. Each plate has five things. Five, ten. Two plates of five makes ten.',
        revealAnswer: 10,
      },
      {
        examplePuzzle: { kind: 'multiplication', groups: 4, each: 2, target: 8, choices: [] },
        label: 'Four plates. Each plate has two things. Two, four, six, eight. Four plates of two makes eight.',
        revealAnswer: 8,
      },
      {
        examplePuzzle: { kind: 'multiplication', groups: 3, each: 3, target: 9, choices: [] },
        label: 'Now you try. Count the plates, then skip count what is on each plate.',
        tryIt: { wrongChoice: 6 },
      },
    ],
  },
}

export function buildStagePuzzle(stage: StageNum): StagePuzzle {
  switch (stage) {
    case 1: {
      const target = randomBetween(MIN_TARGET, MAX_TARGET)
      return { kind: 'subitizing', target, choices: distractors(target) }
    }
    case 2: {
      const target = randomBetween(4, 10)
      return {
        kind: 'counting',
        target,
        choices: boundedChoices(target, 1, 12),
        item: Math.random() > 0.5 ? 'tomato' : 'strawberry',
      }
    }
    case 3: {
      const filled = randomBetween(4, 10)
      const ask = Math.random() > 0.5 ? 'filled' : 'empty'
      const target = ask === 'filled' ? filled : 10 - filled
      return {
        kind: 'tenframe',
        filled,
        ask,
        target,
        choices: boundedChoices(target, 0, 10),
      }
    }
    case 4: {
      const whole = randomBetween(5, 10)
      const part = randomBetween(1, whole - 1)
      const target = whole - part
      return {
        kind: 'numberBond',
        whole,
        part,
        target,
        choices: boundedChoices(target, 0, 10),
      }
    }
    case 5: {
      const left = randomBetween(2, 9)
      const right = randomBetween(1, 9)
      const target = left + right
      return {
        kind: 'addition',
        left,
        right,
        target,
        choices: boundedChoices(target, 1, 20),
      }
    }
    case 6: {
      const tens = randomBetween(1, 5)
      const ones = randomBetween(0, 9)
      const target = tens * 10 + ones
      return {
        kind: 'placeValue',
        tens,
        ones,
        target,
        choices: boundedChoices(target, 10, 59),
      }
    }
    case 7: {
      const step = [2, 5, 10][randomBetween(0, 2)] as 2 | 5 | 10
      const groups = step === 10 ? randomBetween(2, 6) : randomBetween(3, 5)
      const target = step * groups
      return {
        kind: 'skipCounting',
        step,
        groups,
        target,
        choices: boundedChoices(target, step, 60),
      }
    }
    case 8:
    default: {
      const groups = randomBetween(2, 4)
      const each = randomBetween(2, 5)
      const target = groups * each
      return {
        kind: 'multiplication',
        groups,
        each,
        target,
        choices: boundedChoices(target, 2, 20),
      }
    }
  }
}

export function getStageContent(stage: StageNum, puzzle: StagePuzzle): StageContent {
  switch (stage) {
    case 1:
      return {
        title: 'Tap the card that looks the same.',
        stageName: STAGE_NAMES[stage],
        prompt: "Let's find the card with the same dots.",
        speechPrompt: "Let's find the card with the same dots.",
        correctText: 'Yes. You found the match.',
        retryText: "That's okay. Look for the same dots.",
        renderNumberDots: true,
      }
    case 2:
      return {
        title: 'Count the fruit in the bowl.',
        stageName: STAGE_NAMES[stage],
        prompt: 'Count the fruit and find the number.',
        speechPrompt: 'Count the fruit in the bowl, then find the number.',
        correctText: 'Yes. That number matches the bowl.',
        retryText: 'Count the fruit again. Then choose the number.',
        renderNumberDots: false,
      }
    case 3:
      return {
        title: puzzle.kind === 'tenframe' && puzzle.ask === 'empty' ? 'How many spaces are empty?' : 'How many eggs are in the frame?',
        stageName: STAGE_NAMES[stage],
        prompt: puzzle.kind === 'tenframe' && puzzle.ask === 'empty' ? 'Look at the frame. How many spots are empty?' : 'Look at the frame. How many eggs are there?',
        speechPrompt: puzzle.kind === 'tenframe' && puzzle.ask === 'empty' ? 'Look at the frame. How many spots are empty?' : 'Look at the frame. How many eggs are there?',
        correctText: 'Yes. You saw the frame clearly.',
        retryText: 'Look at the frame again.',
        renderNumberDots: false,
      }
    case 4:
      return {
        title: 'How many more make the whole bowl?',
        stageName: STAGE_NAMES[stage],
        prompt: 'See the whole and the part. Find the missing part.',
        speechPrompt: 'See the whole and the part. Find the missing part.',
        correctText: 'Yes. The parts make the whole.',
        retryText: 'Look at the whole bowl and the small bowl again.',
        renderNumberDots: false,
      }
    case 5:
      return {
        title: 'How many are there altogether?',
        stageName: STAGE_NAMES[stage],
        prompt: 'Put both bowls together in your mind. How many are there?',
        speechPrompt: 'How many are there altogether?',
        correctText: 'Yes. You added both bowls.',
        retryText: 'Look at both bowls again.',
        renderNumberDots: false,
      }
    case 6:
      return {
        title: 'How many eggs are made by these tens and ones?',
        stageName: STAGE_NAMES[stage],
        prompt: 'Count the cartons and the loose eggs. Then find the number.',
        speechPrompt: 'Count the cartons and the loose eggs. Then find the number.',
        correctText: 'Yes. The bundles and ones match that number.',
        retryText: 'Look at the cartons and the loose eggs again.',
        renderNumberDots: false,
      }
    case 7:
      return {
        title: 'What number do we reach by skip counting?',
        stageName: STAGE_NAMES[stage],
        prompt: puzzle.kind === 'skipCounting' ? `Count by ${puzzle.step}s with the groups.` : 'Skip count with the groups.',
        speechPrompt: puzzle.kind === 'skipCounting' ? `Count by ${puzzle.step}s with the groups.` : 'Skip count with the groups.',
        correctText: 'Yes. You heard the pattern.',
        retryText: 'Count the groups again with the same step.',
        renderNumberDots: false,
      }
    case 8:
    default:
      return {
        title: 'How many are in all the dinner groups?',
        stageName: STAGE_NAMES[stage],
        prompt: 'Look at the plates. How many are there altogether?',
        speechPrompt: 'Look at the plates. How many are there altogether?',
        correctText: 'Yes. Those groups make that total.',
        retryText: 'Look at each plate and count the groups again.',
        renderNumberDots: false,
      }
  }
}
