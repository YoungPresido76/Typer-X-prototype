import { useCallback, useMemo, useState, type ReactElement } from 'react';
import type { ScreenId } from './types/game';
import { FONT_STACKS } from './data/options';
import { themeVars } from './data/themes';
import { useGame } from './state/GameContext';
import { EmberBackground } from './components/EmberBackground';
import { MoreSheet } from './components/MoreSheet';
import { NoticeToast } from './components/NoticeToast';
import { CommandCenterScreen } from './screens/CommandCenterScreen';
import { CustomizationLabScreen } from './screens/CustomizationLabScreen';
import { KeyboardScreen } from './screens/KeyboardScreen';
import { ProgressionScreen } from './screens/ProgressionScreen';

export function App(): ReactElement {
  const { state } = useGame();
  const [screen, setScreen] = useState<ScreenId>('keyboard');
  const [moreOpen, setMoreOpen] = useState<boolean>(false);

  const navigate = useCallback((next: ScreenId): void => {
    setMoreOpen(false);
    setScreen(next);
  }, []);
  const openMore = useCallback((): void => setMoreOpen(true), []);
  const closeMore = useCallback((): void => setMoreOpen(false), []);

  const theme = state.settings.theme;
  const font = state.settings.font;
  const vars = useMemo(() => themeVars(theme, FONT_STACKS[font]), [theme, font]);

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#050404]">
      <div
        style={vars}
        className="relative h-full w-full max-w-[430px] overflow-hidden bg-bg text-zinc-100 md:h-[min(900px,calc(100%-32px))] md:rounded-[44px] md:border md:border-line/60 md:shadow-[0_0_70px_rgb(var(--accent)/0.2)]"
      >
        <EmberBackground dynamic={state.skills['dynamic-backgrounds']} />
        <div key={screen} className="animate-screen-in scanlines absolute inset-0 z-10">
          {screen === 'keyboard' ? <KeyboardScreen navigate={navigate} paused={moreOpen} /> : null}
          {screen === 'command' ? <CommandCenterScreen navigate={navigate} openMore={openMore} /> : null}
          {screen === 'progression' ? <ProgressionScreen navigate={navigate} openMore={openMore} /> : null}
          {screen === 'lab' ? <CustomizationLabScreen navigate={navigate} /> : null}
        </div>
        <NoticeToast />
        {moreOpen ? <MoreSheet onClose={closeMore} navigate={navigate} /> : null}
      </div>
    </div>
  );
}
