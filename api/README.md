# EDH Randomizer Pack Generator API

Backend API for generating EDH randomizer packs based on commander and pack configuration.

## Architecture

- **Frontend UI**: GitHub Pages (`https://edhrandomizer.github.io/`)
- **API Backend**: Vercel Serverless Functions (`https://edhrandomizer-api.vercel.app/`)

## Local Development

### Setup
```bash
cd edhrecscraper
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Test API Locally
```bash
python api/test_api_local.py
```

### Test with curl
```bash
curl -X POST http://localhost:3000/api/generate-packs \
  -H "Content-Type: application/json" \
  -d '{
    "commander_url": "https://edhrec.com/commanders/atraxa-grand-unifier",
    "config_url": null
  }'
```

## Deployment to Vercel

### First Time Setup
1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel`

### Subsequent Deploys
```bash
vercel --prod
```

Or set up automatic deployment:
1. Go to https://vercel.com
2. Import your GitHub repository
3. Every push to `main` will auto-deploy

## API Endpoint

**POST** `/api/generate-packs`

### Request
```json
{
  "commander_url": "https://edhrec.com/commanders/atraxa-grand-unifier",
  "config_url": "https://example.com/pack_config.json"
}
```

- `commander_url` (required): EDHRec commander URL
- `config_url` (optional): URL to pack configuration JSON. If omitted, uses default config.

### Response
```json
{
  "packs": [
    {
      "name": "Standard Pack #1",
      "cards": [
        "Card Name 1",
        "Card Name 2",
        "..."
      ]
    }
  ]
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

## Configuration Format

See `example_pack_config.json` in the EDHRandomizerPack project for full schema.

### Example Config
```json
{
  "packTypes": [
    {
      "name": "Standard Pack",
      "count": 5,
      "slots": [
        {
          "cardType": "weighted",
          "budget": "expensive",
          "bracket": 0,
          "count": 1
        },
        {
          "cardType": "weighted",
          "budget": "budget",
          "bracket": 0,
          "count": 11
        },
        {
          "cardType": "lands",
          "budget": "any",
          "bracket": 0,
          "count": 3
        }
      ]
    }
  ]
}
```

### cardType Options
- `"weighted"` - Use average deck type distribution
- `"random"` - Random card from all types
- `"creatures"`, `"instants"`, `"sorceries"`, etc. - Specific card type

### budget Options
- `"any"` - No budget filter
- `"budget"` - Budget cards
- `"expensive"` - Expensive cards

### bracket Options
- `0` - Use current UI selection
- `1` - Any/Exhibition
- `2` - Core
- `3` - Upgraded
- `4` - Optimized
- `5` - cEDH

## TODO
- [ ] Implement actual EDHRec API fetching
- [ ] Implement pack generation logic (port from Lua)
- [ ] Add card type weighting from average deck
- [ ] Add duplicate prevention
- [ ] Add error handling for invalid commanders
- [ ] Add caching layer
- [ ] Add rate limiting
