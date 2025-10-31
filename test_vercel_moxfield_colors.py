"""
Test Moxfield with color filtering on deployed Vercel API
"""
import urllib.request
import json

# Test config with Moxfield deck and color filtering
config = {
    "commander_url": "https://edhrec.com/commanders/krenko-mob-boss",
    "config": {
        "packTypes": [
            {
                "name": "Moxfield Pool (Colored)",
                "source": "moxfield",
                "count": 2,
                "useCommanderColorIdentity": True,
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

url = "https://edhrandomizer-api.vercel.app/api"
headers = {"Content-Type": "application/json"}
data = json.dumps(config).encode('utf-8')

print("=" * 60)
print("Testing Moxfield Color Filtering on Vercel API")
print("=" * 60)
print(f"Commander: Krenko, Mob Boss (Red)")
print(f"Deck: Ph3OYF_lLkuBhDpiP1qwuQ")
print(f"Color Filter: ENABLED")
print()

try:
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
    
    print("✅ API call successful!")
    print()
    
    if 'packs' in result:
        for i, pack in enumerate(result['packs'], 1):
            cards = pack.get('cards', [])
            print(f"Pack #{i}: {len(cards)} cards")
            print(f"  Cards: {', '.join(cards[:5])}...")
            print()
        
        # Check that we got cards
        total_cards = sum(len(pack.get('cards', [])) for pack in result['packs'])
        print(f"Total cards across all packs: {total_cards}")
        
        # Based on local testing:
        # - Unfiltered: 106 cards
        # - Red filtered: 28 cards (26.4%)
        # We should get 2 packs of 15 cards each = 30 cards total
        # All should be red-legal (colorless or red)
        if total_cards == 30:
            print("✅ Got expected number of cards (30)")
        else:
            print(f"⚠️  Expected 30 cards, got {total_cards}")
            
    else:
        print("❌ No packs in response")
        print(json.dumps(result, indent=2))

except urllib.error.HTTPError as e:
    print(f"❌ HTTP Error {e.code}: {e.reason}")
    error_body = e.read().decode('utf-8')
    print(f"Response: {error_body}")
except Exception as e:
    print(f"❌ Error: {e}")

# Test 2: Same deck without color filtering
print("\n" + "=" * 60)
print("Testing Moxfield WITHOUT Color Filtering")
print("=" * 60)

config_no_filter = {
    "commander_url": "https://edhrec.com/commanders/krenko-mob-boss",
    "config": {
        "packTypes": [
            {
                "name": "Moxfield Pool (Unfiltered)",
                "source": "moxfield",
                "count": 2,
                "useCommanderColorIdentity": False,  # Explicitly disabled
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

data_no_filter = json.dumps(config_no_filter).encode('utf-8')

try:
    req = urllib.request.Request(url, data=data_no_filter, headers=headers, method='POST')
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
    
    print("✅ API call successful!")
    print()
    
    if 'packs' in result:
        for i, pack in enumerate(result['packs'], 1):
            cards = pack.get('cards', [])
            print(f"Pack #{i}: {len(cards)} cards")
            print(f"  Cards: {', '.join(cards[:5])}...")
            print()
        
        total_cards = sum(len(pack.get('cards', [])) for pack in result['packs'])
        print(f"Total cards across all packs: {total_cards}")
        
        if total_cards == 30:
            print("✅ Got expected number of cards (30)")
        else:
            print(f"⚠️  Expected 30 cards, got {total_cards}")

except Exception as e:
    print(f"❌ Error: {e}")
