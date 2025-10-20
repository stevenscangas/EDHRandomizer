// Commander Randomizer Web Frontend

const API_BASE = '';  // Same origin

// State
let csvInfo = {};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== PAGE LOADED - INITIALIZING ===');
    console.log('Setting up event listeners...');
    setupEventListeners();
    
    console.log('Loading CSV info...');
    await loadCsvInfo();
    console.log('CSV info loaded:', csvInfo);
    
    updateMaxRankLabel();
    
    // Try to load logo (using class selector since it doesn't have an id)
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.onerror = () => {
            logo.style.display = 'none';
        };
        logo.onload = () => {
            logo.style.display = 'block';
        };
    }
    
    // Auto-randomize on page load
    console.log('=== SCHEDULING AUTO-RANDOMIZE ===');
    setTimeout(() => {
        console.log('=== AUTO-RANDOMIZE TIMEOUT TRIGGERED ===');
        randomizeCommanders();
    }, 1000); // Increased delay to 1 second
    console.log('=== INITIALIZATION COMPLETE ===');
});

function setupEventListeners() {
    // Time period change
    document.getElementById('time-period').addEventListener('change', updateMaxRankLabel);
    
    // Color filter toggle
    document.getElementById('enable-color-filter').addEventListener('change', (e) => {
        const section = document.getElementById('color-filter-section');
        if (e.target.checked) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
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
            // Check validation when colors change
            validateColorConfiguration();
        });
    });
    
    // Validation on mode change
    document.querySelectorAll('input[name="color-mode"]').forEach(input => {
        input.addEventListener('change', validateColorConfiguration);
    });
    
    // Validation on num colors change
    document.getElementById('num-colors').addEventListener('change', validateColorConfiguration);
    
    // Validation on advanced mode changes
    document.getElementById('min-colors').addEventListener('change', validateColorConfiguration);
    document.getElementById('max-colors').addEventListener('change', validateColorConfiguration);
    
    // Advanced toggle
    document.getElementById('advanced-toggle').addEventListener('click', toggleAdvancedMode);
    
    // Validation on color filter toggle
    document.getElementById('enable-color-filter').addEventListener('change', (e) => {
        const section = document.getElementById('color-filter-section');
        if (e.target.checked) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
            hideValidationWarning(); // Hide warning when filter is disabled
        }
    });
    
    // Text output toggle - no longer needs event listener since it just changes display mode
    
    // Randomize button
    document.getElementById('randomize-btn').addEventListener('click', randomizeCommanders);
    
    // Clear button
    document.getElementById('clear-btn').addEventListener('click', clearResults);
    
    // Load advanced mode preference from localStorage
    loadAdvancedModePreference();
}

async function loadCsvInfo() {
    try {
        const response = await fetch(`${API_BASE}/api/info`);
        csvInfo = await response.json();
    } catch (error) {
        console.error('Error loading CSV info:', error);
        updateStatus('Error loading data files');
    }
}

function updateMaxRankLabel() {
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

function validateInputs() {
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

function toggleAdvancedMode() {
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
}

function loadAdvancedModePreference() {
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

function isAdvancedMode() {
    const advancedMode = document.getElementById('advanced-color-count');
    return !advancedMode.classList.contains('hidden');
}

function getColorFilterSettings() {
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
        // Advanced mode - get min and max
        const minColorsInput = document.getElementById('min-colors').value;
        const maxColorsInput = document.getElementById('max-colors').value;
        const minColors = minColorsInput ? parseInt(minColorsInput) : null;
        const maxColors = maxColorsInput ? parseInt(maxColorsInput) : null;
        
        // Build colors string
        let colors = null;
        if (selectedColors.length > 0 || minColors !== null || maxColors !== null) {
            colors = selectedColors.join(',');
        }
        
        return { colors, color_mode: colorMode, num_colors: null, min_colors: minColors, max_colors: maxColors };
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

// ========================================
// VALIDATION FUNCTIONS
// ========================================

function validateColorConfiguration() {
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
        // Advanced mode validation
        const minColorsValue = document.getElementById('min-colors').value;
        const maxColorsValue = document.getElementById('max-colors').value;
        const minColors = minColorsValue ? parseInt(minColorsValue) : null;
        const maxColors = maxColorsValue ? parseInt(maxColorsValue) : null;
        
        // Rule 1: Min > Max
        if (minColors !== null && maxColors !== null && minColors > maxColors) {
            validationResult = {
                valid: false,
                message: `Invalid: Min colors (${minColors}) cannot be greater than max colors (${maxColors}).`
            };
        }
        
        // Rule 2: ANY colors selected + max colors = 0 (Colorless range ending at 0)
        else if (selectedColors > 0 && maxColors === 0) {
            validationResult = {
                valid: false,
                message: `Invalid: You have ${selectedColors} color(s) selected, but max of 0 colors means only colorless commanders. This will return no results.`
            };
        }
        
        // Rule 3: "Including" mode with max colors < selected colors
        else if (colorMode === 'including' && maxColors !== null && maxColors < selectedColors) {
            validationResult = {
                valid: false,
                message: `Invalid: "Including" requires commanders with ALL ${selectedColors} selected colors, but your max is ${maxColors} colors total. This will return no results.`
            };
        }
        
        // Rule 4: "Exactly" mode with range (doesn't make sense with a range)
        else if (colorMode === 'exactly' && selectedColors > 0 && minColors !== null && maxColors !== null && minColors !== maxColors) {
            validationResult = {
                valid: false,
                message: `Invalid: "Exactly" mode doesn't work with a color count range. Use "Including" or "At Most" instead, or set the same min and max.`
            };
        }
        
        // Rule 5: "At Most" mode with min colors > selected colors
        else if (colorMode === 'atmost' && selectedColors > 0 && minColors !== null && minColors > selectedColors) {
            validationResult = {
                valid: false,
                message: `Invalid: "At Most" with ${selectedColors} colors selected means commanders can only use those ${selectedColors} colors, but your min is ${minColors} colors. This will return no results.`
            };
        }
        
    } else {
        // Simple mode validation (existing logic)
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

function showValidationWarning(message) {
    const warningElement = document.getElementById('validation-warning');
    const messageElement = document.getElementById('validation-message');
    messageElement.textContent = message;
    warningElement.classList.remove('hidden');
}

function hideValidationWarning() {
    const warningElement = document.getElementById('validation-warning');
    warningElement.classList.add('hidden');
}

function getResultMessage(result, requestedQuantity, validationResult) {
    const commandersCount = result.commanders ? result.commanders.length : 0;
    
    // No results
    if (commandersCount === 0) {
        // Check if configuration is invalid
        if (!validationResult.valid) {
            return `❌ No results found. ${validationResult.message}`;
        }
        // Valid configuration but no results
        return `⚠️ No commanders found with current filters. Configuration is valid - try expanding your rank range or adjusting filters.`;
    }
    
    // Got some results but less than requested
    if (commandersCount < requestedQuantity) {
        return `⚠️ Found ${commandersCount} of ${requestedQuantity} requested commanders. Not enough commanders match your filters in this rank range. Try expanding your range or adjusting filters.`;
    }
    
    // Got all requested results
    return `✅ Successfully selected ${commandersCount} commander(s)`;
}

// ========================================
// END VALIDATION FUNCTIONS
// ========================================

async function randomizeCommanders() {
    console.log('randomizeCommanders called');
    
    // Validate inputs
    const validation = validateInputs();
    if (!validation) {
        console.error('Validation failed');
        return;
    }
    
    const { minRank, maxRank, quantity } = validation;
    const timePeriod = document.getElementById('time-period').value;
    const { colors, color_mode, num_colors, min_colors, max_colors } = getColorFilterSettings();
    const excludePartners = document.getElementById('exclude-partners').checked;
    const useTextOutput = document.getElementById('text-output').checked;
    
    // Validate color configuration
    const colorValidation = validateColorConfiguration();
    
    console.log('Request params:', { minRank, maxRank, quantity, timePeriod, colors, color_mode, num_colors, min_colors, max_colors });
    
    // Clear previous results
    clearResults();
    
    // Show loading
    updateStatus('Loading commanders...');
    document.getElementById('randomize-btn').disabled = true;
    document.getElementById('loading-indicator').classList.remove('hidden');
    
    try {
        // Call API
        const response = await fetch(`${API_BASE}/api/randomize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                time_period: timePeriod,
                min_rank: minRank,
                max_rank: maxRank,
                quantity: quantity,
                colors: colors,
                color_mode: color_mode,
                num_colors: num_colors,
                min_colors: min_colors,
                max_colors: max_colors,
                exclude_partners: excludePartners
            })
        });
        
        const result = await response.json();
        console.log('API response:', result);
        
        if (!result.success) {
            alert(`Error: ${result.error}`);
            updateStatus(`Error: ${result.error}`);
            return;
        }
        
        const commanders = result.commanders;
        const commandersCount = commanders ? commanders.length : 0;
        
        // Generate appropriate status message
        const statusMessage = getResultMessage(result, quantity, colorValidation);
        
        // Display results - either text or card images, not both
        if (commandersCount > 0) {
            if (useTextOutput) {
                displayTextResults(result);
            } else {
                displayCardImages(commanders);
            }
            updateStatus(statusMessage);
        } else {
            // No results - show appropriate message (warning banner already visible if invalid)
            updateStatus(statusMessage);
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert(`An error occurred: ${error.message}`);
        updateStatus(`Error: ${error.message}`);
    } finally {
        document.getElementById('randomize-btn').disabled = false;
        document.getElementById('loading-indicator').classList.add('hidden');
    }
}

function displayTextResults(result) {
    const container = document.getElementById('cards-container');
    
    let output = '';
    
    output += `Loaded ${result.total_loaded} commanders from ${result.filter_description}\n\n`;
    output += `Selecting ${result.quantity_requested} random commander(s)...\n\n`;
    output += '='.repeat(60) + '\n';
    output += `Selected ${result.commanders.length} Commander(s):\n`;
    output += '='.repeat(60) + '\n\n';
    
    result.commanders.forEach((cmd, i) => {
        output += `${i + 1}. ${cmd.name}\n`;
        output += `   Rank: ${cmd.rank}\n`;
        const colorDisplay = cmd.colors || 'Colorless';
        output += `   Colors: ${colorDisplay}\n`;
        output += `   CMC: ${cmd.cmc}\n`;
        output += `   Rarity: ${cmd.rarity}\n`;
        output += `   Type: ${cmd.type}\n`;
        output += `   URL: ${cmd.edhrec_url}\n\n`;
    });
    
    output += '='.repeat(60) + '\n';
    
    // Display text output in the cards container as a pre element
    const pre = document.createElement('pre');
    pre.className = 'results-text';
    pre.textContent = output;
    container.appendChild(pre);
}

function displayCardImages(commanders) {
    const container = document.getElementById('cards-container');
    
    commanders.forEach(cmd => {
        const wrapper = document.createElement('div');
        wrapper.className = 'card-wrapper';
        wrapper.addEventListener('click', () => {
            if (cmd.edhrec_url) {
                window.open(cmd.edhrec_url, '_blank');
            }
        });
        
        // Card image
        const img = document.createElement('img');
        img.className = 'card-image';
        img.alt = cmd.name;
        
        if (cmd.image_url) {
            img.src = cmd.image_url;
            img.onerror = () => {
                // If image fails to load, show placeholder
                img.alt = `${cmd.name} (Image not found)`;
                img.style.display = 'none';
                const placeholder = document.createElement('div');
                placeholder.className = 'card-placeholder';
                placeholder.textContent = `❌\n${cmd.name}\n(Image not found)`;
                placeholder.style.cssText = 'color: red; text-align: center; padding: 20px;';
                wrapper.insertBefore(placeholder, wrapper.firstChild);
            };
        } else {
            // No image URL available
            img.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'card-placeholder';
            placeholder.textContent = `❌\n${cmd.name}\n(Image not available)`;
            placeholder.style.cssText = 'color: red; text-align: center; padding: 20px;';
            wrapper.appendChild(placeholder);
        }
        
        wrapper.appendChild(img);
        
        // Card name
        const name = document.createElement('div');
        name.className = 'card-name';
        name.textContent = cmd.name;
        wrapper.appendChild(name);
        
        // Card rank
        const rank = document.createElement('div');
        rank.className = 'card-rank';
        rank.textContent = `Rank #${cmd.rank}`;
        wrapper.appendChild(rank);
        
        container.appendChild(wrapper);
    });
}

function clearResults() {
    // Clear the cards container (which now holds both images and text output)
    document.getElementById('cards-container').innerHTML = '';
    updateStatus('Ready');
}

function updateStatus(message) {
    document.getElementById('status-text').textContent = message;
}
