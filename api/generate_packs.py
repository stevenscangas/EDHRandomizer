"""
EDH Randomizer Pack Generator API
Vercel Serverless Function

Endpoint: POST /api/generate-packs
Input: {
    "commander_url": "https://edhrec.com/commanders/atraxa-grand-unifier",
    "config_url": "https://example.com/pack_config.json" (optional)
}
Output: {
    "packs": [
        {
            "name": "Standard Pack",
            "cards": ["Card Name 1", "Card Name 2", ...]
        }
    ]
}
"""

from http.server import BaseHTTPRequestHandler
import json
import urllib.request
import urllib.parse
import re
from typing import Dict, List, Any, Optional


def extract_commander_slug(url: str) -> Optional[str]:
    """Extract commander slug from EDHRec URL"""
    # Match: https://edhrec.com/commanders/atraxa-grand-unifier[/anything]
    match = re.search(r'/commanders/([^/]+)', url)
    return match.group(1) if match else None


def load_config(config_url: str) -> Dict[str, Any]:
    """Load pack configuration from URL"""
    try:
        with urllib.request.urlopen(config_url) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        raise Exception(f"Failed to load config from {config_url}: {str(e)}")


def get_default_config() -> Dict[str, Any]:
    """Return default pack configuration"""
    return {
        "packTypes": [
            {
                "name": "Standard Pack",
                "count": 1,
                "slots": [
                    {"cardType": "weighted", "budget": "expensive", "bracket": 0, "count": 1},
                    {"cardType": "weighted", "budget": "budget", "bracket": 0, "count": 11},
                    {"cardType": "lands", "budget": "any", "bracket": 0, "count": 3}
                ]
            }
        ]
    }


def generate_packs(commander_slug: str, config: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate packs based on commander and configuration"""
    # TODO: Implement actual pack generation logic
    # For now, return a placeholder response
    
    packs = []
    
    for pack_type in config.get('packTypes', []):
        pack_name = pack_type.get('name', 'Pack')
        pack_count = pack_type.get('count', 1)
        
        for i in range(pack_count):
            # Placeholder: Generate dummy cards
            cards = [f"Placeholder Card {j+1}" for j in range(15)]
            
            packs.append({
                "name": f"{pack_name} #{i+1}" if pack_count > 1 else pack_name,
                "cards": cards
            })
    
    return packs


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        """Handle POST requests for pack generation"""
        try:
            # Read request body
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            request_data = json.loads(body.decode('utf-8'))
            
            # Extract parameters
            commander_url = request_data.get('commander_url')
            config_url = request_data.get('config_url')
            
            if not commander_url:
                self.send_error_response(400, "Missing commander_url parameter")
                return
            
            # Extract commander slug from URL
            commander_slug = extract_commander_slug(commander_url)
            if not commander_slug:
                self.send_error_response(400, "Invalid commander URL format")
                return
            
            # Load config (or use default)
            config = load_config(config_url) if config_url else get_default_config()
            
            # Generate packs
            packs = generate_packs(commander_slug, config)
            
            # Send response
            self.send_json_response(200, {"packs": packs})
            
        except Exception as e:
            self.send_error_response(500, f"Internal server error: {str(e)}")
    
    def do_GET(self):
        """Handle GET requests - return API documentation"""
        docs = {
            "endpoint": "/api/generate-packs",
            "method": "POST",
            "description": "Generate EDH randomizer packs based on commander and configuration",
            "input": {
                "commander_url": "https://edhrec.com/commanders/atraxa-grand-unifier",
                "config_url": "https://example.com/pack_config.json (optional)"
            },
            "output": {
                "packs": [
                    {
                        "name": "Standard Pack",
                        "cards": ["Card Name 1", "Card Name 2"]
                    }
                ]
            }
        }
        self.send_json_response(200, docs)
    
    def send_json_response(self, status_code: int, data: Dict[str, Any]):
        """Send JSON response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')  # Allow CORS
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def send_error_response(self, status_code: int, message: str):
        """Send error response"""
        self.send_json_response(status_code, {"error": message})
