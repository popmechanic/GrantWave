# KMUN Grant Finder — Phase 2: Discover — Implementation Plan

> **For agentic workers:** Parallel execution: use `ultrapowers:ultrapowers` (this plan carries ultraplan markers). Sequential fallback: superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate the database from the three live grant-data lanes on a schedule, label each item by trust tier, and render the searchable, filterable Discover screen with real results.

**Architecture:** Three Convex actions (one per lane) port the proven Python PoC fetch/normalize logic. A scheduled `internalAction` upserts their output into `opportunities`/`funders`, applies the trust-labeling engine, and logs the run. Convex queries expose filtered lists; the React Discover screen renders them using the KMUN design system, each result's border reflecting its tier.

**Tech Stack:** Convex actions + queries + crons, `fetch` (Convex default runtime), Vitest + convex-test with recorded JSON fixtures, React + the vendored KMUN design system.

**This is plan 2 of 6.** Built on Phase 1 (schema, auth, design, shell already in place).

**Acceptance:** suite — Discover is verified by its committed TDD suite (per-lane normalization against recorded fixtures, the classification rules, the query filters, the refresh upsert/stale logic) plus the Task 9 gate. Executed inline (executing-plans) in the main checkout, where the live Convex deployment and `.env.local` are present; no held-out exam.

---

## Design decisions (settled from the spec + PoC)

- **Adapters split into a pure `normalize(rawJson)` and a thin fetching action.** Tests exercise `normalize` against recorded fixtures (deterministic, no network); the action is a thin wrapper that fetches then calls `normalize`.
- **Classification is lane-based and stored** on each row: `federal → "fact"`, `foundation`/`funder-intel`/`curated → "assumption"`. The **Watch** tier is *derived* in the UI from a soon-closing deadline (≤ 14 days), not stored — this keeps one source of truth per row and matches the data.
- **Geography is configurable**, defaulting to Oregon (`OR`) for the ProPublica lane.
- **Refresh marks staleness** by `lastSeenAt`: rows not seen in the latest run of their lane are closed/aged, not deleted (preserves shortlist references).
- **No paid lanes; no per-EIN 990-PF enrichment in v2** (deferred) — the foundation lane stores what `search.json` returns plus a `by_state` index.

## File structure

```
convex/
  lib/classify.ts            classify() + closesSoon() — pure
  lib/classify.test.ts
  sources/types.ts           NormalizedOpportunity / NormalizedFunder
  sources/grantsGov.ts       normalizeGrantsGov() + fetchGrantsGov action
  sources/grantsGov.test.ts  + sources/__fixtures__/grantsGov.json
  sources/propublica.ts      normalizeProPublica() + fetchProPublica action
  sources/propublica.test.ts + sources/__fixtures__/propublica.json
  sources/usaspending.ts     normalizeUsaspending() + fetchUsaspending action
  sources/usaspending.test.ts + sources/__fixtures__/usaspending.json
  refresh.ts                 internal.refresh.run (upsert + classify + stale + log)
  refresh.test.ts
  crons.ts                   nightly → internal.refresh.run
  discover.ts                queries: listResults (filters), getOpportunity, getFunder
  discover.test.ts
src/discover/
  Discover.tsx               results screen: filter bar + list
  ResultCard.tsx             one result; border by tier; Watch if closesSoon
  Legend.tsx                 Fact / Worth-a-look / Watch legend
  Discover.test.tsx, ResultCard.test.tsx
src/shell/AppShell.tsx       MODIFY: render <Discover/> for the "discover" tab
```

---

### Task 1: Trust-labeling engine

**Type:** implementation
**Depends-on:** none

**Files:**
- Create: `convex/lib/classify.ts`
- Test: `convex/lib/classify.test.ts`

- [ ] **Step 1: Failing test**

```ts
// convex/lib/classify.test.ts
import { expect, test } from "vitest";
import { classify, closesSoon } from "./classify";

test("federal lane is a Fact; foundation/funder-intel are assumptions", () => {
  expect(classify("federal")).toBe("fact");
  expect(classify("foundation")).toBe("assumption");
  expect(classify("funder-intel")).toBe("assumption");
});

test("closesSoon true within 14 days, false otherwise/missing", () => {
  const now = 1_000_000_000_000;
  const day = 86_400_000;
  expect(closesSoon(new Date(now + 5 * day).toISOString(), now)).toBe(true);
  expect(closesSoon(new Date(now + 30 * day).toISOString(), now)).toBe(false);
  expect(closesSoon(undefined, now)).toBe(false);
});
```

- [ ] **Step 2: Run → FAIL** (`npx vitest run convex/lib/classify.test.ts`; "classify is not a function").
- [ ] **Step 3: Implement**

```ts
// convex/lib/classify.ts
export type Lane = "federal" | "foundation" | "funder-intel" | "curated";

// Federal openings are confirmed/audited Facts; everything else is a lead.
export function classify(lane: Lane): "fact" | "assumption" {
  return lane === "federal" ? "fact" : "assumption";
}

// Derived Watch flag: a real deadline within `days` of now.
export function closesSoon(
  closeDate: string | undefined,
  now: number,
  days = 14,
): boolean {
  if (!closeDate) return false;
  const t = Date.parse(closeDate);
  if (Number.isNaN(t)) return false;
  return t >= now && t - now <= days * 86_400_000;
}
```

- [ ] **Step 4: Run → PASS.**
- [ ] **Step 5: Commit** `feat(discover): trust-labeling engine (classify + closesSoon)`

---

### Task 2: Grants.gov adapter

**Type:** implementation
**Depends-on:** none

Self-contained note: porting the verified Python PoC (`grant_sources/grants_gov.py`). The live Search2 API: `POST https://api.grants.gov/v1/api/search2`, JSON body, no auth. The ALN filter field is **`cfda`** (NOT `aln`) and takes ONE value per call. `eligibilities=12` = 501(c)(3). Response shape: `{ data: { oppHits: [{ id, number, title, agency, oppStatus, openDate, closeDate, alnist }] } }`. Record a real response into `convex/sources/__fixtures__/grantsGov.json` (run the PoC or curl once) and test `normalizeGrantsGov(fixture)` against it.

**Files:**
- Create: `convex/sources/types.ts`, `convex/sources/grantsGov.ts`, `convex/sources/__fixtures__/grantsGov.json`
- Test: `convex/sources/grantsGov.test.ts`

- [ ] **Step 1: Failing test** — `normalizeGrantsGov(fixture)` returns federal opportunities with `aln`, `url`, `lane:"federal"`.

```ts
// convex/sources/grantsGov.test.ts
import { expect, test } from "vitest";
import fixture from "./__fixtures__/grantsGov.json";
import { normalizeGrantsGov } from "./grantsGov";

test("normalizes Grants.gov oppHits into federal opportunities", () => {
  const rows = normalizeGrantsGov(fixture as any);
  expect(rows.length).toBeGreaterThan(0);
  const nea = rows.find((r) => r.aln === "45.024");
  expect(nea?.lane).toBe("federal");
  expect(nea?.url).toMatch(/grants\.gov/);
  expect(nea?.title).toBeTruthy();
});
```

- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** `types.ts` (NormalizedOpportunity), then `normalizeGrantsGov` + a `fetchGrantsGov` action that POSTs per keyword and per ALN (`KNOWN_RELEVANT_ALNS` from the PoC: 45.024, 45.036, 45.149, 45.164, 45.169, 45.301, 45.310, 45.312), de-duping by opportunity id. Keep `normalize` pure; the action does `fetch` then `normalize`.
- [ ] **Step 4: Run → PASS.**
- [ ] **Step 5: Commit** `feat(discover): Grants.gov adapter (normalize + fetch action)`

---

### Task 3: ProPublica adapter

**Type:** implementation
**Depends-on:** none

Self-contained note: porting `grant_sources/propublica.py`. `GET https://projects.propublica.org/nonprofits/api/v2/search.json?state[id]=OR&ntee[id]=7&c_code[id]=3` for grantmaking foundations (and `ntee[id]=1` for arts/media peers). No key. Response: `{ organizations: [{ ein, name, city, state, ntee_code, ... }] }`. `ntee[id]` is the NCCS 10-category major group: `1`=Arts, `7`=Public/Societal-Benefit (where grantmaking foundations live). Record a fixture into `__fixtures__/propublica.json`.

**Files:**
- Create: `convex/sources/propublica.ts`, `convex/sources/__fixtures__/propublica.json`
- Test: `convex/sources/propublica.test.ts`

- [ ] **Step 1: Failing test** — `normalizeProPublica(fixture, "foundation")` returns funders with `ein`, `state`, `lane:"foundation"`.
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** `normalizeProPublica(json, lane)` (maps organizations → NormalizedFunder) and a `fetchProPublica` action taking a `state` arg (default "OR") that queries both `ntee[id]=7` (lane "foundation") and `ntee[id]=1` (lane "foundation", arts/media peers) — store both as funders. Full code with the exact param encoding (`state[id]`, `ntee[id]`, `c_code[id]`).
- [ ] **Step 4: Run → PASS.**
- [ ] **Step 5: Commit** `feat(discover): ProPublica 990 adapter`

---

### Task 4: USAspending adapter

**Type:** implementation
**Depends-on:** none

Self-contained note: porting `grant_sources/usaspending.py`. `POST https://api.usaspending.gov/api/v2/search/spending_by_award/`, no auth. Body: `{ filters: { award_type_codes: ["02","03","04","05"], keywords: ["public radio"] }, fields: ["Recipient Name","Awarding Agency","Award Amount", ...], page:1, limit:25, sort:"Award Amount", order:"desc" }`. Response: `{ results: [{ "Recipient Name", "Awarding Agency", "Award Amount", generated_internal_id }] }`. These are PUBLIC-radio recipients — funder *intelligence* for COMMUNITY radio, so `lane:"funder-intel"` and an `evidence` string noting the public-vs-community distinction. Record a fixture.

**Files:**
- Create: `convex/sources/usaspending.ts`, `convex/sources/__fixtures__/usaspending.json`
- Test: `convex/sources/usaspending.test.ts`

- [ ] **Step 1: Failing test** — `normalizeUsaspending(fixture)` returns funders with `lane:"funder-intel"` and a non-empty `evidence`.
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** `normalizeUsaspending(json)` + `fetchUsaspending` action.
- [ ] **Step 4: Run → PASS.**
- [ ] **Step 5: Commit** `feat(discover): USAspending funder-intelligence adapter`

---

### Task 5: Refresh — upsert, classify, stale, log

**Type:** implementation
**Depends-on:** 1, 2, 3, 4

Self-contained note: imports the three fetch actions (Tasks 2,3,4), `classify` (Task 1), and the schema. Implement `internal.refresh.run` as an `internalAction` that: calls each fetch action; for each normalized row sets `classification = classify(lane)` and `lastSeenAt = Date.now()`; upserts via internal mutations (match opportunities by `(aln,title)` or `url`, funders by `(ein||name, lane)`); after each lane, ages rows of that lane whose `lastSeenAt` predates this run (set opportunity `status="closed"`); writes a `refreshRuns` row with per-lane counts and any errors. Wrap each lane in try/catch so one failing lane doesn't abort the run.

**Files:**
- Create: `convex/refresh.ts`
- Test: `convex/refresh.test.ts`

- [ ] **Step 1: Failing test** — with the three fetch actions stubbed (return fixture-normalized rows), `internal.refresh.run` populates `opportunities`/`funders` and writes a `refreshRuns` row. Use `convex-test`'s action mocking.
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** the action + internal upsert/age mutations.
- [ ] **Step 4: Run → PASS.**
- [ ] **Step 5: Commit** `feat(discover): scheduled refresh — upsert, classify, stale, log`

---

### Task 6: Nightly cron

**Type:** implementation
**Depends-on:** 5

Self-contained note: register a cron that calls `internal.refresh.run` nightly. `convex/crons.ts` uses `cronJobs()` from `convex/server`; `crons.cron("nightly refresh", "0 8 * * *", internal.refresh.run)` (08:00 UTC). Reference: the `convex-cron-jobs` skill.

**Files:**
- Create: `convex/crons.ts`
- Test: `convex/crons.test.ts` (asserts the cron registry contains one job pointing at refresh.run)

- [ ] **Step 1–5:** Failing test → implement `crons.ts` → pass → commit `feat(discover): nightly refresh cron`.

---

### Task 7: Discover queries

**Type:** implementation
**Depends-on:** none

Self-contained note: read-only queries over the existing schema. `listResults({ lane?, q?, openNow?, sort? })` returns a unified, filtered list of opportunities + funders (each tagged with its tier and a derived `closesSoon`). Auth-guard with `getAuthUserId` (members only). `getOpportunity(id)` / `getFunder(id)` for detail views.

**Files:**
- Create: `convex/discover.ts`
- Test: `convex/discover.test.ts`

- [ ] **Step 1: Failing test** — seed two opportunities + one funder; `listResults({ lane:"federal" })` returns only federal; `listResults({ q:"radio" })` filters by keyword; `closesSoon` is set for a soon-deadline row.
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** the queries (filter in handler; `closesSoon` via the Task 1 helper).
- [ ] **Step 4: Run → PASS.**
- [ ] **Step 5: Commit** `feat(discover): filtered Discover queries`

---

### Task 8: Discover UI

**Type:** implementation
**Depends-on:** 7

Self-contained note: imports `api.discover.listResults` (Task 7), the KMUN tokens, and `StatCard`/`LegendChip`/`SegmentedToggle` from `src/design`. Build `Discover.tsx` (filter bar: lane SegmentedToggle, keyword input, "Open now" toggle, sort) + `ResultCard.tsx` (border solid-teal for Fact, dashed-amber for assumption; a vermillion "▲ Closes soon" marker when `closesSoon`; lane chip; title; meta; Save button placeholder) + `Legend.tsx`. Then MODIFY `src/shell/AppShell.tsx` to render `<Discover/>` in the "discover" tab instead of the placeholder blurb (keep the other three blurbs). ResultCard.test renders a fact vs assumption card and asserts the tag text. Discover.test renders with a mocked `useQuery` returning sample rows and asserts a card appears.

**Files:**
- Create: `src/discover/Discover.tsx`, `src/discover/ResultCard.tsx`, `src/discover/Legend.tsx`, `src/discover/ResultCard.test.tsx`, `src/discover/Discover.test.tsx`
- Modify: `src/shell/AppShell.tsx`

- [ ] **Step 1: Failing test** (ResultCard tag text) → **Step 2** FAIL → **Step 3** implement the three components + wire into AppShell → **Step 4** PASS → **Step 5** commit `feat(discover): Discover screen wired into the shell`.

---

### Task 9: Phase gate

**Type:** gate
**Depends-on:** 1, 2, 3, 4, 5, 6, 7, 8

- Suite: `npx tsc --noEmit && npx vitest run`
- Expectation: typecheck clean; every suite passes (classify, three adapters, refresh, crons, discover queries, ResultCard, Discover).

---

## Self-review

**Spec coverage:** Discover spec items covered — three lanes (2,3,4), nightly refresh (5,6), trust engine (1), Discover screen + filters + detail (7,8), community-vs-public-radio framing (Task 4 `evidence` + UI). Shortlist/Applications/Export remain later phases.

**Placeholder scan:** Adapter/refresh tasks reference recorded fixtures (named paths) rather than live network in tests; UI task names the exact components and the AppShell modification. No "handle appropriately" steps.

**Type consistency:** `Lane`, `classify`, `closesSoon`, `NormalizedOpportunity`/`NormalizedFunder`, `listResults` referenced consistently across tasks.

**Markers:** every task typed; Task 5 depends on 1–4, Task 6 on 5, Task 8 on 7, gate on all. Adapters (2,3,4) and queries (7) are independent.
