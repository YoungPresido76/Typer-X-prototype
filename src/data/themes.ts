import type { CssVars, Rarity, SkillId, ThemeId } from '../types/game';

export interface ThemeArtPalette {
  sky: readonly [string, string, string];
  ridge: string;
  crack: string;
  glow: string;
}

export interface ThemeDef {
  id: ThemeId;
  name: string;
  rarity: Rarity;
  requires: SkillId | null;
  vars: {
    accent: string;
    accent2: string;
    bg: string;
    card: string;
    key: string;
    line: string;
  };
  art: ThemeArtPalette;
}

export const THEMES: readonly ThemeDef[] = [
  {
    id: 'obsidian-ember',
    name: 'Obsidian Ember',
    rarity: 'Legendary',
    requires: null,
    vars: { accent: '255 138 30', accent2: '255 196 92', bg: '10 8 8', card: '22 18 17', key: '36 31 31', line: '92 56 26' },
    art: { sky: ['#1a0a06', '#3a1408', '#ff7a1a'], ridge: '#0b0605', crack: '#ff9a2e', glow: '#ff6a00' },
  },
  {
    id: 'neon-circuit',
    name: 'Neon Circuit',
    rarity: 'Epic',
    requires: 'themes',
    vars: { accent: '34 211 255', accent2: '120 255 226', bg: '6 9 12', card: '13 20 26', key: '24 34 42', line: '24 84 104' },
    art: { sky: ['#04121a', '#06303f', '#19d3ff'], ridge: '#030a0e', crack: '#5ff0ff', glow: '#00b8ff' },
  },
  {
    id: 'frost-glass',
    name: 'Frost Glass',
    rarity: 'Rare',
    requires: 'themes',
    vars: { accent: '147 197 253', accent2: '224 242 254', bg: '8 11 16', card: '17 23 32', key: '30 40 54', line: '60 84 120' },
    art: { sky: ['#0b1424', '#1e3a5f', '#9fd0ff'], ridge: '#08101c', crack: '#d6ecff', glow: '#7ab8ff' },
  },
  {
    id: 'void-violet',
    name: 'Void Violet',
    rarity: 'Epic',
    requires: 'themes',
    vars: { accent: '167 110 255', accent2: '224 180 255', bg: '9 6 14', card: '19 14 30', key: '33 26 50', line: '84 56 130' },
    art: { sky: ['#0c0618', '#2a0f55', '#a96bff'], ridge: '#07030f', crack: '#d2a8ff', glow: '#8a4dff' },
  },
  {
    id: 'mythic-gold',
    name: 'Mythic Gold',
    rarity: 'Legendary',
    requires: 'legend',
    vars: { accent: '255 196 40', accent2: '255 232 140', bg: '11 9 4', card: '24 20 10', key: '38 33 20', line: '112 88 28' },
    art: { sky: ['#120d02', '#3d2c06', '#ffc83c'], ridge: '#080601', crack: '#ffe08a', glow: '#ffb800' },
  },
];

export const DEFAULT_THEME_ID: ThemeId = 'obsidian-ember';

export function getTheme(id: ThemeId): ThemeDef {
  const found = THEMES.find((t) => t.id === id);
  return found ?? THEMES[0];
}

export function themeVars(id: ThemeId, keyFont: string): CssVars {
  const t = getTheme(id).vars;
  return {
    '--accent': t.accent,
    '--accent-2': t.accent2,
    '--bg': t.bg,
    '--card': t.card,
    '--key': t.key,
    '--line': t.line,
    '--key-font': keyFont,
  };
}

export const RARITY_STYLE: Record<Rarity, string> = {
  Common: 'text-zinc-300 border-zinc-400/30 bg-zinc-400/10',
  Rare: 'text-sky-300 border-sky-400/40 bg-sky-400/10',
  Epic: 'text-violet-300 border-violet-400/40 bg-violet-400/10',
  Legendary: 'text-amber-300 border-amber-400/40 bg-amber-400/10',
};
