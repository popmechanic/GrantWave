import React from 'react';

/**
 * KMUN AskHero — the signature "The Ask" banner that opens the hub.
 * Butter-cream surface framed top and bottom by the radio-wave stripe,
 * a serif kicker, a big honest headline, and the single ask figure set
 * large in the display serif. This is the emotional center of the deck:
 * a serious number, presented warmly.
 */
export function AskHero({
  eyebrow = 'The Ask',
  headline,
  amount,
  amountCaption,
  children,
  style,
  ...rest
}) {
  return (
    <section
      style={{
        position: 'relative',
        background: 'var(--surface-hero)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: 'var(--border-thin) solid var(--border-default)',
        ...style,
      }}
      {...rest}
    >
      <div className="kmun-wave-band" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)',
          gap: 'var(--space-10)',
          alignItems: 'center',
          padding: 'var(--space-12) var(--space-12)',
        }}
      >
        <div>
          <div className="kmun-eyebrow" style={{ color: 'var(--text-warning)', marginBottom: 'var(--space-3)' }}>
            ◆ {eyebrow}
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif-display)', fontSize: 'var(--text-display-lg)', lineHeight: 'var(--leading-snug)', margin: 0, color: 'var(--text-heading)', textWrap: 'balance' }}>
            {headline}
          </h1>
          {children && (
            <div style={{ marginTop: 'var(--space-5)', fontSize: 'var(--text-xl)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text-body)', maxWidth: 'var(--measure)' }}>
              {children}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            className="kmun-num"
            style={{
              fontFamily: 'var(--font-serif-display)',
              fontSize: 'var(--text-display-xl)',
              fontWeight: 'var(--weight-bold)',
              lineHeight: 'var(--leading-tight)',
              color: 'var(--text-heading)',
              fontFeatureSettings: 'var(--numeric-feature)',
            }}
          >
            {amount}
          </div>
          {amountCaption && (
            <div style={{ fontSize: 'var(--text-md)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
              {amountCaption}
            </div>
          )}
        </div>
      </div>
      <div className="kmun-wave-band" />
    </section>
  );
}
