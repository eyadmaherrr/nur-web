import type { CSSProperties } from 'react';

/** Inline `--reveal-delay` for staggering [data-reveal] elements (see globals.css). */
export function revealDelay(ms: number): CSSProperties {
  return { '--reveal-delay': `${ms}ms` } as CSSProperties;
}
