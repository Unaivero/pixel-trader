#!/usr/bin/env python3
"""
Phase 2 test script - Verify architecture cleanup is working
"""

import os
import sys
import requests
import json

def test_removed_components():
    """Test that removed components are properly archived"""
    print("🧪 Testing Component Removal...")
    
    # Check that components were moved to archive
    archived_files = [
        'archived_components/interface.py',
        'archived_components/simulator.py', 
        'archived_components/arbitrage_logic.py',
        'archived_components/data_stream.py'
    ]
    
    for file_path in archived_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path} properly archived")
        else:
            print(f"❌ {file_path} not found in archive")
    
    # Check that files were removed from main directory
    main_files = [
        'interface.py',
        'simulator.py',
        'arbitrage_logic.py', 
        'data_stream.py'
    ]
    
    for file_path in main_files:
        if not os.path.exists(file_path):
            print(f"✅ {file_path} properly removed from main directory")
        else:
            print(f"❌ {file_path} still exists in main directory")

def test_new_structure():
    """Test that new structure components exist"""
    print("\n🏗️ Testing New Structure...")
    
    required_files = [
        'config.py',
        'utils.py',
        'logs/',
        'frontend/ui.js',
        'frontend/api.js',
        'frontend/chart.js',
        'backend/app.py'
    ]
    
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path} exists")
        else:
            print(f"❌ {file_path} missing")

def test_configuration():
    """Test configuration import"""
    print("\n⚙️ Testing Configuration...")
    
    try:
        sys.path.append('.')
        from config import Config
        print(f"✅ Config imported successfully")
        print(f"   - Default symbol: {Config.DEFAULT_SYMBOL}")
        print(f"   - API base URL: {Config.API_BASE_URL}")
        print(f"   - Max symbol length: {Config.MAX_SYMBOL_LENGTH}")
    except ImportError as e:
        print(f"❌ Config import failed: {e}")

def test_backend_endpoints():
    """Test that backend still works with new structure"""
    print("\n🔌 Testing Backend Endpoints...")
    
    base_url = "http://127.0.0.1:5000/api"
    
    try:
        # Test health/basic endpoint
        response = requests.get(f"{base_url}/candles/AAPL?period=1mo&interval=1d", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend endpoints working: {len(data)} data points")
        else:
            print(f"❌ Backend endpoint failed: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("⚠️ Backend not running. Start with: cd backend && python app.py")
    except Exception as e:
        print(f"❌ Backend test error: {e}")

def test_dependencies():
    """Test that dependencies are properly cleaned up"""
    print("\n📦 Testing Dependencies...")
    
    try:
        with open('requirements.txt', 'r') as f:
            content = f.read()
            
        if 'streamlit' not in content:
            print("✅ Streamlit removed from requirements")
        else:
            print("❌ Streamlit still in requirements")
            
        if 'flask' in content:
            print("✅ Flask still in requirements")
        else:
            print("❌ Flask missing from requirements")
            
        if 'yfinance' in content:
            print("✅ yfinance still in requirements")
        else:
            print("❌ yfinance missing from requirements")
            
    except FileNotFoundError:
        print("❌ requirements.txt not found")

def main():
    print("🎯 Phase 2: Architecture Choice Verification")
    print("=" * 50)
    
    test_removed_components()
    test_new_structure()
    test_configuration()
    test_backend_endpoints()
    test_dependencies()
    
    print("\n" + "=" * 50)
    print("🎉 Phase 2 testing complete!")
    print("\nNext steps:")
    print("1. cd backend && python app.py")
    print("2. Open frontend/index.html in browser")
    print("3. Ready for Phase 3: Polish & Features!")

if __name__ == "__main__":
    main()
