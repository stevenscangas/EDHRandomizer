"""
EDHRec Commander Data Scraper using Playwright

More stable than Selenium for long-running scraping tasks.
"""

from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
import time
import shutil
from pathlib import Path


class EDHRecPlaywrightScraper:
    """Scraper for EDHRec commander data using Playwright."""
    
    URLS = {
        '2year': 'https://edhrec.com/commanders',
        'month': 'https://edhrec.com/commanders/month',
        'week': 'https://edhrec.com/commanders/week'
    }
    
    def __init__(self, output_dir: str = 'docs/data', headless: bool = True):
        """
        Initialize the Playwright scraper.
        
        Args:
            output_dir: Directory where CSV files will be saved
            headless: Run browser in headless mode (no UI)
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Set up download directory
        self.download_dir = Path.cwd() / 'temp_downloads'
        self.download_dir.mkdir(parents=True, exist_ok=True)
        
        self.headless = headless
        self.playwright = None
        self.browser = None
        self.context = None
        self.page = None
    
    def setup_browser(self):
        """Set up Playwright browser with appropriate options."""
        print("Setting up Playwright browser...")
        
        self.playwright = sync_playwright().start()
        
        # Launch Chromium (more stable than Chrome with Playwright)
        self.browser = self.playwright.chromium.launch(
            headless=self.headless,
            args=[
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox',
                '--disable-dev-shm-usage',
            ]
        )
        
        # Create context with download settings
        self.context = self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            accept_downloads=True,
        )
        
        # Set longer timeout (default is 30s)
        self.context.set_default_timeout(60000)  # 60 seconds
        
        self.page = self.context.new_page()
        print("✓ Browser ready")
    
    def wait_for_download(self, download, timeout: int = 60) -> Path:
        """
        Wait for a download to complete.
        
        Args:
            download: Playwright download object
            timeout: Maximum time to wait in seconds
            
        Returns:
            Path to the downloaded file
        """
        # Wait for download to complete
        downloaded_path = download.path()
        
        # Move to our download directory
        target_path = self.download_dir / download.suggested_filename
        shutil.move(downloaded_path, target_path)
        
        return target_path
    
    def click_table_view(self):
        """Click the table view button to show commanders in table format."""
        try:
            print("Looking for table view button...", end=" ", flush=True)
            
            # Wait for the table view button
            table_button = self.page.locator("button[data-rr-ui-event-key='table']")
            table_button.wait_for(state='visible', timeout=10000)
            
            # Check if already active
            if 'active' in (table_button.get_attribute('class') or ''):
                print("Already active!", flush=True)
                print("✓ Already in table view")
            else:
                print("Found it!", flush=True)
                print("Clicking...", end=" ", flush=True)
                table_button.click()
                print("Done!", flush=True)
                print("✓ Switched to table view")
            
            time.sleep(2)
            return True
            
        except Exception as e:
            print(f"\n⚠️  Could not switch to table view: {type(e).__name__}")
            print("Continuing anyway...")
            return False
    
    def load_all_commanders(self, target_count: int = 4000, max_clicks: int = 39):
        """
        Click 'Load More' button until at least target_count commanders are visible.
        
        Args:
            target_count: Minimum number of commanders to load
            max_clicks: Maximum number of times to click Load More
        """
        print(f"\nLoading commanders (target: {target_count}, max clicks: {max_clicks})...")
        clicks = 0
        
        while clicks < max_clicks:
            try:
                # Check current count
                print(f"  [{clicks}] Checking current commander count...", end=" ", flush=True)
                commanders = self.page.locator("tbody tr").all()
                current_count = len(commanders)
                print(f"Found {current_count} commanders")
                
                if current_count >= target_count:
                    print(f"✓ Reached target! Loaded {current_count} commanders")
                    break
                
                # Find Load More button
                print(f"  [{clicks}] Looking for Load More button...", end=" ", flush=True)
                load_more_button = self.page.get_by_role("button", name="Load More")
                
                # Check if button exists and is visible
                if not load_more_button.is_visible(timeout=5000):
                    print("Not found")
                    print(f"✓ No more data to load. Total: {current_count} commanders")
                    break
                
                print("Found it!", flush=True)
                
                # Scroll to button
                print(f"  [{clicks}] Scrolling to button...", end=" ", flush=True)
                load_more_button.scroll_into_view_if_needed()
                print("Done", flush=True)
                time.sleep(0.3)
                
                # Click the button
                print(f"  [{clicks}] Clicking Load More button...", end=" ", flush=True)
                load_more_button.click()
                clicks += 1
                print(f"Clicked! ({clicks}/{max_clicks})", flush=True)
                
                # Progress summary
                if clicks % 5 == 0:
                    print(f"  ━━━ Progress: {clicks}/{max_clicks} clicks, ~{current_count} commanders ━━━")
                
                # Wait for content to load
                print(f"  [{clicks}] Waiting for content to load...", flush=True)
                time.sleep(0.8)
                
            except PlaywrightTimeout:
                commanders = self.page.locator("tbody tr").all()
                print(f"\n✓ No more Load More button. Total: {len(commanders)} commanders")
                break
            except Exception as e:
                print(f"\n❌ Error: {type(e).__name__}: {str(e)[:100]}")
                try:
                    commanders = self.page.locator("tbody tr").all()
                    print(f"Stopped at {clicks} clicks with {len(commanders)} commanders")
                except:
                    print(f"Stopped at {clicks} clicks")
                break
        
        if clicks >= max_clicks:
            try:
                commanders = self.page.locator("tbody tr").all()
                print(f"✓ Reached max clicks ({max_clicks}). Total: {len(commanders)} commanders")
            except:
                print(f"✓ Reached max clicks ({max_clicks})")
    
    def export_csv(self, timeframe_key: str):
        """Click the Export CSV button and wait for download."""
        try:
            print("\n" + "="*60)
            print("Starting CSV export process...")
            print("="*60)
            
            # Find Export CSV button
            print("Looking for Export CSV button...", end=" ", flush=True)
            export_button = self.page.locator("button.react-bs-table-csv-btn")
            export_button.wait_for(state='visible', timeout=10000)
            print("Found it!", flush=True)
            
            # Scroll to button
            print("Scrolling to Export button...", end=" ", flush=True)
            export_button.scroll_into_view_if_needed()
            time.sleep(0.5)
            print("Done", flush=True)
            
            # Set up download promise before clicking
            print("Clicking Export CSV button...", end=" ", flush=True)
            
            with self.page.expect_download() as download_info:
                export_button.click()
            
            download = download_info.value
            print("Clicked!", flush=True)
            print("✓ Export CSV button clicked successfully")
            
            # Wait for download
            print("Waiting for file download...", flush=True)
            downloaded_file = self.wait_for_download(download)
            print(f"✓ Downloaded: {downloaded_file.name} ({downloaded_file.stat().st_size} bytes)")
            
            # Move to output directory with correct name
            output_file = self.output_dir / f"top_commanders_{timeframe_key}.csv"
            shutil.move(str(downloaded_file), str(output_file))
            print(f"✓ Saved to: {output_file}")
            
            return output_file
            
        except Exception as e:
            print(f"\n❌ Error exporting CSV: {type(e).__name__}: {str(e)[:100]}")
            return None
    
    def scrape_timeframe(self, timeframe_key: str) -> bool:
        """
        Scrape commanders for a specific timeframe.
        
        Args:
            timeframe_key: The timeframe identifier (2year, month, week)
            
        Returns:
            True if successful, False otherwise
        """
        url = self.URLS.get(timeframe_key)
        if not url:
            print(f"Error: Invalid timeframe '{timeframe_key}'")
            return False
        
        print(f"\n{'='*60}")
        print(f"Scraping {timeframe_key}...")
        print(f"URL: {url}")
        print(f"{'='*60}")
        
        try:
            # Clear download directory
            print("Clearing download directory...", end=" ", flush=True)
            for file in self.download_dir.glob('*.csv'):
                file.unlink()
            print("Done", flush=True)
            
            # Load the page
            print(f"Loading page: {url}")
            self.page.goto(url, wait_until='networkidle')
            print("✓ Page loaded")
            time.sleep(2)
            
            # Switch to table view
            print("\n--- Switching to Table View ---")
            self.click_table_view()
            
            # Load all commanders
            print("\n--- Loading Commanders ---")
            self.load_all_commanders(target_count=4000, max_clicks=39)
            
            # Check final count
            try:
                final_commanders = self.page.locator("tbody tr").all()
                final_count = len(final_commanders)
                print(f"\n✓ Total commanders loaded: {final_count}")
                
                if final_count < 1000:
                    print(f"⚠️  Warning: Only {final_count} commanders loaded (expected ~4000)")
            except:
                print("  Could not verify final count")
            
            # Export CSV
            print("\n--- Exporting CSV ---")
            output_file = self.export_csv(timeframe_key)
            
            if output_file and output_file.exists():
                print(f"\n{'='*60}")
                print(f"✓ SUCCESS! Scraped {timeframe_key}")
                print(f"{'='*60}")
                return True
            else:
                print(f"\n{'='*60}")
                print(f"✗ FAILED to scrape {timeframe_key}")
                print(f"{'='*60}")
                return False
                
        except Exception as e:
            print(f"\n✗ Error scraping {timeframe_key}: {type(e).__name__}: {str(e)[:200]}")
            return False
    
    def scrape_all(self) -> bool:
        """
        Scrape all timeframes.
        
        Returns:
            True if all scrapes successful, False otherwise
        """
        print("=" * 60)
        print("EDHRec Commander Data Scraper (Playwright)")
        print("=" * 60)
        
        try:
            self.setup_browser()
            success_count = 0
            
            for timeframe_key in self.URLS.keys():
                if self.scrape_timeframe(timeframe_key):
                    success_count += 1
                time.sleep(3)  # Be polite between requests
            
            print("\n" + "=" * 60)
            print(f"Completed: {success_count}/{len(self.URLS)} timeframes successful")
            print("=" * 60)
            
            return success_count == len(self.URLS)
            
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Clean up browser and temporary files."""
        print("\nCleaning up...")
        
        if self.page:
            self.page.close()
        if self.context:
            self.context.close()
        if self.browser:
            self.browser.close()
        if self.playwright:
            self.playwright.stop()
        
        # Clean up temp directory
        try:
            if self.download_dir.exists():
                shutil.rmtree(self.download_dir)
        except:
            pass
        
        print("✓ Cleanup complete")


def main():
    """Main entry point for the scraper."""
    import argparse
    import sys
    
    parser = argparse.ArgumentParser(description='Scrape EDHRec commander data using Playwright')
    parser.add_argument(
        '--output-dir',
        default='docs/data',
        help='Output directory for CSV files (default: docs/data)'
    )
    parser.add_argument(
        '--timeframe',
        choices=['2year', 'month', 'week', 'all'],
        default='all',
        help='Which timeframe to scrape (default: all)'
    )
    parser.add_argument(
        '--no-headless',
        action='store_true',
        help='Show browser window (default: headless)'
    )
    
    args = parser.parse_args()
    
    scraper = EDHRecPlaywrightScraper(
        output_dir=args.output_dir,
        headless=not args.no_headless
    )
    
    try:
        if args.timeframe == 'all':
            success = scraper.scrape_all()
        else:
            scraper.setup_browser()
            success = scraper.scrape_timeframe(args.timeframe)
            scraper.cleanup()
        
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        scraper.cleanup()
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Fatal error: {type(e).__name__}: {e}")
        scraper.cleanup()
        sys.exit(1)


if __name__ == '__main__':
    main()
