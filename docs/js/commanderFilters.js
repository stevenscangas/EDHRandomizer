// ========================================
// COMMANDER FILTERING LOGIC
// ========================================

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

export function filterByColors(commanders, colors, mode, numColors = null, selectedColorCounts = null) {
    // First filter by number of colors if specified
    if (numColors !== null) {
        // Exact number of colors (simple mode)
        commanders = commanders.filter(commander => {
            const commanderColorCount = commander.colors.replace(/,/g, '').replace(/ /g, '').length;
            return commanderColorCount === numColors;
        });
        
        // If we only want colorless (0 colors) and no specific colors selected, return now
        if (numColors === 0) {
            return commanders;
        }
    } else if (selectedColorCounts && selectedColorCounts.length > 0) {
        // Multi-select color counts (advanced mode)
        commanders = commanders.filter(commander => {
            const commanderColorCount = commander.colors.replace(/,/g, '').replace(/ /g, '').length;
            return selectedColorCounts.includes(commanderColorCount);
        });
        
        // If only colorless selected and no specific colors, return now
        if (selectedColorCounts.length === 1 && selectedColorCounts[0] === 0) {
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

// Select random commanders
export function selectRandomCommanders(
    commanders,
    minRank,
    maxRank,
    quantity, 
    colors = null, 
    colorMode = 'exactly',
    numColors = null,
    selectedColorCounts = null,
    minCmc = null,
    maxCmc = null,
    saltMode = null
) {
    // Filter commanders by rank range
    let filtered = commanders.filter(c => c.rank >= minRank && c.rank <= maxRank);
    
    // Apply color filter if specified
    if (colors !== null || numColors !== null || selectedColorCounts !== null) {
        filtered = filterByColors(filtered, colors, colorMode, numColors, selectedColorCounts);
    }
    
    // Apply CMC filter if specified
    if (minCmc !== null || maxCmc !== null) {
        filtered = filtered.filter(commander => {
            const cmc = parseInt(commander.cmc);
            if (isNaN(cmc)) return false;
            if (minCmc !== null && cmc < minCmc) return false;
            if (maxCmc !== null && cmc > maxCmc) return false;
            return true;
        });
    }
    
    // Apply salt filter if specified
    // 'salty' = commanders with salt > 0.8 (top ~5% saltiest)
    // 'chill' = commanders with salt <= 0.8 (bottom ~95%)
    if (saltMode !== null) {
        filtered = filtered.filter(commander => {
            const salt = parseFloat(commander.salt);
            if (isNaN(salt)) return false;
            
            if (saltMode === 'salty') {
                return salt > 0.8;
            } else if (saltMode === 'chill') {
                return salt <= 0.8;
            }
            return true;
        });
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
