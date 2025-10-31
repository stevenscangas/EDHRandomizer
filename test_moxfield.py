"""
Test Moxfield deck fetching locally
"""

import sys
sys.path.insert(0, '.')

from api.index import fetch_moxfield_cards, process_moxfield_slots

# Test 1: Fetch cards from your deck
print("=" * 60)
print("Test 1: Fetching cards from Moxfield deck")
print("=" * 60)

deck_url = "https://moxfield.com/decks/Ph3OYF_lLkuBhDpiP1qwuQ"
cards = fetch_moxfield_cards(deck_url)

print(f"\nTotal cards fetched: {len(cards)}")
print(f"Unique cards: {len(set(cards))}")
print(f"\nFirst 20 cards:")
for i, card in enumerate(cards[:20], 1):
    print(f"  {i}. {card}")

# Test 2: Process slots (simulate pack generation)
print("\n" + "=" * 60)
print("Test 2: Generating packs from Moxfield deck")
print("=" * 60)

slots = [
    {
        "deckUrl": deck_url,
        "count": 15
    }
]

used_cards = set()
selected_cards = process_moxfield_slots(slots, used_cards)

print(f"\nGenerated pack with {len(selected_cards)} cards:")
for i, card in enumerate(selected_cards, 1):
    print(f"  {i}. {card}")

# Test 3: Multiple packs
print("\n" + "=" * 60)
print("Test 3: Generating 3 packs")
print("=" * 60)

for pack_num in range(3):
    used_cards_per_pack = set()
    pack_cards = process_moxfield_slots(slots, used_cards_per_pack)
    print(f"\nPack #{pack_num + 1}: {len(pack_cards)} cards")
    print(f"  Sample cards: {', '.join(pack_cards[:5])}")
