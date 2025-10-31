"""Check if Moxfield cards have color_identity data"""
import urllib.request
import json

url = "https://api2.moxfield.com/v3/decks/all/Ph3OYF_lLkuBhDpiP1qwuQ/"

with urllib.request.urlopen(url) as response:
    data = json.loads(response.read().decode('utf-8'))

# Check mainboard cards and their color identities
boards = data.get('boards', {})
mainboard = boards.get('mainboard', {}).get('cards', {})

print(f"Total mainboard cards: {len(mainboard)}\n")
print("First 10 cards with color identities:")

for i, (card_id, card_data) in enumerate(list(mainboard.items())[:10], 1):
    card = card_data.get('card', {})
    name = card.get('name')
    color_identity = card.get('color_identity', [])
    print(f"  {i}. {name}: {color_identity}")

# Test filtering by a commander's color identity (e.g., Krenko = Red only)
test_commander_colors = ['R']  # Red only
print(f"\n\nFiltering by commander colors {test_commander_colors}:")

filtered_cards = []
for card_data in mainboard.values():
    card = card_data.get('card', {})
    card_ci = card.get('color_identity', [])
    
    # Check if card's color identity is subset of commander's
    if all(color in test_commander_colors for color in card_ci):
        filtered_cards.append(card.get('name'))

print(f"  {len(filtered_cards)} cards match (out of {len(mainboard)})")
print(f"  First 10 matches: {filtered_cards[:10]}")
