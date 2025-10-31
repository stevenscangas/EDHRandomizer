"""
Verify that the cards returned in the filtered pack are actually red-legal
"""
import urllib.request
import json

# Fetch the Moxfield deck
url = "https://api2.moxfield.com/v3/decks/all/Ph3OYF_lLkuBhDpiP1qwuQ/"
with urllib.request.urlopen(url) as response:
    data = json.loads(response.read().decode('utf-8'))

mainboard = data.get('boards', {}).get('mainboard', {}).get('cards', {})

# Cards that were returned in our "red-filtered" pack from Vercel test
test_cards = [
    'Uba Mask',
    'Valakut Awakening // Valakut Stoneforge',
    'Wooded Foothills',
    "Pyromancer's Swath",
    "Alhammarret's Archive",
    'Crawlspace',
    'Ugin, Eye of the Storms',
    'Symmetry Matrix',
    'Stranglehold',
    'Talon Gates of Madara'
]

print("=" * 60)
print("Verifying Color Identities of Returned Cards")
print("=" * 60)
print(f"Commander: Krenko, Mob Boss (Red only)")
print(f"Expected: Cards should be [] (colorless) or ['R'] (red only)")
print()

all_valid = True
for card_data in mainboard.values():
    card = card_data.get('card', {})
    name = card.get('name')
    
    if name in test_cards:
        color_identity = card.get('color_identity', [])
        
        # Check if valid for red commander (must be subset of ['R'])
        is_valid = all(color in ['R'] for color in color_identity)
        status = "✅" if is_valid else "❌"
        
        print(f"{status} {name}")
        print(f"   Color Identity: {color_identity}")
        
        if not is_valid:
            all_valid = False
            print(f"   ⚠️  NOT VALID FOR RED COMMANDER!")
        print()

print("=" * 60)
if all_valid:
    print("✅ All cards are valid for red commander!")
else:
    print("❌ Some cards are NOT valid for red commander!")
    print("   This indicates a filtering bug!")
