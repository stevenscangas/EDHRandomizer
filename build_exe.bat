@echo off
echo Building EDHREC Commander Randomizer executable...
echo.

REM Activate virtual environment
call .venv\Scripts\activate.bat

REM Build the executable
pyinstaller --clean build_exe.spec

echo.
echo Build complete!
echo Executable can be found in: dist\EDHREC_Commander_Randomizer.exe
echo.
pause
