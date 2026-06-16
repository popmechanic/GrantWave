import { useState } from "react";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { Masthead } from "../design/components/brand/Masthead";
import { Nav, type Tab } from "./Nav";
import { Discover } from "../discover/Discover";
import { Shortlist } from "../shortlist/Shortlist";
import { Applications } from "../applications/Applications";
import logo from "../design/assets/kmun-logo-ink.png";

// Placeholder bodies. Later phases replace each tab with its real screen.
const TAB_BLURB: Record<Tab, string> = {
  discover: "The Discover screen — search and filter grants across all four lanes — arrives in the next phase.",
  shortlist: "The Shortlist — saved prospects and attributed notes — arrives in a later phase.",
  applications: "The Applications board (Researching → Applied → Awarded) arrives in a later phase.",
  export: "The printable board packet arrives in a later phase.",
};

export function AppShell() {
  const [tab, setTab] = useState<Tab>("discover");
  const me = useQuery(api.users.currentUser);
  const { signOut } = useAuthActions();

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <Masthead logoSrc={logo} title="Grant Finder">
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-sm)",
            color: "var(--text-muted)",
          }}
        >
          {me?.username ?? me?.email ?? "…"}
        </span>
        <button
          type="button"
          onClick={() => void signOut()}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-sm)",
            color: "var(--text-fact)",
            background: "transparent",
            border: "var(--border-hair) solid var(--border-default)",
            borderRadius: "var(--radius-pill)",
            padding: "var(--space-2) var(--space-4)",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </Masthead>

      <Nav active={tab} onSelect={setTab} />

      <main
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
          padding: "var(--space-12) var(--space-8)",
        }}
      >
        {tab === "discover" ? (
          <Discover />
        ) : tab === "shortlist" ? (
          <Shortlist />
        ) : tab === "applications" ? (
          <Applications />
        ) : (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-lg)" }}>
            {TAB_BLURB[tab]}
          </p>
        )}
      </main>
    </div>
  );
}
