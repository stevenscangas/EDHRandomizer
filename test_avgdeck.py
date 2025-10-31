import urllib.request
import json

commander_slug = "hearthhull-the-worldseed"
bracket_path = "/core"

url = f"https://edhrec.com/_next/data/hPTdkgKVPwypO51RvBDXB/average-decks/{commander_slug}{bracket_path}.json?commander={commander_slug}"

print(f"Testing average deck URL: {url}")

try:
    with urllib.request.urlopen(url, timeout=10) as response:
        data = json.loads(response.read().decode('utf-8'))
        
        print("Response keys:", list(data.keys()))
        
        if 'pageProps' in data and 'data' in data['pageProps']:
            deck_data = data['pageProps']['data']
            print("Success! Deck data:", deck_data)
        else:
            print("ERROR: Unexpected data structure")
            print(json.dumps(data, indent=2)[:500])
            
except Exception as e:
    print(f"ERROR: {e}")
