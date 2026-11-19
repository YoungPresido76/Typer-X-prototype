import type {
  ChatMessage,
  FontId,
  GameState,
  KeyEffect,
  KeyShape,
  PersistedState,
  Settings,
  SkillId,
  SoundPackId,
  ThemeId,
} from '../types/game';
import { FONTS, EFFECTS, KEY_SHAPES, SOUNDS, sanitizeSettings } from '../data/options';
import { THEMES } from '../data/themes';
import { createInitialState, EMPTY_SKILLS, MAX_DRAFT, MAX_MESSAGES } from './reducer';

const STORAGE_KEY = 'typer-x:v1';
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : fallback;
}

function oneOf<T extends string>(v: unknown, list: ReadonlyArray<{ id: T }>, fallback: T): T {
  const found = list.find((item) => item.id === v);
  return found ? found.id : fallback;
}

function parseMessages(v: unknown, fallback: ChatMessage[]): ChatMessage[] {
  if (!Array.isArray(v)) {
    return fallback;
  }
  const out: ChatMessage[] = [];
  for (const item of v as unknown[]) {
    if (!isRecord(item)) {
      continue;
    }
    const from = item.from;
    const text = item.text;
    if ((from !== 'me' && from !== 'them') || typeof text !== 'string') {
      continue;
    }
    out.push({ id: num(item.id, out.length + 1), from, text: text.slice(0, MAX_DRAFT), at: num(item.at, 0) });
  }
  return out.length > 0 ? out.slice(-MAX_MESSAGES) : fallback;
}

function parseSkills(v: unknown, fallback: Record<SkillId, boolean>): Record<SkillId, boolean> {
  if (!isRecord(v)) {
    return fallback;
  }
  const out: Record<SkillId, boolean> = { ...EMPTY_SKILLS };
  (Object.keys(EMPTY_SKILLS) as SkillId[]).forEach((id) => {
    out[id] = typeof v[id] === 'boolean' ? (v[id] as boolean) : fallback[id];
  });
  return out;
}

function parseSettings(v: unknown, fallback: Settings, skills: Record<SkillId, boolean>): Settings {
  if (!isRecord(v)) {
    return fallback;
  }
  const theme: ThemeId = oneOf(v.theme, THEMES, fallback.theme);
  const keyShape: KeyShape = oneOf(v.keyShape, KEY_SHAPES, fallback.keyShape);
  const keyEffect: KeyEffect = oneOf(v.keyEffect, EFFECTS, fallback.keyEffect);
  const sound: SoundPackId = oneOf(v.sound, SOUNDS, fallback.sound);
  const font: FontId = oneOf(v.font, FONTS, fallback.font);
  const soundEnabled = typeof v.soundEnabled === 'boolean' ? v.soundEnabled : fallback.soundEnabled;
  return sanitizeSettings({ theme, keyShape, keyEffect, sound, font, soundEnabled }, skills);
}

export function loadState(now: number): GameState {
  const base = createInitialState(now);
  if (typeof window === 'undefined') {
    return base;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return base;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) {
      return base;
    }
    const skills = parseSkills(parsed.skills, base.skills);
    const recent = isRecord(parsed.recentUnlock) ? parsed.recentUnlock : null;
    const recentLabel = recent !== null && typeof recent.label === 'string' ? recent.label : null;
    return {
      ...base,
      totalXp: num(parsed.totalXp, base.totalXp),
      wordsToday: num(parsed.wordsToday, base.wordsToday),
      weekWords: num(parsed.weekWords, base.weekWords),
      lastWeekWords: num(parsed.lastWeekWords, base.lastWeekWords),
      lifetimeWords: num(parsed.lifetimeWords, base.lifetimeWords),
      streak: num(parsed.streak, base.streak),
      maxCombo: num(parsed.maxCombo, base.maxCombo),
      dayKey: typeof parsed.dayKey === 'string' && DAY_PATTERN.test(parsed.dayKey) ? parsed.dayKey : base.dayKey,
      weekKey: typeof parsed.weekKey === 'string' && DAY_PATTERN.test(parsed.weekKey) ? parsed.weekKey : base.weekKey,
      draft: typeof parsed.draft === 'string' ? parsed.draft.slice(0, MAX_DRAFT) : base.draft,
      messages: parseMessages(parsed.messages, base.messages),
      nextMessageId: num(parsed.nextMessageId, base.nextMessageId),
      skills,
      skillPoints: num(parsed.skillPoints, base.skillPoints),
      recentUnlock:
        recent !== null && recentLabel !== null
          ? { label: recentLabel, at: num(recent.at, base.recentUnlock.at) }
          : base.recentUnlock,
      noticeSeq: num(parsed.noticeSeq, 0),
      settings: parseSettings(parsed.settings, base.settings, skills),
    };
  } catch {
    return base;
  }
}

export function saveState(state: GameState): void {
  if (typeof window === 'undefined') {
    return;
  }
  const persisted: PersistedState = {
    totalXp: state.totalXp,
    wordsToday: state.wordsToday,
    weekWords: state.weekWords,
    lastWeekWords: state.lastWeekWords,
    lifetimeWords: state.lifetimeWords,
    streak: state.streak,
    maxCombo: state.maxCombo,
    dayKey: state.dayKey,
    weekKey: state.weekKey,
    draft: state.draft,
    messages: state.messages,
    nextMessageId: state.nextMessageId,
    skills: state.skills,
    skillPoints: state.skillPoints,
    recentUnlock: state.recentUnlock,
    noticeSeq: state.noticeSeq,
    settings: state.settings,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch {
    // Storage may be unavailable (private mode / quota); the app keeps working in memory.
  }
}
