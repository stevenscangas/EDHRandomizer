"""
Test the pack generation API with real commanders
"""

import requests
import json

API_URL = "https://edhrandomizer-api.vercel.app/api/index"

print("=" * 70)
print("Testing Real Pack Generation")
print("=" * 70 + "\n")

# Test 1: Default config with Atraxa
print("Test 1: Atraxa with default config (1 expensive, 11 budget, 3 lands)")
print("-" * 70)

response = requests.post(API_URL, json={
    "commander_url": "https://edhrec.com/commanders/atraxa-grand-unifier"
})

if response.status_code == 200:
    result = response.json()
    packs = result.get('packs', [])
    
    print(f"✓ Generated {len(packs)} pack(s)")
    
    for pack in packs:
        print(f"\n{pack['name']}:")
        print(f"  Total cards: {len(pack['cards'])}")
        if pack['cards']:
            print(f"  Sample cards:")
            for card in pack['cards'][:5]:
                print(f"    - {card}")
else:
    print(f"✗ Error: {response.status_code}")
    print(response.text)

print("\n" + "=" * 70)
print("Test 2: Custom config with multiple pack types")
print("=" * 70 + "\n")

custom_config = {
    "packTypes": [
        {
            "name": "Budget Pack",
            "count": 2,
            "slots": [
                {"cardType": "weighted", "budget": "budget", "bracket": 3, "count": 12},
                {"cardType": "lands", "budget": "any", "bracket": 3, "count": 3}
            ]
        },
        {
            "name": "Premium Pack",
            "count": 1,
            "slots": [
                {"cardType": "weighted", "budget": "expensive", "bracket": 5, "count": 15}
            ]
        }
    ]
}

response = requests.post(API_URL, json={
    "commander_url": "https://edhrec.com/commanders/esika-god-of-the-tree",
    "config": custom_config
})

if response.status_code == 200:
    result = response.json()
    packs = result.get('packs', [])
    
    print(f"✓ Generated {len(packs)} pack(s)")
    
    for pack in packs:
        print(f"\n{pack['name']}:")
        print(f"  Total cards: {len(pack['cards'])}")
        if pack['cards']:
            print(f"  Sample cards:")
            for card in pack['cards'][:3]:
                print(f"    - {card}")
else:
    print(f"✗ Error: {response.status_code}")
    print(response.text)

print("\n" + "=" * 70)
print("Tests Complete!")
print("=" * 70)
