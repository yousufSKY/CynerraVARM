"""
Test script to check API responses from the backend
Run this to see the exact data structure returned by the API
"""

import requests
import json
from datetime import datetime

# Backend URL
BASE_URL = "http://localhost:8000"

def print_json(data, title=""):
    """Pretty print JSON data"""
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)
    print(json.dumps(data, indent=2, default=str))
    print("="*80 + "\n")

def test_scan_history():
    """Test the scan history endpoint"""
    print("\n🔍 Testing: GET /api/test/scan/history/default-asset")
    
    try:
        response = requests.get(f"{BASE_URL}/api/test/scan/history/default-asset")
        print(f"Status Code: {response.status_code}")
        
        if response.ok:
            data = response.json()
            print_json(data, "SCAN HISTORY RESPONSE")
            
            # Analyze the structure
            if isinstance(data, dict) and 'scans' in data:
                scans = data['scans']
                print(f"📊 Found {len(scans)} scans")
                
                if scans:
                    print("\n🔎 First scan structure:")
                    first_scan = scans[0]
                    print_json(first_scan, "FIRST SCAN OBJECT")
                    
                    # List all fields
                    print("\n📋 Available fields in scan object:")
                    for key in sorted(first_scan.keys()):
                        value = first_scan[key]
                        value_type = type(value).__name__
                        value_preview = str(value)[:50] if value else "None"
                        print(f"  - {key}: {value_type} = {value_preview}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_scan_detail(scan_id=None):
    """Test the scan detail endpoint"""
    
    # First get a scan ID if not provided
    if not scan_id:
        print("\n📥 Fetching scan ID from history...")
        try:
            response = requests.get(f"{BASE_URL}/api/test/scan/history/default-asset")
            if response.ok:
                data = response.json()
                if data.get('scans'):
                    scan_id = data['scans'][0].get('scan_id') or data['scans'][0].get('id')
                    print(f"✅ Using scan ID: {scan_id}")
        except Exception as e:
            print(f"❌ Could not get scan ID: {e}")
            return
    
    if not scan_id:
        print("❌ No scan ID available")
        return
    
    print(f"\n🔍 Testing: GET /api/test/scan/{scan_id}")
    
    try:
        response = requests.get(f"{BASE_URL}/api/test/scan/{scan_id}")
        print(f"Status Code: {response.status_code}")
        
        if response.ok:
            data = response.json()
            print_json(data, f"SCAN DETAIL RESPONSE - ID: {scan_id}")
            
            # Analyze parsed_results
            if 'parsed_results' in data:
                parsed = data['parsed_results']
                print("\n📊 Parsed Results Structure:")
                print_json(parsed, "PARSED_RESULTS")
                
                # Check for summary
                if 'summary' in parsed:
                    print("\n✅ Summary exists:")
                    print_json(parsed['summary'], "SUMMARY OBJECT")
                else:
                    print("\n⚠️  No 'summary' field in parsed_results")
                
                # Check for hosts
                if 'hosts' in parsed:
                    print(f"\n✅ Hosts array exists with {len(parsed['hosts'])} hosts")
                    if parsed['hosts']:
                        print_json(parsed['hosts'][0], "FIRST HOST OBJECT")
                else:
                    print("\n⚠️  No 'hosts' field in parsed_results")
            else:
                print("\n⚠️  No 'parsed_results' field in response")
                
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_scan_results(scan_id=None):
    """Test the scan results endpoint"""
    
    # First get a scan ID if not provided
    if not scan_id:
        print("\n📥 Fetching scan ID from history...")
        try:
            response = requests.get(f"{BASE_URL}/api/test/scan/history/default-asset")
            if response.ok:
                data = response.json()
                if data.get('scans'):
                    scan_id = data['scans'][0].get('scan_id') or data['scans'][0].get('id')
                    print(f"✅ Using scan ID: {scan_id}")
        except Exception as e:
            print(f"❌ Could not get scan ID: {e}")
            return
    
    if not scan_id:
        print("❌ No scan ID available")
        return
    
    print(f"\n🔍 Testing: GET /api/test/scan/{scan_id}/results")
    
    try:
        response = requests.get(f"{BASE_URL}/api/test/scan/{scan_id}/results")
        print(f"Status Code: {response.status_code}")
        
        if response.ok:
            data = response.json()
            print_json(data, f"SCAN RESULTS - ID: {scan_id}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def main():
    """Run all tests"""
    print("\n" + "🚀"*40)
    print("  VARM API RESPONSE TEST SCRIPT")
    print("  Testing backend at:", BASE_URL)
    print("  Time:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("🚀"*40)
    
    # Test 1: Scan History
    test_scan_history()
    
    # Test 2: Scan Detail
    test_scan_detail()
    
    # Test 3: Scan Results
    test_scan_results()
    
    print("\n" + "✅"*40)
    print("  TESTS COMPLETED")
    print("✅"*40 + "\n")

if __name__ == "__main__":
    main()
