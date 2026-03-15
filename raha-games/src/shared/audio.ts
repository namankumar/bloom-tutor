import type { AudioCapabilities, AudioMode, CueId, CueVariant, SpeechPriority } from './types'

interface PlayCueOptions {
  variant?: CueVariant
  intensity?: 'low' | 'medium'
}

interface SpeakOptions {
  priority?: SpeechPriority
  interrupt?: boolean
}

interface SpeechItem {
  text: string
  priority: SpeechPriority
  onDone?: () => void
}

interface NoteEvent {
  at: number
  frequency: number
  duration: number
  gain: number
  type?: OscillatorType
  layer?: 'main' | 'warm'
}

const VOICE_RATE = 0.65
const VOICE_PITCH = 1.1
const VOICE_VOLUME = 0.96
const FOREGROUND_SPACING_MS = 180
const RAPID_CUE_WINDOW_MS = 120
const WARM_VOICE_PATTERNS = [
  /samantha/i,
  /ava/i,
  /serena/i,
  /karen/i,
  /moira/i,
  /fiona/i,
  /victoria/i,
  /google uk english female/i,
  /female/i,
]

let speechQueue: SpeechItem[] = []
let speaking = false
let audioInitialized = false
let speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
let toneSupported =
  typeof window !== 'undefined' &&
  ('AudioContext' in window || 'webkitAudioContext' in window)
let audioContext: AudioContext | null = null
let mode: AudioMode = 'silent_visual'
let lastCueAt = 0
let speechBlockedUntil = 0
let lastCueById: Partial<Record<CueId, number>> = {}
let currentUtterance: SpeechSynthesisUtterance | null = null
let speechProcessTimer: number | null = null

const PRIORITY_WEIGHT: Record<SpeechPriority, number> = {
  low: 0,
  normal: 1,
  high: 2,
}

const CUE_LIBRARY: Record<CueId, NoteEvent[][]> = {
  'ui.tap': [
    [
      { at: 0, frequency: 392, duration: 0.08, gain: 0.032, type: 'triangle' },
      { at: 0.014, frequency: 784, duration: 0.06, gain: 0.012, type: 'sine', layer: 'warm' },
    ],
    [
      { at: 0, frequency: 370, duration: 0.085, gain: 0.03, type: 'triangle' },
      { at: 0.016, frequency: 740, duration: 0.055, gain: 0.011, type: 'sine', layer: 'warm' },
    ],
    [
      { at: 0, frequency: 415, duration: 0.078, gain: 0.03, type: 'triangle' },
      { at: 0.01, frequency: 830, duration: 0.052, gain: 0.01, type: 'sine', layer: 'warm' },
    ],
  ],
  'ui.home': [
    [
      { at: 0, frequency: 349.23, duration: 0.09, gain: 0.038, type: 'triangle' },
      { at: 0.05, frequency: 440, duration: 0.12, gain: 0.032, type: 'triangle' },
      { at: 0.03, frequency: 698.46, duration: 0.09, gain: 0.012, type: 'sine', layer: 'warm' },
    ],
    [
      { at: 0, frequency: 329.63, duration: 0.09, gain: 0.038, type: 'triangle' },
      { at: 0.048, frequency: 415.3, duration: 0.12, gain: 0.032, type: 'triangle' },
      { at: 0.03, frequency: 659.26, duration: 0.09, gain: 0.012, type: 'sine', layer: 'warm' },
    ],
    [
      { at: 0, frequency: 392, duration: 0.085, gain: 0.037, type: 'triangle' },
      { at: 0.05, frequency: 493.88, duration: 0.11, gain: 0.031, type: 'triangle' },
      { at: 0.03, frequency: 784, duration: 0.08, gain: 0.011, type: 'sine', layer: 'warm' },
    ],
  ],
  'prompt.replay': [
    [
      { at: 0, frequency: 523.25, duration: 0.09, gain: 0.032, type: 'triangle' },
      { at: 0.08, frequency: 659.25, duration: 0.12, gain: 0.028, type: 'triangle' },
    ],
    [
      { at: 0, frequency: 493.88, duration: 0.09, gain: 0.032, type: 'triangle' },
      { at: 0.075, frequency: 622.25, duration: 0.12, gain: 0.028, type: 'triangle' },
    ],
    [
      { at: 0, frequency: 587.33, duration: 0.085, gain: 0.031, type: 'triangle' },
      { at: 0.08, frequency: 739.99, duration: 0.11, gain: 0.027, type: 'triangle' },
    ],
  ],
  'feedback.correct': [
    [
      { at: 0, frequency: 392, duration: 0.12, gain: 0.038, type: 'triangle' },
      { at: 0.1, frequency: 523.25, duration: 0.14, gain: 0.04, type: 'triangle' },
      { at: 0.22, frequency: 659.25, duration: 0.2, gain: 0.042, type: 'triangle' },
      { at: 0.1, frequency: 261.63, duration: 0.2, gain: 0.012, type: 'sine', layer: 'warm' },
    ],
    [
      { at: 0, frequency: 415.3, duration: 0.12, gain: 0.038, type: 'triangle' },
      { at: 0.095, frequency: 554.37, duration: 0.14, gain: 0.04, type: 'triangle' },
      { at: 0.215, frequency: 698.46, duration: 0.2, gain: 0.042, type: 'triangle' },
      { at: 0.1, frequency: 277.18, duration: 0.2, gain: 0.012, type: 'sine', layer: 'warm' },
    ],
    [
      { at: 0, frequency: 349.23, duration: 0.12, gain: 0.038, type: 'triangle' },
      { at: 0.1, frequency: 466.16, duration: 0.14, gain: 0.04, type: 'triangle' },
      { at: 0.22, frequency: 587.33, duration: 0.2, gain: 0.042, type: 'triangle' },
      { at: 0.1, frequency: 233.08, duration: 0.2, gain: 0.012, type: 'sine', layer: 'warm' },
    ],
  ],
  'feedback.retry': [
    [
      { at: 0, frequency: 493.88, duration: 0.13, gain: 0.034, type: 'triangle' },
      { at: 0.12, frequency: 415.3, duration: 0.18, gain: 0.03, type: 'triangle' },
    ],
    [
      { at: 0, frequency: 466.16, duration: 0.13, gain: 0.034, type: 'triangle' },
      { at: 0.11, frequency: 392, duration: 0.18, gain: 0.03, type: 'triangle' },
    ],
    [
      { at: 0, frequency: 523.25, duration: 0.12, gain: 0.034, type: 'triangle' },
      { at: 0.11, frequency: 440, duration: 0.18, gain: 0.03, type: 'triangle' },
    ],
  ],
  'feedback.complete': [
    [
      { at: 0, frequency: 392, duration: 0.13, gain: 0.038, type: 'triangle' },
      { at: 0.13, frequency: 523.25, duration: 0.15, gain: 0.042, type: 'triangle' },
      { at: 0.28, frequency: 659.25, duration: 0.28, gain: 0.046, type: 'triangle' },
      { at: 0.18, frequency: 261.63, duration: 0.28, gain: 0.013, type: 'sine', layer: 'warm' },
    ],
    [
      { at: 0, frequency: 349.23, duration: 0.13, gain: 0.038, type: 'triangle' },
      { at: 0.13, frequency: 466.16, duration: 0.15, gain: 0.042, type: 'triangle' },
      { at: 0.28, frequency: 587.33, duration: 0.28, gain: 0.046, type: 'triangle' },
      { at: 0.18, frequency: 233.08, duration: 0.28, gain: 0.013, type: 'sine', layer: 'warm' },
    ],
    [
      { at: 0, frequency: 415.3, duration: 0.13, gain: 0.038, type: 'triangle' },
      { at: 0.13, frequency: 554.37, duration: 0.15, gain: 0.042, type: 'triangle' },
      { at: 0.28, frequency: 698.46, duration: 0.28, gain: 0.046, type: 'triangle' },
      { at: 0.18, frequency: 277.18, duration: 0.28, gain: 0.013, type: 'sine', layer: 'warm' },
    ],
  ],
  'feedback.unlock': [
    [
      { at: 0, frequency: 392, duration: 0.11, gain: 0.04, type: 'triangle' },
      { at: 0.11, frequency: 493.88, duration: 0.13, gain: 0.044, type: 'triangle' },
      { at: 0.25, frequency: 659.25, duration: 0.24, gain: 0.048, type: 'triangle' },
    ],
    [
      { at: 0, frequency: 415.3, duration: 0.11, gain: 0.04, type: 'triangle' },
      { at: 0.11, frequency: 523.25, duration: 0.13, gain: 0.044, type: 'triangle' },
      { at: 0.25, frequency: 698.46, duration: 0.24, gain: 0.048, type: 'triangle' },
    ],
    [
      { at: 0, frequency: 349.23, duration: 0.11, gain: 0.04, type: 'triangle' },
      { at: 0.11, frequency: 440, duration: 0.13, gain: 0.044, type: 'triangle' },
      { at: 0.25, frequency: 587.33, duration: 0.24, gain: 0.048, type: 'triangle' },
    ],
  ],
  'count.tick': [
    [{ at: 0, frequency: 523.25, duration: 0.06, gain: 0.018, type: 'sine' }],
    [{ at: 0, frequency: 493.88, duration: 0.06, gain: 0.018, type: 'sine' }],
    [{ at: 0, frequency: 587.33, duration: 0.055, gain: 0.017, type: 'sine' }],
  ],
  'count.finish': [
    [
      { at: 0, frequency: 493.88, duration: 0.08, gain: 0.024, type: 'triangle' },
      { at: 0.08, frequency: 587.33, duration: 0.12, gain: 0.026, type: 'triangle' },
    ],
    [
      { at: 0, frequency: 466.16, duration: 0.08, gain: 0.024, type: 'triangle' },
      { at: 0.08, frequency: 554.37, duration: 0.12, gain: 0.026, type: 'triangle' },
    ],
    [
      { at: 0, frequency: 523.25, duration: 0.075, gain: 0.023, type: 'triangle' },
      { at: 0.08, frequency: 622.25, duration: 0.11, gain: 0.025, type: 'triangle' },
    ],
  ],
}

function getAudioCtor() {
  if (typeof window === 'undefined') return null
  return window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ?? null
}

function computeMode(capabilities: AudioCapabilities): AudioMode {
  if (capabilities.speechSupported && capabilities.toneSupported && capabilities.initialized) return 'full'
  if (capabilities.speechSupported && capabilities.initialized) return 'speech_only'
  if (capabilities.toneSupported && capabilities.initialized) return 'tones_only'
  return 'silent_visual'
}

function refreshSupport() {
  speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
  toneSupported = typeof window !== 'undefined' && Boolean(getAudioCtor())
  mode = computeMode(getAudioCapabilities())
}

function getPreferredVoice() {
  if (!speechSupported) return null
  const voices = window.speechSynthesis.getVoices()

  const scored = voices
    .map((voice) => {
      let score = 0

      if (voice.lang.startsWith('en-US')) score += 5
      else if (voice.lang.startsWith('en-GB')) score += 4
      else if (voice.lang.startsWith('en')) score += 2

      if (/premium|enhanced|natural/i.test(voice.name)) score += 3
      if (WARM_VOICE_PATTERNS.some((pattern) => pattern.test(voice.name))) score += 6
      if (/zira|david|microsoft/i.test(voice.name)) score -= 2

      return { voice, score }
    })
    .sort((a, b) => b.score - a.score)

  return scored[0]?.voice ?? null
}

function softenSpeechText(text: string) {
  return text
    .replace(/!/g, '.')
    .replace(/\s+/g, ' ')
    .trim()
}

function clearSpeechTimer() {
  if (speechProcessTimer !== null) {
    window.clearTimeout(speechProcessTimer)
    speechProcessTimer = null
  }
}

function scheduleSpeechProcessing(delay = 0) {
  if (!speechSupported || speechProcessTimer !== null) return
  speechProcessTimer = window.setTimeout(() => {
    speechProcessTimer = null
    processSpeechQueue()
  }, delay)
}

function processSpeechQueue() {
  if (!speechSupported || speaking || speechQueue.length === 0 || mode === 'tones_only' || mode === 'silent_visual') {
    return
  }

  const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
  if (now < speechBlockedUntil) {
    scheduleSpeechProcessing(Math.max(0, speechBlockedUntil - now))
    return
  }

  const next = speechQueue.shift()
  if (!next) return

  const utterance = new SpeechSynthesisUtterance(softenSpeechText(next.text))
  utterance.rate = VOICE_RATE
  utterance.pitch = VOICE_PITCH
  utterance.volume = VOICE_VOLUME
  const preferred = getPreferredVoice()
  if (preferred) {
    utterance.voice = preferred
  }

  speaking = true
  currentUtterance = utterance
  utterance.onend = () => {
    speaking = false
    currentUtterance = null
    next.onDone?.()
    processSpeechQueue()
  }
  utterance.onerror = () => {
    speaking = false
    currentUtterance = null
    next.onDone?.()
    processSpeechQueue()
  }
  window.speechSynthesis.speak(utterance)
}

function clampVariant(variant?: number): CueVariant | undefined {
  if (variant === undefined) return undefined
  if (variant <= 0) return 0
  if (variant >= 2) return 2
  return variant as CueVariant
}

function chooseVariant(id: CueId, variant?: CueVariant) {
  const variants = CUE_LIBRARY[id]
  if (variant !== undefined) return variants[variant]
  const choice = Math.floor(Math.random() * variants.length)
  return variants[choice]
}

function applyMicroVariation(value: number, amount: number) {
  const delta = (Math.random() * 2 - 1) * amount
  return value * (1 + delta)
}

function cueWindowMs(id: CueId) {
  if (id === 'count.tick') return 70
  if (id === 'ui.tap') return 90
  return FOREGROUND_SPACING_MS
}

function playNote(note: NoteEvent, now: number, intensity: 'low' | 'medium') {
  if (!audioContext) return

  const osc = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  const highShelf = audioContext.createBiquadFilter()
  highShelf.type = 'lowpass'
  highShelf.frequency.setValueAtTime(note.layer === 'warm' ? 1800 : 2200, now)
  highShelf.Q.setValueAtTime(0.6, now)

  osc.type = note.type ?? 'triangle'
  osc.frequency.setValueAtTime(applyMicroVariation(note.frequency, 0.012), now + note.at)

  const start = now + note.at
  const duration = applyMicroVariation(note.duration, 0.1)
  const targetGain = applyMicroVariation(note.gain, 0.1) * (intensity === 'low' ? 0.82 : 1)

  gainNode.gain.setValueAtTime(0.0001, start)
  gainNode.gain.linearRampToValueAtTime(targetGain, start + 0.02)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  osc.connect(highShelf)
  highShelf.connect(gainNode)
  gainNode.connect(audioContext.destination)

  osc.start(start)
  osc.stop(start + duration + 0.02)
}

export function initAudio() {
  refreshSupport()
  if (!speechSupported) return
  const synth = window.speechSynthesis
  synth.getVoices()
  synth.onvoiceschanged = () => synth.getVoices()
}

export async function primeAudio() {
  refreshSupport()
  audioInitialized = true

  if (toneSupported && !audioContext) {
    const AudioCtor = getAudioCtor()
    if (AudioCtor) {
      audioContext = new AudioCtor()
    }
  }

  if (audioContext?.state === 'suspended') {
    await audioContext.resume()
  }

  mode = computeMode(getAudioCapabilities())
}

export function playCue(id: CueId, options: PlayCueOptions = {}) {
  refreshSupport()
  if (!audioInitialized || (mode !== 'full' && mode !== 'tones_only' && mode !== 'speech_only')) return
  if (mode === 'speech_only' || !audioContext) return

  const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now()
  const windowMs = cueWindowMs(id)
  const lastForCue = lastCueById[id] ?? 0
  if (nowMs - lastForCue < RAPID_CUE_WINDOW_MS && id !== 'feedback.correct' && id !== 'feedback.complete') {
    return
  }
  if (nowMs - lastCueAt < windowMs && id !== 'count.tick') {
    return
  }

  const variant = chooseVariant(id, clampVariant(options.variant))
  const audioNow = audioContext.currentTime + 0.005
  const intensity = options.intensity ?? 'medium'
  variant.forEach((note) => playNote(note, audioNow, intensity))

  const cueDuration = variant.reduce((max, note) => Math.max(max, note.at + note.duration), 0)
  lastCueAt = nowMs
  lastCueById[id] = nowMs
  speechBlockedUntil = Math.max(speechBlockedUntil, nowMs + cueDuration * 1000 + 160)
  scheduleSpeechProcessing(Math.max(0, speechBlockedUntil - nowMs))
}

export function speakAsync(text: string, options: SpeakOptions = {}): Promise<void> {
  return new Promise((resolve) => {
    refreshSupport()
    if (!audioInitialized || !speechSupported || mode === 'tones_only' || mode === 'silent_visual') {
      resolve()
      return
    }

    const item: SpeechItem = {
      text,
      priority: options.priority ?? 'normal',
      onDone: resolve,
    }

    if (options.interrupt) {
      speechQueue = []
      if (currentUtterance) {
        window.speechSynthesis.cancel()
        currentUtterance = null
        speaking = false
      }
    }

    speechQueue.push(item)
    speechQueue.sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority])
    processSpeechQueue()
  })
}

export function speak(text: string, options: SpeakOptions = {}) {
  refreshSupport()
  if (!audioInitialized || !speechSupported || mode === 'tones_only' || mode === 'silent_visual') return

  const item: SpeechItem = {
    text,
    priority: options.priority ?? 'normal',
  }

  if (options.interrupt) {
    speechQueue = []
    if (currentUtterance) {
      window.speechSynthesis.cancel()
      currentUtterance = null
      speaking = false
    }
  }

  speechQueue.push(item)
  speechQueue.sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority])
  processSpeechQueue()
}

export function stopAllAudio() {
  speechQueue = []
  speaking = false
  currentUtterance = null
  lastCueAt = 0
  lastCueById = {}
  speechBlockedUntil = 0
  clearSpeechTimer()
  if (speechSupported) {
    window.speechSynthesis.cancel()
  }
}

export function cancelSpeech() {
  stopAllAudio()
}

export function getAudioCapabilities(): AudioCapabilities {
  return {
    speechSupported,
    toneSupported,
    initialized: audioInitialized,
  }
}

export function getAudioState() {
  refreshSupport()
  return {
    ...getAudioCapabilities(),
    mode,
  }
}

export function setSpeechSupportedForTest(value: boolean) {
  speechSupported = value
  mode = computeMode(getAudioCapabilities())
}
