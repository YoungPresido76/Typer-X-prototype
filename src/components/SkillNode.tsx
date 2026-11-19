import { useId, type ReactElement } from 'react';
import type { SkillDef } from '../data/skills';
import { cn } from '../lib/cn';
import { Icon } from './Icon';

interface SkillNodeProps {
  def: SkillDef;
  unlocked: boolean;
  available: boolean;
  selected: boolean;
  onSelect: (id: SkillDef['id']) => void;
}

export function SkillNode({ def, unlocked, available, selected, onSelect }: SkillNodeProps): ReactElement {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const fillId = `sn-${uid}`;
  const big = def.id === 'legend';
  const size = big ? 'h-[84px] w-[76px]' : 'h-[68px] w-[62px]';
  const status = unlocked ? 'unlocked' : available ? 'ready to unlock' : 'locked';
  return (
    <button
      type="button"
      onClick={() => onSelect(def.id)}
      aria-label={`${def.name}, ${status}`}
      aria-pressed={selected}
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{ left: `${def.pos.x}%`, top: `${def.pos.y}%` }}
    >
      <span className={cn('relative block', size, available && !selected ? 'animate-node-pulse rounded-[40%]' : '')}>
        <svg
          viewBox="0 0 64 70"
          className="h-full w-full"
          style={{
            filter: unlocked || selected ? 'drop-shadow(0 0 8px rgb(var(--accent) / 0.65))' : undefined,
          }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={unlocked ? '#3a2412' : '#1c1a1d'} />
              <stop offset="1" stopColor="#0b0908" />
            </linearGradient>
          </defs>
          <polygon
            points="32,3 60,19 60,51 32,67 4,51 4,19"
            fill={`url(#${fillId})`}
            strokeWidth={selected ? 3 : 2}
            style={{
              stroke: unlocked || selected ? 'rgb(var(--accent))' : 'rgb(var(--line) / 0.7)',
            }}
          />
          <polygon
            points="32,11 53,23 53,47 32,59 11,47 11,23"
            fill="none"
            strokeWidth="1"
            style={{ stroke: unlocked ? 'rgb(var(--accent) / 0.4)' : 'rgb(255 255 255 / 0.06)' }}
          />
        </svg>
        <span
          className={cn(
            'absolute inset-0 grid place-items-center',
            unlocked ? 'text-accent-2' : available ? 'text-accent/80' : 'text-zinc-500',
          )}
        >
          <Icon name={def.icon} className={big ? 'h-9 w-9' : 'h-7 w-7'} strokeWidth={1.6} />
        </span>
        {!unlocked ? (
          <span className="absolute -top-1 left-1/2 grid h-[18px] w-[18px] -translate-x-1/2 place-items-center rounded-full border border-line/70 bg-black text-accent">
            <Icon name="lock" className="h-2.5 w-2.5" strokeWidth={2.4} />
          </span>
        ) : null}
      </span>
      <span className="mt-1.5 max-w-[88px] text-center text-[11px] font-medium leading-tight text-zinc-200">{def.name}</span>
      <span className={cn('text-[10px] font-semibold tabular-nums', unlocked ? 'text-accent' : 'text-zinc-500')}>
        Lv. {unlocked ? 1 : 0}/1
      </span>
    </button>
  );
}
