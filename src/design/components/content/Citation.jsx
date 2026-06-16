import React from 'react';

/**
 * KMUN Citation — an honest, checkable source reference.
 *
 * <CitationMark n={2} /> renders an inline superscript marker you place
 * after a figure. <Citation> renders the matching footnote row with the
 * source text and an external link the board can click to verify. Honesty
 * is a brand value here: cited facts always show their work.
 */
export function CitationMark({ n, style, ...rest }) {
  return (
    <sup
      style={{
        fontFamily: 'var(--font-data)',
        fontSize: '0.65em',
        fontWeight: 'var(--weight-bold)',
        color: 'var(--text-fact)',
        marginLeft: '1px',
        ...style,
      }}
      {...rest}
    >
      [{n}]
    </sup>
  );
}

export function Citation({ n, source, href, retrieved, style, ...rest }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-2)',
        alignItems: 'baseline',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-xs)',
        lineHeight: 'var(--leading-normal)',
        color: 'var(--text-muted)',
        paddingTop: 'var(--space-2)',
        ...style,
      }}
      {...rest}
    >
      {n != null && (
        <span className="kmun-num" style={{ fontWeight: 'var(--weight-bold)', color: 'var(--text-fact)', flexShrink: 0 }}>[{n}]</span>
      )}
      <span>
        {source}
        {href && (
          <>
            {' '}
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-link)', fontWeight: 'var(--weight-semibold)', textDecoration: 'underline', textUnderlineOffset: '2px', whiteSpace: 'nowrap' }}
            >
              View source ↗
            </a>
          </>
        )}
        {retrieved && <span style={{ color: 'var(--text-faint)' }}> · retrieved {retrieved}</span>}
      </span>
    </div>
  );
}
