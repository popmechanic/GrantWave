import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { AppShell } from "./shell/AppShell";
import { SignIn } from "./shell/SignIn";

// Signed-out visitors get the sign-in gate; signed-in users get the app shell.
export default function App() {
  return (
    <>
      <AuthLoading>
        <div style={{ padding: "var(--space-8)", color: "var(--text-muted)" }}>
          Loading…
        </div>
      </AuthLoading>
      <Unauthenticated>
        <SignIn />
      </Unauthenticated>
      <Authenticated>
        <AppShell />
      </Authenticated>
    </>
  );
}
