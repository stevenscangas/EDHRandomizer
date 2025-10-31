import requests
import json

# Test the JSON config URL
config_url = "https://raw.githubusercontent.com/EDHRandomizer/EDHRandomizer.github.io/main/docs/pack_configs/test_pack_naming_defaults.json"

# Make request to the API
api_url = "https://edhrecscraper.vercel.app/api/generate-packs"

payload = {
    "commander_url": "https://edhrec.com/commanders/atraxa-grand-unifier",
    "config_url": config_url
}

print(f"Testing config URL: {config_url}")
print(f"Sending request to: {api_url}")
print(f"Payload: {json.dumps(payload, indent=2)}")
print("\n" + "="*80 + "\n")

response = requests.post(api_url, json=payload)

print(f"Status Code: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

# Check number of packs returned
if response.status_code == 200:
    packs = response.json().get('packs', [])
    print(f"\nTotal packs returned: {len(packs)}")
    for i, pack in enumerate(packs, 1):
        print(f"  Pack {i}: {pack.get('name')} - {len(pack.get('cards', []))} cards")
