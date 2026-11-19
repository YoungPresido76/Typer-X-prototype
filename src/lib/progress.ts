export const MAX_LEVEL = 99;
export const DAILY_GOAL_WORDS = 2000;
export const COMBO_WINDOW_MS = 1500;

export function xpToNext(level: number): number {
  return Math.max(100, Math.round(2000 * Math.pow(level / 18, 3.9)));
}

export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l += 1) {
    total += xpToNext(l);
  }
  return total;
}

export function levelFromTotalXp(totalXp: number): number {
  let level = 1;
  let remaining = totalXp;
  while (level < MAX_LEVEL && remaining >= xpToNext(level)) {
    remaining -= xpToNext(level);
    level += 1;
  }
  return level;
}

export interface LevelProgress {
  level: number;
  current: number;
  needed: number;
  pct: number;
}

export function getLevelProgress(totalXp: number): LevelProgress {
  const level = levelFromTotalXp(totalXp);
  const needed = xpToNext(level);
  const current = level >= MAX_LEVEL ? needed : totalXp - totalXpForLevel(level);
  const pct = Math.max(0, Math.min(100, (current / needed) * 100));
  return { level, current, needed, pct };
}

export interface RankBand {
  name: string;
  from: number;
  to: number;
}

export const RANK_BANDS: readonly RankBand[] = [
  { name: 'Novice', from: 1, to: 5 },
  { name: 'Initiate', from: 6, to: 10 },
  { name: 'Apprentice', from: 11, to: 20 },
  { name: 'Adept', from: 21, to: 30 },
  { name: 'Expert', from: 31, to: 40 },
  { name: 'Master', from: 41, to: 50 },
  { name: 'Legend', from: 51, to: MAX_LEVEL },
];

const ROMAN: readonly string[] = ['I', 'II', 'III'];

export interface RankInfo {
  band: RankBand;
  bandIndex: number;
  tier: string;
  label: string;
}

export function getRank(level: number): RankInfo {
  let bandIndex = RANK_BANDS.findIndex((b) => level >= b.from && level <= b.to);
  if (bandIndex < 0) {
    bandIndex = RANK_BANDS.length - 1;
  }
  const band = RANK_BANDS[bandIndex];
  const size = band.to - band.from + 1;
  const idx = Math.min(2, Math.floor(((level - band.from) * 3) / size));
  const tier = ROMAN[idx];
  return { band, bandIndex, tier, label: `${band.name} ${tier}` };
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`;
  }
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}K`;
  }
  return String(Math.round(n));
}
