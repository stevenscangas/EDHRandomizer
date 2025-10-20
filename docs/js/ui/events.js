// ========================================
// EVENT LISTENERS
// ========================================

import { saveSettings } from '../storage.js';
import { validateColorConfiguration, hideValidationWarning } from './validation.js';
import { toggleAdvancedMode, loadAdvancedModePreference, isAdvancedMode } from './colorMode.js';
import { copyShareURL } from '../urlParams.js';
import { csvInfo } from '../dataLoader.js';
import { DEFAULT_SETTINGS } from '../config.js';
import { updateStatus } from './display.js';

export function setupEventListeners(handleRandomizeCallback, resetToDefaultSettingsCallback) {
    // Time period change
    document.getElementById('time-period').addEventListener('change', () => {
        updateMaxRankLabel();
        saveSettings();
    });
    
    // Save settings on input changes
    document.getElementById('min-rank').addEventListener('change', saveSettings);
    document.getElementById('max-rank').addEventListener('change', saveSettings);
    document.getElementById('quantity').addEventListener('change', saveSettings);
    document.getElementById('exclude-partners').addEventListener('change', saveSettings);
    document.getElementById('text-output').addEventListener('change', saveSettings);
    
    // Color filter toggle
    document.getElementById('enable-color-filter').addEventListener('change', (e) => {
        const section = document.getElementById('color-filter-section');
        if (e.target.checked) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
            hideValidationWarning();
        }
        saveSettings();
    });
    
    // Color checkbox visual feedback
    document.querySelectorAll('.color-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const label = e.target.closest('.color-checkbox');
            if (e.target.checked) {
                label.classList.add('selected');
            } else {
                label.classList.remove('selected');
            }
            validateColorConfiguration();
            saveSettings();
        });
    });
    
    // Validation on mode change
    document.querySelectorAll('input[name="color-mode"]').forEach(input => {
        input.addEventListener('change', () => {
            validateColorConfiguration();
            saveSettings();
        });
    });
    
    // Validation on num colors change
    document.getElementById('num-colors').addEventListener('change', () => {
        validateColorConfiguration();
        saveSettings();
    });
    
    // Validation on advanced mode color count buttons
    document.querySelectorAll('.color-count-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const label = e.target.closest('.color-count-button');
            if (e.target.checked) {
                label.classList.add('selected');
            } else {
                label.classList.remove('selected');
            }
            validateColorConfiguration();
            saveSettings();
        });
    });
    
    // Advanced toggle
    document.getElementById('advanced-toggle').addEventListener('click', toggleAdvancedMode);
    
    // Randomize button
    document.getElementById('randomize-btn').addEventListener('click', handleRandomizeCallback);
    
    // Reset button
    document.getElementById('reset-btn').addEventListener('click', resetToDefaultSettingsCallback);
    
    // Share button
    document.getElementById('share-btn').addEventListener('click', copyShareURL);
    
    // Load advanced mode preference from localStorage
    loadAdvancedModePreference();
}

export function updateMaxRankLabel() {
    const timePeriod = document.getElementById('time-period').value;
    const info = csvInfo[timePeriod];
    
    if (info && info.max_rank) {
        document.getElementById('max-rank-help').textContent = `(Max: ${info.max_rank})`;
        
        // Update max rank if it exceeds the new max
        const maxRankInput = document.getElementById('max-rank');
        const currentMax = parseInt(maxRankInput.value);
        if (currentMax > info.max_rank) {
            maxRankInput.value = info.max_rank;
        }
    }
}

export function getColorFilterSettings() {
    const enabled = document.getElementById('enable-color-filter').checked;
    
    if (!enabled) {
        return { colors: null, color_mode: 'exactly', num_colors: null, min_colors: null, max_colors: null };
    }
    
    // Get selected colors
    const colorInputs = document.querySelectorAll('.color-input:checked');
    const selectedColors = Array.from(colorInputs).map(input => input.value);
    
    // Get color mode
    const colorMode = document.querySelector('input[name="color-mode"]:checked').value;
    
    // Check which mode we're in
    if (isAdvancedMode()) {
        // Advanced mode - get selected color counts as array
        const colorCountInputs = document.querySelectorAll('.color-count-input:checked');
        const selectedColorCounts = Array.from(colorCountInputs).map(input => parseInt(input.value));
        
        // Build colors string
        let colors = null;
        if (selectedColors.length > 0 || selectedColorCounts.length > 0) {
            colors = selectedColors.join(',');
        }
        
        return { colors, color_mode: colorMode, num_colors: null, selected_color_counts: selectedColorCounts };
    } else {
        // Simple mode - get exact number
        const numColorsInput = document.getElementById('num-colors').value;
        const numColors = numColorsInput ? parseInt(numColorsInput) : null;
        
        // Build colors string
        let colors = null;
        if (selectedColors.length > 0 || numColors !== null) {
            colors = selectedColors.join(',');
        }
        
        return { colors, color_mode: colorMode, num_colors: numColors, min_colors: null, max_colors: null };
    }
}

export function resetToDefaultSettings() {
    console.log('Resetting to default settings...');
    
    // Clear all localStorage
    localStorage.clear();
    
    // Clear URL parameters (return to normal mode)
    const cleanURL = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanURL);
    
    // Apply default settings using the DEFAULT_SETTINGS object
    document.getElementById('time-period').value = DEFAULT_SETTINGS.timePeriod;
    document.getElementById('min-rank').value = DEFAULT_SETTINGS.minRank;
    document.getElementById('max-rank').value = DEFAULT_SETTINGS.maxRank;
    document.getElementById('quantity').value = DEFAULT_SETTINGS.quantity;
    document.getElementById('enable-color-filter').checked = DEFAULT_SETTINGS.enableColorFilter;
    document.getElementById('exclude-partners').checked = DEFAULT_SETTINGS.excludePartners;
    document.getElementById('text-output').checked = DEFAULT_SETTINGS.textOutput;
    
    // Show/hide color filter section based on defaults
    const colorSection = document.getElementById('color-filter-section');
    if (DEFAULT_SETTINGS.enableColorFilter) {
        colorSection.classList.remove('hidden');
    } else {
        colorSection.classList.add('hidden');
    }
    
    // Apply default color selections
    document.querySelectorAll('.color-input').forEach(input => {
        if (DEFAULT_SETTINGS.selectedColors.includes(input.value)) {
            input.checked = true;
            input.closest('.color-checkbox').classList.add('selected');
        } else {
            input.checked = false;
            input.closest('.color-checkbox').classList.remove('selected');
        }
    });
    
    // Apply default color mode
    document.querySelector(`input[name="color-mode"][value="${DEFAULT_SETTINGS.colorMode}"]`).checked = true;
    
    // Apply default num colors
    document.getElementById('num-colors').value = DEFAULT_SETTINGS.numColors;
    
    // Apply default color count buttons
    document.querySelectorAll('.color-count-input').forEach(input => {
        if (DEFAULT_SETTINGS.selectedColorCounts.includes(input.value)) {
            input.checked = true;
            input.closest('.color-count-button').classList.add('selected');
        } else {
            input.checked = false;
            input.closest('.color-count-button').classList.remove('selected');
        }
    });
    
    // Reset to simple mode (default)
    const simpleMode = document.getElementById('simple-color-count');
    const advancedMode = document.getElementById('advanced-color-count');
    const button = document.getElementById('advanced-toggle');
    
    advancedMode.classList.add('hidden');
    simpleMode.classList.remove('hidden');
    button.classList.remove('active');
    button.textContent = '🔧 Advanced';
    
    // Hide validation warning
    hideValidationWarning();
    
    // Update max rank label
    updateMaxRankLabel();
    
    console.log('Reset complete - returned to normal mode');
    updateStatus('Settings reset to defaults');
}
