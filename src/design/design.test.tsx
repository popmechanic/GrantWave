import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { StatCard } from "./components/stat-cards/StatCard";

test("StatCard shows the fact tag and value", () => {
  render(<StatCard variant="fact" value="142" label="Prospects" />);
  expect(screen.getByText(/Fact/)).toBeInTheDocument();
  expect(screen.getByText("142")).toBeInTheDocument();
});
