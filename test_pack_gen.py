import sys
sys.path.insert(0, 'api')

from index import generate_packs, extract_commander_slug
import json

# Use the exact request from TTS logs
request_body_str = '{"commander_url":"https://edhrec.com/commanders/hearthhull-the-worldseed","config":{"packTypes":[{"count":5,"name":"Pack","slots":[{"bracket":2,"budget":"expensive","cardType":"weighted","count":1},{"bracket":2,"budget":"budget","cardType":"weighted","count":11},{"bracket":2,"budget":"any","cardType":"lands","count":3}]}]}}'

request_data = json.loads(request_body_str)

commander_url = request_data.get('commander_url')
config = request_data.get('config')

print(f"Commander URL: {commander_url}")
print(f"Config: {json.dumps(config, indent=2)}")

commander_slug = extract_commander_slug(commander_url)
print(f"\nExtracted slug: {commander_slug}")

try:
    packs = generate_packs(commander_slug, config, bracket=2)
    print(f"\nGenerated {len(packs)} packs:")
    for pack in packs:
        print(f"  - {pack['name']}: {len(pack['cards'])} cards")
        print(f"    Cards: {pack['cards'][:5]}...")  # First 5 cards
except Exception as e:
    print(f"\nERROR: {e}")
    import traceback
    traceback.print_exc()
