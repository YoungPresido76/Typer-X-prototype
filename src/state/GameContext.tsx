import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type Dispatch,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { GameAction, GameState, KeyAction } from '../types/game';
import { getLevelProgress, getRank, type LevelProgress, type RankInfo } from '../lib/progress';
import { dayKey, weekKey } from '../lib/time';
import { gameReducer } from './reducer';
import { loadState, saveState } from './storage';

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  progress: LevelProgress;
  rank: RankInfo;
  press: (action: KeyAction) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }): ReactElement {
  const [state, dispatch] = useReducer(gameReducer, Date.now(), loadState);
  const latest = useRef<GameState>(state);
  latest.current = state;

  useEffect(() => {
    const id = window.setTimeout(() => saveState(state), 300);
    return () => window.clearTimeout(id);
  }, [state]);

  useEffect(() => {
    const flush = (): void => saveState(latest.current);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', flush);
      flush();
    };
  }, []);

  const press = useCallback((action: KeyAction): void => {
    const now = Date.now();
    const d = new Date(now);
    dispatch({ type: 'KEY', action, now, day: dayKey(d), week: weekKey(d) });
  }, []);

  const progress = useMemo(() => getLevelProgress(state.totalXp), [state.totalXp]);
  const rank = useMemo(() => getRank(progress.level), [progress.level]);

  const value = useMemo<GameContextValue>(
    () => ({ state, dispatch, progress, rank, press }),
    [state, progress, rank, press],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (ctx === null) {
    throw new Error('useGame must be used inside <GameProvider>');
  }
  return ctx;
}
