#!/usr/bin/env python3
"""Proof-of-concept: validate the free, no-key grant-discovery backbone.

Runs three live public APIs and proves the automatable core works end-to-end:
  (a) OPEN federal opportunities filtered to 501(c)(3) nonprofits   [Grants.gov]
  (b) IN-STATE arts/media foundations + peers via IRS 990 data      [ProPublica]
  (+) PAST federal grant winners, to infer who funds stations       [USAspending]

Usage:
    python3 poc.py --state OR
    python3 poc.py --state CA --keywords "public radio" "community media" --json

No API keys required. Network access required.
"""
from __future__ import annotations

import argparse
import json
import sys
from typing import Any, Dict, List

from grant_sources import grants_gov, propublica, usaspending

# A community/public radio station's natural search vocabulary.
DEFAULT_KEYWORDS = ["public radio", "community media", "broadcasting", "public telecommunications"]


def gather(state: str, keywords: List[str], limit: int) -> Dict[str, Any]:
    """Run all three sources, isolating failures so one bad API can't sink the rest."""
    out: Dict[str, Any] = {"state": state, "keywords": keywords, "sources": {}}

    def run(name: str, fn):
        try:
            out["sources"][name] = {"ok": True, "results": [r.to_dict() for r in fn()]}
        except Exception as e:  # noqa: BLE001 - surface, don't crash the demo
            out["sources"][name] = {"ok": False, "error": f"{type(e).__name__}: {e}"}

    run("grants_gov_open_opportunities",
        lambda: grants_gov.search_many(keywords, rows_per_keyword=limit))
    run("grants_gov_aln_targeted",
        lambda: grants_gov.search_by_alns(rows_per_aln=limit))
    run("usaspending_past_winners",
        lambda: usaspending.find_past_grant_winners(["public radio"], limit=limit))
    run("propublica_in_state_foundations",
        lambda: propublica.find_foundations(state, limit=limit))
    run("propublica_in_state_arts_media",
        lambda: propublica.find_arts_media_orgs(state, query="radio", limit=limit))
    return out


def _fmt_money(v) -> str:
    return f"${v:,.0f}" if isinstance(v, (int, float)) else "n/a"


# Terms that mark a federal opportunity as plausibly relevant to public radio.
_RELEVANCE_TERMS = (
    "radio", "media", "broadcast", "telecommunication", "journalism",
    "public media", "humanities", "arts", "digital equity", "broadband",
)


def _is_relevant(opp: Dict[str, Any]) -> bool:
    hay = f"{opp.get('title', '')} {opp.get('agency', '')}".lower()
    return any(t in hay for t in _RELEVANCE_TERMS)


def print_human(data: Dict[str, Any]) -> None:
    s = data["sources"]
    print("=" * 78)
    print(f"  GRANT-DISCOVERY POC  |  state={data['state']}  |  keywords={data['keywords']}")
    print("=" * 78)

    opp = s["grants_gov_open_opportunities"]
    print(f"\n[A] OPEN FEDERAL OPPORTUNITIES (501(c)(3)-eligible)  -- Grants.gov Search2")
    if opp["ok"]:
        rows = opp["results"]
        # Loose keyword search is noisy; rank clearly radio/media-relevant hits first.
        rel = [o for o in rows if _is_relevant(o)]
        other = [o for o in rows if not _is_relevant(o)]
        print(f"    {len(rows)} unique open/forecasted hits; "
              f"{len(rel)} clearly radio/media-relevant (shown first, marked *)")
        for o in (rel + other)[:12]:
            mark = "*" if _is_relevant(o) else " "
            alns = ",".join(o["alns"]) or "-"
            print(f"     {mark}- [{o['status']:>10}] {o['title'][:68]}")
            print(f"        {o['agency'][:60]}  ALN:{alns}  closes:{o['close_date'] or '-'}")
        if not rel:
            print("      (none auto-flagged relevant -- ALN filtering will fix keyword noise)")
    else:
        print(f"    ERROR: {opp['error']}")

    aln = s["grants_gov_aln_targeted"]
    print(f"\n[A] ALN-TARGETED OPPORTUNITIES (high precision)  -- Grants.gov cfda filter")
    if aln["ok"]:
        rows = aln["results"]
        known = ", ".join(grants_gov.KNOWN_RELEVANT_ALNS)
        print(f"    {len(rows)} opportunities under verified ALNs [{known}]")
        for o in rows[:10]:
            alns = ",".join(o["alns"]) or "-"
            print(f"      - [{o['status']:>10}] {o['title'][:60]}")
            print(f"        {o['agency'][:55]}  ALN:{alns}  closes:{o['close_date'] or '-'}")
    else:
        print(f"    ERROR: {aln['error']}")

    past = s["usaspending_past_winners"]
    print(f"\n[+] PAST FEDERAL GRANT WINNERS ('public radio')  -- USAspending.gov")
    if past["ok"]:
        rows = past["results"]
        print(f"    {len(rows)} past grant awards (largest first)")
        for a in rows[:10]:
            print(f"      - {_fmt_money(a['amount']):>14}  {a['recipient'][:42]:<42}")
            print(f"        via {a['awarding_agency'][:55]} / {a['awarding_sub_agency'][:40]}")
    else:
        print(f"    ERROR: {past['error']}")

    fnd = s["propublica_in_state_foundations"]
    print(f"\n[B] IN-STATE GRANTMAKING FOUNDATIONS  -- ProPublica 990 (ntee=7)")
    if fnd["ok"]:
        rows = fnd["results"]
        pf = sum(1 for r in rows if r["is_private_foundation"])
        print(f"    {len(rows)} orgs; {pf} of the top hits confirmed as 990-PF private foundations")
        for f in rows[:12]:
            tag = "990-PF FOUNDATION" if f["is_private_foundation"] else (f["latest_form_type"] or "?")
            print(f"      - {f['name'][:52]:<52} {f['city']},{f['state']}  [{tag}]")
    else:
        print(f"    ERROR: {fnd['error']}")

    arts = s["propublica_in_state_arts_media"]
    print(f"\n[B] IN-STATE ARTS/MEDIA ORGS (peers & grantees)  -- ProPublica 990 (ntee=1)")
    if arts["ok"]:
        rows = arts["results"]
        print(f"    {len(rows)} arts/culture/media orgs matching 'radio'")
        for f in rows[:10]:
            print(f"      - {f['name'][:55]:<55} {f['city']},{f['state']}  NTEE:{f['ntee_code'] or '-'}")
    else:
        print(f"    ERROR: {arts['error']}")

    print("\n" + "=" * 78)
    ok = sum(1 for v in s.values() if v["ok"])
    print(f"  {ok}/{len(s)} sources returned live data.")
    print("=" * 78)


def main(argv: List[str]) -> int:
    p = argparse.ArgumentParser(description="Free grant-discovery PoC (no API keys).")
    p.add_argument("--state", default="OR",
                   help="Two-letter state for foundation discovery "
                        "(DEMO DEFAULT 'OR' -- set to your station's state).")
    p.add_argument("--keywords", nargs="+", default=DEFAULT_KEYWORDS,
                   help="Keywords for federal opportunity search.")
    p.add_argument("--limit", type=int, default=25, help="Max rows per source.")
    p.add_argument("--json", action="store_true", help="Emit machine-readable JSON instead of a report.")
    args = p.parse_args(argv)

    data = gather(args.state, args.keywords, args.limit)
    if args.json:
        print(json.dumps(data, indent=2))
    else:
        print_human(data)
        if args.state == "OR":
            print("\nNOTE: --state defaulted to 'OR' (demo placeholder). "
                  "Re-run with your station's actual state for real prospects.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
