import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import random_commander
import webbrowser
import threading
import os
try:
    from PIL import Image, ImageTk
    import scryfall_api
    SCRYFALL_AVAILABLE = True
except ImportError:
    SCRYFALL_AVAILABLE = False
    print("Warning: PIL/Pillow or scryfall_api not available. Card images will not be shown.")
    print("Install Pillow with: pip install Pillow")


class CommanderRandomizerGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("EDHREC Commander Randomizer")
        self.root.geometry("900x800")
        self.root.resizable(True, True)
        
        # Store card images to prevent garbage collection
        self.card_images = []
        self.card_image_urls = {}  # Store URLs for each card image
        self.scryfall = scryfall_api.ScryfallAPI() if SCRYFALL_AVAILABLE else None
        self.logo_image = None  # Store logo reference
        
        # CSV file configuration with max ranks
        self.csv_files = {
            'Weekly': {'file': 'top_commanders_week.csv', 'max_rank': None},
            'Monthly': {'file': 'top_commanders_month.csv', 'max_rank': None},
            '2-Year': {'file': 'top_commanders_2year.csv', 'max_rank': None}
        }
        self.load_csv_max_ranks()
        
        # Configure style
        style = ttk.Style()
        style.theme_use('clam')
        
        # Dark mode color scheme
        bg_color = '#353b41'
        fg_color = '#ffffff'
        entry_bg = '#2a2f34'
        entry_fg = '#ffffff'
        
        # Configure dark mode styles
        style.configure('TFrame', background=bg_color)
        style.configure('TLabel', background=bg_color, foreground=fg_color)
        style.configure('TLabelframe', background=bg_color, foreground=fg_color)
        style.configure('TLabelframe.Label', background=bg_color, foreground=fg_color)
        style.configure('TCheckbutton', background=bg_color, foreground=fg_color)
        style.configure('TRadiobutton', background=bg_color, foreground=fg_color)
        style.configure('TButton', background='#4a5157', foreground=fg_color)
        style.map('TButton', background=[('active', '#5a6167')])
        style.configure('Accent.TButton', background='#4a90e2', foreground=fg_color)
        style.map('Accent.TButton', background=[('active', '#5aa0f2')])
        
        # Set root window background
        root.configure(bg=bg_color)
        
        # Main container - vertical layout
        self.main_frame = ttk.Frame(root, padding="10")
        self.main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        root.columnconfigure(0, weight=1)
        root.rowconfigure(0, weight=1)
        self.main_frame.columnconfigure(0, weight=1)
        self.main_frame.rowconfigure(4, weight=0)  # Buttons
        self.main_frame.rowconfigure(5, weight=0)  # Results (hidden by default)
        self.main_frame.rowconfigure(6, weight=1)  # Images area (main focus)
        
        # Header with logo and title
        header_frame = ttk.Frame(self.main_frame)
        header_frame.grid(row=0, column=0, pady=(0, 10), sticky=(tk.W, tk.E))
        
        # Load and display EDHREC logo
        logo_path = os.path.join(os.path.dirname(__file__), 'edhreclogo.png')
        if SCRYFALL_AVAILABLE and os.path.exists(logo_path):
            try:
                logo_pil = Image.open(logo_path)
                # Resize logo to reasonable height (e.g., 40px)
                logo_height = 40
                aspect_ratio = logo_pil.width / logo_pil.height
                logo_width = int(logo_height * aspect_ratio)
                logo_pil = logo_pil.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
                self.logo_image = ImageTk.PhotoImage(logo_pil)
                
                logo_label = tk.Label(header_frame, image=self.logo_image, bg=bg_color)
                logo_label.pack(side=tk.LEFT, padx=(0, 10))
            except Exception as e:
                print(f"Error loading logo: {e}")
        
        # Title
        title_label = ttk.Label(header_frame, text="Commander Randomizer", 
                               font=('Arial', 14, 'bold'))
        title_label.pack(side=tk.LEFT)
        
        # Input frame - more compact
        input_frame = ttk.LabelFrame(self.main_frame, text="Parameters", padding="8")
        input_frame.grid(row=1, column=0, sticky=(tk.W, tk.E), pady=(0, 8))
        
        # Row 1: Time Period selector
        ttk.Label(input_frame, text="Time Period:").grid(row=0, column=0, sticky=tk.W, padx=(0, 8))
        
        self.time_period_var = tk.StringVar(value="Monthly")
        time_period_combo = ttk.Combobox(input_frame, textvariable=self.time_period_var, 
                                        values=list(self.csv_files.keys()),
                                        state='readonly', width=12)
        time_period_combo.grid(row=0, column=1, sticky=tk.W, padx=(0, 20))
        time_period_combo.bind('<<ComboboxSelected>>', self.on_time_period_change)
        
        ttk.Label(input_frame, text="Quantity:").grid(row=0, column=2, sticky=tk.W, padx=(0, 5))
        self.quantity_var = tk.StringVar(value="3")
        self.quantity_entry = tk.Entry(input_frame, textvariable=self.quantity_var, width=8,
                                       bg=entry_bg, fg=entry_fg,
                                       insertbackground=entry_fg,
                                       relief=tk.FLAT, borderwidth=2)
        self.quantity_entry.grid(row=0, column=3, sticky=tk.W)
        
        # Row 2: Rank range - most popular (1) to less popular (higher numbers)
        ttk.Label(input_frame, text="Rank Range:").grid(row=1, column=0, sticky=tk.W, padx=(0, 8), pady=(8, 0))
        
        self.min_rank_var = tk.StringVar(value="1")  # Most popular
        self.min_rank_entry = tk.Entry(input_frame, textvariable=self.min_rank_var, width=8,
                                       bg=entry_bg, fg=entry_fg, 
                                       insertbackground=entry_fg,
                                       relief=tk.FLAT, borderwidth=2)
        self.min_rank_entry.grid(row=1, column=1, sticky=tk.W, padx=(0, 5), pady=(8, 0))
        
        ttk.Label(input_frame, text="to").grid(row=1, column=2, sticky=tk.W, padx=(0, 5), pady=(8, 0))
        
        self.max_rank_var = tk.StringVar(value="300")  # Default to 300 for Monthly
        self.max_rank_entry = tk.Entry(input_frame, textvariable=self.max_rank_var, width=8,
                                       bg=entry_bg, fg=entry_fg,
                                       insertbackground=entry_fg,
                                       relief=tk.FLAT, borderwidth=2)
        self.max_rank_entry.grid(row=1, column=3, sticky=tk.W, padx=(0, 10), pady=(8, 0))
        
        # Max rank label (shows limit for selected time period)
        self.max_rank_label = ttk.Label(input_frame, text="(Max: ...)")
        self.max_rank_label.grid(row=1, column=4, sticky=tk.W, pady=(8, 0))
        
        # Trigger initial update
        self.on_time_period_change()
        
        # Color filter frame - collapsible
        color_filter_container = ttk.Frame(self.main_frame)
        color_filter_container.grid(row=2, column=0, sticky=(tk.W, tk.E), pady=(0, 8))
        
        # Color filter enable/disable checkbox
        self.color_filter_enabled_var = tk.BooleanVar(value=False)
        self.color_filter_toggle = ttk.Checkbutton(
            color_filter_container, 
            text="Enable Color Filter", 
            variable=self.color_filter_enabled_var,
            command=self.toggle_color_filter
        )
        self.color_filter_toggle.pack(anchor=tk.W, pady=(0, 5))
        
        # Color filter frame - more compact
        self.color_frame = ttk.LabelFrame(color_filter_container, text="Color Filter Options", padding="8")
        self.color_frame.pack(fill=tk.X)
        self.color_frame.pack_forget()  # Hidden initially
        
        # Row 1: Color checkboxes - single row
        colors_container = ttk.Frame(self.color_frame)
        colors_container.grid(row=0, column=0, sticky=tk.W, pady=(0, 8))
        
        ttk.Label(colors_container, text="Colors:").pack(side=tk.LEFT, padx=(0, 10))
        
        self.color_vars = {}
        color_data = [
            ('W', 'White', '#F0E68C'),
            ('U', 'Blue', '#ADD8E6'),
            ('B', 'Black', '#D3D3D3'),
            ('R', 'Red', '#FFB6C1'),
            ('G', 'Green', '#90EE90')
        ]
        
        for code, name, color in color_data:
            var = tk.BooleanVar(value=False)
            self.color_vars[code] = var
            cb = ttk.Checkbutton(colors_container, text=code, variable=var)
            cb.pack(side=tk.LEFT, padx=3)
        
        # Row 2: Color mode selection - horizontal radio buttons
        mode_container = ttk.Frame(self.color_frame)
        mode_container.grid(row=1, column=0, sticky=tk.W, pady=(0, 8))
        
        ttk.Label(mode_container, text="Mode:").pack(side=tk.LEFT, padx=(0, 10))
        
        self.color_mode_var = tk.StringVar(value="exactly")
        
        ttk.Radiobutton(mode_container, text="Exactly", 
                       variable=self.color_mode_var, value="exactly").pack(side=tk.LEFT, padx=3)
        ttk.Radiobutton(mode_container, text="Including", 
                       variable=self.color_mode_var, value="including").pack(side=tk.LEFT, padx=3)
        ttk.Radiobutton(mode_container, text="At Most", 
                       variable=self.color_mode_var, value="atmost").pack(side=tk.LEFT, padx=3)
        
        # Row 3: Number of colors (Optional)
        num_colors_row = ttk.Frame(self.color_frame)
        num_colors_row.grid(row=2, column=0, sticky=tk.W)
        
        ttk.Label(num_colors_row, text="Number of Colors (Optional):").pack(side=tk.LEFT, padx=(0, 8))
        
        self.num_colors_var = tk.StringVar(value="")
        self.num_colors_entry = tk.Entry(num_colors_row, textvariable=self.num_colors_var, width=8,
                                         bg=entry_bg, fg=entry_fg, 
                                         insertbackground=entry_fg,
                                         relief=tk.FLAT, borderwidth=2)
        self.num_colors_entry.pack(side=tk.LEFT, padx=(0, 10))
        
        ttk.Label(num_colors_row, text="(0 = colorless)").pack(side=tk.LEFT)
        
        # Options frame - single row, compact
        options_frame = ttk.Frame(self.main_frame)
        options_frame.grid(row=3, column=0, sticky=(tk.W, tk.E), pady=(0, 8))
        
        self.verbose_var = tk.BooleanVar(value=False)
        self.verbose_check = ttk.Checkbutton(options_frame, text="Enable Text Output", 
                                            variable=self.verbose_var,
                                            command=self.toggle_results_visibility)
        self.verbose_check.pack(side=tk.LEFT, padx=(0, 15))
        
        self.open_urls_var = tk.BooleanVar(value=False)
        self.open_urls_check = ttk.Checkbutton(options_frame, text="Auto-open EDHREC pages", 
                                               variable=self.open_urls_var)
        self.open_urls_check.pack(side=tk.LEFT, padx=(0, 15))
        
        self.exclude_partners_var = tk.BooleanVar(value=True)
        self.exclude_partners_check = ttk.Checkbutton(options_frame, text="Exclude partner commanders", 
                                                       variable=self.exclude_partners_var)
        self.exclude_partners_check.pack(side=tk.LEFT)
        
        # Buttons frame
        button_frame = ttk.Frame(self.main_frame)
        button_frame.grid(row=4, column=0, sticky=(tk.W, tk.E), pady=(0, 8))
        
        self.randomize_btn = ttk.Button(button_frame, text="🎲 Randomize", 
                                        command=self.randomize_commanders,
                                        style='Accent.TButton')
        self.randomize_btn.pack(side=tk.LEFT, padx=(0, 5))
        
        self.clear_btn = ttk.Button(button_frame, text="Clear", 
                                    command=self.clear_results)
        self.clear_btn.pack(side=tk.LEFT)
        
        # Results frame - hidden by default
        self.results_frame = ttk.LabelFrame(self.main_frame, text="Detailed Results", padding="8")
        self.results_frame.grid(row=5, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 8))
        self.results_frame.grid_remove()  # Hide initially
        self.results_frame.columnconfigure(0, weight=1)
        self.results_frame.rowconfigure(0, weight=1)
        
        # Results text area with scrollbar
        self.results_text = scrolledtext.ScrolledText(self.results_frame, wrap=tk.WORD, 
                                                      font=('Consolas', 9),
                                                      height=8,
                                                      bg='#2a2f34',
                                                      fg='#ffffff',
                                                      insertbackground='#ffffff')
        self.results_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Card images frame (below results) - main focus
        if SCRYFALL_AVAILABLE:
            images_frame = ttk.LabelFrame(self.main_frame, text="🃏 Click Cards to Open EDHREC", padding="10")
            images_frame.grid(row=6, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
            images_frame.columnconfigure(0, weight=1)
            images_frame.rowconfigure(0, weight=1)
            
            # Scrollable canvas for images - horizontal layout with vertical scroll if needed
            canvas_container = ttk.Frame(images_frame)
            canvas_container.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
            canvas_container.columnconfigure(0, weight=1)
            canvas_container.rowconfigure(0, weight=1)
            
            self.images_canvas = tk.Canvas(canvas_container, bg='#2a2f34')
            self.h_scrollbar = ttk.Scrollbar(canvas_container, orient="horizontal", command=self.images_canvas.xview)
            self.v_scrollbar = ttk.Scrollbar(canvas_container, orient="vertical", command=self.images_canvas.yview)
            self.images_canvas.configure(xscrollcommand=self.h_scrollbar.set, yscrollcommand=self.v_scrollbar.set)
            
            self.images_canvas.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
            # Scrollbars will be shown/hidden dynamically
            
            # Frame inside canvas to hold images - horizontal layout
            self.images_inner_frame = ttk.Frame(self.images_canvas)
            self.images_canvas_window = self.images_canvas.create_window((0, 0), window=self.images_inner_frame, anchor='nw')
            
            # Bind canvas resize
            self.images_inner_frame.bind('<Configure>', self._on_images_frame_configure)
            self.images_canvas.bind('<Configure>', self._on_images_canvas_configure)
        else:
            # Show message if Pillow not available
            no_images_frame = ttk.LabelFrame(self.main_frame, text="Card Images", padding="10")
            no_images_frame.grid(row=6, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
            
            ttk.Label(no_images_frame, text="Card images not available.\n\nInstall Pillow to enable:\npip install Pillow", 
                     justify=tk.CENTER, foreground='gray').pack(expand=True)
        
        # Status bar
        self.status_var = tk.StringVar(value="Ready")
        status_bar = tk.Label(self.main_frame, textvariable=self.status_var, 
                              relief=tk.SUNKEN, anchor=tk.W,
                              bg='#2a2f34', fg='#ffffff',
                              padx=5, pady=3)
        status_bar.grid(row=7, column=0, sticky=(tk.W, tk.E), pady=(8, 0))
        
        # Store selected commanders for URL opening
        self.selected_commanders = []
    
    def load_csv_max_ranks(self):
        """Load and detect maximum rank from each CSV file."""
        for period, config in self.csv_files.items():
            csv_file = config['file']
            try:
                commanders = random_commander.load_commanders(csv_file)
                if commanders:
                    max_rank = max(c['rank'] for c in commanders)
                    config['max_rank'] = max_rank
                else:
                    config['max_rank'] = 100  # Default fallback
            except FileNotFoundError:
                print(f"Warning: {csv_file} not found")
                config['max_rank'] = 100  # Default fallback
            except Exception as e:
                print(f"Error loading {csv_file}: {e}")
                config['max_rank'] = 100  # Default fallback
    
    def on_time_period_change(self, *args):
        """Update max rank display when time period changes."""
        period = self.time_period_var.get()
        max_rank = self.csv_files[period]['max_rank']
        if max_rank:
            self.max_rank_label.config(text=f"(Max: {max_rank})")
        
        # Update default max rank if current value exceeds new max
        try:
            current_max = int(self.max_rank_var.get())
            if current_max > max_rank:
                self.max_rank_var.set(str(max_rank))
        except ValueError:
            pass
    
    def toggle_color_filter(self):
        """Show or hide the color filter options."""
        if self.color_filter_enabled_var.get():
            self.color_frame.pack(fill=tk.X)
        else:
            self.color_frame.pack_forget()
    
    def toggle_results_visibility(self):
        """Show or hide the detailed results panel."""
        if self.verbose_var.get():
            self.results_frame.grid()
            self.main_frame.rowconfigure(5, weight=1)
        else:
            self.results_frame.grid_remove()
            self.main_frame.rowconfigure(5, weight=0)
        
    def validate_inputs(self):
        """Validate user inputs."""
        try:
            min_rank = int(self.min_rank_var.get())
            max_rank = int(self.max_rank_var.get())
            quantity = int(self.quantity_var.get())
            
            if min_rank < 1:
                messagebox.showerror("Invalid Input", "Minimum rank must be at least 1")
                return None
            
            if max_rank < min_rank:
                messagebox.showerror("Invalid Input", 
                                   "Maximum rank must be greater than or equal to minimum rank")
                return None
            
            if quantity < 1:
                messagebox.showerror("Invalid Input", "Quantity must be at least 1")
                return None
            
            return min_rank, max_rank, quantity
            
        except ValueError:
            messagebox.showerror("Invalid Input", 
                               "Please enter valid numbers for rank and quantity")
            return None
    
    def randomize_commanders(self):
        """Execute the randomization."""
        # Validate inputs
        validation = self.validate_inputs()
        if validation is None:
            return
        
        min_rank, max_rank, quantity = validation
        
        # Get selected CSV file based on time period
        time_period = self.time_period_var.get()
        csv_file = self.csv_files[time_period]['file']
        
        # Get color filter settings
        color_filter = None
        color_mode = self.color_mode_var.get()
        num_colors_filter = None
        
        if self.color_filter_enabled_var.get():
            # Get selected colors
            selected_colors = [code for code, var in self.color_vars.items() if var.get()]
            
            # Get number of colors filter
            num_colors_str = self.num_colors_var.get().strip()
            if num_colors_str:
                try:
                    num_colors_filter = int(num_colors_str)
                    if num_colors_filter < 0:
                        messagebox.showerror("Invalid Input", "Number of colors must be 0 or greater")
                        return
                except ValueError:
                    messagebox.showerror("Invalid Input", "Number of colors must be a valid number")
                    return
            
            # Only set color_filter if we have colors selected OR number of colors specified
            if selected_colors or num_colors_filter is not None:
                color_filter = ','.join(selected_colors) if selected_colors else ''
        
        # Clear previous results
        self.clear_results()
        self.selected_commanders = []
        
        # Update status
        self.status_var.set("Loading commanders...")
        self.randomize_btn.config(state='disabled')
        
        def run_randomization():
            try:
                # Load commanders
                commanders = random_commander.load_commanders(csv_file)
                
                # Filter out partner commanders if option is checked
                if self.exclude_partners_var.get():
                    original_count = len(commanders)
                    commanders = [c for c in commanders if ' // ' not in c['name']]
                    filtered_count = original_count - len(commanders)
                    if filtered_count > 0:
                        self.update_results(f"Excluded {filtered_count} partner commanders\n")
                
                self.update_results(f"Loaded {len(commanders)} commanders from {time_period} data\n\n")
                
                # Build filter description
                filter_desc = f"{time_period} ranks {min_rank}-{max_rank}"
                if color_filter is not None:
                    if num_colors_filter is not None:
                        filter_desc += f" with exactly {num_colors_filter} color(s)"
                        if color_filter:
                            mode_desc = {
                                'exactly': 'exactly',
                                'including': 'including',
                                'atmost': 'at most'
                            }
                            filter_desc += f" ({mode_desc[color_mode]}: {color_filter})"
                    elif color_filter:
                        mode_desc = {
                            'exactly': 'exactly',
                            'including': 'including',
                            'atmost': 'at most'
                        }
                        filter_desc += f" with {mode_desc[color_mode]} colors: {color_filter}"
                    elif color_filter == '':
                        filter_desc += " (colorless only)"
                
                # Select random commanders
                self.update_results(f"Selecting {quantity} random commander(s) from {filter_desc}...\n\n")
                selected = random_commander.select_random_commanders(
                    commanders, min_rank, max_rank, quantity, color_filter, color_mode, num_colors_filter
                )
                
                if selected:
                    self.update_results("=" * 60 + "\n")
                    self.update_results(f"Selected {len(selected)} Commander(s):\n")
                    self.update_results("=" * 60 + "\n\n")
                    
                    for i, commander in enumerate(selected, 1):
                        url = random_commander.commander_name_to_url(commander['name'])
                        self.selected_commanders.append({'name': commander['name'], 'url': url})
                        
                        self.update_results(f"{i}. {commander['name']}\n")
                        
                        if self.verbose_var.get():
                            self.update_results(f"   Rank: {commander['rank']}\n")
                            color_display = commander['colors'] if commander['colors'] else 'Colorless'
                            self.update_results(f"   Colors: {color_display}\n")
                            self.update_results(f"   CMC: {commander['cmc']}\n")
                            self.update_results(f"   Rarity: {commander['rarity']}\n")
                            self.update_results(f"   Type: {commander['type']}\n")
                        
                        self.update_results(f"   URL: {url}\n")
                        
                        # Make URL clickable
                        self.make_url_clickable(url)
                        
                        self.update_results("\n")
                    
                    # Fetch and display card images (pass total count for smart sizing)
                    if SCRYFALL_AVAILABLE:
                        for commander in selected:
                            url = random_commander.commander_name_to_url(commander['name'])
                            self.display_card_image(commander['name'], url, commander['rank'], len(selected))
                    
                    # Open URLs if requested
                    if self.open_urls_var.get():
                        for commander in selected:
                            url = random_commander.commander_name_to_url(commander['name'])
                            webbrowser.open(url)
                    
                    self.update_results("=" * 60 + "\n")
                    
                    if self.open_urls_var.get():
                        self.update_results(f"\nOpened {len(selected)} URL(s) in your default browser.\n")
                    
                    self.status_var.set(f"Successfully selected {len(selected)} commander(s)")
                else:
                    self.status_var.set("No commanders found with current filters")
                
            except FileNotFoundError:
                messagebox.showerror("File Not Found", 
                                   f"Could not find CSV file: {csv_file}")
                self.status_var.set("Error: File not found")
            except Exception as e:
                messagebox.showerror("Error", f"An error occurred: {str(e)}")
                self.status_var.set(f"Error: {str(e)}")
            finally:
                self.randomize_btn.config(state='normal')
        
        # Run in separate thread to avoid freezing GUI
        thread = threading.Thread(target=run_randomization, daemon=True)
        thread.start()
    
    def update_results(self, text):
        """Update results text area (thread-safe)."""
        self.results_text.insert(tk.END, text)
        self.results_text.see(tk.END)
        self.root.update_idletasks()
    
    def make_url_clickable(self, url):
        """Make URL clickable in the text widget."""
        # Find the URL in the text
        start_idx = self.results_text.search(url, "end-2c", backwards=True)
        if start_idx:
            end_idx = f"{start_idx}+{len(url)}c"
            tag_name = f"url_{start_idx}"
            
            self.results_text.tag_add(tag_name, start_idx, end_idx)
            self.results_text.tag_config(tag_name, foreground="blue", underline=True)
            self.results_text.tag_bind(tag_name, "<Button-1>", 
                                      lambda e, u=url: webbrowser.open(u))
            self.results_text.tag_bind(tag_name, "<Enter>", 
                                      lambda e: self.results_text.config(cursor="hand2"))
            self.results_text.tag_bind(tag_name, "<Leave>", 
                                      lambda e: self.results_text.config(cursor=""))
    
    def clear_results(self):
        """Clear the results text area."""
        self.results_text.delete(1.0, tk.END)
        self.selected_commanders = []
        self.clear_images()
    
    def clear_images(self):
        """Clear all card images."""
        if not SCRYFALL_AVAILABLE:
            return
        
        # Clear the images
        for widget in self.images_inner_frame.winfo_children():
            widget.destroy()
        
        self.card_images = []
        self.card_image_urls = {}
        self.images_canvas.xview_moveto(0)
        self.images_canvas.yview_moveto(0)
    
    def _on_images_frame_configure(self, event=None):
        """Update scroll region when frame size changes."""
        if SCRYFALL_AVAILABLE:
            self.images_canvas.configure(scrollregion=self.images_canvas.bbox("all"))
    
    def _on_images_canvas_configure(self, event):
        """Update canvas window height when canvas is resized."""
        if SCRYFALL_AVAILABLE:
            canvas_height = event.height
            self.images_canvas.itemconfig(self.images_canvas_window, height=canvas_height)
    
    def _update_scrollbars(self):
        """Show or hide scrollbars based on content size."""
        if not SCRYFALL_AVAILABLE:
            return
        
        # Get canvas and content dimensions
        canvas_width = self.images_canvas.winfo_width()
        canvas_height = self.images_canvas.winfo_height()
        bbox = self.images_canvas.bbox("all")
        
        if bbox:
            content_width = bbox[2] - bbox[0]
            content_height = bbox[3] - bbox[1]
            
            # Show horizontal scrollbar if content is wider
            if content_width > canvas_width:
                self.h_scrollbar.grid(row=1, column=0, sticky=(tk.W, tk.E))
            else:
                self.h_scrollbar.grid_remove()
            
            # Show vertical scrollbar if content is taller
            if content_height > canvas_height:
                self.v_scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
            else:
                self.v_scrollbar.grid_remove()
    
    def display_card_image(self, card_name: str, edhrec_url: str, rank: int, num_cards: int):
        """Fetch and display a card image with click-to-open functionality."""
        if not SCRYFALL_AVAILABLE or not self.scryfall:
            return
        
        def fetch_and_display():
            try:
                # Fetch the image (using 'normal' size for good quality)
                pil_image = self.scryfall.get_card_image(card_name, version='normal')
                
                if pil_image:
                    # Smart resizing based on number of cards
                    # Get available canvas width (after it's been drawn)
                    self.root.update_idletasks()
                    canvas_width = self.images_canvas.winfo_width()
                    canvas_height = self.images_canvas.winfo_height()
                    
                    # Calculate optimal card width to fit without scrolling
                    # Account for padding (10px each side per card + 20px frame padding)
                    available_width = canvas_width - 40  # Frame padding
                    card_spacing = 20  # Space between cards
                    optimal_card_width = (available_width - (card_spacing * (num_cards - 1))) / num_cards
                    
                    # Set reasonable bounds: min 150px, max 350px
                    min_width = 150
                    max_width = 350
                    target_width = max(min_width, min(optimal_card_width, max_width))
                    
                    # Calculate height to fit in canvas with margin for text labels
                    # Reserve space for card name (20px) and rank (15px) and padding
                    available_height = canvas_height - 60  # Labels + padding
                    
                    # Calculate dimensions maintaining aspect ratio
                    aspect_ratio = pil_image.height / pil_image.width
                    new_width = int(target_width)
                    new_height = int(new_width * aspect_ratio)
                    
                    # If height would exceed available space, resize based on height instead
                    if new_height > available_height:
                        new_height = int(available_height)
                        new_width = int(new_height / aspect_ratio)
                    
                    pil_image = pil_image.resize((new_width, new_height), Image.Resampling.LANCZOS)
                    
                    # Convert to PhotoImage
                    photo = ImageTk.PhotoImage(pil_image)
                    
                    # Store reference to prevent garbage collection
                    self.card_images.append(photo)
                    
                    # Create a container frame for this card
                    card_container = ttk.Frame(self.images_inner_frame)
                    card_container.pack(side=tk.LEFT, padx=10, pady=10)
                    
                    # Create label with image
                    img_label = tk.Label(card_container, image=photo, bg='#2a2f34', cursor='hand2')
                    img_label.pack()
                    
                    # Store the URL for this image
                    self.card_image_urls[img_label] = edhrec_url
                    
                    # Bind click event to open EDHREC URL
                    img_label.bind('<Button-1>', lambda e, url=edhrec_url: webbrowser.open(url))
                    
                    # Add tooltip on hover
                    def on_enter(e):
                        img_label.config(relief=tk.RAISED, borderwidth=2)
                    
                    def on_leave(e):
                        img_label.config(relief=tk.FLAT, borderwidth=0)
                    
                    img_label.bind('<Enter>', on_enter)
                    img_label.bind('<Leave>', on_leave)
                    
                    # Add card name label below image
                    name_label = ttk.Label(card_container, text=card_name, 
                                          font=('Arial', 9, 'bold'),
                                          justify=tk.CENTER,
                                          wraplength=new_width,
                                          foreground='#ffffff')
                    name_label.pack(pady=(5, 0))
                    
                    # Add rank label
                    rank_label = ttk.Label(card_container, text=f"Rank #{rank}", 
                                          font=('Arial', 8),
                                          justify=tk.CENTER,
                                          foreground='#aaaaaa')
                    rank_label.pack(pady=(2, 0))
                    
                    # Update scroll region
                    self._on_images_frame_configure()
                    
                    # Check if scrollbar is needed
                    self.root.update_idletasks()
                    self._update_scrollbars()
                else:
                    # Show placeholder if image not found
                    card_container = ttk.Frame(self.images_inner_frame)
                    card_container.pack(side=tk.LEFT, padx=10, pady=10)
                    
                    error_label = ttk.Label(card_container, 
                                           text=f"❌\n{card_name}\n(Image not found)", 
                                           foreground='red', justify=tk.CENTER)
                    error_label.pack()
                    
            except Exception as e:
                print(f"Error displaying image for {card_name}: {e}")
        
        # Run in separate thread to avoid blocking UI
        thread = threading.Thread(target=fetch_and_display, daemon=True)
        thread.start()


def main():
    root = tk.Tk()
    app = CommanderRandomizerGUI(root)
    root.mainloop()


if __name__ == "__main__":
    main()
