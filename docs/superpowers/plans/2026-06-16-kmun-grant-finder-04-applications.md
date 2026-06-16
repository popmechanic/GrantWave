# KMUN Grant Finder — Phase 4: Applications — Implementation Plan

> **For agentic workers:** Parallel execution: use `ultrapowers:ultrapowers` (this plan carries ultraplan markers). Sequential fallback: superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Track shortlisted prospects through an application pipeline — Researching → Applying → Applied → Awarded/Declined — on a shared board, with amount requested, deadline, an assigned volunteer, and a status history.

**Architecture:** The `applications` table already exists (Phase 1 schema). Convex mutations start an application from a shortlist item, move its status (appending history), set details, and assign it. A query returns all applications enriched with the prospect title and assignee username; the React board groups them into status columns.

**Tech Stack:** Convex mutations/queries (auth-guarded), Vitest + convex-test, React + KMUN design system.

**This is plan 4 of 6.**

**Acceptance:** suite — verified by the committed TDD suite (start idempotency + auth, status moves recording history, enriched listApplications) plus the gate. Executed inline.

---

### Task 1: Applications backend

**Type:** implementation
**Depends-on:** none

**Files:** Create `convex/applications.ts`, `convex/applications.test.ts`

- `start({ shortlistItemId })` — auth; one application per shortlist item (idempotent); status "researching", empty history.
- `setStatus({ applicationId, status })` — auth; updates status and appends `{ at, by, from, to }` to history.
- `setDetails({ applicationId, amountRequested?, deadline? })` — auth; patches the optional fields.
- `assign({ applicationId, toMe })` — auth; sets `assignedTo` to the caller (toMe true) or clears it.
- `appliedShortlistIds()` — refIds/shortlistItemIds that already have an application (drives the Shortlist button state).
- `listApplications()` — every application enriched with prospect title + subtitle + tier (resolved through its shortlist item), assignee username, amountRequested, deadline, status, history length. Newest first.

Tests (convex-test with `withIdentity`): start is idempotent; setStatus moves and records a history entry with from/to; listApplications enriches title + assignee; unauth start throws.

---

### Task 2: Start-application button + Applications board

**Type:** implementation
**Depends-on:** 1

**Files:** Create `src/applications/Applications.tsx`, `src/applications/Applications.test.tsx`; modify `src/shortlist/Shortlist.tsx`, `src/shell/AppShell.tsx`

- **Shortlist:** add a "Start application" button per saved item (via `useMutation(api.applications.start)`); when an application already exists (from `api.applications.appliedShortlistIds`), show "In Applications" instead.
- **Applications board:** `Applications.tsx` reads `api.applications.listApplications`, groups into five status columns (Researching · Applying · Applied · Awarded · Declined). Each card shows the prospect (tier-styled), amount, deadline, assignee, a status `<select>` wired to `setStatus`, an "Assign to me" toggle (`assign`), and amount/deadline inputs (`setDetails`). Empty board shows guidance to start one from the Shortlist.
- Wire `<Applications/>` into the "applications" tab of AppShell (replace the blurb).
- Test: board renders the columns and a card in its status column (mocked `useQuery`); Shortlist renders the Start-application button.

---

### Task 3: Gate

**Type:** gate
**Depends-on:** 1, 2

- Suite: `npx tsc --noEmit && npx vitest run`. Expectation: typecheck clean; all suites pass.
