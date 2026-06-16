import type { ResultItem } from "../../convex/discover";

const LANE_LABEL: Record<string, string> = {
  federal: "Federal opportunity",
  foundation: "Oregon foundation",
  "funder-intel": "Funder intelligence",
};

const TAG: Record<string, { glyph: string; label: string; color: string }> = {
  fact: { glyph: "●", label: "Fact", color: "var(--text-fact)" },
  assumption: { glyph: "◇", label: "Worth a look", color: "var(--text-assumption)" },
  watch: { glyph: "▲", label: "Watch", color: "var(--text-warning)" },
};

function metaLine(item: ResultItem): string {
  if (item.kind === "opportunity") {
    return [
      item.agency,
      item.aln ? `ALN ${item.aln}` : null,
      item.closeDate ? `closes ${item.closeDate}` : null,
    ]
      .filter(Boolean)
      .join(" · ");
  }
  return [item.location, item.nteeCode ? `NTEE ${item.nteeCode}` : null]
    .filter(Boolean)
    .join(" · ");
}

// One result. Its border encodes trust before you read a word: solid teal = Fact,
// dashed amber = Worth a look. A vermillion "Closes soon" marker layers on top.
export function ResultCard({ item }: { item: ResultItem }) {
  const isFact = item.tier === "fact";
  const tag = TAG[item.tier] ?? TAG.assumption;
  const meta = metaLine(item);
  return (
    <article
      style={{
        border: isFact
          ? "var(--border-thin) solid var(--border-fact)"
          : "var(--border-thin) dashed var(--border-assumption)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-card)",
        boxShadow: "var(--shadow-md)",
        padding: "var(--space-5)",
        marginBottom: "var(--space-3)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap", marginBottom: "var(--space-2)" }}>
        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)", textTransform: "uppercase", letterSpacing: "0.04em", color: tag.color }}>
          {tag.glyph} {tag.label}
        </span>
        <span style={{ fontSize: "12px", color: "var(--text-muted)", background: "var(--color-bg-sunk)", border: "var(--border-hair) solid var(--border-default)", borderRadius: "var(--radius-sm)", padding: "2px 8px" }}>
          {LANE_LABEL[item.lane] ?? item.lane}
        </span>
        {item.closesSoon && (
          <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)", textTransform: "uppercase", color: "var(--text-warning)" }}>
            ▲ Closes soon
          </span>
        )}
      </div>

      <h3 style={{ fontFamily: "var(--font-serif-display)", fontSize: "var(--text-display-sm)", lineHeight: "var(--leading-snug)", margin: "0 0 var(--space-1)" }}>
        {item.title}
      </h3>
      {meta && (
        <p style={{ margin: "0 0 var(--space-2)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{meta}</p>
      )}
      {item.evidence && (
        <p style={{ margin: "0 0 var(--space-3)", fontSize: "var(--text-sm)", color: "var(--text-muted)", background: "var(--color-bg-sunk)", borderLeft: "3px solid var(--border-assumption)", padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-sm)" }}>
          {item.evidence}
        </p>
      )}

      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <button
          type="button"
          disabled
          title="Saving arrives in the next phase"
          style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--text-faint)", background: "var(--color-bg-sunk)", border: "var(--border-hair) solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "var(--space-2) var(--space-4)", cursor: "not-allowed" }}
        >
          ＋ Save to shortlist
        </button>
        {item.url && (
          <a href={item.url} target="_blank" rel="noreferrer" style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--text-fact)", background: "transparent", border: "var(--border-hair) solid var(--border-fact)", borderRadius: "var(--radius-md)", padding: "var(--space-2) var(--space-4)", textDecoration: "none" }}>
            Open ↗
          </a>
        )}
      </div>
    </article>
  );
}
