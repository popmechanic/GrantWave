"""Shared data models for grant-discovery sources.

Every source module returns lists of these dataclasses so the driver (and any
agent consuming this package) gets a uniform, JSON-serializable shape regardless
of which upstream API the data came from.
"""
from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List, Optional


@dataclass
class Opportunity:
    """A live or forecasted federal funding opportunity (Grants.gov)."""

    source: str
    id: str
    number: str
    title: str
    agency: str
    status: str
    open_date: Optional[str]
    close_date: Optional[str]
    alns: List[str] = field(default_factory=list)
    url: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class PastAward:
    """A historical federal grant award (USAspending) — used to infer which
    agencies/programs actually fund organizations like this station."""

    source: str
    award_id: str
    recipient: str
    amount: Optional[float]
    awarding_agency: str
    awarding_sub_agency: str
    award_type: str
    start_date: Optional[str]
    url: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class FoundationProspect:
    """A nonprofit/foundation discovered via IRS 990 data (ProPublica)."""

    source: str
    ein: str
    name: str
    city: str
    state: str
    ntee_code: Optional[str]
    subsection: Optional[str]
    is_private_foundation: Optional[bool]  # True if it files Form 990-PF
    latest_form_type: Optional[str]
    url: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
