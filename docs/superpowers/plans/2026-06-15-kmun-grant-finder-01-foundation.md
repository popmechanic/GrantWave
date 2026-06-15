# KMUN Grant Finder — Phase 1: Foundation — Implementation Plan

> **For agentic workers:** Parallel execution: use `ultrapowers:ultrapowers` (this plan carries ultraplan markers). Sequential fallback: superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a hosted Convex + React app with username auth, the KMUN design system wired in, the full database schema, and a signed-in app shell with working navigation.

**Architecture:** Convex provides the database, auth, and (later) the scheduler; a React + Vite front end renders the KMUN design system. This phase builds the skeleton — schema, auth, design tokens, and the masthead/nav shell — so later phases (Discover, Shortlist, Applications, Export) drop into a working frame.

**Tech Stack:** Convex, `@convex-dev/auth` (Password provider), React 18 + Vite + TypeScript, Vitest + `convex-test` + `@testing-library/react`, the KMUN design system (CSS tokens + JSX components from the handoff bundle).

**This is plan 1 of 6.** Phases 2–6 (Discover, Shortlist & notes, Applications, Export, Admin) get their own plans after this lands.

---

## File structure (locked here)

```
package.json, vite.config.ts, tsconfig.json       project config
convex/
  schema.ts                 all 8 tables + indexes
  auth.ts, auth.config.ts   Convex Auth (Password + username)
  users.ts                  currentUser query
  schema.test.ts            schema round-trip tests
  auth.test.ts              auth boundary tests
src/
  main.tsx                  React entry + ConvexAuthProvider
  App.tsx                   Authenticated/Unauthenticated gate
  design/                   KMUN design system (copied from bundle)
    styles.css, tokens/*, components/*
  shell/
    AppShell.tsx            masthead + wave band + nav
    Nav.tsx                 four-tab nav (active=amber)
    SignIn.tsx              username + password form
    AppShell.test.tsx, SignIn.test.tsx
```

---

### Task 1: Create the Convex + Vite project and deployment

**Type:** manual
**Depends-on:** none

Owner action — needs an interactive Convex login (credentials) and creates a cloud deployment, so it cannot run in an isolated worktree.

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `convex/` (generated)

- [ ] **Step 1:** In the project root, scaffold a React+Vite+Convex app following the `convex-quickstart` skill: `npm create vite@latest . -- --template react-ts`, then `npm i convex @convex-dev/auth`, then `npx convex dev --once` and complete the interactive login to create the `kmun-grant-finder` deployment.
- [ ] **Step 2:** Add test tooling: `npm i -D vitest convex-test @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react`.
- [ ] **Step 3:** Confirm `npx convex dev --once` prints a deployment URL and `convex/_generated/` exists. Commit the scaffold.

---

### Task 2: Define the database schema

**Type:** implementation
**Depends-on:** 1

**Files:**
- Create: `convex/schema.ts`
- Test: `convex/schema.test.ts`

- [ ] **Step 1: Write the failing test** — round-trip every table, asserting indexes resolve.

```ts
// convex/schema.test.ts
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "./schema";

test("opportunities table round-trips and indexes by aln", async () => {
  const t = convexTest(schema);
  await t.run(async (ctx) => {
    await ctx.db.insert("opportunities", {
      title: "NEA Grants for Arts Projects", agency: "NEA", aln: "45.024",
      status: "posted", url: "https://x", classification: "fact",
      lane: "federal", lastSeenAt: 1,
    });
    const byAln = await ctx.db
      .query("opportunities").withIndex("by_aln", q => q.eq("aln", "45.024")).collect();
    expect(byAln).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run convex/schema.test.ts`
Expected: FAIL — `schema` has no `opportunities` table / no `by_aln` index.

- [ ] **Step 3: Write the schema** — eight tables matching the spec's data model.

```ts
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const classification = v.union(v.literal("fact"), v.literal("assumption"), v.literal("watch"));

export default defineSchema({
  users: defineTable({
    username: v.string(), displayName: v.string(),
    role: v.union(v.literal("member"), v.literal("admin")),
  }).index("by_username", ["username"]),

  opportunities: defineTable({
    title: v.string(), agency: v.string(), aln: v.optional(v.string()),
    status: v.string(), openDate: v.optional(v.string()), closeDate: v.optional(v.string()),
    url: v.string(), classification, lane: v.literal("federal"), lastSeenAt: v.number(),
  }).index("by_aln", ["aln"]).index("by_lastSeen", ["lastSeenAt"]),

  funders: defineTable({
    name: v.string(), ein: v.optional(v.string()), city: v.optional(v.string()),
    state: v.optional(v.string()), nteeCode: v.optional(v.string()),
    isPrivateFoundation: v.optional(v.boolean()),
    lane: v.union(v.literal("foundation"), v.literal("funder-intel")),
    evidence: v.optional(v.string()), classification, lastSeenAt: v.number(),
  }).index("by_state", ["state"]).index("by_lane", ["lane"]),

  curatedFunders: defineTable({
    name: v.string(), description: v.string(), url: v.string(),
    eligibilityNote: v.optional(v.string()),
    updatedBy: v.id("users"), updatedAt: v.number(),
  }),

  shortlistItems: defineTable({
    itemType: v.union(v.literal("opportunity"), v.literal("funder"), v.literal("curated")),
    refId: v.string(), savedBy: v.id("users"), savedAt: v.number(), status: v.string(),
  }).index("by_savedBy", ["savedBy"]),

  comments: defineTable({
    shortlistItemId: v.id("shortlistItems"), authorUserId: v.id("users"),
    body: v.string(), createdAt: v.number(),
  }).index("by_item", ["shortlistItemId"]),

  applications: defineTable({
    shortlistItemId: v.id("shortlistItems"),
    status: v.union(v.literal("researching"), v.literal("applying"),
      v.literal("applied"), v.literal("awarded"), v.literal("declined")),
    amountRequested: v.optional(v.number()), deadline: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")), history: v.array(v.object({
      at: v.number(), by: v.id("users"), from: v.string(), to: v.string(),
    })),
  }).index("by_status", ["status"]),

  refreshRuns: defineTable({
    ranAt: v.number(),
    perLaneCounts: v.object({ federal: v.number(), foundation: v.number(), funderIntel: v.number() }),
    errors: v.array(v.string()),
  }).index("by_ranAt", ["ranAt"]),
});
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run convex/schema.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add convex/schema.ts convex/schema.test.ts
git commit -m "feat(schema): define 8 Convex tables with indexes"
```

---

### Task 3: Username auth with the Password provider

**Type:** implementation
**Depends-on:** 1

Self-contained note: this task ADDS the auth tables to the schema via `...authTables`. Task 2 owns the app tables. Both spread into `defineSchema`, so when this task and Task 2 both touch `convex/schema.ts`, merge by keeping every table key from both — do not overwrite. Apply the auth diff on top of Task 2's table set.

**Files:**
- Create: `convex/auth.ts`, `convex/auth.config.ts`, `convex/users.ts`
- Modify: `convex/schema.ts` (add `...authTables`)
- Test: `convex/auth.test.ts`

- [ ] **Step 1: Write the failing test** — a signed-up user is retrievable and defaults to the `member` role.

```ts
// convex/auth.test.ts
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";

test("currentUser returns null when signed out", async () => {
  const t = convexTest(schema);
  expect(await t.query(api.users.currentUser, {})).toBeNull();
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run convex/auth.test.ts`
Expected: FAIL — `api.users.currentUser` does not exist.

- [ ] **Step 3: Configure Convex Auth** following the `auth-setup` skill. Run `npx @convex-dev/auth` to generate keys, then author the Password provider and the `currentUser` query.

```ts
// convex/auth.ts
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password({ profile(params) {
    return {
      email: params.email as string,
      username: params.username as string,
      displayName: (params.displayName as string) ?? (params.username as string),
      role: "member" as const,
    };
  }})],
});
```

```ts
// convex/users.ts
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const id = await getAuthUserId(ctx);
    return id === null ? null : await ctx.db.get(id);
  },
});
```

In `convex/schema.ts`, import `authTables` and spread it into the schema alongside the Task 2 tables; extend the `users` table fields with `username`, `displayName`, and `role` (the auth component manages base auth fields).

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run convex/auth.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add convex/auth.ts convex/auth.config.ts convex/users.ts convex/schema.ts convex/auth.test.ts
git commit -m "feat(auth): username Password provider + currentUser query"
```

---

### Task 4: Vendor the KMUN design system

**Type:** implementation
**Depends-on:** 1

Self-contained note: copy the design bundle from `/tmp/kmun_design/kmun-design-system/project/` into `src/design/`. If that temp path is gone, re-fetch the handoff bundle from the design URL the operator provided and extract it first. Copy `styles.css`, `tokens/`, `components/`, and `assets/` verbatim — do not rewrite them; this task only relocates and smoke-tests them.

**Files:**
- Create: `src/design/styles.css`, `src/design/tokens/*`, `src/design/components/*`, `src/design/assets/*`
- Test: `src/design/design.test.tsx`

- [ ] **Step 1: Write the failing test** — the StatCard renders its tier tag and a value.

```tsx
// src/design/design.test.tsx
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { StatCard } from "./components/stat-cards/StatCard";

test("StatCard shows the fact tag and value", () => {
  render(<StatCard variant="fact" value="142" label="Prospects" />);
  expect(screen.getByText(/Fact/)).toBeInTheDocument();
  expect(screen.getByText("142")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/design/design.test.tsx`
Expected: FAIL — `src/design/components/stat-cards/StatCard` not found.

- [ ] **Step 3: Copy the bundle in.**

```bash
mkdir -p src/design
cp -R /tmp/kmun_design/kmun-design-system/project/styles.css \
      /tmp/kmun_design/kmun-design-system/project/tokens \
      /tmp/kmun_design/kmun-design-system/project/components \
      /tmp/kmun_design/kmun-design-system/project/assets src/design/
```

Fix the token `@import` paths in `src/design/styles.css` if needed so they resolve relative to `src/design/`.

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run src/design/design.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/design
git commit -m "feat(design): vendor KMUN design system tokens + components"
```

---

### Task 5: App shell — masthead, nav, and the auth gate

**Type:** implementation
**Depends-on:** 2, 3, 4

Self-contained note: this task imports `currentUser` (Task 3), the KMUN components under `src/design/` (Task 4), and the schema types (Task 2). It wires `main.tsx` with the Convex auth provider and renders an `Authenticated`/`Unauthenticated` split: signed-out users see `SignIn`, signed-in users see `AppShell` with the four-tab nav. The four nav tabs render as placeholders this phase — later plans replace each tab's body.

**Files:**
- Create: `src/main.tsx`, `src/App.tsx`, `src/shell/AppShell.tsx`, `src/shell/Nav.tsx`, `src/shell/SignIn.tsx`
- Test: `src/shell/AppShell.test.tsx`, `src/shell/SignIn.test.tsx`

- [ ] **Step 1: Write the failing test** — the nav shows four tabs and marks the active one.

```tsx
// src/shell/AppShell.test.tsx
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Nav } from "./Nav";

test("nav lists the four destinations with Discover active", () => {
  render(<Nav active="discover" onSelect={() => {}} />);
  for (const tab of ["Discover", "Shortlist", "Applications", "Export"]) {
    expect(screen.getByRole("button", { name: tab })).toBeInTheDocument();
  }
  expect(screen.getByRole("button", { name: "Discover" })).toHaveAttribute("aria-current", "page");
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/shell/AppShell.test.tsx`
Expected: FAIL — `./Nav` not found.

- [ ] **Step 3: Build the shell.** `Nav` renders four buttons; the active tab fills solid amber (`background: var(--accent-assumption); color:#fff`) and carries `aria-current="page"`. `AppShell` stacks the WaveBand, a Masthead with the wordmark, `Nav`, and a content slot. `SignIn` is a username + password form calling `useAuthActions().signIn("password", …)`. `App` renders `<Unauthenticated><SignIn/></Unauthenticated>` and `<Authenticated><AppShell/></Authenticated>`. `main.tsx` wraps everything in `ConvexAuthProvider` with a `ConvexReactClient(import.meta.env.VITE_CONVEX_URL)`. Import `src/design/styles.css` once in `main.tsx`.

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run src/shell/AppShell.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/main.tsx src/App.tsx src/shell
git commit -m "feat(shell): masthead, four-tab nav, and auth gate"
```

---

### Task 6: Phase gate — typecheck, tests, lint

**Type:** gate
**Depends-on:** 2, 3, 4, 5

Verification only — writes nothing.

- Suite: `npx tsc --noEmit && npx vitest run`
- Expectation: TypeScript reports no errors; every Vitest suite passes (schema round-trip, auth boundary, design render, nav).

---

## Self-review

**Spec coverage:** Foundation-relevant spec sections are covered — architecture (Convex+React: Tasks 1,5), data model (Task 2, all 8 tables), users & access / username auth (Task 3), design-system integration (Tasks 4,5), accessibility focus ring & masthead (Task 5, inherited from vendored tokens). Discover/refresh/shortlist/applications/export are intentionally deferred to plans 2–6.

**Placeholder scan:** No "TBD/handle appropriately" steps; each code step shows the code. The four nav tab bodies are explicitly scoped as placeholders for this phase (stated in Task 5), not hidden placeholders.

**Type consistency:** `classification` union, table names, and `currentUser` are referenced consistently across Tasks 2, 3, 5. `Nav` props (`active`, `onSelect`) match between the test and Task 5.

**Marker review:** Every task has an explicit `Type`. Cross-task needs are `Depends-on` lines (5 → 2,3,4; 6 → all). The shared-file edit to `convex/schema.ts` (Tasks 2 and 3) carries a self-contained merge note in Task 3's body. The credentialed setup is isolated as `manual` Task 1.

**Acceptance:** to be sealed after operator approval (held-out exam authored from the spec by an independent agent), per ultraplan.
