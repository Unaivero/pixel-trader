import os
import sys
from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import requests

# Add parent directory to path for config import
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import Config
from utils import handle_api_errors, validate_symbol, validate_period, validate_interval, setup_logging

# Setup logging
logger = setup_logging()

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, origins=Config.CORS_ORIGINS)

# Allowed intervals and periods for safety
ALLOWED_INTERVALS = Config.ALLOWED_INTERVALS
ALLOWED_PERIODS = Config.ALLOWED_PERIODS

@app.route('/api/health')
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Pixel Trader API is running',
        'version': '2.0'
    }), 200

@app.route('/api/candles/<symbol>')
@handle_api_errors
def get_candles(symbol):
    symbol = validate_symbol(symbol)
    period = validate_period(request.args.get('period', '1mo'), ALLOWED_PERIODS)
    interval = validate_interval(request.args.get('interval', '1d'), ALLOWED_INTERVALS)

    logger.info(f"Fetching candles for {symbol}, period: {period}, interval: {interval}")

    try:
        data = yf.download(symbol, period=period, interval=interval)
        if data.empty:
            return jsonify({'error': f'No data found for symbol: {symbol}'}), 404
        candles = []
        for date, row in data.iterrows():
            candles.append({
                'date': date.strftime('%Y-%m-%d'),
                'time': date.strftime('%Y-%m-%d'),
                'open': float(row['Open']),
                'high': float(row['High']),
                'low': float(row['Low']),
                'close': float(row['Close']),
                'volume': int(row['Volume']) if 'Volume' in row else 0
            })
        return jsonify(candles)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/company/<symbol>')
@handle_api_errors
def get_company_info(symbol):
    """Get basic company information"""
    symbol = validate_symbol(symbol)
    
    logger.info(f"Fetching company info for {symbol}")
    
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        company_data = {
            'symbol': symbol,
            'companyName': info.get('longName', symbol),
            'sector': info.get('sector', 'Unknown'),
            'industry': info.get('industry', 'Unknown'),
            'website': info.get('website', ''),
            'description': info.get('longBusinessSummary', '')[:500],  # Limit description length
            'marketCap': info.get('marketCap', 0),
            'image': f"https://logo.clearbit.com/{info.get('website', '').replace('https://', '').replace('http://', '').split('/')[0]}" if info.get('website') else None
        }
        
        return jsonify(company_data)
    except Exception as e:
        logger.error(f"Error fetching company info for {symbol}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/news/<symbol>')
@handle_api_errors
def get_company_news(symbol):
    """Get recent news for a company"""
    symbol = validate_symbol(symbol)
    
    logger.info(f"Fetching news for {symbol}")
    
    try:
        ticker = yf.Ticker(symbol)
        news = ticker.news
        
        # Format news data
        formatted_news = []
        for item in news[:8]:  # Limit to 8 most recent
            formatted_news.append({
                'title': item.get('title', 'No title'),
                'url': item.get('link', ''),
                'publishedDate': item.get('providerPublishTime', ''),
                'publisher': item.get('publisher', 'Unknown')
            })
        
        return jsonify(formatted_news)
    except Exception as e:
        logger.error(f"Error fetching news for {symbol}: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '127.0.0.1')
    app.run(debug=True, host=host, port=port)
