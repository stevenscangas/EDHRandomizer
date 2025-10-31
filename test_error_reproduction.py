"""
Test to reproduce Vercel error
"""

import json
import sys
import traceback
sys.path.insert(0, 'api')

try:
    from index import generate_packs
    
    print("Testing with Scryfall banned cards config...")
    
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
                        "count": 15
                    }
                ]
            }
        ]
    }
    
    packs = generate_packs('atraxa-grand-unifier', config, bracket=2)
    
    print(f"SUCCESS: Generated {len(packs)} pack(s)")
    print(json.dumps({"packs": packs}, indent=2))
    
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
    print("\nFull traceback:")
    traceback.print_exc()
