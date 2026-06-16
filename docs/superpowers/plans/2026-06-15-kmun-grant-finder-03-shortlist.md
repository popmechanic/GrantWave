# KMUN Grant Finder — Phase 3: Shortlist & Notes — Implementation Plan

> **For agentic workers:** Parallel execution: use `ultrapowers:ultrapowers` (this plan carries ultraplan markers). Sequential fallback: superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let signed-in volunteers save Discover prospects to a shared shortlist and discuss each with attributed comment threads.

**Architecture:** A team-shared shortlist (everyone sees everyone's saves). Convex mutations save/unsave/comment; queries return the shortlist enriched with the referenced opportunity/funder data, the saver's username, and the comment thread with author usernames. The Discover "Save" button toggles membership; a new Shortlist screen shows the threads.

**Tech Stack:** Convex mutations/queries (auth-guarded), Vitest + convex-test, React + KMUN design system.

**This is plan 3 of 6.** Built on Phases 1–2.

**Acceptance:** suite — verified by the committed TDD suite (save idempotency + auth, comment attribution, enriched listShortlist) plus the gate. Executed inline.

---

### Task 1: Shortlist mutations + queries

**Type:** implementation
**Depends-on:** none

**Files:** Create `convex/shortlist.ts`, `convex/shortlist.test.ts`

- `save({ itemType, refId })` — auth required; idempotent (no duplicate for the same refId); stamps savedBy + savedAt + status "saved".
- `unsave({ shortlistItemId })` — auth; removes the item and its comments.
- `addComment({ shortlistItemId, body })` — auth; stamps authorUserId + createdAt.
- `savedRefs()` — returns the set (array) of refIds currently shortlisted (team-wide).
- `listShortlist()` — each saved item resolved to its opportunity/funder title + meta, the saver's username, and its comments (each with author username), newest-saved first.

Tests: save then savedRefs contains the ref; double-save keeps one; addComment attributes to the author; listShortlist returns enriched rows; unauth save throws / returns null.

---

### Task 2: Wire Save into Discover

**Type:** implementation
**Depends-on:** 1

**Files:** Modify `src/discover/ResultCard.tsx`, `src/discover/Discover.tsx`; test `src/discover/ResultCard.test.tsx`

- Discover fetches `api.shortlist.savedRefs`, builds a Set, passes `saved` + `onToggleSave` to each ResultCard.
- ResultCard "Save to shortlist" becomes active: calls `onToggleSave(item)`; shows "✓ Saved" when `saved`.
- Discover provides `onToggleSave` via `useMutation(api.shortlist.save/unsave)`.
- Test: ResultCard with `saved` shows the saved state; clicking calls the handler.

---

### Task 3: Shortlist screen

**Type:** implementation
**Depends-on:** 1

**Files:** Create `src/shortlist/Shortlist.tsx`, `src/shortlist/Shortlist.test.tsx`; modify `src/shell/AppShell.tsx`

- `Shortlist.tsx`: lists `api.shortlist.listShortlist`; each row shows the prospect (tier-styled), who saved it, the comment thread (author + body), and a comment input wired to `addComment`. Remove button calls `unsave`.
- Wire `<Shortlist/>` into the "shortlist" tab of AppShell (replace the blurb).
- Test: renders a saved row + a comment with its author (mocked useQuery).

---

### Task 4: Gate

**Type:** gate
**Depends-on:** 1, 2, 3

- Suite: `npx tsc --noEmit && npx vitest run`. Expectation: typecheck clean; all suites pass.
