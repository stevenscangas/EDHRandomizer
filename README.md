# EDHREC Commander Randomizer# EDHREC Commander Randomizer



A tool to randomly select Magic: The Gathering commanders from EDHREC's popularity data.A Python tool to randomly select Magic: The Gathering commanders from EDHREC's top 4000 commanders list. Available as both a command-line interface (CLI) and graphical user interface (GUI).



![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)## Features

![Python](https://img.shields.io/badge/python-3.8+-blue.svg)

- 📊 Select random commanders from a specified rank range

## Features- 🎨 **Display card images** from Scryfall API in the GUI

- 🎨 Color filtering (exact colors, including colors, or at most colors)

- 🎲 **Random Commander Selection** - Select commanders from popularity rankings- 🔗 Automatically generates correct EDHREC URLs for each commander

- 📊 **Multiple Time Periods** - Weekly, Monthly, or 2-Year data- 🌐 Optional browser integration to open EDHREC pages automatically

- 🎨 **Color Filtering** - Filter by specific colors or number of colors- 🖥️ Both CLI and GUI interfaces available

- 🖼️ **Card Images** - Fetches card images from Scryfall API- ✨ Handles special cases:

- 🔗 **Direct Links** - Click cards to open EDHREC pages  - Partner commanders (with `//`)

- 🖥️ **Multiple Interfaces** - GUI, CLI, and Web API  - Apostrophes (e.g., Captain N'ghathrod → captain-nghathrod)

- 🌓 **Dark Mode** - Eye-friendly interface  - Accented characters (e.g., Khârn → kharn)

  - Quoted nicknames (e.g., Henzie "Toolbox" Torre)

## Quick Start  - Commas in names



### GUI Application (Recommended)## Installation



```bash### Basic Installation

python run_gui.py

```Ensure you have Python 3.6+ installed.



### Command-Line Interface### Install Dependencies (Recommended)



```bashFor the full GUI experience with card images:

python run_cli.py 1 300 3 --time-period Monthly

``````bash

pip install -r requirements.txt

### Web API```



```bashThis installs:

# Install Flask first: pip install flask flask-cors- **Pillow**: For displaying card images in the GUI

python run_web.py- **requests**: For fetching card data from Scryfall API

```

The tool will still work without these dependencies, but card images won't be displayed.

Then visit: http://localhost:5000

## Usage

## Installation

### GUI (Graphical Interface)

1. **Clone the repository**

```bashSimply run:

git clone https://github.com/yourusername/edhrecscraper.git```bash

cd edhrecscraperpython commander_gui.py

``````



2. **Create virtual environment** (recommended)The GUI provides:

```bash- Input fields for minimum rank, maximum rank, and quantity

python -m venv .venv- **Card image display** powered by Scryfall API (when Pillow is installed)

.venv\Scripts\activate  # Windows- Color filter checkboxes (W, U, B, R, G) with three filter modes:

source .venv/bin/activate  # Mac/Linux  - **Exactly These Colors**: Only commanders with exactly the selected colors

```  - **Including These Colors**: Commanders that include the selected colors (may have more)

  - **At Most These Colors**: Commanders with some or all of the selected colors

3. **Install dependencies**- Checkboxes for verbose output and automatic URL opening

```bash- A "Randomize" button to generate selections

pip install -r requirements.txt- Clickable URLs in the results area

```- Clear button to reset results



## Project Structure### CLI (Command-Line Interface)



```#### Basic Usage

edhrecscraper/```bash

├── src/                    # Source codepython random_commander.py <min_rank> <max_rank> <quantity>

│   ├── core/              # Core business logic```

│   ├── service/           # Service layer

│   ├── cli/               # Command-line interface#### Examples

│   ├── gui/               # Desktop GUI

│   └── web/               # Web APISelect 3 random commanders from the top 100:

├── data/                   # CSV data files```bash

├── assets/                 # Images and static filespython random_commander.py 1 100 3

├── tests/                  # Unit tests```

├── docs/                   # Documentation

├── scripts/                # Build and utility scriptsSelect 5 commanders with detailed information:

├── run_gui.py             # GUI entry point```bash

├── run_cli.py             # CLI entry pointpython random_commander.py 1 500 5 --verbose

└── run_web.py             # Web API entry point```

```

Select 2 commanders and open their EDHREC pages:

## Usage```bash

python random_commander.py 1 100 2 --open-urls

### GUI Application```



1. Launch: `python run_gui.py`Combine verbose mode with browser opening:

2. Select time period (Weekly/Monthly/2-Year)```bash

3. Set rank range (1 = most popular)python random_commander.py 50 200 3 -v -o

4. Choose quantity```

5. Optionally enable color filters

6. Click "🎲 Randomize"#### Command-Line Options

7. Click cards to open EDHREC pages

- `min_rank`: Minimum rank (inclusive)

### CLI Application- `max_rank`: Maximum rank (inclusive)

- `quantity`: Number of commanders to select

```bash- `--csv PATH`: Specify a different CSV file (default: edhrec.csv)

python run_cli.py <min_rank> <max_rank> <quantity> [options]- `--verbose` or `-v`: Show detailed commander information (rank, colors, CMC, rarity, type)

- `--open-urls` or `-o`: Automatically open EDHREC pages in your default browser

Options:

  --time-period, -t    Weekly, Monthly, or 2-Year (default: Monthly)## Files

  --colors, -c         Color filter (e.g., "W,U" or "R,G,B")

  --color-mode, -m     exactly, including, or atmost (default: exactly)- `commander_gui.py` - Graphical user interface with card image display

  --num-colors, -n     Exact number of colors (0 for colorless)- `random_commander.py` - Command-line interface and core logic

  --exclude-partners   Exclude partner commanders- `scryfall_api.py` - Scryfall API integration for fetching card images

  --verbose, -v        Show detailed information- `test_urls.py` - URL generation test suite

  --open-urls, -o      Open EDHREC pages in browser- `edhrec.csv` - Commander data (4000 commanders)

```- `requirements.txt` - Python package dependencies

- `README.md` - This file

**Examples:**

```bash## Output

# Get 5 commanders from ranks 1-100

python run_cli.py 1 100 5The tool displays:

- Commander name

# Get 3 Dimir (U/B) commanders- EDHREC URL (clickable in GUI)

python run_cli.py 1 500 3 --colors "U,B" --color-mode exactly- (With verbose mode) Rank, colors, CMC, rarity, and type



# Get colorless commanders## Testing

python run_cli.py 1 1000 5 --num-colors 0

```Run the test suite to verify URL generation:

```bash

### Web APIpython test_urls.py

```

Start the server:

```bashThis tests the URL conversion logic for edge cases like:

python run_web.py- Sisay, Weatherlight Captain

```- Frodo, Adventurous Hobbit // Sam, Loyal Attendant

- Captain N'ghathrod

**Endpoints:**- Khârn the Betrayer

- Henzie "Toolbox" Torre

- `GET /api/info` - Get CSV file information- Atraxa, Praetors' Voice

- `GET /api/time-periods` - Get available time periods

- `POST /api/randomize` - Randomize commanders## Examples

- `GET /api/commander-url?name=...` - Get EDHREC URL

- `GET /api/card-image-url?name=...` - Get Scryfall image URL### Find a random commander from the top 50

```bash

**Example Request:**python random_commander.py 1 50 1 -v -o

```bash```

curl -X POST http://localhost:5000/api/randomize \

  -H "Content-Type: application/json" \### Find 5 mid-tier commanders (ranks 500-1000)

  -d '{```bash

    "time_period": "Monthly",python random_commander.py 500 1000 5 -v

    "min_rank": 1,```

    "max_rank": 300,

    "quantity": 3,### Find a random commander from any rank

    "colors": "U,B",```bash

    "color_mode": "exactly"python random_commander.py 1 4000 1 -v -o

  }'```

```

## Tips

## Building Standalone Executable

- Use the GUI for a more user-friendly experience

Create a distributable .exe for Windows:- Use the CLI for scripting and automation

- Start with smaller rank ranges (1-100) for more popular commanders

```bash- Use larger ranges (1000-4000) to discover lesser-known commanders

cd scripts- Enable verbose mode to learn more about each commander

.\build_exe.bat- The "Open URLs" option is great for quickly browsing multiple commanders

.\create_distribution_package.bat

```Enjoy discovering new commanders! 🎲✨


The distribution folder will contain everything needed to run on any Windows machine without Python installed.

## Development

### Running Tests

```bash
python -m pytest tests/
```

### Code Structure

- **src/core/** - Pure business logic (no UI dependencies)
  - `commander_data.py` - Data loading and filtering
  - `url_utils.py` - URL generation
  - `scryfall_integration.py` - Scryfall API wrapper

- **src/service/** - Service layer (API for all frontends)
  - `commander_service.py` - High-level interface

- **src/cli/** - Command-line interface
- **src/gui/** - tkinter desktop application  
- **src/web/** - Flask REST API

### Adding a New Frontend

1. Create new directory in `src/`
2. Import and use `src.service.get_service()`
3. Call service methods (no direct core access needed)

Example:
```python
from src.service import get_service

service = get_service()
result = service.randomize(
    time_period='Monthly',
    min_rank=1,
    max_rank=300,
    quantity=3
)
```

## Data Files

The application includes three CSV files with EDHREC commander data:

- `top_commanders_week.csv` - Weekly popularity rankings
- `top_commanders_month.csv` - Monthly popularity rankings
- `top_commanders_2year.csv` - 2-Year popularity rankings

Update these files periodically to get the latest commander rankings.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Credits

- Data from [EDHREC.com](https://edhrec.com)
- Card images from [Scryfall API](https://scryfall.com)
- Built with Python and tkinter

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the [documentation](docs/)

---

**Enjoy randomizing commanders! 🎲✨**
