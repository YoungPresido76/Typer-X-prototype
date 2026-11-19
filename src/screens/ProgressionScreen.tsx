import { useMemo, useState, type ReactElement } from 'react';
import type { ScreenId, SkillId } from '../types/game';
import { RANK_BANDS, formatCompact } from '../lib/progress';
import { cn } from '../lib/cn';
import { MILESTONES } from '../data/milestones';
import { SKILL_DEFS, SKILL_EDGES, SKILL_LIST, getNextUnlock, getSkillBlocker } from '../data/skills';
import { useGame } from '../state/GameContext';
import { HudCard } from '../components/HudCard';
import { Icon } from '../components/Icon';
import { LevelBadge } from '../components/LevelBadge';
import { MainNav } from '../components/MainNav';
import { SkillNode } from '../components/SkillNode';
import { XpBar } from '../components/XpBar';

interface ProgressionScreenProps {
  navigate: (screen: ScreenId) => void;
  openMore: () => void;
}

type Tab = 'tree' | 'ranks' | 'milestones';

const TABS: ReadonlyArray<{ id: Tab; label: string }> = [
  { id: 'tree', label: 'Skill Tree' },
  { id: 'ranks', label: 'Ranks' },
  { id: 'milestones', label: 'Milestones' },
];

function edgePath(parent: SkillId, child: SkillId): string {
  const p = SKILL_DEFS[parent].pos;
  const c = SKILL_DEFS[child].pos;
  const mid = (p.y + c.y) / 2;
  return `M ${p.x} ${p.y + 8} V ${mid} H ${c.x} V ${c.y - 9}`;
}

export function ProgressionScreen({ navigate, openMore }: ProgressionScreenProps): ReactElement {
  const { state, dispatch, progress, rank } = useGame();
  const [tab, setTab] = useState<Tab>('tree');
  const [selectedId, setSelectedId] = useState<SkillId | null>(null);

  const next = getNextUnlock(state.skills);
  const selected = selectedId === null ? null : SKILL_DEFS[selectedId];
  const selectedBlocker =
    selected === null ? null : getSkillBlocker(selected, state.skills, state.skillPoints, progress.level);

  const milestoneRows = useMemo(() => {
    const rows = MILESTONES.map((m) => {
      const value = m.value(state);
      return { def: m, value, done: value >= m.target, ratio: Math.min(1, value / m.target) };
    });
    return rows.sort((a, b) => {
      if (a.done !== b.done) {
        return a.done ? 1 : -1;
      }
      return b.ratio - a.ratio;
    });
  }, [state]);
  const achieved = milestoneRows.filter((r) => r.done).length;

  const nextHint =
    next === null
      ? null
      : progress.level < next.levelReq
        ? `Reach Lv. ${next.levelReq} to unlock`
        : (getSkillBlocker(next, state.skills, state.skillPoints, progress.level) ?? 'Ready to unlock');

  return (
    <div className="flex h-full flex-col">
      <header className="safe-top flex items-center gap-2 px-3 pb-1 pt-3">
        <button
          type="button"
          onClick={() => navigate('command')}
          aria-label="Back to Command Center"
          className="grid h-10 w-10 place-items-center rounded-full text-zinc-200 hover:bg-white/5"
        >
          <Icon name="back" className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold text-zinc-50">Progression</h1>
        <div
          className="flex h-9 min-w-[3.5rem] items-center justify-center gap-1 rounded-full border border-accent/50 bg-accent/10 px-2.5 text-accent"
          aria-label={`${state.skillPoints} skill points`}
        >
          <Icon name="bolt" className="h-3.5 w-3.5" />
          <span className="font-display text-sm font-bold tabular-nums">{state.skillPoints}</span>
        </div>
      </header>

      <div role="tablist" aria-label="Progression sections" className="grid grid-cols-3 border-b border-line/30 px-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'relative h-11 text-sm font-semibold transition-colors',
              tab === t.id ? 'text-accent' : 'text-zinc-400 hover:text-zinc-200',
            )}
          >
            {t.label}
            {tab === t.id ? <span aria-hidden="true" className="absolute inset-x-6 -bottom-px h-0.5 rounded-full bg-accent shadow-glow" /> : null}
          </button>
        ))}
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4 pt-3" role="tabpanel">
        {tab === 'tree' ? (
          <>
            <div className="relative mx-auto h-[390px] w-full max-w-[360px]">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
                {SKILL_EDGES.map(([parent, child]) => {
                  const lit = state.skills[child];
                  return (
                    <path
                      key={`${parent}-${child}`}
                      d={edgePath(parent, child)}
                      fill="none"
                      strokeWidth={lit ? 1.6 : 1.1}
                      vectorEffect="non-scaling-stroke"
                      strokeLinejoin="round"
                      strokeDasharray={lit ? undefined : '3 3'}
                      style={{
                        stroke: lit ? 'rgb(var(--accent))' : 'rgb(var(--line) / 0.7)',
                        filter: lit ? 'drop-shadow(0 0 3px rgb(var(--accent) / 0.8))' : undefined,
                      }}
                    />
                  );
                })}
              </svg>
              {SKILL_LIST.map((def) => (
                <SkillNode
                  key={def.id}
                  def={def}
                  unlocked={state.skills[def.id]}
                  available={getSkillBlocker(def, state.skills, state.skillPoints, progress.level) === null}
                  selected={selectedId === def.id}
                  onSelect={setSelectedId}
                />
              ))}
            </div>

            {selected !== null ? (
              <HudCard glow className="animate-fade-in mt-2">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accent/40 bg-accent/10 text-accent">
                      <Icon name={selected.icon} className="h-6 w-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm font-bold text-zinc-50">{selected.name}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">{selected.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      aria-label="Close skill details"
                      className="grid h-7 w-7 place-items-center rounded-full text-zinc-500 hover:text-white"
                    >
                      <Icon name="close" className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                    <span className="rounded-full border border-line/60 px-2 py-0.5 text-zinc-300">Lv. {selected.levelReq}+</span>
                    <span className="rounded-full border border-line/60 px-2 py-0.5 text-zinc-300">
                      {selected.cost} skill point{selected.cost === 1 ? '' : 's'}
                    </span>
                    {selected.parents.length > 0 ? (
                      <span className="rounded-full border border-line/60 px-2 py-0.5 text-zinc-300">
                        {selected.parents.length > 2
                          ? 'All other skills'
                          : selected.parents.map((p) => SKILL_DEFS[p].name).join(' + ')}
                      </span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    disabled={selectedBlocker !== null}
                    onClick={() => dispatch({ type: 'UNLOCK_SKILL', skillId: selected.id, now: Date.now() })}
                    className={cn(
                      'mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition',
                      selectedBlocker === null
                        ? 'bg-accent text-black shadow-glow-sm active:scale-[0.99]'
                        : state.skills[selected.id]
                          ? 'border border-accent/40 bg-accent/10 text-accent'
                          : 'border border-line/50 bg-white/[0.03] text-zinc-400',
                    )}
                  >
                    {state.skills[selected.id] ? (
                      <>
                        <Icon name="check" className="h-4 w-4" strokeWidth={2.4} />
                        Unlocked
                      </>
                    ) : selectedBlocker === null ? (
                      `Unlock for ${selected.cost} SP`
                    ) : (
                      <>
                        <Icon name="lock" className="h-4 w-4" />
                        {selectedBlocker}
                      </>
                    )}
                  </button>
                </div>
              </HudCard>
            ) : null}
          </>
        ) : null}

        {tab === 'ranks' ? (
          <ul className="space-y-2.5">
            {RANK_BANDS.map((band, index) => {
              const isCurrent = rank.bandIndex === index;
              const isDone = rank.bandIndex > index;
              const span = band.to - band.from + 1;
              const within = Math.max(0, Math.min(100, ((progress.level - band.from + 1) / span) * 100));
              return (
                <li key={band.name}>
                  <HudCard glow={isCurrent} className="flex items-center gap-3 p-3">
                    <LevelBadge level={band.from} size="sm" muted={!isCurrent && !isDone} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn('text-[15px] font-semibold', isCurrent || isDone ? 'text-zinc-50' : 'text-zinc-500')}>
                          {band.name}
                        </p>
                        {isCurrent ? (
                          <span className="rounded-full border border-accent/50 bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                            Current · {rank.tier}
                          </span>
                        ) : isDone ? (
                          <Icon name="check" className="h-4 w-4 text-accent" strokeWidth={2.4} />
                        ) : (
                          <Icon name="lock" className="h-4 w-4 text-zinc-600" />
                        )}
                      </div>
                      <p className="mb-1.5 text-xs tabular-nums text-zinc-400">
                        Levels {band.from}–{band.to === 99 ? '99' : band.to}
                      </p>
                      {isCurrent ? <XpBar pct={within} className="h-1.5" segmented={false} /> : null}
                    </div>
                  </HudCard>
                </li>
              );
            })}
          </ul>
        ) : null}

        {tab === 'milestones' ? (
          <div>
            <p className="mb-3 px-1 text-xs text-zinc-400">
              <span className="font-semibold tabular-nums text-accent">{achieved}</span> of {MILESTONES.length} achieved
            </p>
            <ul className="space-y-2.5">
              {milestoneRows.map((row) => (
                <li key={row.def.id}>
                  <HudCard className="flex items-center gap-3 p-3">
                    <span
                      className={cn(
                        'grid h-11 w-11 shrink-0 place-items-center rounded-xl border',
                        row.done ? 'border-accent/50 bg-accent/15 text-accent' : 'border-line/40 bg-white/[0.03] text-zinc-500',
                      )}
                    >
                      <Icon name={row.done ? 'check' : row.def.icon} className="h-5 w-5" strokeWidth={row.done ? 2.4 : 1.8} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={cn('truncate text-sm font-semibold', row.done ? 'text-zinc-50' : 'text-zinc-300')}>{row.def.title}</p>
                        <p className="shrink-0 text-[11px] tabular-nums text-zinc-400">
                          {formatCompact(Math.min(row.value, row.def.target))}/{formatCompact(row.def.target)}
                        </p>
                      </div>
                      <p className="mb-1.5 truncate text-xs text-zinc-500">{row.def.description}</p>
                      <XpBar pct={row.ratio * 100} className="h-1" segmented={false} />
                    </div>
                  </HudCard>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {tab === 'tree' ? (
        <div className="shrink-0 px-4 pb-3">
          {next !== null ? (
            <HudCard glow onClick={() => setSelectedId(next.id)} ariaLabel={`Next unlock: ${next.name}`}>
              <div className="flex items-center gap-3 p-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-accent/40 bg-gradient-to-br from-accent/25 to-black text-accent">
                  <Icon name={next.icon} className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-accent">Next Unlock</p>
                  <p className="truncate text-[15px] font-semibold text-zinc-50">{next.name}</p>
                  <p className="truncate text-xs text-zinc-400">{nextHint}</p>
                </div>
                <Icon name="chevron" className="h-5 w-5 shrink-0 text-zinc-400" />
              </div>
            </HudCard>
          ) : (
            <HudCard glow>
              <div className="flex items-center gap-3 p-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl border border-accent/40 bg-accent/15 text-accent">
                  <Icon name="crown" className="h-6 w-6" />
                </span>
                <p className="text-sm font-semibold text-zinc-50">Skill tree complete — you are a Legend.</p>
              </div>
            </HudCard>
          )}
        </div>
      ) : null}

      <MainNav active="progress" navigate={navigate} openMore={openMore} />
    </div>
  );
}
