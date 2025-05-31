#!/usr/bin/env python3
"""
Demo backend with mock data for Pixel Trader demonstration
"""

import os
import sys
import json
from datetime import datetime, timedelta
import random
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def generate_mock_data(symbol, days=30):
    """Generate realistic mock stock data"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # Base prices for different stocks
    base_prices = {
        'AAPL': 180.0,
        'MSFT': 350.0,
        'GOOGL': 130.0,
        'TSLA': 200.0,
        'AMZN': 140.0,
        'NVDA': 900.0,
        'META': 320.0,
        'NFLX': 400.0
    }
    
    base_price = base_prices.get(symbol.upper(), 100.0)
    current_price = base_price
    
    data = []
    current_date = start_date
    
    for day in range(days):
        # Simulate daily price movement
        daily_change = random.uniform(-0.05, 0.05)  # -5% to +5%
        current_price *= (1 + daily_change)
        
        # Simulate intraday high/low
        high = current_price * random.uniform(1.001, 1.03)
        low = current_price * random.uniform(0.97, 0.999)
        
        # Open price based on previous close with some gap
        if day == 0:
            open_price = current_price
        else:
            gap = random.uniform(-0.02, 0.02)
            open_price = data[-1]['close'] * (1 + gap)
        
        # Volume simulation
        volume = random.randint(10000000, 100000000)
        
        data.append({
            'date': current_date.strftime('%Y-%m-%d'),
            'time': current_date.strftime('%Y-%m-%d'),
            'open': round(open_price, 2),
            'high': round(high, 2),
            'low': round(low, 2),
            'close': round(current_price, 2),
            'volume': volume
        })
        
        current_date += timedelta(days=1)
    
    return data

@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Pixel Trader Demo API is running',
        'version': '2.0-demo',
        'note': 'Using mock data for demonstration'
    })

@app.route('/api/candles/<symbol>')
def get_candles(symbol):
    try:
        symbol = symbol.upper()
        period = request.args.get('period', '1mo')
        interval = request.args.get('interval', '1d')
        
        # Map periods to days
        period_days = {
            '1d': 1,
            '5d': 5, 
            '1mo': 30,
            '3mo': 90,
            '6mo': 180,
            '1y': 365,
            '2y': 730,
            '5y': 1825
        }
        
        days = period_days.get(period, 30)
        data = generate_mock_data(symbol, days)
        
        return jsonify(data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/company/<symbol>')
def get_company_info(symbol):
    """Mock company information"""
    symbol = symbol.upper()
    
    # Mock company data
    companies = {
        'AAPL': {
            'symbol': 'AAPL',
            'companyName': 'Apple Inc.',
            'sector': 'Technology',
            'industry': 'Consumer Electronics',
            'website': 'https://www.apple.com',
            'description': 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
            'marketCap': 3000000000000,
            'image': 'https://logo.clearbit.com/apple.com'
        },
        'MSFT': {
            'symbol': 'MSFT',
            'companyName': 'Microsoft Corporation',
            'sector': 'Technology',
            'industry': 'Software',
            'website': 'https://www.microsoft.com',
            'description': 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
            'marketCap': 2800000000000,
            'image': 'https://logo.clearbit.com/microsoft.com'
        },
        'GOOGL': {
            'symbol': 'GOOGL',
            'companyName': 'Alphabet Inc.',
            'sector': 'Technology',
            'industry': 'Internet Content & Information',
            'website': 'https://www.alphabet.com',
            'description': 'Alphabet Inc. provides online advertising services in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.',
            'marketCap': 1700000000000,
            'image': 'https://logo.clearbit.com/google.com'
        }
    }
    
    company_data = companies.get(symbol, {
        'symbol': symbol,
        'companyName': f'{symbol} Corporation',
        'sector': 'Technology',
        'industry': 'Software',
        'website': '',
        'description': f'Mock data for {symbol} - this is demonstration data.',
        'marketCap': 50000000000,
        'image': None
    })
    
    return jsonify(company_data)

@app.route('/api/news/<symbol>')
def get_company_news(symbol):
    """Mock news data"""
    symbol = symbol.upper()
    
    mock_news = [
        {
            'title': f'{symbol} Reports Strong Quarterly Earnings',
            'url': 'https://example.com/news1',
            'publishedDate': '2025-05-30',
            'publisher': 'Financial Times'
        },
        {
            'title': f'{symbol} Announces New Product Launch',
            'url': 'https://example.com/news2', 
            'publishedDate': '2025-05-29',
            'publisher': 'TechCrunch'
        },
        {
            'title': f'{symbol} Stock Analysis: Bullish Outlook',
            'url': 'https://example.com/news3',
            'publishedDate': '2025-05-28',
            'publisher': 'MarketWatch'
        },
        {
            'title': f'{symbol} CEO Discusses Future Strategy',
            'url': 'https://example.com/news4',
            'publishedDate': '2025-05-27',
            'publisher': 'Bloomberg'
        }
    ]
    
    return jsonify(mock_news)

if __name__ == '__main__':
    print("🚀 Starting Pixel Trader Demo Backend...")
    print("📊 Using mock data for demonstration")
    print("🌐 Frontend available at: frontend/index.html")
    print("=" * 50)
    app.run(debug=True, host='127.0.0.1', port=5002)
