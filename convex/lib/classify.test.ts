import { expect, test } from "vitest";
import { classify, closesSoon } from "./classify";

test("federal lane is a Fact; foundation/funder-intel are assumptions", () => {
  expect(classify("federal")).toBe("fact");
  expect(classify("foundation")).toBe("assumption");
  expect(classify("funder-intel")).toBe("assumption");
  expect(classify("curated")).toBe("assumption");
});

test("closesSoon: true within 14 days, false beyond or missing", () => {
  const now = 1_000_000_000_000;
  const day = 86_400_000;
  expect(closesSoon(new Date(now + 5 * day).toISOString(), now)).toBe(true);
  expect(closesSoon(new Date(now + 30 * day).toISOString(), now)).toBe(false);
  expect(closesSoon(undefined, now)).toBe(false);
  expect(closesSoon("not-a-date", now)).toBe(false);
});
