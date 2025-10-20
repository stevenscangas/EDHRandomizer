"""
Scryfall API interface for fetching card data and images.
"""

import requests
import time
from typing import Optional, Dict, Any
from io import BytesIO
from PIL import Image

# Base URL for Scryfall API
SCRYFALL_API_BASE = "https://api.scryfall.com"

# Required headers per Scryfall API docs
HEADERS = {
    "User-Agent": "EDHRECRandomizer/1.0",
    "Accept": "*/*"
}

# Rate limiting: Scryfall asks for 50-100ms delay between requests
RATE_LIMIT_DELAY = 0.1  # 100ms


class ScryfallAPI:
    """Interface for Scryfall API requests."""
    
    def __init__(self):
        self.last_request_time = 0
    
    def _rate_limit(self):
        """Enforce rate limiting between requests."""
        current_time = time.time()
        time_since_last_request = current_time - self.last_request_time
        
        if time_since_last_request < RATE_LIMIT_DELAY:
            time.sleep(RATE_LIMIT_DELAY - time_since_last_request)
        
        self.last_request_time = time.time()
    
    def get_card_by_name(self, card_name: str, fuzzy: bool = True) -> Optional[Dict[str, Any]]:
        """
        Get card data from Scryfall by name.
        
        Args:
            card_name: The name of the card to search for
            fuzzy: If True, use fuzzy matching. If False, require exact match.
        
        Returns:
            Dictionary containing card data, or None if not found
        """
        self._rate_limit()
        
        # Prepare parameters
        params = {
            'fuzzy' if fuzzy else 'exact': card_name
        }
        
        try:
            response = requests.get(
                f"{SCRYFALL_API_BASE}/cards/named",
                params=params,
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 404:
                print(f"Card not found: {card_name}")
                return None
            else:
                print(f"Error fetching card: {response.status_code}")
                return None
                
        except requests.RequestException as e:
            print(f"Request error: {e}")
            return None
    
    def get_card_image_url(self, card_name: str, version: str = 'normal') -> Optional[str]:
        """
        Get the image URL for a card.
        For partner commanders (with //), returns the first partner's image URL.
        
        Args:
            card_name: The name of the card
            version: Image version - 'small', 'normal', 'large', 'png', 'art_crop', 'border_crop'
        
        Returns:
            URL to the card image, or None if not found
        """
        # For partner commanders, use just the first partner's name
        search_name = card_name
        if ' // ' in card_name:
            search_name = card_name.split(' // ')[0].strip()
        
        card_data = self.get_card_by_name(search_name)
        
        if not card_data:
            return None
        
        # Check for image_uris in main card object
        if 'image_uris' in card_data:
            return card_data['image_uris'].get(version)
        
        # For multi-faced cards, get the front face image
        if 'card_faces' in card_data and len(card_data['card_faces']) > 0:
            return card_data['card_faces'][0].get('image_uris', {}).get(version)
        
        return None
    
    def get_card_image(self, card_name: str, version: str = 'normal') -> Optional[Image.Image]:
        """
        Download and return a PIL Image object for a card.
        For partner commanders (with //), returns the first partner's image.
        
        Args:
            card_name: The name of the card
            version: Image version - 'small', 'normal', 'large', 'png', 'art_crop', 'border_crop'
        
        Returns:
            PIL Image object, or None if not found
        """
        # For partner commanders, use just the first partner's name
        search_name = card_name
        if ' // ' in card_name:
            search_name = card_name.split(' // ')[0].strip()
            print(f"Partner commander detected: using '{search_name}' for image search")
        
        image_url = self.get_card_image_url(search_name, version)
        
        if not image_url:
            return None
        
        self._rate_limit()
        
        try:
            response = requests.get(image_url, timeout=10)
            
            if response.status_code == 200:
                return Image.open(BytesIO(response.content))
            else:
                print(f"Error downloading image: {response.status_code}")
                return None
                
        except requests.RequestException as e:
            print(f"Request error: {e}")
            return None
        except Exception as e:
            print(f"Error processing image: {e}")
            return None
    
    def get_card_image_direct_url(self, card_name: str, version: str = 'normal') -> Optional[str]:
        """
        Get a direct redirect URL to the card image (without downloading the image data).
        This uses Scryfall's image format endpoint which returns an HTTP 302 redirect.
        
        Args:
            card_name: The name of the card
            version: Image version - 'small', 'normal', 'large', 'png', 'art_crop', 'border_crop'
        
        Returns:
            Direct URL to download the image
        """
        self._rate_limit()
        
        params = {
            'fuzzy': card_name,
            'format': 'image',
            'version': version
        }
        
        try:
            # Use allow_redirects=False to get the redirect URL
            response = requests.get(
                f"{SCRYFALL_API_BASE}/cards/named",
                params=params,
                headers=HEADERS,
                allow_redirects=False,
                timeout=10
            )
            
            if response.status_code == 302:
                return response.headers.get('Location')
            else:
                print(f"Error getting image URL: {response.status_code}")
                return None
                
        except requests.RequestException as e:
            print(f"Request error: {e}")
            return None


# Convenience function for quick usage
def fetch_card_image(card_name: str, version: str = 'normal') -> Optional[Image.Image]:
    """
    Convenience function to fetch a card image.
    
    Args:
        card_name: The name of the card
        version: Image version - 'small', 'normal', 'large', 'png', 'art_crop', 'border_crop'
    
    Returns:
        PIL Image object, or None if not found
    """
    api = ScryfallAPI()
    return api.get_card_image(card_name, version)


def get_card_image_url(card_name: str, version: str = 'normal') -> Optional[str]:
    """
    Convenience function to get a card image URL.
    
    Args:
        card_name: The name of the card
        version: Image version - 'small', 'normal', 'large', 'png', 'art_crop', 'border_crop'
    
    Returns:
        URL to the card image, or None if not found
    """
    api = ScryfallAPI()
    return api.get_card_image_url(card_name, version)
