import type { ReactElement, ReactNode } from 'react';
import { cn } from '../lib/cn';

interface HudCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}

function Brackets(): ReactElement {
  return (
    <>
      <span aria-hidden="true" className="pointer-events-none absolute left-1.5 top-1.5 h-2.5 w-2.5 rounded-tl-[5px] border-l border-t border-accent/70" />
      <span aria-hidden="true" className="pointer-events-none absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-tr-[5px] border-r border-t border-accent/70" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-1.5 left-1.5 h-2.5 w-2.5 rounded-bl-[5px] border-b border-l border-accent/70" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-1.5 right-1.5 h-2.5 w-2.5 rounded-br-[5px] border-b border-r border-accent/70" />
    </>
  );
}

export function HudCard({ children, className, glow = false, onClick, ariaLabel }: HudCardProps): ReactElement {
  const classes = cn(
    'relative overflow-hidden rounded-2xl border bg-card/80 shadow-card backdrop-blur-sm',
    glow ? 'border-accent/45 shadow-glow-sm' : 'border-line/50',
    onClick ? 'w-full text-left transition duration-150 hover:border-accent/60 active:scale-[0.99]' : '',
    className,
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-label={ariaLabel} className={classes}>
        <Brackets />
        {children}
      </button>
    );
  }
  return (
    <div className={classes} aria-label={ariaLabel}>
      <Brackets />
      {children}
    </div>
  );
}
