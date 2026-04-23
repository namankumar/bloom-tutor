# Bloom Tutor: Daily AI Tutor System

**Child:** [Your child's name], [age]
**Format:** 30 min/day after school, 5 days/week, Claude as voice tutor ("Sage")
**Device:** Mac/laptop, Claude desktop app, voice mode

---

## What This Is

Benjamin Bloom's 1984 finding showed 1-on-1 tutoring puts children 2 standard deviations ahead of classroom peers — the 98th percentile. Every child would benefit. Almost none get it. AI makes it possible now, for free, every day.

The 30 minutes aren't the point. The compounding over years is. A child who enters 2nd grade reading fluently, emotionally regulated, and genuinely curious about math has a different trajectory. Ages 4-8 is the most plastic period for language, number sense, and emotional regulation patterns. What gets built here runs everything else.

---

## Child Profile

Fill this in before your first session. The more specific you are, the better Sage performs.

- **Name:** [Child's name], [age] years old
- **Reading level:** [e.g. reads CVC words, beginning blends, simple sentences]
- **Interests:** [e.g. animals, dinosaurs, space, drawing, superheroes]
- **Family context:** [e.g. bilingual household, grandparents' names, family foods, cultural traditions]

**Curriculum principle:** Your child's world is not background. It's the primary texture. Stories should feature their grandparents by name. Math word problems should use foods they know. Science experiments should connect to things in their home. This makes learning faster (familiar context reduces cognitive load) and makes sessions feel like their world, not school.

**Example:** A child with an Indian dad and Persian mom might have stories featuring Dadi and Maman joon, math problems with pomegranates and samosas, and vocabulary that weaves in Hindi or Farsi words naturally. Whatever your child's world looks like — use it constantly.

---

## The System Architecture

Three layers:

| Layer | What it is | Where it lives |
|---|---|---|
| **Sage** | Claude voice tutor. Runs daily 30-min sessions. Remembers everything. | `sage-prompt.md` |
| **Number Kitchen** | Interactive math game. Visual, tactile learning for all 12 math phases. | `math-curriculum.md` |
| **Session Log** | Persistent memory across sessions. Tracks all concepts, words, moments. | `session-log.md` |

**How they connect:** Sage runs the session. On Tuesday (Math day), Sage may prompt the child to play Number Kitchen for a specific stage as their Block 2 activity. The game and the tutor reinforce each other. The session log tracks what game stages they're on alongside what Sage introduced.

---

## Daily Session Structure (25-30 min)

| Part | Duration | What happens |
|---|---|---|
| **Opening ritual** | 2 min | "Hey [Child], it's Sage! How's your heart today — sunny, cloudy, or stormy?" Same every day. |
| **Block 1** | 8 min | Main activity: game, story, puzzle, or experiment |
| **Movement break** | 2 min | Sage calls it: "Jump 5 times, spin 3, then come back" |
| **Block 2** | 10 min | Extends or contrasts Block 1 |
| **Closing ritual** | 3-5 min | "Magic Three" (3 things they learned/did). Specific celebration. Parent handoff line. |

**30 min is the ceiling, not the target.** Sage never pushes. Creates natural "want more?" moments: "I have one more thing — it's really good. Want to hear it? Two minutes."

---

## Weekly Rotation

| Day | Domain |
|---|---|
| Monday | Language & Literacy |
| Tuesday | Math & Logic |
| Wednesday | Science & Curiosity |
| Thursday | Social-Emotional Learning |
| Friday | Creative + Full-Week Review |

---

## Domain Curricula

### Monday — Language & Literacy

**Calibrate to your child's current level before starting.** The sequence below assumes a child who already reads simple CVC words (cat, dog, sun). Adjust the starting point to match where your child is.

**Phonics sequence (Months 1-3):** Blends (bl, cr, st, sp, cl, tr) → Digraphs (sh, ch, th, wh) → Long vowel patterns
**Sight words:** 3 new Dolch/Fry words per session, embedded in stories (never drilled in lists)
**Comprehension:** 4-5 min stories using your child's family context, with pause points, prediction, and retelling
**Vocabulary:** 2 new words per session + one heritage language concept woven into the story (if applicable)
**Writing (voice-adapted):** Spell aloud, trace on knee, dictate sentences, "correct" Claude's retelling

*Research basis: Castles, Rastle & Nation (2018), "Ending the Reading Wars." Systematic phonics for decoding + meaning-based comprehension work = both required.*

---

### Tuesday — Math & Logic

**Detailed spec lives in `math-curriculum.md`.** That is the authoritative source — 12 phases across 2 years, mastery criteria per phase, daily activity sequences, and pedagogical rationale. This section summarizes how Sage plugs into it.

**Sage's role on Tuesdays:** Voice layer on top of the game. Sage runs Block 1 as a verbal warm-up (math story using foods and objects from the child's world, count objects in the room, visualization, patterns with claps). Block 2 = child plays Number Kitchen at their current phase stage. Sage debriefs afterward: "What happened? What did Chef Kiki need?"

**Phase map (Year 1, ages 5-6):**

| Phase | Concept | Number Kitchen Stage | Timeline |
|---|---|---|---|
| 1 | Subitizing & counting to 10 | Stage 1: Dot Flash | Weeks 1-4 |
| 2 | Ten-frames & numbers to 20 | Stage 3: Ten-frame placement | Weeks 5-8 |
| 3 | Number bonds to 10 | Stage 4: Missing ingredient bonds | Weeks 9-12 |
| 4 | Addition & subtraction to 20 | Stage 5: Combining bowls | Weeks 13-18 |
| 5 | Place value & counting to 100 | Stage 6: Cartons of 10 + loose | Weeks 19-24 |
| 6 | Skip counting | Built into Stage 7 | Weeks 25-28 |
| 7 | Multiplication as "groups of" | Stage 7: Equal plates | Weeks 29-36 |

Year 2 (phases 8-12: multi-digit operations, multiplication fluency, division, fractions, measurement) is fully specced in `math-curriculum.md`.

**Key design rules learned from building the game** (apply to Sage sessions too, not just the UI):
- Recognition before recall — keep answers visually supported before fading scaffolding
- Don't accidentally test working memory when testing math
- One new abstraction at a time — never combine a new concept with a new interaction pattern
- Scaffolds fade, they don't disappear — never jump from concrete to symbol in one step
- Mistakes get "Hmm, let me look again..." never a sting

*Research basis: Clements & Sarama (2021), Learning and Teaching Early Math. Jo Boaler, Mathematical Mindsets. Singapore Math CPA sequence.*

---

### Wednesday — Science & Curiosity

**Goal:** Build the habit of asking "why" and staying with a question.

**Format:**
- Block 1: Observation exercise (5 things about one object) + Sage poses a question ("Why do you think the sky is blue?"). Child hypothesizes. Sage builds on the hypothesis — never dismisses it.
- Block 2: Household experiment. Child is the experimenter; Sage is the blind lab partner ("I can't see it — describe everything to me").

**Experiment library (weeks 1-8):**
1. Ice in warm water — what happens? Why?
2. Shadow play — stand near a light, move, describe your shadow
3. Float vs. sink — 5 objects, predict then test in a bowl
4. Breath on cold mirror — what appears? Why?
5. Turmeric in water — what color? Add baking soda. What changes?
6. Paper towel capillary action — why does water climb?
7. Sound through a string phone — what is sound?
8. Magnetic / non-magnetic sorting

*Research basis: Duckworth (1987/2006), "The Having of Wonderful Ideas." Children learn science by pursuing their own hypotheses, not receiving correct answers.*

---

### Thursday — Social-Emotional Learning

**Goal:** Emotion vocabulary, self-regulation tools, empathy, growth mindset.

**Format:**
- 1 new emotion word per session (beyond happy/sad/angry): frustrated, proud, nervous, disappointed, calm, embarrassed, curious, relieved...
- "What does your body feel like when you're [word]?" — connects word to body sensation
- Empathy story: Claude tells a story with a social challenge, child says how the character feels + what they could do
- Regulation tool introduced one per month: belly breathing, 5-4-3-2-1 grounding, "shake it out," counting to 10
- Growth mindset: "I can't do it... yet." Embedded every struggle moment.
- Thursday closes with gratitude: "Name 3 things from this week you're glad happened."

*Research basis: Brackett (2019), Permission to Feel. Yale RULER approach. CASEL competency framework.*

---

### Friday — Creative + Full-Week Review

**Goal:** Reinforce through joy. Celebrate specifically.

**Format:**
- 10 min: Spaced retrieval of Monday-Thursday highlights. Claude asks; doesn't tell first.
- 15 min: Rotate between collaborative storytelling, music/rhythm, drawing + description, imaginative play ("you're an explorer who just found a new island — what do you see?")
- 3 min: Claude names 3 specific things the child did this week. Not "great job." Specific: "You figured out that /cr/ + /ab/ makes 'crab' — that was YOUR brain connecting those pieces."

---

## Sage — The Tutor

Sage is a consistent character the child builds a relationship with over time. Same opening, same closing, always knows their name, always references what they said last time.

**What Sage can do that a human tutor can't:**
- Never tired, frustrated, or distracted
- Perfect memory of every session
- Infinite patience — same warmth on session 300 as session 1
- Zero judgment — child can be wrong 10 times, Sage stays warm and specific
- Always available

**What Sage can't do:** See drawings, hold their hand, be physically present. Those stay with the family.

**Core rules (full rules in `sage-prompt.md`):**
- Ask before telling — always
- Celebrate specifically, never generically
- Movement break every 6-8 min
- One callback from last session, every session
- "Not yet" framing on every struggle
- Read session log at start, update at end

**How to start a session:**
> Open Claude desktop app, voice mode. Say:
> "You are Sage. Read the child's session log at `./session-log.md`, then start today's session."

---

## Progression Map

Calibrate based on your child's starting level:

| Phase | Duration | Literacy | Math | Science/SEL |
|---|---|---|---|---|
| Foundation | Weeks 1-4 | Blends + digraphs, 15 sight words | Number bonds to 10, patterns | Establish ritual, assess, build trust |
| Building | Months 2-3 | 40 sight words, blended word reading | Numbers to 20, early addition | 8 science questions; 4 regulation tools |
| Deepening | Months 4-6 | 80 sight words, simple sentences | Subtraction, number bonds to 20 | Independent experiments; empathy scenarios |
| Expanding | Months 7-12 | Paragraph reading, 2-3 sentence stories | Multi-step problems, skip counting, place value | Cross-cultural science; growth mindset embedded |

---

## Session Memory

After every session, Sage logs:
- Date, domain, activities run
- New concepts/words introduced
- What clicked (excited, answered unprompted)
- What needs revisiting (hesitated, got wrong)
- One specific moment from the session
- Callback to use next session
- Handoff line for parent

Every 4 weeks: Sage audits what's been covered, skipped, and stuck. Rebalances the next 4 weeks.

Full session log: `session-log.md`

---

## Research Foundations

| Method | Source | Key Finding |
|---|---|---|
| Guided play | Skene et al. (2022), Child Development — 39 studies | Outperforms direct instruction for under-8s |
| Phonics | Castles, Rastle & Nation (2018), Psych Science | Systematic phonics + comprehension work = both required |
| Early math | Clements & Sarama (2021), Learning Trajectories | CPA sequence; what 5-6 year olds are ready for |
| SEL | Brackett (2019) + Yale RULER | RECOGNIZE → UNDERSTAND → LABEL → EXPRESS → REGULATE |
| Spaced retrieval | Kang (2016), Policy Insights | Callbacks at start of each session consolidate memory |
| Growth mindset | Dweck (2006) — with caveat | Embedded "not yet" language works; standalone interventions don't |
| Attention span | Ruff & Rothbart (1996); Hillman et al. | Scaffolding extends to 10-15 min; movement breaks boost cognition |
| 1-on-1 tutoring | Bloom (1984), "2 Sigma Problem" | 1-on-1 = 98th percentile vs. classroom. AI makes it accessible. |
| Bicultural identity | Kuhl (2010), Neuron; García & Kleifgen (2018) | Heritage language connection → stronger overall language skills |
| Science inquiry | Duckworth (1987/2006) | Children learn by pursuing their own hypotheses |

---

## Folder Structure

```
bloom-tutor/
  curriculum.md         ← this doc (master overview)
  session-log.md        ← persistent learning log (create this before first session)
  sage-prompt.md        ← Sage system prompt (paste into Claude before each session)
  math-curriculum.md    ← detailed 12-phase math curriculum (Year 1 + Year 2)
```

---

## Success Signals

**Week 1:** Does the child ask "Can we do more?" or ask when the next session is? That's it.
**Month 1:** Does Claude's session log have 20+ entries with specific callbacks?
**Month 3:** Reading blended words (shop, star, crab). 15+ new vocabulary words. Counting to 20 and adding within 10.
**Month 6:** Reading a 3-4 sentence paragraph. Writing 2-sentence stories. 2-step math word problems. Naming 6+ emotions with body sensation descriptions.
**The real signal:** Does the child connect things across sessions unprompted? "Sage, remember when we talked about shadows? I noticed mine was really long today." That's when the learning is real.
