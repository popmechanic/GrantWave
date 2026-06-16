import type { NormalizedFunder } from "./types";

// USAspending — verified by the Python PoC. No auth. We mine past GRANT awards
// to PUBLIC-radio recipients to infer which agencies fund radio. KMUN is
// COMMUNITY radio (a distinct category), so each row is funder *intelligence*:
// the recipient being public radio is a Fact; that the same funder might back
// community radio is a lead to verify. Hence lane "funder-intel".
const SEARCH_URL = "https://api.usaspending.gov/api/v2/search/spending_by_award/";
const GRANT_TYPES = ["02", "03", "04", "05"];
const FIELDS = [
  "Award ID",
  "Recipient Name",
  "Awarding Agency",
  "Awarding Sub Agency",
  "Award Amount",
  "Start Date",
  "Award Type",
];

function money(amount: unknown): string {
  return typeof amount === "number"
    ? `$${Math.round(amount).toLocaleString("en-US")}`
    : "";
}

// Pure: collapse award results into one funder-intelligence lead per agency.
export function normalizeUsaspending(payload: any): NormalizedFunder[] {
  const results = payload?.results ?? [];
  const byAgency = new Map<string, NormalizedFunder>();
  for (const r of results) {
    const agency = String(r["Awarding Agency"] ?? "").trim();
    if (!agency) continue;
    if (byAgency.has(agency)) continue; // first/representative award per agency
    const recipient = r["Recipient Name"] ?? "a public-radio organization";
    const amt = money(r["Award Amount"]);
    byAgency.set(agency, {
      name: agency,
      lane: "funder-intel",
      evidence:
        `Fact: ${agency} funded ${recipient}${amt ? ` (${amt})` : ""}, a public-radio recipient. ` +
        `Worth a look: KMUN is community radio — a distinct category — so confirm whether the ` +
        `same program admits community stations.`,
    });
  }
  return [...byAgency.values()];
}

// Live fetch: grant awards mentioning "public radio".
export async function fetchUsaspending(
  keywords: string[] = ["public radio"],
): Promise<NormalizedFunder[]> {
  const resp = await fetch(SEARCH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filters: { award_type_codes: GRANT_TYPES, keywords },
      fields: FIELDS,
      page: 1,
      limit: 50,
      sort: "Award Amount",
      order: "desc",
    }),
  });
  if (!resp.ok) throw new Error(`usaspending HTTP ${resp.status}`);
  return normalizeUsaspending(await resp.json());
}
