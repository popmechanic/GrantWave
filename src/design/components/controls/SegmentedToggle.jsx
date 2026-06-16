import React from 'react';

/**
 * KMUN SegmentedToggle — a binary (or few-option) segmented control.
 * Built for the 32 ⇄ 40 hour switch on the salary cards. Because it is
 * interactive, it wears the "assumption" amber language: an amber track
 * with a solid amber selected segment, so the board can see at a glance
 * that this is a knob they can turn — not a fixed fact.
 */
export function SegmentedToggle({
  options = [],
  value,
  onChange,
  name,
  size = 'md',
  ariaLabel,
  style,
  ...rest
}) {
  const pad = size === 'sm' ? '6px 14px' : '9px 20px';
  const fs = size === 'sm' ? 'var(--text-sm)' : 'var(--text-md)';

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        padding: '3px',
        gap: '3px',
        background: 'var(--surface-assumption)',
        border: 'var(--border-thin) dashed var(--border-assumption)',
        borderRadius: 'var(--radius-pill)',
        ...style,
      }}
      {...rest}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            name={name}
            onClick={() => onChange && onChange(opt.value)}
            style={{
              appearance: 'none',
              cursor: 'pointer',
              padding: pad,
              border: selected ? '2px solid var(--accent-assumption)' : '2px solid transparent',
              borderRadius: 'var(--radius-pill)',
              background: selected ? 'var(--accent-assumption)' : 'transparent',
              color: selected ? '#fff' : 'var(--text-assumption)',
              fontFamily: 'var(--font-sans)',
              fontSize: fs,
              fontWeight: selected ? 'var(--weight-bold)' : 'var(--weight-semibold)',
              fontFeatureSettings: 'var(--numeric-feature)',
              lineHeight: 1,
              transition: 'background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)',
              whiteSpace: 'nowrap',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
