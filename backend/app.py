import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf

app = Flask(__name__)
CORS(app)

# Allowed intervals and periods for safety
ALLOWED_INTERVALS = {'1m','2m','5m','15m','30m','60m','90m','1h','1d','5d','1wk','1mo','3mo'}
ALLOWED_PERIODS = {'1d','5d','1mo','3mo','6mo','1y','2y','5y','10y','ytd','max'}

@app.route('/api/candles')
def get_candles():
    symbol = request.args.get('symbol', 'AAPL').upper()
    period = request.args.get('period', '1mo')
    interval = request.args.get('interval', '1d')

    # Validate parameters
    if interval not in ALLOWED_INTERVALS:
        return jsonify({'error': f'Invalid interval: {interval}'}), 400
    if period not in ALLOWED_PERIODS:
        return jsonify({'error': f'Invalid period: {period}'}), 400
    if not symbol.isalnum() or len(symbol) > 10:
        return jsonify({'error': f'Invalid symbol: {symbol}'}), 400

    try:
        data = yf.download(symbol, period=period, interval=interval)
        if data.empty:
            return jsonify({'error': f'No data found for symbol: {symbol}'}), 404
        candles = []
        for date, row in data.iterrows():
            candles.append({
                'time': date.strftime('%Y-%m-%d'),
                'open': float(row['Open']),
                'high': float(row['High']),
                'low': float(row['Low']),
                'close': float(row['Close'])
            })
        return jsonify({'symbol': symbol, 'candles': candles})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '127.0.0.1')
    app.run(debug=True, host=host, port=port)
