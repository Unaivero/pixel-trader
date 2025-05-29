# Pixel Trader

A retro-inspired, pixel-art stock chart viewer built with Flask (backend) and D3.js (frontend).

## Project Structure
```
pixel-trader/
├── backend/
│   ├── app.py              # Flask API for candlestick data
│   └── requirements.txt    # Backend dependencies
├── frontend/
│   ├── index.html          # Main HTML page
│   ├── style.css           # Neon/pixel styles
│   └── app.js              # D3 chart logic, UI logic
├── assets/
│   ├── neon-grid-bg.png    # Neon grid background (optional)
│   └── font/PressStart2P-Regular.ttf  # Pixel font
```

## Setup & Run

### 1. Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```
- The backend runs at http://127.0.0.1:5000 by default.

### 2. Frontend
You can:
- Open `frontend/index.html` directly in your browser (may hit CORS issues if backend is not running).
- **Or** serve the frontend directory with a static server:

```bash
cd frontend
python -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000) in your browser.

### 3. Usage
- Enter a stock symbol (e.g., `AAPL`, `MSFT`) and click "Load".
- Candlestick chart will appear below.

## Customization
- Replace `assets/neon-grid-bg.png` and `assets/font/PressStart2P-Regular.ttf` with your own assets for a custom look.
- Edit `frontend/style.css` for advanced styling.

## Troubleshooting
- If you see `CORS` errors, ensure the backend is running and accessible.
- If no chart appears, check the browser console for errors.

---
Enjoy your retro pixel trading dashboard!
