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
        selectedColorCounts: Array.from(document.querySelectorAll('.color-count-input:checked')).map(input => input.value),
        excludePartners: document.getElementById('exclude-partners').checked,
        textOutput: document.getElementById('text-output').checked,
        enableAdditionalFilters: document.getElementById('enable-additional-filters').checked,
        enableCmcFilter: document.getElementById('enable-cmc-filter').checked,
        minCmc: parseInt(document.getElementById('min-cmc').value),
        maxCmc: parseInt(document.getElementById('max-cmc').value),
        enableSaltFilter: document.getElementById('enable-salt-filter').checked,
        saltMode: document.getElementById('salt-toggle').classList.contains('salty') ? 'salty' : 'chill',
        enableAdvancedRandomizer: document.getElementById('enable-advanced-randomizer').checked,
        distributionEquation: document.getElementById('distribution-equation').value
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
            salt: cmd.salt,
            rarity: cmd.rarity,
            type: cmd.type
        }));
        localStorage.setItem('lastCommanders', JSON.stringify(commanderData));
        
        // Show the Share Results button
        const shareResultsBtn = document.getElementById('share-results-btn');
        if (shareResultsBtn) {
            shareResultsBtn.classList.remove('hidden');
        }
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
    
    // Load selected color counts
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
    
    // Load additional filters settings
    document.getElementById('enable-additional-filters').checked = settings.enableAdditionalFilters ?? DEFAULT_SETTINGS.enableAdditionalFilters;
    document.getElementById('enable-cmc-filter').checked = settings.enableCmcFilter ?? DEFAULT_SETTINGS.enableCmcFilter;
    document.getElementById('min-cmc').value = settings.minCmc ?? DEFAULT_SETTINGS.minCmc;
    document.getElementById('max-cmc').value = settings.maxCmc ?? DEFAULT_SETTINGS.maxCmc;
    document.getElementById('enable-salt-filter').checked = settings.enableSaltFilter ?? DEFAULT_SETTINGS.enableSaltFilter;
    
    // Load salt toggle button state
    const saltBtn = document.getElementById('salt-toggle');
    const saltIcon = saltBtn.querySelector('.salt-icon');
    const saltLabel = saltBtn.querySelector('.salt-label');
    const saltMode = settings.saltMode || DEFAULT_SETTINGS.saltMode;
    saltBtn.classList.remove('chill', 'salty');
    saltBtn.classList.add(saltMode);
    if (saltMode === 'salty') {
        saltIcon.textContent = '🧂';
        saltLabel.textContent = 'Salty';
    } else {
        saltIcon.textContent = '❄️';
        saltLabel.textContent = 'Chill';
    }
    
    // Show/hide additional filters section
    const additionalSection = document.getElementById('additional-filters-section');
    if (settings.enableAdditionalFilters) {
        additionalSection.classList.remove('hidden');
    } else {
        additionalSection.classList.add('hidden');
    }
    
    // Load advanced randomizer settings
    document.getElementById('enable-advanced-randomizer').checked = settings.enableAdvancedRandomizer ?? DEFAULT_SETTINGS.enableAdvancedRandomizer;
    document.getElementById('distribution-equation').value = settings.distributionEquation || DEFAULT_SETTINGS.distributionEquation || '1';
    
    // Show/hide advanced randomizer section
    const advancedRandomizerSection = document.getElementById('advanced-randomizer-section');
    if (settings.enableAdvancedRandomizer) {
        advancedRandomizerSection.classList.remove('hidden');
    } else {
        advancedRandomizerSection.classList.add('hidden');
    }
}

// ========================================
// RESULTS SHARING FUNCTIONS
// ========================================

export function encodeResultsForURL() {
    try {
        const savedCommanders = localStorage.getItem('lastCommanders');
        if (!savedCommanders) {
            return null;
        }
        
        const commanders = JSON.parse(savedCommanders);
        if (!commanders || commanders.length === 0) {
            return null;
        }
        
        // Get ALL current settings (compact format)
        const settings = {
            tp: document.getElementById('time-period').value, // timePeriod
            to: document.getElementById('text-output').checked ? 1 : 0, // textOutput
            minR: parseInt(document.getElementById('min-rank').value), // minRank
            maxR: parseInt(document.getElementById('max-rank').value), // maxRank
            qty: parseInt(document.getElementById('quantity').value), // quantity
            ecf: document.getElementById('enable-color-filter').checked ? 1 : 0, // enableColorFilter
            sc: Array.from(document.querySelectorAll('.color-input:checked')).map(input => input.value), // selectedColors
            cm: document.querySelector('input[name="color-mode"]:checked').value, // colorMode
            scc: Array.from(document.querySelectorAll('.color-count-input:checked')).map(input => input.value), // selectedColorCounts
            ep: document.getElementById('exclude-partners').checked ? 1 : 0, // excludePartners
            eaf: document.getElementById('enable-additional-filters').checked ? 1 : 0, // enableAdditionalFilters
            ecmc: document.getElementById('enable-cmc-filter').checked ? 1 : 0, // enableCmcFilter
            minC: parseInt(document.getElementById('min-cmc').value), // minCmc
            maxC: parseInt(document.getElementById('max-cmc').value), // maxCmc
            esf: document.getElementById('enable-salt-filter').checked ? 1 : 0, // enableSaltFilter
            sm: document.getElementById('salt-toggle').classList.contains('salty') ? 'salty' : 'chill', // saltMode
            ear: document.getElementById('enable-advanced-randomizer').checked ? 1 : 0, // enableAdvancedRandomizer
            deq: document.getElementById('distribution-equation').value // distributionEquation
        };
        
        // Create compact data structure: [settings, commander_names]
        const compactData = [settings, commanders.map(cmd => cmd.name)];
        
        console.log('=== ENCODING RESULTS FOR SHARE ===');
        console.log('Settings being saved:', settings);
        console.log('Commander count:', commanders.length);
        
        // Encode to base64
        const jsonString = JSON.stringify(compactData);
        const encoded = btoa(unescape(encodeURIComponent(jsonString)));
        
        console.log('Encoded length:', encoded.length);
        
        return encoded;
    } catch (error) {
        console.error('Error encoding results:', error);
        return null;
    }
}

export function decodeResultsFromURL(encoded) {
    try {
        console.log('=== DECODING RESULTS FROM URL ===');
        console.log('Encoded string length:', encoded.length);
        
        // Decode from base64
        const jsonString = decodeURIComponent(escape(atob(encoded)));
        const data = JSON.parse(jsonString);
        
        console.log('Decoded data structure:', data);
        
        if (!Array.isArray(data) || data.length !== 2) {
            // Try legacy format (just commander names)
            if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
                console.log('Using legacy format (no settings)');
                return { settings: null, commanderNames: data };
            }
            console.log('Invalid data format');
            return null;
        }
        
        const [settings, commanderNames] = data;
        
        console.log('Decoded settings:', settings);
        console.log('Commander names:', commanderNames);
        
        if (!Array.isArray(commanderNames) || commanderNames.length === 0) {
            console.log('Invalid commander names');
            return null;
        }
        
        return { settings, commanderNames };
    } catch (error) {
        console.error('Error decoding results:', error);
        return null;
    }
}

export function enterResultsViewMode() {
    // Show the results banner
    const banner = document.getElementById('results-view-banner');
    if (banner) {
        banner.classList.remove('hidden');
    }
    
    // Disable the randomize button and other controls
    const randomizeBtn = document.getElementById('randomize-btn');
    const resetBtn = document.getElementById('reset-btn');
    const shareBtn = document.getElementById('share-btn');
    const shareResultsBtn = document.getElementById('share-results-btn');
    
    if (randomizeBtn) randomizeBtn.disabled = true;
    if (resetBtn) resetBtn.disabled = true;
    if (shareBtn) shareBtn.disabled = true;
    if (shareResultsBtn) shareResultsBtn.classList.add('hidden');
    
    // Disable all form inputs
    document.querySelectorAll('input, select, button:not(#exit-results-btn)').forEach(el => {
        if (el.id !== 'exit-results-btn') {
            el.disabled = true;
        }
    });
    
    console.log('Entered results view mode');
}

export function exitResultsViewMode() {
    // Hide the results banner
    const banner = document.getElementById('results-view-banner');
    if (banner) {
        banner.classList.add('hidden');
    }
    
    // Re-enable the randomize button and other controls
    const randomizeBtn = document.getElementById('randomize-btn');
    const resetBtn = document.getElementById('reset-btn');
    const shareBtn = document.getElementById('share-btn');
    
    if (randomizeBtn) randomizeBtn.disabled = false;
    if (resetBtn) resetBtn.disabled = false;
    if (shareBtn) shareBtn.disabled = false;
    
    // Re-enable all form inputs
    document.querySelectorAll('input, select, button').forEach(el => {
        el.disabled = false;
    });
    
    // Clear the results URL parameter (both new and legacy)
    const url = new URL(window.location.href);
    url.searchParams.delete('r');
    url.searchParams.delete('results');
    window.history.replaceState({}, document.title, url.pathname + url.search);
    
    // Reset embed metadata
    import('./embedMetadata.js').then(({ resetEmbedMetadata }) => {
        resetEmbedMetadata();
    });
    
    console.log('Exited results view mode');
}
