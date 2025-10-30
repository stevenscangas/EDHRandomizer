# EDH Randomizer Pack Generator - Next Steps

## ✅ Completed
1. Created API endpoint structure at `/api/generate-packs.py`
2. Implemented commander URL parsing
3. Implemented config loading (URL or default)
4. Created pack generation scaffold
5. Added functional tests
6. Created Vercel configuration

## 📋 What We Have Now

### API Structure
- **Endpoint**: POST `/api/generate-packs`
- **Input**: Commander URL + optional config URL  
- **Output**: Array of packs with card names
- **Functions**:
  - `extract_commander_slug()` - Parse commander from URL ✅
  - `load_config()` - Load JSON config from URL ✅
  - `get_default_config()` - Default pack structure ✅
  - `generate_packs()` - **TODO: Implement actual logic**

### Current Status
- Basic structure works
- Returns placeholder cards
- Ready for actual implementation

## 🚀 Next Steps

### 1. Implement Pack Generation Logic (3-4 hours)
Port the Lua logic from `edh_randomizer_final.lua` to Python:

- [ ] Fetch EDHRec API data (default, /budget, /expensive, average deck)
- [ ] Parse cardlists by category
- [ ] Implement weighted selection from average deck data
- [ ] Implement random selection (equal probability)
- [ ] Implement specific category selection
- [ ] Add duplicate prevention
- [ ] Handle bracket/budget URL construction

### 2. Deploy to Vercel (30 minutes)
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd c:\Users\scangas\Desktop\edhrecscraper
vercel --prod
```

Or set up automatic deployment from GitHub.

### 3. Update TTS Mod to Use API (2 hours)
Simplify the Lua code:
- Remove EDHRec fetching logic
- Remove pack building logic
- Add custom pack URL input field
- Call API endpoint with commander + config URLs
- Parse response and spawn cards from Scryfall

### 4. Optional: Build Pack Designer UI (4-6 hours later)
- Visual pack configuration builder
- Save/share configs
- Preview pack contents
- Host at `https://edhrandomizer.github.io/packs/`

## 📁 Files Created

```
edhrecscraper/
├── api/
│   ├── generate_packs.py      # Main API handler
│   ├── test_simple.py          # Functional tests
│   ├── test_api_local.py       # HTTP tests (can delete)
│   └── README.md               # API documentation
├── vercel.json                 # Vercel configuration
└── requirements-api.txt        # API dependencies (empty for now)
```

## 🎯 Immediate Next Action

Do you want to:
1. **Implement the pack generation logic** (port Lua → Python)?
2. **Deploy the current placeholder to Vercel** (test the deployment)?
3. **Start with TTS integration** (add URL input field)?
4. **Something else**?

The biggest task is #1 (implementing the actual logic), but we can test deployment first to make sure everything works end-to-end.
