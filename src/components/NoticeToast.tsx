import { useEffect, type ReactElement } from 'react';
import { useGame } from '../state/GameContext';
import { Icon } from './Icon';

const VISIBLE_MS = 3200;

export function NoticeToast(): ReactElement | null {
  const { state, dispatch } = useGame();
  const notice = state.notice;
  const noticeId = notice === null ? null : notice.id;

  useEffect(() => {
    if (noticeId === null) {
      return undefined;
    }
    const timer = window.setTimeout(() => dispatch({ type: 'DISMISS_NOTICE', id: noticeId }), VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [noticeId, dispatch]);

  if (notice === null) {
    return null;
  }

  return (
    <div className="safe-top pointer-events-none absolute inset-x-0 top-0 z-50 flex justify-center px-4 pt-3">
      <div
        key={notice.id}
        role="status"
        aria-live="polite"
        className="animate-slide-down pointer-events-auto relative flex w-full max-w-[340px] items-center gap-3 overflow-hidden rounded-2xl border border-accent/60 bg-black/85 px-4 py-3 shadow-glow backdrop-blur-md"
      >
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-accent/50 bg-accent/15 text-accent">
          <Icon name={notice.title === 'LEVEL UP' ? 'arrowUp' : notice.title === 'SKILL UNLOCKED' ? 'lock' : 'trophy'} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[11px] font-bold tracking-[0.2em] text-accent">{notice.title}</p>
          <p className="truncate text-sm font-semibold text-zinc-100">{notice.body}</p>
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: 'DISMISS_NOTICE', id: notice.id })}
          aria-label="Dismiss notification"
          className="grid h-7 w-7 place-items-center rounded-full text-zinc-400 hover:text-white"
        >
          <Icon name="close" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
