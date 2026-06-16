export type Lane = "federal" | "foundation" | "funder-intel" | "curated";

// Federal openings are confirmed/audited Facts; every other lane is a lead a
// human should verify (Worth a look). This is the spine of the visual language.
export function classify(lane: Lane): "fact" | "assumption" {
  return lane === "federal" ? "fact" : "assumption";
}

// Derived Watch flag: a real deadline within `days` of now (default 14).
export function closesSoon(
  closeDate: string | undefined,
  now: number,
  days = 14,
): boolean {
  if (!closeDate) return false;
  const t = Date.parse(closeDate);
  if (Number.isNaN(t)) return false;
  return t >= now && t - now <= days * 86_400_000;
}
