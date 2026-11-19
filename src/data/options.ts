import type { FontId, KeyEffect, KeyShape, Settings, SkillId, SoundPackId } from '../types/game';
import { THEMES } from './themes';

export interface Option<T extends string> {
  id: T;
  label: string;
  hint: string;
  requires: SkillId | null;
}

export const KEY_SHAPES: readonly Option<KeyShape>[] = [
  { id: 'rounded', label: 'Rounded', hint: 'Soft, modern keycaps', requires: null },
  { id: 'square', label: 'Square', hint: 'Tight, technical keycaps', requires: 'advanced-layouts' },
  { id: 'chamfer', label: 'Chamfer', hint: 'Cut-corner HUD keycaps', requires: 'advanced-layouts' },
];

export const EFFECTS: readonly Option<KeyEffect>[] = [
  { id: 'none', label: 'Off', hint: 'No keypress effect', requires: null },
  { id: 'pulse', label: 'Pulse', hint: 'Soft glow ring on every press', requires: 'key-effects' },
  { id: 'spark', label: 'Spark', hint: 'Sparks fly off each keycap', requires: 'key-effects' },
  { id: 'ripple', label: 'Ripple', hint: 'Wide energy ripple', requires: 'key-effects' },
  { id: 'burst', label: 'Burst', hint: 'Shockwave with embers', requires: 'special-animations' },
];

export const SOUNDS: readonly Option<SoundPackId>[] = [
  { id: 'click', label: 'Click', hint: 'Crisp, light click', requires: null },
  { id: 'epic-click', label: 'Epic Click', hint: 'Deep thock with a bright edge', requires: 'sound-packs' },
  { id: 'soft', label: 'Soft Tap', hint: 'Muted, quiet tap', requires: 'sound-packs' },
  { id: 'arcade', label: 'Arcade', hint: 'Retro chiptune blip', requires: 'sound-packs' },
];

export const FONTS: readonly Option<FontId>[] = [
  { id: 'orbitron', label: 'Orbitron', hint: 'Futuristic display face', requires: null },
  { id: 'inter', label: 'Inter', hint: 'Clean and neutral', requires: null },
  { id: 'mono', label: 'Mono', hint: 'Terminal monospace', requires: null },
];

export const FONT_STACKS: Record<FontId, string> = {
  orbitron: "'Orbitron', ui-sans-serif, system-ui, sans-serif",
  inter: "'Inter', ui-sans-serif, system-ui, sans-serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
};

export const DEFAULT_SETTINGS: Settings = {
  theme: 'obsidian-ember',
  keyShape: 'rounded',
  keyEffect: 'pulse',
  sound: 'epic-click',
  font: 'orbitron',
  soundEnabled: true,
};

export function labelOf<T extends string>(options: readonly Option<T>[], id: T): string {
  const found = options.find((o) => o.id === id);
  return found ? found.label : id;
}

export function isUnlocked(requires: SkillId | null, skills: Record<SkillId, boolean>): boolean {
  return requires === null || skills[requires];
}

function pick<T extends string>(
  options: readonly Option<T>[],
  wanted: T,
  skills: Record<SkillId, boolean>,
  fallback: T,
): T {
  const found = options.find((o) => o.id === wanted);
  if (!found || !isUnlocked(found.requires, skills)) {
    return fallback;
  }
  return found.id;
}

export function sanitizeSettings(settings: Settings, skills: Record<SkillId, boolean>): Settings {
  const themeDef = THEMES.find((t) => t.id === settings.theme);
  const theme = themeDef && isUnlocked(themeDef.requires, skills) ? themeDef.id : DEFAULT_SETTINGS.theme;
  return {
    theme,
    keyShape: pick(KEY_SHAPES, settings.keyShape, skills, 'rounded'),
    keyEffect: pick(EFFECTS, settings.keyEffect, skills, 'none'),
    sound: pick(SOUNDS, settings.sound, skills, 'click'),
    font: pick(FONTS, settings.font, skills, 'orbitron'),
    soundEnabled: settings.soundEnabled,
  };
}
