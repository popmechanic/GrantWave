// Shared shapes returned by the lane adapters' pure normalize() functions.
// The refresh job stamps classification + lastSeenAt and upserts these.

export type NormalizedOpportunity = {
  title: string;
  agency: string;
  aln?: string;
  status: string;
  openDate?: string;
  closeDate?: string;
  url: string;
  lane: "federal";
};

export type NormalizedFunder = {
  name: string;
  ein?: string;
  city?: string;
  state?: string;
  nteeCode?: string;
  isPrivateFoundation?: boolean;
  lane: "foundation" | "funder-intel";
  evidence?: string;
};
