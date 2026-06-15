"""Free, no-API-key grant-discovery sources for a community radio station.

Three modules, each wrapping one verified no-credential public API:
  - grants_gov   : live/forecasted federal opportunities (Grants.gov Search2)
  - usaspending  : past federal grant winners (USAspending.gov)
  - propublica   : IRS 990/990-PF nonprofit & foundation data (Nonprofit Explorer)
"""
from . import grants_gov, propublica, usaspending  # noqa: F401

__all__ = ["grants_gov", "usaspending", "propublica"]
