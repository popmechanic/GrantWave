# KMUN Grant Finder — Design Spec

**Date:** 2026-06-15
**Status:** Approved design, ready for implementation planning
**Owner:** Marcus (volunteer, KMUN / Tillicum Foundation)

## Summary

A hosted web application that helps non-technical KMUN volunteers find, save, and
pursue grant opportunities. It pulls public grant data on a nightly schedule,
labels every result by how much to trust it (fact vs. lead), and lets the team
shortlist prospects, write attributed notes, track applications, and print a
board packet — all in the KMUN visual style.

## Context

KMUN 91.9 FM is the listener-funded **community** radio station of the Tillicum
Foundation in Astoria, Oregon. It is a 501(c)(3) and was CPB-qualified. The
maintainers are staff and volunteers; none are technical, so the app must run
itself with no scripts to install or run.

This spec covers the web application. It builds on an existing Python
proof-of-concept (`poc.py`, `grant_sources/`) that already validated the live
behavior of the three free APIs, and on a prior research report that catalogued
the sources and the 2025–2026 funding landscape.

### The community-vs-public-radio distinction (design-critical)

Community radio and public radio are distinct designations. KMUN is community
radio. Past **public**-radio grant recipients (NPR, New York Public Radio, and
peers) do not mean KMUN belongs in that category — but they do reveal **which
funders give to radio**, which is useful intelligence. The app treats this as a
two-part claim: *the recipient was public radio* is a **fact**; *the same funder
might fund community radio like KMUN* is a **lead to verify**. The trust-labeling
engine (below) encodes exactly this distinction.

## Goals

- Surface grant opportunities and candidate funders across four data lanes.
- Mark every result as a confirmed fact, a lead worth checking, or a caveat to mind.
- Let volunteers shortlist prospects and discuss them with attributed notes.
- Track applications through a simple status pipeline.
- Produce a printable board packet in the KMUN presentation style.
- Refresh data automatically, with zero maintenance burden on non-technical staff.

## Non-goals (v1)

- No automated grant *application* submission — the app finds and tracks, humans apply.
- No public/anonymous access — the tool is private to signed-in KMUN users.
- No mobile-native app — a responsive web app suffices.
- No paid data sources (Candid, Cause IQ) in v1 — free APIs only.

## Users & access

Full username-based authentication. Every user signs in; every note and comment
is attributed to its author. Two roles:

- **member** — read all data, save shortlists, write notes, manage applications.
- **admin** — everything a member can do, plus edit the curated-funder list.

## Architecture

A reactive hosted app: **Convex** backend (database, server functions, auth,
scheduled jobs) with a **React** front end styled by the KMUN design system.

- **Why Convex:** it provides the database, authentication, and a built-in
  scheduler in one hosted service, so non-technical maintainers never run a
  server, database, or cron job. The reactive queries keep the UI live without
  manual refresh wiring.
- **The Python PoC is not discarded.** It proved the exact request shapes,
  filters, and quirks of each API (for example, that Grants.gov's Assistance
  Listing filter field is `cfda`, not `aln`, and takes one value per call).
  Porting that logic to Convex actions is mechanical, and the PoC stays in the
  repo as the reference implementation and a source of test fixtures.

## Data model (Convex tables)

| Table | Purpose | Key fields |
|---|---|---|
| `users` | accounts | `username`, `displayName`, `role` |
| `opportunities` | federal openings (Grants.gov) | title, agency, `aln`, status, openDate, closeDate, url, `classification`, `lastSeenAt` |
| `funders` | foundations (ProPublica) + funder-intelligence (USAspending) | name, ein, city, state, nteeCode, isPrivateFoundation, `lane`, evidence, `classification`, `lastSeenAt` |
| `curatedFunders` | hand-kept public-media funders | name, description, url, eligibilityNote, `updatedBy`, `updatedAt` |
| `shortlistItems` | saved prospects | `itemType` + ref, `savedBy`, `savedAt`, status |
| `comments` | attributed notes on a shortlist item | `shortlistItemId`, `authorUserId`, body, createdAt |
| `applications` | tracked pursuits | ref to shortlist item, status, amountRequested, deadline, assignedTo, history[] |
| `refreshRuns` | transparency log of each nightly pull | ranAt, perLaneCounts, errors |

## Data lanes

1. **Federal opportunities** — Grants.gov Search2 (`POST /v1/api/search2`, no key).
   Two passes: a keyword sweep and an ALN-targeted precision sweep over a verified
   list (NEA 45.024, NEH Media Projects 45.036, NEH 45.149/45.164/45.169, IMLS
   45.301/45.310/45.312). Eligibility filter `eligibilities=12` (501(c)(3)).
2. **Local / in-state foundations** — ProPublica Nonprofit Explorer (no key).
   Search `state[id]=OR`, `ntee[id]=7` for grantmakers and `ntee[id]=1` for
   arts/media peers, `c_code[id]=3`; enrich top hits to flag 990-PF private
   foundations.
3. **Past federal winners (funder intelligence)** — USAspending (no key). Mine
   grant awards to public-radio recipients to infer which agencies fund radio.
   Labeled per the community-vs-public-radio distinction above.
4. **Public-media funders (curated)** — a hand-maintained list (Public Media
   Bridge Fund, NFCB, CPB-successor information). No API; admins edit it directly.

### Funding-landscape constraints (verified 2026-06)

The refresh and labeling logic must respect the current landscape:

- **CPB is dissolving** (board vote 2026-01-05; $1.1B rescission 2025-07). Treat
  CPB Community Service Grants as a dead federal channel, except that
  CSG-qualification as of 2025-09-30 still gates Public Media Bridge Fund
  eligibility.
- **NEA and NEH are funded for FY2026.** NEA (45.024) plus state/regional arts
  agencies are the strongest live channel.
- **State humanities councils** are funded-on-paper but in legal limbo — label as
  Watch.
- **Defunct, never surfaced as active:** NTIA PTFP (11.550), Dept. of Education
  Ready to Learn (84.295).

## Trust-labeling engine

One small, well-tested rules module assigns each item a tier. Every rendered
label pairs **color + worded tag + glyph + border style**, so meaning survives in
black-and-white print and for color-blind viewers (a hard requirement inherited
from the design system).

- **● Fact — solid teal.** The source asserts it directly and it is current: an
  open federal opportunity with a real close date; a confirmed 990-PF filing.
- **◇ Worth a look — dashed amber.** An inference that needs a human: a foundation
  matched by geography and NTEE but unconfirmed for radio; a funder-intelligence
  lead from past public-radio awards; any curated entry.
- **▲ Watch — vermillion.** A time or risk caveat layered on top: a deadline
  within a threshold (default 14 days); an unstable funder; a known dead channel.

An item can carry Watch alongside its base tier (for example, a Fact opportunity
that closes soon).

## Nightly refresh pipeline

A scheduled Convex action runs nightly:

1. For each API lane, call the source (logic ported from the Python PoC).
2. Upsert results into `opportunities` / `funders`, stamping `lastSeenAt`.
3. Mark records absent from the latest pull as closed or stale.
4. Run the trust-labeling engine over new and changed records.
5. Write a `refreshRuns` entry (per-lane counts, errors) for transparency.

The curated lane needs no fetch. A manual "refresh now" action is available to
admins for testing.

## Screens & information architecture

Persistent KMUN masthead (wordmark + radio-wave rule) with four nav
destinations; the active tab fills solid amber.

- **Sign in** — username + password; gate for all other screens.
- **Discover** (home) — one searchable, filterable list across all lanes. Each row
  is a card whose border signals its tier. Filters: lane (segmented toggle),
  keyword, "open now," sort. Opens detail views.
- **Opportunity detail** — a federal opening: agency, ALN, deadline, eligibility,
  apply link, Save, add note.
- **Funder detail** — a foundation or funder-intelligence lead: what they fund,
  990 facts, the honest "why this might fit community radio" reasoning, Save, note.
- **Curated funder** — a public-media funder: context and outbound link.
- **Shortlist** — saved prospects with attributed note/comment threads; "Print packet".
- **Applications** — a status board (Researching · Applying · Applied ·
  Awarded/Declined); "Print packet".
- **Export** — generate a printable board packet in the KMUN presentation style.
- **Manage curated links** (admin) — edit the public-media funder list.

Typical path: Sign in → Discover → open a result → Save to shortlist → add notes
→ Start application → Track → Export packet.

## Design-system integration

Import the KMUN `tokens/*.css` globally. Reuse the existing JSX components as-is:

- **Masthead + WaveBand** — header.
- **SegmentedToggle** — lane filter.
- **Breadcrumb** — location.
- **StatCard** — dashboard summary tiles (uses the fact/assumption/warning tiers).
- **StoryBlock + Citation** — "why surfaced" callouts and sources.
- **LegendChip** — the Fact / Worth-a-look / Watch legend.
- **AskHero** — the Export packet cover.

The design system was authored for board presentations, so the Export packet
derives directly from its components and print rules.

## Accessibility

- WCAG AA contrast (met by the design system).
- Keyboard-first navigation with a visible 3px teal focus ring.
- Meaning never encoded by color alone.
- Body type 16px and up, for board members 65+.
- A print stylesheet that forces white backgrounds and keeps borders legible.

## Testing strategy

- **Unit** — the trust-labeling engine and each lane adapter, using recorded
  fixtures captured from the live API shapes already verified in the PoC.
- **Convex functions** — auth boundaries (members read; owners and admins edit),
  shortlist and comment mutations, application transitions.
- **Refresh** — a smoke test that the nightly action upserts and marks stale
  records correctly.
- **End-to-end** — one pass of sign in → discover → save → comment → application
  → export.

## Build order (all v1, sequenced for early value)

1. **Foundation** — Convex project, schema, username auth, KMUN tokens and
   components wired into a React shell with the masthead and nav.
2. **Discover** — the three API adapters as Convex actions, the nightly refresh,
   the trust-labeling engine, and the Discover list, filters, and detail views.
3. **Shortlist & notes** — saving and attributed comments.
4. **Applications** — the tracking board.
5. **Export** — the board-packet print route and the per-page Print buttons.
6. **Admin** — curated-funder management and the refresh-transparency view.

## Open questions & risks

- **Deployment & ownership** — who owns the Convex account and domain, and what
  is the hosting budget? (Convex has a free tier; confirm before launch.)
- **Refresh cadence** — nightly is the default; some federal data changes slowly,
  so weekly may suffice and cost less. Decide during implementation.
- **Curated lane drift** — the public-media landscape is volatile in 2026; the
  admin list needs a human to keep current. The refresh-transparency view and
  "last updated" stamps mitigate but do not eliminate this.
- **Oregon default** — the foundation lane is scoped to Oregon; make the state a
  configurable setting so the tool can serve other stations later.

## Appendix: verified facts behind the design

From the PoC and research, confirmed live:

- All three APIs require no authentication; Grants.gov ALN filter field is `cfda`
  (single value per call); `eligibilities=12` filters to 501(c)(3).
- ProPublica `ntee[id]` is the NCCS 10-category major-group scheme: `1` = Arts,
  Culture & Humanities; `7` = Public, Societal Benefit (where grantmaking
  foundations live). NTEE `A34` = Radio.
- Verified ALNs accepted by the live filter: 45.024, 45.036, 45.149, 45.164,
  45.169, 45.301, 45.310, 45.312.
