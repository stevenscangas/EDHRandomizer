# EDH Randomizer Game Mode

A multiplayer, powerup-based Commander draft mode for EDH enthusiasts.

## Overview

The Game Mode adds a gamified experience to the EDH Randomizer Pack Generator:

1. **Lobby System**: Create or join game sessions with up to 4 players
2. **Powerup System**: Each player rolls a random powerup that modifies their packs
3. **Commander Selection**: Choose commanders with restrictions/bonuses based on powerups
4. **Pack Generation**: Automatically generate custom pack codes for TTS
5. **Real-time Updates**: See other players' progress as they lock in their choices

## Quick Start

### For Players

1. Visit https://edhrandomizer.github.io/random_commander_game.html
2. Click "Create New Game" or enter a session code to join
3. Wait for players to join (2-4 players)
4. Host clicks "Roll Powerups"
5. Select your commander based on your powerup restrictions
6. Lock in your commander
7. Copy your pack code and paste into TTS Pack Generator

### In Tabletop Simulator

1. Load the EDH Randomizer Pack Generator mod
2. Open the pack generator UI
3. Paste your session code into the "Game Mode Session Code" field
4. Click "Load Session"
5. Click "Generate Packs"

## Powerup System

Powerups are randomly assigned based on rarity weights:
- **Common** (55%): Small bonuses (1-3 extra packs, minor budget shifts)
- **Uncommon** (30%): Medium bonuses (color restrictions, 2-5 extra packs)
- **Rare** (12%): Strong bonuses (rank requirements, 5-8 extra packs)
- **Mythic** (3%): Extreme effects (random commander, 10+ packs, high budget)

### Example Powerups

**Bountiful Harvest** (Common)
- Draw 3 extra packs

**Rainbow Warrior** (Uncommon)
- Must choose 3+ color commander
- Get 2 extra packs

**Underdog** (Rare)
- Must choose commander ranked 500+
- Get 5 extra packs and budget tier +1

**Legendary Fortune** (Mythic)
- Draw 10 extra packs
- Increase budget tier by 2

## Technical Architecture

### Frontend (Static Site - GitHub Pages)

**Pages:**
- `docs/index.html` - Main commander randomizer
- `docs/random_commander_game.html` - Game mode lobby

**JavaScript Modules:**
- `powerupLoader.js` - Loads and randomly selects powerups
- `configGenerator.js` - Applies powerup effects to pack configs
- `sessionManager.js` - API calls and real-time polling
- `ui.js` - Manages lobby, selection, and pack code screens

**Data:**
- `data/powerups.json` - Powerup definitions with effects and rarities

### Backend (Vercel Serverless)

**API Endpoint:** `api/sessions.py`

**Routes:**
- `POST /api/sessions/create` - Create new game session
- `POST /api/sessions/join` - Join existing session
- `GET /api/sessions/{code}` - Get session data
- `POST /api/sessions/roll-powerups` - Roll powerups for all players (host only)
- `POST /api/sessions/lock-commander` - Lock in commander selection
- `POST /api/sessions/generate-pack-codes` - Generate pack codes (auto-triggered)
- `GET /api/sessions/pack/{code}` - Get pack config by pack code

**Storage:** In-memory (MVP) - sessions expire after 24 hours

### TTS Integration

**Files Modified:**
- `EDHRandomizerPack/ui/main.xml` - Added session code input field
- `EDHRandomizerPack/scripts/edh_randomizer_final.lua` - Added session loading (~60 lines)

**New Functions:**
- `onSessionCodeInput()` - Handle session code entry
- `onLoadSession()` - Fetch and apply session config

## Session Flow

```
1. Host Creates Session
   └─> API generates 5-char code (e.g., "AB3X9")
   └─> Returns session data with host player ID

2. Players Join
   └─> API adds player to session
   └─> Returns player ID and current session state
   └─> Polling starts (2-second intervals)

3. Host Rolls Powerups
   └─> API assigns random powerup to each player
   └─> All players see powerups instantly via polling
   └─> Session state changes to "selecting"

4. Players Select Commanders
   └─> UI validates against powerup restrictions
   └─> API stores commander URL and metadata
   └─> Other players see lock status via polling

5. All Players Locked
   └─> API auto-generates pack codes
   └─> Applies powerup effects to configs
   └─> Session state changes to "complete"
   └─> Pack codes displayed to all players

6. TTS Pack Spawning
   └─> Player pastes session code in TTS
   └─> TTS fetches pack config via API
   └─> Spawns packs with powerup modifications
```

## Data Structures

### Session Object
```json
{
  "sessionCode": "AB3X9",
  "hostId": "player123abc",
  "state": "waiting|rolling|selecting|complete",
  "players": [
    {
      "id": "player123abc",
      "number": 1,
      "powerup": {
        "id": "bountiful_harvest",
        "name": "Bountiful Harvest",
        "rarity": "common"
      },
      "commanderUrl": "https://edhrec.com/commanders/...",
      "commanderData": {
        "name": "Commander Name",
        "colors": ["W", "U"],
        "rank": 50,
        "saltScore": 1.5
      },
      "commanderLocked": true,
      "packCode": "A1B2C3D4",
      "packConfig": { /* Pack configuration */ }
    }
  ],
  "created_at": 1698765432,
  "updated_at": 1698765500
}
```

### Powerup Effects
```json
{
  "packQuantity": 3,              // Add 3 packs
  "packQuantityOverride": 2,      // Set total packs to 2
  "budgetTierShift": 1,           // Increase budget by 1 tier
  "commanderColorRestriction": "mono|multicolor",
  "minColors": 3,                 // Minimum color count
  "commanderRankMax": 100,        // Must be top 100
  "commanderRankMin": 500,        // Must be rank 500+
  "commanderSaltMin": 2.5,        // Salt score requirement
  "commanderRestriction": "tribal|partner",
  "randomCommander": true,        // Commander assigned randomly
  "colorComplexityWeight": {      // Modify card color distribution
    "mono": 1,
    "dual": 5,
    "triple": 15,
    "four": 25,
    "five": 35
  }
}
```

## Deployment

### Frontend
```bash
# Changes to docs/ are automatically deployed via GitHub Pages
git add docs/
git commit -m "Update game mode"
git push origin main
```

### Backend
```bash
# Vercel auto-deploys from main branch
git add api/ data/ vercel.json
git commit -m "Update session API"
git push origin main
```

### TTS Mod
```bash
cd EDH_TTS_Packs/EDHRandomizerPack
python build_mod.py
# Upload EDHRandomizerPack_fixed.json to Steam Workshop
```

## Future Enhancements

### Phase 2 (Backend Storage)
- Replace in-memory storage with Redis/Upstash
- Add WebSocket support for instant updates
- Session persistence and recovery

### Phase 3 (Features)
- Custom powerup creation
- Team draft mode (2v2)
- Powerup trading/swapping
- Commander bans/restrictions per lobby
- Pack opening animations in TTS

### Phase 4 (Social)
- User accounts and profiles
- Saved powerup presets
- Match history and statistics
- Leaderboards and achievements

## Development

### Adding New Powerups

Edit `data/powerups.json`:

```json
{
  "id": "new_powerup",
  "name": "Display Name",
  "rarity": "common|uncommon|rare|mythic",
  "description": "What it does",
  "flavor": "Italic flavor text",
  "effects": {
    "packQuantity": 2,
    "budgetTierShift": 1
  }
}
```

No code changes needed - powerups are loaded dynamically!

### Testing Locally

**Frontend:**
```bash
cd docs
python -m http.server 8000
# Visit http://localhost:8000/random_commander_game.html
```

**Backend:**
```bash
cd edhrecscraper
vercel dev
# API available at http://localhost:3000/api/sessions/
```

**TTS Mod:**
```bash
cd EDH_TTS_Packs/EDHRandomizerPack
python dev.py  # Builds and opens in TTS
```

## Troubleshooting

**Session not found:**
- Sessions expire after 24 hours
- Check session code spelling (case-insensitive)

**TTS session load fails:**
- Verify session code is exactly 5 characters
- Check API URL in sessionManager.js
- Look for CORS errors in browser console

**Powerups not loading:**
- Check `data/powerups.json` syntax
- Verify file path in powerupLoader.js
- Check browser console for fetch errors

**Polling not updating:**
- Default 2-second interval (see sessionManager.js)
- Check browser network tab for failed requests
- Verify API endpoint is responding

## License

MIT - See LICENSE file for details
