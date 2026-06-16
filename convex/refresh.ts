import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { classify, type Lane } from "./lib/classify";
import { fetchGrantsGov } from "./sources/grantsGov";
import { fetchProPublica } from "./sources/propublica";
import { fetchUsaspending } from "./sources/usaspending";
import type { NormalizedOpportunity, NormalizedFunder } from "./sources/types";

// Upsert federal opportunities (match by URL), then age any opening not seen in
// this run to status "closed" — never delete, so shortlist references survive.
export const applyOpportunities = internalMutation({
  args: { rows: v.array(v.any()), ranAt: v.number() },
  handler: async (ctx, { rows, ranAt }) => {
    const existing = await ctx.db.query("opportunities").collect();
    const byUrl = new Map(existing.map((d) => [d.url, d._id]));
    for (const r of rows as NormalizedOpportunity[]) {
      const doc = {
        title: r.title,
        agency: r.agency,
        aln: r.aln,
        status: r.status,
        openDate: r.openDate,
        closeDate: r.closeDate,
        url: r.url,
        classification: classify("federal"),
        lane: "federal" as const,
        lastSeenAt: ranAt,
      };
      const id = byUrl.get(r.url);
      if (id) await ctx.db.patch(id, doc);
      else await ctx.db.insert("opportunities", doc);
    }
    const stale = await ctx.db
      .query("opportunities")
      .withIndex("by_lastSeen", (q) => q.lt("lastSeenAt", ranAt))
      .collect();
    for (const d of stale) {
      if (d.status !== "closed") await ctx.db.patch(d._id, { status: "closed" });
    }
  },
});

// Upsert funders (foundations + funder-intelligence), matched by lane + EIN/name.
export const applyFunders = internalMutation({
  args: { rows: v.array(v.any()), ranAt: v.number() },
  handler: async (ctx, { rows, ranAt }) => {
    const key = (ein: string | undefined, name: string, lane: string) =>
      `${lane}:${ein ?? name}`;
    const existing = await ctx.db.query("funders").collect();
    const byKey = new Map(existing.map((d) => [key(d.ein, d.name, d.lane), d._id]));
    for (const r of rows as NormalizedFunder[]) {
      const doc = {
        name: r.name,
        ein: r.ein,
        city: r.city,
        state: r.state,
        nteeCode: r.nteeCode,
        isPrivateFoundation: r.isPrivateFoundation,
        lane: r.lane,
        evidence: r.evidence,
        classification: classify(r.lane as Lane),
        lastSeenAt: ranAt,
      };
      const id = byKey.get(key(r.ein, r.name, r.lane));
      if (id) await ctx.db.patch(id, doc);
      else await ctx.db.insert("funders", doc);
    }
  },
});

export const logRun = internalMutation({
  args: {
    perLaneCounts: v.object({
      federal: v.number(),
      foundation: v.number(),
      funderIntel: v.number(),
    }),
    errors: v.array(v.string()),
    ranAt: v.number(),
  },
  handler: async (ctx, { perLaneCounts, errors, ranAt }) => {
    await ctx.db.insert("refreshRuns", { ranAt, perLaneCounts, errors });
  },
});

// Orchestrator: pull every lane, upsert, log. One lane failing doesn't abort.
export const run = internalAction({
  args: {},
  handler: async (ctx): Promise<{ federal: number; foundation: number; funderIntel: number }> => {
    const ranAt = Date.now();
    const errors: string[] = [];
    const counts = { federal: 0, foundation: 0, funderIntel: 0 };
    const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

    try {
      const opps = await fetchGrantsGov();
      counts.federal = opps.length;
      await ctx.runMutation(internal.refresh.applyOpportunities, { rows: opps, ranAt });
    } catch (e) {
      errors.push(`federal: ${msg(e)}`);
    }
    try {
      const funders = await fetchProPublica("OR");
      counts.foundation = funders.length;
      await ctx.runMutation(internal.refresh.applyFunders, { rows: funders, ranAt });
    } catch (e) {
      errors.push(`foundation: ${msg(e)}`);
    }
    try {
      const intel = await fetchUsaspending();
      counts.funderIntel = intel.length;
      await ctx.runMutation(internal.refresh.applyFunders, { rows: intel, ranAt });
    } catch (e) {
      errors.push(`funderIntel: ${msg(e)}`);
    }

    await ctx.runMutation(internal.refresh.logRun, { perLaneCounts: counts, errors, ranAt });
    return counts;
  },
});
