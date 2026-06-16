import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";
import { filterSort, type ResultItem } from "./discover";

const items: ResultItem[] = [
  { id: "1", kind: "opportunity", lane: "federal", tier: "fact", title: "NEA Grants", status: "posted", closesSoon: false, relevant: true },
  { id: "2", kind: "opportunity", lane: "federal", tier: "fact", title: "Media Projects", status: "posted", closesSoon: true, relevant: true },
  { id: "3", kind: "funder", lane: "foundation", tier: "assumption", title: "Lemelson Foundation", location: "Portland, OR", closesSoon: false, relevant: true },
  { id: "4", kind: "funder", lane: "funder-intel", tier: "assumption", title: "NEH", evidence: "funded public radio", closesSoon: false, relevant: true },
  { id: "5", kind: "opportunity", lane: "federal", tier: "fact", title: "Old Grant", status: "closed", closesSoon: false, relevant: false },
];

test("filterSort filters by lane", () => {
  expect(filterSort(items, { lane: "federal" }).every((i) => i.lane === "federal")).toBe(true);
  expect(filterSort(items, { lane: "foundation" }).map((i) => i.id)).toEqual(["3"]);
});

test("filterSort keyword matches title, evidence, and location", () => {
  expect(filterSort(items, { q: "radio" }).map((i) => i.id)).toEqual(["4"]);
  expect(filterSort(items, { q: "portland" }).map((i) => i.id)).toEqual(["3"]);
});

test("filterSort openNow drops closed openings", () => {
  expect(filterSort(items, { openNow: true }).find((i) => i.id === "5")).toBeUndefined();
});

test("filterSort floats soon-closing rows to the top (among relevant)", () => {
  expect(filterSort(items, {})[0].id).toBe("2");
});

test("filterSort sinks non-relevant rows below relevant ones", () => {
  const ranked = filterSort(items, {}).map((i) => i.id);
  expect(ranked[ranked.length - 1]).toBe("5"); // the only non-relevant row
});

test("listResults returns empty when signed out", async () => {
  const t = convexTest(schema, import.meta.glob("./**/*.*s"));
  expect(await t.query(api.discover.listResults, {})).toEqual([]);
});
