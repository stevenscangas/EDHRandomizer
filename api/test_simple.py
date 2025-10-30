"""
Test the pack generator API locally
Simple functional tests without HTTP server complexity
"""

import json
import sys
import os

# Add parent directory to path to import the API module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.generate_packs import extract_commander_slug, get_default_config, generate_packs


def test_extract_commander_slug():
    """Test commander slug extraction"""
    print("Testing commander slug extraction...")
    
    tests = [
        ("https://edhrec.com/commanders/atraxa-grand-unifier", "atraxa-grand-unifier"),
        ("https://edhrec.com/commanders/esika-god-of-the-tree/core", "esika-god-of-the-tree"),
        ("https://edhrec.com/commanders/arabella-abandoned-doll/expensive", "arabella-abandoned-doll"),
        ("https://invalid.com/test", None),
    ]
    
    for url, expected in tests:
        result = extract_commander_slug(url)
        status = "✓" if result == expected else "✗"
        print(f"  {status} {url} -> {result}")
    print()


def test_default_config():
    """Test default configuration"""
    print("Testing default configuration...")
    config = get_default_config()
    print(f"  Pack types: {len(config['packTypes'])}")
    print(f"  First pack: {config['packTypes'][0]['name']}")
    print(f"  Slots in first pack: {len(config['packTypes'][0]['slots'])}")
    print()


def test_pack_generation():
    """Test pack generation with default config"""
    print("Testing pack generation with default config...")
    
    commander = "atraxa-grand-unifier"
    config = get_default_config()
    
    packs = generate_packs(commander, config)
    
    print(f"  Generated {len(packs)} pack(s)")
    for pack in packs:
        print(f"  - {pack['name']}: {len(pack['cards'])} cards")
        print(f"    First 3 cards: {', '.join(pack['cards'][:3])}")
    print()


def test_multi_pack_generation():
    """Test generating multiple packs of different types"""
    print("Testing multi-pack generation...")
    
    commander = "esika-god-of-the-tree"
    config = {
        "packTypes": [
            {"name": "Budget Pack", "count": 3, "slots": []},
            {"name": "Premium Pack", "count": 2, "slots": []}
        ]
    }
    
    packs = generate_packs(commander, config)
    
    print(f"  Generated {len(packs)} pack(s)")
    for pack in packs:
        print(f"  - {pack['name']}")
    print()


if __name__ == '__main__':
    print("=" * 60)
    print("EDH Randomizer Pack Generator API - Local Tests")
    print("=" * 60 + "\n")
    
    test_extract_commander_slug()
    test_default_config()
    test_pack_generation()
    test_multi_pack_generation()
    
    print("=" * 60)
    print("Tests complete!")
    print("=" * 60)
