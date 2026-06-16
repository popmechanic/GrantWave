import React from 'react';

/**
 * KMUN LegendChip — one entry in a chart legend. Renders a sample swatch
 * that matches how the series is drawn: a solid bar/line for facts, a
 * dashed line for assumptions/projections, or a shaded range band. Keeps
 * the chart's two-tier language readable away from the plot.
 */
export function LegendChip({
  label,
  color = 'var(--accent-fact)',
  sample = 'line',
  style,
  ...rest
}) {
  let swatch;
  if (sample === 'dashed') {
    swatch = <span aria-hidden="true" style={{ width: '22px', height: 0, borderTop: `3px dashed ${color}`, display: 'inline-block' }} />;
  } else if (sample === 'band') {
    swatch = <span aria-hidden="true" style={{ width: '22px', height: '14px', background: color, opacity: 0.35, border: `1px solid ${color}`, borderRadius: '2px', display: 'inline-block' }} />;
  } else if (sample === 'dot') {
    swatch = <span aria-hidden="true" style={{ width: '12px', height: '12px', background: color, borderRadius: '50%', display: 'inline-block' }} />;
  } else {
    swatch = <span aria-hidden="true" style={{ width: '22px', height: 0, borderTop: `3px solid ${color}`, display: 'inline-block' }} />;
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: '4px 12px',
        background: 'var(--surface-card)',
        border: 'var(--border-hair) solid var(--border-default)',
        borderRadius: 'var(--radius-pill)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--weight-medium)',
        color: 'var(--text-body)',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {swatch}
      {label}
    </span>
  );
}
