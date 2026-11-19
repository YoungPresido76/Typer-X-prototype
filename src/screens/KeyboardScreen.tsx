import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import type { IconName, KeyAction, ScreenId } from '../types/game';
import { COMBO_WINDOW_MS } from '../lib/progress';
import { formatClock } from '../lib/time';
import { cn } from '../lib/cn';
import { useGame } from '../state/GameContext';
import { Avatar } from '../components/Avatar';
import { BottomNav, type NavItem } from '../components/BottomNav';
import { Icon } from '../components/Icon';
import { Keyboard, type ExternalPress } from '../components/Keyboard';
import { LevelBadge } from '../components/LevelBadge';
import { XpBar } from '../components/XpBar';

interface KeyboardScreenProps {
  navigate: (screen: ScreenId) => void;
  paused: boolean;
}

const REPLIES: readonly string[] = [
  'Okay that combo counter is addictive 😮‍💨',
  'Level 19 soon? Keep going 🔥',
  'The key effects look so clean',
  'Send me your streak when you hit 30 days',
  'This is how typing should feel ⚡',
];

const EMOJIS: readonly string[] = [
  '🔥', '😂', '😎', '🤝', '👍', '💯', '⚡', '🎯',
  '🚀', '🏆', '👑', '💎', '😮', '🙌', '❤️', '✨',
  '🤔', '😅', '🥳', '💪', '🧠', '🎮', '⌨️', '🌙',
];

interface ToolbarButton {
  id: string;
  label: string;
  icon: IconName | null;
}

const TOOLS: readonly ToolbarButton[] = [
  { id: 'emoji', label: 'Emoji', icon: 'smile' },
  { id: 'gif', label: 'GIF', icon: null },
  { id: 'clipboard', label: 'Paste from clipboard', icon: 'clipboard' },
  { id: 'mic', label: 'Voice typing', icon: 'mic' },
  { id: 'translate', label: 'Translate', icon: 'translate' },
  { id: 'more', label: 'More tools', icon: 'grid' },
];

function visibleDraft(draft: string): string {
  return draft.length > 38 ? `…${draft.slice(-37)}` : draft;
}

export function KeyboardScreen({ navigate, paused }: KeyboardScreenProps): ReactElement {
  const { state, dispatch, progress, rank, press } = useGame();
  const [emojiOpen, setEmojiOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [external, setExternal] = useState<ExternalPress | null>(null);
  const [comboAlive, setComboAlive] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const toastTimer = useRef<number | null>(null);
  const mountedAt = useRef<number>(Date.now());

  const notify = useCallback((message: string): void => {
    setToast(message);
    if (toastTimer.current !== null) {
      window.clearTimeout(toastTimer.current);
    }
    toastTimer.current = window.setTimeout(() => setToast(null), 1800);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) {
        window.clearTimeout(toastTimer.current);
      }
    },
    [],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (el !== null) {
      el.scrollTop = el.scrollHeight;
    }
  }, [state.messages.length]);

  const lastKeyAt = state.lastKeyAt;
  useEffect(() => {
    if (lastKeyAt === 0) {
      setComboAlive(false);
      return undefined;
    }
    setComboAlive(true);
    const timer = window.setTimeout(() => setComboAlive(false), COMBO_WINDOW_MS);
    return () => window.clearTimeout(timer);
  }, [lastKeyAt]);

  const lastMessage = state.messages.length > 0 ? state.messages[state.messages.length - 1] : null;
  useEffect(() => {
    if (lastMessage === null || lastMessage.from !== 'me' || lastMessage.at < mountedAt.current) {
      return undefined;
    }
    const reply = REPLIES[lastMessage.id % REPLIES.length];
    const timer = window.setTimeout(() => dispatch({ type: 'RECEIVE_MESSAGE', text: reply, now: Date.now() }), 1400);
    return () => window.clearTimeout(timer);
  }, [lastMessage, dispatch]);

  useEffect(() => {
    if (paused) {
      return undefined;
    }
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }
      let action: KeyAction | null = null;
      let id = '';
      if (e.key === 'Backspace') {
        action = { kind: 'backspace' };
        id = 'back';
      } else if (e.key === 'Enter') {
        action = { kind: 'enter' };
        id = 'enter';
      } else if (e.key === ' ') {
        action = { kind: 'space' };
        id = 'space';
      } else if (e.key.length === 1) {
        action = { kind: 'char', char: e.key };
        id = e.key.toLowerCase();
      }
      if (action === null) {
        return;
      }
      e.preventDefault();
      press(action);
      setExternal((prev) => ({ id, seq: (prev === null ? 0 : prev.seq) + 1 }));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [paused, press]);

  const handleTool = useCallback(
    (id: string): void => {
      if (id === 'emoji') {
        setEmojiOpen((open) => !open);
        return;
      }
      if (id === 'clipboard') {
        if (typeof navigator === 'undefined' || !navigator.clipboard || typeof navigator.clipboard.readText !== 'function') {
          notify('Clipboard is not available in this browser');
          return;
        }
        navigator.clipboard
          .readText()
          .then((text) => {
            if (text.length > 0) {
              dispatch({ type: 'INSERT_TEXT', text: text.replace(/\s+/g, ' ') });
            } else {
              notify('Clipboard is empty');
            }
          })
          .catch(() => notify('Clipboard permission was denied'));
        return;
      }
      notify('Not available in this prototype');
    },
    [dispatch, notify],
  );

  const comboShown = comboAlive ? state.combo : 0;
  const canSend = state.draft.trim().length > 0;

  const navItems: NavItem[] = [
    { id: 'keyboard', label: 'Keyboard', icon: 'keyboard', active: true, onSelect: () => undefined },
    { id: 'lab', label: 'Customize', icon: 'shirt', active: false, onSelect: () => navigate('lab') },
    { id: 'command', label: 'Command Center', icon: 'briefcase', active: false, onSelect: () => navigate('command') },
    { id: 'progression', label: 'Progression', icon: 'chart', active: false, onSelect: () => navigate('progression') },
  ];

  return (
    <div className="relative flex h-full flex-col">
      <header className="safe-top flex items-center gap-2 border-b border-line/30 bg-black/30 px-3 pb-2.5 pt-3 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => navigate('command')}
          aria-label="Back to Command Center"
          className="grid h-9 w-9 place-items-center rounded-full text-zinc-200 hover:bg-white/5"
        >
          <Icon name="back" className="h-5 w-5" />
        </button>
        <div className="relative">
          <Avatar className="h-10 w-10" />
          <span aria-hidden="true" className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-black bg-emerald-400" />
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[15px] font-semibold text-zinc-50">Chillverse</p>
          <p className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Online
          </p>
        </div>
        <button type="button" onClick={() => notify('Calls are not part of this prototype')} aria-label="Voice call" className="grid h-9 w-9 place-items-center rounded-full text-accent hover:bg-white/5">
          <Icon name="phone" className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => notify('Calls are not part of this prototype')} aria-label="Video call" className="grid h-9 w-9 place-items-center rounded-full text-accent hover:bg-white/5">
          <Icon name="video" className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => notify('Not available in this prototype')} aria-label="More options" className="grid h-9 w-9 place-items-center rounded-full text-zinc-300 hover:bg-white/5">
          <Icon name="more" className="h-5 w-5" />
        </button>
      </header>

      <div ref={scrollRef} className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {state.messages.map((m) => (
          <div key={m.id} className={cn('flex', m.from === 'me' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[15px] leading-snug',
                m.from === 'me'
                  ? 'rounded-br-md border border-accent/50 bg-accent/[0.14] text-zinc-50 shadow-glow-sm'
                  : 'rounded-bl-md border border-white/5 bg-white/[0.06] text-zinc-100',
              )}
            >
              <span className="break-words">{m.text}</span>
              <span className={cn('ml-2 inline-block translate-y-1 text-[10px]', m.from === 'me' ? 'text-accent-2/80' : 'text-zinc-500')}>
                {formatClock(m.at)}
                {m.from === 'me' ? ' ✓✓' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="relative border-t border-line/30 bg-black/40 px-3 pb-2 pt-3">
        {toast !== null ? (
          <div role="status" className="animate-fade-in absolute -top-9 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full border border-line/60 bg-black/90 px-3 py-1.5 text-xs text-zinc-200">
            {toast}
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => notify('Attachments are not part of this prototype')} aria-label="Attach file" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-zinc-300 hover:bg-white/5">
            <Icon name="paperclip" className="h-5 w-5" />
          </button>
          <div
            role="textbox"
            aria-readonly="true"
            aria-label="Message"
            className="flex h-11 min-w-0 flex-1 items-center overflow-hidden rounded-full border border-line/50 bg-black/50 px-4 text-[15px]"
          >
            <span className={cn('truncate whitespace-pre', state.draft.length === 0 ? 'text-zinc-500' : 'text-zinc-50')}>
              {state.draft.length === 0 ? 'Type a message' : visibleDraft(state.draft)}
            </span>
            <span aria-hidden="true" className="animate-caret ml-0.5 h-5 w-0.5 shrink-0 bg-accent" />
          </div>
          <button
            type="button"
            onClick={() => press({ kind: 'enter' })}
            disabled={!canSend}
            aria-label="Send message"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-black shadow-glow-sm transition disabled:opacity-40 disabled:shadow-none"
          >
            <Icon name="send" className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="border-t border-line/30 bg-black/55 px-3 py-2">
        <div className="flex items-center gap-3">
          <LevelBadge level={progress.level} size="xs" />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-[13px] font-bold text-zinc-50">Lv. {progress.level}</p>
              <p className="text-xs font-bold tabular-nums text-accent">+{state.sessionXp} XP</p>
            </div>
            <p className="mb-1 text-[10px] text-zinc-400">{rank.label}</p>
            <XpBar pct={progress.pct} className="h-1.5" />
          </div>
          <div
            key={comboShown}
            className={cn(
              'flex h-10 min-w-[3.25rem] items-center justify-center gap-1 rounded-xl border px-2',
              comboShown > 0 ? 'animate-pop border-accent/60 bg-accent/15 text-accent' : 'border-line/40 bg-white/[0.03] text-zinc-500',
            )}
            aria-label={`Combo ${comboShown}`}
          >
            <Icon name="flame" className="h-4 w-4" />
            <span className="font-display text-sm font-bold tabular-nums">{comboShown}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-line/20 bg-black/60 pb-1 pt-1">
        <div className="flex items-center justify-between px-5 py-1.5 text-zinc-300">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => handleTool(tool.id)}
              aria-label={tool.label}
              aria-pressed={tool.id === 'emoji' ? emojiOpen : undefined}
              className={cn(
                'grid h-9 min-w-9 place-items-center rounded-lg px-1.5 transition hover:text-white',
                tool.id === 'emoji' && emojiOpen ? 'text-accent' : '',
              )}
            >
              {tool.icon === null ? <span className="text-[13px] font-bold tracking-wide">GIF</span> : <Icon name={tool.icon} className="h-[22px] w-[22px]" />}
            </button>
          ))}
        </div>
        <div className="px-2 pb-1.5">
          {emojiOpen ? (
            <div className="grid grid-cols-8 gap-1.5">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => dispatch({ type: 'INSERT_TEXT', text: emoji })}
                  aria-label={`Insert ${emoji}`}
                  className="grid h-11 place-items-center rounded-lg bg-key text-xl shadow-keycap active:translate-y-px active:bg-accent/30"
                >
                  {emoji}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setEmojiOpen(false)}
                aria-label="Back to letters"
                className="col-span-8 mt-0.5 h-10 rounded-lg bg-key/70 font-keys text-sm font-semibold text-zinc-200 shadow-keycap"
              >
                ABC
              </button>
            </div>
          ) : (
            <Keyboard
              keyShape={state.settings.keyShape}
              effect={state.settings.keyEffect}
              sound={state.settings.sound}
              soundEnabled={state.settings.soundEnabled}
              numberRow={state.skills['advanced-layouts']}
              onKey={press}
              externalPress={external}
            />
          )}
        </div>
      </div>

      <BottomNav items={navItems} showLabels={false} />
    </div>
  );
}
