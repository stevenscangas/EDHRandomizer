"""
Commander data loading and filtering utilities.
"""

import csv
import random
import os


def get_data_path(filename):
    """
    Get absolute path to a data file.
    
    Args:
        filename: Name of the file in the data directory
        
    Returns:
        Absolute path to the file
    """
    # Get the project root (3 levels up from this file)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(current_dir))
    data_dir = os.path.join(project_root, 'data')
    return os.path.join(data_dir, filename)


def load_commanders(csv_file):
    """
    Load commanders from CSV file.
    
    Args:
        csv_file: Path to CSV file (can be relative to data directory or absolute)
        
    Returns:
        List of commander dictionaries
    """
    # If it's just a filename, look in data directory
    if not os.path.isabs(csv_file) and not os.path.exists(csv_file):
        csv_file = get_data_path(csv_file)
    
    commanders = []
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Skip the undefined row and any invalid entries
            if row['Rank'] != 'undefined' and row['Name'] != 'undefined':
                try:
                    rank = int(row['Rank'])
                    commanders.append({
                        'rank': rank,
                        'name': row['Name'],
                        'colors': row['Colors'],
                        'cmc': row['CMC'],
                        'rarity': row['Rarity'],
                        'type': row['Type']
                    })
                except (ValueError, KeyError):
                    # Skip rows with invalid data
                    continue
    return commanders


def filter_by_colors(commanders, colors, mode, num_colors=None):
    """
    Filter commanders by color identity.
    
    Args:
        commanders: List of commander dictionaries
        colors: String of color letters (e.g., "W,U,B,R,G" or "U,R") or empty string for colorless
        mode: One of "exactly", "including", "atmost"
        num_colors: Optional integer to filter by exact number of colors (0 = colorless)
    
    Returns:
        Filtered list of commanders
    """
    # First filter by number of colors if specified
    if num_colors is not None:
        filtered = []
        for commander in commanders:
            commander_color_count = len([c for c in commander['colors'].replace(',', '').replace(' ', '') if c])
            if commander_color_count == num_colors:
                filtered.append(commander)
        commanders = filtered
        
        # If we only want colorless (0 colors) and no specific colors selected, return now
        if num_colors == 0:
            return commanders
    
    # Handle colorless filter explicitly
    if colors == '':
        # Looking for colorless commanders only
        return [c for c in commanders if c['colors'] == '']
    
    if colors is None:
        # No color filter at all
        return commanders
    
    # Parse the color set
    filter_colors = set(colors.upper().replace(',', '').replace(' ', ''))
    
    # If no colors specified but num_colors was used, we already filtered
    if not filter_colors:
        return commanders
    
    filtered = []
    for commander in commanders:
        commander_colors = set(commander['colors'].replace(',', '').replace(' ', ''))
        
        if mode == "exactly":
            # Commander must have exactly these colors (no more, no less)
            if commander_colors == filter_colors:
                filtered.append(commander)
        
        elif mode == "including":
            # Commander must include all specified colors (can have more)
            if filter_colors.issubset(commander_colors):
                filtered.append(commander)
        
        elif mode == "atmost":
            # Commander can only use colors from the specified set (subset or equal)
            if commander_colors.issubset(filter_colors):
                filtered.append(commander)
    
    return filtered


def select_random_commanders(commanders, min_rank, max_rank, quantity, colors=None, color_mode="including", num_colors=None):
    """
    Select random commanders within the specified rank range and color filter.
    
    Args:
        commanders: List of commander dictionaries
        min_rank: Minimum rank (inclusive)
        max_rank: Maximum rank (inclusive)
        quantity: Number of commanders to select
        colors: Color filter string or None
        color_mode: One of "exactly", "including", "atmost"
        num_colors: Exact number of colors or None
        
    Returns:
        List of randomly selected commanders
    """
    # Filter commanders by rank range
    filtered = [c for c in commanders if min_rank <= c['rank'] <= max_rank]
    
    # Apply color filter if specified
    if colors is not None or num_colors is not None:
        filtered = filter_by_colors(filtered, colors, color_mode, num_colors)
    
    if not filtered:
        print(f"No commanders found in rank range {min_rank}-{max_rank} with the specified color filter")
        return []
    
    if quantity > len(filtered):
        print(f"Warning: Only {len(filtered)} commanders available with current filters")
        print(f"Returning all {len(filtered)} commanders instead of {quantity}")
        quantity = len(filtered)
    
    # Randomly select the specified quantity
    selected = random.sample(filtered, quantity)
    return selected
