"""
Test the actual API endpoint flow
"""

import json
import sys
sys.path.insert(0, 'api')

from index import generate_packs

# Test with banned cards config
print("=== Testing API Flow ===")

config = {
    "packTypes": [
        {
            "name": "Banned Cards",
            "source": "scryfall",
            "count": 1,
            "useCommanderColorIdentity": False,
            "slots": [
                {
                    "query": "https://scryfall.com/search?q=banned%3Acommander+-t%3Aconspiracy+-o%3Aante+-otag%3A%22banned+due+to+racist+imagery%22&unique=cards&as=grid&order=edhrec",
                    "count": 15,
                    "description": "Random banned cards"
                }
            ]
        }
    ]
}

print(f"Config:\n{json.dumps(config, indent=2)}\n")

# Generate packs - this is what the API does
packs = generate_packs('atraxa-grand-unifier', config, bracket=2)

print(f"Result: {len(packs)} packs generated\n")

if packs:
    for pack in packs:
        print(f"Pack '{pack['name']}': {len(pack['cards'])} cards")
        for card in pack['cards'][:5]:
            print(f"  - {card}")
        if len(pack['cards']) > 5:
            print(f"  ... and {len(pack['cards']) - 5} more")
else:
    print("NO PACKS GENERATED - This is the bug!")
