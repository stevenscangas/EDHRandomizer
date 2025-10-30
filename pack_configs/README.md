# Pack Configuration Examples

This folder contains example JSON configurations for customizing EDH pack generation.

## Available Configurations

### Basic Packs
- **`default.json`** - Standard mix (1 expensive + 11 budget + 3 lands)
- **`budget_friendly.json`** - All budget cards, 5 packs
- **`premium.json`** - All expensive cards, 3 packs

### Power Level Specific
- **`cedh.json`** - Competitive EDH focused (bracket 5)

### Archetype Focused
- **`creature_heavy.json`** - Heavy creature focus (10 creatures per pack)
- **`spellslinger.json`** - Instants and sorceries focused
- **`artifact_matters.json`** - Mana artifacts and utility artifacts

### Selection Strategy
- **`high_synergy.json`** - Uses high synergy and top cards categories
- **`mixed_variety.json`** - Multiple pack types with different power levels

## Using These Configs

### Option 1: Direct JSON in API Call
```python
import requests
import json

with open('pack_configs/default.json', 'r') as f:
    config = json.load(f)

response = requests.post('https://edhrandomizer-api.vercel.app/api/index', json={
    "commander_url": "https://edhrec.com/commanders/atraxa-grand-unifier",
    "config": config
})
```

### Option 2: Host JSON and Use URL
Upload the JSON file to a public URL and reference it:
```python
response = requests.post('https://edhrandomizer-api.vercel.app/api/index', json={
    "commander_url": "https://edhrec.com/commanders/atraxa-grand-unifier",
    "config_url": "https://example.com/my-pack-config.json"
})
```

## Configuration Schema

See the main project README for full schema documentation.

### Quick Reference

**Pack Type Fields:**
- `name` - Display name for the pack
- `count` - Number of packs to generate
- `slots` - Array of card slot definitions

**Slot Fields:**
- `cardType` - Selection strategy (weighted, random, creatures, etc.)
- `budget` - Price tier (any, budget, expensive)
- `bracket` - Power bracket ("any"=default, 1=exhibition, 2=core, 3=upgraded, 4=optimized, 5=cedh)
- `count` - Number of cards for this slot

### Available cardType Values
- `weighted` - Uses average deck distribution
- `random` - Equal probability
- `creatures`, `instants`, `sorceries`, `enchantments`, `planeswalkers`, `battles`
- `lands`, `utilityartifacts`, `manaartifacts`
- `newcards`, `highsynergycards`, `topcards`, `gamechangers`
