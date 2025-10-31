"""
Test Moxfield deck fetching with commander color filtering
"""

import sys
sys.path.insert(0, '.')

from api.index import fetch_moxfield_cards, process_moxfield_slots

deck_url = "https://moxfield.com/decks/Ph3OYF_lLkuBhDpiP1qwuQ"

# Test 1: Fetch cards WITHOUT color filter
print("=" * 60)
print("Test 1: Fetching cards WITHOUT color filter")
print("=" * 60)

cards_unfiltered = fetch_moxfield_cards(deck_url, commander_colors=None)
print(f"\nTotal cards (unfiltered): {len(cards_unfiltered)}")
print(f"Unique cards: {len(set(cards_unfiltered))}")

# Test 2: Fetch cards with RED commander filter (like Krenko)
print("\n" + "=" * 60)
print("Test 2: Fetching cards with RED commander filter")
print("=" * 60)

cards_red = fetch_moxfield_cards(deck_url, commander_colors=['R'])
print(f"\nTotal cards (red filtered): {len(cards_red)}")
print(f"Unique cards: {len(set(cards_red))}")
print(f"\nFirst 15 cards:")
for i, card in enumerate(cards_red[:15], 1):
    print(f"  {i}. {card}")

# Test 3: Fetch cards with BLUE commander filter (like Talrand)
print("\n" + "=" * 60)
print("Test 3: Fetching cards with BLUE commander filter")
print("=" * 60)

cards_blue = fetch_moxfield_cards(deck_url, commander_colors=['U'])
print(f"\nTotal cards (blue filtered): {len(cards_blue)}")
print(f"Unique cards: {len(set(cards_blue))}")
print(f"\nFirst 15 cards:")
for i, card in enumerate(cards_blue[:15], 1):
    print(f"  {i}. {card}")

# Test 4: Process slots WITH color filter enabled
print("\n" + "=" * 60)
print("Test 4: Generate pack with RED color filter via process_moxfield_slots")
print("=" * 60)

slots = [
    {
        "deckUrl": deck_url,
        "count": 15,
        "useCommanderColorIdentity": True  # Slot-level override
    }
]

used_cards = set()
commander_colors = ['R']  # Krenko's colors
pack_level_filter = True

selected_cards = process_moxfield_slots(slots, used_cards, commander_colors, pack_level_filter)

print(f"\nGenerated pack with {len(selected_cards)} cards:")
for i, card in enumerate(selected_cards, 1):
    print(f"  {i}. {card}")

# Test 5: Process slots WITHOUT color filter (pack level disabled, slot level not set)
print("\n" + "=" * 60)
print("Test 5: Generate pack WITHOUT color filter")
print("=" * 60)

slots_no_filter = [
    {
        "deckUrl": deck_url,
        "count": 15
    }
]

used_cards_no_filter = set()
pack_level_filter_disabled = False

selected_cards_no_filter = process_moxfield_slots(
    slots_no_filter, 
    used_cards_no_filter, 
    commander_colors=['R'],  # Commander present but filter disabled
    pack_level_color_filter=pack_level_filter_disabled
)

print(f"\nGenerated pack with {len(selected_cards_no_filter)} cards:")
for i, card in enumerate(selected_cards_no_filter, 1):
    print(f"  {i}. {card}")

print("\n" + "=" * 60)
print("Summary:")
print("=" * 60)
print(f"Unfiltered: {len(cards_unfiltered)} cards")
print(f"Red filtered: {len(cards_red)} cards ({100 * len(cards_red) / len(cards_unfiltered):.1f}%)")
print(f"Blue filtered: {len(cards_blue)} cards ({100 * len(cards_blue) / len(cards_unfiltered):.1f}%)")
