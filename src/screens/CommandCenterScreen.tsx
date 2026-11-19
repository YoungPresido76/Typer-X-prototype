import type { ReactElement, ReactNode } from 'react';
import type { IconName, ScreenId } from '../types/game';
import { DAILY_GOAL_WORDS, formatCompact, formatNumber } from '../lib/progress';
import { formatAgo } from '../lib/time';
import { countAchieved } from '../data/milestones';
import { useGame } from '../state/GameContext';
import { Avatar } from '../components/Avatar';
import { HudCard } from '../components/HudCard';
import { Icon } from '../components/Icon';
import { LevelBadge } from '../components/LevelBadge';
import { MainNav } from '../components/MainNav';
import { ProgressRing } from '../components/ProgressRing';
import { XpBar } from '../components/XpBar';

interface CommandCenterScreenProps {
  navigate: (screen: ScreenId) => void;
  openMore: () => void;
}

interface StatTileProps {
  icon: IconName;
  value: string;
  label: string;
}

function StatTile({ icon, value, label }: StatTileProps): ReactElement {
  return (
    <HudCard className="flex flex-col items-center gap-1 px-2 py-3.5">
      <Icon name={icon} className="h-5 w-5 text-accent drop-shadow-[0_0_6px_rgb(var(--accent)/0.7)]" />
      <p className="font-display text-xl font-bold tabular-nums text-zinc-50">{value}</p>
      <p className="text-[11px] text-zinc-400">{label}</p>
    </HudCard>
  );
}

function SectionLabel({ children }: { children: ReactNode }): ReactElement {
  return <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">{children}</p>;
}

export function CommandCenterScreen({ navigate, openMore }: CommandCenterScreenProps): ReactElement {
  const { state, progress, rank } = useGame();
  const goalPct = Math.min(100, Math.round((state.wordsToday / DAILY_GOAL_WORDS) * 100));
  const weekDelta =
    state.lastWeekWords > 0 ? Math.round(((state.weekWords - state.lastWeekWords) / state.lastWeekWords) * 100) : null;
  const milestones = countAchieved(state);

  return (
    <div className="flex h-full flex-col">
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-5">
        <header className="safe-top flex items-center gap-3 pb-4 pt-4">
          <div className="relative">
            <Avatar className="h-14 w-14" />
            <span aria-hidden="true" className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-black bg-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold text-zinc-50">Ramadan Abdul</h1>
            <p className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Online
            </p>
          </div>
          <button
            type="button"
            onClick={openMore}
            aria-label="Open settings and tools"
            className="grid h-10 w-10 place-items-center rounded-full border border-line/40 bg-white/[0.03] text-accent hover:bg-white/[0.07]"
          >
            <Icon name="gear" className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-3">
          <HudCard glow onClick={() => navigate('progression')} ariaLabel="Open progression">
            <div className="flex items-center gap-4 p-4">
              <LevelBadge level={progress.level} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Typing Level</p>
                <p className="font-display text-4xl font-extrabold leading-tight text-zinc-50">Lv. {progress.level}</p>
                <p className="text-sm text-accent-2">{rank.label}</p>
              </div>
              <Icon name="chevron" className="h-5 w-5 shrink-0 text-zinc-400" />
            </div>
          </HudCard>

          <HudCard className="px-4 py-3">
            <div className="mb-2 flex items-baseline justify-between">
              <p className="text-sm font-semibold tabular-nums text-zinc-100">
                {formatNumber(progress.current)} / {formatNumber(progress.needed)} XP
              </p>
              <p className="text-xs tabular-nums text-accent">{Math.round(progress.pct)}%</p>
            </div>
            <XpBar pct={progress.pct} />
          </HudCard>

          <div className="grid grid-cols-2 gap-3">
            <HudCard className="flex flex-col items-center justify-center px-3 py-4">
              <ProgressRing pct={goalPct} className="h-28 w-28">
                <Icon name="target" className="mb-0.5 h-5 w-5 text-accent" />
                <span className="font-display text-xl font-bold tabular-nums text-zinc-50">{goalPct}%</span>
              </ProgressRing>
              <p className="mt-2 text-sm font-semibold text-zinc-100">Daily Goal</p>
              <p className="text-xs tabular-nums text-zinc-400">
                {formatNumber(Math.min(state.wordsToday, DAILY_GOAL_WORDS))} / {formatNumber(DAILY_GOAL_WORDS)}
              </p>
            </HudCard>
            <HudCard className="flex flex-col items-center justify-center gap-1 px-3 py-4">
              <Icon name="doc" className="h-7 w-7 text-zinc-300" />
              <p className="mt-1 text-xs text-zinc-400">Total Words</p>
              <p className="font-display text-3xl font-bold tabular-nums text-zinc-50">{formatNumber(state.lifetimeWords)}</p>
              {weekDelta !== null ? (
                <p className="flex items-center gap-1 text-xs font-semibold tabular-nums text-accent">
                  <Icon name={weekDelta >= 0 ? 'arrowUp' : 'arrowDown'} className="h-3.5 w-3.5" strokeWidth={2.4} />
                  {weekDelta >= 0 ? '+' : ''}
                  {weekDelta}% this week
                </p>
              ) : (
                <p className="text-xs text-zinc-500">No data last week</p>
              )}
            </HudCard>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatTile icon="bolt" value={formatNumber(state.streak)} label="Streak" />
            <StatTile icon="trophy" value={formatNumber(milestones)} label="Milestones" />
            <StatTile icon="star" value={formatCompact(state.totalXp)} label="Total XP" />
          </div>

          <SectionLabel>Latest</SectionLabel>
          <HudCard onClick={() => navigate('progression')} ariaLabel="Open progression to see unlocks">
            <div className="flex items-center gap-3 p-3">
              <span className="grid h-14 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-accent/40 bg-gradient-to-br from-accent/25 to-black text-accent">
                <Icon name="keyboard" className="h-8 w-8" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-accent">Recent Unlock</p>
                <p className="truncate text-[15px] font-semibold text-zinc-50">{state.recentUnlock.label}</p>
                <p className="text-xs text-zinc-400">{formatAgo(state.recentUnlock.at, Date.now())}</p>
              </div>
              <Icon name="chevron" className="h-5 w-5 shrink-0 text-zinc-400" />
            </div>
          </HudCard>

          <button
            type="button"
            onClick={() => navigate('keyboard')}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent font-semibold text-black shadow-glow transition active:scale-[0.99]"
          >
            <Icon name="keyboard" className="h-5 w-5" strokeWidth={2.2} />
            Open Keyboard
          </button>
        </div>
      </div>
      <MainNav active="home" navigate={navigate} openMore={openMore} />
    </div>
  );
}
