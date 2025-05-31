// api.js - Handles all API requests for Pixel Trader

const API_BASE = "http://127.0.0.1:5002/api";

export async function fetchCandles(symbol = 'AAPL', period = '1mo', interval = '1d') {
  const url = `${API_BASE}/candles/${symbol}?period=${period}&interval=${interval}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    const error = await resp.json();
    throw new Error(error.error || 'Failed to fetch candlestick data');
  }
  const data = await resp.json();
  if (!data || !Array.isArray(data)) throw new Error('No candle data');
  return data;
}

export async function fetchCompanyInfo(symbol) {
  const url = `${API_BASE}/company/${symbol}`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Failed to fetch company info');
    return await resp.json();
  } catch {
    return null;
  }
}

export async function fetchCompanyNews(symbol) {
  const url = `${API_BASE}/news/${symbol}`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Failed to fetch news');
    const data = await resp.json();
    if (!data || !Array.isArray(data)) throw new Error('No news');
    return data;
  } catch {
    return [];
  }
}
