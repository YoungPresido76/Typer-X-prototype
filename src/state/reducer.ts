import type { GameAction, GameState, KeyAction, SkillId } from '../types/game';
import {
  COMBO_WINDOW_MS,
  DAILY_GOAL_WORDS,
  getLevelProgress,
  getRank,
  levelFromTotalXp,
  totalXpForLevel,
} from '../lib/progress';
import { dayKey, daysBetween, weekKey } from '../lib/time';
import { SKILL_DEFS, getSkillBlocker } from '../data/skills';
import { DEFAULT_SETTINGS, sanitizeSettings } from '../data/options';

export const MAX_DRAFT = 500;
export const MAX_MESSAGES = 60;
const SEED_LEVEL = 18;
const SEED_XP_IN_LEVEL = 1368;

export const EMPTY_SKILLS: Record<SkillId, boolean> = {
  legend: false,
  'key-effects': false,
  'sound-packs': false,
  themes: false,
  'advanced-layouts': false,
  'dynamic-backgrounds': false,
  'special-animations': false,
};

export function createInitialState(now: number): GameState {
  const d = new Date(now);
  return {
    totalXp: totalXpForLevel(SEED_LEVEL) + SEED_XP_IN_LEVEL,
    sessionXp: 0,
    wordsToday: 1360,
    weekWords: 5600,
    lastWeekWords: 5000,
    lifetimeWords: 12480,
    streak: 24,
    combo: 0,
    maxCombo: 41,
    lastKeyAt: 0,
    dayKey: dayKey(d),
    weekKey: weekKey(d),
    draft: '',
    messages: [
      { id: 1, from: 'them', text: 'This keyboard is next level! 🔥', at: now - 120_000 },
      { id: 2, from: 'me', text: 'Yeah, the XP system is actually 🔥', at: now - 60_000 },
    ],
    nextMessageId: 3,
    skills: { ...EMPTY_SKILLS, 'key-effects': true, 'sound-packs': true },
    skillPoints: 2,
    recentUnlock: { label: 'Custom Key Effects', at: now - 30_000 },
    notice: null,
    noticeSeq: 0,
    settings: { ...DEFAULT_SETTINGS },
  };
}

function withNotice(state: GameState, title: string, body: string): GameState {
  const id = state.noticeSeq + 1;
  return { ...state, noticeSeq: id, notice: { id, title, body } };
}

function applyXp(state: GameState, gained: number): GameState {
  if (gained <= 0) {
    return state;
  }
  const before = levelFromTotalXp(state.totalXp);
  const totalXp = state.totalXp + gained;
  const after = levelFromTotalXp(totalXp);
  let next: GameState = { ...state, totalXp, sessionXp: state.sessionXp + gained };
  if (after > before) {
    next = { ...next, skillPoints: next.skillPoints + (after - before) };
    next = withNotice(next, 'LEVEL UP', `Level ${after} · ${getRank(after).label}`);
  }
  return next;
}

function rollover(state: GameState, day: string, week: string): GameState {
  let next = state;
  if (state.weekKey !== week) {
    const gap = daysBetween(state.weekKey, week);
    next = { ...next, lastWeekWords: gap === 7 ? state.weekWords : 0, weekWords: 0, weekKey: week };
  }
  if (state.dayKey !== day) {
    const gap = daysBetween(state.dayKey, day);
    let streak = next.streak;
    if (gap === 1) {
      streak += 1;
    } else if (gap > 1) {
      streak = 1;
    }
    next = { ...next, dayKey: day, wordsToday: 0, streak };
  }
  return next;
}

function endsWithWord(draft: string): boolean {
  return draft.length > 0 && !/\s$/.test(draft);
}

function addWord(state: GameState): GameState {
  const before = state.wordsToday;
  let next: GameState = {
    ...state,
    wordsToday: before + 1,
    weekWords: state.weekWords + 1,
    lifetimeWords: state.lifetimeWords + 1,
  };
  if (before < DAILY_GOAL_WORDS && next.wordsToday >= DAILY_GOAL_WORDS) {
    next = withNotice(next, 'DAILY GOAL', 'Goal complete · +100 XP');
    next = applyXp(next, 100);
  }
  return next;
}

function handleKey(state: GameState, key: KeyAction, now: number, day: string, week: string): GameState {
  const s = rollover(state, day, week);
  const inWindow = s.lastKeyAt > 0 && now - s.lastKeyAt <= COMBO_WINDOW_MS;

  if (key.kind === 'backspace') {
    if (s.draft.length === 0) {
      return s;
    }
    return { ...s, draft: Array.from(s.draft).slice(0, -1).join(''), lastKeyAt: now };
  }

  if (key.kind === 'enter') {
    const text = s.draft.trim();
    if (text.length === 0) {
      return { ...s, lastKeyAt: now };
    }
    const combo = inWindow ? s.combo + 1 : 1;
    let next: GameState = {
      ...s,
      draft: '',
      messages: [...s.messages, { id: s.nextMessageId, from: 'me' as const, text, at: now }].slice(-MAX_MESSAGES),
      nextMessageId: s.nextMessageId + 1,
      combo,
      maxCombo: Math.max(s.maxCombo, combo),
      lastKeyAt: now,
    };
    if (endsWithWord(s.draft)) {
      next = addWord(next);
    }
    return applyXp(next, 5);
  }

  if (s.draft.length >= MAX_DRAFT) {
    return { ...s, lastKeyAt: now };
  }
  if (key.kind === 'space' && (s.draft.length === 0 || /\s$/.test(s.draft))) {
    return { ...s, lastKeyAt: now };
  }

  const combo = inWindow ? s.combo + 1 : 1;
  const text = key.kind === 'space' ? ' ' : key.char;
  let next: GameState = {
    ...s,
    draft: s.draft + text,
    combo,
    maxCombo: Math.max(s.maxCombo, combo),
    lastKeyAt: now,
  };
  let xp = 1 + Math.min(4, Math.floor(combo / 15));
  if (key.kind === 'space' && endsWithWord(s.draft)) {
    next = addWord(next);
    xp += 2;
  }
  return applyXp(next, xp);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'KEY':
      return handleKey(state, action.action, action.now, action.day, action.week);
    case 'INSERT_TEXT': {
      const room = MAX_DRAFT - state.draft.length;
      if (room <= 0 || action.text.length === 0) {
        return state;
      }
      return { ...state, draft: state.draft + action.text.slice(0, room) };
    }
    case 'RECEIVE_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          { id: state.nextMessageId, from: 'them' as const, text: action.text, at: action.now },
        ].slice(-MAX_MESSAGES),
        nextMessageId: state.nextMessageId + 1,
      };
    case 'GRANT_XP':
      return applyXp(state, Math.max(0, Math.floor(action.amount)));
    case 'UNLOCK_SKILL': {
      const def = SKILL_DEFS[action.skillId];
      const level = getLevelProgress(state.totalXp).level;
      if (getSkillBlocker(def, state.skills, state.skillPoints, level) !== null) {
        return state;
      }
      const next: GameState = {
        ...state,
        skills: { ...state.skills, [def.id]: true },
        skillPoints: state.skillPoints - def.cost,
        recentUnlock: { label: def.name, at: action.now },
      };
      return withNotice(next, 'SKILL UNLOCKED', def.name);
    }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: sanitizeSettings({ ...state.settings, ...action.patch }, state.skills) };
    case 'DISMISS_NOTICE':
      return state.notice !== null && state.notice.id === action.id ? { ...state, notice: null } : state;
    case 'RESET':
      return createInitialState(action.now);
    default:
      return state;
  }
}
