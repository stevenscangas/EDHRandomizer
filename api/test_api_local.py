"""
Test the pack generator API locally
"""

import json
import sys
import os

# Add parent directory to path to import the API module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.generate_packs import handler
from io import BytesIO


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


def create_handler(method, body=None):
    """Create a handler instance with mock request"""
    request = MockRequest(method, body)
    # Create handler with dummy parameters (required by BaseHTTPRequestHandler)
    h = handler(request.rfile, ('127.0.0.1', 8000), None)
    h.headers = request.headers
    h.wfile = request.wfile
    h.send_response = request.send_response
    h.send_header = request.send_header
    h.end_headers = request.end_headers
    return h, request


def test_get_request():
    """Test GET request (documentation)"""
    print("Testing GET request (API docs)...")
    h, request = create_handler('GET')
    h.do_GET()
def test_get_request():
    """Test GET request (documentation)"""
    print("Testing GET request (API docs)...")
    h, request = create_handler('GET')
    h.do_GET()
    
    response = json.loads(request.wfile.getvalue().decode('utf-8'))
    print(f"Status: {request.response_status}")
    print(f"Response:\n{json.dumps(response, indent=2)}\n")


def test_post_request_default_config():
    """Test POST request with default config"""
    print("Testing POST request with default config...")
    
    body = json.dumps({
        "commander_url": "https://edhrec.com/commanders/atraxa-grand-unifier"
    })
    
    h, request = create_handler('POST', body)
    h.do_POST()
    
    response = json.loads(request.wfile.getvalue().decode('utf-8'))
    print(f"Status: {request.response_status}")
    print(f"Response:\n{json.dumps(response, indent=2)}\n")


def test_post_request_custom_config():
    """Test POST request with custom config URL"""
    print("Testing POST request with custom config...")
    
    body = json.dumps({
        "commander_url": "https://edhrec.com/commanders/esika-god-of-the-tree",
        "config_url": "https://raw.githubusercontent.com/example/config.json"
    })
    
    h, request = create_handler('POST', body)
    h.do_POST()
    
    response = json.loads(request.wfile.getvalue().decode('utf-8'))
    print(f"Status: {request.response_status}")
    print(f"Response:\n{json.dumps(response, indent=2)}\n")


def test_invalid_url():
    """Test with invalid commander URL"""
    print("Testing invalid commander URL...")
    
    body = json.dumps({
        "commander_url": "https://invalid.com/test"
    })
    
    h, request = create_handler('POST', body)
    h.do_POST()
    
    response = json.loads(request.wfile.getvalue().decode('utf-8'))
    print(f"Status: {request.response_status}")
    print(f"Response:\n{json.dumps(response, indent=2)}\n")


if __name__ == '__main__':
    print("=" * 60)
    print("EDH Randomizer Pack Generator API - Local Tests")
    print("=" * 60 + "\n")
    
    test_get_request()
    test_post_request_default_config()
    test_post_request_custom_config()
    test_invalid_url()
    
    print("=" * 60)
    print("Tests complete!")
    print("=" * 60)
