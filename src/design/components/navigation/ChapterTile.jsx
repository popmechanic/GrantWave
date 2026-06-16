import React from 'react';

/**
 * KMUN ChapterTile — a large, friendly entry point to one of the four
 * chapters on the hub. Numbered, serif-titled, with a one-line plain
 * description and an arrow that nudges right on hover. Calm card surface
 * with a sand border that warms to teal on hover.
 */
export function ChapterTile({
  number,
  title,
  description,
  href = '#',
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        textDecoration: 'none',
        padding: 'var(--space-6)',
        background: 'var(--surface-card)',
        border: `var(--border-thin) solid ${hover ? 'var(--border-fact)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'all var(--dur-base) var(--ease-standard)',
        ...style,
      }}
      {...rest}
    >
      <span
        className="kmun-num"
        aria-hidden="true"
        style={{
          fontFamily: 'var(--font-serif-display)',
          fontSize: 'var(--text-display-md)',
          fontWeight: 'var(--weight-bold)',
          lineHeight: 1,
          color: hover ? 'var(--text-fact)' : 'var(--text-faint)',
          transition: 'color var(--dur-base) var(--ease-standard)',
        }}
      >
        {String(number).padStart(2, '0')}
      </span>
      <h3 style={{ fontFamily: 'var(--font-serif-display)', fontSize: 'var(--text-display-sm)', margin: 0, color: 'var(--text-heading)' }}>
        {title}
      </h3>
      {description && (
        <p style={{ margin: 0, fontSize: 'var(--text-md)', color: 'var(--text-muted)', lineHeight: 'var(--leading-normal)', flex: 1 }}>
          {description}
        </p>
      )}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-fact)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-md)' }}>
        Open chapter
        <span aria-hidden="true" style={{ transform: hover ? 'translateX(4px)' : 'none', transition: 'transform var(--dur-base) var(--ease-standard)' }}>→</span>
      </span>
    </a>
  );
}
