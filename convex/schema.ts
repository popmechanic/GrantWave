import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Every discovered item is tagged with how much to trust it. This union is the
// data spine of the Fact / Worth-a-look / Watch visual language.
const classification = v.union(
  v.literal("fact"),
  v.literal("assumption"),
  v.literal("watch"),
);

export default defineSchema({
  users: defineTable({
    username: v.string(),
    displayName: v.string(),
    role: v.union(v.literal("member"), v.literal("admin")),
  }).index("by_username", ["username"]),

  // Federal openings from Grants.gov — mostly Facts (confirmed open).
  opportunities: defineTable({
    title: v.string(),
    agency: v.string(),
    aln: v.optional(v.string()),
    status: v.string(),
    openDate: v.optional(v.string()),
    closeDate: v.optional(v.string()),
    url: v.string(),
    classification,
    lane: v.literal("federal"),
    lastSeenAt: v.number(),
  })
    .index("by_aln", ["aln"])
    .index("by_lastSeen", ["lastSeenAt"]),

  // Foundations (ProPublica 990) + funder-intelligence (USAspending) — mostly
  // Worth-a-look leads a human should verify.
  funders: defineTable({
    name: v.string(),
    ein: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    nteeCode: v.optional(v.string()),
    isPrivateFoundation: v.optional(v.boolean()),
    lane: v.union(v.literal("foundation"), v.literal("funder-intel")),
    evidence: v.optional(v.string()),
    classification,
    lastSeenAt: v.number(),
  })
    .index("by_state", ["state"])
    .index("by_lane", ["lane"]),

  // Hand-kept public-media funders (Bridge Fund, NFCB…) with no API.
  curatedFunders: defineTable({
    name: v.string(),
    description: v.string(),
    url: v.string(),
    eligibilityNote: v.optional(v.string()),
    updatedBy: v.id("users"),
    updatedAt: v.number(),
  }),

  shortlistItems: defineTable({
    itemType: v.union(
      v.literal("opportunity"),
      v.literal("funder"),
      v.literal("curated"),
    ),
    refId: v.string(),
    savedBy: v.id("users"),
    savedAt: v.number(),
    status: v.string(),
  }).index("by_savedBy", ["savedBy"]),

  comments: defineTable({
    shortlistItemId: v.id("shortlistItems"),
    authorUserId: v.id("users"),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_item", ["shortlistItemId"]),

  applications: defineTable({
    shortlistItemId: v.id("shortlistItems"),
    status: v.union(
      v.literal("researching"),
      v.literal("applying"),
      v.literal("applied"),
      v.literal("awarded"),
      v.literal("declined"),
    ),
    amountRequested: v.optional(v.number()),
    deadline: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
    history: v.array(
      v.object({
        at: v.number(),
        by: v.id("users"),
        from: v.string(),
        to: v.string(),
      }),
    ),
  }).index("by_status", ["status"]),

  refreshRuns: defineTable({
    ranAt: v.number(),
    perLaneCounts: v.object({
      federal: v.number(),
      foundation: v.number(),
      funderIntel: v.number(),
    }),
    errors: v.array(v.string()),
  }).index("by_ranAt", ["ranAt"]),
});
