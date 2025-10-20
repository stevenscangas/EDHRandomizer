# EDHREC Commander Randomizer

A Python tool to randomly select Magic: The Gathering commanders from EDHREC's top commanders list. Available as a web UI, desktop GUI, command-line interface, and REST API.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)

## Features

- 🎲 **Random Commander Selection** - Select commanders from popularity rankings
- 📊 **Multiple Time Periods** - Weekly, Monthly, or 2-Year data
- 🎨 **Color Filtering** - Filter by specific colors or number of colors
- 🖼️ **Card Images** - Fetches card images from Scryfall API
- 🔗 **Direct Links** - Click cards to open EDHREC pages
- 🖥️ **Multiple Interfaces** - Web UI, Desktop GUI, CLI, and REST API
- 🌓 **Dark Mode** - Eye-friendly interface
- 📱 **Responsive** - Web UI works on desktop, tablet, and mobile

## Quick Start

### Web UI (Recommended - Modern Browser Interface)

```bash
python run_web_ui.py
```

The browser will automatically open to http://localhost:5000

**Benefits:**
- Modern, responsive design
- Works on any device with a web browser
- No need to install tkinter or PIL
- Dark theme with smooth animations

### Desktop GUI (tkinter)

```bash
python run_gui.py
```

**Note:** Requires Pillow for card images: `pip install Pillow`

### Command-Line Interface

```bash
python run_cli.py 1 300 3 --time-period Monthly
```

### REST API (for developers)

```bash
python run_web.py
```

## Installation

### Basic Installation

Ensure you have Python 3.6+ installed.

### Install Dependencies (Recommended)

For full functionality with card images and web UI:

```bash
pip install -r requirements.txt
```

This installs:
- **Flask & Flask-CORS**: For the web UI and API
- **Pillow**: For displaying card images in the desktop GUI
- **requests**: For fetching card data from Scryfall API

The tool will still work without these dependencies, but some features won't be available.

## Project Structure

```
edhrecscraper/
├── src/                    # Source code
│   ├── core/              # Core business logic
│   ├── service/           # Service layer
│   ├── cli/               # Command-line interface
│   ├── gui/               # Desktop GUI (tkinter)
│   └── web/               # Web UI and REST API
│       ├── api.py         # Flask backend
│       ├── templates/     # HTML templates
│       └── static/        # CSS, JS, images
├── data/                   # CSV data files
├── assets/                 # Images and static files
├── tests/                  # Unit tests
├── docs/                   # Documentation
├── scripts/                # Build and utility scripts
├── run_web_ui.py          # Web UI launcher (recommended)
├── run_gui.py             # Desktop GUI launcher
├── run_cli.py             # CLI launcher
└── run_web.py             # API-only launcher
```

## Usage

### Web UI (Modern Browser-Based Interface)

1. Launch: `python run_web_ui.py`
2. Browser opens automatically to http://localhost:5000
3. Configure parameters:
   - **Time period** (Weekly/Monthly/2-Year)
   - **Rank range** (1 = most popular)
   - **Quantity** of commanders
   - **Color filters** (optional)
   - **Options** (verbose output, auto-open URLs, exclude partners)
4. Click "🎲 Randomize"
5. View card images and click to open EDHREC pages

**Features:**
- ✨ Responsive design for all screen sizes
- 🎨 MTG color-themed UI elements
- 🖼️ Card image previews from Scryfall
- 🔗 Click cards to open EDHREC pages
- 📊 Optional detailed text output
- 🌓 Dark theme

### Desktop GUI (tkinter)

1. Launch: `python run_gui.py`
2. Select time period (Weekly/Monthly/2-Year)
3. Set rank range (1 = most popular)
4. Choose quantity
5. Optionally enable color filters
6. Click "🎲 Randomize"
7. Click cards to open EDHREC pages

### CLI Application

#### Basic Usage

```bash
python run_cli.py <min_rank> <max_rank> <quantity> [options]
```

#### Options

- `--time-period, -t` - Weekly, Monthly, or 2-Year (default: Monthly)
- `--colors, -c` - Color filter (e.g., "W,U" or "R,G,B")
- `--color-mode, -m` - exactly, including, or atmost (default: exactly)
- `--num-colors, -n` - Exact number of colors (0 for colorless)
- `--exclude-partners` - Exclude partner commanders
- `--verbose, -v` - Show detailed information
- `--open-urls, -o` - Open EDHREC pages in browser

#### Examples

```bash
# Get 5 commanders from ranks 1-100
python run_cli.py 1 100 5

# Get 3 Dimir (U/B) commanders
python run_cli.py 1 500 3 --colors "U,B" --color-mode exactly

# Get colorless commanders
python run_cli.py 1 1000 5 --num-colors 0

# Get commanders and open in browser with details
python run_cli.py 50 200 3 -v -o
```

### Web API

Start the API server:

```bash
python run_web.py
```

**Endpoints:**

- `GET /` - Web UI homepage
- `GET /api-docs` - API documentation
- `GET /api/info` - Get CSV file information
- `GET /api/time-periods` - Get available time periods
- `POST /api/randomize` - Randomize commanders
- `GET /api/commander-url?name=...` - Get EDHREC URL
- `GET /api/card-image-url?name=...` - Get Scryfall image URL

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/randomize \
  -H "Content-Type: application/json" \
  -d '{
    "time_period": "Monthly",
    "min_rank": 1,
    "max_rank": 300,
    "quantity": 3,
    "colors": "U,B",
    "color_mode": "exactly"
  }'
```

## Data Files

The application includes three CSV files with EDHREC commander data:

- `top_commanders_week.csv` - Weekly popularity rankings
- `top_commanders_month.csv` - Monthly popularity rankings
- `top_commanders_2year.csv` - 2-Year popularity rankings

Update these files periodically to get the latest commander rankings.

## Special Cases Handled

The tool correctly handles:
- Partner commanders (with `//`)
- Apostrophes (e.g., Captain N'ghathrod → captain-nghathrod)
- Accented characters (e.g., Khârn → kharn)
- Quoted nicknames (e.g., Henzie "Toolbox" Torre)
- Commas in names

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
- **src/web/** - Flask web UI and REST API

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

## Building Standalone Executable

Create a distributable .exe for Windows:

```bash
cd scripts
.\build_exe.bat
.\create_distribution_package.bat
```

The distribution folder will contain everything needed to run on any Windows machine without Python installed.

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
- Built with Python, Flask, and tkinter

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the [documentation](docs/)

---

**Enjoy randomizing commanders! 🎲✨**
