Wayfinding for the five-chapter microsite.

```jsx
<Breadcrumb items={[
  { label: 'The Ask', href: '#/' },
  { label: 'Chapter 2 · The People', href: '#/people' },
  { label: 'Maria Alvarez' },
]} />

<ChapterTile number={2} title="The People"
  description="Who keeps KMUN on the air, and what we pay them today."
  href="#/people" />
```

- `Breadcrumb` — last item is the current page (bold ink, not a link).
- `ChapterTile` — used four-up on the hub; lifts and warms its border to teal on hover.
