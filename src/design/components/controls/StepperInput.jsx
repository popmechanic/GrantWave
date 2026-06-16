import React from 'react';

/**
 * KMUN StepperInput — a numeric money field with − / + steppers.
 * Wears the "assumption" amber language because every value here is an
 * editable planning input. Shows a leading "$" (or custom prefix) and
 * keeps figures tabular so columns of inputs line up.
 */
export function StepperInput({
  value = 0,
  onChange,
  step = 500,
  min = 0,
  max = Infinity,
  prefix = '$',
  suffix,
  ariaLabel,
  width = '180px',
  style,
  ...rest
}) {
  const clamp = (n) => Math.min(max, Math.max(min, n));
  const set = (n) => onChange && onChange(clamp(n));
  const display = typeof value === 'number' ? value.toLocaleString('en-US') : value;

  const stepBtn = {
    appearance: 'none',
    cursor: 'pointer',
    width: '40px',
    alignSelf: 'stretch',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-assumption)',
    fontSize: 'var(--text-xl)',
    fontWeight: 'var(--weight-bold)',
    lineHeight: 1,
    fontFamily: 'var(--font-sans)',
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'stretch',
        width,
        background: 'var(--surface-assumption)',
        border: 'var(--border-thin) dashed var(--border-assumption)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      <button type="button" aria-label="Decrease" style={stepBtn} onClick={() => set(Number(value) - step)}>
        −
      </button>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          borderLeft: 'var(--border-hair) dashed var(--border-assumption)',
          borderRight: 'var(--border-hair) dashed var(--border-assumption)',
          padding: '8px 4px',
        }}
      >
        {prefix && <span style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-semibold)' }}>{prefix}</span>}
        <input
          aria-label={ariaLabel}
          inputMode="numeric"
          value={display}
          onChange={(e) => {
            const n = Number(String(e.target.value).replace(/[^0-9.-]/g, ''));
            if (!Number.isNaN(n)) set(n);
          }}
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            textAlign: 'center',
            color: 'var(--text-heading)',
            fontFamily: 'var(--font-data)',
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--weight-bold)',
            fontFeatureSettings: 'var(--numeric-feature)',
            outline: 'none',
          }}
        />
        {suffix && <span style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-semibold)' }}>{suffix}</span>}
      </div>
      <button type="button" aria-label="Increase" style={stepBtn} onClick={() => set(Number(value) + step)}>
        +
      </button>
    </div>
  );
}
