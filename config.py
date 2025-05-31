"""
config.py
Configuration management for Pixel Trader
"""

import os
from typing import Dict, Any

class Config:
    """Base configuration"""
    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-change-in-production'
    
    # API settings
    API_BASE_URL = os.environ.get('API_BASE_URL', 'http://127.0.0.1:5000')
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')
    
    # Data settings
    DEFAULT_SYMBOL = os.environ.get('DEFAULT_SYMBOL', 'AAPL')
    DEFAULT_PERIOD = os.environ.get('DEFAULT_PERIOD', '1mo')
    DEFAULT_INTERVAL = os.environ.get('DEFAULT_INTERVAL', '1d')
    
    # Rate limiting
    RATE_LIMIT_REQUESTS = int(os.environ.get('RATE_LIMIT_REQUESTS', 100))
    RATE_LIMIT_PERIOD = int(os.environ.get('RATE_LIMIT_PERIOD', 3600))  # 1 hour
    
    # Validation
    MAX_SYMBOL_LENGTH = 10
    ALLOWED_INTERVALS = {
        '1m', '2m', '5m', '15m', '30m', '60m', '90m', 
        '1h', '1d', '5d', '1wk', '1mo', '3mo'
    }
    ALLOWED_PERIODS = {
        '1d', '5d', '1mo', '3mo', '6mo', 
        '1y', '2y', '5y', '10y', 'ytd', 'max'
    }

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    
class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    # Add production-specific settings here

# Configuration selector
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
