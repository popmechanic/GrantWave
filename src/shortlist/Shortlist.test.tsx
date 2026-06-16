import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

vi.mock("convex/react", () => ({
  useQuery: () => [
    {
      id: "s1",
      refId: "o1",
      itemType: "opportunity",
      title: "NEA Grants for Arts Projects",
      subtitle: "NEA · ALN 45.024",
      tier: "fact",
      lane: "federal",
      savedBy: "marcus",
      savedAt: 1,
      comments: [{ id: "c1", body: "Worth applying.", author: "dana", createdAt: 1 }],
    },
  ],
  useMutation: () => async () => {},
}));

import { Shortlist } from "./Shortlist";

test("Shortlist shows a saved prospect with an attributed comment", () => {
  render(<Shortlist />);
  expect(screen.getByText("NEA Grants for Arts Projects")).toBeInTheDocument();
  expect(screen.getByText(/Saved by marcus/)).toBeInTheDocument();
  expect(screen.getByText(/Worth applying/)).toBeInTheDocument();
  expect(screen.getByText("dana")).toBeInTheDocument(); // comment author attributed
});
