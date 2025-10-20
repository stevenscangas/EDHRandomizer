// ========================================
// URL PARAMETER HANDLING
// ========================================

import { DEFAULT_SETTINGS } from './config.js';
import { updateStatus } from './ui/display.js';
import { isAdvancedMode } from './ui/colorMode.js';

export function settingsToURLParams(settings) {
    const params = new URLSearchParams();
    
    // Only include non-default values to keep URL shorter
    if (settings.timePeriod !== DEFAULT_SETTINGS.timePeriod) {
        params.set('period', settings.timePeriod);
    }
    if (settings.minRank !== DEFAULT_SETTINGS.minRank) {
        params.set('min', settings.minRank);
    }
    if (settings.maxRank !== DEFAULT_SETTINGS.maxRank) {
        params.set('max', settings.maxRank);
    }
    if (settings.quantity !== DEFAULT_SETTINGS.quantity) {
        params.set('qty', settings.quantity);
    }
    if (settings.enableColorFilter !== DEFAULT_SETTINGS.enableColorFilter) {
        params.set('filter', settings.enableColorFilter ? '1' : '0');
    }
    if (JSON.stringify(settings.selectedColors.sort()) !== JSON.stringify(DEFAULT_SETTINGS.selectedColors.sort())) {
        params.set('colors', settings.selectedColors.join(''));
    }
    if (settings.colorMode !== DEFAULT_SETTINGS.colorMode) {
        params.set('mode', settings.colorMode);
    }
    if (settings.numColors !== DEFAULT_SETTINGS.numColors && settings.numColors !== '') {
        params.set('num', settings.numColors);
    }
    if (settings.selectedColorCounts.length > 0) {
        params.set('counts', settings.selectedColorCounts.join(','));
    }
    if (settings.excludePartners !== DEFAULT_SETTINGS.excludePartners) {
        params.set('nopartners', settings.excludePartners ? '1' : '0');
    }
    if (settings.textOutput !== DEFAULT_SETTINGS.textOutput) {
        params.set('text', settings.textOutput ? '1' : '0');
    }
    if (settings.colorCountMode !== DEFAULT_SETTINGS.colorCountMode) {
        params.set('advanced', settings.colorCountMode === 'advanced' ? '1' : '0');
    }
    
    return params.toString();
}

export function urlParamsToSettings() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.toString() === '') {
        return null; // No URL parameters
    }
    
    const settings = { ...DEFAULT_SETTINGS };
    
    if (params.has('period')) settings.timePeriod = params.get('period');
    if (params.has('min')) settings.minRank = parseInt(params.get('min'));
    if (params.has('max')) settings.maxRank = parseInt(params.get('max'));
    if (params.has('qty')) settings.quantity = parseInt(params.get('qty'));
    if (params.has('filter')) settings.enableColorFilter = params.get('filter') === '1';
    if (params.has('colors')) {
        settings.selectedColors = params.get('colors').split('').filter(c => ['W', 'U', 'B', 'R', 'G'].includes(c));
    }
    if (params.has('mode')) settings.colorMode = params.get('mode');
    if (params.has('num')) settings.numColors = params.get('num');
    if (params.has('counts')) {
        settings.selectedColorCounts = params.get('counts').split(',').filter(c => c);
    }
    if (params.has('nopartners')) settings.excludePartners = params.get('nopartners') === '1';
    if (params.has('text')) settings.textOutput = params.get('text') === '1';
    if (params.has('advanced')) settings.colorCountMode = params.get('advanced') === '1' ? 'advanced' : 'simple';
    
    return settings;
}

export function generateShareURL() {
    // Get current settings
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
        colorCountMode: isAdvancedMode() ? 'advanced' : 'simple'
    };
    
    const params = settingsToURLParams(settings);
    const baseURL = window.location.origin + window.location.pathname;
    
    return params ? `${baseURL}?${params}` : baseURL;
}

export async function copyShareURL() {
    const shareURL = generateShareURL();
    
    try {
        await navigator.clipboard.writeText(shareURL);
        updateStatus('✅ Share URL copied to clipboard!');
        
        // Reset status after 3 seconds
        setTimeout(() => {
            updateStatus('Ready');
        }, 3000);
    } catch (error) {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = shareURL;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            updateStatus('✅ Share URL copied to clipboard!');
            setTimeout(() => {
                updateStatus('Ready');
            }, 3000);
        } catch (err) {
            updateStatus('❌ Failed to copy URL. Please copy manually: ' + shareURL);
        }
        
        document.body.removeChild(textArea);
    }
}

export function applyURLSettings() {
    const urlSettings = urlParamsToSettings();
    
    if (!urlSettings) {
        return false; // No URL parameters found
    }
    
    console.log('Applying settings from URL:', urlSettings);
    
    // Apply settings to form
    document.getElementById('time-period').value = urlSettings.timePeriod;
    document.getElementById('min-rank').value = urlSettings.minRank;
    document.getElementById('max-rank').value = urlSettings.maxRank;
    document.getElementById('quantity').value = urlSettings.quantity;
    document.getElementById('enable-color-filter').checked = urlSettings.enableColorFilter;
    document.getElementById('exclude-partners').checked = urlSettings.excludePartners;
    document.getElementById('text-output').checked = urlSettings.textOutput;
    
    // Show/hide color filter section
    const colorSection = document.getElementById('color-filter-section');
    if (urlSettings.enableColorFilter) {
        colorSection.classList.remove('hidden');
    } else {
        colorSection.classList.add('hidden');
    }
    
    // Apply color selections
    document.querySelectorAll('.color-input').forEach(input => {
        if (urlSettings.selectedColors.includes(input.value)) {
            input.checked = true;
            input.closest('.color-checkbox').classList.add('selected');
        } else {
            input.checked = false;
            input.closest('.color-checkbox').classList.remove('selected');
        }
    });
    
    // Apply color mode
    const modeInput = document.querySelector(`input[name="color-mode"][value="${urlSettings.colorMode}"]`);
    if (modeInput) {
        modeInput.checked = true;
    }
    
    // Apply num colors
    document.getElementById('num-colors').value = urlSettings.numColors;
    
    // Apply color counts (advanced mode)
    document.querySelectorAll('.color-count-input').forEach(input => {
        if (urlSettings.selectedColorCounts.includes(input.value)) {
            input.checked = true;
            input.closest('.color-count-button').classList.add('selected');
        } else {
            input.checked = false;
            input.closest('.color-count-button').classList.remove('selected');
        }
    });
    
    // Apply advanced/simple mode
    if (urlSettings.colorCountMode === 'advanced') {
        const button = document.getElementById('advanced-toggle');
        const simpleMode = document.getElementById('simple-color-count');
        const advancedMode = document.getElementById('advanced-color-count');
        
        simpleMode.classList.add('hidden');
        advancedMode.classList.remove('hidden');
        button.classList.add('active');
        button.textContent = '🔧 Simple';
        localStorage.setItem('colorCountMode', 'advanced');
    }
    
    return true; // URL parameters were applied
}
