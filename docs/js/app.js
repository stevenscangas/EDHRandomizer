// ========================================
// MAIN APPLICATION ENTRY POINT
// ========================================

import { getCsvInfo, csvInfo } from './dataLoader.js';
import { applyURLSettings } from './urlParams.js';
import { loadSettings, loadLastResults } from './storage.js';
import { setupEventListeners, updateMaxRankLabel, resetToDefaultSettings } from './ui/events.js';
import { handleRandomize } from './services/commanderService.js';

let isInitialized = false;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== PAGE LOADED - INITIALIZING ===');
    console.log('Setting up event listeners...');
    setupEventListeners(handleRandomize, resetToDefaultSettings);
    
    console.log('Loading CSV info...');
    await getCsvInfo();
    console.log('CSV info loaded:', csvInfo);
    
    // Check for URL parameters first (they override localStorage)
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
    
    console.log('=== INITIALIZATION COMPLETE ===');
});
