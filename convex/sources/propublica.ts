import type { NormalizedFunder } from "./types";

// ProPublica Nonprofit Explorer — verified by the Python PoC. No key.
// ntee[id] is the NCCS 10-category major group: 7 = Public/Societal Benefit
// (where grantmaking "T" foundations live), 1 = Arts, Culture & Humanities.
const BASE = "https://projects.propublica.org/nonprofits/api/v2";
export const NTEE_FOUNDATIONS = 7;
export const NTEE_ARTS_MEDIA = 1;
const CCODE_501C3 = 3;

// Pure: map a search.json response into normalized in-state funders.
export function normalizeProPublica(payload: any): NormalizedFunder[] {
  const orgs = payload?.organizations ?? [];
  return orgs.map(
    (o: any): NormalizedFunder => ({
      name: String(o.name ?? "").trim(),
      ein: o.ein != null ? String(o.ein) : undefined,
      city: o.city || undefined,
      state: o.state || undefined,
      nteeCode: o.ntee_code || o.raw_ntee_code || undefined,
      lane: "foundation",
    }),
  );
}

async function search(state: string, nteeId: number): Promise<NormalizedFunder[]> {
  const url =
    `${BASE}/search.json?state%5Bid%5D=${encodeURIComponent(state)}` +
    `&ntee%5Bid%5D=${nteeId}&c_code%5Bid%5D=${CCODE_501C3}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`propublica HTTP ${resp.status}`);
  return normalizeProPublica(await resp.json());
}

// Live fetch: in-state grantmaking foundations + arts/media orgs, de-duped by EIN.
export async function fetchProPublica(state = "OR"): Promise<NormalizedFunder[]> {
  const byEin = new Map<string, NormalizedFunder>();
  for (const nteeId of [NTEE_FOUNDATIONS, NTEE_ARTS_MEDIA]) {
    for (const f of await search(state, nteeId)) {
      byEin.set(f.ein ?? f.name, f);
    }
  }
  return [...byEin.values()];
}
