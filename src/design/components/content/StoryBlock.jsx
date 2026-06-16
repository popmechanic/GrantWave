import React from 'react';

/**
 * KMUN StoryBlock — a warm narrative callout that sits between the data.
 * This is where the human voice lives: "Here is what this means for the
 * people who keep KMUN on the air." Three tones map to the meaning system
 * plus a plain "note" tone. A serif lead line carries the warmth; the
 * body is plain sans.
 */
export function StoryBlock({
  tone = 'note',
  eyebrow,
  title,
  children,
  style,
  ...rest
}) {
  const cfg = {
    note: { rule: 'var(--border-default)', bg: 'var(--surface-card)', accent: 'var(--text-muted)', glyph: '“' },
    fact: { rule: 'var(--border-fact)', bg: 'var(--surface-fact)', accent: 'var(--text-fact)', glyph: '●' },
    assumption: { rule: 'var(--border-assumption)', bg: 'var(--surface-assumption)', accent: 'var(--text-assumption)', glyph: '◇' },
    warning: { rule: 'var(--border-warning)', bg: 'var(--surface-warning)', accent: 'var(--text-warning)', glyph: '▲' },
  }[tone];

  const dashed = tone === 'assumption';

  return (
    <aside
      style={{
        position: 'relative',
        background: cfg.bg,
        borderRadius: 'var(--radius-md)',
        borderLeft: `var(--border-thick) ${dashed ? 'dashed' : 'solid'} ${cfg.rule}`,
        border: tone === 'note' ? 'var(--border-hair) solid var(--border-default)' : undefined,
        borderLeftWidth: 'var(--border-thick)',
        borderLeftStyle: dashed ? 'dashed' : 'solid',
        borderLeftColor: cfg.rule,
        padding: 'var(--space-6) var(--space-8)',
        ...style,
      }}
      {...rest}
    >
      {eyebrow && (
        <div className="kmun-eyebrow" style={{ color: cfg.accent, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <span aria-hidden="true">{cfg.glyph}</span> {eyebrow}
        </div>
      )}
      {title && (
        <h3 style={{ fontFamily: 'var(--font-serif-display)', fontSize: 'var(--text-display-sm)', margin: '0 0 var(--space-3)', color: 'var(--text-heading)' }}>
          {title}
        </h3>
      )}
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text-body)' }}>
        {children}
      </div>
    </aside>
  );
}
