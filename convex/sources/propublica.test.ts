import { expect, test } from "vitest";
import fixture from "./__fixtures__/propublica.json";
import { normalizeProPublica } from "./propublica";

test("normalizes ProPublica organizations into in-state funders", () => {
  const rows = normalizeProPublica(fixture as any);
  expect(rows.length).toBeGreaterThan(0);
  const f = rows[0];
  expect(f.lane).toBe("foundation");
  expect(f.ein).toMatch(/^\d+$/); // EIN coerced from number to string
  expect(f.state).toBe("OR");
  expect(f.name).toBeTruthy();
});
