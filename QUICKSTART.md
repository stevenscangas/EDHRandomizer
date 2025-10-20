# Quick Start Guide - EDHREC Commander Randomizer with Card Images

## 🚀 Getting Started

### Step 1: Install Dependencies

Open PowerShell in the project directory and run:

```powershell
pip install -r requirements.txt
```

This will install:
- **Pillow** (for card images)
- **requests** (for Scryfall API)

### Step 2: Run the GUI

```powershell
python commander_gui.py
```

### Step 3: Test Scryfall Integration (Optional)

To verify the Scryfall API is working:

```powershell
python test_scryfall.py
```

## 🎮 Using the GUI

1. **Set Parameters:**
   - Enter minimum and maximum rank (1-4000)
   - Choose how many commanders you want
   - Optionally select color filters

2. **Color Filtering:**
   - Check the color boxes (W, U, B, R, G)
   - Choose filter mode:
     - **Exactly**: Only those colors, no more, no less
     - **Including**: Must have those colors, may have more
     - **At Most**: Can have some or all of those colors

3. **Click "Randomize":**
   - Results appear in the left panel
   - Card images load in the right panel
   - URLs are clickable

4. **Options:**
   - ✓ Show detailed information: Adds rank, colors, CMC, rarity, type
   - ✓ Open EDHREC pages in browser: Auto-opens commander pages

## 📊 Examples

### Find a Random Top 100 Commander
- Min Rank: 1
- Max Rank: 100
- Quantity: 1
- No color filters

### Find 3 Blue-Green Commanders
- Min Rank: 1
- Max Rank: 500
- Quantity: 3
- Check: U, G
- Mode: Exactly These Colors

### Discover Lesser-Known Commanders
- Min Rank: 1000
- Max Rank: 3000
- Quantity: 5

## 🔧 Troubleshooting

### "Card images not available"
This means Pillow isn't installed. Run:
```powershell
pip install Pillow
```

### "Image not found" for a specific card
Some commanders might have different names in Scryfall. The tool uses fuzzy matching, but occasionally names don't match perfectly.

### Slow image loading
The Scryfall API has rate limits (10 requests/second). Multiple images will load sequentially with small delays between each.

## 🎯 Tips

- **Start broad, then narrow:** Begin with wide rank ranges, then use color filters to narrow results
- **Popular commanders:** Ranks 1-100 are the most played commanders
- **Hidden gems:** Ranks 500-2000 have many underrated commanders
- **Color combinations:** Use "At Most" to find mono/two-color options
- **Save bandwidth:** Close the window after selecting to stop image loading if needed

## ⚙️ Advanced Usage

### Command Line (No Images)

For quick random selection without GUI:

```powershell
python random_commander.py 1 100 3 -v
```

Options:
- `-v` or `--verbose`: Show detailed info
- `-o` or `--open-urls`: Open in browser
- `--csv FILE`: Use different CSV file

### Color Filtering (CLI)

```powershell
# Exactly Blue-Green
python random_commander.py 1 500 3 --colors U,G --color-mode exactly

# Including Red
python random_commander.py 1 1000 5 --colors R --color-mode including

# At most White-Black
python random_commander.py 1 500 3 --colors W,B --color-mode atmost
```

## 📚 API Rate Limits

The Scryfall API requests:
- 50-100ms delay between requests
- Maximum ~10 requests per second
- The tool respects these limits automatically

## 🎨 Image Versions

The GUI uses "normal" size images (488×680 pixels) for good quality without excessive bandwidth.

Other available sizes:
- `small`: 146×204 (thumbnails)
- `normal`: 488×680 (default)
- `large`: 672×936 (high quality)
- `png`: 745×1040 (transparent, highest quality)
- `art_crop`: Just the artwork
- `border_crop`: Card with border cropped

To change the image version, edit `commander_gui.py` line ~270:
```python
pil_image = self.scryfall.get_card_image(card_name, version='large')
```

## 🌟 Features at a Glance

| Feature | GUI | CLI |
|---------|-----|-----|
| Random Selection | ✓ | ✓ |
| Rank Filtering | ✓ | ✓ |
| Color Filtering | ✓ | ✓ |
| Card Images | ✓ | ✗ |
| Clickable URLs | ✓ | ✗ |
| Auto-open Browser | ✓ | ✓ |
| Detailed Info | ✓ | ✓ |

Enjoy building your next Commander deck! 🎲✨
