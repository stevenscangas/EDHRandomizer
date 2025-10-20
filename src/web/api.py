"""
Flask REST API for Commander Randomizer.
Example web backend that uses the service layer.

Install: pip install flask flask-cors

Run: python -m src.web.api
Then visit: http://localhost:5000
"""

from flask import Flask, jsonify, request, send_from_directory, render_template
from flask_cors import CORS
from src.service import get_service
import os

# Configure Flask app with proper paths
current_dir = os.path.dirname(os.path.abspath(__file__))
template_dir = os.path.join(current_dir, 'templates')
static_dir = os.path.join(current_dir, 'static')

app = Flask(__name__, 
            template_folder=template_dir,
            static_folder=static_dir,
            static_url_path='/static')
CORS(app)  # Enable CORS for web frontends

# Get service instance
service = get_service()


@app.route('/')
def index():
    """Serve the main web UI."""
    return render_template('index.html')


@app.route('/api-docs')
def api_docs():
    """Serve API documentation page."""
    return """
    <html>
    <head><title>Commander Randomizer API</title></head>
    <body>
        <h1>Commander Randomizer API</h1>
        <h2>Endpoints:</h2>
        <ul>
            <li><b>GET /api/info</b> - Get CSV file information</li>
            <li><b>GET /api/time-periods</b> - Get available time periods</li>
            <li><b>POST /api/randomize</b> - Randomize commanders</li>
            <li><b>GET /api/commander-url?name=...</b> - Get EDHREC URL for a commander</li>
            <li><b>GET /api/card-image-url?name=...&version=normal</b> - Get Scryfall image URL</li>
        </ul>
        
        <h3>Example POST /api/randomize:</h3>
        <pre>{
    "time_period": "Monthly",
    "min_rank": 1,
    "max_rank": 300,
    "quantity": 3,
    "colors": "U,B",
    "color_mode": "exactly",
    "num_colors": null,
    "exclude_partners": false
}</pre>
    </body>
    </html>
    """


@app.route('/api/info', methods=['GET'])
def get_info():
    """Get information about all CSV files."""
    info = service.get_csv_info()
    return jsonify(info)


@app.route('/api/time-periods', methods=['GET'])
def get_time_periods():
    """Get list of available time periods."""
    periods = service.get_available_time_periods()
    return jsonify({'time_periods': periods})


@app.route('/api/randomize', methods=['POST'])
def randomize():
    """
    Randomize commanders.
    
    Request body (JSON):
    {
        "time_period": "Monthly",
        "min_rank": 1,
        "max_rank": 300,
        "quantity": 3,
        "colors": "U,B" or null,
        "color_mode": "exactly",
        "num_colors": 2 or null,
        "exclude_partners": false
    }
    """
    data = request.get_json()
    
    # Extract parameters with defaults
    time_period = data.get('time_period', 'Monthly')
    min_rank = data.get('min_rank', 1)
    max_rank = data.get('max_rank', 300)
    quantity = data.get('quantity', 3)
    colors = data.get('colors')  # Can be None
    color_mode = data.get('color_mode', 'exactly')
    num_colors = data.get('num_colors')  # Can be None
    exclude_partners = data.get('exclude_partners', False)
    
    # Call service
    result = service.randomize(
        time_period=time_period,
        min_rank=min_rank,
        max_rank=max_rank,
        quantity=quantity,
        colors=colors,
        color_mode=color_mode,
        num_colors=num_colors,
        exclude_partners=exclude_partners
    )
    
    # Add URLs to commanders
    if result.get('success') and result.get('commanders'):
        for commander in result['commanders']:
            commander['edhrec_url'] = service.get_commander_url(commander['name'])
            commander['image_url'] = service.get_card_image_url(commander['name'])
    
    return jsonify(result)


@app.route('/api/commander-url', methods=['GET'])
def get_commander_url():
    """Get EDHREC URL for a commander name."""
    name = request.args.get('name')
    if not name:
        return jsonify({'error': 'Missing name parameter'}), 400
    
    url = service.get_commander_url(name)
    return jsonify({'name': name, 'url': url})


@app.route('/api/card-image-url', methods=['GET'])
def get_card_image_url():
    """Get Scryfall image URL for a commander."""
    name = request.args.get('name')
    version = request.args.get('version', 'normal')
    
    if not name:
        return jsonify({'error': 'Missing name parameter'}), 400
    
    url = service.get_card_image_url(name, version)
    if url:
        return jsonify({'name': name, 'version': version, 'image_url': url})
    else:
        return jsonify({'error': 'Could not fetch image URL'}), 404


if __name__ == '__main__':
    print("Commander Randomizer API")
    print("========================")
    print("API running at: http://localhost:5000")
    print("Documentation: http://localhost:5000")
    print("\nPress Ctrl+C to stop")
    app.run(debug=True, port=5000)
