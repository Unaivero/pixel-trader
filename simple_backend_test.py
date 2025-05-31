#!/usr/bin/env python3
"""
Simple backend test to verify endpoints work
"""

import os
import sys
sys.path.append('.')

from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf

app = Flask(__name__)
CORS(app)

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'message': 'Backend is running'})

@app.route('/api/candles/<symbol>')
def candles(symbol):
    try:
        period = request.args.get('period', '1mo')
        interval = request.args.get('interval', '1d')
        
        data = yf.download(symbol.upper(), period=period, interval=interval)
        if data.empty:
            return jsonify({'error': 'No data found'}), 404
            
        result = []
        for date, row in data.iterrows():
            result.append({
                'date': date.strftime('%Y-%m-%d'),
                'open': float(row['Open']),
                'high': float(row['High']),
                'low': float(row['Low']),
                'close': float(row['Close']),
                'volume': int(row['Volume']) if 'Volume' in row else 0
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting simple backend test...")
    app.run(debug=True, port=5001)  # Different port to avoid conflicts
