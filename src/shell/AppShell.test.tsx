import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Nav } from "./Nav";

test("nav lists the four destinations with Discover active", () => {
  render(<Nav active="discover" onSelect={() => {}} />);
  for (const tab of ["Discover", "Shortlist", "Applications", "Export"]) {
    expect(screen.getByRole("button", { name: tab })).toBeInTheDocument();
  }
  expect(screen.getByRole("button", { name: "Discover" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});
