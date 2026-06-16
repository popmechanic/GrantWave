import React from 'react';

/**
 * KMUN WaveBand — the retro multi-stripe "radio wave" accent, as a thin
 * horizontal band. Plum · vermillion · burnt-orange · amber · teal,
 * repeating. Use it at the top/bottom of mastheads, hero, and footers.
 * Purely decorative (aria-hidden).
 */
export function WaveBand({ height = 'var(--wave-band)', style, ...rest }) {
  return (
    <div
      aria-hidden="true"
      className="kmun-wave-band"
      style={{ height, ...style }}
      {...rest}
    />
  );
}
