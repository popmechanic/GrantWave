import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

// Stub Convex hooks so Discover renders sample results without a backend.
// listResults is called with an args object; savedRefs is called with none.
vi.mock("convex/react", () => ({
  useQuery: (_fn: unknown, args?: unknown) =>
    args !== undefined
      ? [
          { id: "1", kind: "opportunity", lane: "federal", tier: "fact", title: "NEA Grants for Arts Projects", agency: "NEA", aln: "45.024", status: "posted", closesSoon: false, relevant: true },
        ]
      : [],
  useMutation: () => async () => {},
}));

import { Discover } from "./Discover";

test("Discover renders the filter lanes and a result card", () => {
  render(<Discover />);
  expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Federal" })).toBeInTheDocument();
  expect(screen.getByText("NEA Grants for Arts Projects")).toBeInTheDocument();
  expect(screen.getByText(/1 prospects/)).toBeInTheDocument();
});
