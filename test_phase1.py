#!/usr/bin/env python3
"""
Quick test script to verify Phase 1 fixes are working
"""

import requests
import json

def test_backend():
    base_url = "http://127.0.0.1:5000/api"
    
    print("🧪 Testing Backend Endpoints...")
    
    # Test candles endpoint
    try:
        response = requests.get(f"{base_url}/candles/AAPL?period=1mo&interval=1d", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Candles endpoint: {len(data)} data points received")
        else:
            print(f"❌ Candles endpoint failed: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Backend not running. Start with: cd backend && python app.py")
        return False
    except Exception as e:
        print(f"❌ Candles endpoint error: {e}")
    
    # Test company info endpoint
    try:
        response = requests.get(f"{base_url}/company/AAPL", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Company info endpoint: {data.get('companyName', 'Unknown')}")
        else:
            print(f"❌ Company info endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Company info endpoint error: {e}")
    
    # Test news endpoint
    try:
        response = requests.get(f"{base_url}/news/AAPL", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ News endpoint: {len(data)} news items")
        else:
            print(f"❌ News endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ News endpoint error: {e}")
    
    print("\n🎯 Phase 1 cleanup verification complete!")
    print("Next: Start backend with 'cd backend && python app.py'")
    print("Then: Open frontend/index.html in browser")
    
    return True

if __name__ == "__main__":
    test_backend()
