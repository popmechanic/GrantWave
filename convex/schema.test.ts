import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "./schema";

test("opportunities table round-trips and indexes by aln", async () => {
  const t = convexTest(schema, import.meta.glob("./**/*.*s"));
  await t.run(async (ctx) => {
    await ctx.db.insert("opportunities", {
      title: "NEA Grants for Arts Projects",
      agency: "NEA",
      aln: "45.024",
      status: "posted",
      url: "https://x",
      classification: "fact",
      lane: "federal",
      lastSeenAt: 1,
    });
    const byAln = await ctx.db
      .query("opportunities")
      .withIndex("by_aln", (q) => q.eq("aln", "45.024"))
      .collect();
    expect(byAln).toHaveLength(1);
  });
});

test("funders table indexes by state and lane", async () => {
  const t = convexTest(schema, import.meta.glob("./**/*.*s"));
  await t.run(async (ctx) => {
    await ctx.db.insert("funders", {
      name: "The Lemelson Foundation",
      state: "OR",
      lane: "foundation",
      classification: "assumption",
      lastSeenAt: 1,
    });
    const inOregon = await ctx.db
      .query("funders")
      .withIndex("by_state", (q) => q.eq("state", "OR"))
      .collect();
    expect(inOregon).toHaveLength(1);
  });
});
