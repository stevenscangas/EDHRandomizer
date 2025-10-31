"""Test deployed Vercel API with Moxfield"""
import urllib.request
import json

url = "https://edhrandomizer-api.vercel.app/api/index"

data = {
    "commander_url": "",
    "config": {
        "packTypes": [
            {
                "name": "Moxfield Test",
                "source": "moxfield",
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
}

json_data = json.dumps(data).encode('utf-8')

req = urllib.request.Request(
    url,
    data=json_data,
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req, timeout=30) as response:
        result = json.loads(response.read().decode('utf-8'))
    
    print("✅ API call successful!")
    print(f"\nPacks returned: {len(result.get('packs', []))}")
    
    for i, pack in enumerate(result.get('packs', []), 1):
        print(f"\nPack #{i}: {pack.get('name')}")
        cards = pack.get('cards', [])
        print(f"  Cards: {len(cards)}")
        print(f"  Sample: {', '.join(cards[:5])}")
        
except urllib.error.HTTPError as e:
    print(f"❌ HTTP Error {e.code}: {e.reason}")
    print(f"Response: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"❌ Error: {e}")
