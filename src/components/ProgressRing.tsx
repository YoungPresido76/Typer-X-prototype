import { useId, type ReactElement, type ReactNode } from 'react';
import { cn } from '../lib/cn';

interface ProgressRingProps {
  pct: number;
  className?: string;
  stroke?: number;
  children?: ReactNode;
}

export function ProgressRing({ pct, className, stroke = 9, children }: ProgressRingProps): ReactElement {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gradientId = `ring-${uid}`;
  const size = 100;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = circumference * (1 - clamped / 100);
  return (
    <div className={cn('relative', className)}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: 'rgb(var(--accent-2))' }} />
            <stop offset="1" style={{ stopColor: 'rgb(var(--accent))' }} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} style={{ stroke: 'rgb(var(--line) / 0.45)' }} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={`url(#${gradientId})`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 500ms ease-out', filter: 'drop-shadow(0 0 5px rgb(var(--accent) / 0.7))' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
