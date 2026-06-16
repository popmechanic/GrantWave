import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

vi.mock("convex/react", () => ({
  useQuery: () => [
    {
      id: "a1",
      shortlistItemId: "s1",
      title: "NEA Grants for Arts Projects",
      subtitle: "NEA · ALN 45.024",
      tier: "fact",
      status: "researching",
      amountRequested: undefined,
      deadline: undefined,
      assignee: null,
      historyCount: 0,
    },
  ],
  useMutation: () => async () => {},
}));

import { Applications } from "./Applications";

test("Applications renders the pipeline with a card and a status control", () => {
  render(<Applications />);
  expect(screen.getByText("NEA Grants for Arts Projects")).toBeInTheDocument();
  expect(screen.getByText(/1 in the pipeline/)).toBeInTheDocument();
  expect(screen.getByRole("combobox")).toBeInTheDocument(); // the status selector
  expect(screen.getByRole("button", { name: /assign to me/i })).toBeInTheDocument();
});
