@echo off
echo Creating distribution package...
echo.

REM Create distribution folder
if not exist "EDHREC_Commander_Randomizer_v1.0" mkdir "EDHREC_Commander_Randomizer_v1.0"

REM Copy executable
echo Copying executable...
copy /Y "dist\EDHREC_Commander_Randomizer.exe" "EDHREC_Commander_Randomizer_v1.0\"

REM Copy required data files
echo Copying data files...
copy /Y "top_commanders_week.csv" "EDHREC_Commander_Randomizer_v1.0\"
copy /Y "top_commanders_month.csv" "EDHREC_Commander_Randomizer_v1.0\"
copy /Y "top_commanders_2year.csv" "EDHREC_Commander_Randomizer_v1.0\"
copy /Y "edhreclogo.png" "EDHREC_Commander_Randomizer_v1.0\"

REM Copy readme
echo Copying readme...
copy /Y "DISTRIBUTION_README.txt" "EDHREC_Commander_Randomizer_v1.0\README.txt"

echo.
echo Distribution package created!
echo Folder: EDHREC_Commander_Randomizer_v1.0
echo.
echo You can now:
echo 1. Test it by running the .exe in that folder
echo 2. Zip the entire folder to share with others
echo 3. Or upload the folder to Google Drive, Dropbox, etc.
echo.
pause
