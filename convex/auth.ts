import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

// Password provider. Accounts are keyed by email; every user also carries a
// username (for attribution on notes/comments), a display name, and a role.
// New users default to the "member" role; admins are promoted out of band.
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const username = params.username as string;
        return {
          email: params.email as string,
          username,
          displayName: (params.displayName as string) ?? username,
          role: "member" as const,
        };
      },
    }),
  ],
});
