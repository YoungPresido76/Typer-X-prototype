import type { ReactElement } from 'react';
import { cn } from '../lib/cn';

interface XpBarProps {
  pct: number;
  className?: string;
  segmented?: boolean;
}

export function XpBar({ pct, className, segmented = true }: XpBarProps): ReactElement {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-white/[0.06]', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2 shadow-glow-sm transition-[width] duration-300 ease-out"
        style={{ width: `${clamped}%` }}
      />
      {segmented ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent 0, transparent calc(10% - 2px), rgb(0 0 0 / 0.55) calc(10% - 2px), rgb(0 0 0 / 0.55) 10%)',
          }}
        />
      ) : null}
    </div>
  );
}
