import type { CssVars } from '../types/game';

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter((p): p is string => typeof p === 'string' && p.length > 0).join(' ');
}

/** Builds an inline style object that may mix normal CSS properties with custom properties. */
export function cssVars(vars: Record<string, string>): CssVars {
  return vars as CssVars;
}
