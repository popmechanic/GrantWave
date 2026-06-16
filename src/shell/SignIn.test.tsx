import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

// SignIn calls useAuthActions(), which needs the Convex provider at runtime.
// Mock it so the form can be rendered and inspected in isolation.
vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signIn: vi.fn(), signOut: vi.fn() }),
}));

import { SignIn } from "./SignIn";

test("SignIn renders email, password, and a submit button", () => {
  render(<SignIn />);
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /sign in|create account/i })).toBeInTheDocument();
});
