import { useEffect, useRef, useState, type ReactElement } from 'react';
import type { ScreenId } from '../types/game';
import { cn } from '../lib/cn';
import { dayKey, weekKey } from '../lib/time';
import { useGame } from '../state/GameContext';
import { Icon } from './Icon';

interface MoreSheetProps {
  onClose: () => void;
  navigate: (screen: ScreenId) => void;
}

export function MoreSheet({ onClose, navigate }: MoreSheetProps): ReactElement {
  const { state, dispatch } = useGame();
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const reset = (): void => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    const now = Date.now();
    const d = new Date(now);
    dispatch({ type: 'RESET', now, day: dayKey(d), week: weekKey(d) });
    setConfirmReset(false);
    onClose();
  };

  const rowClass =
    'flex h-12 w-full items-center gap-3 rounded-xl border border-line/40 bg-white/[0.03] px-3.5 text-left text-[15px] text-zinc-100 transition hover:border-accent/50 active:scale-[0.99]';

  return (
    <div className="animate-fade-in absolute inset-0 z-40 flex items-end bg-black/65" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="More"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="animate-sheet-up safe-bottom relative w-full rounded-t-3xl border-t border-accent/50 bg-card px-4 pb-5 pt-3 shadow-[0_-12px_40px_rgb(var(--accent)/0.18)] outline-none"
      >
        <div aria-hidden="true" className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold tracking-[0.18em] text-zinc-50">MORE</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full text-zinc-400 hover:text-white">
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            role="switch"
            aria-checked={state.settings.soundEnabled}
            onClick={() => dispatch({ type: 'UPDATE_SETTINGS', patch: { soundEnabled: !state.settings.soundEnabled } })}
            className={rowClass}
          >
            <Icon name={state.settings.soundEnabled ? 'volume' : 'mute'} className="h-5 w-5 text-accent" />
            <span className="flex-1">Keypress sounds</span>
            <span
              aria-hidden="true"
              className={cn(
                'relative h-6 w-11 rounded-full border transition',
                state.settings.soundEnabled ? 'border-accent bg-accent/30' : 'border-line/60 bg-white/5',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 rounded-full transition-all',
                  state.settings.soundEnabled ? 'left-[22px] bg-accent shadow-glow-sm' : 'left-0.5 bg-zinc-500',
                )}
                style={{ width: 18, height: 18 }}
              />
            </span>
          </button>

          <button type="button" onClick={() => navigate('keyboard')} className={rowClass}>
            <Icon name="keyboard" className="h-5 w-5 text-accent" />
            <span className="flex-1">Open keyboard</span>
            <Icon name="chevron" className="h-4 w-4 text-zinc-500" />
          </button>
        </div>

        <p className="mb-2 mt-4 px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Prototype tools</p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => dispatch({ type: 'GRANT_XP', amount: 250 })} className={rowClass}>
            <Icon name="bolt" className="h-5 w-5 text-accent" />
            <span>+250 XP</span>
          </button>
          <button type="button" onClick={() => dispatch({ type: 'GRANT_XP', amount: 2000 })} className={rowClass}>
            <Icon name="bolt" className="h-5 w-5 text-accent" />
            <span>+2,000 XP</span>
          </button>
        </div>
        <button
          type="button"
          onClick={reset}
          className={cn(rowClass, 'mt-2', confirmReset ? 'border-red-400/60 bg-red-500/10 text-red-300' : '')}
        >
          <Icon name="reset" className="h-5 w-5" />
          <span className="flex-1">{confirmReset ? 'Tap again to confirm reset' : 'Reset progress'}</span>
        </button>
      </div>
    </div>
  );
}
