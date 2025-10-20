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
        });
    });
    
    // Verbose output toggle
    document.getElementById('verbose-output').addEventListener('change', (e) => {
        const resultsSection = document.getElementById('results-section');
        if (e.target.checked) {
            resultsSection.classList.remove('hidden');
        } else {
            resultsSection.classList.add('hidden');
        }
    });
    
    // Randomize button
    document.getElementById('randomize-btn').addEventListener('click', randomizeCommanders);
    
    // Clear button
    document.getElementById('clear-btn').addEventListener('click', clearResults);
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
    const { colors, color_mode, num_colors } = getColorFilterSettings();
    const excludePartners = document.getElementById('exclude-partners').checked;
    const verboseOutput = document.getElementById('verbose-output').checked;
    
    console.log('Request params:', { minRank, maxRank, quantity, timePeriod, colors, color_mode, num_colors });
    
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
        
        // Display results
        if (verboseOutput) {
            displayTextResults(result);
        }
        
        if (commanders && commanders.length > 0) {
            displayCardImages(commanders);
            updateStatus(`Successfully selected ${commanders.length} commander(s)`);
        } else {
            updateStatus('No commanders found with current filters');
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
    const resultsText = document.getElementById('results-text');
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
    
    resultsText.textContent = output;
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
    document.getElementById('results-text').textContent = '';
    document.getElementById('cards-container').innerHTML = '';
    updateStatus('Ready');
}

function updateStatus(message) {
    document.getElementById('status-text').textContent = message;
}
