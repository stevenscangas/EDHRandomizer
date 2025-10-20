// ========================================
// UI DISPLAY FUNCTIONS
// ========================================

import { commanderNameToUrl } from '../api/edhrec.js';
import { getCardImageUrl } from '../api/scryfall.js';

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
}

export function displayCardImagesProgressive(commanders) {
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

export function clearResults() {
    document.getElementById('cards-container').innerHTML = '';
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
