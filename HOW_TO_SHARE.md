# How to Share Your Application

## What You Have

The folder `EDHREC_Commander_Randomizer_v1.0` contains everything needed to run your app:
- **EDHREC_Commander_Randomizer.exe** (30-40 MB) - The standalone application
- **edhrec.csv** - Commander database
- **edhreclogo.png** - Logo image
- **README.txt** - User instructions

## Distribution Methods

### Option 1: Zip File (Easiest)
1. Right-click the `EDHREC_Commander_Randomizer_v1.0` folder
2. Select "Send to > Compressed (zipped) folder"
3. Share the .zip file (approximately 30-40 MB)
4. Recipients extract and run the .exe

### Option 2: Cloud Storage
Upload the folder to:
- **Google Drive**: Share with link
- **Dropbox**: Share folder link
- **OneDrive**: Share link
- **GitHub Releases**: If you want version control

### Option 3: File Sharing Services
- **WeTransfer** (free up to 2GB)
- **MediaFire**
- **Mega.nz**

## Important Notes

### For Recipients (Windows Users):
1. **Windows SmartScreen Warning**: First-time users may see "Windows protected your PC"
   - This is NORMAL for unsigned executables
   - Click "More info" → "Run anyway"
   - This only happens the first time

2. **Antivirus Software**: Some antivirus programs may flag PyInstaller executables
   - This is a false positive (common with PyInstaller)
   - Add to exceptions if needed

3. **All Files Must Stay Together**: The .exe needs the .csv and .png files to work

### System Requirements:
- Windows 7 or later (32-bit or 64-bit)
- Internet connection (for fetching card images)
- No Python installation needed!

## Building Updates

To rebuild the executable after code changes:
1. Run `build_exe.bat` to create the .exe
2. Run `create_distribution_package.bat` to package everything
3. Share the new `EDHREC_Commander_Randomizer_v1.0` folder

## File Sizes
- Executable: ~30-40 MB (includes Python runtime and all libraries)
- CSV file: ~300 KB (commander data)
- Logo: ~20 KB
- Total package: ~30-40 MB

## Optional: Code Signing
To avoid SmartScreen warnings:
- Purchase a code signing certificate (~$70-300/year)
- Sign the executable with `signtool`
- This is optional and mainly for professional distribution

## Testing Before Sharing
1. Copy the `EDHREC_Commander_Randomizer_v1.0` folder to a different location
2. Run the .exe from there to ensure it works
3. Try it on another computer if possible

Enjoy sharing your app! 🎲
