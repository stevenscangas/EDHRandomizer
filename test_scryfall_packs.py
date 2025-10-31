"""
Test Scryfall pack generation locally
"""

import json
import sys
sys.path.insert(0, 'api')

from index import (
    convert_to_scryfall_api_url,
    build_scryfall_query,
    fetch_scryfall_cards,
    generate_packs
)

def test_url_conversion():
    """Test URL conversion"""
    print("=== Testing URL Conversion ===")
    
    # Test Scryfall URL
    scryfall_url = "https://scryfall.com/search?q=banned%3Acommander+-t%3Aconspiracy+-o%3Aante"
    api_url = convert_to_scryfall_api_url(scryfall_url)
    print(f"Scryfall URL: {scryfall_url}")
    print(f"API URL: {api_url}")
    print()
    
    # Test raw query
    raw_query = "t:creature cmc<=3"
    api_url = convert_to_scryfall_api_url(raw_query)
    print(f"Raw query: {raw_query}")
    print(f"API URL: {api_url}")
    print()

def test_query_building():
    """Test query building with color identity"""
    print("=== Testing Query Building ===")
    
    query = "t:creature cmc<=3"
    colors = ['W', 'U', 'B']
    
    # With color identity
    full_query = build_scryfall_query(query, colors, use_commander_color_identity=True)
    print(f"Base query: {query}")
    print(f"Colors: {colors}")
    print(f"With color filter: {full_query}")
    print()
    
    # Without color identity
    full_query = build_scryfall_query(query, colors, use_commander_color_identity=False)
    print(f"Without color filter: {full_query}")
    print()

def test_fetch_cards():
    """Test fetching cards from Scryfall"""
    print("=== Testing Card Fetch ===")
    
    # Test with banned cards (should be quick, not many results)
    query = "banned:commander -t:conspiracy -o:ante"
    print(f"Query: {query}")
    cards = fetch_scryfall_cards(query)
    print(f"Found {len(cards)} cards")
    print(f"First 10: {cards[:10]}")
    print()

def test_banned_pack():
    """Test generating banned cards pack"""
    print("=== Testing Banned Cards Pack Generation ===")
    
    # Load the config
    with open('docs/pack_configs/scryfall_banned_cards.json', 'r') as f:
        config = json.load(f)
    
    print(f"Config: {json.dumps(config, indent=2)}")
    print()
    
    # Generate packs
    print("Generating packs...")
    packs = generate_packs('atraxa-grand-unifier', config)
    
    print(f"Generated {len(packs)} pack(s)")
    for pack in packs:
        print(f"\nPack: {pack['name']}")
        print(f"Cards ({len(pack['cards'])}):")
        for card in pack['cards']:
            print(f"  - {card}")

if __name__ == '__main__':
    test_url_conversion()
    test_query_building()
    test_fetch_cards()
    test_banned_pack()
