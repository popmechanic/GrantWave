import React from 'react';

/**
 * KMUN YearSlider — a labeled range slider for picking a projection year
 * (e.g. the runway chart's horizon). Interactive, so it carries the amber
 * assumption accent on the filled track and thumb. Shows min/current/max
 * ticks in tabular figures. Built on a native <input type="range"> for
 * full keyboard + screen-reader support.
 */
export function YearSlider({
  min = 2025,
  max = 2035,
  step = 1,
  value,
  onChange,
  label = 'Projection year',
  style,
  ...rest
}) {
  const pct = ((Number(value) - min) / (max - min)) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', minWidth: '280px', ...style }} {...rest}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="kmun-eyebrow">{label}</span>
        <span
          className="kmun-num"
          style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--text-assumption)' }}
        >
          {value}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange && onChange(Number(e.target.value))}
        aria-label={label}
        className="kmun-year-slider"
        style={{
          width: '100%',
          background: `linear-gradient(to right, var(--accent-assumption) 0%, var(--accent-assumption) ${pct}%, var(--kmun-sand) ${pct}%, var(--kmun-sand) 100%)`,
        }}
      />

      <div className="kmun-num" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-data)' }}>
        <span>{min}</span>
        <span>{max}</span>
      </div>

      <style>{`
        .kmun-year-slider { -webkit-appearance: none; appearance: none; height: 6px; border-radius: var(--radius-pill); outline: none; }
        .kmun-year-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 24px; height: 24px; border-radius: 50%;
          background: var(--accent-assumption); border: 3px solid var(--surface-assumption);
          box-shadow: var(--shadow-md); cursor: pointer; margin-top: -1px;
        }
        .kmun-year-slider::-moz-range-thumb {
          width: 24px; height: 24px; border-radius: 50%;
          background: var(--accent-assumption); border: 3px solid var(--surface-assumption);
          box-shadow: var(--shadow-md); cursor: pointer;
        }
        .kmun-year-slider:focus-visible::-webkit-slider-thumb { outline: var(--focus-width) solid var(--focus-ring); outline-offset: 2px; }
      `}</style>
    </div>
  );
}
