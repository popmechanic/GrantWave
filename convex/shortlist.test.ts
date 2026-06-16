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
  const as = t.withIdentity({ subject: `${userId}|session1` });
  return { t, userId, oppId, as };
}

test("save is idempotent and savedRefs reflects it", async () => {
  const { as, oppId } = await setup();
  await as.mutation(api.shortlist.save, { itemType: "opportunity", refId: oppId });
  await as.mutation(api.shortlist.save, { itemType: "opportunity", refId: oppId });
  const refs = await as.query(api.shortlist.savedRefs, {});
  expect(refs).toEqual([oppId]);
});

test("listShortlist enriches the prospect, saver, and attributed comments", async () => {
  const { as, oppId } = await setup();
  const sid = await as.mutation(api.shortlist.save, { itemType: "opportunity", refId: oppId });
  await as.mutation(api.shortlist.addComment, { shortlistItemId: sid, body: "  Worth applying.  " });
  const list = await as.query(api.shortlist.listShortlist, {});
  expect(list).toHaveLength(1);
  expect(list[0].title).toBe("NEA Grants for Arts Projects");
  expect(list[0].tier).toBe("fact");
  expect(list[0].savedBy).toBe("marcus");
  expect(list[0].comments).toHaveLength(1);
  expect(list[0].comments[0].body).toBe("Worth applying."); // trimmed
  expect(list[0].comments[0].author).toBe("marcus");
});

test("unsave removes the item and its comments", async () => {
  const { as, oppId } = await setup();
  const sid = await as.mutation(api.shortlist.save, { itemType: "opportunity", refId: oppId });
  await as.mutation(api.shortlist.addComment, { shortlistItemId: sid, body: "note" });
  await as.mutation(api.shortlist.unsave, { shortlistItemId: sid });
  expect(await as.query(api.shortlist.savedRefs, {})).toEqual([]);
  expect(await as.query(api.shortlist.listShortlist, {})).toEqual([]);
});

test("save throws when signed out", async () => {
  const t = convexTest(schema, import.meta.glob("./**/*.*s"));
  await expect(
    t.mutation(api.shortlist.save, { itemType: "opportunity", refId: "x" }),
  ).rejects.toThrow(/sign in/i);
});
