"""
Test the deployed Vercel API endpoint
"""

import requests
import json

API_URL = "https://edhrandomizer-api.vercel.app/api/generate-packs"

print("=" * 60)
print("Testing Deployed API at:")
print(API_URL)
print("=" * 60 + "\n")

# Test 1: GET request (documentation)
print("Test 1: GET request (API documentation)")
print("-" * 60)
try:
    response = requests.get(API_URL)
    print(f"Status: {response.status_code}")
    print(f"Response:\n{json.dumps(response.json(), indent=2)}\n")
except Exception as e:
    print(f"ERROR: {e}\n")

# Test 2: POST with default config
print("Test 2: POST with default config")
print("-" * 60)
try:
    data = {
        "commander_url": "https://edhrec.com/commanders/atraxa-grand-unifier"
    }
    response = requests.post(API_URL, json=data)
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Packs generated: {len(result.get('packs', []))}")
    for pack in result.get('packs', []):
        print(f"  - {pack['name']}: {len(pack['cards'])} cards")
        print(f"    Sample: {', '.join(pack['cards'][:3])}")
    print()
except Exception as e:
    print(f"ERROR: {e}\n")

# Test 3: POST with different commander
print("Test 3: POST with different commander")
print("-" * 60)
try:
    data = {
        "commander_url": "https://edhrec.com/commanders/esika-god-of-the-tree/core"
    }
    response = requests.post(API_URL, json=data)
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Commander slug extracted: esika-god-of-the-tree")
    print(f"Packs generated: {len(result.get('packs', []))}")
    print()
except Exception as e:
    print(f"ERROR: {e}\n")

# Test 4: POST with invalid URL (error handling)
print("Test 4: Invalid commander URL (error handling)")
print("-" * 60)
try:
    data = {
        "commander_url": "https://invalid.com/test"
    }
    response = requests.post(API_URL, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response:\n{json.dumps(response.json(), indent=2)}\n")
except Exception as e:
    print(f"ERROR: {e}\n")

print("=" * 60)
print("API Tests Complete!")
print("=" * 60)
