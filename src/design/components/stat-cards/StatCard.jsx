import React from 'react';

/**
 * KMUN StatCard — a single headline figure in one of three meaning tiers.
 *
 * The two-tier visual language lives here:
 *   fact       → solid border, calm teal surface, "Fact" tag
 *   assumption → DASHED amber border, cream surface, "Assumption" tag (interactive)
 *   warning    → solid vermillion border, blush surface, "Watch" tag
 *
 * Meaning is never color-only: every variant also carries a worded tag and
 * a glyph, so it reads on a black-and-white printout and for color-blind viewers.
 */
export function StatCard({
  variant = 'fact',
  label,
  value,
  prefix,
  suffix,
  caption,
  tag,
  children,
  style,
  ...rest
}) {
  const cfg = {
    fact: {
      surface: 'var(--surface-fact)',
      border: 'var(--border-fact)',
      borderStyle: 'solid',
      accent: 'var(--text-fact)',
      defaultTag: 'Fact',
      glyph: '●',
    },
    assumption: {
      surface: 'var(--surface-assumption)',
      border: 'var(--border-assumption)',
      borderStyle: 'dashed',
      accent: 'var(--text-assumption)',
      defaultTag: 'Assumption',
      glyph: '◇',
    },
    warning: {
      surface: 'var(--surface-warning)',
      border: 'var(--border-warning)',
      borderStyle: 'solid',
      accent: 'var(--text-warning)',
      defaultTag: 'Watch',
      glyph: '▲',
    },
  }[variant];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        padding: 'var(--space-6)',
        background: cfg.surface,
        border: `var(--border-thin) ${cfg.borderStyle} ${cfg.border}`,
        borderRadius: 'var(--radius-md)',
        minWidth: '220px',
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        {label && (
          <span className="kmun-eyebrow" style={{ color: 'var(--text-muted)' }}>{label}</span>
        )}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-semibold)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: cfg.accent,
            whiteSpace: 'nowrap',
          }}
        >
          <span aria-hidden="true" style={{ fontSize: '0.85em' }}>{cfg.glyph}</span>
          {tag || cfg.defaultTag}
        </span>
      </div>

      <div
        className="kmun-num"
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '0.1em',
          fontFamily: 'var(--font-data)',
          fontSize: 'var(--text-stat-lg)',
          fontWeight: 'var(--weight-bold)',
          lineHeight: 'var(--leading-tight)',
          color: 'var(--text-heading)',
        }}
      >
        {prefix && <span style={{ fontSize: '0.6em', fontWeight: 'var(--weight-semibold)', color: 'var(--text-muted)' }}>{prefix}</span>}
        <span>{value}</span>
        {suffix && <span style={{ fontSize: '0.5em', fontWeight: 'var(--weight-semibold)', color: 'var(--text-muted)' }}>{suffix}</span>}
      </div>

      {caption && (
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 'var(--leading-normal)' }}>
          {caption}
        </p>
      )}
      {children}
    </div>
  );
}
