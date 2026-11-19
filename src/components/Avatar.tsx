import { useId, type ReactElement } from 'react';
import { cn } from '../lib/cn';

interface AvatarProps {
  className?: string;
  ring?: boolean;
}

export function Avatar({ className, ring = true }: AvatarProps): ReactElement {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const bg = `av-bg-${uid}`;
  const glow = `av-glow-${uid}`;
  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full',
        ring ? 'border-2 border-accent/80 shadow-glow-sm' : '',
        className,
      )}
    >
      <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id={bg} cx="0.5" cy="0.3" r="0.9">
            <stop offset="0" stopColor="#3a2f3a" />
            <stop offset="1" stopColor="#0a0810" />
          </radialGradient>
          <filter id={glow} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1.1" />
          </filter>
        </defs>
        <rect width="64" height="64" fill={`url(#${bg})`} />
        <path d="M4 64 C7 48 20 42 32 42 C44 42 57 48 60 64 Z" fill="#16121b" />
        <path
          d="M32 5 C19 5 13 18 14 30 C15 41 22 47 32 47 C42 47 49 41 50 30 C51 18 45 5 32 5 Z"
          fill="#1e1a25"
          stroke="#2e2936"
          strokeWidth="1"
        />
        <ellipse cx="32" cy="30" rx="9.5" ry="11.5" fill="#040307" />
        <g style={{ fill: 'rgb(var(--accent-2))' }}>
          <ellipse cx="28.3" cy="29.5" rx="2" ry="1.1" filter={`url(#${glow})`} />
          <ellipse cx="35.7" cy="29.5" rx="2" ry="1.1" filter={`url(#${glow})`} />
          <ellipse cx="28.3" cy="29.5" rx="1.5" ry="0.8" />
          <ellipse cx="35.7" cy="29.5" rx="1.5" ry="0.8" />
        </g>
      </svg>
    </div>
  );
}
