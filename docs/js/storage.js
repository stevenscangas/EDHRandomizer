// ========================================
// LOCAL STORAGE MANAGEMENT
// ========================================

import { DEFAULT_SETTINGS } from './config.js';
import { settingsToURLParams } from './urlParams.js';
import { commanderNameToUrl } from './api/edhrec.js';
import { getCardImageUrl } from './api/scryfall.js';
import { displayTextResults, displayCardImagesProgressive, updateStatus } from './ui/display.js';

// Debounced URL update timer
let urlUpdateTimeout;

export function saveSettings() {
    const settings = {
        timePeriod: document.getElementById('time-period').value,
        minRank: parseInt(document.getElementById('min-rank').value),
        maxRank: parseInt(document.getElementById('max-rank').value),
        quantity: parseInt(document.getElementById('quantity').value),
        enableColorFilter: document.getElementById('enable-color-filter').checked,
        selectedColors: Array.from(document.querySelectorAll('.color-input:checked')).map(input => input.value),
        colorMode: document.querySelector('input[name="color-mode"]:checked').value,
        numColors: document.getElementById('num-colors').value,
        selectedColorCounts: Array.from(document.querySelectorAll('.color-count-input:checked')).map(input => input.value),
        excludePartners: document.getElementById('exclude-partners').checked,
        textOutput: document.getElementById('text-output').checked,
        colorCountMode: localStorage.getItem('colorCountMode') || 'simple'
    };
    
    localStorage.setItem('commanderSettings', JSON.stringify(settings));
    
    // Update URL in real-time with debouncing
    updateLiveURL(settings);
}

export function updateLiveURL(settings) {
    // Clear previous timeout
    clearTimeout(urlUpdateTimeout);
    
    // Debounce: wait 300ms after last change before updating URL
    urlUpdateTimeout = setTimeout(() => {
        const params = settingsToURLParams(settings);
        const newURL = params 
            ? `${window.location.pathname}?${params}`
            : window.location.pathname;
        
        // Use replaceState to avoid polluting browser history
        window.history.replaceState({}, document.title, newURL);
    }, 300);
}

export function saveLastResults(commanders) {
    try {
        // Save commander data (without image URLs to reduce size)
        const commanderData = commanders.map(cmd => ({
            rank: cmd.rank,
            name: cmd.name,
            colors: cmd.colors,
            cmc: cmd.cmc,
            rarity: cmd.rarity,
            type: cmd.type
        }));
        localStorage.setItem('lastCommanders', JSON.stringify(commanderData));
    } catch (error) {
        console.error('Error saving last results:', error);
    }
}

export async function loadLastResults() {
    try {
        const savedCommanders = localStorage.getItem('lastCommanders');
        if (!savedCommanders) {
            return null;
        }
        
        const commanders = JSON.parse(savedCommanders);
        if (!commanders || commanders.length === 0) {
            return null;
        }
        
        console.log(`Loading ${commanders.length} previously generated commanders...`);
        
        // Check if we're in text output mode
        const useTextOutput = document.getElementById('text-output').checked;
        
        if (useTextOutput) {
            // For text output, we need to fetch all data first
            for (const commander of commanders) {
                commander.edhrec_url = commanderNameToUrl(commander.name);
                commander.image_url = await getCardImageUrl(commander.name);
            }
            
            displayTextResults({
                commanders: commanders,
                total_loaded: commanders.length,
                filter_description: 'Previously generated results'
            });
        } else {
            // For card images, display progressively
            displayCardImagesProgressive(commanders);
        }
        
        updateStatus(`Loaded ${commanders.length} previously generated commander(s)`);
        return commanders;
    } catch (error) {
        console.error('Error loading last results:', error);
        return null;
    }
}

export function loadSettings() {
    const savedSettings = localStorage.getItem('commanderSettings');
    let settings;
    
    if (!savedSettings) {
        // No saved settings, use defaults
        settings = DEFAULT_SETTINGS;
    } else {
        try {
            settings = JSON.parse(savedSettings);
        } catch (error) {
            console.error('Error loading settings:', error);
            settings = DEFAULT_SETTINGS;
        }
    }
    
    // Load basic settings
    document.getElementById('time-period').value = settings.timePeriod || DEFAULT_SETTINGS.timePeriod;
    document.getElementById('min-rank').value = settings.minRank || DEFAULT_SETTINGS.minRank;
    document.getElementById('max-rank').value = settings.maxRank || DEFAULT_SETTINGS.maxRank;
    document.getElementById('quantity').value = settings.quantity || DEFAULT_SETTINGS.quantity;
    document.getElementById('enable-color-filter').checked = settings.enableColorFilter ?? DEFAULT_SETTINGS.enableColorFilter;
    document.getElementById('exclude-partners').checked = settings.excludePartners ?? DEFAULT_SETTINGS.excludePartners;
    document.getElementById('text-output').checked = settings.textOutput ?? DEFAULT_SETTINGS.textOutput;
    
    // Show/hide color filter section
    const colorSection = document.getElementById('color-filter-section');
    if (settings.enableColorFilter) {
        colorSection.classList.remove('hidden');
    } else {
        colorSection.classList.add('hidden');
    }
    
    // Load color selections
    const colorsToSelect = settings.selectedColors || DEFAULT_SETTINGS.selectedColors;
    document.querySelectorAll('.color-input').forEach(input => {
        if (colorsToSelect.includes(input.value)) {
            input.checked = true;
            input.closest('.color-checkbox').classList.add('selected');
        } else {
            input.checked = false;
            input.closest('.color-checkbox').classList.remove('selected');
        }
    });
    
    // Load color mode
    const colorMode = settings.colorMode || DEFAULT_SETTINGS.colorMode;
    const modeInput = document.querySelector(`input[name="color-mode"][value="${colorMode}"]`);
    if (modeInput) {
        modeInput.checked = true;
    }
    
    // Load num colors (simple mode)
    document.getElementById('num-colors').value = settings.numColors ?? DEFAULT_SETTINGS.numColors;
    
    // Load selected color counts (advanced mode)
    const colorCounts = settings.selectedColorCounts || DEFAULT_SETTINGS.selectedColorCounts;
    document.querySelectorAll('.color-count-input').forEach(input => {
        if (colorCounts.includes(input.value)) {
            input.checked = true;
            input.closest('.color-count-button').classList.add('selected');
        } else {
            input.checked = false;
            input.closest('.color-count-button').classList.remove('selected');
        }
    });
}
