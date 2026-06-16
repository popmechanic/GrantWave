import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { closesSoon } from "./lib/classify";
import { KNOWN_RELEVANT_ALNS } from "./sources/grantsGov";
import type { Doc } from "./_generated/dataModel";

// A federal opening is high-relevance if it's under a targeted ALN or its text
// names media/radio/arts/humanities — used to float real hits above keyword noise.
const RELEVANT_ALNS = new Set(KNOWN_RELEVANT_ALNS);
const RELEVANT_TERMS =
  /radio|media|broadcast|telecommunication|journalism|public media|humanities|\barts\b|digital equity|documentary/i;

function isRelevantOpportunity(o: Doc<"opportunities">): boolean {
  if (o.aln && RELEVANT_ALNS.has(o.aln)) return true;
  return RELEVANT_TERMS.test(`${o.title} ${o.agency}`);
}

// A unified result row the Discover screen renders, regardless of source lane.
export type ResultItem = {
  id: string;
  kind: "opportunity" | "funder";
  lane: "federal" | "foundation" | "funder-intel";
  tier: "fact" | "assumption" | "watch";
  title: string;
  agency?: string;
  aln?: string;
  status?: string;
  closeDate?: string;
  closesSoon: boolean;
  relevant: boolean;
  url?: string;
  location?: string;
  nteeCode?: string;
  evidence?: string;
};

export function oppToItem(o: Doc<"opportunities">, now: number): ResultItem {
  return {
    id: o._id,
    kind: "opportunity",
    lane: "federal",
    tier: o.classification,
    title: o.title,
    agency: o.agency,
    aln: o.aln,
    status: o.status,
    closeDate: o.closeDate,
    closesSoon: closesSoon(o.closeDate, now),
    relevant: isRelevantOpportunity(o),
    url: o.url,
  };
}

export function funderToItem(f: Doc<"funders">): ResultItem {
  const location = [f.city, f.state].filter(Boolean).join(", ");
  return {
    id: f._id,
    kind: "funder",
    lane: f.lane,
    tier: f.classification,
    title: f.name,
    closesSoon: false,
    relevant: true,
    location: location || undefined,
    nteeCode: f.nteeCode,
    evidence: f.evidence,
    url: f.ein
      ? `https://projects.propublica.org/nonprofits/organizations/${f.ein}`
      : undefined,
  };
}

const LANE_RANK: Record<string, number> = {
  federal: 0,
  foundation: 1,
  "funder-intel": 2,
};

// Pure filter + sort: lane, keyword (title/agency/evidence/location), "open now"
// (drop closed openings). Soon-closing rows float to the top, then by lane, then title.
export function filterSort(
  items: ResultItem[],
  opts: { lane?: string; q?: string; openNow?: boolean },
): ResultItem[] {
  let out = items;
  if (opts.lane) out = out.filter((it) => it.lane === opts.lane);
  if (opts.openNow)
    out = out.filter((it) => it.kind !== "opportunity" || it.status !== "closed");
  const needle = (opts.q ?? "").trim().toLowerCase();
  if (needle)
    out = out.filter((it) =>
      `${it.title} ${it.agency ?? ""} ${it.evidence ?? ""} ${it.location ?? ""}`
        .toLowerCase()
        .includes(needle),
    );
  return [...out].sort((a, b) => {
    if (a.relevant !== b.relevant) return a.relevant ? -1 : 1;
    if (a.closesSoon !== b.closesSoon) return a.closesSoon ? -1 : 1;
    if (a.lane !== b.lane) return (LANE_RANK[a.lane] ?? 9) - (LANE_RANK[b.lane] ?? 9);
    return a.title.localeCompare(b.title);
  });
}

export const listResults = query({
  args: {
    lane: v.optional(v.string()),
    q: v.optional(v.string()),
    openNow: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<ResultItem[]> => {
    const uid = await getAuthUserId(ctx);
    if (uid === null) return [];
    const now = Date.now();
    const opps = await ctx.db.query("opportunities").collect();
    const funders = await ctx.db.query("funders").collect();
    const items = [
      ...opps.map((o) => oppToItem(o, now)),
      ...funders.map((f) => funderToItem(f)),
    ];
    return filterSort(items, args).slice(0, 200);
  },
});

export const getOpportunity = query({
  args: { id: v.id("opportunities") },
  handler: async (ctx, { id }) => {
    if ((await getAuthUserId(ctx)) === null) return null;
    return await ctx.db.get(id);
  },
});

export const getFunder = query({
  args: { id: v.id("funders") },
  handler: async (ctx, { id }) => {
    if ((await getAuthUserId(ctx)) === null) return null;
    return await ctx.db.get(id);
  },
});
