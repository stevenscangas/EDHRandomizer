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
    const resultsParam = urlParams.get('results');
    
    if (resultsParam) {
        console.log('=== SHARED RESULTS DETECTED ===');
        
        // Apply settings from URL (if any)
        applyURLSettings();
        
        // Decode and display the shared results
        const commanderNames = decodeResultsFromURL(resultsParam);
        
        if (commanderNames && commanderNames.length > 0) {
            console.log(`Loading ${commanderNames.length} shared commanders...`);
            
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
