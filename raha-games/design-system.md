# Number Kitchen — Design System

**Aesthetic:** Storybook / picture book. Warm, cozy, hand-drawn feel. Like a Bluey episode set in a kitchen — familiar, gentle, never loud. No neon. No dopamine flashes. A world [Child] wants to sit inside.

---

## Color Palette

### Base
| Name | Hex | Use |
|---|---|---|
| Cream | `#FDF6E9` | Main background — warm paper, not stark white |
| Warm White | `#FFFAF2` | Card surfaces, drop zones |
| Soft Shadow | `#E8D5B0` | Borders, subtle dividers |

### Primary (kitchen warmth)
| Name | Hex | Use |
|---|---|---|
| Terracotta | `#D4704A` | Primary buttons, chef's apron accent |
| Golden Yellow | `#F2B84B` | Highlights, correct-answer glow, bowl rims |
| Sage Green | `#7BAE7F` | Counter surface, secondary elements |
| Dusty Rose | `#D4918A` | Chef character skin tones, warm accents |

### Supporting
| Name | Hex | Use |
|---|---|---|
| Warm Brown | `#8B5E3C` | Text (never black), outlines |
| Soft Blue | `#7FB3C8` | Ten-frame cells, tens column on mat |
| Muted Lavender | `#B8A9C9` | Ones column on mat, soft separators |

### Feedback
| Name | Hex | Use |
|---|---|---|
| Correct Glow | `#A8D5A2` | Soft green — correct answer highlight |
| Hint Warm | `#F7E2B0` | Soft yellow — wrong answer, gentle hint |

**Rule:** Never use pure black (#000) or pure white (#fff). Always warm versions.

---

## Typography

### Fonts
- **Display / numbers:** [Baloo 2](https://fonts.google.com/specimen/Baloo+2) — rounded, warm, handwritten feel. Load weights 400 and 700.
- **Body / chef speech:** [Nunito](https://fonts.google.com/specimen/Nunito) — gentle, round, highly legible at small sizes.

### Scale
| Role | Font | Size | Weight | Use |
|---|---|---|---|---|
| Number (large) | Baloo 2 | 72–96px | 700 | Number cards, counting display |
| Number (medium) | Baloo 2 | 48px | 700 | Ten-frame counts, number bonds |
| Chef speech bubble | Nunito | 28px | 600 | What the chef says (displayed + spoken) |
| Label | Nunito | 20px | 400 | Stage labels, parent screen |

**Rule:** [Child] cannot read fluently yet. Words stay visible for literacy exposure, but meaning cannot depend on reading. Chef speech is spoken aloud when useful, and every important prompt/result also needs a non-reading visual cue.

---

## Kitchen Scene Layout

```
┌─────────────────────────────────────────────────────┐
│  [warm cream background — faint watercolor texture]  │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  [wooden cabinet / shelf — sage green tiles] │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │           COUNTER (warm wood tone)            │   │
│  │  [puzzle area lives here — drop zones, items] │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  [Chef character]     [Speech bubble]                │
│  (bottom left)        (beside chef)                  │
└─────────────────────────────────────────────────────┘
```

- Counter is the "play area" — everything interactive happens here
- Chef stands in the lower left, speaks, reacts to correct/wrong answers
- Speech bubble appears beside chef (not as a floating overlay)
- Top shelf holds the "ingredient supply" — items to be dragged down

---

## Chef Character

**Design language:** Simple, expressive, round. Like a character from a picture book — enough detail to feel alive, simple enough to render in SVG and animate.

**Anatomy:**
- Large round head, ~40% of character height
- Small round body with apron (terracotta + dusty rose)
- Big expressive eyes (simple dots with brows that move)
- Curved smile — neutral: soft; happy: wide; thinking: side-slanted

**Expressions (all via SVG path/transform animation):**
- **Neutral:** soft smile, relaxed brows
- **Encouraging (while [Child] works):** raised brows, open smile, slight head tilt
- **Correct:** big smile, eyebrows up, slight bounce
- **Hint (wrong):** brows gently furrowed, tilted head, reassuring expression — never sad or disappointed
- **Session end:** eyes close in a warm squint, big smile

**Animation:** Framer Motion. Idle: gentle breathing sway (scale 1→1.02, 3s loop). React: quick bounce (spring) on correct, soft head shake on hint.

**Chef gender/name:** Gender-neutral design — round, soft, warm. Named "Chef Kiki" (easy for [Child] to say). Chef Kiki wears a striped apron.

---

## Interactive Elements

### Food Items (draggable objects)

**Style:** Chunky, illustrated, with a thick warm-brown outline (~3px). Slight drop shadow to feel lifted off the counter. Not photorealistic — look like something from a picture book.

**Items by stage:**
- Stage 1: Colorful dots on a cream plate
- Stage 2: Tomatoes, apples, strawberries (round, easy to tap)
- Stage 3: Eggs (oval, distinct shape)
- Stage 4: Strawberries + eggs (both familiar)
- Stage 5: Mixed vegetables
- Stage 6: Single eggs + egg cartons (visually very different sizes)
- Stage 7: Strawberries + blueberries arranged on plates

**Interaction states:**
- Rest: drop shadow (4px, soft brown, 30% opacity)
- Press/drag start: shadow reduces (feels "lifted"), scale 1.08x
- Dragging: shadow increases (higher lift), slight rotation ±3°
- Drop success: item snaps to zone with spring animation, small "pop" scale
- Drop zone correct: zone pulses with golden glow

### Number Cards (tap targets)

**Style:** Rounded rectangle, cream background, warm-brown outline. Number in Baloo 2, 72px, warm brown.

**Size:** Min 80×80px. Plenty of room for a 5-year-old finger.

**States:**
- Rest: drop shadow, cream background
- Hover/press: scale 1.05x, golden border
- Selected correct: soft green fill, chef reacts
- Selected wrong: soft yellow fill (no red, no X), chef gives hint

### Drop Zones (bowls, ten-frame cells, mat columns)

**Style:** Match the stage context — a bowl looks like a ceramic bowl, a ten-frame cell looks like a wooden grid slot, the tens/ones mat looks like a cloth mat with labeled columns.

**Empty state:** Faint dashed outline or gentle pulsing glow when an item is being dragged nearby (shows it's a valid drop zone).

**Filled state:** Item sits inside naturally — no harsh borders.

### Buttons

Only one button visible per screen: the home icon (house shape, bottom left corner, always available). No other navigation. No "next", "back", or "skip" buttons for [Child].

### Scaffolding Rules Across Stages

- New concepts should begin with the representation still visible on screen. Do not hide the quantity, group, frame, or bundle and then immediately ask for an abstract answer.
- Answer choices may include pictorial support when introducing a concept. Fade supports later instead of removing them from the first version.
- Do not make early tasks depend on working memory unless memory is the explicit skill being trained.
- Every success, retry, and completion state needs a non-reading signal: color, icon/badge, character expression, motion, or scene change.
- Written prompts can remain on screen, but the child should still know what happened if she ignores the text completely.

---

## Animation Principles

**Rule:** Every animation has a purpose. Nothing animates just to be busy.

| Animation | Style | Duration | Trigger |
|---|---|---|---|
| Chef idle sway | Spring, looping | 3s cycle | Always |
| Chef react (correct) | Quick bounce up then settle | 300ms | Correct answer |
| Chef react (hint) | Slow head tilt | 400ms | Wrong answer |
| Item drag | Follow finger | Real-time | Drag |
| Item snap to zone | Spring (stiffness: 300, damping: 20) | 200ms | Drop |
| Item count audio | Slight scale pulse per number | 150ms | Each tap during counting |
| Ten-frame fill | Cell fills with a soft pop | 200ms | Each item placed |
| Correct glow | Radial soft green glow | 600ms fade in/out | Puzzle solved |
| Session end (meal served) | Dish slides to table, steam rises | 800ms | Session complete |
| Stage transition | Soft cross-fade | 500ms | Between puzzles |

**Avoid:** Rapid particle effects, screen flashes, spin animations, anything that lasts <100ms (too fast for small eyes to track).

---

## Kitchen Backgrounds by Stage

Each stage has a slightly different kitchen scene — same warm aesthetic, different focal point to signal "we're doing something new today."

| Stage | Kitchen focus | Accent color |
|---|---|---|
| 1 — Subitizing | Round plates on the shelf | Terracotta plates |
| 2 — Counting | Vegetable basket on counter | Sage green basket |
| 3 — Ten Frames | Wooden egg grid on counter | Warm wood grain |
| 4 — Number Bonds | Strawberry crate + bowl | Dusty rose |
| 5 — Addition | Two bowls side by side | Golden Yellow |
| 6 — Place Value | Big egg order board on wall | Soft Blue |
| 7 — Multiplication | Dinner party table visible | Warm lavender |

Same elements, different prop arrangement. Feels like different days in the same cozy kitchen.

---

## Sound Design

**Rule:** Every sound is warm. Nothing shrill, nothing that triggers urgency.

| Sound | Description | When |
|---|---|---|
| Tap / place item | Soft wooden "tok" | Each item tap or drop |
| Count aloud | Chef Kiki's voice, warm and paced | Counting sequence |
| Correct | Single gentle chime + chef voice | Puzzle solved |
| Hint | Soft questioning tone (no buzz, no wrong sound) | Wrong answer |
| Session end | Soft 3-note melody, "dinner bell" | Session complete |
| Stage unlock | Warm ascending 3 notes | New stage available |

**Voice:** Web Speech API. Settings: rate 0.8, pitch 1.05, volume 0.9. Use the most natural voice available (`en-US` with `Google UK English Female` or similar warm voice if available).

**Speech role:** Speech is support, not the primary gameplay channel. Every stage must remain understandable through objects, layout, character expression, and visual feedback even if the spoken line is ignored or unavailable.

**No:** buzzer sounds, countdown ticks, "WRONG!" tones, hypnotic loop music.

---

## Parent View

A simple, read-only screen accessible only from the home screen (small key icon, long-press or tap 3 times — hidden from child).

Shows:
- Current stage
- Sessions this week
- Last played date

Does NOT show: scores, streaks, rankings, or anything designed to drive engagement. Parent view is for awareness, not optimization.

---

## Responsive / Touch

- Min touch target: 72×72px for all interactive elements
- No hover-only states — all interactions are tap/drag
- Tested at: iPad mini (768×1024), iPad Air (820×1180) in portrait
- Font sizes never below 20px
- No pinch/zoom needed — layout fills the viewport cleanly

---

## What to Avoid

| Pattern | Why |
|---|---|
| Red for wrong answers | Creates anxiety, shame association |
| Stars / point counters visible | Shifts focus to score, not learning |
| Countdown timers | Anxiety, antithetical to the pedagogy |
| Neon / highly saturated colors | Overstimulating, cheap feel |
| Busy backgrounds | Competes with the interactive elements |
| Pop-up rewards mid-puzzle | Interrupts flow, trains for rewards not learning |
| "AMAZING!!!" text | Hollow praise, LLM energy — use warm, specific praise instead |
