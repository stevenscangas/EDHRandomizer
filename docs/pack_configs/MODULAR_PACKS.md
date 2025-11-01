# Modular Pack Configuration Workflow

## Concept

Instead of creating one large JSON config file, you can organize individual pack definitions into separate files and manually compose them into bundles as needed.

## Workflow

### 1. Create Individual Pack Files

Organize pack definitions in separate JSON files for easy reuse:

```json
// creatures_budget.json
{
  "name": "Budget Creatures",
  "source": "scryfall",
  "count": 3,
  "useCommanderColorIdentity": true,
  "slots": [
    {
      "query": "https://scryfall.com/search?q=t:creature+usd<1",
      "count": 15,
      "colorComplexityWeighting": true
    }
  ]
}
```

```json
// removal_premium.json
{
  "name": "Premium Removal",
  "source": "scryfall",
  "count": 2,
  "useCommanderColorIdentity": true,
  "slots": [
    {
      "query": "https://scryfall.com/search?q=(t:instant+or+t:sorcery)+o:destroy+usd>5",
      "count": 15
    }
  ]
}
```

### 2. Compose into Bundle

When you want to use multiple packs together, manually compose them into a bundle:

```json
// my_draft_bundle.json
{
  "packTypes": [
    // Copy-paste from creatures_budget.json
    {
      "name": "Budget Creatures",
      "source": "scryfall",
      "count": 3,
      "useCommanderColorIdentity": true,
      "slots": [...]
    },
    // Copy-paste from removal_premium.json
    {
      "name": "Premium Removal",
      "source": "scryfall",
      "count": 2,
      "useCommanderColorIdentity": true,
      "slots": [...]
    }
  ]
}
```

### 3. Use in TTS

Paste the entire bundle JSON directly into the TTS Pack Config field. The UI will show `[JSON Config Loaded]` in green when successful.

## Benefits

- **Organization:** Keep pack definitions in separate files for clarity
- **Reusability:** Mix and match packs for different game nights
- **Version Control:** Track individual pack changes separately
- **Flexibility:** Create different bundles for different power levels or themes

## Suggested Directory Structure

```
docs/pack_configs/
  packs/              # Individual reusable pack definitions
    creatures/
    removal/
    lands/
    themes/
  bundles/            # Composed bundles (generated/manual)
  MODULAR_PACKS.md    # This file
```

## Future Enhancement

A simple Python build script could automate the composition process:

```python
# build_bundle.py (future)
import json
from pathlib import Path

pack_files = ["packs/creatures_budget.json", "packs/removal_premium.json"]
pack_types = [json.load(open(f)) for f in pack_files]
bundle = {"packTypes": pack_types}
print(json.dumps(bundle, indent=2))
```

Usage: `python build_bundle.py | clip` to copy bundle to clipboard, then paste into TTS.
