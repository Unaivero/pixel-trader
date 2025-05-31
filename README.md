# Pixel Trader

A retro-inspired, pixel-art stock chart viewer built with Flask (backend) and D3.js (frontend).

## ⚡ Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start Backend
```bash
cd backend
python app.py
```
Backend runs at http://127.0.0.1:5000

### 3. Open Frontend
Open `frontend/index.html` in your browser, or serve with:
```bash
cd frontend
python -m http.server 8000
```
Then visit http://localhost:8000

### 4. Test Everything
```bash
python test_phase1.py
```

## 🏗️ Project Structure
```
pixel-trader/
├── backend/
│   ├── app.py              # Flask API server
│   └── requirements.txt    # Backend-specific deps
├── frontend/
│   ├── index.html          # Main HTML page
│   ├── style.css           # Neon/pixel styles
│   ├── ui.js              # UI logic and controls
│   ├── api.js             # API communication
│   └── chart.js           # D3 chart rendering
├── assets/
│   ├── neon-grid-bg.png    # Background image
│   └── font/PressStart2P-Regular.ttf  # Pixel font
├── archived_components/    # Previously removed features
│   ├── interface.py        # Streamlit dashboard
│   ├── simulator.py        # Arbitrage simulator
│   ├── arbitrage_logic.py  # Trading logic
│   └── data_stream.py      # Price simulation
├── logs/                   # Application logs
├── config.py              # Configuration management
├── utils.py               # Utility functions
├── requirements.txt       # Main project dependencies
└── test_phase1.py        # Test script
```

## 🚀 Features
- **Real-time stock data** via yfinance API
- **Interactive candlestick charts** with D3.js and volume indicators
- **Moving averages** (SMA/EMA) with customizable periods
- **Watchlist management** with persistent storage
- **Company information and news** integration
- **Performance metrics** and statistical analysis
- **Data export** to CSV format
- **Keyboard shortcuts** for power users
- **Retro cyberpunk UI** with animated neon background
- **Mobile responsive design** with touch support
- **Theme switching** and accessibility features
- **Error handling** with user-friendly notifications

## 🛠️ API Endpoints
- `GET /api/health` - Health check and version info
- `GET /api/candles/{symbol}?period=1mo&interval=1d` - Stock price data
- `GET /api/company/{symbol}` - Company information
- `GET /api/news/{symbol}` - Recent company news

## ⌨️ Keyboard Shortcuts
- `R` - Refresh chart data
- `T` - Toggle theme
- `/` - Focus symbol input
- `ESC` - Clear error messages
- `Enter` - Add symbol to watchlist (when in input)

## 🎨 Customization
- Replace assets in `assets/` folder for custom branding
- Edit `frontend/style.css` for visual customization
- Modify `config.py` for API and behavior settings
- Extend `frontend/performance.js` for additional metrics

## 📊 Data Export
Click the "📊 Export" button to download current chart data as CSV format, perfect for further analysis in Excel or other tools.

## Customization
- Replace `assets/neon-grid-bg.png` and `assets/font/PressStart2P-Regular.ttf` with your own assets for a custom look.
- Edit `frontend/style.css` for advanced styling.

## Troubleshooting
- If you see `CORS` errors, ensure the backend is running and accessible.
- If no chart appears, check the browser console for errors.

---
Enjoy your retro pixel trading dashboard!
