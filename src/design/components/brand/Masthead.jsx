import React from 'react';
import { WaveBand } from './WaveBand.jsx';

/**
 * KMUN Masthead — the page header that identifies the station and the
 * presentation. Hand-drawn KMUN wordmark + "91.9 FM · Astoria, Oregon"
 * on the left, optional right-side slot (breadcrumb, print button), a
 * radio-wave band underneath. Pass the logo path via `logoSrc` (copy the
 * wordmark into your project's assets first).
 */
export function Masthead({
  logoSrc,
  frequency = '91.9 FM',
  location = 'Astoria, Oregon',
  title,
  children,
  style,
  ...rest
}) {
  return (
    <header style={{ background: 'var(--color-bg)', ...style }} {...rest}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-6)',
          padding: 'var(--space-5) var(--space-8)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          {logoSrc && (
            <img src={logoSrc} alt="KMUN" style={{ height: '34px', width: 'auto', display: 'block' }} />
          )}
          <span aria-hidden="true" style={{ width: '1px', alignSelf: 'stretch', background: 'var(--border-default)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-md)', color: 'var(--text-heading)' }}>
              {frequency}
            </span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              {location}
            </span>
          </div>
          {title && (
            <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: 'var(--text-display-sm)', color: 'var(--text-heading)', marginLeft: 'var(--space-4)' }}>
              {title}
            </span>
          )}
        </div>
        {children && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>{children}</div>}
      </div>
      <WaveBand />
    </header>
  );
}
