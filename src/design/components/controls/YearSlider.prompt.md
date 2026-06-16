Interactive planning controls in the amber "assumption" language. Use these for any value the board can change.

```jsx
// 32 ⇄ 40 hour switch
<SegmentedToggle
  ariaLabel="Weekly hours"
  options={[{ value: 32, label: '32 hrs' }, { value: 40, label: '40 hrs' }]}
  value={hours}
  onChange={setHours}
/>

// Editable salary
<StepperInput value={48200} step={500} prefix="$" suffix="/yr" onChange={setSalary} ariaLabel="Annual salary" />

// Projection horizon
<YearSlider min={2025} max={2035} value={year} onChange={setYear} label="Project through" />
```

All three deliberately wear the dashed-amber assumption treatment so the board reads them as knobs, not facts. Figures are tabular.
