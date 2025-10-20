"""
Entry point for the web API.
Run: python run_web.py
"""

if __name__ == '__main__':
    from src.web.api import app
    app.run(debug=True, port=5000)
