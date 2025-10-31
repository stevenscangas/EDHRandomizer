"""Check Moxfield deck commander color identity"""
import urllib.request
import json

url = "https://api2.moxfield.com/v3/decks/all/Ph3OYF_lLkuBhDpiP1qwuQ/"

with urllib.request.urlopen(url) as response:
    data = json.loads(response.read().decode('utf-8'))

# Check deck-level color identity
print("Deck-level color identity:")
print(f"  colorIdentity: {data.get('colorIdentity', [])}")
print(f"  colors: {data.get('colors', [])}")

# Check commanders
boards = data.get('boards', {})
commanders = boards.get('commanders', {}).get('cards', {})
print(f"\nCommanders found: {len(commanders)}")

for cmd_id, cmd_data in list(commanders.items())[:5]:
    card = cmd_data.get('card', {})
    name = card.get('name')
    color_identity = card.get('color_identity', [])
    print(f"  {name}: {color_identity}")
