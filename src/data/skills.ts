import type { IconName, SkillId } from '../types/game';

export interface SkillDef {
  id: SkillId;
  name: string;
  icon: IconName;
  levelReq: number;
  cost: number;
  parents: readonly SkillId[];
  description: string;
  pos: { x: number; y: number };
}

export const SKILL_DEFS: Record<SkillId, SkillDef> = {
  legend: {
    id: 'legend',
    name: 'Legend',
    icon: 'crown',
    levelReq: 50,
    cost: 3,
    parents: [
      'key-effects',
      'sound-packs',
      'themes',
      'advanced-layouts',
      'dynamic-backgrounds',
      'special-animations',
    ],
    description: 'Capstone of the tree. Requires every other skill and unlocks the exclusive Mythic Gold theme.',
    pos: { x: 50, y: 11 },
  },
  'key-effects': {
    id: 'key-effects',
    name: 'Key Effects',
    icon: 'keyboard',
    levelReq: 1,
    cost: 1,
    parents: [],
    description: 'Unlocks the Pulse, Spark and Ripple keypress effects.',
    pos: { x: 16, y: 45 },
  },
  'sound-packs': {
    id: 'sound-packs',
    name: 'Sound Packs',
    icon: 'volume',
    levelReq: 1,
    cost: 1,
    parents: [],
    description: 'Unlocks the Epic Click, Soft Tap and Arcade sound packs.',
    pos: { x: 50, y: 45 },
  },
  themes: {
    id: 'themes',
    name: 'Themes',
    icon: 'shirt',
    levelReq: 10,
    cost: 1,
    parents: [],
    description: 'Unlocks the Neon Circuit, Frost Glass and Void Violet themes.',
    pos: { x: 84, y: 45 },
  },
  'advanced-layouts': {
    id: 'advanced-layouts',
    name: 'Advanced Layouts',
    icon: 'grid',
    levelReq: 20,
    cost: 1,
    parents: ['key-effects'],
    description: 'Adds a dedicated number row to the keyboard and unlocks the Square and Chamfer key shapes.',
    pos: { x: 16, y: 84 },
  },
  'dynamic-backgrounds': {
    id: 'dynamic-backgrounds',
    name: 'Dynamic Backgrounds',
    icon: 'image',
    levelReq: 24,
    cost: 2,
    parents: ['sound-packs'],
    description: 'Brings the app background to life with drifting embers in your theme colors.',
    pos: { x: 50, y: 84 },
  },
  'special-animations': {
    id: 'special-animations',
    name: 'Special Animations',
    icon: 'sparkles',
    levelReq: 28,
    cost: 2,
    parents: ['themes'],
    description: 'Unlocks the Burst keypress effect.',
    pos: { x: 84, y: 84 },
  },
};

export const SKILL_LIST: readonly SkillDef[] = Object.values(SKILL_DEFS);

export const SKILL_EDGES: ReadonlyArray<readonly [SkillId, SkillId]> = [
  ['legend', 'key-effects'],
  ['legend', 'sound-packs'],
  ['legend', 'themes'],
  ['key-effects', 'advanced-layouts'],
  ['sound-packs', 'dynamic-backgrounds'],
  ['themes', 'special-animations'],
];

export function getSkill(id: SkillId): SkillDef {
  return SKILL_DEFS[id];
}

export function getSkillBlocker(
  def: SkillDef,
  skills: Record<SkillId, boolean>,
  skillPoints: number,
  level: number,
): string | null {
  if (skills[def.id]) {
    return 'Already unlocked';
  }
  if (level < def.levelReq) {
    return `Reach Lv. ${def.levelReq}`;
  }
  const missing = def.parents.filter((p) => !skills[p]);
  if (missing.length > 0) {
    if (missing.length > 2) {
      return `Unlock ${missing.length} more skills first`;
    }
    return `Requires ${missing.map((p) => SKILL_DEFS[p].name).join(' + ')}`;
  }
  if (skillPoints < def.cost) {
    const need = def.cost - skillPoints;
    return `Needs ${need} more skill point${need === 1 ? '' : 's'}`;
  }
  return null;
}

export function getNextUnlock(skills: Record<SkillId, boolean>): SkillDef | null {
  const locked = SKILL_LIST.filter((s) => !skills[s.id]).sort(
    (a, b) => a.levelReq - b.levelReq || a.cost - b.cost,
  );
  return locked.length > 0 ? locked[0] : null;
}

export function countUnlocked(skills: Record<SkillId, boolean>): number {
  return SKILL_LIST.filter((s) => skills[s.id]).length;
}
