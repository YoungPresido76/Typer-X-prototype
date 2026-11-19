import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { KeyAction, KeyEffect, KeyShape, SoundPackId } from '../types/game';
import { cn, cssVars } from '../lib/cn';
import { playKeySound } from '../lib/sound';
import { Icon } from './Icon';

export interface ExternalPress {
  id: string;
  seq: number;
}

interface KeyboardProps {
  keyShape: KeyShape;
  effect: KeyEffect;
  sound: SoundPackId;
  soundEnabled: boolean;
  numberRow: boolean;
  compact?: boolean;
  onKey?: (action: KeyAction) => void;
  externalPress?: ExternalPress | null;
}

type CapVariant = 'letter' | 'func' | 'accent' | 'space';
type Layout = 'alpha' | 'symbols';

interface FxEntry {
  id: number;
  x: number;
  y: number;
  kind: KeyEffect;
}

const ROW_1 = 'QWERTYUIOP'.split('');
const ROW_2 = 'ASDFGHJKL'.split('');
const ROW_3 = 'ZXCVBNM'.split('');
const NUMBERS = '1234567890'.split('');
const SYM_2 = '-/:;()$&@"'.split('');
const SYM_3 = ['.', ',', '?', '!', "'", '#', '+'];

const REPEAT_DELAY_MS = 380;
const REPEAT_RATE_MS = 55;
const FLASH_MS = 130;
const FX_LIFETIME_MS = 700;

function toAction(id: string, shift: boolean): KeyAction {
  if (id === 'space') {
    return { kind: 'space' };
  }
  if (id === 'enter') {
    return { kind: 'enter' };
  }
  if (id === 'back') {
    return { kind: 'backspace' };
  }
  if (/^[a-z]$/.test(id)) {
    return { kind: 'char', char: shift ? id.toUpperCase() : id };
  }
  return { kind: 'char', char: id };
}

function soundKind(id: string): 'key' | 'space' | 'enter' | 'back' {
  if (id === 'space') {
    return 'space';
  }
  if (id === 'enter') {
    return 'enter';
  }
  if (id === 'back') {
    return 'back';
  }
  return 'key';
}

interface CapProps {
  id: string;
  grow: number;
  label: ReactNode;
  ariaLabel: string;
  variant: CapVariant;
  shape: KeyShape;
  compact: boolean;
  small?: boolean;
  flash: boolean;
  active?: boolean;
  onDown: (id: string, el: HTMLElement) => void;
  onUp: () => void;
}

function CapImpl({
  id,
  grow,
  label,
  ariaLabel,
  variant,
  shape,
  compact,
  small = false,
  flash,
  active,
  onDown,
  onUp,
}: CapProps): ReactElement {
  const height = small ? (compact ? 'h-7' : 'h-8') : compact ? 'h-9' : 'h-[46px]';
  const shapeClass =
    shape === 'rounded'
      ? 'rounded-lg border border-white/[0.06]'
      : shape === 'square'
        ? 'rounded-[3px] border border-white/[0.09]'
        : 'shape-chamfer border border-transparent';
  const variantClass =
    variant === 'accent'
      ? 'bg-accent text-black shadow-glow-sm'
      : variant === 'func'
        ? 'bg-key/70 text-zinc-300 shadow-keycap'
        : variant === 'space'
          ? 'bg-key text-accent-2 shadow-keycap'
          : 'bg-key text-zinc-100 shadow-keycap';
  return (
    <button
      type="button"
      tabIndex={-1}
      data-key={id}
      aria-label={ariaLabel}
      aria-pressed={active}
      style={{ flexGrow: grow, flexBasis: 0 }}
      className={cn(
        'relative grid min-w-0 touch-manipulation select-none place-items-center font-keys font-semibold transition-[transform,background-color,border-color,box-shadow] duration-75 active:translate-y-px',
        height,
        small ? 'text-[12px]' : compact ? 'text-[13px]' : 'text-[15px]',
        shapeClass,
        variantClass,
        active ? 'text-accent' : '',
        flash && variant !== 'accent' ? '!border-accent/80 !bg-accent/30 !text-white shadow-glow-sm' : '',
        flash && variant === 'accent' ? 'brightness-125' : '',
      )}
      onPointerDown={(e: ReactPointerEvent<HTMLButtonElement>) => {
        e.preventDefault();
        onDown(id, e.currentTarget);
      }}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      onPointerCancel={onUp}
      onContextMenu={(e) => e.preventDefault()}
      onClick={(e) => {
        if (e.detail === 0) {
          onDown(id, e.currentTarget);
          onUp();
        }
      }}
    >
      {label}
    </button>
  );
}

const Cap = memo(CapImpl);

function FxView({ fx }: { fx: FxEntry }): ReactElement {
  const sparks = fx.kind === 'spark' ? 7 : fx.kind === 'burst' ? 12 : 0;
  const dist = fx.kind === 'burst' ? 52 : 28;
  const items: ReactElement[] = [];
  for (let i = 0; i < sparks; i += 1) {
    const angle = (i / sparks) * Math.PI * 2 + (fx.id % 5) * 0.3;
    items.push(
      <span
        key={i}
        className="fx-spark"
        style={cssVars({ '--dx': `${Math.cos(angle) * dist}px`, '--dy': `${Math.sin(angle) * dist}px` })}
      />,
    );
  }
  const ring =
    fx.kind === 'pulse' ? (
      <span className="fx-ring h-11 w-11" />
    ) : fx.kind === 'ripple' ? (
      <span className="fx-ring fx-ring-wide h-20 w-20" />
    ) : fx.kind === 'burst' ? (
      <span className="fx-ring fx-ring-wide h-24 w-24" />
    ) : null;
  return (
    <span className="absolute" style={{ left: fx.x, top: fx.y }}>
      {ring}
      {items}
    </span>
  );
}

export function Keyboard({
  keyShape,
  effect,
  sound,
  soundEnabled,
  numberRow,
  compact = false,
  onKey,
  externalPress = null,
}: KeyboardProps): ReactElement {
  const [shift, setShift] = useState<boolean>(false);
  const [layout, setLayout] = useState<Layout>('alpha');
  const [flashId, setFlashId] = useState<string | null>(null);
  const [fxList, setFxList] = useState<FxEntry[]>([]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const shiftRef = useRef<boolean>(false);
  const fxSeq = useRef<number>(0);
  const flashTimer = useRef<number | null>(null);
  const repeatDelay = useRef<number | null>(null);
  const repeatTick = useRef<number | null>(null);
  const fxTimers = useRef<Set<number>>(new Set());
  const live = useRef({ onKey, effect, sound, soundEnabled });
  live.current = { onKey, effect, sound, soundEnabled };

  const flash = useCallback((id: string): void => {
    setFlashId(id);
    if (flashTimer.current !== null) {
      window.clearTimeout(flashTimer.current);
    }
    flashTimer.current = window.setTimeout(() => setFlashId(null), FLASH_MS);
  }, []);

  const spawnFx = useCallback((el: HTMLElement, kind: KeyEffect): void => {
    const container = containerRef.current;
    if (kind === 'none' || container === null) {
      return;
    }
    const c = container.getBoundingClientRect();
    const k = el.getBoundingClientRect();
    fxSeq.current += 1;
    const entry: FxEntry = {
      id: fxSeq.current,
      x: k.left - c.left + k.width / 2,
      y: k.top - c.top + k.height / 2,
      kind,
    };
    setFxList((prev) => [...prev.slice(-9), entry]);
    const timer = window.setTimeout(() => {
      fxTimers.current.delete(timer);
      setFxList((prev) => prev.filter((f) => f.id !== entry.id));
    }, FX_LIFETIME_MS);
    fxTimers.current.add(timer);
  }, []);

  const trigger = useCallback(
    (id: string, el: HTMLElement | null, external: boolean): void => {
      const cfg = live.current;
      if (cfg.soundEnabled) {
        playKeySound(cfg.sound, soundKind(id));
      }
      flash(id);
      if (el !== null) {
        spawnFx(el, cfg.effect);
      }
      if (external) {
        return;
      }
      if (id === 'shift') {
        shiftRef.current = !shiftRef.current;
        setShift(shiftRef.current);
        return;
      }
      if (id === 'sym') {
        shiftRef.current = false;
        setShift(false);
        setLayout((prev) => (prev === 'alpha' ? 'symbols' : 'alpha'));
        return;
      }
      const action = toAction(id, shiftRef.current);
      if (shiftRef.current && action.kind === 'char') {
        shiftRef.current = false;
        setShift(false);
      }
      if (cfg.onKey) {
        cfg.onKey(action);
      }
    },
    [flash, spawnFx],
  );

  const stopRepeat = useCallback((): void => {
    if (repeatDelay.current !== null) {
      window.clearTimeout(repeatDelay.current);
      repeatDelay.current = null;
    }
    if (repeatTick.current !== null) {
      window.clearInterval(repeatTick.current);
      repeatTick.current = null;
    }
  }, []);

  const onDown = useCallback(
    (id: string, el: HTMLElement): void => {
      stopRepeat();
      trigger(id, el, false);
      if (id === 'back') {
        repeatDelay.current = window.setTimeout(() => {
          repeatTick.current = window.setInterval(() => trigger('back', el, false), REPEAT_RATE_MS);
        }, REPEAT_DELAY_MS);
      }
    },
    [stopRepeat, trigger],
  );

  useEffect(() => {
    const timers = fxTimers.current;
    return () => {
      stopRepeat();
      if (flashTimer.current !== null) {
        window.clearTimeout(flashTimer.current);
      }
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
    };
  }, [stopRepeat]);

  const externalSeq = externalPress === null ? 0 : externalPress.seq;
  const externalId = externalPress === null ? null : externalPress.id;
  useEffect(() => {
    if (externalId === null || externalSeq === 0) {
      return;
    }
    const container = containerRef.current;
    let target: HTMLElement | null = null;
    if (container !== null) {
      const found = Array.from(container.querySelectorAll<HTMLElement>('[data-key]')).find(
        (node) => node.dataset.key === externalId,
      );
      target = found ?? null;
    }
    trigger(externalId, target, true);
  }, [externalId, externalSeq, trigger]);

  const cap = (
    id: string,
    label: ReactNode,
    grow: number,
    ariaLabel: string,
    variant: CapVariant = 'letter',
    opts: { small?: boolean; active?: boolean } = {},
  ): ReactElement => (
    <Cap
      key={id}
      id={id}
      grow={grow}
      label={label}
      ariaLabel={ariaLabel}
      variant={variant}
      shape={keyShape}
      compact={compact}
      small={opts.small}
      flash={flashId === id}
      active={opts.active}
      onDown={onDown}
      onUp={stopRepeat}
    />
  );

  const gap = compact ? 'gap-1' : 'gap-1.5';
  const rowClass = cn('flex', gap);
  const shiftKey = cap('shift', <Icon name="shift" className="h-[18px] w-[18px]" />, 1.5, 'Shift', 'func', { active: shift });
  const backKey = cap('back', <Icon name="backspace" className="h-5 w-5" />, 1.5, 'Backspace', 'func');

  return (
    <div ref={containerRef} className={cn('relative flex flex-col', gap)}>
      {layout === 'alpha' ? (
        <>
          {numberRow ? <div className={rowClass}>{NUMBERS.map((n) => cap(n, n, 1, `${n} key`, 'func', { small: true }))}</div> : null}
          <div className={rowClass}>{ROW_1.map((c) => cap(c.toLowerCase(), c, 1, `${c} key`))}</div>
          <div className={cn(rowClass, 'px-[5%]')}>{ROW_2.map((c) => cap(c.toLowerCase(), c, 1, `${c} key`))}</div>
          <div className={rowClass}>
            {shiftKey}
            {ROW_3.map((c) => cap(c.toLowerCase(), c, 1, `${c} key`))}
            {backKey}
          </div>
        </>
      ) : (
        <>
          <div className={rowClass}>{NUMBERS.map((n) => cap(n, n, 1, `${n} key`))}</div>
          <div className={rowClass}>{SYM_2.map((c) => cap(c, c, 1, `${c} key`))}</div>
          <div className={rowClass}>
            <span style={{ flexGrow: 1.5, flexBasis: 0 }} aria-hidden="true" />
            {SYM_3.map((c) => cap(c, c, 1, `${c} key`))}
            {backKey}
          </div>
        </>
      )}
      <div className={rowClass}>
        {cap('sym', layout === 'alpha' ? '?123' : 'ABC', 1.4, layout === 'alpha' ? 'Numbers and symbols' : 'Letters', 'func')}
        {cap(',', ',', 1, 'Comma')}
        {cap('space', 'Space', 5, 'Space', 'space')}
        {cap('.', '.', 1, 'Period')}
        {cap('enter', <Icon name="enter" className="h-5 w-5" strokeWidth={2.2} />, 1.4, 'Enter', 'accent')}
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
        {fxList.map((fx) => (
          <FxView key={fx.id} fx={fx} />
        ))}
      </div>
    </div>
  );
}
