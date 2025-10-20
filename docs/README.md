# EDHREC Commander Randomizer - GitHub Pages Edition

This is a **pure client-side JavaScript version** of the EDHREC Commander Randomizer that runs entirely in the browser - no server required!

## 🌐 Live Demo

Once deployed to GitHub Pages, this will be accessible at:
`https://stevenscangas.github.io/EDHRandomizer/`

## ✨ Features

- ✅ **100% Client-Side** - No Python/Flask backend needed
- ✅ **Identical Functionality** - Works exactly like the Flask version
- ✅ **GitHub Pages Ready** - Free hosting forever
- ✅ **No Wake-Up Time** - Always instant, never sleeps
- ✅ **Fast CDN Delivery** - Served from GitHub's global CDN

## 📁 Folder Structure

```
docs/
├── index.html          # Main HTML page
├── css/
│   └── style.css       # Styling (copied from Flask version)
├── js/
│   └── app.js          # Pure JavaScript implementation
├── data/
│   ├── top_commanders_week.csv
│   ├── top_commanders_month.csv
│   └── top_commanders_2year.csv
└── images/
    └── edhreclogo.png
```

## 🚀 How to Deploy to GitHub Pages

### Option 1: Using GitHub Web Interface (Easiest)

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add docs/
   git commit -m "Add GitHub Pages version"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub: https://github.com/stevenscangas/EDHRandomizer
   - Click **Settings** → **Pages** (in left sidebar)
   - Under "Source", select:
     - **Branch:** `main`
     - **Folder:** `/docs`
   - Click **Save**

3. **Wait 1-2 minutes** and visit:
   `https://stevenscangas.github.io/EDHRandomizer/`

### Option 2: Using Command Line

```bash
# Make sure you're in the project directory
cd c:\Users\scangas\Desktop\edhrecscraper

# Add all docs files
git add docs/

# Commit
git commit -m "Add pure JavaScript GitHub Pages version"

# Push to GitHub
git push origin main

# Then enable GitHub Pages in repository settings (see Option 1, step 2)
```

## 🎯 What Changed from Flask Version?

### No Changes to Existing Code! ✅

All your existing Python/Flask code remains untouched in:
- `src/web/api.py`
- `src/service/`
- `src/core/`
- etc.

### New Pure JavaScript Implementation

The `docs/` folder contains a **standalone version** that replicates:

1. **CSV Loading** (`loadCSV`) - Parses CSV files in browser
2. **Commander Filtering** (`filterByColors`) - Exact Python logic in JS
3. **Random Selection** (`selectRandomCommanders`) - Same algorithm
4. **URL Generation** (`commanderNameToUrl`) - Identical to `url_utils.py`
5. **Scryfall API** (`getCardImageUrl`) - Direct browser API calls
6. **All Validation** - Same color filter validation rules

## 🔄 How It Works

### Python Flask Version:
```
Browser → Flask API → Python Logic → Scryfall API → Response
```

### GitHub Pages Version:
```
Browser → Load CSV → JavaScript Logic → Scryfall API → Display
```

### Key Differences:

| Feature | Flask Version | GitHub Pages Version |
|---------|--------------|---------------------|
| **Backend** | Python/Flask | None (pure frontend) |
| **CSV Loading** | Server-side | Client-side fetch |
| **Hosting** | Needs server | Free GitHub CDN |
| **Sleep Mode** | Yes (on free tiers) | Never! |
| **Speed** | API roundtrip | Instant (local) |
| **Cost** | $0-7/month | $0 forever |

## 📝 Testing Locally

You can test the GitHub Pages version locally:

```bash
# Option 1: Python HTTP server
cd docs
python -m http.server 8000

# Then visit: http://localhost:8000

# Option 2: VS Code Live Server
# Right-click on docs/index.html → "Open with Live Server"
```

## 🔧 Updating Commander Data

When you update the CSV files:

```bash
# Update the data in the main data folder
# Then copy to docs
Copy-Item data\*.csv docs\data\ -Force

# Commit and push
git add docs/data/
git commit -m "Update commander data"
git push origin main

# GitHub Pages will auto-update in 1-2 minutes
```

## 🎨 Customization

All the same customization options work:
- Edit `docs/css/style.css` for styling
- Edit `docs/js/app.js` for behavior
- Files auto-update on GitHub Pages after push

## ⚡ Performance

- **First Load:** ~2-3 seconds (loading CSV files)
- **Subsequent Randomizations:** Instant (CSV cached in memory)
- **Image Loading:** Depends on Scryfall API (same as Flask version)

## 🆚 When to Use Which Version?

### Use GitHub Pages Version When:
- ✅ Sharing with friends publicly
- ✅ Want free hosting forever
- ✅ Don't need a backend API
- ✅ Want instant availability (no sleep)

### Use Flask Version When:
- ✅ Need server-side processing
- ✅ Want to add database features
- ✅ Need authentication/user accounts
- ✅ Building an API for other apps

## 🐛 Troubleshooting

### Images Not Loading?
- Check browser console for CORS errors
- Scryfall API should work fine (allows CORS)

### CSV Files Not Found?
- Make sure files are in `docs/data/`
- Check capitalization (case-sensitive on some servers)

### Page Not Updating?
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- GitHub Pages cache can take 1-2 minutes to update

## 📄 License

Same as the main project.

---

**Enjoy your free, always-on Commander Randomizer! 🎲**
