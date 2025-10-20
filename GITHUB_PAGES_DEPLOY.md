# 🚀 Quick Deploy to GitHub Pages

## You now have TWO versions of your app:

### 1️⃣ Flask Version (Original)
- Location: `src/web/` 
- Run with: `python run_web.py`
- Needs: Server hosting (Render, Railway, etc.)

### 2️⃣ GitHub Pages Version (New!)
- Location: `docs/`
- Run with: Just visit the URL!
- Needs: Nothing - it's free!

---

## Deploy in 3 Steps:

### Step 1: Push to GitHub

```bash
git add docs/
git commit -m "Add GitHub Pages version"
git push origin main
```

### Step 2: Enable GitHub Pages

1. Go to: https://github.com/stevenscangas/edhrecscraper/settings/pages
2. Under "Source":
   - **Branch:** `main`
   - **Folder:** `/docs`
3. Click **Save**

### Step 3: Visit Your Site!

Wait 1-2 minutes, then visit:
**https://stevenscangas.github.io/edhrecscraper/**

---

## 🎉 That's it!

Share that URL with your friends - it's:
- ✅ Free forever
- ✅ Fast (GitHub CDN)
- ✅ No sleep mode
- ✅ Always available

---

## 🧪 Test Locally First (Optional)

```bash
# Navigate to docs folder
cd docs

# Start a local server
python -m http.server 8000

# Visit in browser
http://localhost:8000
```

---

## 🔄 Updating Data

When you update the CSV files:

```bash
# Copy new data to docs
Copy-Item data\*.csv docs\data\ -Force

# Commit and push
git add docs/data/
git commit -m "Update commander data"
git push origin main
```

GitHub Pages will auto-update in 1-2 minutes!

---

**Questions? Check `docs/README.md` for full documentation.**
