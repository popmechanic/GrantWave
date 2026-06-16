import { useQuery, useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "../../convex/_generated/api";

type App = FunctionReturnType<typeof api.applications.listApplications>[number];

const STATUSES = [
  { id: "researching", label: "Researching" },
  { id: "applying", label: "Applying" },
  { id: "applied", label: "Applied" },
  { id: "awarded", label: "Awarded" },
  { id: "declined", label: "Declined" },
] as const;

function money(n?: number): string {
  return typeof n === "number" ? `$${n.toLocaleString("en-US")}` : "—";
}

function ApplicationCard({ app }: { app: App }) {
  const setStatus = useMutation(api.applications.setStatus);
  const assign = useMutation(api.applications.assign);
  const setDetails = useMutation(api.applications.setDetails);
  const isFact = app.tier === "fact";

  return (
    <article
      style={{
        border: isFact ? "var(--border-thin) solid var(--border-fact)" : "var(--border-thin) dashed var(--border-assumption)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-card)",
        boxShadow: "var(--shadow-sm)",
        padding: "var(--space-3)",
        marginBottom: "var(--space-3)",
      }}
    >
      <h4 style={{ fontFamily: "var(--font-serif-display)", fontSize: "var(--text-md)", lineHeight: "var(--leading-snug)", margin: "0 0 var(--space-1)" }}>
        {app.title}
      </h4>
      {app.subtitle && (
        <p style={{ margin: "0 0 var(--space-2)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{app.subtitle}</p>
      )}

      <label style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
        Status
        <select
          value={app.status}
          onChange={(e) => void setStatus({ applicationId: app.id, status: e.target.value as App["status"] })}
          style={{ display: "block", width: "100%", marginTop: "2px", fontSize: "var(--text-sm)", padding: "var(--space-1) var(--space-2)", border: "var(--border-hair) solid var(--border-default)", borderRadius: "var(--radius-sm)", background: "var(--color-bg)" }}
        >
          {STATUSES.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </label>

      <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
        <input
          type="number"
          defaultValue={app.amountRequested ?? ""}
          placeholder="Amount $"
          aria-label="Amount requested"
          onBlur={(e) => { if (e.target.value) void setDetails({ applicationId: app.id, amountRequested: Number(e.target.value) }); }}
          style={{ width: "50%", fontSize: "var(--text-xs)", padding: "var(--space-1) var(--space-2)", border: "var(--border-hair) solid var(--border-default)", borderRadius: "var(--radius-sm)" }}
        />
        <input
          type="text"
          defaultValue={app.deadline ?? ""}
          placeholder="Deadline"
          aria-label="Deadline"
          onBlur={(e) => { if (e.target.value) void setDetails({ applicationId: app.id, deadline: e.target.value }); }}
          style={{ width: "50%", fontSize: "var(--text-xs)", padding: "var(--space-1) var(--space-2)", border: "var(--border-hair) solid var(--border-default)", borderRadius: "var(--radius-sm)" }}
        />
      </div>
      {app.amountRequested != null && (
        <p style={{ margin: "0 0 var(--space-2)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }} className="kmun-num">
          Requesting {money(app.amountRequested)}
        </p>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-2)", fontSize: "var(--text-xs)" }}>
        <span style={{ color: "var(--text-muted)" }}>{app.assignee ? `${app.assignee}` : "Unassigned"}</span>
        <button
          type="button"
          onClick={() => void assign({ applicationId: app.id, toMe: !app.assignee })}
          style={{ fontSize: "var(--text-xs)", color: "var(--text-fact)", background: "transparent", border: "var(--border-hair) solid var(--border-default)", borderRadius: "var(--radius-pill)", padding: "2px 8px", cursor: "pointer" }}
        >
          {app.assignee ? "Unassign" : "Assign to me"}
        </button>
      </div>
    </article>
  );
}

// The application pipeline as a board: five status columns; a card's status
// selector moves it between them and records the change.
export function Applications() {
  const apps = useQuery(api.applications.listApplications);

  return (
    <div>
      <h2 style={{ margin: "0 0 var(--space-1)" }}>Applications</h2>
      <p style={{ margin: "0 0 var(--space-5)", color: "var(--text-muted)" }}>
        {apps === undefined ? "Loading…" : `${apps.length} in the pipeline`}
      </p>

      {apps && apps.length === 0 && (
        <p style={{ color: "var(--text-muted)" }}>
          Nothing here yet — open a saved prospect on the Shortlist tab and choose “Start application”.
        </p>
      )}

      {apps && apps.length > 0 && (
        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start", overflowX: "auto" }}>
          {STATUSES.map((col) => {
            const inCol = apps.filter((a) => a.status === col.id);
            return (
              <div key={col.id} style={{ flex: "1 0 200px", minWidth: "200px" }}>
                <h3 style={{ fontSize: "var(--text-sm)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", borderBottom: "var(--border-hair) solid var(--border-default)", paddingBottom: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                  {col.label} <span className="kmun-num">({inCol.length})</span>
                </h3>
                {inCol.map((a) => <ApplicationCard key={a.id} app={a} />)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
