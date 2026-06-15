# Community Radio Grant-Discovery — Free-API Proof of Concept

A small, dependency-light Python package that proves out the **automatable core**
of a grant-discovery agent for a CPB-qualified, 501(c)(3) community radio station —
using only **free, no-API-key** public data sources.

It validates two things end-to-end against live APIs:

- **(A) Open federal opportunities** filtered to 501(c)(3) nonprofits — `Grants.gov Search2`
- **(B) In-state foundations & arts/media orgs** via IRS 990 data — `ProPublica Nonprofit Explorer`

…plus a bonus lane:

- **(+) Past federal grant winners**, to infer which agencies fund stations — `USAspending.gov`

## ⚠️ Funding-landscape note (2025–2026) — read this first

The public-media funding world shifted hard while this was being built, which
changes how the agent should weight channels:

- **CPB is dissolving.** Congress rescinded **$1.1B** of CPB funding (July 2025);
  CPB's board **voted to dissolve on Jan 5, 2026**. CPB Community Service Grants
  and "CPB-qualified" status should be treated as a **dead federal funding
  channel** going forward. (It still matters for *one* thing: Public Media Bridge
  Fund eligibility keys off CSG-qualification as of Sept 30, 2025.)
- **NEA and NEH were funded for FY2026** ($207M each), and the statutory **40% of
  NEA money to state/regional arts agencies was preserved** — so **NEA `45.024`,
  state arts agencies, and the 6 regional arts orgs are now the strongest
  live federal-adjacent channel.** Reweight toward them, foundations, and direct
  philanthropy.
- **State humanities councils are funded-on-paper but in legal limbo** (operating
  grants were terminated April 2025; a May 2026 ruling called that unlawful but
  didn't auto-restore funds). Viable to approach, but flag the instability.
- **Defunct — never surface as active:** NTIA PTFP (`11.550`, terminated FY2011),
  Dept. of Ed "Ready to Learn" (`84.295`, ~2025).

## Quick start

```bash
pip install -r requirements.txt          # just `requests`
python3 poc.py --state OR                 # human-readable report
python3 poc.py --state CA --json          # machine-readable JSON (for the agent)
python3 poc.py --state WA --keywords "public radio" "community media" --limit 30
```

No keys, no accounts. Network access required. `--state` defaults to `OR` as a
**demo placeholder** — set it to your station's actual state.

## What each source does

| Source | Auth | Endpoint | Role |
|---|---|---|---|
| **Grants.gov Search2** | none | `POST /v1/api/search2` | Live + forecasted federal opportunities, filtered to 501(c)(3) (`eligibilities=12`) |
| **USAspending.gov** | none | `POST /api/v2/search/spending_by_award/` | Past grant awards → infer funder agencies/programs |
| **ProPublica Nonprofit Explorer** | none | `GET /nonprofits/api/v2/search.json` | Foundations & nonprofits by `state[id]` + `ntee[id]` + `c_code[id]` |

## The repeatable regional-funder method (the important part)

ProPublica drives a method an agent can run for **any** station's location:

1. **Find in-state grantmaking foundations.** Search `ntee[id]=7`
   ("Public, Societal Benefit", which is where NTEE **T** grantmaking foundations
   live) + `c_code[id]=3` + `q=foundation`.
2. **Confirm private foundations.** Enrich the top hits via
   `organizations/{ein}.json` and flag those whose latest filing is **Form 990-PF**
   (`formtype=2`). Community foundations (NTEE **T30**) often file 990/990-EZ and
   are grantmakers too — they're surfaced but not flagged "private foundation."
3. **Find the matching lane.** Separately search `ntee[id]=1`
   ("Arts, Culture & Humanities") for peer/grantee orgs — community radio carries
   NTEE **A34 (Radio)**, confirmed live against the API.
4. **(Next layer, not in this PoC)** read each foundation's 990-PF Part XV grant
   list to see whether it actually funds arts/media/radio. That requires parsing
   the filing PDF/XML or a paid API (Candid / Cause IQ) — see the research report.

### ProPublica `ntee[id]` → NCCS major category map

```
1 Arts, Culture & Humanities   (A)   ← arts/media/RADIO orgs
2 Education                     (B)
3 Environment and Animals       (C,D)
4 Health                        (E-H)
5 Human Services                (I-P)
6 International, Foreign Affairs (Q)
7 Public, Societal Benefit      (R-W) ← grantmaking FOUNDATIONS (T) live here
8 Religion Related              (X)
9 Mutual/Membership Benefit     (Y)
10 Unknown, Unclassified        (Z)
```

## Known limitations (and why they motivate the rest of the project)

- **Keyword search on Grants.gov is noisy.** Generic terms pull unrelated grants
  (family planning, CDC, etc.). The fix — **ALN (Assistance Listing Number)
  filtering** — is implemented as a separate high-precision lane
  (`grants_gov.search_by_alns`, API field `cfda`, one value per call). The
  verified starter list is NEA `45.024` and NEH Media Projects `45.036` (both
  return zero-noise results); it's being expanded with NEH/IMLS/NTIA/CPB program
  ALNs by research task B. The keyword lane still runs and ranks clearly-relevant
  hits first.
- **CPB / NFCB / Public Media Bridge Fund are not here** — they have no public API
  (browse-only). An agent must scrape/monitor those pages; see the research report.
- **990-PF grant-recipient reading is the next layer**, not yet implemented.
- **Bulk geographic mining beats per-EIN calls at scale.** For "every arts/media
  nonprofit + foundation in state X," the **NCCS / Urban Institute BMF** (geocoded,
  stored as **parquet on a public S3 bucket**, readable via the `nccsdata` R
  package with predicate pushdown) and the **IRS EO Business Master File** (per-
  state CSV downloads) are the machine-readable channels — better than looping
  ProPublica. (Note: this is the *Urban Institute* BMF bucket, not the IRS
  `irs-form-990` XML bucket, whose public access did not verify.)
- **State directories are browse-only.** NASAA (state arts agencies),
  statehumanities.org, Council on Foundations, and CFStandards have **no public
  API** — the agent must scrape or hardcode them. The upside: the 56 state arts
  agencies and 56 humanities councils are small, stable lists worth hardcoding.
- This is a **proof of concept**: no caching, retries, rate-limit backoff, or
  persistence yet. Each source call isolates its own errors so one failing API
  can't sink the run.

## Layout

```
poc.py                       CLI driver + human/JSON report
grant_sources/
  __init__.py
  http.py                    shared pooled session + timeouts
  models.py                  Opportunity / PastAward / FoundationProspect dataclasses
  grants_gov.py              Grants.gov Search2
  usaspending.py             USAspending spending_by_award
  propublica.py              ProPublica Nonprofit Explorer + 990-PF detection
```

## Verified facts behind the design

Every claim here was confirmed by adversarial deep-research (and several re-confirmed
live while building this PoC): all three APIs require **no authentication**;
`eligibilities=12` is the Grants.gov code for 501(c)(3) nonprofits; ProPublica's
`ntee[id]` is the NCCS 10-category major-group scheme (`1` = Arts, Culture &
Humanities).

NTEE media sub-codes (NCCS/Urban, verified) — the agent refines the coarse
`ntee[id]=1` pool down to these client-side:

| Code | Meaning |
|---|---|
| A30 | Media & Communications (general) |
| A31 | Film & Video |
| A32 | Television |
| A33 | Printing & Publishing |
| **A34** | **Radio** ← most relevant; covers public/community radio |
| A26 | Arts Council/Agency ← many state/local arts *funders* carry this |

(Stations with heavy music/education programming sometimes self-file under
A20/A25/A68, so don't assume A34 exclusively when mining peers/funders.)

**API gotcha confirmed by live testing:** the Grants.gov Search2 ALN filter field
is **`cfda`**, not the `aln` name some docs show — sending `aln` is silently
ignored. It also accepts **one value per call** (piped multi-values return 0), so
`search_by_alns()` loops. This is baked into `grants_gov.py`.

See the research report for sources and the full source catalog (including paid
options: Candid Grants API, Cause IQ, Charity Navigator GraphQL).
