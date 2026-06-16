import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

const itemType = v.union(
  v.literal("opportunity"),
  v.literal("funder"),
  v.literal("curated"),
);

async function requireUser(ctx: { auth: any; db: any }): Promise<Id<"users">> {
  const uid = await getAuthUserId(ctx as any);
  if (uid === null) throw new Error("Sign in to do that.");
  return uid;
}

// Save a Discover prospect to the shared shortlist. Idempotent: the same prospect
// is never shortlisted twice, even by different members.
export const save = mutation({
  args: { itemType, refId: v.string() },
  handler: async (ctx, { itemType, refId }) => {
    const uid = await requireUser(ctx);
    const existing = await ctx.db.query("shortlistItems").collect();
    const dup = existing.find((s) => s.refId === refId);
    if (dup) return dup._id;
    return await ctx.db.insert("shortlistItems", {
      itemType,
      refId,
      savedBy: uid,
      savedAt: Date.now(),
      status: "saved",
    });
  },
});

export const unsave = mutation({
  args: { shortlistItemId: v.id("shortlistItems") },
  handler: async (ctx, { shortlistItemId }) => {
    await requireUser(ctx);
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_item", (q) => q.eq("shortlistItemId", shortlistItemId))
      .collect();
    for (const c of comments) await ctx.db.delete(c._id);
    await ctx.db.delete(shortlistItemId);
  },
});

export const addComment = mutation({
  args: { shortlistItemId: v.id("shortlistItems"), body: v.string() },
  handler: async (ctx, { shortlistItemId, body }) => {
    const uid = await requireUser(ctx);
    const text = body.trim();
    if (!text) return null;
    return await ctx.db.insert("comments", {
      shortlistItemId,
      authorUserId: uid,
      body: text,
      createdAt: Date.now(),
    });
  },
});

// The set of refIds currently shortlisted (team-wide) — drives the Save toggle.
export const savedRefs = query({
  args: {},
  handler: async (ctx): Promise<string[]> => {
    if ((await getAuthUserId(ctx)) === null) return [];
    const items = await ctx.db.query("shortlistItems").collect();
    return items.map((s) => s.refId);
  },
});

// The shortlist, enriched with each prospect's details, its saver's username, and
// its comment thread (each comment attributed). Newest saves first.
export const listShortlist = query({
  args: {},
  handler: async (ctx) => {
    if ((await getAuthUserId(ctx)) === null) return [];
    const items = (await ctx.db.query("shortlistItems").collect()).sort(
      (a, b) => b.savedAt - a.savedAt,
    );
    const out = [];
    for (const s of items) {
      let title = "(no longer listed)";
      let subtitle = "";
      let tier = "assumption";
      let lane = "";
      let url: string | undefined;
      if (s.itemType === "opportunity") {
        const o = await ctx.db.get(s.refId as Id<"opportunities">);
        if (o) {
          title = o.title;
          subtitle = [o.agency, o.aln ? `ALN ${o.aln}` : null, o.closeDate ? `closes ${o.closeDate}` : null]
            .filter(Boolean)
            .join(" · ");
          tier = o.classification;
          lane = o.lane;
          url = o.url;
        }
      } else if (s.itemType === "funder") {
        const f = await ctx.db.get(s.refId as Id<"funders">);
        if (f) {
          title = f.name;
          subtitle = [f.city, f.state].filter(Boolean).join(", ");
          tier = f.classification;
          lane = f.lane;
          url = f.ein
            ? `https://projects.propublica.org/nonprofits/organizations/${f.ein}`
            : undefined;
        }
      }
      const saver = await ctx.db.get(s.savedBy);
      const rawComments = (
        await ctx.db
          .query("comments")
          .withIndex("by_item", (q) => q.eq("shortlistItemId", s._id))
          .collect()
      ).sort((a, b) => a.createdAt - b.createdAt);
      const comments = [];
      for (const c of rawComments) {
        const author = await ctx.db.get(c.authorUserId);
        comments.push({
          id: c._id,
          body: c.body,
          author: author?.username ?? author?.email ?? "someone",
          createdAt: c.createdAt,
        });
      }
      out.push({
        id: s._id,
        refId: s.refId,
        itemType: s.itemType,
        title,
        subtitle,
        tier,
        lane,
        url,
        savedBy: saver?.username ?? saver?.email ?? "someone",
        savedAt: s.savedAt,
        comments,
      });
    }
    return out;
  },
});
