# EDHRec Commander Data Scraper

Automated web scraper for EDHRec commander data using Playwright browser automation.

## Overview

This project automatically scrapes commander data from EDHRec for three different timeframes:
- **Past 2 Years** (`top_commanders_2year.csv`)
- **Past Month** (`top_commanders_month.csv`)
- **Past Week** (`top_commanders_week.csv`)

The data is automatically updated **every night at 4 AM UTC** via GitHub Actions.

## Features

- ✅ **Fully automated** - No manual CSV exports needed
- ✅ **Parallel scraping** - 3 jobs run simultaneously for faster updates
- ✅ **Stable & Reliable** - Uses Playwright (much more stable than Selenium)
- ✅ **Auto-deployment** - GitHub Pages automatically rebuilds with new data
- ✅ **Manual trigger** - Can run workflow on-demand from Actions tab

## Local Usage

### Prerequisites

```bash
pip install -r requirements.txt
playwright install chromium
```

### Running the Scraper

Scrape all timeframes:
```bash
python scrape_edhrec_playwright.py
```

Scrape a specific timeframe:
```bash
python scrape_edhrec_playwright.py --timeframe 2year
python scrape_edhrec_playwright.py --timeframe month
python scrape_edhrec_playwright.py --timeframe week
```

Show browser window (not headless):
```bash
python scrape_edhrec_playwright.py --no-headless
```

Custom output directory:
```bash
python scrape_edhrec_playwright.py --output-dir custom/path
```

## GitHub Actions Workflow

The workflow (`.github/workflows/update-commander-data.yml`) runs **3 parallel jobs**:

1. **scrape-2year** - Scrapes 2-year data
2. **scrape-month** - Scrapes month data  
3. **scrape-week** - Scrapes week data
4. **commit-changes** - Combines all CSVs and commits if changed

### Schedule

- **Automatic**: Every night at 4 AM UTC
  - 12 AM EST / 9 PM PST (previous day)
  - 1 AM EDT / 10 PM PDT (previous day)

### Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **Update Commander Data** workflow
3. Click **Run workflow** → **Run workflow**

### Why Parallel Jobs?

- **Faster**: All 3 timeframes scrape simultaneously (~2 min total instead of ~6 min)
- **More reliable**: If one timeframe fails, the others still complete
- **Better visibility**: Can see which timeframe failed in the job list

## How GitHub Pages Auto-Updates

When the scraper updates the CSV files:

1. **Scraper runs** → Downloads latest data from EDHRec (3 parallel jobs)
2. **CSVs updated** → New data written to `docs/data/*.csv`
3. **Bot commits** → GitHub Actions bot commits: "🤖 Update commander data - 2024-10-20 04:00:00 UTC"
4. **Pages rebuilds** → GitHub Pages detects commit in `/docs` folder
5. **Site deploys** → New files go live in ~1-2 minutes
6. **Users see updates** → Next page load fetches new CSV data

**No manual intervention needed!** 🎉

## Architecture

```
GitHub Actions (4 AM UTC)
    ↓
3 Parallel Jobs:
├─ scrape-2year  → top_commanders_2year.csv
├─ scrape-month  → top_commanders_month.csv  
└─ scrape-week   → top_commanders_week.csv
    ↓
commit-changes → Combines all CSVs → Commits to repo
    ↓
GitHub Pages → Rebuilds site
    ↓
JavaScript App → Loads updated CSV data
```

## Why Playwright?

We switched from Selenium to Playwright because:

- ✅ **Much more stable** - No connection reset errors
- ✅ **Better memory management** - Can handle 4000+ commanders
- ✅ **Built-in waiting** - Smarter element detection
- ✅ **Modern API** - Cleaner, more reliable code
- ✅ **Active development** - Better maintained than Selenium

## Data Format

The scraper maintains the exact CSV format from EDHRec exports:

```csv
Rank,Colors,CMC,Name,Rarity,Type,Card Kingdom,TCGPlayer,Face to Face,Cardmarket,Cardhoarder,Salt,Decks
1,W,U,B,R,G,9,The Ur-Dragon,mythic,Creature,29.99,35,21.39,29.14,0.03,1.97,39975
```

## Troubleshooting

### Workflow Fails
- Check the Actions tab for error logs
- Verify that Playwright can access EDHRec
- Ensure repository has write permissions enabled for Actions

### Data Not Updating
- Check if the workflow ran successfully in Actions tab
- Verify changes were detected (EDHRec data might not change daily)
- Clear browser cache if old data is still showing

### Local Test Fails
- Make sure you ran `playwright install chromium`
- Check that `docs/data/` directory exists
- Try running with `--no-headless` to see what's happening

## Configuration

### Change Schedule

Edit `.github/workflows/update-commander-data.yml`:

```yaml
schedule:
  - cron: '0 4 * * *'  # Change this line
```

Cron format: `minute hour day month weekday`
- `0 4 * * *` = 4 AM every day
- `0 */6 * * *` = Every 6 hours
- `0 0 * * 0` = Midnight every Sunday

### Change Commander Count

Edit `scrape_edhrec_playwright.py`, modify `max_clicks`:

```python
self.load_all_commanders(max_clicks=39)  # 39 clicks = ~4000 commanders
```

## Contributing

When modifying the scraper:
1. Test locally first with `python scrape_edhrec_playwright.py --timeframe week`
2. Verify CSV format matches expected structure
3. Check that frontend still loads data correctly
4. Commit changes and let GitHub Actions test the workflow

## License

This scraper respects EDHRec's data and is intended for personal/educational use with their publicly available data.
