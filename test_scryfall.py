"""
Test script for Scryfall API integration.
Tests fetching card data and images.
"""

import scryfall_api

def test_card_lookup():
    """Test basic card lookup functionality."""
    print("Testing Scryfall API Integration")
    print("=" * 50)
    
    # Test cases: various commander names
    test_commanders = [
        "Atraxa, Praetors' Voice",
        "The Ur-Dragon",
        "Korvold, Fae-Cursed King",
        "Sisay, Weatherlight Captain",
        "Muldrotha, the Gravetide"
    ]
    
    api = scryfall_api.ScryfallAPI()
    
    for name in test_commanders:
        print(f"\nTesting: {name}")
        print("-" * 50)
        
        # Test card data retrieval
        card_data = api.get_card_by_name(name)
        
        if card_data:
            print(f"✓ Card found!")
            print(f"  Oracle ID: {card_data.get('oracle_id')}")
            print(f"  Type: {card_data.get('type_line')}")
            print(f"  Mana Cost: {card_data.get('mana_cost', 'N/A')}")
            print(f"  Colors: {card_data.get('color_identity', [])}")
            
            # Test image URL retrieval
            image_url = api.get_card_image_url(name, version='normal')
            if image_url:
                print(f"✓ Image URL found: {image_url[:60]}...")
            else:
                print("✗ Image URL not found")
                
        else:
            print("✗ Card not found")
    
    print("\n" + "=" * 50)
    print("Test complete!")


def test_image_download():
    """Test downloading and displaying image data."""
    print("\nTesting Image Download")
    print("=" * 50)
    
    api = scryfall_api.ScryfallAPI()
    test_card = "Sol Ring"
    
    print(f"Attempting to download image for: {test_card}")
    
    pil_image = api.get_card_image(test_card, version='small')
    
    if pil_image:
        print(f"✓ Image downloaded successfully!")
        print(f"  Size: {pil_image.size[0]} x {pil_image.size[1]} pixels")
        print(f"  Format: {pil_image.format}")
        print(f"  Mode: {pil_image.mode}")
    else:
        print("✗ Failed to download image")
    
    print("=" * 50)


if __name__ == "__main__":
    try:
        test_card_lookup()
        print("\n")
        test_image_download()
        
    except ImportError as e:
        print(f"Error: Missing required package - {e}")
        print("\nPlease install required packages:")
        print("  pip install -r requirements.txt")
    except Exception as e:
        print(f"Error during testing: {e}")
        import traceback
        traceback.print_exc()
