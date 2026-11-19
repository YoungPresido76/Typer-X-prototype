import { useState, type ReactElement, type ReactNode } from 'react';
import type { FontId, IconName, KeyEffect, KeyShape, ScreenId, SkillId, SoundPackId, ThemeId } from '../types/game';
import { cn } from '../lib/cn';
import { playKeySound } from '../lib/sound';
import { EFFECTS, FONTS, FONT_STACKS, KEY_SHAPES, SOUNDS, isUnlocked, labelOf, type Option } from '../data/options';
import { SKILL_DEFS } from '../data/skills';
import { RARITY_STYLE, THEMES, getTheme, themeVars } from '../data/themes';
import { useGame } from '../state/GameContext';
import { HudCard } from '../components/HudCard';
import { Icon } from '../components/Icon';
import { Keyboard } from '../components/Keyboard';
import { ThemeArt } from '../components/ThemeArt';

interface CustomizationLabScreenProps {
  navigate: (screen: ScreenId) => void;
}

type LabTab = 'themes' | 'shape' | 'effects' | 'sound';

const TABS: ReadonlyArray<{ id: LabTab; label: string }> = [
  { id: 'themes', label: 'Themes' },
  { id: 'shape', label: 'Key Shape' },
  { id: 'effects', label: 'Effects' },
  { id: 'sound', label: 'Sound' },
];

const EFFECT_ICONS: Record<KeyEffect, IconName> = {
  none: 'close',
  pulse: 'target',
  spark: 'sparkles',
  ripple: 'diamond',
  burst: 'flame',
};

interface OptionGridProps<T extends string> {
  options: readonly Option<T>[];
  value: T;
  skills: Record<SkillId, boolean>;
  onSelect: (id: T) => void;
  renderIcon: (id: T) => ReactNode;
}

function OptionGrid<T extends string>({ options, value, skills, onSelect, renderIcon }: OptionGridProps<T>): ReactElement {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {options.map((option) => {
        const unlocked = isUnlocked(option.requires, skills);
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            disabled={!unlocked}
            onClick={() => onSelect(option.id)}
            aria-pressed={selected}
            className={cn(
              'relative flex flex-col items-start gap-2 rounded-2xl border p-3 text-left transition',
              selected ? 'border-accent bg-accent/10 shadow-glow-sm' : 'border-line/50 bg-card/70',
              unlocked ? 'hover:border-accent/60 active:scale-[0.99]' : 'opacity-60',
            )}
          >
            <span className={cn('grid h-9 w-9 place-items-center rounded-lg border', selected ? 'border-accent/60 text-accent' : 'border-line/40 text-zinc-300')}>
              {renderIcon(option.id)}
            </span>
            <span>
              <span className="block text-sm font-semibold text-zinc-50">{option.label}</span>
              <span className="block text-[11px] leading-snug text-zinc-400">{option.hint}</span>
            </span>
            {!unlocked && option.requires !== null ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-accent">
                <Icon name="lock" className="h-3 w-3" />
                {SKILL_DEFS[option.requires].name}
              </span>
            ) : null}
            {selected ? (
              <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-accent text-black">
                <Icon name="check" className="h-3 w-3" strokeWidth={3} />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function ShapeGlyph({ shape }: { shape: KeyShape }): ReactElement {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'block h-4 w-5 bg-current',
        shape === 'rounded' ? 'rounded-md' : shape === 'square' ? 'rounded-[2px]' : 'shape-chamfer',
      )}
    />
  );
}

interface SettingRowProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  onClick: () => void;
}

function SettingRow({ icon, label, value, onClick }: SettingRowProps): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-full items-center gap-3 px-3.5 text-left transition hover:bg-white/[0.04] active:bg-white/[0.07]"
    >
      <span className="grid h-6 w-6 place-items-center text-accent">{icon}</span>
      <span className="flex-1 text-[15px] text-zinc-100">{label}</span>
      <span className="flex items-center gap-1.5 text-sm text-zinc-400">{value}</span>
      <Icon name="chevron" className="h-4 w-4 text-zinc-500" />
    </button>
  );
}

export function CustomizationLabScreen({ navigate }: CustomizationLabScreenProps): ReactElement {
  const { state, dispatch } = useGame();
  const { settings, skills } = state;
  const [tab, setTab] = useState<LabTab>('themes');
  const [preview, setPreview] = useState<ThemeId>(settings.theme);

  const previewTheme = getTheme(preview);
  const previewUnlocked = isUnlocked(previewTheme.requires, skills);
  const applied = settings.theme === preview;
  const fontStack = FONT_STACKS[settings.font];

  const cycleFont = (): void => {
    const index = FONTS.findIndex((f) => f.id === settings.font);
    const nextFont: FontId = FONTS[(index + 1) % FONTS.length].id;
    dispatch({ type: 'UPDATE_SETTINGS', patch: { font: nextFont } });
  };

  const selectSound = (id: SoundPackId): void => {
    dispatch({ type: 'UPDATE_SETTINGS', patch: { sound: id } });
    if (settings.soundEnabled) {
      playKeySound(id, 'key');
    }
  };

  const onApply = (): void => {
    if (previewUnlocked) {
      dispatch({ type: 'UPDATE_SETTINGS', patch: { theme: preview } });
    } else {
      navigate('progression');
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="safe-top flex items-center gap-2 px-3 pb-2 pt-3">
        <button
          type="button"
          onClick={() => navigate('command')}
          aria-label="Back to Command Center"
          className="grid h-10 w-10 place-items-center rounded-full text-zinc-200 hover:bg-white/5"
        >
          <Icon name="back" className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold text-zinc-50">Customization Lab</h1>
        <span className="grid h-10 w-10 place-items-center text-accent" aria-hidden="true">
          <Icon name="palette" className="h-6 w-6" />
        </span>
      </header>

      <div role="tablist" aria-label="Customization sections" className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'h-9 shrink-0 rounded-full border px-4 text-sm font-semibold transition',
              tab === t.id ? 'border-accent bg-accent/10 text-accent shadow-glow-sm' : 'border-line/50 text-zinc-300 hover:border-accent/50',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-4 pb-4" role="tabpanel">
        {tab === 'themes' ? (
          <section aria-label="Themes">
            <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
              {THEMES.map((t) => {
                const unlocked = isUnlocked(t.requires, skills);
                const isPreview = preview === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setPreview(t.id)}
                    aria-pressed={isPreview}
                    aria-label={`${t.name}, ${t.rarity}${unlocked ? '' : ', locked'}`}
                    className={cn(
                      'relative h-36 w-[74%] shrink-0 snap-center overflow-hidden rounded-2xl border-2 transition',
                      isPreview ? 'border-accent shadow-glow' : 'border-line/40 opacity-80',
                    )}
                  >
                    <ThemeArt themeId={t.id} className="h-full w-full" />
                    {settings.theme === t.id ? (
                      <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full border-2 border-black/50 bg-accent text-black">
                        <Icon name="check" className="h-4 w-4" strokeWidth={3} />
                      </span>
                    ) : null}
                    {!unlocked ? (
                      <span className="absolute inset-0 grid place-items-center bg-black/65">
                        <span className="flex flex-col items-center gap-1 text-xs font-semibold text-zinc-200">
                          <Icon name="lock" className="h-6 w-6 text-accent" />
                          Requires {t.requires !== null ? SKILL_DEFS[t.requires].name : ''}
                        </span>
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between px-1">
              <p className="font-display text-base font-bold text-zinc-50">{previewTheme.name}</p>
              <span className={cn('flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold', RARITY_STYLE[previewTheme.rarity])}>
                <Icon name="diamond" className="h-3 w-3" />
                {previewTheme.rarity}
              </span>
            </div>
          </section>
        ) : null}

        {tab === 'shape' ? (
          <OptionGrid
            options={KEY_SHAPES}
            value={settings.keyShape}
            skills={skills}
            onSelect={(id) => dispatch({ type: 'UPDATE_SETTINGS', patch: { keyShape: id } })}
            renderIcon={(id) => <ShapeGlyph shape={id} />}
          />
        ) : null}

        {tab === 'effects' ? (
          <OptionGrid
            options={EFFECTS}
            value={settings.keyEffect}
            skills={skills}
            onSelect={(id) => dispatch({ type: 'UPDATE_SETTINGS', patch: { keyEffect: id } })}
            renderIcon={(id) => <Icon name={EFFECT_ICONS[id]} className="h-5 w-5" />}
          />
        ) : null}

        {tab === 'sound' ? (
          <OptionGrid
            options={SOUNDS}
            value={settings.sound}
            skills={skills}
            onSelect={selectSound}
            renderIcon={() => <Icon name="volume" className="h-5 w-5" />}
          />
        ) : null}

        {tab !== 'themes' ? (
          <p className="px-1 text-xs text-zinc-500">
            Locked options are unlocked with skill points.{' '}
            <button type="button" onClick={() => navigate('progression')} className="font-semibold text-accent underline-offset-2 hover:underline">
              Open Skill Tree
            </button>
          </p>
        ) : null}

        <div style={themeVars(preview, fontStack)} className="rounded-2xl border border-accent/50 bg-black/60 p-2.5 shadow-glow-sm">
          <Keyboard
            keyShape={settings.keyShape}
            effect={settings.keyEffect}
            sound={settings.sound}
            soundEnabled={settings.soundEnabled}
            numberRow={false}
            compact
          />
        </div>

        <HudCard className="divide-y divide-line/30">
          <SettingRow
            icon={<Icon name="square" className="h-5 w-5" />}
            label="Key Shape"
            value={labelOf(KEY_SHAPES, settings.keyShape)}
            onClick={() => setTab('shape')}
          />
          <SettingRow
            icon={<Icon name="sparkles" className="h-5 w-5" />}
            label="Keypress Effect"
            value={labelOf(EFFECTS, settings.keyEffect)}
            onClick={() => setTab('effects')}
          />
          <SettingRow
            icon={<Icon name="volume" className="h-5 w-5" />}
            label="Sound"
            value={labelOf(SOUNDS, settings.sound)}
            onClick={() => setTab('sound')}
          />
          <SettingRow
            icon={<span className="font-display text-base font-bold">Aa</span>}
            label="Font"
            value={labelOf(FONTS, settings.font)}
            onClick={cycleFont}
          />
          <SettingRow
            icon={<Icon name="image" className="h-5 w-5" />}
            label="Background"
            value={
              <>
                <span className="text-xs">{skills['dynamic-backgrounds'] ? 'Animated' : 'Static'}</span>
                <ThemeArt themeId={settings.theme} className="h-5 w-9 overflow-hidden rounded" />
              </>
            }
            onClick={() => setTab('themes')}
          />
        </HudCard>
      </div>

      <div className="safe-bottom shrink-0 border-t border-line/30 bg-black/50 px-4 pb-3 pt-3 backdrop-blur-md">
        <button
          type="button"
          onClick={onApply}
          disabled={applied}
          className={cn(
            'flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-bold transition',
            applied
              ? 'border border-accent/40 bg-accent/10 text-accent'
              : previewUnlocked
                ? 'bg-accent text-black shadow-glow active:scale-[0.99]'
                : 'border border-line/60 bg-white/[0.04] text-zinc-200',
          )}
        >
          {applied ? (
            <>
              <Icon name="check" className="h-5 w-5" strokeWidth={2.6} />
              Theme Applied
            </>
          ) : previewUnlocked ? (
            <>
              <Icon name="check" className="h-5 w-5" strokeWidth={2.6} />
              Apply Theme
            </>
          ) : (
            <>
              <Icon name="lock" className="h-5 w-5" />
              Unlock in Skill Tree
            </>
          )}
        </button>
      </div>
    </div>
  );
}
