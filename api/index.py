"""
EDH Randomizer Pack Generator API
Vercel Serverless Function

Endpoint: POST /api/index
"""

import json
import urllib.request
import re
from typing import Dict, List, Any, Optional
from http.server import BaseHTTPRequestHandler
from pack_generator import (
    fetch_edhrec_data,
    fetch_average_deck,
    process_cardlists,
    select_cards_by_type,
    select_random_cards,
    select_weighted_cards,
    select_cards_from_category
)


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
    
    packs = []
    global_used_cards = set()  # Track cards across all packs to prevent duplicates
    
    for pack_type in config.get('packTypes', []):
        pack_name = pack_type.get('name', 'Pack')
        pack_count = pack_type.get('count', 1)
        slots = pack_type.get('slots', [])
        
        for pack_index in range(pack_count):
            pack_cards = []
            pack_used_cards = set()  # Track cards within this pack
            
            # Fetch data for each unique bracket/budget combination in the slots
            data_cache = {}
            type_weights_cache = {}
            
            for slot in slots:
                bracket = slot.get('bracket', 0)
                budget = slot.get('budget', 'any')
                card_type = slot.get('cardType', 'weighted')
                count = slot.get('count', 1)
                
                # Cache key for this bracket/budget combo
                cache_key = f"{bracket}_{budget}"
                
                # Fetch data if not cached
                if cache_key not in data_cache:
                    edhrec_data = fetch_edhrec_data(commander_slug, bracket, budget)
                    
                    if edhrec_data and 'cardlists' in edhrec_data:
                        cards = process_cardlists(edhrec_data['cardlists'])
                        data_cache[cache_key] = cards
                    else:
                        data_cache[cache_key] = []
                
                # Fetch type weights if needed for weighted selection
                if card_type == 'weighted' and bracket not in type_weights_cache:
                    type_weights = fetch_average_deck(commander_slug, bracket)
                    type_weights_cache[bracket] = type_weights if type_weights else {}
                
                # Get cards for this slot
                cards_pool = data_cache.get(cache_key, [])
                
                if not cards_pool:
                    print(f"Warning: No cards available for {cache_key}")
                    continue
                
                # Select cards based on cardType
                selected = []
                used_set = global_used_cards.union(pack_used_cards)
                
                if card_type == 'weighted':
                    # Use average deck weights
                    weights = type_weights_cache.get(bracket, {})
                    selected = select_weighted_cards(cards_pool, count, weights, used_set)
                
                elif card_type == 'random':
                    # Random selection (equal probability)
                    selected = select_random_cards(cards_pool, count, used_set)
                
                elif card_type in ['lands', 'creatures', 'instants', 'sorceries', 'enchantments', 
                                    'planeswalkers', 'battles', 'utilityartifacts', 'manaartifacts',
                                    'newcards', 'highsynergycards', 'topcards', 'gamechangers']:
                    # Select from specific category
                    selected = select_cards_from_category(cards_pool, card_type, count, used_set)
                
                else:
                    # Specific card type (Creature, Instant, etc.)
                    selected = select_cards_by_type(cards_pool, card_type.capitalize(), count, used_set)
                
                # Add selected cards to pack
                pack_cards.extend(selected)
                pack_used_cards.update(selected)
            
            # Update global used cards
            global_used_cards.update(pack_used_cards)
            
            # Create pack result
            pack_result_name = f"{pack_name} #{pack_index + 1}" if pack_count > 1 else pack_name
            packs.append({
                "name": pack_result_name,
                "cards": pack_cards
            })
    
    return packs


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
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
