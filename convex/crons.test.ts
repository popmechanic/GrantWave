import { expect, test } from "vitest";
import crons from "./crons";

test("registers exactly one nightly refresh cron", () => {
  // cronJobs() stores its jobs in an internal record; assert one is registered.
  const jobs = (crons as unknown as { crons: Record<string, unknown> }).crons;
  expect(Object.keys(jobs)).toHaveLength(1);
  expect(JSON.stringify(jobs)).toMatch(/refresh/);
});
