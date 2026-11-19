import type { SoundPackId } from '../types/game';

type KeyKind = 'key' | 'space' | 'enter' | 'back';

interface PackVoice {
  type: OscillatorType;
  start: number;
  end: number;
  duration: number;
  gain: number;
  layer?: { type: OscillatorType; start: number; end: number; duration: number; gain: number };
}

const PACKS: Record<SoundPackId, PackVoice> = {
  click: { type: 'triangle', start: 1900, end: 900, duration: 0.035, gain: 0.07 },
  'epic-click': {
    type: 'sawtooth',
    start: 150,
    end: 70,
    duration: 0.09,
    gain: 0.09,
    layer: { type: 'square', start: 2400, end: 1800, duration: 0.04, gain: 0.03 },
  },
  soft: { type: 'sine', start: 560, end: 420, duration: 0.06, gain: 0.08 },
  arcade: { type: 'square', start: 880, end: 1320, duration: 0.06, gain: 0.04 },
};

const KIND_PITCH: Record<KeyKind, number> = { key: 1, space: 0.7, enter: 1.25, back: 0.85 };

type AudioCtor = typeof AudioContext;

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!ctx) {
    const w = window as unknown as { webkitAudioContext?: AudioCtor };
    const Ctor: AudioCtor | undefined = window.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) {
      return null;
    }
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
  return ctx;
}

function blip(
  audio: AudioContext,
  type: OscillatorType,
  start: number,
  end: number,
  duration: number,
  gain: number,
): void {
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(start, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, end), now + duration);
  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.exponentialRampToValueAtTime(gain, now + 0.004);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(amp);
  amp.connect(audio.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function playKeySound(pack: SoundPackId, kind: KeyKind = 'key'): void {
  const audio = getContext();
  if (!audio) {
    return;
  }
  const voice = PACKS[pack];
  const pitch = KIND_PITCH[kind];
  blip(audio, voice.type, voice.start * pitch, voice.end * pitch, voice.duration, voice.gain);
  if (voice.layer) {
    const l = voice.layer;
    blip(audio, l.type, l.start * pitch, l.end * pitch, l.duration, l.gain);
  }
}
