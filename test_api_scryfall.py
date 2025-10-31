"""
Test Scryfall pack via local API endpoint
"""

import json
import sys
import os
from io import BytesIO

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.index import handler


class MockRequest:
    """Mock HTTP request for testing"""
    def __init__(self, method, body=None):
        self.command = method
        self.headers = {'Content-Length': len(body) if body else 0}
        self.rfile = BytesIO(body.encode('utf-8') if body else b'')
        self.wfile = BytesIO()
        self.response_status = None
        self.response_headers = {}
    
    def send_response(self, status):
        self.response_status = status
    
    def send_header(self, key, value):
        self.response_headers[key] = value
    
    def end_headers(self):
        pass


def test_scryfall_pack():
    """Test Scryfall pack generation via API handler"""
    print("=== Testing Scryfall Pack via API Handler ===\n")
    
    # Load the banned cards config
    with open('docs/pack_configs/scryfall_banned_cards.json', 'r') as f:
        config = json.load(f)
    
    # Create request body
    body = json.dumps({
        "commander_url": "https://edhrec.com/commanders/atraxa-grand-unifier",
        "config": config
    })
    
    print(f"Request body:\n{body}\n")
    
    # Create mock request
    request = MockRequest('POST', body)
    
    # Create handler
    h = handler(request.rfile, ('127.0.0.1', 8000), None)
    h.headers = request.headers
    h.wfile = request.wfile
    h.send_response = request.send_response
    h.send_header = request.send_header
    h.end_headers = request.end_headers
    
    # Execute POST
    h.do_POST()
    
    # Get response
    response_data = request.wfile.getvalue().decode('utf-8')
    print(f"Status: {request.response_status}")
    print(f"Headers: {request.response_headers}")
    print(f"\nResponse:\n{response_data}\n")
    
    # Parse JSON response
    try:
        response = json.loads(response_data)
        print(f"Parsed response:\n{json.dumps(response, indent=2)}")
        
        if 'packs' in response:
            print(f"\n✓ Got {len(response['packs'])} pack(s)")
            for pack in response['packs']:
                print(f"  Pack '{pack['name']}': {len(pack['cards'])} cards")
        else:
            print(f"\n✗ No 'packs' key in response!")
            
    except json.JSONDecodeError as e:
        print(f"✗ Failed to parse JSON: {e}")


if __name__ == '__main__':
    test_scryfall_pack()
