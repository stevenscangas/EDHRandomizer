"""
Launch the web-based Commander Randomizer UI.

This starts a Flask web server and serves the modern web interface
as an alternative to the tkinter GUI.

Usage:
    python run_web_ui.py

Then open your browser to: http://localhost:5000
"""

from src.web.api import app
import webbrowser
import threading
import time

def open_browser():
    """Open browser after a short delay."""
    time.sleep(1.5)
    webbrowser.open('http://localhost:5000')

if __name__ == '__main__':
    print("=" * 60)
    print("EDHREC Commander Randomizer - Web UI")
    print("=" * 60)
    print()
    print("Starting web server...")
    print()
    print("🌐 Web UI will be available at: http://localhost:5000")
    print("📚 API Documentation at: http://localhost:5000/api-docs")
    print()
    print("Press Ctrl+C to stop the server")
    print("=" * 60)
    print()
    
    # Open browser in background
    threading.Thread(target=open_browser, daemon=True).start()
    
    # Start Flask app
    app.run(debug=False, port=5000, host='0.0.0.0')
