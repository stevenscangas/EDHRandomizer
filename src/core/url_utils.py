"""
URL generation utilities for EDHREC commanders.
"""

import unicodedata


def normalize_name(name):
    """
    Normalize a commander name to URL-friendly format.
    
    Args:
        name: Commander name
        
    Returns:
        URL-friendly slug
    """
    # Remove commas
    name = name.replace(',', '')
    
    # Remove apostrophes
    name = name.replace("'", '')
    
    # Remove quotes (like in Henzie "Toolbox" Torre)
    name = name.replace('"', '')
    
    # Normalize unicode characters (accented letters to regular)
    # This handles characters like â, ê, á, etc.
    name = unicodedata.normalize('NFD', name)
    name = ''.join(char for char in name if unicodedata.category(char) != 'Mn')
    
    # Replace spaces with hyphens
    name = name.replace(' ', '-')
    
    # Convert to lowercase
    name = name.lower()
    
    return name


def commander_name_to_url(name):
    """
    Convert a commander name to an EDHREC URL.
    
    Args:
        name: Commander name (may include // for partners)
        
    Returns:
        Full EDHREC URL
    """
    # Handle partner commanders (with //)
    if '//' in name:
        # Split on // and process each side
        parts = name.split('//')
        # Strip whitespace and convert each part
        converted_parts = []
        for part in parts:
            part = part.strip()
            part = normalize_name(part)
            converted_parts.append(part)
        # Join with hyphen
        slug = '-'.join(converted_parts)
    else:
        slug = normalize_name(name)
    
    return f"https://edhrec.com/commanders/{slug}"
