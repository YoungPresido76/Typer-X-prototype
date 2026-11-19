import type { ReactElement } from 'react';
import type { IconName } from '../types/game';
import { cn } from '../lib/cn';
import { Icon } from './Icon';

export interface NavItem {
  id: string;
  label: string;
  icon: IconName;
  active: boolean;
  onSelect: () => void;
}

interface BottomNavProps {
  items: readonly NavItem[];
  showLabels?: boolean;
}

export function BottomNav({ items, showLabels = true }: BottomNavProps): ReactElement {
  return (
    <nav
      aria-label="Primary"
      className="safe-bottom relative z-20 shrink-0 border-t border-line/40 bg-black/50 backdrop-blur-md"
    >
      <ul className="grid grid-cols-4 px-2 pb-1.5 pt-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={item.onSelect}
              aria-label={item.label}
              aria-current={item.active ? 'page' : undefined}
              className={cn(
                'relative flex h-12 w-full flex-col items-center justify-center gap-0.5 rounded-xl transition-colors',
                item.active ? 'text-accent' : 'text-zinc-400 hover:text-zinc-200',
              )}
            >
              {item.active ? (
                <span aria-hidden="true" className="absolute -top-1.5 h-0.5 w-8 rounded-full bg-accent shadow-glow" />
              ) : null}
              <Icon name={item.icon} className={cn('h-[22px] w-[22px]', item.active ? 'drop-shadow-[0_0_6px_rgb(var(--accent)/0.8)]' : '')} />
              {showLabels ? <span className="text-[11px] font-medium leading-none">{item.label}</span> : null}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
