import { useId, type ReactElement } from 'react';
import type { ThemeId } from '../types/game';
import { getTheme } from '../data/themes';

interface ThemeArtProps {
  themeId: ThemeId;
  className?: string;
}

export function ThemeArt({ themeId, className }: ThemeArtProps): ReactElement {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const sky = `ta-sky-${uid}`;
  const halo = `ta-halo-${uid}`;
  const blur = `ta-blur-${uid}`;
  const { art } = getTheme(themeId);
  return (
    <svg
      viewBox="0 0 320 200"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label={`${getTheme(themeId).name} background art`}
    >
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={art.sky[0]} />
          <stop offset="0.55" stopColor={art.sky[1]} />
          <stop offset="1" stopColor={art.sky[2]} />
        </linearGradient>
        <radialGradient id={halo} cx="0.62" cy="0.78" r="0.55">
          <stop offset="0" stopColor={art.glow} stopOpacity="0.75" />
          <stop offset="1" stopColor={art.glow} stopOpacity="0" />
        </radialGradient>
        <filter id={blur} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>
      <rect width="320" height="200" fill={`url(#${sky})`} />
      <rect width="320" height="200" fill={`url(#${halo})`} />
      <polygon
        points="0,120 30,92 55,114 90,66 120,104 152,58 186,100 216,72 250,110 286,82 320,104 320,200 0,200"
        fill={art.ridge}
        opacity="0.82"
      />
      <polygon
        points="0,162 38,130 70,152 112,112 150,156 190,122 232,162 272,134 320,160 320,200 0,200"
        fill={art.ridge}
      />
      <g fill="none" stroke={art.crack} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${blur})`} opacity="0.9">
        <polyline points="40,200 60,172 52,152 72,130" />
        <polyline points="150,200 170,174 160,156 184,128" />
        <polyline points="250,200 232,178 246,152 228,134" />
      </g>
      <g fill="none" stroke={art.crack} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="40,200 60,172 52,152 72,130" />
        <polyline points="60,172 80,168 92,150" />
        <polyline points="150,200 170,174 160,156 184,128" />
        <polyline points="170,174 196,170 206,150" />
        <polyline points="250,200 232,178 246,152 228,134" />
        <polyline points="246,152 270,148 284,132" />
        <polyline points="110,200 118,184 104,170" />
      </g>
    </svg>
  );
}
