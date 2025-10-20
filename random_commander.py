import csv
import random
import argparse
import webbrowser
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


def load_commanders(csv_file):
    """Load commanders from CSV file."""
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
    """Select random commanders within the specified rank range and color filter."""
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


def main():
    parser = argparse.ArgumentParser(
        description='Randomly select Magic: The Gathering commanders from a rank range'
    )
    parser.add_argument('min_rank', type=int, help='Minimum rank (inclusive)')
    parser.add_argument('max_rank', type=int, help='Maximum rank (inclusive)')
    parser.add_argument('quantity', type=int, help='Number of commanders to select')
    parser.add_argument('--csv', default='edhrec.csv', help='Path to CSV file (default: edhrec.csv)')
    parser.add_argument('--verbose', '-v', action='store_true', help='Show detailed information')
    parser.add_argument('--open-urls', '-o', action='store_true', help='Open EDHREC pages in browser')
    parser.add_argument('--colors', '-c', type=str, help='Color filter (e.g., "W,U" or "R,G,B")')
    parser.add_argument('--color-mode', '-m', type=str, 
                       choices=['exactly', 'including', 'atmost'],
                       default='including',
                       help='Color filter mode: exactly (exact colors), including (must include these), atmost (only these colors)')
    parser.add_argument('--num-colors', '-n', type=int, 
                       help='Filter by exact number of colors (e.g., 0 for colorless, 2 for exactly 2 colors)')
    
    args = parser.parse_args()
    
    # Validate inputs
    if args.min_rank < 1:
        print("Error: Minimum rank must be at least 1")
        return
    
    if args.max_rank < args.min_rank:
        print("Error: Maximum rank must be greater than or equal to minimum rank")
        return
    
    if args.quantity < 1:
        print("Error: Quantity must be at least 1")
        return
    
    # Load commanders
    print(f"Loading commanders from {args.csv}...")
    commanders = load_commanders(args.csv)
    print(f"Loaded {len(commanders)} commanders")
    
    # Build filter description
    filter_desc = f"ranks {args.min_rank}-{args.max_rank}"
    if args.num_colors is not None:
        filter_desc += f" with exactly {args.num_colors} color(s)"
        if args.colors:
            mode_desc = {
                'exactly': 'exactly',
                'including': 'including',
                'atmost': 'at most'
            }
            filter_desc += f" ({mode_desc[args.color_mode]}: {args.colors})"
    elif args.colors:
        mode_desc = {
            'exactly': 'exactly',
            'including': 'including',
            'atmost': 'at most'
        }
        filter_desc += f" with {mode_desc[args.color_mode]} colors: {args.colors}"
    
    # Select random commanders
    print(f"\nSelecting {args.quantity} random commander(s) from {filter_desc}...")
    selected = select_random_commanders(commanders, args.min_rank, args.max_rank, 
                                       args.quantity, args.colors, args.color_mode, args.num_colors)
    
    # Display results
    if selected:
        print(f"\n{'='*60}")
        print(f"Selected {len(selected)} Commander(s):")
        print(f"{'='*60}")
        for i, commander in enumerate(selected, 1):
            url = commander_name_to_url(commander['name'])
            print(f"\n{i}. {commander['name']}")
            if args.verbose:
                print(f"   Rank: {commander['rank']}")
                print(f"   Colors: {commander['colors'] if commander['colors'] else 'Colorless'}")
                print(f"   CMC: {commander['cmc']}")
                print(f"   Rarity: {commander['rarity']}")
                print(f"   Type: {commander['type']}")
            print(f"   URL: {url}")
            
            # Open URL in browser if requested
            if args.open_urls:
                webbrowser.open(url)
        
        print(f"\n{'='*60}")
        
        if args.open_urls:
            print(f"\nOpened {len(selected)} URL(s) in your default browser.")



if __name__ == '__main__':
    main()
