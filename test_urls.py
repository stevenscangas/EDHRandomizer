import unicodedata

def commander_name_to_url(name):
    """Convert a commander name to an EDHREC URL slug."""
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


def normalize_name(name):
    """Normalize a commander name to URL-friendly format."""
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

# Test cases
test_cases = [
    ('Sisay, Weatherlight Captain', 'https://edhrec.com/commanders/sisay-weatherlight-captain'),
    ('Frodo, Adventurous Hobbit // Sam, Loyal Attendant', 'https://edhrec.com/commanders/frodo-adventurous-hobbit-sam-loyal-attendant'),
    ("Captain N'ghathrod", 'https://edhrec.com/commanders/captain-nghathrod'),
    ('Khârn the Betrayer', 'https://edhrec.com/commanders/kharn-the-betrayer'),
    ('Henzie "Toolbox" Torre', 'https://edhrec.com/commanders/henzie-toolbox-torre'),
    ("Atraxa, Praetors' Voice", 'https://edhrec.com/commanders/atraxa-praetors-voice'),
]

print("Testing URL Generation:")
print("=" * 80)
for name, expected in test_cases:
    result = commander_name_to_url(name)
    status = "✓" if result == expected else "✗"
    print(f"{status} {name}")
    print(f"  Generated: {result}")
    print(f"  Expected:  {expected}")
    if result != expected:
        print(f"  MISMATCH!")
    print()
