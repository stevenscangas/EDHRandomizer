// ========================================
// ADVANCED COLOR MODE FUNCTIONS
// ========================================

import { validateColorConfiguration } from './validation.js';
import { saveSettings } from '../storage.js';

export function toggleAdvancedMode() {
    const button = document.getElementById('advanced-toggle');
    const simpleMode = document.getElementById('simple-color-count');
    const advancedMode = document.getElementById('advanced-color-count');
    
    const isAdvanced = advancedMode.classList.contains('hidden');
    
    if (isAdvanced) {
        // Switch to advanced mode
        simpleMode.classList.add('hidden');
        advancedMode.classList.remove('hidden');
        button.classList.add('active');
        button.textContent = '🔧 Simple';
        
        // Save preference
        localStorage.setItem('colorCountMode', 'advanced');
    } else {
        // Switch to simple mode
        advancedMode.classList.add('hidden');
        simpleMode.classList.remove('hidden');
        button.classList.remove('active');
        button.textContent = '🔧 Advanced';
        
        // Save preference
        localStorage.setItem('colorCountMode', 'simple');
    }
    
    // Re-validate after mode switch
    validateColorConfiguration();
    
    // Save all settings
    saveSettings();
}

export function loadAdvancedModePreference() {
    const savedMode = localStorage.getItem('colorCountMode');
    
    if (savedMode === 'advanced') {
        // Trigger the toggle to switch to advanced mode
        const button = document.getElementById('advanced-toggle');
        const simpleMode = document.getElementById('simple-color-count');
        const advancedMode = document.getElementById('advanced-color-count');
        
        simpleMode.classList.add('hidden');
        advancedMode.classList.remove('hidden');
        button.classList.add('active');
        button.textContent = '🔧 Simple';
    }
}

export function isAdvancedMode() {
    const advancedMode = document.getElementById('advanced-color-count');
    return !advancedMode.classList.contains('hidden');
}
