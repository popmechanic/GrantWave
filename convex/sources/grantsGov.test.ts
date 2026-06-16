import { expect, test } from "vitest";
import fixture from "./__fixtures__/grantsGov.json";
import { normalizeGrantsGov } from "./grantsGov";

test("normalizes Grants.gov oppHits into federal opportunities", () => {
  const rows = normalizeGrantsGov(fixture as any);
  expect(rows.length).toBeGreaterThan(0);
  const nea = rows.find((r) => r.aln === "45.024");
  expect(nea).toBeDefined();
  expect(nea?.lane).toBe("federal");
  expect(nea?.url).toMatch(/grants\.gov/);
  expect(nea?.title).toBeTruthy();
  expect(nea?.closeDate).toBeTruthy();
});
