import requests
import json

# Test if the API is even accessible
api_url = "https://edhrecscraper.vercel.app/api/generate-packs"

print(f"Testing API endpoint: {api_url}")
print("Making GET request to see API docs...")
print("\n" + "="*80 + "\n")

response = requests.get(api_url)

print(f"Status Code: {response.status_code}")
print(f"Response Text: {response.text}")

if response.status_code == 200:
    try:
        print(f"\nJSON Response: {json.dumps(response.json(), indent=2)}")
    except:
        print("\nResponse is not JSON")
