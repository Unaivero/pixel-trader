"""
utils.py
Utility functions for Pixel Trader
"""

import os
import logging
import functools
from flask import jsonify
from typing import Callable, Any

def setup_logging():
    """Setup logging configuration"""
    # Ensure logs directory exists
    os.makedirs('logs', exist_ok=True)
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('logs/app.log'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

def handle_api_errors(f: Callable) -> Callable:
    """Decorator for handling API errors gracefully"""
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValueError as e:
            return jsonify({'error': f'Validation error: {str(e)}'}), 400
        except Exception as e:
            logging.error(f'Unexpected error in {f.__name__}: {str(e)}')
            return jsonify({'error': 'Internal server error'}), 500
    return wrapper

def validate_symbol(symbol: str) -> str:
    """Validate and normalize stock symbol"""
    if not symbol:
        raise ValueError('Symbol is required')
    
    symbol = symbol.strip().upper()
    
    if not symbol.isalnum():
        raise ValueError('Symbol must contain only letters and numbers')
    
    if len(symbol) > 10:
        raise ValueError('Symbol too long (max 10 characters)')
    
    return symbol

def validate_period(period: str, allowed_periods: set) -> str:
    """Validate time period"""
    if period not in allowed_periods:
        raise ValueError(f'Invalid period. Allowed: {", ".join(sorted(allowed_periods))}')
    return period

def validate_interval(interval: str, allowed_intervals: set) -> str:
    """Validate time interval"""
    if interval not in allowed_intervals:
        raise ValueError(f'Invalid interval. Allowed: {", ".join(sorted(allowed_intervals))}')
    return interval
