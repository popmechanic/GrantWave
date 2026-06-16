import type { NormalizedOpportunity } from "./types";

// Grants.gov Search2 — verified by the Python PoC. No auth. The Assistance
// Listing filter field is `cfda` (NOT `aln`) and takes ONE value per call.
const SEARCH_URL = "https://api.grants.gov/v1/api/search2";
const ELIGIBILITY_501C3 = "12"; // Nonprofits with 501(c)(3) status

export const KNOWN_RELEVANT_ALNS = [
  "45.024", // NEA - Grants to Organizations
  "45.036", // NEH - Media Projects
  "45.149", // NEH - Preservation and Access
  "45.164", // NEH - Public Programs
  "45.169", // NEH - Digital Humanities
  "45.301", // IMLS - National Leadership Grants for Museums
  "45.310", // IMLS - Grants to States (LSTA)
  "45.312", // IMLS - National Leadership Grants for Libraries
];

// Pure: map a Search2 response into normalized federal opportunities.
export function normalizeGrantsGov(payload: any): NormalizedOpportunity[] {
  const hits = payload?.data?.oppHits ?? [];
  const out: NormalizedOpportunity[] = [];
  const seen = new Set<string>();
  for (const h of hits) {
    const id = String(h.id ?? "");
    if (id && seen.has(id)) continue;
    if (id) seen.add(id);
    const aln = h.alnist?.[0] ?? h.cfdaList?.[0];
    out.push({
      title: String(h.title ?? "").trim(),
      agency: h.agency ?? h.agencyCode ?? "",
      aln: aln != null ? String(aln) : undefined,
      status: h.oppStatus ?? "",
      openDate: h.openDate || undefined,
      closeDate: h.closeDate || undefined,
      url: id ? `https://www.grants.gov/search-results-detail/${id}` : "",
      lane: "federal",
    });
  }
  return out;
}

async function searchOne(body: Record<string, unknown>): Promise<NormalizedOpportunity[]> {
  const resp = await fetch(SEARCH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`grants.gov HTTP ${resp.status}`);
  return normalizeGrantsGov(await resp.json());
}

// Live fetch: a keyword sweep (501(c)(3)-eligible) plus an ALN-precision sweep,
// de-duplicated by opportunity URL.
export async function fetchGrantsGov(
  keywords: string[] = ["public radio", "community media", "public telecommunications"],
): Promise<NormalizedOpportunity[]> {
  const byKey = new Map<string, NormalizedOpportunity>();
  for (const kw of keywords) {
    for (const o of await searchOne({
      keyword: kw,
      eligibilities: ELIGIBILITY_501C3,
      oppStatuses: "forecasted|posted",
      rows: 25,
    })) {
      if (o.url) byKey.set(o.url, o);
    }
  }
  for (const aln of KNOWN_RELEVANT_ALNS) {
    for (const o of await searchOne({
      keyword: "",
      cfda: aln,
      oppStatuses: "forecasted|posted",
      rows: 25,
    })) {
      if (o.url) byKey.set(o.url, o);
    }
  }
  return [...byKey.values()];
}
