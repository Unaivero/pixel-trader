"""
interface.py
Streamlit dashboard for real-time monitoring and controls.
"""

import streamlit as st
import json
import os
import time
from simulator import Simulator, OPPORTUNITY_LOG

st.set_page_config(page_title="Stock Arbitrage Bot", layout="wide")

if "sim" not in st.session_state:
    st.session_state.sim = Simulator()
    st.session_state.sim_task = None
    st.session_state.paused = False

st.title("🧠 Stock Arbitrage Trading Bot (Simulation)")

col1, col2, col3 = st.columns(3)

with col1:
    if st.button("▶️ Start/Resume"):
        st.session_state.paused = False
        if st.session_state.sim_task is None:
            import threading
            def run_sim():
                import asyncio
                asyncio.run(st.session_state.sim.run())
            t = threading.Thread(target=run_sim, daemon=True)
            st.session_state.sim_task = t
            t.start()

with col2:
    if st.button("⏸️ Pause"):
        st.session_state.paused = True
        st.session_state.sim.stop()
        st.session_state.sim_task = None

with col3:
    if st.button("🔄 Restart"):
        st.session_state.sim.reset()
        st.session_state.sim = Simulator()
        st.session_state.sim_task = None
        st.session_state.paused = False
        st.experimental_rerun()

st.markdown("---")

# Live prices
st.subheader("📈 Live Prices")
latest = st.session_state.sim.latest_prices
if latest:
    st.json(latest)
else:
    st.write("Waiting for prices...")

# Opportunities
st.subheader("💡 Arbitrage Opportunities")
if os.path.exists(OPPORTUNITY_LOG):
    with open(OPPORTUNITY_LOG) as f:
        data = json.load(f)
    st.write(f"Total: {len(data)}")
    st.dataframe(data)
    # Simple historical graph (opportunities per hour)
    import pandas as pd
    df = pd.DataFrame(data)
    if not df.empty:
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df['hour'] = df['timestamp'].dt.floor('H')
        chart = df.groupby('hour').size()
        st.line_chart(chart)
else:
    st.write("No opportunities detected yet.")

# Export
if st.button("⬇️ Export Opportunities as JSON"):
    if os.path.exists(OPPORTUNITY_LOG):
        with open(OPPORTUNITY_LOG) as f:
            st.download_button("Download JSON", f.read(), file_name="opportunities.json")
    else:
        st.warning("No data to export.")
