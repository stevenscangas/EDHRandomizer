# EDHREC Commander Randomizer

A Python tool to randomly select Magic: The Gathering commanders from EDHREC's top 4000 commanders list. Available as both a command-line interface (CLI) and graphical user interface (GUI).

## Features

- 📊 Select random commanders from a specified rank range
- 🎨 **Display card images** from Scryfall API in the GUI
- 🎨 Color filtering (exact colors, including colors, or at most colors)
- 🔗 Automatically generates correct EDHREC URLs for each commander
- 🌐 Optional browser integration to open EDHREC pages automatically
- 🖥️ Both CLI and GUI interfaces available
- ✨ Handles special cases:
  - Partner commanders (with `//`)
  - Apostrophes (e.g., Captain N'ghathrod → captain-nghathrod)
  - Accented characters (e.g., Khârn → kharn)
  - Quoted nicknames (e.g., Henzie "Toolbox" Torre)
  - Commas in names

## Installation

### Basic Installation

Ensure you have Python 3.6+ installed.

### Install Dependencies (Recommended)

For the full GUI experience with card images:

```bash
pip install -r requirements.txt
```

This installs:
- **Pillow**: For displaying card images in the GUI
- **requests**: For fetching card data from Scryfall API

The tool will still work without these dependencies, but card images won't be displayed.

## Usage

### GUI (Graphical Interface)

Simply run:
```bash
python commander_gui.py
```

The GUI provides:
- Input fields for minimum rank, maximum rank, and quantity
- **Card image display** powered by Scryfall API (when Pillow is installed)
- Color filter checkboxes (W, U, B, R, G) with three filter modes:
  - **Exactly These Colors**: Only commanders with exactly the selected colors
  - **Including These Colors**: Commanders that include the selected colors (may have more)
  - **At Most These Colors**: Commanders with some or all of the selected colors
- Checkboxes for verbose output and automatic URL opening
- A "Randomize" button to generate selections
- Clickable URLs in the results area
- Clear button to reset results

### CLI (Command-Line Interface)

#### Basic Usage
```bash
python random_commander.py <min_rank> <max_rank> <quantity>
```

#### Examples

Select 3 random commanders from the top 100:
```bash
python random_commander.py 1 100 3
```

Select 5 commanders with detailed information:
```bash
python random_commander.py 1 500 5 --verbose
```

Select 2 commanders and open their EDHREC pages:
```bash
python random_commander.py 1 100 2 --open-urls
```

Combine verbose mode with browser opening:
```bash
python random_commander.py 50 200 3 -v -o
```

#### Command-Line Options

- `min_rank`: Minimum rank (inclusive)
- `max_rank`: Maximum rank (inclusive)
- `quantity`: Number of commanders to select
- `--csv PATH`: Specify a different CSV file (default: edhrec.csv)
- `--verbose` or `-v`: Show detailed commander information (rank, colors, CMC, rarity, type)
- `--open-urls` or `-o`: Automatically open EDHREC pages in your default browser

## Files

- `commander_gui.py` - Graphical user interface with card image display
- `random_commander.py` - Command-line interface and core logic
- `scryfall_api.py` - Scryfall API integration for fetching card images
- `test_urls.py` - URL generation test suite
- `edhrec.csv` - Commander data (4000 commanders)
- `requirements.txt` - Python package dependencies
- `README.md` - This file

## Output

The tool displays:
- Commander name
- EDHREC URL (clickable in GUI)
- (With verbose mode) Rank, colors, CMC, rarity, and type

## Testing

Run the test suite to verify URL generation:
```bash
python test_urls.py
```

This tests the URL conversion logic for edge cases like:
- Sisay, Weatherlight Captain
- Frodo, Adventurous Hobbit // Sam, Loyal Attendant
- Captain N'ghathrod
- Khârn the Betrayer
- Henzie "Toolbox" Torre
- Atraxa, Praetors' Voice

## Examples

### Find a random commander from the top 50
```bash
python random_commander.py 1 50 1 -v -o
```

### Find 5 mid-tier commanders (ranks 500-1000)
```bash
python random_commander.py 500 1000 5 -v
```

### Find a random commander from any rank
```bash
python random_commander.py 1 4000 1 -v -o
```

## Tips

- Use the GUI for a more user-friendly experience
- Use the CLI for scripting and automation
- Start with smaller rank ranges (1-100) for more popular commanders
- Use larger ranges (1000-4000) to discover lesser-known commanders
- Enable verbose mode to learn more about each commander
- The "Open URLs" option is great for quickly browsing multiple commanders

Enjoy discovering new commanders! 🎲✨
