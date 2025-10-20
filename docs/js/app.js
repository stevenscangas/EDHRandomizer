// Commander Randomizer - Pure Client-Side JavaScript
// Replicates Flask backend functionality without any server

// ========================================
// DATA LOADING & CSV PARSING
// ========================================

const CSV_FILES = {
    'Weekly': 'data/top_commanders_week.csv',
    'Monthly': 'data/top_commanders_month.csv',
    '2-Year': 'data/top_commanders_2year.csv'
};

// Global state
let commandersCache = {};
let csvInfo = {};

// Load and parse CSV file
async function loadCSV(filename) {
    if (commandersCache[filename]) {
        return commandersCache[filename];
    }
    
    try {
        const response = await fetch(filename);
        const text = await response.text();
        
        const commanders = parseCSV(text);
        commandersCache[filename] = commanders;
        return commanders;
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        return [];
    }
}

// Parse CSV text to commander objects
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const commanders = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Parse CSV line (handle quoted fields)
        const values = parseCSVLine(line);
        
        if (values.length < headers.length) continue;
        
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        
        // Skip undefined rows
        if (row['Rank'] === 'undefined' || row['Name'] === 'undefined') {
            continue;
        }
        
        try {
            const rank = parseInt(row['Rank']);
            if (isNaN(rank)) continue;
            
            commanders.push({
                rank: rank,
                name: row['Name'],
                colors: row['Colors'] || '',
                cmc: row['CMC'] || '',
                rarity: row['Rarity'] || '',
                type: row['Type'] || ''
            });
        } catch (e) {
            continue;
        }
    }
    
    return commanders;
}

// Parse a single CSV line handling quoted fields
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
        } else {
            current += char;
        }
    }
    
    values.push(current.trim().replace(/^"|"$/g, ''));
    return values;
}

// ========================================
// COMMANDER FILTERING LOGIC (from commander_data.py)
// ========================================

function filterByColors(commanders, colors, mode, numColors = null) {
    // First filter by number of colors if specified
    if (numColors !== null) {
        commanders = commanders.filter(commander => {
            const commanderColorCount = commander.colors.replace(/,/g, '').replace(/ /g, '').length;
            return commanderColorCount === numColors;
        });
        
        // If we only want colorless (0 colors) and no specific colors selected, return now
        if (numColors === 0) {
            return commanders;
        }
    }
    
    // Handle colorless filter explicitly
    if (colors === '') {
        return commanders.filter(c => c.colors === '');
    }
    
    if (colors === null || colors === undefined) {
        return commanders;
    }
    
    // Parse the color set
    const filterColors = new Set(colors.toUpperCase().replace(/,/g, '').replace(/ /g, '').split(''));
    
    // If no colors specified but numColors was used, we already filtered
    if (filterColors.size === 0) {
        return commanders;
    }
    
    const filtered = [];
    for (const commander of commanders) {
        const commanderColors = new Set(commander.colors.replace(/,/g, '').replace(/ /g, '').split(''));
        
        if (mode === 'exactly') {
            // Commander must have exactly these colors (no more, no less)
            if (areSetsEqual(commanderColors, filterColors)) {
                filtered.push(commander);
            }
        } else if (mode === 'including') {
            // Commander must include all specified colors (can have more)
            if (isSubset(filterColors, commanderColors)) {
                filtered.push(commander);
            }
        } else if (mode === 'atmost') {
            // Commander can only use colors from the specified set (subset or equal)
            if (isSubset(commanderColors, filterColors)) {
                filtered.push(commander);
            }
        }
    }
    
    return filtered;
}

// Helper: Check if two sets are equal
function areSetsEqual(set1, set2) {
    if (set1.size !== set2.size) return false;
    for (const item of set1) {
        if (!set2.has(item)) return false;
    }
    return true;
}

// Helper: Check if set1 is a subset of set2
function isSubset(set1, set2) {
    for (const item of set1) {
        if (!set2.has(item)) return false;
    }
    return true;
}

// Select random commanders
function selectRandomCommanders(commanders, minRank, maxRank, quantity, colors = null, colorMode = 'including', numColors = null) {
    // Filter commanders by rank range
    let filtered = commanders.filter(c => c.rank >= minRank && c.rank <= maxRank);
    
    // Apply color filter if specified
    if (colors !== null || numColors !== null) {
        filtered = filterByColors(filtered, colors, colorMode, numColors);
    }
    
    if (filtered.length === 0) {
        console.log(`No commanders found in rank range ${minRank}-${maxRank} with the specified color filter`);
        return [];
    }
    
    if (quantity > filtered.length) {
        console.log(`Warning: Only ${filtered.length} commanders available with current filters`);
        console.log(`Returning all ${filtered.length} commanders instead of ${quantity}`);
        quantity = filtered.length;
    }
    
    // Randomly select the specified quantity
    const selected = [];
    const available = [...filtered];
    
    for (let i = 0; i < quantity; i++) {
        const randomIndex = Math.floor(Math.random() * available.length);
        selected.push(available[randomIndex]);
        available.splice(randomIndex, 1);
    }
    
    return selected;
}

// ========================================
// URL GENERATION (from url_utils.py)
// ========================================

function normalizeName(name) {
    // Remove commas
    name = name.replace(/,/g, '');
    
    // Remove apostrophes
    name = name.replace(/'/g, '');
    
    // Remove quotes
    name = name.replace(/"/g, '');
    
    // Normalize unicode characters
    name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Replace spaces with hyphens
    name = name.replace(/ /g, '-');
    
    // Convert to lowercase
    name = name.toLowerCase();
    
    return name;
}

function commanderNameToUrl(name) {
    // Handle partner commanders (with //)
    if (name.includes('//')) {
        const parts = name.split('//');
        const convertedParts = parts.map(part => normalizeName(part.trim()));
        const slug = convertedParts.join('-');
        return `https://edhrec.com/commanders/${slug}`;
    } else {
        const slug = normalizeName(name);
        return `https://edhrec.com/commanders/${slug}`;
    }
}

// ========================================
// SCRYFALL API INTEGRATION
// ========================================

async function getCardImageUrl(commanderName, version = 'normal') {
    try {
        // Handle partner commanders
        let searchName = commanderName;
        if (commanderName.includes('//')) {
            searchName = commanderName.split('//')[0].trim();
        }
        
        const url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(searchName)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            return null;
        }
        
        const data = await response.json();
        
        // Get image URL
        if (data.image_uris && data.image_uris[version]) {
            return data.image_uris[version];
        } else if (data.card_faces && data.card_faces[0].image_uris) {
            return data.card_faces[0].image_uris[version];
        }
        
        return null;
    } catch (error) {
        console.error(`Error fetching image URL for ${commanderName}:`, error);
        return null;
    }
}

// ========================================
// COMMANDER SERVICE (from commander_service.py)
// ========================================

async function getCsvInfo() {
    const info = {};
    
    for (const [period, csvFile] of Object.entries(CSV_FILES)) {
        try {
            const commanders = await loadCSV(csvFile);
            const maxRank = commanders.length > 0 ? Math.max(...commanders.map(c => c.rank)) : 0;
            
            info[period] = {
                file: csvFile,
                max_rank: maxRank,
                count: commanders.length
            };
        } catch (error) {
            info[period] = {
                file: csvFile,
                max_rank: 0,
                count: 0,
                error: error.message
            };
        }
    }
    
    return info;
}

async function randomizeCommanders(timePeriod, minRank, maxRank, quantity, colors, colorMode, numColors, excludePartners) {
    try {
        const csvFile = CSV_FILES[timePeriod];
        if (!csvFile) {
            return {
                success: false,
                error: `Invalid time period: ${timePeriod}`
            };
        }
        
        // Load commanders
        let commanders = await loadCSV(csvFile);
        const totalLoaded = commanders.length;
        
        // Filter out partners if requested
        if (excludePartners) {
            commanders = commanders.filter(c => !c.name.includes(' // '));
        }
        
        // Build filter description
        let filterDesc = `${timePeriod} ranks ${minRank}-${maxRank}`;
        if (colors !== null || numColors !== null) {
            if (numColors !== null) {
                filterDesc += ` with exactly ${numColors} color(s)`;
                if (colors) {
                    const modeDesc = {'exactly': 'exactly', 'including': 'including', 'atmost': 'at most'}[colorMode];
                    filterDesc += ` (${modeDesc}: ${colors})`;
                }
            } else if (colors) {
                const modeDesc = {'exactly': 'exactly', 'including': 'including', 'atmost': 'at most'}[colorMode];
                filterDesc += ` with ${modeDesc} colors: ${colors}`;
            } else if (colors === '') {
                filterDesc += ' (colorless only)';
            }
        }
        
        if (excludePartners) {
            filterDesc += ' (excluding partners)';
        }
        
        // Select random commanders
        const selected = selectRandomCommanders(
            commanders, minRank, maxRank, quantity, colors, colorMode, numColors
        );
        
        return {
            success: true,
            commanders: selected,
            total_available: commanders.length,
            total_loaded: totalLoaded,
            filter_description: filterDesc,
            quantity_requested: quantity,
            quantity_returned: selected.length
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// ========================================
// UI FUNCTIONS
// ========================================

let isInitialized = false;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== PAGE LOADED - INITIALIZING ===');
    console.log('Setting up event listeners...');
    setupEventListeners();
    
    console.log('Loading CSV info...');
    csvInfo = await getCsvInfo();
    console.log('CSV info loaded:', csvInfo);
    
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
    
    // Auto-randomize on page load
    console.log('=== SCHEDULING AUTO-RANDOMIZE ===');
    setTimeout(() => {
        console.log('=== AUTO-RANDOMIZE TIMEOUT TRIGGERED ===');
        handleRandomize();
    }, 1000);
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
            hideValidationWarning();
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
            validateColorConfiguration();
        });
    });
    
    // Validation on mode change
    document.querySelectorAll('input[name="color-mode"]').forEach(input => {
        input.addEventListener('change', validateColorConfiguration);
    });
    
    // Validation on num colors change
    document.getElementById('num-colors').addEventListener('change', validateColorConfiguration);
    
    // Randomize button
    document.getElementById('randomize-btn').addEventListener('click', handleRandomize);
    
    // Clear button
    document.getElementById('clear-btn').addEventListener('click', clearResults);
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

function getColorFilterSettings() {
    const enabled = document.getElementById('enable-color-filter').checked;
    
    if (!enabled) {
        return { colors: null, color_mode: 'exactly', num_colors: null };
    }
    
    // Get selected colors
    const colorInputs = document.querySelectorAll('.color-input:checked');
    const selectedColors = Array.from(colorInputs).map(input => input.value);
    
    // Get color mode
    const colorMode = document.querySelector('input[name="color-mode"]:checked').value;
    
    // Get number of colors
    const numColorsInput = document.getElementById('num-colors').value;
    const numColors = numColorsInput ? parseInt(numColorsInput) : null;
    
    // Build colors string
    let colors = null;
    if (selectedColors.length > 0 || numColors !== null) {
        colors = selectedColors.join(',');
    }
    
    return { colors, color_mode: colorMode, num_colors: numColors };
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
    const numColorsValue = document.getElementById('num-colors').value;
    const numColors = numColorsValue ? parseInt(numColorsValue) : null;
    
    let validationResult = { valid: true, message: null };
    
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
// MAIN RANDOMIZE FUNCTION
// ========================================

async function handleRandomize() {
    console.log('handleRandomize called');
    
    // Validate inputs
    const validation = validateInputs();
    if (!validation) {
        console.error('Validation failed');
        return;
    }
    
    const { minRank, maxRank, quantity } = validation;
    const timePeriod = document.getElementById('time-period').value;
    const { colors, color_mode, num_colors } = getColorFilterSettings();
    const excludePartners = document.getElementById('exclude-partners').checked;
    const useTextOutput = document.getElementById('text-output').checked;
    
    // Validate color configuration
    const colorValidation = validateColorConfiguration();
    
    console.log('Request params:', { minRank, maxRank, quantity, timePeriod, colors, color_mode, num_colors });
    
    // Clear previous results
    clearResults();
    
    // Show loading
    updateStatus('Loading commanders...');
    document.getElementById('randomize-btn').disabled = true;
    document.getElementById('loading-indicator').classList.remove('hidden');
    
    try {
        // Call service function
        const result = await randomizeCommanders(
            timePeriod,
            minRank,
            maxRank,
            quantity,
            colors,
            color_mode,
            num_colors,
            excludePartners
        );
        
        console.log('Service response:', result);
        
        if (!result.success) {
            alert(`Error: ${result.error}`);
            updateStatus(`Error: ${result.error}`);
            return;
        }
        
        const commanders = result.commanders;
        const commandersCount = commanders ? commanders.length : 0;
        
        // Generate appropriate status message
        const statusMessage = getResultMessage(result, quantity, colorValidation);
        
        // Display results
        if (commandersCount > 0) {
            if (useTextOutput) {
                // For text output, still fetch all URLs first (needed for display)
                for (const commander of commanders) {
                    commander.edhrec_url = commanderNameToUrl(commander.name);
                    commander.image_url = await getCardImageUrl(commander.name);
                }
                displayTextResults(result);
            } else {
                // For card images, display immediately and load images progressively
                displayCardImagesProgressive(commanders);
            }
            updateStatus(statusMessage);
        } else {
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
    
    // Create a div instead of pre to support HTML content
    const div = document.createElement('div');
    div.className = 'results-text';
    
    let html = '';
    
    html += `Loaded ${result.total_loaded} commanders from ${result.filter_description}\n\n`;
    
    result.commanders.forEach((cmd, i) => {
        html += `${i + 1}. ${cmd.name}\n`;
        html += `   Rank: ${cmd.rank}\n`;
        const colorDisplay = cmd.colors || 'Colorless';
        html += `   Colors: ${colorDisplay}\n`;
        html += `   CMC: ${cmd.cmc}\n`;
        html += `   Rarity: ${cmd.rarity}\n`;
        html += `   Type: ${cmd.type}\n`;
        // Make the URL a clickable link
        html += `   URL: <a href="${cmd.edhrec_url}" target="_blank" rel="noopener">${cmd.edhrec_url}</a>\n\n`;
    });
    
    // Use innerHTML to render the links, but escape user content first for safety
    div.innerHTML = html.replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/&lt;a href="([^"]+)" target="_blank" rel="noopener"&gt;([^&]+)&lt;\/a&gt;/g, 
                '<a href="$1" target="_blank" rel="noopener">$2</a>');
    
    container.appendChild(div);
}

function displayCardImagesProgressive(commanders) {
    const container = document.getElementById('cards-container');
    
    commanders.forEach(async (cmd) => {
        // Generate EDHREC URL immediately (no API call needed)
        cmd.edhrec_url = commanderNameToUrl(cmd.name);
        
        const wrapper = document.createElement('div');
        wrapper.className = 'card-wrapper';
        wrapper.addEventListener('click', () => {
            if (cmd.edhrec_url) {
                window.open(cmd.edhrec_url, '_blank');
            }
        });
        
        // Create loading placeholder
        const loadingPlaceholder = document.createElement('div');
        loadingPlaceholder.className = 'card-placeholder';
        loadingPlaceholder.style.cssText = 'color: #aaa; text-align: center; padding: 20px; min-height: 200px; display: flex; align-items: center; justify-content: center;';
        loadingPlaceholder.innerHTML = '⏳<br>Loading...';
        wrapper.appendChild(loadingPlaceholder);
        
        // Card name (show immediately)
        const name = document.createElement('div');
        name.className = 'card-name';
        name.textContent = cmd.name;
        wrapper.appendChild(name);
        
        // Card rank (show immediately)
        const rank = document.createElement('div');
        rank.className = 'card-rank';
        rank.textContent = `Rank #${cmd.rank}`;
        wrapper.appendChild(rank);
        
        // Add to container immediately (before image loads)
        container.appendChild(wrapper);
        
        // Fetch image URL asynchronously (doesn't block other cards)
        const imageUrl = await getCardImageUrl(cmd.name);
        
        if (imageUrl) {
            // Replace loading placeholder with actual image
            const img = document.createElement('img');
            img.className = 'card-image';
            img.alt = cmd.name;
            img.src = imageUrl;
            
            img.onload = () => {
                loadingPlaceholder.remove();
                wrapper.insertBefore(img, wrapper.firstChild);
            };
            
            img.onerror = () => {
                loadingPlaceholder.textContent = `❌\n${cmd.name}\n(Image not found)`;
                loadingPlaceholder.style.color = 'red';
            };
        } else {
            loadingPlaceholder.textContent = `❌\n${cmd.name}\n(Image not available)`;
            loadingPlaceholder.style.color = 'red';
        }
    });
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
                img.alt = `${cmd.name} (Image not found)`;
                img.style.display = 'none';
                const placeholder = document.createElement('div');
                placeholder.className = 'card-placeholder';
                placeholder.textContent = `❌\n${cmd.name}\n(Image not found)`;
                placeholder.style.cssText = 'color: red; text-align: center; padding: 20px;';
                wrapper.insertBefore(placeholder, wrapper.firstChild);
            };
        } else {
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
    document.getElementById('cards-container').innerHTML = '';
    updateStatus('Ready');
}

function updateStatus(message) {
    document.getElementById('status-text').textContent = message;
}
