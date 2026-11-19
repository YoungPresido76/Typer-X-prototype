import { memo, type ReactElement } from 'react';
import { cssVars } from '../lib/cn';

interface EmberSpec {
  id: number;
  left: number;
  size: number;
  dur: number;
  delay: number;
  drift: number;
}

function buildEmbers(count: number): EmberSpec[] {
  const out: EmberSpec[] = [];
  for (let i = 0; i < count; i += 1) {
    const a = (i * 37 + 11) % 100;
    const b = (i * 53 + 7) % 100;
    const c = (i * 29 + 3) % 100;
    out.push({
      id: i,
      left: a,
      size: 2 + (b % 4),
      dur: 9 + (c % 9),
      delay: -((b * 7) % 14),
      drift: (a % 2 === 0 ? 1 : -1) * (12 + (c % 40)),
    });
  }
  return out;
}

const EMBERS: readonly EmberSpec[] = buildEmbers(16);

interface EmberBackgroundProps {
  dynamic: boolean;
}

function EmberBackgroundImpl({ dynamic }: EmberBackgroundProps): ReactElement {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 60% at 50% -10%, rgb(var(--accent) / 0.16), transparent 60%), radial-gradient(90% 50% at 50% 115%, rgb(var(--accent) / 0.14), transparent 65%), rgb(var(--bg))',
        }}
      />
      <div className="hud-grid absolute inset-0 opacity-70" />
      {dynamic
        ? EMBERS.map((e) => (
            <span
              key={e.id}
              className="ember"
              style={cssVars({
                left: `${e.left}%`,
                width: `${e.size}px`,
                height: `${e.size}px`,
                '--dur': `${e.dur}s`,
                '--delay': `${e.delay}s`,
                '--drift': `${e.drift}px`,
              })}
            />
          ))
        : null}
    </div>
  );
}

export const EmberBackground = memo(EmberBackgroundImpl);
