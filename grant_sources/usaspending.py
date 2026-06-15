"""USAspending.gov API — historical FEDERAL award data.

Endpoint:  POST https://api.usaspending.gov/api/v2/search/spending_by_award/
Auth:      NONE (no API key, no registration; ~1000 calls / 300s / IP)
Docs:      https://api.usaspending.gov/docs/endpoints

Strategic use for a grant-discovery agent: you don't apply for grants here, you
*mine* them. By searching past GRANT awards that mention "public radio" (or by
recipient location), the agent learns which agencies and programs actually fund
organizations like this station — then targets those programs on Grants.gov.
"""
from __future__ import annotations

from typing import List, Optional

from .http import DEFAULT_TIMEOUT, session
from .models import PastAward

SEARCH_URL = "https://api.usaspending.gov/api/v2/search/spending_by_award/"

# Prime award type codes that are grants / cooperative agreements:
#   02 Block grant, 03 Formula grant, 04 Project grant, 05 Cooperative agreement
GRANT_AWARD_TYPE_CODES = ["02", "03", "04", "05"]

# Fields must match USAspending's allowed column names exactly.
_FIELDS = [
    "Award ID",
    "Recipient Name",
    "Awarding Agency",
    "Awarding Sub Agency",
    "Award Amount",
    "Start Date",
    "Award Type",
]


def find_past_grant_winners(
    keywords: List[str],
    *,
    recipient_state: Optional[str] = None,
    limit: int = 25,
) -> List[PastAward]:
    """Find past federal GRANT awards matching keywords (optionally a state).

    Returns awards sorted by amount (desc) so the biggest, most telling funders
    surface first.
    """
    filters = {
        "award_type_codes": GRANT_AWARD_TYPE_CODES,
        "keywords": keywords,
    }
    if recipient_state:
        filters["recipient_locations"] = [{"country": "USA", "state": recipient_state}]

    body = {
        "filters": filters,
        "fields": _FIELDS,
        "page": 1,
        "limit": limit,
        "sort": "Award Amount",
        "order": "desc",
    }

    resp = session().post(SEARCH_URL, json=body, timeout=DEFAULT_TIMEOUT)
    resp.raise_for_status()
    payload = resp.json()

    results: List[PastAward] = []
    for r in payload.get("results", []) or []:
        internal = r.get("generated_internal_id") or ""
        amount = r.get("Award Amount")
        results.append(
            PastAward(
                source="usaspending.gov",
                award_id=str(r.get("Award ID", "")),
                recipient=r.get("Recipient Name") or "",
                amount=float(amount) if isinstance(amount, (int, float)) else None,
                awarding_agency=r.get("Awarding Agency") or "",
                awarding_sub_agency=r.get("Awarding Sub Agency") or "",
                award_type=r.get("Award Type") or "",
                start_date=r.get("Start Date") or None,
                url=f"https://www.usaspending.gov/award/{internal}" if internal else "",
            )
        )
    return results
