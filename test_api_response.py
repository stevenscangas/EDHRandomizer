"""
Test API response format for Scryfall packs
"""

import json
import sys
sys.path.insert(0, 'api')

from index import generate_packs, extract_commander_slug

print("=== Testing Complete API Flow ===\n")

# Simulate what the API does
commander_url = "https://edhrec.com/commanders/atraxa-grand-unifier"
commander_slug = extract_commander_slug(commander_url)
print(f"Commander URL: {commander_url}")
print(f"Extracted slug: {commander_slug}\n")

# Load config
with open('docs/pack_configs/scryfall_banned_cards.json', 'r') as f:
    config = json.load(f)

print(f"Config:\n{json.dumps(config, indent=2)}\n")

# Generate packs (this is what the API does internally)
packs = generate_packs(commander_slug, config)

# Wrap in API response format (this is what gets returned)
api_response = {"packs": packs}

print(f"API Response:\n{json.dumps(api_response, indent=2)}\n")

# Verify
if api_response and 'packs' in api_response and len(api_response['packs']) > 0:
    print("✓ SUCCESS: API would return packs")
    print(f"  Pack count: {len(api_response['packs'])}")
    print(f"  First pack name: {api_response['packs'][0]['name']}")
    print(f"  First pack card count: {len(api_response['packs'][0]['cards'])}")
    print(f"  Sample cards: {api_response['packs'][0]['cards'][:3]}")
else:
    print("✗ FAILURE: API would return empty packs")
