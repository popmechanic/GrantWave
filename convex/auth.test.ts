import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";

test("currentUser returns null when signed out", async () => {
  const t = convexTest(schema, import.meta.glob("./**/*.*s"));
  expect(await t.query(api.users.currentUser, {})).toBeNull();
});
