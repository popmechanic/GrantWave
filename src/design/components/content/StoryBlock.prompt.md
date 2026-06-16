Narrative + sourcing pieces that carry KMUN's warm, scrupulously-honest voice through the data.

```jsx
<StoryBlock tone="fact" eyebrow="What this means" title="A living wage, finally">
  At 40 hours, Maria earns <strong>$48,200</strong> — the first time this role
  has cleared a living wage for Clatsop County<CitationMark n={1} />.
</StoryBlock>

<Citation n={1} source="MIT Living Wage Calculator, Clatsop County OR, 2024"
  href="https://livingwage.mit.edu/counties/41007" retrieved="May 2026" />

<div style={{ display: 'flex', gap: 8 }}>
  <LegendChip label="Actual" color="var(--accent-fact)" sample="line" />
  <LegendChip label="Projected" color="var(--accent-assumption)" sample="dashed" />
  <LegendChip label="Market range" color="var(--accent-fact)" sample="band" />
</div>
```

- `StoryBlock` tones reuse the meaning system; `assumption` gets a dashed left rule.
- `CitationMark` is the inline `[n]`; `Citation` is the footnote row with a "View source ↗" link.
- `LegendChip` swatches: `line` (solid = actual/fact), `dashed` (projection/assumption), `band` (range), `dot`.
