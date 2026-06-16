import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

// Nightly grant-data refresh at 08:00 UTC. No one runs anything by hand.
const crons = cronJobs();
crons.cron("nightly refresh", "0 8 * * *", internal.refresh.run, {});

export default crons;
