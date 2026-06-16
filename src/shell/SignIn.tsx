import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { WaveBand } from "../design/components/brand/WaveBand";

type Flow = "signIn" | "signUp";

function Field({ id, label, type }: { id: string; label: string; type: string }) {
  return (
    <label
      htmlFor={id}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-1)",
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
      }}
    >
      {label}
      <input
        id={id}
        name={id}
        type={type}
        required
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-md)",
          padding: "var(--space-3)",
          border: "var(--border-hair) solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          background: "var(--color-bg)",
          color: "var(--text-body)",
        }}
      />
    </label>
  );
}

// The sign-in / sign-up gate. Email + password (Convex Password provider); on
// sign-up the username is captured for attribution on notes and comments.
export function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<Flow>("signIn");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <WaveBand />
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-8)",
        }}
      >
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setSubmitting(true);
            setError(null);
            const data = new FormData(event.currentTarget);
            data.set("flow", flow);
            try {
              await signIn("password", data);
            } catch {
              setError(
                flow === "signIn"
                  ? "Could not sign in. Check your email and password."
                  : "Could not create the account. The email may already be in use.",
              );
            } finally {
              setSubmitting(false);
            }
          }}
          style={{
            width: "100%",
            maxWidth: "380px",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
            background: "var(--surface-card)",
            border: "var(--border-thin) solid var(--border-fact)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-8)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-serif-display)",
              fontSize: "var(--text-display-sm)",
              margin: 0,
            }}
          >
            KMUN Grant Finder
          </h1>
          <p
            style={{
              margin: 0,
              color: "var(--text-muted)",
              fontSize: "var(--text-sm)",
            }}
          >
            {flow === "signIn" ? "Sign in to continue." : "Create your account."}
          </p>

          <Field id="email" label="Email" type="email" />
          {flow === "signUp" && (
            <Field id="username" label="Username" type="text" />
          )}
          <Field id="password" label="Password" type="password" />

          <button
            type="submit"
            disabled={submitting}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-md)",
              fontWeight: "var(--weight-semibold)",
              color: "#fff",
              background: "var(--accent-fact)",
              border: "var(--border-thin) solid var(--accent-fact)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-3)",
              cursor: submitting ? "default" : "pointer",
            }}
          >
            {flow === "signIn" ? "Sign in" : "Create account"}
          </button>

          {error && (
            <p
              role="alert"
              style={{
                margin: 0,
                color: "var(--text-warning)",
                fontSize: "var(--text-sm)",
              }}
            >
              ▲ {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              setFlow(flow === "signIn" ? "signUp" : "signIn");
              setError(null);
            }}
            style={{
              background: "none",
              border: 0,
              color: "var(--text-link)",
              fontSize: "var(--text-sm)",
              cursor: "pointer",
              padding: 0,
              textAlign: "left",
            }}
          >
            {flow === "signIn"
              ? "Need an account? Create one"
              : "Already have an account? Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
