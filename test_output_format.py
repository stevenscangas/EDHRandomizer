"""
Compare output format between EDHRec and Scryfall packs
"""

import json
import sys
sys.path.insert(0, 'api')

from index import generate_packs

print("=== EDHRec Pack Output ===")
edhrec_config = {
    "packTypes": [
        {
            "name": "Standard Pack",
            "count": 1,
            "slots": [
                {"cardType": "weighted", "budget": "any", "bracket": 2, "count": 5}
            ]
        }
    ]
}

edhrec_packs = generate_packs('atraxa-grand-unifier', edhrec_config, bracket=2)
print(json.dumps(edhrec_packs, indent=2))

print("\n" + "="*60 + "\n")

print("=== Scryfall Pack Output ===")
scryfall_config = {
    "packTypes": [
        {
            "name": "Banned Cards",
            "source": "scryfall",
            "count": 1,
            "useCommanderColorIdentity": False,
            "slots": [
                {
                    "query": "banned:commander -t:conspiracy -o:ante",
                    "count": 5
                }
            ]
        }
    ]
}

scryfall_packs = generate_packs('atraxa-grand-unifier', scryfall_config, bracket=2)
print(json.dumps(scryfall_packs, indent=2))

print("\n" + "="*60 + "\n")

print("=== Format Comparison ===")
print(f"EDHRec output type: {type(edhrec_packs)}")
print(f"Scryfall output type: {type(scryfall_packs)}")
print(f"EDHRec pack count: {len(edhrec_packs)}")
print(f"Scryfall pack count: {len(scryfall_packs)}")

if edhrec_packs:
    print(f"\nEDHRec pack[0] keys: {list(edhrec_packs[0].keys())}")
    print(f"EDHRec pack[0]['name']: {edhrec_packs[0]['name']}")
    print(f"EDHRec pack[0]['cards'] type: {type(edhrec_packs[0]['cards'])}")
    print(f"EDHRec pack[0]['cards'] length: {len(edhrec_packs[0]['cards'])}")

if scryfall_packs:
    print(f"\nScryfall pack[0] keys: {list(scryfall_packs[0].keys())}")
    print(f"Scryfall pack[0]['name']: {scryfall_packs[0]['name']}")
    print(f"Scryfall pack[0]['cards'] type: {type(scryfall_packs[0]['cards'])}")
    print(f"Scryfall pack[0]['cards'] length: {len(scryfall_packs[0]['cards'])}")

print("\n=== Are they identical format? ===")
if edhrec_packs and scryfall_packs:
    same_structure = (
        list(edhrec_packs[0].keys()) == list(scryfall_packs[0].keys()) and
        type(edhrec_packs[0]['cards']) == type(scryfall_packs[0]['cards'])
    )
    print(f"Same structure: {same_structure}")
