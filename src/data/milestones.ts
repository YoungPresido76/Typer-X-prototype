import type { GameState, IconName } from '../types/game';
import { getLevelProgress } from '../lib/progress';

export interface MilestoneDef {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  target: number;
  value: (state: GameState) => number;
}

function level(state: GameState): number {
  return getLevelProgress(state.totalXp).level;
}

const WORDS: ReadonlyArray<number> = [100, 500, 1000, 5000, 10000, 25000];
const LEVELS: ReadonlyArray<number> = [5, 10, 15, 20, 30, 50];
const STREAKS: ReadonlyArray<number> = [3, 7, 14, 30];
const XPS: ReadonlyArray<number> = [1000, 5000, 10000, 25000];
const COMBOS: ReadonlyArray<number> = [25, 50, 100];

function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

export const MILESTONES: readonly MilestoneDef[] = [
  ...WORDS.map<MilestoneDef>((t) => ({
    id: `words-${t}`,
    title: `${fmt(t)} Words`,
    description: `Type ${fmt(t)} words in total`,
    icon: 'doc',
    target: t,
    value: (s) => s.lifetimeWords,
  })),
  ...LEVELS.map<MilestoneDef>((t) => ({
    id: `level-${t}`,
    title: `Level ${t}`,
    description: `Reach typing level ${t}`,
    icon: 'star',
    target: t,
    value: (s) => level(s),
  })),
  ...STREAKS.map<MilestoneDef>((t) => ({
    id: `streak-${t}`,
    title: `${t}-Day Streak`,
    description: `Type ${t} days in a row`,
    icon: 'flame',
    target: t,
    value: (s) => s.streak,
  })),
  ...XPS.map<MilestoneDef>((t) => ({
    id: `xp-${t}`,
    title: `${fmt(t)} XP`,
    description: `Earn ${fmt(t)} total XP`,
    icon: 'bolt',
    target: t,
    value: (s) => s.totalXp,
  })),
  ...COMBOS.map<MilestoneDef>((t) => ({
    id: `combo-${t}`,
    title: `${t}x Combo`,
    description: `Chain a ${t}-key combo`,
    icon: 'target',
    target: t,
    value: (s) => s.maxCombo,
  })),
];

export function countAchieved(state: GameState): number {
  return MILESTONES.filter((m) => m.value(state) >= m.target).length;
}
