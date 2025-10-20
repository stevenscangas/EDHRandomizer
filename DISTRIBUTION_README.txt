# EDHREC Commander Randomizer - Distribution Package

## What's Included
- **EDHREC_Commander_Randomizer.exe** - The main application
- **top_commanders_week.csv** - Weekly top commanders data
- **top_commanders_month.csv** - Monthly top commanders data
- **top_commanders_2year.csv** - 2-year top commanders data
- **edhreclogo.png** - EDHREC logo (must be in same folder as exe)

**Note**: All CSV files must be in the same folder as the .exe

## How to Use

1. **Extract all files to a folder** - Make sure the .exe, .csv, and .png files are all in the same directory
2. **Run EDHREC_Commander_Randomizer.exe**
3. **Set your preferences:**
   - Time Period: Choose Weekly, Monthly, or 2-Year data (defaults to Monthly)
   - Quantity: How many commanders to randomize (default: 3)
   - Rank Range: Filter commanders by popularity (1 = most popular, default: 1-300)
   - Enable Color Filter (optional): Filter by specific colors and/or number of colors
   - Exclude partner commanders: Skip commanders with partner mechanic

4. **Click "🎲 Randomize"** to generate random commanders
5. **Click on card images** to open their EDHREC pages in your browser

## Features

- **Multiple Time Periods**: Choose from Weekly, Monthly, or 2-Year popularity data
- **Thousands of Commanders**: From most to least popular on EDHREC
- **Card Images**: Fetched from Scryfall API
- **Color Filtering**: 
  - Filter by specific colors (W, U, B, R, G)
  - Filter by exact number of colors (0 = colorless, 2 = exactly 2 colors, etc.)
  - Choose mode: Exactly, Including, or At Most
- **Dark Mode**: Eye-friendly interface
- **Clickable Cards**: Click any card to open its EDHREC page
- **Partner Filter**: Option to exclude partner commanders

## System Requirements

- **Windows 7 or later**
- **Internet connection** (for fetching card images from Scryfall)
- No Python installation required!

## Troubleshooting

**Problem**: Application won't start
- **Solution**: Make sure all files are in the same folder (exe, all 3 CSV files, and png)

**Problem**: Card images not loading
- **Solution**: Check your internet connection - images are fetched from Scryfall API

**Problem**: Windows SmartScreen warning
- **Solution**: This is normal for unsigned executables. Click "More info" then "Run anyway"

## Updates

To get the latest commander data, replace the CSV files with updated versions:
- `top_commanders_week.csv` - Weekly data
- `top_commanders_month.csv` - Monthly data  
- `top_commanders_2year.csv` - 2-Year data

## Credits

- Data from [EDHREC.com](https://edhrec.com)
- Card images from [Scryfall API](https://scryfall.com)
- Created with Python and tkinter

---

Enjoy randomizing commanders! 🎲✨
