"""
Test pack naming with all three sources
"""

import json
import sys
sys.path.insert(0, 'api')

from index import generate_packs, extract_commander_slug

print("=" * 80)
print("PACK NAMING TESTS")
print("=" * 80 + "\n")

# Test 1: EDHRec pack without color filtering (no commander)
print("Test 1: EDHRec pack with commander (Atraxa)")
print("-" * 80)
config1 = {
    "packTypes": [
        {
            "count": 2,
            "slots": [
                {"cardType": "weighted", "budget": "expensive", "bracket": 2, "count": 1},
                {"cardType": "weighted", "budget": "budget", "bracket": 2, "count": 5}
            ]
        }
    ]
}

packs1 = generate_packs('atraxa-grand-unifier', config1, bracket=2)
for pack in packs1:
    print(f"  ✓ {pack['name']} ({len(pack['cards'])} cards)")
print()

# Test 2: Scryfall pack with color filtering
print("Test 2: Scryfall pack with Bant filtering (Chulane)")
print("-" * 80)
config2 = {
    "packTypes": [
        {
            "source": "scryfall",
            "useCommanderColorIdentity": True,
            "count": 3,
            "slots": [
                {
                    "query": "https://scryfall.com/search?q=banned%3Acommander",
                    "count": 5
                }
            ]
        }
    ]
}

packs2 = generate_packs('chulane-teller-of-tales', config2, bracket=2)
for pack in packs2:
    print(f"  ✓ {pack['name']} ({len(pack['cards'])} cards)")
print()

# Test 3: Scryfall pack without color filtering
print("Test 3: Scryfall pack without color filtering")
print("-" * 80)
config3 = {
    "packTypes": [
        {
            "source": "scryfall",
            "useCommanderColorIdentity": False,
            "count": 1,
            "slots": [
                {
                    "query": "https://scryfall.com/search?q=banned%3Acommander",
                    "count": 5
                }
            ]
        }
    ]
}

packs3 = generate_packs('', config3, bracket=2)
for pack in packs3:
    print(f"  ✓ {pack['name']} ({len(pack['cards'])} cards)")
print()

# Test 4: Moxfield pack with custom deck
print("Test 4: Moxfield pack (Urza's Iron Alliance)")
print("-" * 80)
config4 = {
    "packTypes": [
        {
            "source": "moxfield",
            "useCommanderColorIdentity": False,
            "count": 2,
            "slots": [
                {
                    "deckUrl": "https://moxfield.com/decks/Ph3OYF_lLkuBhDpiP1qwuQ",
                    "count": 15
                }
            ]
        }
    ]
}

packs4 = generate_packs('', config4, bracket=2)
for pack in packs4:
    print(f"  ✓ {pack['name']} ({len(pack['cards'])} cards)")
print()

# Test 5: Moxfield pack with color filtering (Izzet)
print("Test 5: Moxfield pack with Izzet filtering (Niv-Mizzet)")
print("-" * 80)
config5 = {
    "packTypes": [
        {
            "source": "moxfield",
            "useCommanderColorIdentity": True,
            "count": 1,
            "slots": [
                {
                    "deckUrl": "https://moxfield.com/decks/Ph3OYF_lLkuBhDpiP1qwuQ",
                    "count": 15
                }
            ]
        }
    ]
}

packs5 = generate_packs('niv-mizzet-parun', config5, bracket=2)
for pack in packs5:
    print(f"  ✓ {pack['name']} ({len(pack['cards'])} cards)")
print()

# Test 6: Custom pack names (config override)
print("Test 6: Custom pack names from config")
print("-" * 80)
config6 = {
    "packTypes": [
        {
            "name": "My Custom Pack",
            "source": "scryfall",
            "count": 2,
            "slots": [
                {
                    "query": "https://scryfall.com/search?q=banned%3Acommander",
                    "count": 3
                }
            ]
        }
    ]
}

packs6 = generate_packs('', config6, bracket=2)
for pack in packs6:
    print(f"  ✓ {pack['name']} ({len(pack['cards'])} cards)")
print()

# Test 7: Mono-color filtering (Mono-Red)
print("Test 7: EDHRec pack with Mono-Red filtering (Purphoros)")
print("-" * 80)
config7 = {
    "packTypes": [
        {
            "count": 1,
            "slots": [
                {"cardType": "weighted", "budget": "budget", "bracket": 2, "count": 5}
            ]
        }
    ]
}

packs7 = generate_packs('purphoros-god-of-the-forge', config7, bracket=2)
for pack in packs7:
    print(f"  ✓ {pack['name']} ({len(pack['cards'])} cards)")
print()

# Test 8: WUBRG (5-color)
print("Test 8: EDHRec pack with WUBRG filtering (Golos)")
print("-" * 80)
config8 = {
    "packTypes": [
        {
            "count": 1,
            "slots": [
                {"cardType": "weighted", "budget": "budget", "bracket": 2, "count": 5}
            ]
        }
    ]
}

packs8 = generate_packs('golos-tireless-pilgrim', config8, bracket=2)
for pack in packs8:
    print(f"  ✓ {pack['name']} ({len(pack['cards'])} cards)")
print()

print("=" * 80)
print("✅ ALL TESTS COMPLETE")
print("=" * 80)
