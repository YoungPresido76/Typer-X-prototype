import type { CSSProperties } from 'react';

export type ScreenId = 'keyboard' | 'command' | 'progression' | 'lab';

export type IconName =
  | 'back'
  | 'chevron'
  | 'send'
  | 'paperclip'
  | 'phone'
  | 'video'
  | 'more'
  | 'smile'
  | 'clipboard'
  | 'mic'
  | 'translate'
  | 'grid'
  | 'keyboard'
  | 'shirt'
  | 'briefcase'
  | 'chart'
  | 'gear'
  | 'home'
  | 'star'
  | 'menu'
  | 'flame'
  | 'bolt'
  | 'trophy'
  | 'doc'
  | 'target'
  | 'lock'
  | 'check'
  | 'palette'
  | 'sparkles'
  | 'image'
  | 'volume'
  | 'mute'
  | 'diamond'
  | 'shift'
  | 'backspace'
  | 'enter'
  | 'square'
  | 'crown'
  | 'close'
  | 'reset'
  | 'arrowUp'
  | 'arrowDown';

export type ThemeId = 'obsidian-ember' | 'neon-circuit' | 'frost-glass' | 'void-violet' | 'mythic-gold';
export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type KeyShape = 'rounded' | 'square' | 'chamfer';
export type KeyEffect = 'none' | 'pulse' | 'spark' | 'ripple' | 'burst';
export type SoundPackId = 'click' | 'epic-click' | 'soft' | 'arcade';
export type FontId = 'orbitron' | 'inter' | 'mono';
export type SkillId =
  | 'legend'
  | 'key-effects'
  | 'sound-packs'
  | 'themes'
  | 'advanced-layouts'
  | 'dynamic-backgrounds'
  | 'special-animations';

export type KeyAction =
  | { kind: 'char'; char: string }
  | { kind: 'space' }
  | { kind: 'enter' }
  | { kind: 'backspace' };

export type CssVars = CSSProperties & Record<`--${string}`, string>;

export interface Settings {
  theme: ThemeId;
  keyShape: KeyShape;
  keyEffect: KeyEffect;
  sound: SoundPackId;
  font: FontId;
  soundEnabled: boolean;
}

export interface ChatMessage {
  id: number;
  from: 'me' | 'them';
  text: string;
  at: number;
}

export interface Notice {
  id: number;
  title: string;
  body: string;
}

export interface RecentUnlock {
  label: string;
  at: number;
}

export interface GameState {
  totalXp: number;
  sessionXp: number;
  wordsToday: number;
  weekWords: number;
  lastWeekWords: number;
  lifetimeWords: number;
  streak: number;
  combo: number;
  maxCombo: number;
  lastKeyAt: number;
  dayKey: string;
  weekKey: string;
  draft: string;
  messages: ChatMessage[];
  nextMessageId: number;
  skills: Record<SkillId, boolean>;
  skillPoints: number;
  recentUnlock: RecentUnlock;
  notice: Notice | null;
  noticeSeq: number;
  settings: Settings;
}

export type PersistedState = Omit<GameState, 'sessionXp' | 'combo' | 'lastKeyAt' | 'notice'>;

export type GameAction =
  | { type: 'KEY'; action: KeyAction; now: number; day: string; week: string }
  | { type: 'INSERT_TEXT'; text: string }
  | { type: 'RECEIVE_MESSAGE'; text: string; now: number }
  | { type: 'GRANT_XP'; amount: number }
  | { type: 'UNLOCK_SKILL'; skillId: SkillId; now: number }
  | { type: 'UPDATE_SETTINGS'; patch: Partial<Settings> }
  | { type: 'DISMISS_NOTICE'; id: number }
  | { type: 'RESET'; now: number; day: string; week: string };
