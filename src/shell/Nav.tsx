export type Tab = "discover" | "shortlist" | "applications" | "export";

const TABS: { id: Tab; label: string }[] = [
  { id: "discover", label: "Discover" },
  { id: "shortlist", label: "Shortlist" },
  { id: "applications", label: "Applications" },
  { id: "export", label: "Export" },
];

// The four top-level destinations. The active tab fills solid amber (the KMUN
// "selected" state) and carries aria-current for assistive tech.
export function Nav({
  active,
  onSelect,
}: {
  active: Tab;
  onSelect: (tab: Tab) => void;
}) {
  return (
    <nav
      style={{
        display: "flex",
        gap: "var(--space-2)",
        padding: "var(--space-3) var(--space-8)",
        background: "var(--surface-card)",
        borderBottom: "var(--border-hair) solid var(--border-default)",
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onSelect(tab.id)}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-sm)",
              fontWeight: isActive
                ? "var(--weight-semibold)"
                : "var(--weight-regular)",
              color: isActive ? "#fff" : "var(--text-muted)",
              background: isActive ? "var(--accent-assumption)" : "transparent",
              border: "var(--border-hair) solid transparent",
              borderRadius: "var(--radius-sm)",
              padding: "var(--space-2) var(--space-3)",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
