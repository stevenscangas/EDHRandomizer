"""Test custom pack names get card counts"""
import json
import sys
sys.path.insert(0, 'api')
from index import generate_packs

# Test with custom name like TTS auto-generates
config = {
    "packTypes": [
        {
            "name": "Scryfall Search",
            "source": "scryfall",
            "count": 1,
            "slots": [
                {
                    "query": "https://scryfall.com/search?q=banned%3Acommander",
                    "count": 15
                }
            ]
        },
        {
            "name": "Moxfield Deck Pool",
            "source": "moxfield",
            "count": 1,
            "slots": [
                {
                    "deckUrl": "https://moxfield.com/decks/Ph3OYF_lLkuBhDpiP1qwuQ",
                    "count": 15
                }
            ]
        },
        {
            "name": "My Custom Pack Name",
            "count": 1,
            "slots": [
                {"cardType": "weighted", "budget": "budget", "bracket": 2, "count": 5}
            ]
        }
    ]
}

packs = generate_packs('atraxa-grand-unifier', config, bracket=2)
for pack in packs:
    print(f"Pack: {pack['name']}")
    print(f"  Card count: {len(pack['cards'])}")
    print()
