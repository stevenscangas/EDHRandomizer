"""Quick test for card count in pack names"""
import json
import sys
sys.path.insert(0, 'api')
from index import generate_packs

# Test with Atraxa
config = {
    "packTypes": [
        {
            "count": 1,
            "slots": [
                {"cardType": "weighted", "budget": "expensive", "bracket": 2, "count": 1},
                {"cardType": "weighted", "budget": "budget", "bracket": 2, "count": 5}
            ]
        }
    ]
}

packs = generate_packs('atraxa-grand-unifier', config, bracket=2)
for pack in packs:
    print(f"Pack name: {pack['name']}")
    print(f"Card count: {len(pack['cards'])}")
    print()
