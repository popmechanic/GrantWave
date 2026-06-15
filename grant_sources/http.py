"""Shared HTTP helpers: one pooled session, sane timeouts, polite User-Agent."""
from __future__ import annotations

import requests

# Public APIs appreciate an identifying UA; none of these three require a key.
USER_AGENT = "community-radio-grant-agent/0.1 (proof-of-concept)"

DEFAULT_TIMEOUT = 30  # seconds

_session: requests.Session | None = None


def session() -> requests.Session:
    """Return a process-wide pooled session."""
    global _session
    if _session is None:
        s = requests.Session()
        s.headers.update({"User-Agent": USER_AGENT, "Accept": "application/json"})
        _session = s
    return _session
