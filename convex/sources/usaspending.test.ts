import { expect, test } from "vitest";
import fixture from "./__fixtures__/usaspending.json";
import { normalizeUsaspending } from "./usaspending";

test("normalizes USAspending awards into funder-intelligence leads", () => {
  const rows = normalizeUsaspending(fixture as any);
  expect(rows.length).toBeGreaterThan(0);
  const f = rows[0];
  expect(f.lane).toBe("funder-intel");
  expect(f.name).toBeTruthy();
  expect(f.evidence).toMatch(/community radio/i);
});
