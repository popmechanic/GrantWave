import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

const statusValidator = v.union(
  v.literal("researching"),
  v.literal("applying"),
  v.literal("applied"),
  v.literal("awarded"),
  v.literal("declined"),
);

async function requireUser(ctx: { auth: any; db: any }): Promise<Id<"users">> {
  const uid = await getAuthUserId(ctx as any);
  if (uid === null) throw new Error("Sign in to do that.");
  return uid;
}

// Start tracking a shortlisted prospect. One application per shortlist item.
export const start = mutation({
  args: { shortlistItemId: v.id("shortlistItems") },
  handler: async (ctx, { shortlistItemId }) => {
    await requireUser(ctx);
    const existing = await ctx.db.query("applications").collect();
    const dup = existing.find((a) => a.shortlistItemId === shortlistItemId);
    if (dup) return dup._id;
    return await ctx.db.insert("applications", {
      shortlistItemId,
      status: "researching",
      history: [],
    });
  },
});

// Move an application's status and record who moved it, from where, to where.
export const setStatus = mutation({
  args: { applicationId: v.id("applications"), status: statusValidator },
  handler: async (ctx, { applicationId, status }) => {
    const uid = await requireUser(ctx);
    const app = await ctx.db.get(applicationId);
    if (!app || app.status === status) return;
    await ctx.db.patch(applicationId, {
      status,
      history: [...app.history, { at: Date.now(), by: uid, from: app.status, to: status }],
    });
  },
});

export const setDetails = mutation({
  args: {
    applicationId: v.id("applications"),
    amountRequested: v.optional(v.number()),
    deadline: v.optional(v.string()),
  },
  handler: async (ctx, { applicationId, amountRequested, deadline }) => {
    await requireUser(ctx);
    const patch: Record<string, unknown> = {};
    if (amountRequested !== undefined) patch.amountRequested = amountRequested;
    if (deadline !== undefined) patch.deadline = deadline;
    if (Object.keys(patch).length > 0) await ctx.db.patch(applicationId, patch);
  },
});

export const assign = mutation({
  args: { applicationId: v.id("applications"), toMe: v.boolean() },
  handler: async (ctx, { applicationId, toMe }) => {
    const uid = await requireUser(ctx);
    await ctx.db.patch(applicationId, { assignedTo: toMe ? uid : undefined });
  },
});

// Shortlist items that already have an application — drives the Shortlist button.
export const appliedShortlistIds = query({
  args: {},
  handler: async (ctx): Promise<string[]> => {
    if ((await getAuthUserId(ctx)) === null) return [];
    const apps = await ctx.db.query("applications").collect();
    return apps.map((a) => a.shortlistItemId);
  },
});

// Every application, enriched with its prospect and assignee for the board.
export const listApplications = query({
  args: {},
  handler: async (ctx) => {
    if ((await getAuthUserId(ctx)) === null) return [];
    const apps = (await ctx.db.query("applications").collect()).sort(
      (a, b) => b._creationTime - a._creationTime,
    );
    const out = [];
    for (const a of apps) {
      let title = "(no longer listed)";
      let subtitle = "";
      let tier = "assumption";
      const s = await ctx.db.get(a.shortlistItemId);
      if (s) {
        if (s.itemType === "opportunity") {
          const o = await ctx.db.get(s.refId as Id<"opportunities">);
          if (o) {
            title = o.title;
            subtitle = [o.agency, o.aln ? `ALN ${o.aln}` : null].filter(Boolean).join(" · ");
            tier = o.classification;
          }
        } else if (s.itemType === "funder") {
          const f = await ctx.db.get(s.refId as Id<"funders">);
          if (f) {
            title = f.name;
            subtitle = [f.city, f.state].filter(Boolean).join(", ");
            tier = f.classification;
          }
        }
      }
      const assignee = a.assignedTo ? await ctx.db.get(a.assignedTo) : null;
      out.push({
        id: a._id,
        shortlistItemId: a.shortlistItemId,
        title,
        subtitle,
        tier,
        status: a.status,
        amountRequested: a.amountRequested,
        deadline: a.deadline,
        assignee: assignee?.username ?? assignee?.email ?? null,
        historyCount: a.history.length,
      });
    }
    return out;
  },
});
