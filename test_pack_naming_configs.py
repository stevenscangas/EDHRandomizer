"""
Quick test to demonstrate pack naming with both configs
"""

import json
import sys
sys.path.insert(0, 'api')

from index import generate_packs

print("=" * 80)
print("PACK NAMING CONFIG TESTS")
print("=" * 80 + "\n")

# Test 1: Default naming (no custom names in config)
print("Test 1: API Auto-Naming (test_pack_naming_defaults.json)")
print("Using Atraxa (4-color) as commander for color filtering")
print("-" * 80)

with open('docs/pack_configs/test_pack_naming_defaults.json', 'r') as f:
    config1 = json.load(f)

packs1 = generate_packs('atraxa-grand-unifier', config1, bracket=2)
print("Expected names:")
print("  - Atraxa, Grand Unifier Pack - 4-Color Filtered - 1")
print("  - Atraxa, Grand Unifier Pack - 4-Color Filtered - 2")
print("  - Scryfall Pack - 4-Color Filtered - 1")
print("  - Scryfall Pack - 4-Color Filtered - 2")
print("  - Funny Pack - 1")
print("  - Funny Pack - 2")
print()
print("Actual names:")
for pack in packs1:
    print(f"  ✓ {pack['name']}")
print()

# Test 2: Custom naming (all names overridden)
print("Test 2: Config Override Naming (test_pack_naming_custom.json)")
print("Using Atraxa (4-color) as commander for color filtering")
print("-" * 80)

with open('docs/pack_configs/test_pack_naming_custom.json', 'r') as f:
    config2 = json.load(f)

packs2 = generate_packs('atraxa-grand-unifier', config2, bracket=2)
print("Expected names:")
print("  - Custom EDHRec Pack 1")
print("  - Custom EDHRec Pack 2")
print("  - Custom Scryfall Pack 1")
print("  - Custom Scryfall Pack 2")
print("  - Custom Moxfield Pack 1")
print("  - Custom Moxfield Pack 2")
print()
print("Actual names:")
for pack in packs2:
    print(f"  ✓ {pack['name']}")
print()

print("=" * 80)
print("Config files created in docs/pack_configs/:")
print("  - test_pack_naming_defaults.json (API auto-naming)")
print("  - test_pack_naming_custom.json (config overrides)")
print("=" * 80)
