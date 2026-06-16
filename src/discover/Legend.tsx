function Chip({ border, bg, color, text }: { border: string; bg: string; color: string; text: string }) {
  return (
    <span style={{ fontSize: "13px", padding: "7px 11px", borderRadius: "var(--radius-sm)", border, background: bg }}>
      <b style={{ color }}>{text}</b>
    </span>
  );
}

// The trust legend — the same fact/assumption/watch language used on every card.
export function Legend() {
  return (
    <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", margin: "var(--space-3) 0 var(--space-5)" }}>
      <Chip border="var(--border-thin) solid var(--border-fact)" bg="var(--surface-fact)" color="var(--text-fact)" text="● Fact — confirmed / audited" />
      <Chip border="var(--border-thin) dashed var(--border-assumption)" bg="var(--surface-assumption)" color="var(--text-assumption)" text="◇ Worth a look — a lead to verify" />
      <Chip border="var(--border-thin) solid var(--border-warning)" bg="var(--surface-warning)" color="var(--text-warning)" text="▲ Watch — deadline or caveat" />
    </div>
  );
}
