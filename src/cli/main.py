"""
Command-line interface for Commander Randomizer.
Uses the service layer for all business logic.
"""

import argparse
import webbrowser
from src.service import get_service


def main():
    parser = argparse.ArgumentParser(
        description='Randomly select Magic: The Gathering commanders'
    )
    parser.add_argument('min_rank', type=int, help='Minimum rank (inclusive)')
    parser.add_argument('max_rank', type=int, help='Maximum rank (inclusive)')
    parser.add_argument('quantity', type=int, help='Number of commanders to select')
    parser.add_argument('--time-period', '-t', type=str, 
                       choices=['Weekly', 'Monthly', '2-Year'],
                       default='Monthly',
                       help='Time period for data (default: Monthly)')
    parser.add_argument('--verbose', '-v', action='store_true', help='Show detailed information')
    parser.add_argument('--open-urls', '-o', action='store_true', help='Open EDHREC pages in browser')
    parser.add_argument('--colors', '-c', type=str, help='Color filter (e.g., "W,U" or "R,G,B")')
    parser.add_argument('--color-mode', '-m', type=str, 
                       choices=['exactly', 'including', 'atmost'],
                       default='exactly',
                       help='Color filter mode: exactly (exact colors), including (must include these), atmost (only these colors)')
    parser.add_argument('--num-colors', '-n', type=int, 
                       help='Filter by exact number of colors (e.g., 0 for colorless, 2 for exactly 2 colors)')
    parser.add_argument('--exclude-partners', action='store_true', help='Exclude partner commanders')
    
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
    
    # Get service
    service = get_service()
    
    # Show CSV info
    print(f"Using {args.time_period} data...")
    csv_info = service.get_csv_info()
    period_info = csv_info.get(args.time_period, {})
    if 'error' in period_info:
        print(f"Error: {period_info['error']}")
        return
    
    print(f"Available commanders: {period_info.get('count', 0)} (Max rank: {period_info.get('max_rank', 0)})")
    
    # Randomize
    result = service.randomize(
        time_period=args.time_period,
        min_rank=args.min_rank,
        max_rank=args.max_rank,
        quantity=args.quantity,
        colors=args.colors,
        color_mode=args.color_mode,
        num_colors=args.num_colors,
        exclude_partners=args.exclude_partners
    )
    
    if not result['success']:
        print(f"Error: {result['error']}")
        return
    
    # Display results
    selected = result['commanders']
    filter_desc = result['filter_description']
    
    print(f"\nSelecting {args.quantity} commander(s) from {filter_desc}...")
    
    if selected:
        print(f"\n{'='*60}")
        print(f"Selected {len(selected)} Commander(s):")
        print(f"{'='*60}")
        for i, commander in enumerate(selected, 1):
            url = service.get_commander_url(commander['name'])
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
    else:
        print("No commanders found with the specified filters.")


if __name__ == '__main__':
    main()
