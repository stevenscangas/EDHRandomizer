# Updates Summary - Time Period Selector

## Changes Made

### 1. Multiple CSV Support
- Renamed `edhrec.csv` to `top_commanders_2year.csv`
- Added support for three time periods:
  - **Weekly** (`top_commanders_week.csv`)
  - **Monthly** (`top_commanders_month.csv`) - **DEFAULT**
  - **2-Year** (`top_commanders_2year.csv`)

### 2. GUI Updates

#### New Time Period Selector
- Added dropdown menu to select between Weekly/Monthly/2-Year data
- Defaults to "Monthly"
- Located in the Parameters section (first row)

#### Dynamic Max Rank Detection
- Automatically detects maximum rank from each CSV file
- Displays current max rank next to the rank range: "(Max: X)"
- Auto-adjusts max rank value if it exceeds the new limit when switching time periods

#### Updated Default Values
- Time Period: **Monthly**
- Rank Range: **1 to 300** (was 1-100)
- Quantity: **3** (unchanged)

### 3. Code Changes

#### `commander_gui.py`
- Added `csv_files` dictionary to store file paths and max ranks
- New `load_csv_max_ranks()` method - reads last rank from each CSV
- New `on_time_period_change()` method - updates UI when period changes
- Reorganized Parameters section into 2 rows:
  - Row 1: Time Period + Quantity
  - Row 2: Rank Range + Max indicator
- CSV file selection now based on time period dropdown

#### `build_exe.spec`
- Updated to include all 3 CSV files in the executable

#### `create_distribution_package.bat`
- Updated to copy all 3 CSV files to distribution folder

#### `DISTRIBUTION_README.txt`
- Updated to mention all 3 CSV files
- Added explanation of time period feature

### 4. How It Works

1. On startup, the app reads the last line of each CSV file to detect max rank
2. User selects time period from dropdown
3. Max rank label updates to show limit for selected period
4. When randomizing, uses the CSV file for selected time period
5. If user's max rank exceeds CSV limit, it's automatically adjusted

### 5. Testing

Run the GUI to test:
```bash
.\.venv\Scripts\python.exe commander_gui.py
```

Test scenarios:
- [ ] Switch between time periods - max rank updates
- [ ] Set rank range higher than max - auto-adjusts
- [ ] Randomize from each time period - uses correct CSV
- [ ] All 3 CSV files load correctly on startup

### 6. Building New Executable

To create updated .exe with all CSV files:
```bash
.\build_exe.bat
.\create_distribution_package.bat
```

Distribution folder will contain:
- `EDHREC_Commander_Randomizer.exe`
- `top_commanders_week.csv`
- `top_commanders_month.csv`
- `top_commanders_2year.csv`
- `edhreclogo.png`
- `README.txt`

### 7. Future Enhancements

Potential additions:
- Show number of commanders in each time period
- Cache loaded CSV data to avoid reloading
- Add tooltips explaining time periods
- Allow custom CSV file paths
