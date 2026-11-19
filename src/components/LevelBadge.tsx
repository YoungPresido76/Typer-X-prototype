import { useId, type ReactElement } from 'react';
import { cn } from '../lib/cn';

type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

interface LevelBadgeProps {
  level: number;
  size?: BadgeSize;
  className?: string;
  muted?: boolean;
}

const SIZE: Record<BadgeSize, string> = {
  xs: 'h-10 w-9',
  sm: 'h-14 w-12',
  md: 'h-20 w-[4.5rem]',
  lg: 'h-28 w-24',
};

export function LevelBadge({ level, size = 'md', className, muted = false }: LevelBadgeProps): ReactElement {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const outer = `lb-outer-${uid}`;
  const inner = `lb-inner-${uid}`;
  const text = String(level);
  const fontSize = text.length >= 3 ? 30 : 40;
  return (
    <svg
      viewBox="0 0 100 112"
      className={cn(SIZE[size], muted ? 'opacity-50 grayscale' : '', className)}
      style={{ filter: muted ? undefined : 'drop-shadow(0 0 10px rgb(var(--accent) / 0.55))' }}
      role="img"
      aria-label={`Level ${level}`}
    >
      <defs>
        <linearGradient id={outer} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'rgb(var(--accent-2))' }} />
          <stop offset="0.5" style={{ stopColor: 'rgb(var(--accent))' }} />
          <stop offset="1" style={{ stopColor: 'rgb(var(--line))' }} />
        </linearGradient>
        <radialGradient id={inner} cx="0.5" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#2a1c14" />
          <stop offset="1" stopColor="#0b0706" />
        </radialGradient>
      </defs>
      <path d="M30 14 L38 2 L50 12 L62 2 L70 14 Z" fill={`url(#${outer})`} />
      <path d="M50 8 L92 28 L92 72 Q92 92 50 110 Q8 92 8 72 L8 28 Z" fill={`url(#${outer})`} />
      <path d="M50 17 L84 33 L84 71 Q84 86 50 101 Q16 86 16 71 L16 33 Z" fill={`url(#${inner})`} stroke="rgb(0 0 0 / 0.6)" strokeWidth="1.5" />
      <path d="M50 24 L77 37 L77 70 Q77 81 50 94 Q23 81 23 70 L23 37 Z" fill="none" style={{ stroke: 'rgb(var(--accent) / 0.55)' }} strokeWidth="1" />
      <text
        x="50"
        y="66"
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="800"
        className="font-display"
        style={{ fill: 'rgb(var(--accent-2))' }}
      >
        {text}
      </text>
    </svg>
  );
}
