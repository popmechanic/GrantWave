A headline figure shown in one of three KMUN meaning tiers — use it for "The Ask" stat row and any single number that needs to read as fact, assumption, or warning.

```jsx
<StatCard
  variant="fact"
  label="2024 listener support"
  prefix="$"
  value="186,400"
  caption="Audited. From the 2024 Form 990."
/>

<StatCard
  variant="assumption"
  label="Projected growth"
  value="4"
  suffix="%/yr"
  caption="Editable. Our planning estimate — not a promise."
/>

<StatCard
  variant="warning"
  label="Months of runway"
  value="14"
  caption="Below our 18-month reserve target."
/>
```

Variants:
- `fact` — solid teal border, calm teal surface, "Fact" tag (●). For audited / cited numbers.
- `assumption` — dashed amber border, cream surface, "Assumption" tag (◇). For anything the board can change.
- `warning` — solid vermillion border, blush surface, "Watch" tag (▲). For figures that need attention.

Notes:
- Meaning is doubly-encoded (color + worded tag + glyph) so it survives B&W printing and color-blindness.
- `value` is rendered with tabular figures; pass it pre-formatted with separators.
