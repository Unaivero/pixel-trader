"""
simulator.py
Orchestrates the simulation, manages state, and saves arbitrage opportunities to JSON.
"""

import asyncio
import json
import os
from data_stream import merged_price_stream
from arbitrage_logic import detect_arbitrage
from typing import Dict, Any

OPPORTUNITY_LOG = "logs/opportunities.json"

class Simulator:
    def __init__(self, threshold: float = 0.005):
        self.threshold = threshold
        self.running = False
        self.latest_prices = {}
        self.opportunities = []

    async def run(self):
        self.running = True
        async for feeds in merged_price_stream():
            if not self.running:
                break
            source1, source2 = feeds
            prices1 = source1["prices"]
            prices2 = source2["prices"]
            self.latest_prices = {
                source1["source"]: prices1,
                source2["source"]: prices2,
            }
            opps = detect_arbitrage(prices1, prices2, self.threshold)
            if opps:
                self.opportunities.extend(opps)
                self.save_opportunities(opps)

    def save_opportunities(self, opps):
        os.makedirs("logs", exist_ok=True)
        try:
            if os.path.exists(OPPORTUNITY_LOG):
                with open(OPPORTUNITY_LOG, "r") as f:
                    data = json.load(f)
            else:
                data = []
        except Exception:
            data = []
        data.extend(opps)
        with open(OPPORTUNITY_LOG, "w") as f:
            json.dump(data, f, indent=2)

    def stop(self):
        self.running = False

    def reset(self):
        self.opportunities = []
        self.latest_prices = {}
        if os.path.exists(OPPORTUNITY_LOG):
            os.remove(OPPORTUNITY_LOG)

# For CLI/manual test
if __name__ == "__main__":
    sim = Simulator()
    try:
        asyncio.run(sim.run())
    except KeyboardInterrupt:
        sim.stop()
        print("Simulation stopped.")
