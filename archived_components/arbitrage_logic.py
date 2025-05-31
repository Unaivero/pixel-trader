"""
arbitrage_logic.py
Contains logic to detect arbitrage opportunities.
"""

from typing import Dict, Any
from datetime import datetime

def detect_arbitrage(prices1: Dict[str, float], prices2: Dict[str, float], threshold: float = 0.005) -> list[dict]:
    """
    Detect arbitrage opportunities between two price sources for each stock.
    Returns a list of opportunity dicts.
    """
    opportunities = []
    for ticker in prices1:
        p1, p2 = prices1[ticker], prices2[ticker]
        diff = abs(p1 - p2)
        avg = (p1 + p2) / 2
        diff_pct = diff / avg
        if diff_pct > threshold:
            opportunity = {
                "timestamp": datetime.now().isoformat(),
                "ticker": ticker,
                "price_source_1": p1,
                "price_source_2": p2,
                "difference_pct": round(diff_pct * 100, 4),
                "estimated_profit": round(diff, 2)
            }
            opportunities.append(opportunity)
    return opportunities
