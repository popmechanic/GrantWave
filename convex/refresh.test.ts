import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "./schema";
import { internal } from "./_generated/api";
import gFix from "./sources/__fixtures__/grantsGov.json";
import pFix from "./sources/__fixtures__/propublica.json";
import { normalizeGrantsGov } from "./sources/grantsGov";
import { normalizeProPublica } from "./sources/propublica";

test("applyOpportunities upserts federal opportunities as Facts", async () => {
  const t = convexTest(schema, import.meta.glob("./**/*.*s"));
  const rows = normalizeGrantsGov(gFix as any);
  await t.mutation(internal.refresh.applyOpportunities, { rows, ranAt: 1000 });
  const opps = await t.run((ctx) => ctx.db.query("opportunities").collect());
  expect(opps).toHaveLength(rows.length);
  expect(opps.every((o) => o.classification === "fact" && o.lastSeenAt === 1000)).toBe(true);
});

test("applyOpportunities ages openings not seen in a later run", async () => {
  const t = convexTest(schema, import.meta.glob("./**/*.*s"));
  const rows = normalizeGrantsGov(gFix as any);
  await t.mutation(internal.refresh.applyOpportunities, { rows, ranAt: 1000 });
  await t.mutation(internal.refresh.applyOpportunities, { rows: [], ranAt: 2000 });
  const opps = await t.run((ctx) => ctx.db.query("opportunities").collect());
  expect(opps.length).toBe(rows.length);
  expect(opps.every((o) => o.status === "closed")).toBe(true);
});

test("applyFunders upserts foundations as assumptions", async () => {
  const t = convexTest(schema, import.meta.glob("./**/*.*s"));
  const rows = normalizeProPublica(pFix as any);
  await t.mutation(internal.refresh.applyFunders, { rows, ranAt: 1000 });
  const funders = await t.run((ctx) => ctx.db.query("funders").collect());
  expect(funders.length).toBe(rows.length);
  expect(funders.every((f) => f.classification === "assumption")).toBe(true);
});

test("logRun records a refresh run with per-lane counts", async () => {
  const t = convexTest(schema, import.meta.glob("./**/*.*s"));
  await t.mutation(internal.refresh.logRun, {
    perLaneCounts: { federal: 2, foundation: 25, funderIntel: 5 },
    errors: [],
    ranAt: 1000,
  });
  const runs = await t.run((ctx) => ctx.db.query("refreshRuns").collect());
  expect(runs).toHaveLength(1);
  expect(runs[0].perLaneCounts.federal).toBe(2);
});
