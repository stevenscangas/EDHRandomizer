// ========================================
// UI DISPLAY FUNCTIONS
// ========================================

import { commanderNameToUrl } from '../api/edhrec.js';
import { getCardImageUrl } from '../api/scryfall.js';

// Track current commanders and sort state
let currentCommanders = []; // Original unsorted commanders
let currentSortBy = null; // null, 'rank', or 'cmc'
let currentSortDirection = null; // null, 'asc', or 'desc'

export function displayTextResults(result) {
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
    
    // Hide sort controls for text output
    document.getElementById('sort-controls').classList.add('hidden');
}

export function displayCardImagesProgressive(commanders) {
    console.log('displayCardImagesProgressive called');
    console.log('Current sort state BEFORE:', { currentSortBy, currentSortDirection });
    
    // Store commanders for sorting (always store original unsorted order)
    currentCommanders = [...commanders];
    
    // Don't reset sort state - persist it across randomizations
    // currentSortBy and currentSortDirection remain unchanged
    
    // Show sort controls
    document.getElementById('sort-controls').classList.remove('hidden');
    
    // Restore button states based on current sort
    const rankBtn = document.getElementById('sort-rank-btn');
    const cmcBtn = document.getElementById('sort-cmc-btn');
    
    console.log('Restoring button states...');
    
    // Reset both buttons
    rankBtn.classList.remove('asc', 'desc', 'inactive');
    cmcBtn.classList.remove('asc', 'desc', 'inactive');
    
    // Apply current sort state to buttons
    if (currentSortBy === 'rank' && currentSortDirection) {
        console.log('Setting rank button to:', currentSortDirection);
        rankBtn.classList.add(currentSortDirection);
        cmcBtn.classList.add('inactive');
    } else if (currentSortBy === 'cmc' && currentSortDirection) {
        console.log('Setting cmc button to:', currentSortDirection);
        cmcBtn.classList.add(currentSortDirection);
        rankBtn.classList.add('inactive');
    } else {
        console.log('No active sort, setting both to inactive');
        rankBtn.classList.add('inactive');
        cmcBtn.classList.add('inactive');
    }
    
    // If there's an active sort, apply it to the new commanders
    if (currentSortBy && currentSortDirection) {
        console.log('Applying sort:', currentSortBy, currentSortDirection);
        let sortedCommanders = [...commanders].sort((a, b) => {
            let aVal, bVal;
            
            if (currentSortBy === 'rank') {
                aVal = parseInt(a.rank) || 999999;
                bVal = parseInt(b.rank) || 999999;
            } else if (currentSortBy === 'cmc') {
                aVal = parseInt(a.cmc) || 0;
                bVal = parseInt(b.cmc) || 0;
            }
            
            if (currentSortDirection === 'asc') {
                return aVal - bVal;
            } else {
                return bVal - aVal;
            }
        });
        console.log('First 3 commanders after sort:', sortedCommanders.slice(0, 3).map(c => ({ name: c.name, rank: c.rank, cmc: c.cmc })));
        renderCommanders(sortedCommanders);
    } else {
        // No active sort, render in default order
        console.log('Rendering in default order');
        renderCommanders(currentCommanders);
    }
}

function renderCommanders(commanders) {
    const container = document.getElementById('cards-container');
    container.innerHTML = ''; // Clear existing
    
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

export function sortCommanders(sortBy) {
    console.log('sortCommanders called with:', sortBy);
    console.log('Current state:', { currentSortBy, currentSortDirection });
    
    if (!currentCommanders || currentCommanders.length === 0) {
        console.log('No commanders to sort');
        return;
    }
    
    // Get button references
    const rankBtn = document.getElementById('sort-rank-btn');
    const cmcBtn = document.getElementById('sort-cmc-btn');
    const currentBtn = sortBy === 'rank' ? rankBtn : cmcBtn;
    const otherBtn = sortBy === 'rank' ? cmcBtn : rankBtn;
    
    // Determine current state of the clicked button
    let currentState = 'inactive';
    if (currentBtn.classList.contains('asc')) {
        currentState = 'asc';
    } else if (currentBtn.classList.contains('desc')) {
        currentState = 'desc';
    }
    
    // Cycle to next state: inactive → asc → desc → inactive
    let newState, newDirection;
    if (currentState === 'inactive') {
        newState = 'asc';
        newDirection = 'asc';
    } else if (currentState === 'asc') {
        newState = 'desc';
        newDirection = 'desc';
    } else {
        newState = 'inactive';
        newDirection = null;
    }
    
    // Reset other button to inactive
    otherBtn.classList.remove('asc', 'desc', 'inactive');
    otherBtn.classList.add('inactive');
    
    // Update current button
    currentBtn.classList.remove('inactive', 'asc', 'desc');
    currentBtn.classList.add(newState);
    
    // Update current sort state
    currentSortBy = newDirection ? sortBy : null;
    currentSortDirection = newDirection;
    
    console.log('New sort state:', { currentSortBy, currentSortDirection, newState });
    
    // Sort or restore original order
    let sortedCommanders;
    if (newDirection) {
        sortedCommanders = [...currentCommanders].sort((a, b) => {
            let aVal, bVal;
            
            if (sortBy === 'rank') {
                aVal = parseInt(a.rank) || 999999;
                bVal = parseInt(b.rank) || 999999;
            } else if (sortBy === 'cmc') {
                aVal = parseInt(a.cmc) || 0;
                bVal = parseInt(b.cmc) || 0;
            }
            
            if (newDirection === 'asc') {
                return aVal - bVal;
            } else {
                return bVal - aVal;
            }
        });
    } else {
        // Restore original unsorted order
        sortedCommanders = [...currentCommanders];
    }
    
    // Re-render
    renderCommanders(sortedCommanders);
}

export function clearResults(preserveSort = false) {
    console.log('clearResults called with preserveSort:', preserveSort);
    console.log('Sort state before clear:', { currentSortBy, currentSortDirection });
    
    document.getElementById('cards-container').innerHTML = '';
    currentCommanders = [];
    
    // Only reset sort state if not preserving
    if (!preserveSort) {
        currentSortBy = null;
        currentSortDirection = null;
        
        // Reset sort button states to inactive
        const rankBtn = document.getElementById('sort-rank-btn');
        const cmcBtn = document.getElementById('sort-cmc-btn');
        if (rankBtn && cmcBtn) {
            rankBtn.classList.remove('asc', 'desc');
            rankBtn.classList.add('inactive');
            cmcBtn.classList.remove('asc', 'desc');
            cmcBtn.classList.add('inactive');
        }
        
        // Hide sort controls when clearing without preserve
        document.getElementById('sort-controls').classList.add('hidden');
    }
    
    updateStatus('Ready');
}

export function updateStatus(message) {
    document.getElementById('status-text').textContent = message;
}

export function getResultMessage(result, requestedQuantity, validationResult) {
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
