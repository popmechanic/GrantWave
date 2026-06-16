import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ResultCard } from "./ResultCard";

test("renders Fact tag for a federal opportunity", () => {
  render(
    <ResultCard
      item={{ id: "1", kind: "opportunity", lane: "federal", tier: "fact", title: "NEA Grants for Arts Projects", agency: "NEA", aln: "45.024", status: "posted", closesSoon: false, relevant: true }}
    />,
  );
  expect(screen.getByText(/Fact/)).toBeInTheDocument();
  expect(screen.getByText("NEA Grants for Arts Projects")).toBeInTheDocument();
  expect(screen.getByText(/ALN 45\.024/)).toBeInTheDocument();
});

test("renders Worth-a-look tag, evidence, and Closes-soon marker", () => {
  render(
    <ResultCard
      item={{ id: "2", kind: "funder", lane: "funder-intel", tier: "assumption", title: "NEH", evidence: "funded a public-radio newsroom", closesSoon: false, relevant: true }}
    />,
  );
  expect(screen.getByText(/Worth a look/)).toBeInTheDocument();
  expect(screen.getByText(/public-radio newsroom/)).toBeInTheDocument();
});

test("shows the Closes-soon marker when closesSoon is set", () => {
  render(
    <ResultCard
      item={{ id: "3", kind: "opportunity", lane: "federal", tier: "fact", title: "Media Projects", status: "posted", closeDate: "06/25/2026", closesSoon: true, relevant: true }}
    />,
  );
  expect(screen.getByText(/Closes soon/)).toBeInTheDocument();
});
