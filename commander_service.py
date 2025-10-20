"""
Commander Randomizer Service Layer
This module provides high-level functions for commander selection.
Can be used by any frontend (GUI, Web, CLI, API).
"""

import random_commander
import scryfall_api


class CommanderService:
    """Service class for commander operations."""
    
    def __init__(self):
        self.csv_files = {
            'Weekly': 'top_commanders_week.csv',
            'Monthly': 'top_commanders_month.csv',
            '2-Year': 'top_commanders_2year.csv'
        }
        self.scryfall = None
        try:
            self.scryfall = scryfall_api.ScryfallAPI()
        except:
            pass  # Scryfall API optional
    
    def get_available_time_periods(self):
        """Get list of available time periods."""
        return list(self.csv_files.keys())
    
    def get_csv_info(self):
        """
        Get information about all CSV files.
        
        Returns:
            dict: {period: {'file': filename, 'max_rank': int, 'count': int}}
        """
        info = {}
        for period, csv_file in self.csv_files.items():
            try:
                commanders = random_commander.load_commanders(csv_file)
                max_rank = max(c['rank'] for c in commanders) if commanders else 0
                info[period] = {
                    'file': csv_file,
                    'max_rank': max_rank,
                    'count': len(commanders)
                }
            except Exception as e:
                info[period] = {
                    'file': csv_file,
                    'max_rank': 0,
                    'count': 0,
                    'error': str(e)
                }
        return info
    
    def randomize(self, 
                  time_period='Monthly',
                  min_rank=1,
                  max_rank=300,
                  quantity=3,
                  colors=None,
                  color_mode='exactly',
                  num_colors=None,
                  exclude_partners=False):
        """
        Randomize commanders with given parameters.
        
        Args:
            time_period: One of 'Weekly', 'Monthly', '2-Year'
            min_rank: Minimum rank (1+)
            max_rank: Maximum rank
            quantity: Number of commanders to select
            colors: Comma-separated color string (e.g., 'W,U,B') or None
            color_mode: 'exactly', 'including', or 'atmost'
            num_colors: Exact number of colors to filter by (0 for colorless) or None
            exclude_partners: Whether to exclude partner commanders
            
        Returns:
            dict: {
                'success': bool,
                'commanders': list of commander dicts,
                'total_available': int,
                'filter_description': str,
                'error': str (if success=False)
            }
        """
        try:
            # Get CSV file for time period
            csv_file = self.csv_files.get(time_period)
            if not csv_file:
                return {
                    'success': False,
                    'error': f'Invalid time period: {time_period}'
                }
            
            # Load commanders
            commanders = random_commander.load_commanders(csv_file)
            total_loaded = len(commanders)
            
            # Filter out partners if requested
            if exclude_partners:
                commanders = [c for c in commanders if ' // ' not in c['name']]
            
            # Build filter description
            filter_desc = f"{time_period} ranks {min_rank}-{max_rank}"
            if colors is not None or num_colors is not None:
                if num_colors is not None:
                    filter_desc += f" with exactly {num_colors} color(s)"
                    if colors:
                        mode_desc = {'exactly': 'exactly', 'including': 'including', 'atmost': 'at most'}
                        filter_desc += f" ({mode_desc[color_mode]}: {colors})"
                elif colors:
                    mode_desc = {'exactly': 'exactly', 'including': 'including', 'atmost': 'at most'}
                    filter_desc += f" with {mode_desc[color_mode]} colors: {colors}"
                elif colors == '':
                    filter_desc += " (colorless only)"
            
            if exclude_partners:
                filter_desc += " (excluding partners)"
            
            # Select random commanders
            selected = random_commander.select_random_commanders(
                commanders, min_rank, max_rank, quantity, colors, color_mode, num_colors
            )
            
            return {
                'success': True,
                'commanders': selected,
                'total_available': len(commanders),
                'total_loaded': total_loaded,
                'filter_description': filter_desc,
                'quantity_requested': quantity,
                'quantity_returned': len(selected)
            }
            
        except FileNotFoundError as e:
            return {
                'success': False,
                'error': f'CSV file not found: {csv_file}'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_commander_url(self, commander_name):
        """Get EDHREC URL for a commander."""
        return random_commander.commander_name_to_url(commander_name)
    
    def get_card_image(self, commander_name, version='normal'):
        """
        Get card image from Scryfall.
        
        Args:
            commander_name: Name of the commander
            version: Image version ('small', 'normal', 'large', 'png', etc.)
            
        Returns:
            PIL.Image or None
        """
        if not self.scryfall:
            return None
        
        try:
            return self.scryfall.get_card_image(commander_name, version)
        except Exception as e:
            print(f"Error fetching image for {commander_name}: {e}")
            return None
    
    def get_card_image_url(self, commander_name, version='normal'):
        """
        Get card image URL from Scryfall (without downloading).
        
        Args:
            commander_name: Name of the commander
            version: Image version ('small', 'normal', 'large', 'png', etc.)
            
        Returns:
            str: Image URL or None
        """
        if not self.scryfall:
            return None
        
        try:
            return self.scryfall.get_card_image_url(commander_name, version)
        except Exception as e:
            print(f"Error fetching image URL for {commander_name}: {e}")
            return None


# Singleton instance for convenience
_service_instance = None


def get_service():
    """Get singleton CommanderService instance."""
    global _service_instance
    if _service_instance is None:
        _service_instance = CommanderService()
    return _service_instance
