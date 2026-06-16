import React from 'react';

/**
 * KMUN Breadcrumb — small uppercase trail showing where you are in the
 * five-chapter presentation. The current page is bold ink; ancestors are
 * teal links. Separators are a low-contrast slash.
 */
export function Breadcrumb({ items = [], style, ...rest }) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-2)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-eyebrow)',
        fontWeight: 'var(--weight-semibold)',
        letterSpacing: 'var(--tracking-eyebrow)',
        textTransform: 'uppercase',
        ...style,
      }}
      {...rest}
    >
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {last || !item.href ? (
              <span aria-current={last ? 'page' : undefined} style={{ color: last ? 'var(--text-heading)' : 'var(--text-muted)', fontWeight: last ? 'var(--weight-bold)' : 'var(--weight-semibold)' }}>
                {item.label}
              </span>
            ) : (
              <a href={item.href} style={{ color: 'var(--text-link)', textDecoration: 'none' }}>
                {item.label}
              </a>
            )}
            {!last && <span aria-hidden="true" style={{ color: 'var(--text-faint)' }}>/</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
