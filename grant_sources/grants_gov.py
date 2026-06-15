"""Grants.gov Search2 API — live/forecasted FEDERAL opportunities.

Endpoint:  POST https://api.grants.gov/v1/api/search2
Auth:      NONE (no API key, no registration)
Docs:      https://www.grants.gov/api/api-guide  ->  search2

This is the free, no-credential backbone for discovering open federal grants.
Verified by deep-research (3-0): authentication is not required for search2.
"""
from __future__ import annotations

from typing import List, Optional

from .http import DEFAULT_TIMEOUT, session
from .models import Opportunity

SEARCH_URL = "https://api.grants.gov/v1/api/search2"

# Grants.gov applicant-eligibility code for our station's profile.
# "12" = Nonprofits having a 501(c)(3) status with the IRS (other than IHEs).
ELIGIBILITY_501C3 = "12"

# Show forecasted + currently-posted opportunities (skip closed/archived).
DEFAULT_OPP_STATUSES = "forecasted|posted"

# Assistance Listing Numbers (ALN, legacy "CFDA") relevant to a community radio
# station, all VERIFIED accepted by the live `cfda` filter. The "45" prefix =
# National Foundation on the Arts and the Humanities (NEA 45.0xx, NEH 45.1xx,
# IMLS 45.3xx). Programs on annual cycles often show 0 OPEN opportunities
# between windows -- they still belong here so the agent catches them on reopen.
# NOTE: the Search2 `cfda` filter takes ONE value per call, so search_by_alns()
# loops one ALN at a time.
#
# NOT INCLUDED (defunct / dead channels, do NOT surface as active):
#   11.550  NTIA Public Telecommunications Facilities Program -- terminated FY2011
#   84.295  Dept. of Education "Ready to Learn"               -- terminated ~2025
#   CPB Community Service Grants -- CPB has NO standing ALN (it was a private
#       corporation, not a federal agency) AND voted to dissolve Jan 5, 2026.
# Candidate ALNs to confirm in SAM.gov before adding: 45.025 (NEA Partnership),
#   45.313 (IMLS Laura Bush), NEH Federal/State Partnership listing.
KNOWN_RELEVANT_ALNS = {
    "45.024": "NEA - Promotion of the Arts / Grants to Organizations",
    "45.036": "NEH - Promotion of the Humanities / Media Projects",
    "45.149": "NEH - Division of Preservation and Access",
    "45.164": "NEH - Public Programs",
    "45.169": "NEH - Office of Digital Humanities",
    "45.301": "IMLS - National Leadership Grants for Museums",
    "45.310": "IMLS - Grants to States (LSTA)",
    "45.312": "IMLS - National Leadership Grants for Libraries",
}


def search(
    keyword: str,
    *,
    eligibility: Optional[str] = ELIGIBILITY_501C3,
    aln: str = "",
    funding_categories: str = "",
    opp_statuses: str = DEFAULT_OPP_STATUSES,
    rows: int = 25,
) -> List[Opportunity]:
    """Search open federal opportunities for a single keyword.

    Pass eligibility=None to drop the 501(c)(3) filter (some opportunities are
    coded "Unrestricted" / "Others" and can be missed by a strict filter).
    `aln` is a SINGLE Assistance Listing Number (e.g. NEA's "45.024") for
    high-precision, program-specific matching -- sent as the API's `cfda` field.
    (The API's cfda filter accepts one value per call; use search_by_alns() for
    several.)
    """
    body = {
        "keyword": keyword,
        "oppStatuses": opp_statuses,
        "rows": rows,
        "cfda": aln,  # API field is the legacy "cfda" name; `aln` is one value
        "fundingCategories": funding_categories,
    }
    if eligibility:
        body["eligibilities"] = eligibility

    resp = session().post(SEARCH_URL, json=body, timeout=DEFAULT_TIMEOUT)
    resp.raise_for_status()
    payload = resp.json()

    if payload.get("errorcode") not in (0, None):
        raise RuntimeError(f"grants.gov error: {payload.get('msg')!r}")

    data = payload.get("data", {}) or {}
    hits = data.get("oppHits", []) or []

    results: List[Opportunity] = []
    for h in hits:
        opp_id = str(h.get("id", ""))
        results.append(
            Opportunity(
                source="grants.gov",
                id=opp_id,
                number=h.get("number", ""),
                title=(h.get("title") or "").strip(),
                agency=h.get("agency") or h.get("agencyCode") or "",
                status=h.get("oppStatus", ""),
                open_date=h.get("openDate") or None,
                close_date=h.get("closeDate") or None,
                alns=[str(a) for a in (h.get("alnist") or h.get("cfdaList") or [])],
                url=f"https://www.grants.gov/search-results-detail/{opp_id}" if opp_id else "",
            )
        )
    return results


def search_many(
    keywords: List[str],
    *,
    eligibility: Optional[str] = ELIGIBILITY_501C3,
    rows_per_keyword: int = 25,
) -> List[Opportunity]:
    """Run several keyword searches and de-duplicate by opportunity id."""
    seen = {}
    for kw in keywords:
        for opp in search(kw, eligibility=eligibility, rows=rows_per_keyword):
            seen.setdefault(opp.id, opp)
    return list(seen.values())


def search_by_alns(
    alns: Optional[List[str]] = None,
    *,
    eligibility: Optional[str] = None,
    rows_per_aln: int = 25,
) -> List[Opportunity]:
    """High-precision search: one call per ALN, de-duplicated by opportunity id.

    Defaults to the verified KNOWN_RELEVANT_ALNS. Eligibility is left off by
    default because ALN targeting is already precise and some relevant programs
    use broad/unrestricted eligibility codes.
    """
    if alns is None:
        alns = list(KNOWN_RELEVANT_ALNS)
    seen = {}
    for aln in alns:
        for opp in search("", aln=aln, eligibility=eligibility, rows=rows_per_aln):
            seen.setdefault(opp.id, opp)
    return list(seen.values())
