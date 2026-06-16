import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";

async function setup() {
  const t = convexTest(schema, import.meta.glob("./**/*.*s"));
  const userId = await t.run((ctx) =>
    ctx.db.insert("users", { username: "marcus", displayName: "Marcus", role: "member" }),
  );
  const oppId = await t.run((ctx) =>
    ctx.db.insert("opportunities", {
      title: "NEA Grants for Arts Projects",
      agency: "NEA",
      aln: "45.024",
      status: "posted",
      url: "https://x",
      classification: "fact",
      lane: "federal",
      lastSeenAt: 1,
    }),
  );
  const slId = await t.run((ctx) =>
    ctx.db.insert("shortlistItems", {
      itemType: "opportunity",
      refId: oppId,
      savedBy: userId,
      savedAt: 1,
      status: "saved",
    }),
  );
  const as = t.withIdentity({ subject: `${userId}|session1` });
  return { t, userId, slId, as };
}

test("start is idempotent and appliedShortlistIds reflects it", async () => {
  const { as, slId } = await setup();
  const a1 = await as.mutation(api.applications.start, { shortlistItemId: slId });
  const a2 = await as.mutation(api.applications.start, { shortlistItemId: slId });
  expect(a1).toEqual(a2);
  expect(await as.query(api.applications.appliedShortlistIds, {})).toEqual([slId]);
});

test("setStatus moves and records history; listApplications enriches", async () => {
  const { as, slId } = await setup();
  const appId = await as.mutation(api.applications.start, { shortlistItemId: slId });
  await as.mutation(api.applications.setStatus, { applicationId: appId, status: "applied" });
  const list = await as.query(api.applications.listApplications, {});
  expect(list).toHaveLength(1);
  expect(list[0].status).toBe("applied");
  expect(list[0].title).toBe("NEA Grants for Arts Projects");
  expect(list[0].historyCount).toBe(1);
});

test("assign to me sets the assignee username", async () => {
  const { as, slId } = await setup();
  const appId = await as.mutation(api.applications.start, { shortlistItemId: slId });
  await as.mutation(api.applications.assign, { applicationId: appId, toMe: true });
  const list = await as.query(api.applications.listApplications, {});
  expect(list[0].assignee).toBe("marcus");
});

test("start throws when signed out", async () => {
  const { t, slId } = await setup();
  await expect(
    t.mutation(api.applications.start, { shortlistItemId: slId }),
  ).rejects.toThrow(/sign in/i);
});
