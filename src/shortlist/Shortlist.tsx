import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

function CommentForm({ shortlistItemId }: { shortlistItemId: Id<"shortlistItems"> }) {
  const [body, setBody] = useState("");
  const addComment = useMutation(api.shortlist.addComment);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const text = body.trim();
        if (!text) return;
        setBody("");
        void addComment({ shortlistItemId, body: text });
      }}
      style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-2)" }}
    >
      <input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a note…"
        aria-label="Add a note"
        style={{ flex: 1, fontSize: "var(--text-sm)", padding: "var(--space-2) var(--space-3)", border: "var(--border-hair) solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--surface-card)", color: "var(--text-body)" }}
      />
      <button
        type="submit"
        style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "#fff", background: "var(--accent-fact)", border: 0, borderRadius: "var(--radius-md)", padding: "var(--space-2) var(--space-4)", cursor: "pointer" }}
      >
        Post
      </button>
    </form>
  );
}

// The team's saved prospects, each with attributed notes. Save from Discover;
// discuss and remove here.
export function Shortlist() {
  const items = useQuery(api.shortlist.listShortlist);
  const unsave = useMutation(api.shortlist.unsave);

  return (
    <div>
      <h2 style={{ margin: "0 0 var(--space-1)" }}>Shortlist</h2>
      <p style={{ margin: "0 0 var(--space-5)", color: "var(--text-muted)" }}>
        {items === undefined
          ? "Loading…"
          : `${items.length} saved prospect${items.length === 1 ? "" : "s"}`}
      </p>

      {items && items.length === 0 && (
        <p style={{ color: "var(--text-muted)" }}>
          Nothing saved yet — save prospects from the Discover tab.
        </p>
      )}

      {items &&
        items.map((it) => (
          <article
            key={it.id}
            style={{
              border: it.tier === "fact" ? "var(--border-thin) solid var(--border-fact)" : "var(--border-thin) dashed var(--border-assumption)",
              borderRadius: "var(--radius-md)",
              background: "var(--surface-card)",
              boxShadow: "var(--shadow-md)",
              padding: "var(--space-5)",
              marginBottom: "var(--space-4)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-3)" }}>
              <h3 style={{ fontFamily: "var(--font-serif-display)", fontSize: "var(--text-display-sm)", margin: "0 0 var(--space-1)" }}>{it.title}</h3>
              <button
                type="button"
                onClick={() => void unsave({ shortlistItemId: it.id })}
                style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", background: "transparent", border: "var(--border-hair) solid var(--border-default)", borderRadius: "var(--radius-pill)", padding: "var(--space-1) var(--space-3)", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                Remove
              </button>
            </div>
            {it.subtitle && (
              <p style={{ margin: "0 0 var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{it.subtitle}</p>
            )}
            <p style={{ margin: "0 0 var(--space-3)", fontSize: "var(--text-xs)", color: "var(--text-faint)" }}>Saved by {it.savedBy}</p>

            <div style={{ borderTop: "var(--border-hair) solid var(--border-default)", paddingTop: "var(--space-3)" }}>
              {it.comments.length === 0 && (
                <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--text-faint)" }}>No notes yet.</p>
              )}
              {it.comments.map((c) => (
                <p key={c.id} style={{ margin: "0 0 var(--space-2)", fontSize: "var(--text-sm)", color: "var(--text-body)" }}>
                  <b style={{ color: "var(--text-fact)" }}>{c.author}</b> {c.body}
                </p>
              ))}
              <CommentForm shortlistItemId={it.id} />
            </div>
          </article>
        ))}
    </div>
  );
}
