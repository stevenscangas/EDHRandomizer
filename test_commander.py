import urllib.request
import json

commander_slug = "hearthhull-the-worldseed"
bracket_path = "/core"
budget_suffix = "/expensive"

url = f"https://json.edhrec.com/pages/commanders/{commander_slug}{bracket_path}{budget_suffix}.json"

print(f"Testing URL: {url}")

try:
    with urllib.request.urlopen(url, timeout=10) as response:
        data = json.loads(response.read().decode('utf-8'))
        
        if 'container' in data and 'json_dict' in data['container']:
            cardlists = data['container']['json_dict'].get('cardlists', [])
            print(f"Success! Got {len(cardlists)} cardlists")
            
            # Count total cards
            total_cards = 0
            for cardlist in cardlists:
                total_cards += len(cardlist.get('cardviews', []))
            print(f"Total cards: {total_cards}")
        else:
            print("ERROR: Unexpected data structure")
            print(json.dumps(data, indent=2)[:500])
            
except Exception as e:
    print(f"ERROR: {e}")
