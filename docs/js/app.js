// ========================================
// MAIN APPLICATION ENTRY POINT
// ========================================

import { getCsvInfo, csvInfo } from './dataLoader.js';
import { applyURLSettings } from './urlParams.js';
import { loadSettings, loadLastResults, decodeResultsFromURL, enterResultsViewMode } from './storage.js';
import { setupEventListeners, updateMaxRankLabel, resetToDefaultSettings } from './ui/events.js';
import { handleRandomize } from './services/commanderService.js';
import { getCardImageUrl } from './api/scryfall.js';
import { commanderNameToUrl } from './api/edhrec.js';
import { displayCardImagesProgressive, displayTextResults, updateStatus, clearResults } from './ui/display.js';
import { updateEmbedMetadata } from './embedMetadata.js';

let isInitialized = false;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== PAGE LOADED - INITIALIZING ===');
    console.log('Setting up event listeners...');
    setupEventListeners(handleRandomize, resetToDefaultSettings);
    
    console.log('Loading CSV info...');
    await getCsvInfo();
    console.log('CSV info loaded:', csvInfo);
    
    // Check for shared results in URL first
    const urlParams = new URLSearchParams(window.location.search);
    const resultsParam = urlParams.get('r') || urlParams.get('results'); // Support both 'r' and legacy 'results'
    
    if (resultsParam) {
        console.log('=== SHARED RESULTS DETECTED ===');
        
        // Decode the shared results
        const decoded = decodeResultsFromURL(resultsParam);
        
        if (decoded && decoded.commanderNames && decoded.commanderNames.length > 0) {
            const { settings: sharedSettings, commanderNames } = decoded;
            
            console.log(`Loading ${commanderNames.length} shared commanders...`);
            
            // Apply shared settings if available
            if (sharedSettings) {
                console.log('Applying shared settings:', sharedSettings);
                
                // Basic settings
                if (sharedSettings.tp) {
                    document.getElementById('time-period').value = sharedSettings.tp;
                }
                if (sharedSettings.to !== undefined) {
                    document.getElementById('text-output').checked = sharedSettings.to === 1;
                }
                
                // Rank settings
                if (sharedSettings.minR !== undefined) {
                    document.getElementById('min-rank').value = sharedSettings.minR;
                }
                if (sharedSettings.maxR !== undefined) {
                    document.getElementById('max-rank').value = sharedSettings.maxR;
                }
                
                // Quantity
                if (sharedSettings.qty !== undefined) {
                    document.getElementById('quantity').value = sharedSettings.qty;
                }
                
                // Color filter
                if (sharedSettings.ecf !== undefined) {
                    document.getElementById('enable-color-filter').checked = sharedSettings.ecf === 1;
                    // Show/hide color filter section
                    const colorFilterSection = document.getElementById('color-filter-section');
                    if (sharedSettings.ecf === 1) {
                        colorFilterSection.classList.remove('hidden');
                    } else {
                        colorFilterSection.classList.add('hidden');
                    }
                }
                
                // Selected colors
                if (sharedSettings.sc && Array.isArray(sharedSettings.sc)) {
                    document.querySelectorAll('.color-input').forEach(input => {
                        input.checked = sharedSettings.sc.includes(input.value);
                    });
                }
                
                // Color mode
                if (sharedSettings.cm) {
                    const colorModeRadio = document.querySelector(`input[name="color-mode"][value="${sharedSettings.cm}"]`);
                    if (colorModeRadio) {
                        colorModeRadio.checked = true;
                    }
                }
                
                // Selected color counts
                if (sharedSettings.scc && Array.isArray(sharedSettings.scc)) {
                    document.querySelectorAll('.color-count-input').forEach(input => {
                        input.checked = sharedSettings.scc.includes(input.value);
                    });
                }
                
                // Partners
                if (sharedSettings.ep !== undefined) {
                    document.getElementById('exclude-partners').checked = sharedSettings.ep === 1;
                }
                
                // Additional filters toggle
                if (sharedSettings.eaf !== undefined) {
                    document.getElementById('enable-additional-filters').checked = sharedSettings.eaf === 1;
                    // Show/hide additional filters section
                    const additionalSection = document.getElementById('additional-filters-section');
                    if (sharedSettings.eaf === 1) {
                        additionalSection.classList.remove('hidden');
                    } else {
                        additionalSection.classList.add('hidden');
                    }
                }
                
                // CMC filter
                if (sharedSettings.ecmc !== undefined) {
                    document.getElementById('enable-cmc-filter').checked = sharedSettings.ecmc === 1;
                }
                if (sharedSettings.minC !== undefined) {
                    document.getElementById('min-cmc').value = sharedSettings.minC;
                }
                if (sharedSettings.maxC !== undefined) {
                    document.getElementById('max-cmc').value = sharedSettings.maxC;
                }
                
                // Salt filter
                if (sharedSettings.esf !== undefined) {
                    document.getElementById('enable-salt-filter').checked = sharedSettings.esf === 1;
                }
                if (sharedSettings.sm) {
                    const saltToggle = document.getElementById('salt-toggle');
                    if (sharedSettings.sm === 'salty') {
                        saltToggle.classList.add('salty');
                        saltToggle.classList.remove('chill');
                        saltToggle.textContent = '🧂 Salty';
                    } else {
                        saltToggle.classList.add('chill');
                        saltToggle.classList.remove('salty');
                        saltToggle.textContent = '😎 Chill';
                    }
                }
                
                // Advanced Randomizer
                if (sharedSettings.ear !== undefined) {
                    document.getElementById('enable-advanced-randomizer').checked = sharedSettings.ear === 1;
                    const advancedSection = document.getElementById('advanced-randomizer-section');
                    if (sharedSettings.ear === 1) {
                        advancedSection.classList.remove('hidden');
                    } else {
                        advancedSection.classList.add('hidden');
                    }
                }
                if (sharedSettings.deq !== undefined) {
                    document.getElementById('distribution-equation').value = sharedSettings.deq;
                }
            } else {
                // No settings in shared link, apply URL params if any
                applyURLSettings();
            }
            
            // Enter results view mode
            enterResultsViewMode();
            
            // Load CSV data to get full commander info
            const { loadCSV } = await import('./dataLoader.js');
            const { CSV_FILES } = await import('./config.js');
            const timePeriod = document.getElementById('time-period').value;
            const csvFile = CSV_FILES[timePeriod];
            
            if (!csvFile) {
                console.error('Invalid time period:', timePeriod);
                updateStatus('Error: Invalid time period');
                return;
            }
            
            console.log('Loading CSV file:', csvFile);
            const allCommanders = await loadCSV(csvFile);
            console.log('CSV loaded, total commanders:', allCommanders.length);
            
            // Find the commanders by name
            const commanders = commanderNames.map(name => {
                return allCommanders.find(cmd => cmd.name === name);
            }).filter(cmd => cmd !== undefined);
            
            console.log('Found commanders:', commanders.length);
            
            if (commanders.length === 0) {
                console.error('No commanders found matching names');
                updateStatus('Error: Could not find commanders');
                return;
            }
            
            // Clear any existing results
            clearResults();
            
            // Update embed metadata for Discord/social media (async to fetch card image)
            await updateEmbedMetadata(commanders, timePeriod);
            
            // Display results
            const useTextOutput = document.getElementById('text-output').checked;
            console.log('Display mode:', useTextOutput ? 'text' : 'images');
            
            if (useTextOutput) {
                // For text output, fetch all URLs first
                for (const commander of commanders) {
                    commander.edhrec_url = commanderNameToUrl(commander.name);
                    commander.image_url = await getCardImageUrl(commander.name);
                }
                
                displayTextResults({
                    commanders: commanders,
                    total_loaded: commanders.length,
                    filter_description: 'Shared results'
                });
            } else {
                // For card images, need to add URLs first for progressive display
                for (const commander of commanders) {
                    commander.edhrec_url = commanderNameToUrl(commander.name);
                }
                
                // Display progressively (images will be loaded as displayed)
                displayCardImagesProgressive(commanders);
            }
            
            updateStatus(`Loaded ${commanders.length} shared commander(s)`);
        } else {
            console.error('Failed to decode shared results');
            updateStatus('Error loading shared results');
        }
    } else {
        // Normal initialization - Check for URL parameters
        const hasURLParams = applyURLSettings();
        
        if (!hasURLParams) {
            // No URL params, load saved settings from localStorage
            console.log('Loading saved settings from localStorage...');
            loadSettings();
        } else {
            console.log('Settings loaded from URL parameters');
            // Clear URL parameters after applying to allow normal checkbox behavior
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        // If URL params exist, auto-randomize to show results with those settings
        if (hasURLParams) {
            console.log('=== URL PARAMS DETECTED - AUTO-RANDOMIZING ===');
            setTimeout(() => {
                handleRandomize();
            }, 1000);
        } else {
            // Check if there are saved results
            const hasSavedResults = localStorage.getItem('lastCommanders') !== null;
            
            if (hasSavedResults) {
                // Load and display previously generated commanders
                console.log('=== LOADING PREVIOUS RESULTS ===');
                await loadLastResults();
            } else {
                // First-time user: auto-randomize with default settings
                console.log('=== FIRST TIME USER - SCHEDULING AUTO-RANDOMIZE ===');
                setTimeout(() => {
                    console.log('=== AUTO-RANDOMIZE TIMEOUT TRIGGERED ===');
                    handleRandomize();
                }, 1000);
            }
        }
    }
    
    updateMaxRankLabel();
    
    // Try to load logo
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.onerror = () => {
            logo.style.display = 'none';
        };
        logo.onload = () => {
            logo.style.display = 'block';
        };
    }
    
    isInitialized = true;
    
    console.log('=== INITIALIZATION COMPLETE ===');
});
