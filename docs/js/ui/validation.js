// ========================================
// VALIDATION FUNCTIONS
// ========================================

import { isAdvancedMode } from './colorMode.js';

export function validateColorConfiguration() {
    const enabled = document.getElementById('enable-color-filter').checked;
    
    if (!enabled) {
        hideValidationWarning();
        return { valid: true, message: null };
    }
    
    const colorInputs = document.querySelectorAll('.color-input:checked');
    const selectedColors = colorInputs.length;
    const colorMode = document.querySelector('input[name="color-mode"]:checked').value;
    
    let validationResult = { valid: true, message: null };
    
    if (isAdvancedMode()) {
        // Advanced mode validation - multi-select color counts
        const colorCountInputs = document.querySelectorAll('.color-count-input:checked');
        const selectedColorCounts = Array.from(colorCountInputs).map(input => parseInt(input.value));
        
        // If any color count buttons are selected, disable validation entirely
        if (selectedColorCounts.length > 0) {
            hideValidationWarning();
            return { valid: true, message: null };
        }
        
        // Rule 1: Colors selected + colorless (0) selected
        if (selectedColors > 0 && selectedColorCounts.includes(0)) {
            validationResult = {
                valid: false,
                message: `Invalid: You have ${selectedColors} color(s) selected with "Colorless" (0). Colorless means NO colors. This will return no results.`
            };
        }
        
        // Rule 2: "Including" mode with selected color counts less than number of selected colors
        else if (colorMode === 'including' && selectedColorCounts.length > 0) {
            const maxSelectedCount = Math.max(...selectedColorCounts);
            if (maxSelectedCount < selectedColors) {
                validationResult = {
                    valid: false,
                    message: `Invalid: "Including" requires commanders with ALL ${selectedColors} selected colors, but your highest color count is ${maxSelectedCount}. This will return no results.`
                };
            }
        }
        
        // Rule 3: "At Most" mode with selected color counts greater than number of selected colors
        else if (colorMode === 'atmost' && selectedColors > 0 && selectedColorCounts.length > 0) {
            const minSelectedCount = Math.min(...selectedColorCounts);
            if (minSelectedCount > selectedColors) {
                validationResult = {
                    valid: false,
                    message: `Invalid: "At Most" with ${selectedColors} colors selected means commanders can only use those ${selectedColors} colors, but your lowest color count is ${minSelectedCount}. This will return no results.`
                };
            }
        }
    } else {
        // Simple mode validation
        const numColorsValue = document.getElementById('num-colors').value;
        const numColors = numColorsValue ? parseInt(numColorsValue) : null;
        
        // Rule 1: ANY colors selected + # of colors = 0 (Colorless)
        if (selectedColors > 0 && numColors === 0) {
            validationResult = {
                valid: false,
                message: `Invalid: You have ${selectedColors} color(s) selected, but "0 - Colorless" means commanders with NO colors. This will return no results.`
            };
        }
        
        // Rule 2: "Including" mode with # of colors < selected colors
        else if (colorMode === 'including' && numColors !== null && numColors < selectedColors) {
            validationResult = {
                valid: false,
                message: `Invalid: "Including" requires commanders with ALL ${selectedColors} selected colors, but you've limited to ${numColors} colors total. This will return no results.`
            };
        }
        
        // Rule 3: "Exactly" mode with # of colors != selected colors (when colors are selected)
        else if (colorMode === 'exactly' && selectedColors > 0 && numColors !== null && numColors !== selectedColors) {
            validationResult = {
                valid: false,
                message: `Invalid: "Exactly" mode with ${selectedColors} colors selected requires # of colors to be ${selectedColors}, but you've set it to ${numColors}. This will return no results.`
            };
        }
        
        // Rule 4: "Including" mode with more selected colors than possible
        else if (colorMode === 'including' && selectedColors > 5) {
            validationResult = {
                valid: false,
                message: `Invalid: Cannot require more than 5 colors (WUBRG).`
            };
        }
        
        // Rule 5: "At Most" mode with # of colors > selected colors
        else if (colorMode === 'atmost' && selectedColors > 0 && numColors !== null && numColors > selectedColors) {
            validationResult = {
                valid: false,
                message: `Invalid: "At Most" with ${selectedColors} colors selected means commanders can only use those ${selectedColors} colors, but you've set # of colors to ${numColors}. This will return no results.`
            };
        }
    }
    
    // Update UI
    if (validationResult.valid) {
        hideValidationWarning();
    } else {
        showValidationWarning(validationResult.message);
    }
    
    return validationResult;
}

export function showValidationWarning(message) {
    const warningElement = document.getElementById('validation-warning');
    const messageElement = document.getElementById('validation-message');
    messageElement.textContent = message;
    warningElement.classList.remove('hidden');
}

export function hideValidationWarning() {
    const warningElement = document.getElementById('validation-warning');
    warningElement.classList.add('hidden');
}

export function validateInputs() {
    const minRank = parseInt(document.getElementById('min-rank').value);
    const maxRank = parseInt(document.getElementById('max-rank').value);
    const quantity = parseInt(document.getElementById('quantity').value);
    
    if (minRank < 1) {
        alert('Minimum rank must be at least 1');
        return null;
    }
    
    if (maxRank < minRank) {
        alert('Maximum rank must be greater than or equal to minimum rank');
        return null;
    }
    
    if (quantity < 1) {
        alert('Quantity must be at least 1');
        return null;
    }
    
    return { minRank, maxRank, quantity };
}
