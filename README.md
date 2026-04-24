# bloom-tutor

Benjamin Bloom's 1984 finding: 1-on-1 tutoring puts children 2 standard deviations ahead of classroom peers, at the 98th percentile. Every child would benefit. Almost none get it.

AI makes it possible now, for free, every day.

This is a daily tutoring system built on Claude voice mode. 30 minutes after school, five days a week. Sage, the tutor, reads a persistent session log before each session, runs a structured curriculum, and updates the log when done. Every session picks up exactly where the last one left off.

## What's in here

```
curriculum.md        ← the full system design (start here)
sage-prompt.md       ← paste this into Claude before each session
session-log.md       ← persistent memory across sessions (create before first session)
raha-games/          ← Number Kitchen: an interactive math game for the 12-phase curriculum
```

## How to use it

**1. Fill in the child profile.** Open `sage-prompt.md` and replace every `[bracket]` with your child's details: name, age, reading level, interests, family context. The more specific, the better Sage performs.

**2. Create your session log.** Copy `session-log.md`, fill in the profile section, clear the example entries.

**3. Start a session.** Open Claude desktop app. Enable voice mode. Say:

> "You are Sage. Read the session log at `./session-log.md`, then start today's session."

**4. End a session.** Say:

> "Update the session log with today's session."

That's it. Sage handles the rest.

## The curriculum

Five-day weekly rotation:

| Day       | Domain                               |
| --------- | ------------------------------------ |
| Monday    | Language & Literacy                  |
| Tuesday   | Math & Logic (+ Number Kitchen game) |
| Wednesday | Science & Curiosity                  |
| Thursday  | Social-Emotional Learning            |
| Friday    | Creative + Full-Week Review          |

Full curriculum with research basis, progression map, and success signals is in `curriculum.md`.

## The key design decisions

**Voice over text.** We chose voice over text because Bloom's effect comes from dialogue. The back-and-forth catches confusion in real time. Text chat flattens a session into a transcript. Voice preserves the rhythm of tutoring. Five days because Bloom's effect is cumulative. One session doesn't move the needle.

**Session log as memory.** Claude has no memory across conversations by default. The session log is what creates continuity. Sage reads it at the start of every session, logs what happened at the end. The child builds a relationship with a tutor who actually remembers them.

**Familiar context accelerates learning.** Stories, math problems, and science experiments use the child's own world: family names, foods, languages. Familiar context reduces cognitive load. The child isn't parsing an unfamiliar setting while also learning a new concept.

**30 minutes is the ceiling, not the target.** Sage creates natural "want more?" moments but never pushes. The session ends when the child is still wanting more, not when they're done.

**Celebrate specifically, never generically.** "Great job" is noise. "You figured out that /cr/ + /ab/ makes 'crab'. That was your brain connecting those pieces" is signal the child can remember and repeat.

## Forking for your child

Everything in `sage-prompt.md` is a template. Replace:

- `[Child's name]` with their name
- `[age]` with their age
- `[Reading level]` with where they actually are
- `[interests]` with what they love
- `[Family context]` with their grandparents' names, family foods, languages, whatever is their world

The curriculum in `curriculum.md` assumes a 5-year-old who reads CVC words. Adjust the starting points in each domain to match your child's level.
