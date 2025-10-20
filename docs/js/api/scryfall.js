// ========================================
// SCRYFALL API INTEGRATION
// ========================================

export async function getCardImageUrl(commanderName, version = 'normal') {
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
