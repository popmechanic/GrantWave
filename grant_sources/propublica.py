"""ProPublica Nonprofit Explorer API — IRS 990 / 990-PF data.

Base:   https://projects.propublica.org/nonprofits/api/v2
Auth:   NONE (no key; usage implies agreement to ProPublica's Data Terms of Use)
Docs:   https://projects.propublica.org/nonprofits/api

This is the FREE cornerstone of the repeatable geography+NTEE method for
discovering regional/local funders:

  1. Search nonprofits by state[id] + ntee[id] (NTEE major category) + c_code[id].
  2. Identify which results are PRIVATE FOUNDATIONS (they file Form 990-PF).
  3. (Next layer, not in this PoC) read each foundation's 990-PF grant list to
     see whether it actually funds arts / media / radio.

Important NTEE nuance the agent must get right:
  - Grantmaking FOUNDATIONS are classified by their own activity (NTEE "T",
    Philanthropy & Grantmaking), which rolls up to ProPublica major category 7
    ("Public, Societal Benefit") -- NOT category 1.
  - ARTS / MEDIA / RADIO orgs (and grantees) are NTEE "A" -> major category 1
    ("Arts, Culture & Humanities").
So to find *funders*, search category 7; to find peers/grantees, search
category 1. (ProPublica's numeric ntee[id] 1-10 = NCCS major categories;
confirmed empirically against the live API.)
"""
from __future__ import annotations

from typing import List, Optional

from .http import DEFAULT_TIMEOUT, session
from .models import FoundationProspect

BASE = "https://projects.propublica.org/nonprofits/api/v2"

# ProPublica ntee[id] numeric major categories (NCCS 10-group scheme):
NTEE_MAJOR = {
    1: "Arts, Culture & Humanities",        # A
    2: "Education",                          # B
    3: "Environment and Animals",            # C, D
    4: "Health",                             # E-H
    5: "Human Services",                     # I-P
    6: "International, Foreign Affairs",     # Q
    7: "Public, Societal Benefit",           # R-W (incl. T = foundations)
    8: "Religion Related",                   # X
    9: "Mutual/Membership Benefit",          # Y
    10: "Unknown, Unclassified",             # Z
}

NTEE_ARTS_MEDIA = 1        # find peer/grantee arts & media orgs
NTEE_FOUNDATIONS = 7       # find grantmaking foundations (T-codes live here)
CCODE_501C3 = 3            # 501(c)(3)

# Form type codes returned per filing.
_FORMTYPE = {0: "990", 1: "990-EZ", 2: "990-PF"}


def _search(state: str, ntee_id: int, query: str, c_code: Optional[int]) -> list:
    params = {"state[id]": state, "ntee[id]": ntee_id, "q": query}
    if c_code is not None:
        params["c_code[id]"] = c_code
    resp = session().get(f"{BASE}/search.json", params=params, timeout=DEFAULT_TIMEOUT)
    resp.raise_for_status()
    return resp.json().get("organizations", []) or []


def _detect_private_foundation(ein: str) -> tuple[Optional[bool], Optional[str]]:
    """Fetch an org's detail and inspect its most recent filing form type.

    Returns (is_private_foundation, latest_form_type_label). A 990-PF filer is a
    private foundation. Network/lookup failures degrade to (None, None) so a
    single bad EIN never sinks the run.
    """
    try:
        resp = session().get(f"{BASE}/organizations/{ein}.json", timeout=DEFAULT_TIMEOUT)
        resp.raise_for_status()
        filings = resp.json().get("filings_with_data", []) or []
        if not filings:
            return None, None
        latest = filings[0]  # API returns newest first
        ft = latest.get("formtype")
        label = _FORMTYPE.get(ft, str(ft))
        return (ft == 2), label
    except Exception:
        return None, None


def find_foundations(
    state: str,
    *,
    query: str = "foundation",
    enrich: int = 8,
    limit: int = 25,
) -> List[FoundationProspect]:
    """Discover in-state grantmaking foundations (the funders).

    `enrich` controls how many of the top hits get a follow-up 990-PF check
    (each is one extra HTTP call), flagging confirmed private foundations.
    """
    orgs = _search(state, NTEE_FOUNDATIONS, query, CCODE_501C3)[:limit]
    return _to_prospects(orgs, enrich)


def find_arts_media_orgs(
    state: str,
    *,
    query: str = "radio",
    enrich: int = 0,
    limit: int = 25,
) -> List[FoundationProspect]:
    """Discover in-state arts/media orgs (peers, grantees, the matching lane)."""
    orgs = _search(state, NTEE_ARTS_MEDIA, query, CCODE_501C3)[:limit]
    return _to_prospects(orgs, enrich)


def _to_prospects(orgs: list, enrich: int) -> List[FoundationProspect]:
    out: List[FoundationProspect] = []
    for i, o in enumerate(orgs):
        ein = str(o.get("ein", ""))
        is_pf, form_label = (None, None)
        if i < enrich and ein:
            is_pf, form_label = _detect_private_foundation(ein)
        out.append(
            FoundationProspect(
                source="propublica",
                ein=ein,
                name=(o.get("name") or "").strip(),
                city=o.get("city") or "",
                state=o.get("state") or "",
                ntee_code=o.get("ntee_code") or o.get("raw_ntee_code"),
                subsection=str(o.get("subseccd")) if o.get("subseccd") is not None else None,
                is_private_foundation=is_pf,
                latest_form_type=form_label,
                url=f"https://projects.propublica.org/nonprofits/organizations/{ein}" if ein else "",
            )
        )
    return out
