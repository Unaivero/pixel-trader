"""
data_stream.py
Simulates two real-time price feeds for stocks using asyncio (and mock websockets).
"""

import asyncio
import random
from typing import Dict, AsyncGenerator, List

STOCKS = ["AAPL", "TSLA"]

async def simulate_price_feed(source: str, update_interval: float = 1.0) -> AsyncGenerator[Dict[str, float], None]:
    """
    Simulate a price feed for multiple stocks from a given source.
    Yields a dict: {ticker: price, ...}
    """
    prices = {ticker: random.uniform(100, 300) for ticker in STOCKS}
    while True:
        # Simulate price movement
        for ticker in STOCKS:
            change = random.uniform(-1, 1)
            prices[ticker] = max(1, prices[ticker] + change)
        await asyncio.sleep(update_interval + random.uniform(0, 1))
        yield {"source": source, "prices": prices.copy()}

async def merged_price_stream(update_interval: float = 1.0):
    """
    Async generator yielding latest prices from both sources.
    """
    feed1 = simulate_price_feed("BrokerA", update_interval)
    feed2 = simulate_price_feed("BrokerB", update_interval)
    while True:
        prices1, prices2 = await asyncio.gather(feed1.__anext__(), feed2.__anext__())
        yield [prices1, prices2]
