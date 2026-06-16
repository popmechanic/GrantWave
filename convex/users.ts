import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// The signed-in user's record, or null when nobody is signed in.
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const id = await getAuthUserId(ctx);
    return id === null ? null : await ctx.db.get(id);
  },
});
