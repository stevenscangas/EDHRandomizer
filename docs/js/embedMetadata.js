// ========================================
// DYNAMIC EMBED METADATA FOR SHARED RESULTS
// ========================================

export async function updateEmbedMetadata(commanders, timePeriod) {
    if (!commanders || commanders.length === 0) {
        return;
    }
    
    // Build commander list - show ALL commanders (Discord has ~2000 char limit)
    let commanderList;
    
    if (commanders.length <= 10) {
        // For 10 or fewer, list all with bullet points
        commanderList = commanders.map(cmd => `• ${cmd.name}`).join('\n');
    } else {
        // For more than 10, list first 10 and show count of remaining
        commanderList = commanders.slice(0, 10).map(cmd => `• ${cmd.name}`).join('\n');
        commanderList += `\n...and ${commanders.length - 10} more`;
    }
    
    // Create dynamic description with all commander names
    const description = `🎲 Shared Commander Results (${commanders.length}):\n\n${commanderList}`;
    
    // Create dynamic title
    const title = `${commanders.length} Random Commander${commanders.length !== 1 ? 's' : ''} - EDHREC`;
    
    // Update Open Graph tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    
    // Keep the EDHREC logo as the image
    updateMetaTag('og:image', 'https://edhrandomizerr.github.io/images/edhreclogo.png');
    updateMetaTag('twitter:image', 'https://edhrandomizerr.github.io/images/edhreclogo.png');
    
    // Update page title
    document.title = title;
    
    console.log('Updated embed metadata for shared results');
}

function updateMetaTag(property, content) {
    // Try property attribute first (for og:)
    let tag = document.querySelector(`meta[property="${property}"]`);
    
    // Try name attribute if not found (for twitter:)
    if (!tag) {
        tag = document.querySelector(`meta[name="${property}"]`);
    }
    
    if (tag) {
        tag.setAttribute('content', content);
    } else {
        // Create new meta tag if it doesn't exist
        const newTag = document.createElement('meta');
        if (property.startsWith('og:')) {
            newTag.setAttribute('property', property);
        } else {
            newTag.setAttribute('name', property);
        }
        newTag.setAttribute('content', content);
        document.head.appendChild(newTag);
    }
}

export function resetEmbedMetadata() {
    // Reset to default values
    updateMetaTag('og:title', 'EDHREC Commander Randomizer');
    updateMetaTag('og:description', 'Discover random commanders from EDHREC\'s top lists! 🎲 Generate commanders filtered by color, CMC, rank, and more.');
    updateMetaTag('og:image', 'https://edhrandomizerr.github.io/images/edhreclogo.png');
    updateMetaTag('twitter:title', 'EDHREC Commander Randomizer');
    updateMetaTag('twitter:description', 'Discover random commanders from EDHREC\'s top lists! 🎲');
    updateMetaTag('twitter:image', 'https://edhrandomizerr.github.io/images/edhreclogo.png');
    document.title = 'EDHREC Commander Randomizer';
}
