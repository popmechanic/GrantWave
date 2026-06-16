import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ResultCard } from "./ResultCard";
import { Legend } from "./Legend";

const LANES: { id: string | undefined; label: string }[] = [
  { id: undefined, label: "All" },
  { id: "federal", label: "Federal" },
  { id: "foundation", label: "Foundations" },
  { id: "funder-intel", label: "Funder intel" },
];

export function Discover() {
  const [lane, setLane] = useState<string | undefined>(undefined);
  const [q, setQ] = useState("");
  const [openNow, setOpenNow] = useState(true);

  const results = useQuery(api.discover.listResults, {
    lane,
    q: q.trim() || undefined,
    openNow,
  });
  const savedSet = new Set(useQuery(api.shortlist.savedRefs) ?? []);
  const save = useMutation(api.shortlist.save);

  return (
    <div>
      <h2 style={{ margin: "0 0 var(--space-1)" }}>Find funding for KMUN</h2>
      <p style={{ margin: "0 0 var(--space-5)", color: "var(--text-muted)" }}>
        {results === undefined ? "Loading…" : `${results.length} prospects`} · refreshed nightly
      </p>

      <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", alignItems: "center", marginBottom: "var(--space-4)" }}>
        <div style={{ display: "inline-flex", background: "var(--color-bg-sunk)", border: "var(--border-hair) solid var(--border-default)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          {LANES.map((l) => {
            const active = l.id === lane;
            return (
              <button
                key={l.label}
                type="button"
                aria-pressed={active}
                onClick={() => setLane(l.id)}
                style={{
                  fontSize: "var(--text-sm)",
                  padding: "var(--space-2) var(--space-4)",
                  border: 0,
                  borderRight: "var(--border-hair) solid var(--border-default)",
                  background: active ? "var(--accent-assumption)" : "transparent",
                  color: active ? "#fff" : "var(--text-body)",
                  fontWeight: active ? "var(--weight-semibold)" : "var(--weight-regular)",
                  cursor: "pointer",
                }}
              >
                {l.label}
              </button>
            );
          })}
        </div>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by keyword, funder, program…"
          aria-label="Search"
          style={{ flex: 1, minWidth: "200px", fontSize: "var(--text-sm)", padding: "var(--space-3)", border: "var(--border-hair) solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--surface-card)", color: "var(--text-body)" }}
        />

        <label style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
          <input type="checkbox" checked={openNow} onChange={(e) => setOpenNow(e.target.checked)} />
          Open now
        </label>
      </div>

      <Legend />

      {results === undefined && <p style={{ color: "var(--text-muted)" }}>Loading prospects…</p>}
      {results && results.length === 0 && (
        <p style={{ color: "var(--text-muted)" }}>No matches — try a different lane or clear the search.</p>
      )}
      {results &&
        results.map((item) => (
          <ResultCard
            key={item.id}
            item={item}
            saved={savedSet.has(item.id)}
            onSave={() => void save({ itemType: item.kind, refId: item.id })}
          />
        ))}
    </div>
  );
}
