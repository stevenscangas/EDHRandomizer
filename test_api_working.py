import requests
import json

# Test with a simple EDHRec pack generation (known to work)
api_url = "https://edhrecscraper.vercel.app/api/generate-packs"

payload = {
    "commander_url": "https://edhrec.com/commanders/atraxa-grand-unifier"
}

print(f"Testing basic EDHRec pack generation")
print(f"API: {api_url}")
print(f"Commander: Atraxa, Grand Unifier")
print("\n" + "="*80 + "\n")

response = requests.post(api_url, json=payload)

print(f"Status Code: {response.status_code}")

if response.status_code == 200:
    result = response.json()
    packs = result.get('packs', [])
    print(f"Success! Received {len(packs)} pack(s)")
    for i, pack in enumerate(packs, 1):
        print(f"\nPack {i}: {pack.get('name')}")
        print(f"  Cards: {len(pack.get('cards', []))}")
        if pack.get('cards'):
            print(f"  First 3 cards: {', '.join(pack['cards'][:3])}")
else:
    print(f"Error: {response.text}")
