import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

// Stub Convex's useQuery so Discover renders sample results without a backend.
vi.mock("convex/react", () => ({
  useQuery: () => [
    { id: "1", kind: "opportunity", lane: "federal", tier: "fact", title: "NEA Grants for Arts Projects", agency: "NEA", aln: "45.024", status: "posted", closesSoon: false },
  ],
}));

import { Discover } from "./Discover";

test("Discover renders the filter lanes and a result card", () => {
  render(<Discover />);
  expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Federal" })).toBeInTheDocument();
  expect(screen.getByText("NEA Grants for Arts Projects")).toBeInTheDocument();
  expect(screen.getByText(/1 prospects/)).toBeInTheDocument();
});
