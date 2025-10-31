"""
Test commander color filtering
"""

import json
import sys
sys.path.insert(0, 'api')

from index import generate_packs, fetch_edhrec_data

# Test with Krenko (mono-red)
print("=== Testing Krenko (Mono-Red) ===")
edhrec_data = fetch_edhrec_data('krenko-mob-boss', 2, 'any')
if edhrec_data:
    colors = edhrec_data.get('color_identity', [])
    print(f"Krenko color identity from EDHRec: {colors}")
else:
    print("Failed to fetch EDHRec data!")

config = {
    "packTypes": [
        {
            "name": "Color Test",
            "source": "scryfall",
            "count": 1,
            "useCommanderColorIdentity": True,
            "slots": [
                {
                    "query": "t:creature cmc<=3",
                    "count": 10
                }
            ]
        }
    ]
}

packs = generate_packs('krenko-mob-boss', config, bracket=2)
print(f"\nGenerated {len(packs[0]['cards'])} cards:")
for card in packs[0]['cards']:
    print(f"  - {card}")

# Now test with Talrand (mono-blue)
print("\n\n=== Testing Talrand (Mono-Blue) ===")
edhrec_data = fetch_edhrec_data('talrand-sky-summoner', 2, 'any')
if edhrec_data:
    colors = edhrec_data.get('color_identity', [])
    print(f"Talrand color identity from EDHRec: {colors}")

packs = generate_packs('talrand-sky-summoner', config, bracket=2)
print(f"\nGenerated {len(packs[0]['cards'])} cards:")
for card in packs[0]['cards']:
    print(f"  - {card}")
