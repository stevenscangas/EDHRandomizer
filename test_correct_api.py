import requests
import json

# Test with the ACTUAL API URL that TTS uses
api_url = "https://edhrandomizer-api.vercel.app/api/index"
config_url = "https://raw.githubusercontent.com/EDHRandomizer/EDHRandomizer.github.io/main/docs/pack_configs/test_pack_naming_defaults.json"

payload = {
    "commander_url": "https://edhrec.com/commanders/atraxa-grand-unifier",
    "config_url": config_url
}

print(f"Testing with CORRECT API URL: {api_url}")
print(f"Config URL: {config_url}")
print("\n" + "="*80 + "\n")

response = requests.post(api_url, json=payload)

print(f"Status Code: {response.status_code}")

if response.status_code == 200:
    result = response.json()
    packs = result.get('packs', [])
    print(f"Success! Received {len(packs)} pack(s)\n")
    for i, pack in enumerate(packs, 1):
        print(f"Pack {i}: {pack.get('name')}")
        print(f"  Cards: {len(pack.get('cards', []))}")
else:
    print(f"Error Response: {response.text}")
    try:
        print(f"JSON: {json.dumps(response.json(), indent=2)}")
    except:
        pass
