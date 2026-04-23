# Number Kitchen — Complete Build Spec

> Self-contained. Codex should need no other file to build this. Everything — stack, structure, design tokens, component specs, stage logic, content data, animations — is here.

---

## What This Is

A web-based math game for [Child] (age 5). She plays Chef Kiki's kitchen helper. Each session is 10-15 min, ends naturally when the meal is served, no "play again" button. Non-addictive by design — no streaks, no badges, no timers, no exploit loops.

7 stages map to a math curriculum: subitizing → counting → ten-frames → number bonds → addition → place value → multiplication. Each stage unlocks after mastery.

---

## Stack

```
Vite + React + TypeScript
@dnd-kit/core          — drag and drop (touch-friendly)
framer-motion          — animations
react-router-dom v6    — routing
```

No backend. No auth. No external APIs. Web Speech API for TTS (built into browser).

**Install:**
```bash
npm create vite@latest raha-games -- --template react-ts
cd raha-games
npm install @dnd-kit/core @dnd-kit/utilities framer-motion react-router-dom
```

---

## Project Structure

```
src/
├── main.tsx
├── App.tsx                      # BrowserRouter + routes
├── screens/
│   ├── HomeScreen.tsx           # 4 game tiles, audio labels, no text nav
│   └── NumberKitchen.tsx        # Kitchen shell + stage router
├── stages/
│   ├── Stage1_Subitizing.tsx
│   ├── Stage2_Counting.tsx
│   ├── Stage3_TenFrames.tsx
│   ├── Stage4_NumberBonds.tsx
│   ├── Stage5_Addition.tsx
│   ├── Stage6_PlaceValue.tsx
│   └── Stage7_Multiplication.tsx
├── components/
│   ├── KitchenScene.tsx         # Background SVG: counter, shelf, window
│   ├── ChefKiki.tsx             # SVG character, animated expressions
│   ├── SpeechBubble.tsx         # Appears beside Kiki with her prompt text
│   ├── TenFrame.tsx             # 2×5 grid component, reused in stages 3–5
│   ├── DotPlate.tsx             # Plate with N dots in pre-defined positions
│   ├── NumberCard.tsx           # Large tap target: shows numeral, min 80×80px
│   ├── FoodItem.tsx             # Draggable/tappable food SVG
│   ├── DropZone.tsx             # Bowl, cell, plate, column — accepts drops
│   ├── SessionEnd.tsx           # Meal served screen, warm close, home button
│   └── ParentView.tsx           # Hidden (3-tap unlock), read-only progress
├── shared/
│   ├── audio.ts                 # Web Speech API queue
│   ├── progress.ts              # localStorage read/write
│   ├── tokens.ts                # Design tokens (colors, fonts, spacing)
│   └── types.ts                 # All TypeScript types
└── assets/                      # SVGs for food items
```

---

## Design Tokens (`src/shared/tokens.ts`)

```typescript
export const colors = {
  // Base
  cream: '#FDF6E9',         // main background
  warmWhite: '#FFFAF2',     // card surfaces, drop zones
  softShadow: '#E8D5B0',    // borders, dividers

  // Primary
  terracotta: '#D4704A',    // primary buttons, Kiki's apron
  goldenYellow: '#F2B84B',  // correct-answer glow, highlights
  sageGreen: '#7BAE7F',     // counter surface, secondary elements
  dustyRose: '#D4918A',     // Kiki skin tone, warm accents

  // Supporting
  warmBrown: '#8B5E3C',     // all text (never pure black)
  softBlue: '#7FB3C8',      // ten-frame cells, TENS column
  mutedLavender: '#B8A9C9', // ONES column, soft separators

  // Feedback
  correctGlow: '#A8D5A2',   // soft green — correct answer
  hintWarm: '#F7E2B0',      // soft yellow — wrong answer, gentle hint
} as const

export const fonts = {
  number: "'Baloo 2', cursive",   // numbers, large display
  body: "'Nunito', sans-serif",   // Kiki speech, labels
} as const

export const fontSizes = {
  numberLarge: '80px',   // number cards
  numberMed: '48px',     // ten-frame counts
  speech: '28px',        // Kiki's speech bubble
  label: '20px',         // parent view labels
} as const

export const spacing = {
  touchTarget: '72px',   // minimum interactive element size
  cardPad: '16px',
  gap: '12px',
} as const
```

Add to `index.html` `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;700&family=Nunito:wght@400;600&display=swap" rel="stylesheet">
```

---

## Audio (`src/shared/audio.ts`)

```typescript
// Queued speech — prevents overlapping
let queue: string[] = []
let speaking = false

function processQueue() {
  if (speaking || queue.length === 0) return
  speaking = true
  const text = queue.shift()!
  const utter = new SpeechSynthesisUtterance(text)
  utter.rate = 0.82       // slow, clear, child-paced
  utter.pitch = 1.08      // slightly warm, not childish
  utter.volume = 0.95
  // prefer a warm female voice if available
  const voices = speechSynthesis.getVoices()
  const preferred = voices.find(v =>
    v.lang === 'en-US' && v.name.toLowerCase().includes('female')
  ) || voices.find(v => v.lang === 'en-US') || voices[0]
  if (preferred) utter.voice = preferred
  utter.onend = () => { speaking = false; processQueue() }
  utter.onerror = () => { speaking = false; processQueue() }
  speechSynthesis.speak(utter)
}

export function speak(text: string) {
  queue.push(text)
  processQueue()
}

export function cancelSpeech() {
  queue = []
  speechSynthesis.cancel()
  speaking = false
}

// Preload voices (browser quirk — must call early)
export function initAudio() {
  speechSynthesis.getVoices()
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices()
}
```

---

## Progress Tracker (`src/shared/progress.ts`)

```typescript
export type StageNum = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface StageProgress {
  sessionsCompleted: number
  correctThisSession: number
  totalThisSession: number
  masteryReached: boolean
}

export interface Progress {
  currentStage: StageNum
  stages: Record<StageNum, StageProgress>
  lastPlayed: string
}

const KEY = 'raha-number-kitchen'

const defaultStage = (): StageProgress => ({
  sessionsCompleted: 0,
  correctThisSession: 0,
  totalThisSession: 0,
  masteryReached: false,
})

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    currentStage: 1,
    stages: {1: defaultStage(), 2: defaultStage(), 3: defaultStage(),
             4: defaultStage(), 5: defaultStage(), 6: defaultStage(),
             7: defaultStage()},
    lastPlayed: new Date().toISOString(),
  }
}

export function saveProgress(p: Progress) {
  localStorage.setItem(KEY, JSON.stringify(p))
}

// Call after each puzzle answer
export function recordAnswer(p: Progress, correct: boolean): Progress {
  const stage = p.stages[p.currentStage]
  stage.totalThisSession++
  if (correct) stage.correctThisSession++
  return { ...p, stages: { ...p.stages, [p.currentStage]: stage } }
}

// Call at session end
export function endSession(p: Progress): Progress {
  const stage = p.stages[p.currentStage]
  stage.sessionsCompleted++
  const accuracy = stage.correctThisSession / Math.max(stage.totalThisSession, 1)
  // Mastery: 3 sessions completed with ≥ 75% accuracy
  if (stage.sessionsCompleted >= 3 && accuracy >= 0.75) {
    stage.masteryReached = true
  }
  // Reset per-session counters
  stage.correctThisSession = 0
  stage.totalThisSession = 0
  const nextStage = (stage.masteryReached && p.currentStage < 7)
    ? (p.currentStage + 1) as StageNum
    : p.currentStage
  return {
    ...p,
    currentStage: nextStage,
    lastPlayed: new Date().toISOString(),
    stages: { ...p.stages, [p.currentStage]: stage },
  }
}
```

---

## TypeScript Types (`src/shared/types.ts`)

```typescript
export type FoodType =
  | 'tomato' | 'apple' | 'strawberry' | 'egg'
  | 'carrot' | 'blueberry' | 'eggCarton'

export type KikiExpression = 'neutral' | 'encouraging' | 'correct' | 'hint' | 'sessionEnd'

export interface Puzzle {
  id: string
  stageNum: number
  target: number          // the number being worked with
  part?: number           // for number bonds: the known part
}

export interface DragItem {
  id: string
  type: FoodType
  index: number
}
```

---

## Chef Kiki (`src/components/ChefKiki.tsx`)

SVG character. Round head, small body, striped apron (terracotta + cream stripes). Big eyes with brows that animate. Curved mouth.

```tsx
import { motion } from 'framer-motion'
import type { KikiExpression } from '../shared/types'

interface Props {
  expression: KikiExpression
}

// Eye brow Y offsets per expression
const browOffsets: Record<KikiExpression, number> = {
  neutral: 0,
  encouraging: -3,
  correct: -5,
  hint: 2,       // slight furrow
  sessionEnd: -3,
}

// Mouth path per expression
const mouthPaths: Record<KikiExpression, string> = {
  neutral:    'M 35 65 Q 50 72 65 65',
  encouraging:'M 33 63 Q 50 74 67 63',
  correct:    'M 30 62 Q 50 78 70 62',
  hint:       'M 38 65 Q 50 70 62 65',
  sessionEnd: 'M 30 62 Q 50 78 70 62',
}

export default function ChefKiki({ expression }: Props) {
  return (
    <motion.div
      style={{ width: 120, height: 180, position: 'absolute', bottom: 20, left: 24 }}
      animate={{ y: [0, -4, 0] }}
      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 100 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Chef hat */}
        <ellipse cx="50" cy="30" rx="28" ry="8" fill="#FFFAF2" stroke="#8B5E3C" strokeWidth="2"/>
        <rect x="35" y="10" width="30" height="22" rx="4" fill="#FFFAF2" stroke="#8B5E3C" strokeWidth="2"/>

        {/* Head */}
        <circle cx="50" cy="68" r="30" fill="#D4918A" stroke="#8B5E3C" strokeWidth="2"/>

        {/* Eyes */}
        <motion.g animate={{ y: browOffsets[expression] }} transition={{ duration: 0.3 }}>
          {/* Left brow */}
          <path d="M 32 55 Q 38 52 44 55" stroke="#8B5E3C" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Right brow */}
          <path d="M 56 55 Q 62 52 68 55" stroke="#8B5E3C" strokeWidth="2.5" strokeLinecap="round"/>
        </motion.g>
        {/* Left eye */}
        <circle cx="38" cy="63" r="5" fill="#8B5E3C"/>
        <circle cx="39.5" cy="61.5" r="1.5" fill="white"/>
        {/* Right eye */}
        <circle cx="62" cy="63" r="5" fill="#8B5E3C"/>
        <circle cx="63.5" cy="61.5" r="1.5" fill="white"/>

        {/* Mouth */}
        <motion.path
          d={mouthPaths[expression]}
          stroke="#8B5E3C" strokeWidth="2.5" strokeLinecap="round" fill="none"
          animate={{ d: mouthPaths[expression] }}
          transition={{ duration: 0.3 }}
        />

        {/* Cheek blush */}
        <circle cx="30" cy="70" r="6" fill="#D4704A" opacity="0.3"/>
        <circle cx="70" cy="70" r="6" fill="#D4704A" opacity="0.3"/>

        {/* Body */}
        <rect x="30" y="96" width="40" height="50" rx="10" fill="#FFFAF2" stroke="#8B5E3C" strokeWidth="2"/>

        {/* Apron stripes (terracotta) */}
        <rect x="30" y="96" width="8" height="50" rx="0" fill="#D4704A" opacity="0.6"/>
        <rect x="46" y="96" width="8" height="50" rx="0" fill="#D4704A" opacity="0.6"/>
        <rect x="62" y="96" width="8" height="50" rx="0" fill="#D4704A" opacity="0.6"/>
        <rect x="30" y="96" width="40" height="50" rx="10" fill="none" stroke="#8B5E3C" strokeWidth="2"/>

        {/* Arms */}
        <ellipse cx="20" cy="115" rx="8" ry="14" fill="#D4918A" stroke="#8B5E3C" strokeWidth="2"/>
        <ellipse cx="80" cy="115" rx="8" ry="14" fill="#D4918A" stroke="#8B5E3C" strokeWidth="2"/>
      </svg>
    </motion.div>
  )
}
```

**Correct answer:** add a quick spring bounce:
```tsx
// In parent, animate Kiki's container on correct
<motion.div animate={isCorrect ? { scale: [1, 1.15, 1] } : {}} transition={{ type: 'spring', stiffness: 400 }}>
  <ChefKiki expression={isCorrect ? 'correct' : 'encouraging'} />
</motion.div>
```

---

## Kitchen Scene (`src/components/KitchenScene.tsx`)

Full-viewport SVG background: warm cream wall, wooden counter (lower 35% of screen), sage green shelf (upper 15%), small window with warm light.

```tsx
export default function KitchenScene({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: '100vw', height: '100vh', position: 'relative',
      background: '#FDF6E9', overflow: 'hidden',
      fontFamily: "'Nunito', sans-serif",
    }}>
      {/* Window */}
      <svg style={{ position: 'absolute', top: 20, right: 60, width: 120, height: 100 }}>
        <rect width="120" height="100" rx="8" fill="#F2B84B" opacity="0.3" stroke="#8B5E3C" strokeWidth="2"/>
        <line x1="60" y1="0" x2="60" y2="100" stroke="#8B5E3C" strokeWidth="2"/>
        <line x1="0" y1="50" x2="120" y2="50" stroke="#8B5E3C" strokeWidth="2"/>
      </svg>

      {/* Top shelf */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '18%',
        background: '#7BAE7F', borderBottom: '3px solid #8B5E3C',
      }}/>

      {/* Counter */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '38%',
        background: '#C4A47C', borderTop: '4px solid #8B5E3C',
      }}>
        {/* Counter surface highlight */}
        <div style={{ height: 8, background: '#D4B48C' }}/>
      </div>

      {/* Play area (counter top) — children go here */}
      <div style={{
        position: 'absolute', bottom: '38%', left: 0, right: 0, top: '18%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {children}
      </div>
    </div>
  )
}
```

---

## Number Card (`src/components/NumberCard.tsx`)

```tsx
import { motion } from 'framer-motion'
import { colors, fonts } from '../shared/tokens'

interface Props {
  value: number
  onClick: () => void
  state?: 'default' | 'correct' | 'hint'
}

const bgColor = {
  default: colors.warmWhite,
  correct: colors.correctGlow,
  hint: colors.hintWarm,
}

export default function NumberCard({ value, onClick, state = 'default' }: Props) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      style={{
        width: 88, height: 88, borderRadius: 16,
        background: bgColor[state],
        border: `3px solid ${colors.softShadow}`,
        boxShadow: '0 4px 8px rgba(139,94,60,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', fontFamily: fonts.number,
        fontSize: 56, fontWeight: 700, color: colors.warmBrown,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {value}
    </motion.button>
  )
}
```

---

## Food Item (`src/components/FoodItem.tsx`)

Emoji-based for MVP (replace with SVGs later). Chunky, large tap target.

```tsx
import { motion } from 'framer-motion'
import { useDraggable } from '@dnd-kit/core'
import type { FoodType } from '../shared/types'

const foodEmoji: Record<FoodType, string> = {
  tomato: '🍅', apple: '🍎', strawberry: '🍓', egg: '🥚',
  carrot: '🥕', blueberry: '🫐', eggCarton: '🥚🥚🥚',
}

interface Props {
  id: string
  type: FoodType
  draggable?: boolean
  onTap?: () => void
  size?: number
}

export default function FoodItem({ id, type, draggable = false, onTap, size = 64 }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id })

  const style = transform ? {
    transform: `translate(${transform.x}px, ${transform.y}px)`,
    zIndex: 100, opacity: isDragging ? 0.8 : 1,
  } : {}

  return (
    <motion.div
      ref={draggable ? setNodeRef : undefined}
      {...(draggable ? { ...listeners, ...attributes } : {})}
      onClick={onTap}
      whileTap={{ scale: 0.9 }}
      animate={isDragging ? { scale: 1.1, rotate: 3 } : { scale: 1, rotate: 0 }}
      style={{
        fontSize: size, lineHeight: 1, cursor: draggable ? 'grab' : 'pointer',
        userSelect: 'none', touchAction: 'none',
        filter: 'drop-shadow(0 3px 4px rgba(139,94,60,0.25))',
        ...style,
      }}
    >
      {foodEmoji[type]}
    </motion.div>
  )
}
```

---

## Drop Zone (`src/components/DropZone.tsx`)

```tsx
import { motion } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import { colors } from '../shared/tokens'

interface Props {
  id: string
  label?: string         // "TENS" / "ONES" / undefined
  children?: React.ReactNode
  width?: number
  height?: number
  shape?: 'rect' | 'circle'
}

export default function DropZone({ id, label, children, width = 100, height = 100, shape = 'rect' }: Props) {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <motion.div
      ref={setNodeRef}
      animate={{ borderColor: isOver ? colors.goldenYellow : colors.softShadow }}
      style={{
        width, height,
        borderRadius: shape === 'circle' ? '50%' : 16,
        border: `3px dashed ${colors.softShadow}`,
        background: isOver ? `${colors.goldenYellow}20` : `${colors.warmWhite}80`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', gap: 4,
      }}
    >
      {label && (
        <span style={{
          position: 'absolute', top: -20,
          fontSize: 14, fontWeight: 600, color: colors.warmBrown,
          fontFamily: "'Nunito', sans-serif",
        }}>
          {label}
        </span>
      )}
      {children}
    </motion.div>
  )
}
```

---

## Ten Frame (`src/components/TenFrame.tsx`)

```tsx
import { colors } from '../shared/tokens'

interface Props {
  filledCount: number     // how many cells are filled (left-to-right, top row first)
  onCellDrop?: (cellIndex: number) => void
  size?: 'small' | 'large'
}

export default function TenFrame({ filledCount, size = 'large' }: Props) {
  const cellSize = size === 'large' ? 56 : 40
  const gap = 6

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
      gap, padding: gap,
      background: colors.warmBrown, borderRadius: 12,
    }}>
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} style={{
          width: cellSize, height: cellSize, borderRadius: 8,
          background: i < filledCount ? colors.softBlue : colors.cream,
          border: `2px solid ${colors.softShadow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: cellSize * 0.5,
        }}>
          {i < filledCount ? '🥚' : ''}
        </div>
      ))}
    </div>
  )
}
```

---

## Dot Plate (`src/components/DotPlate.tsx`)

Pre-defined dot positions (scatter, not rows) for subitizing. Classic arrangements from research.

```tsx
import { motion } from 'framer-motion'
import { colors } from '../shared/tokens'

// Pre-defined positions (x%, y%) for each count — classic subitizing arrangements
const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[30, 50], [70, 50]],
  3: [[25, 65], [50, 35], [75, 65]],
  4: [[28, 35], [72, 35], [28, 70], [72, 70]],
  5: [[25, 60], [50, 30], [75, 60], [35, 75], [65, 75]],
}

interface Props {
  count: number
  visible: boolean   // flash: true for 2s, then false
}

export default function DotPlate({ count, visible }: Props) {
  const positions = DOT_POSITIONS[count] || []

  return (
    <motion.div
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.95 }}
      transition={{ duration: 0.3 }}
      style={{
        width: 200, height: 200, borderRadius: '50%',
        background: colors.warmWhite,
        border: `4px solid ${colors.softShadow}`,
        boxShadow: '0 6px 16px rgba(139,94,60,0.2)',
        position: 'relative',
      }}
    >
      {positions.map(([x, y], i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${x}%`, top: `${y}%`,
          transform: 'translate(-50%, -50%)',
          width: 28, height: 28, borderRadius: '50%',
          background: colors.terracotta,
        }}/>
      ))}
    </motion.div>
  )
}
```

---

## Speech Bubble (`src/components/SpeechBubble.tsx`)

```tsx
import { motion, AnimatePresence } from 'framer-motion'
import { colors, fonts } from '../shared/tokens'

interface Props {
  text: string
  visible: boolean
}

export default function SpeechBubble({ text, visible }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: -10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={{
            position: 'absolute', bottom: 120, left: 150,
            maxWidth: 280, padding: '14px 18px',
            background: colors.warmWhite,
            border: `3px solid ${colors.softShadow}`,
            borderRadius: 20, borderBottomLeftRadius: 4,
            boxShadow: '0 4px 12px rgba(139,94,60,0.15)',
            fontFamily: fonts.body, fontSize: 22,
            fontWeight: 600, color: colors.warmBrown,
            lineHeight: 1.4, zIndex: 10,
          }}
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

---

## Session End (`src/components/SessionEnd.tsx`)

```tsx
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { colors, fonts } from '../shared/tokens'
import { speak } from '../shared/audio'
import { useEffect } from 'react'

export default function SessionEnd() {
  const navigate = useNavigate()

  useEffect(() => {
    speak("Great cooking today, [Child]! See you next time.")
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{
        width: '100vw', height: '100vh', background: colors.cream,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 32,
      }}
    >
      {/* Meal illustration */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ fontSize: 100 }}
      >
        🍽️
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{
          fontFamily: fonts.body, fontSize: 28, fontWeight: 700,
          color: colors.warmBrown, textAlign: 'center', maxWidth: 320,
        }}
      >
        Great cooking today!
      </motion.p>

      {/* Home button — only navigation available */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        onClick={() => navigate('/')}
        whileTap={{ scale: 0.95 }}
        style={{
          width: 80, height: 80, borderRadius: 20,
          background: colors.sageGreen,
          border: `3px solid ${colors.warmBrown}`,
          fontSize: 40, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        🏠
      </motion.button>

      {/* NO play-again button. Intentional. */}
    </motion.div>
  )
}
```

---

## Home Screen (`src/screens/HomeScreen.tsx`)

```tsx
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { speak } from '../shared/audio'
import { colors, fonts } from '../shared/tokens'

const games = [
  { id: 'number-kitchen', emoji: '🍳', label: 'Number Kitchen', color: '#D4704A' },
  { id: 'word-island', emoji: '🏝️', label: 'Word Island', color: '#7BAE7F' },
  { id: 'story-explorer', emoji: '📖', label: 'Story Explorer', color: '#7FB3C8' },
  { id: 'feeling-friends', emoji: '🐻', label: 'Feeling Friends', color: '#B8A9C9' },
]

export default function HomeScreen() {
  const navigate = useNavigate()

  return (
    <div style={{
      width: '100vw', height: '100vh', background: colors.cream,
      display: 'flex', flexWrap: 'wrap', alignItems: 'center',
      justifyContent: 'center', gap: 24, padding: 32,
    }}>
      {games.map(game => (
        <motion.button
          key={game.id}
          whileTap={{ scale: 0.94 }}
          onPointerEnter={() => speak(game.label)}
          onClick={() => navigate(`/${game.id}`)}
          style={{
            width: 160, height: 160, borderRadius: 28,
            background: game.color, border: `4px solid ${colors.warmBrown}`,
            boxShadow: '0 6px 16px rgba(139,94,60,0.2)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12,
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 64 }}>{game.emoji}</span>
          {/* No text label visible — audio only for [Child]. Label for parent accessibility. */}
          <span style={{
            fontFamily: fonts.body, fontSize: 16, fontWeight: 700,
            color: colors.warmWhite, opacity: 0.9,
          }}>
            {game.label}
          </span>
        </motion.button>
      ))}
    </div>
  )
}
```

---

## Stage 1 — Subitizing (`src/stages/Stage1_Subitizing.tsx`)

```tsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import KitchenScene from '../components/KitchenScene'
import ChefKiki from '../components/ChefKiki'
import SpeechBubble from '../components/SpeechBubble'
import DotPlate from '../components/DotPlate'
import NumberCard from '../components/NumberCard'
import SessionEnd from '../components/SessionEnd'
import { speak, cancelSpeech } from '../shared/audio'
import { loadProgress, saveProgress, recordAnswer, endSession } from '../shared/progress'
import { colors } from '../shared/tokens'
import type { KikiExpression } from '../shared/types'

const PUZZLES_PER_SESSION = 4

function randomTarget() { return Math.floor(Math.random() * 5) + 1 }
function distractors(target: number): number[] {
  const opts = new Set([target])
  while (opts.size < 4) opts.add(Math.floor(Math.random() * 5) + 1)
  return shuffle([...opts])
}
function shuffle<T>(arr: T[]): T[] {
  return arr.sort(() => Math.random() - 0.5)
}

export default function Stage1() {
  const [target, setTarget] = useState(randomTarget())
  const [choices, setChoices] = useState<number[]>([])
  const [plateVisible, setPlateVisible] = useState(false)
  const [choicesVisible, setChoicesVisible] = useState(false)
  const [kikiExpr, setKikiExpr] = useState<KikiExpression>('encouraging')
  const [speech, setSpeech] = useState('')
  const [cardState, setCardState] = useState<Record<number, 'default'|'correct'|'hint'>>({})
  const [puzzlesDone, setPuzzlesDone] = useState(0)
  const [done, setDone] = useState(false)
  const [progress, setProgress] = useState(loadProgress())

  function newPuzzle() {
    const t = randomTarget()
    setTarget(t)
    setChoices(distractors(t))
    setCardState({})
    setChoicesVisible(false)
    setKikiExpr('encouraging')

    // Flash sequence
    setSpeech("How many dots do you see?")
    speak("How many dots do you see?")
    setTimeout(() => setPlateVisible(true), 600)
    setTimeout(() => { setPlateVisible(false); setChoicesVisible(true) }, 2600)
  }

  useEffect(() => { newPuzzle() }, [])

  function handleChoice(value: number) {
    if (!choicesVisible) return
    const correct = value === target

    if (correct) {
      setCardState({ [value]: 'correct' })
      setKikiExpr('correct')
      setPlateVisible(true)
      setSpeech(`Yes! ${target} dots!`)
      speak(`Yes! ${target} dots!`)
      const updated = recordAnswer(progress, true)
      setProgress(updated)
      saveProgress(updated)

      setTimeout(() => {
        if (puzzlesDone + 1 >= PUZZLES_PER_SESSION) {
          const ended = endSession(updated)
          setProgress(ended)
          saveProgress(ended)
          setDone(true)
        } else {
          setPuzzlesDone(p => p + 1)
          newPuzzle()
        }
      }, 1800)
    } else {
      setCardState({ [value]: 'hint' })
      setKikiExpr('hint')
      setPlateVisible(true)
      setSpeech("Look again — count with me...")
      speak("Look again — count with me...")
      // Count aloud
      setTimeout(() => {
        for (let i = 1; i <= target; i++) {
          setTimeout(() => speak(String(i)), i * 600)
        }
      }, 400)
      setTimeout(() => {
        setCardState({})
        setKikiExpr('encouraging')
        setSpeech("How many dots do you see?")
        setPlateVisible(false)
        setTimeout(() => { setPlateVisible(true) }, 500)
        setTimeout(() => { setPlateVisible(false); }, 2500)
      }, target * 600 + 1200)
    }
  }

  if (done) return <SessionEnd />

  return (
    <KitchenScene>
      <ChefKiki expression={kikiExpr} />
      <SpeechBubble text={speech} visible={!!speech} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        <DotPlate count={target} visible={plateVisible} />

        {choicesVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', gap: 16 }}
          >
            {choices.map(v => (
              <NumberCard
                key={v} value={v}
                onClick={() => handleChoice(v)}
                state={cardState[v] || 'default'}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Progress dots */}
      <div style={{
        position: 'absolute', top: 20, right: 20,
        display: 'flex', gap: 8,
      }}>
        {Array.from({ length: PUZZLES_PER_SESSION }, (_, i) => (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: '50%',
            background: i < puzzlesDone ? colors.correctGlow : colors.softShadow,
          }}/>
        ))}
      </div>
    </KitchenScene>
  )
}
```

Stages 2–7 follow the same pattern: `KitchenScene` + `ChefKiki` + `SpeechBubble` + stage-specific mechanic + `SessionEnd` on completion.

Cross-stage implementation rules learned from Stage 1:
- New stages should start with visible supports on screen; do not hide the core representation and force recall too early.
- Tasks should measure the math concept, not working memory, hidden navigation, or reading ability.
- Speech is supportive only. Every important prompt and response must also be communicated visually through layout, state, expression, and/or iconography.
- Keep the written words on screen for literacy exposure, but do not require reading to understand what happened.
- Fade scaffolds over sessions instead of removing them in the first playable version of a stage.

---

## Stage 2 — Counting (`src/stages/Stage2_Counting.tsx`)

Key mechanic: tap-to-move (no drag). Each tap moves one tomato from pile to bowl, speaks the count number. Cardinality: tap the bowl to hear the total.

```tsx
// State: target (1-20), placed (0), phase ('counting' | 'cardinality' | 'done')
// On each tomato tap: placed++, speak(placed), animate tomato to bowl
// When placed === target: show bowl glow, speak "Tap the bowl to find out!"
// On bowl tap: speak(target), mark correct, advance
// Numbers 1-10: weeks 1-2. 11-20: weeks 3-4 (tracked via sessions in progress)
```

Stage 2 support rules:
- Keep the counted items visible in the bowl while she answers cardinality questions.
- Show the current counted quantity visually as objects first; numeral labels can appear alongside later, not instead.
- Count audio should reinforce the visible placement, not replace it.

---

## Stage 3 — Ten Frames (`src/stages/Stage3_TenFrames.tsx`)

Key mechanic: drag eggs into ten-frame cells. First drag interaction in the game.

```tsx
// DnDContext wraps the stage
// Ten-frame: 10 DropZones in a 2×5 grid
// Egg FoodItems: draggable
// On drop into cell: cell fills (show egg emoji in cell)
// When filledCount === target: ask "How many empty spaces?" → NumberCard choices
// Empty spaces = 10 - target. Correct → advance.
// Weeks 11-20: render two TenFrame components side by side
```

Stage 3 support rules:
- Keep the filled ten-frame visible while asking "how many empty" or "how many altogether."
- Early answer cards can include both the numeral and a mini ten-frame cue; remove the pictorial hint only after the 5-and-10 pattern is stable.
- Do not rely on spoken explanation alone to teach the 5-anchor structure.

---

## Stage 4 — Number Bonds (`src/stages/Stage4_NumberBonds.tsx`)

Part-part-whole diagram: 3 circles (top=total, bottom-left=known part, bottom-right=empty).

```tsx
// known: the filled part. target: the total. answer: target - known
// Draggable items fill the empty part circle (DropZone with circle shape)
// When count in empty circle === answer: correct feedback
// Content: bonds to 5 first (sessions 1-6), bonds to 10 (sessions 7-12)
```

Stage 4 support rules:
- Keep the whole and visible part on screen while asking for the missing part.
- Introduce the number sentence only after the part-part-whole picture is legible.
- Visual response cues should do most of the explanatory work; speech should only reinforce.

---

## Stage 5 — Addition (`src/stages/Stage5_Addition.tsx`)

Three sub-phases based on `sessionsCompleted` in progress:
- Sessions 0-5: two bowls (concrete merge)
- Sessions 6-11: two ten-frames (pictorial)
- Sessions 12+: number sentence with NumberCard (abstract)

Stage 5 support rules:
- Keep both source groups and the combined result visible during early addition/subtraction prompts.
- Do not ask for a bare numeral answer until the combine/take-away picture is already stable.
- Wrong-answer recovery should point back to the groups, not just restate the symbol.

---

## Stage 6 — Place Value (`src/stages/Stage6_PlaceValue.tsx`)

Tens/ones mat with two DropZone columns (TENS, ONES). Two types of FoodItem: `eggCarton` (big, labeled "10") and `egg` (small). Puzzle gives a target number, [Child] drags correct number of cartons + singles.

```tsx
// Target: e.g. 37 → need 3 cartons in TENS, 7 eggs in ONES
// Validate: tensCount * 10 + onesCount === target
// Reverse mode (sessions 6+): show the built arrangement, ask what number it is → NumberCard
```

Stage 6 support rules:
- Keep cartons and loose ones visible alongside the numeral during early reverse mode.
- The visual difference between one, ten, and the final number must carry the meaning even if speech is ignored.
- Do not jump to numeral-only prompts before "3 tens and 7 ones" is clearly understood as a picture.

---

## Stage 7 — Multiplication (`src/stages/Stage7_Multiplication.tsx`)

Three sub-phases:
- Sessions 0-5: equal groups (M plates, drag N items to each)
- Sessions 6-11: arrays (M×N grid of DropZones, fill all)
- Sessions 12+: show filled array, `M × N = ?` → NumberCard

Stage 7 support rules:
- Keep equal groups or arrays visible when introducing the symbol.
- Early answer choices can include grouped visual support rather than bare numerals.
- The child should be able to see the repeated structure while hearing "groups of," not infer it from memory.

---

## App Router (`src/App.tsx`)

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { initAudio } from './shared/audio'
import HomeScreen from './screens/HomeScreen'
import NumberKitchen from './screens/NumberKitchen'

export default function App() {
  useEffect(() => { initAudio() }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/number-kitchen" element={<NumberKitchen />} />
        {/* Other games added later */}
      </Routes>
    </BrowserRouter>
  )
}
```

## Number Kitchen Shell (`src/screens/NumberKitchen.tsx`)

```tsx
import { loadProgress } from '../shared/progress'
import Stage1 from '../stages/Stage1_Subitizing'
import Stage2 from '../stages/Stage2_Counting'
// ... import all 7

const stageComponents = { 1: Stage1, 2: Stage2, /* ... */ 7: Stage7 }

export default function NumberKitchen() {
  const progress = loadProgress()
  const StageComponent = stageComponents[progress.currentStage]
  return <StageComponent />
}
```

---

## Production Quality — Stage 1 Spec

This section defines what "production quality" means for Stage 1. Emoji and div placeholders are not acceptable. Every element below must be implemented to ship.

---

### Kitchen Scene (production)

Not CSS divs. A full illustrated SVG background that fills the viewport.

**Elements required:**
- **Wall**: warm cream (`#FDF6E9`) with faint watercolor texture (SVG `feTurbulence` filter, very subtle — baseFrequency 0.015, opacity 0.06)
- **Window** (upper right): wooden frame, warm golden light coming through, faint cloud shape outside. Not a rectangle with lines — an illustrated window with rounded frame and sill.
- **Shelf** (upper 18%): sage green (`#7BAE7F`) with visible wood grain (3-4 horizontal SVG lines, 15% opacity). Small decorative items on shelf: a small pot, a jar, a hanging bunch of herbs. These are static decoration, not interactive.
- **Counter** (lower 38%): warm wood tone (`#C4A47C`) with wood grain lines. Counter edge has a subtle rounded lip at the top. The work surface (top 8px of counter) is slightly lighter.
- **Counter backsplash**: small cream tiles with sage green grout lines (SVG pattern, `patternUnits="userSpaceOnUse"`, 40×40px tiles)
- **Ambient light**: very subtle radial gradient overlay, golden center, cream edges — gives the "warm kitchen" light feel

**Sizes**: full viewport (100vw × 100vh). Counter occupies bottom 38%, shelf top 18%, play area middle 44%.

---

### Chef Kiki (production)

The inline SVG in the build plan is a starting point. Production requires:

**Head & face:**
- Head: filled circle, `#E8B4A0` (warm peach, not orange), stroke `#7A4A2E` 2px
- Eyes: filled ellipses (not circles) — slightly wide, expressive. White sclera + dark iris + small highlight dot. Eyelid line above each eye (a subtle arc).
- Eyebrows: thick rounded paths, animate Y position per expression
- Nose: small teardrop SVG shape, not a line
- Mouth: cubic bezier path — distinct shape per expression (neutral/encouraging/correct/hint/session-end). Animate `d` attribute with Framer Motion `pathLength` or direct `d` interpolation.
- Cheek blush: two soft ellipses, `#D4704A` at 25% opacity

**Body:**
- Chef hat: proper toque shape — cylinder base + puffed dome. White with a thin warm-brown band.
- Body: rounded trapezoid (wider at hips). White chef jacket.
- Apron: overlaid shape, terracotta (`#D4704A`) with vertical cream stripes (every 8px). Apron has a small bow at top.
- Arms: rounded rectangles, slight bend at elbow. Hands are simple rounded mitten shapes.

**Expressions (5 required, each a distinct named variant):**
```
neutral      — soft smile, relaxed brows, eyes 100% open
encouraging  — brows raised 3px, mouth open smile, eyes slightly wider
correct      — brows raised 5px, big open smile, eyes squint-happy (lids lower 20%)
hint         — one brow slightly raised, other neutral, mouth side-curve (gentle, curious — NOT sad)
sessionEnd   — eyes close (lids fully down), wide smile, brows high — warm and satisfied
```

**Animations:**
- Idle: `y: [0, -5, 0]`, 3s, `ease: "easeInOut"`, `repeat: Infinity` — gentle breathing float
- Correct reaction: spring bounce `y: [0, -18, 0]`, stiffness 400, damping 12, then return to idle
- Hint reaction: `rotate: [0, -4, 4, 0]`, 0.5s — gentle head wobble, not a punishing shake
- Expression transitions: 300ms ease

---

### Dot Plate (production)

Not colored divs. An illustrated ceramic plate with dots that look painted on.

**Plate itself:**
- Outer circle: `#F0E8D8` fill, `#C4A47C` stroke 3px, drop shadow `0 6px 20px rgba(139,94,60,0.2)`
- Inner rim: concentric circle at 92% radius, `#E8D5B0` stroke 1.5px — gives ceramic depth
- Subtle radial gradient on plate surface: center slightly lighter than edges

**Dots:**
- Each dot: filled circle, `#D4704A` (terracotta), with a small white highlight ellipse at upper-left (11 o'clock position) — makes them look like painted ceramic dots, not flat circles
- Dot size: 22px radius for counts 1-3, 18px for counts 4-5 (slightly smaller to fit without crowding)
- Dot positions: exact pre-defined coordinates (scatter, not grid — see below)
- Dots animate in on plate appearance: `scale: 0 → 1`, staggered 80ms between dots, spring animation

**Canonical dot positions (% of plate diameter, center = 50,50):**
```
1 dot:  [(50, 50)]
2 dots: [(32, 50), (68, 50)]
3 dots: [(50, 33), (28, 63), (72, 63)]
4 dots: [(30, 33), (70, 33), (30, 67), (70, 67)]
5 dots: [(50, 28), (26, 48), (74, 48), (33, 70), (67, 70)]
```
These are the standard subitizing card arrangements from research. Do not randomize positions — the same arrangement for each count, always. Recognition comes from the consistent pattern.

**Flash sequence (precise timing):**
1. Plate scales in from 0.8→1, 250ms spring
2. Dots stagger in 80ms apart
3. Hold 2000ms (visible)
4. Plate fades out, 300ms ease
5. Choices appear 200ms after plate disappears (small gap, prevents accidental tap)

---

### Number Cards (production)

Not plain buttons. Illustrated cards that feel like wooden tiles.

**Visual:**
- Background: `#FFFAF2` with a very subtle wood-grain SVG texture (faint horizontal lines, 8% opacity)
- Border: `#C4A47C` 3px, border-radius 16px
- Drop shadow: `0 5px 12px rgba(139,94,60,0.22)` at rest
- Number: Baloo 2, 64px, weight 700, color `#5C3D1E` (dark warm brown)

**States:**
- Rest: as above
- Hover/press start: shadow increases to `0 8px 20px rgba(139,94,60,0.3)`, scale 1.06, border shifts to `#A07840`
- Correct: background fills to `#A8D5A2` (soft green), border `#5A9E6F`, brief scale pulse 1.0→1.08→1.0 over 300ms. Keep for 1.5s then advance.
- Hint: background fills to `#F7E2B0` (soft yellow), border `#C9A840`, gentle wobble animation (not scale — lateral rock ±3deg, 400ms)

**Layout:** 4 cards in a row, gap 20px. Each card 88×88px min. On small viewports (< 500px wide), 2×2 grid.

**Tap response**: immediate visual feedback (<16ms). Do not wait for audio to start before showing state change.

---

### Sound Design (production)

Web Audio API for non-speech sounds. Do not use audio files (no hosting needed). Generate tones programmatically.

```typescript
// src/shared/sounds.ts

function createTone(ctx: AudioContext, freq: number, duration: number, type: OscillatorType = 'sine') {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = freq
  osc.type = type
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}

// Correct answer: warm two-tone chime (C5 then E5)
export function playCorrect(ctx: AudioContext) {
  createTone(ctx, 523, 0.3)   // C5
  setTimeout(() => createTone(ctx, 659, 0.4), 180)  // E5
}

// Hint (wrong answer): single soft low tone, not a buzzer
export function playHint(ctx: AudioContext) {
  createTone(ctx, 330, 0.25, 'sine')  // E4 — low, soft, questioning
}

// Session end: warm three-note rising melody
export function playSessionEnd(ctx: AudioContext) {
  createTone(ctx, 392, 0.25)  // G4
  setTimeout(() => createTone(ctx, 523, 0.25), 220)  // C5
  setTimeout(() => createTone(ctx, 659, 0.5), 440)   // E5
}

// Item tap (each dot counted): gentle wooden click
export function playTap(ctx: AudioContext) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 200)
  const src = ctx.createBufferSource()
  const gain = ctx.createGain()
  src.buffer = buf
  src.connect(gain)
  gain.connect(ctx.destination)
  gain.gain.value = 0.15
  src.start()
}
```

Initialize `AudioContext` once on first user tap (browser requires gesture). Store in a module-level ref.

**Rules:**
- Correct chime plays simultaneously with Kiki's speech ("Yes! 3 dots!") — chime first, speech 200ms later
- Hint tone plays simultaneously with Kiki's speech — tone first, speech 300ms later
- No sound plays without a user gesture (browser restriction)
- No looping background music

---

### Session End Screen (production)

Not a plain div. A warm illustrated scene.

**Visual:**
- Same cream background as kitchen
- A wooden dining table (simple SVG, centered, 60% viewport width)
- A steaming dish on the table: illustrated bowl SVG with 3 wavy steam lines animating upward (SVG `animate` on opacity + translateY, loop)
- Chef Kiki stands beside the table in `sessionEnd` expression
- Two small illustrated characters sitting at the table (simple round-head figures, neutral — they're the "guests" who received the meal)

**Text** (Nunito, 26px, `#5C3D1E`):
- "Great cooking today!" — fades in at 1.2s

**Home button:**
- House SVG icon (not emoji) — illustrated, warm, matches design language
- 80×80px, sage green background, warm brown border
- Positioned center-bottom, fades in at 2s
- On tap: fade entire screen to cream, then navigate — no jarring cut

**No play-again button. No "next" button. No score display.**

---

## Non-Addictive Rules (enforced in code, not just design)

1. `SessionEnd` has no play-again button. The only tap target is the home icon.
2. `PUZZLES_PER_SESSION` is a constant (4). No infinite puzzle generation.
3. No score, star, or streak is ever shown to [Child]. Parent view only (hidden).
4. `endSession()` in `progress.ts` resets per-session counters — can't accumulate across sessions.
5. No background music loop. Audio is speech only.
6. Mastery unlocks next stage — but doesn't celebrate with points. It just… opens.

---

## Verification & Acceptance Testing

### 1. Ask Codex to write unit tests for all logic modules

Codex must generate tests for:

```
src/shared/audio.ts       — queue ordering, no overlap, cancelSpeech clears
src/shared/progress.ts    — recordAnswer(), endSession(), mastery unlock logic
src/stages/*.tsx          — puzzle generation, correct/wrong answer state transitions
```

Specific cases to cover in `progress.ts`:
- `recordAnswer` increments `correctThisSession` only on correct
- `endSession` increments `sessionsCompleted` and resets per-session counters
- Mastery triggers after 3 sessions with ≥ 75% accuracy
- Mastery does NOT trigger if accuracy is below threshold even after 3 sessions
- `currentStage` advances to 2 only after stage 1 mastery, not before
- `currentStage` caps at 7, never goes to 8

Specific cases in Stage 1 logic:
- 4 choices always shown, exactly 1 is correct
- Distractors never equal the target
- `plateVisible` is false when choices are shown (flash, then hide)
- Wrong answer re-shows plate, does not advance `puzzlesDone`
- `puzzlesDone` reaches `PUZZLES_PER_SESSION` → `SessionEnd` renders

Run with: `npm test` (configure vitest in vite.config.ts)

---

### 2. Debug mode (ask Codex to build this)

Add a `?debug=true` URL param that:
- Shows current stage, sessions completed, mastery status in a small overlay
- Adds a "Force next puzzle" button (bypasses flash timer)
- Adds a "Force session end" button
- Adds a "Reset progress" button
- Makes `PUZZLES_PER_SESSION = 1` so you can reach SessionEnd in one answer

This lets you test the full stage-unlock flow in 10 minutes instead of sitting through 3 full sessions. **Never visible without `?debug=true`.**

---

### 3. Manual playthrough protocol (run yourself before [Child] does)

Open Chrome → DevTools → Toggle device toolbar → iPad Air (820×1180) → touch mode on. Volume up.

**Test 1: Home screen**
- [ ] 4 tiles visible, no text navigation required
- [ ] Tap each tile — audio label plays ("Number Kitchen", etc.)
- [ ] Tap Number Kitchen → kitchen scene loads

**Test 2: Stage 1 — full session**
- [ ] Plate flashes for ~2 seconds then hides
- [ ] 4 number cards appear (all different, 1 matches the dot count)
- [ ] Tap wrong answer → soft yellow card, plate reappears, Kiki tilts head, counts aloud, no harsh sound
- [ ] Tap correct answer → soft green card, plate reappears, Kiki bounces, warm voice
- [ ] Complete 4 puzzles → `SessionEnd` screen appears
- [ ] `SessionEnd` has NO play-again button — only house icon
- [ ] Tap house → HomeScreen

**Test 3: Progress persistence**
- [ ] Play 1 session of Stage 1. Note sessions completed in debug overlay.
- [ ] Close tab. Reopen. Open `?debug=true`. Sessions completed = 1. ✓

**Test 4: Stage unlock**
- [ ] Using debug mode, complete 3 sessions of Stage 1 with correct answers
- [ ] On 4th session start: stage should advance to 2
- [ ] Stage 2 kitchen loads (tomato + bowl mechanic, not dot plate)

**Test 5: Non-addictive audit**
- [ ] No timer visible anywhere during gameplay
- [ ] No score counter visible to [Child] (debug overlay doesn't count)
- [ ] No "play again" button on SessionEnd
- [ ] No streak display ("3 days in a row!") anywhere
- [ ] Wrong answer: no red color, no buzzer sound, no "X" symbol
- [ ] Correct answer: calm chime only — no explosion/confetti/coin sound

**Test 6: Audio**
- [ ] Tap a number card → no speech overlap with current speech
- [ ] Rapid taps on number cards → speech queues cleanly, doesn't stack/garble
- [ ] `cancelSpeech()` called on stage transition → no ghost audio from previous stage

**Test 7: Touch targets**
- [ ] Every tappable element is ≥ 72×72px (verify in DevTools: inspect → box model)
- [ ] Number cards: 88×88px ✓
- [ ] Home icon on SessionEnd: 80×80px ✓
- [ ] Food items: emoji at 64px+ ✓

---

### 4. Pedagogical correctness checklist

These verify the game teaches what it's supposed to:

**Stage 1 (Subitizing)**
- [ ] Dot arrangements are scatter patterns, NOT rows (rows enable counting, not subitizing)
- [ ] Flash duration is 2 seconds — long enough to see, short enough to prevent counting
- [ ] Numbers 1-5 only (subitizing range)
- [ ] No number label visible during flash (she must respond to the dots, not a numeral)

**Stage 2 (Counting)**
- [ ] Each tap counts exactly ONE item — no batch moves
- [ ] Audio says each number as it's placed: "one... two... three..."
- [ ] Bowl tap confirms cardinality — the LAST number said IS the total (not a recount)
- [ ] Counted objects stay visible while cardinality is checked
- [ ] Early prompts do not require remembering a hidden quantity

**Stage 3 (Ten Frames)**
- [ ] Top row fills left-to-right BEFORE bottom row starts (reinforces 5-anchor)
- [ ] "How many empty?" question appears AFTER filling to target — not before
- [ ] Ten-frame stays visible while the answer is chosen
- [ ] Early answer choices may include mini visual supports before numeral-only mode

**Stage 4 (Number Bonds)**
- [ ] Shows multiple bonds for same number across puzzles (7=3+4, then 7=5+2, then 7=6+1)
- [ ] Number sentence (4 + ? = 7) appears AFTER dragging, not before
- [ ] Whole and known part remain visible during missing-part prompts

**Stage 5 (Addition)**
- [ ] Sub-phase 1 (concrete): no + or = symbol visible
- [ ] Sub-phase 2 (pictorial): no + or = symbol visible
- [ ] Sub-phase 3 (abstract): + and = appear only now
- [ ] CPA sequence is locked — can't see abstract before completing concrete sessions
- [ ] Early puzzles keep the combined picture visible while the answer is chosen

**Stage 6 (Place Value)**
- [ ] Carton visually shows 10 eggs inside it (not just labeled "10")
- [ ] Tens/Ones mat columns are labeled TENS and ONES
- [ ] Kiki speaks: "3 cartons and 7 loose — that's 37!" (language before numeral)
- [ ] Bundles and loose ones remain visible beside the numeral in early reverse mode

**Stage 7 (Multiplication)**
- [ ] Sub-phase 1: NO × symbol shown — only "3 groups of 4"
- [ ] Sub-phase 2: array shown before symbol
- [ ] Sub-phase 3: × symbol introduced only after array is built
- [ ] Equal groups or arrays stay visible while early answers are chosen

---

### 5. [Child] test (final gate)

Only after all above pass. Hand her the iPad with Stage 1 loaded.

Watch for:
- Does she know what to tap without being told? (If not → UX problem)
- Does she tap the dots to count during the flash? (Expected at first — fine)
- Does she get frustrated on wrong answers? (If yes → hint is too harsh)
- Does she ask to keep playing when SessionEnd appears? (Good — means she liked it. Still don't add play-again button.)
- Does she remember what to do on the second session without prompting?

Fix anything she struggles with before calling it done.
