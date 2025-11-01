/**
 * Game Mode Controller
 * Coordinates session management, commander generation, and pack code delivery
 */

import { randomizeCommanders } from '../services/commanderService.js';
import { getCardImageUrl } from '../api/scryfall.js';
import { commanderNameToUrl } from '../api/edhrec.js';

export class GameModeController {
    constructor(sessionManager, powerupLoader, packConfigGenerator) {
        this.sessionManager = sessionManager;
        this.powerupLoader = powerupLoader;
        this.packConfigGenerator = packConfigGenerator;
        
        this.currentSession = null;
        this.currentPlayerId = null;
        this.playerCommanderData = {}; // Store generated commanders per player
        this.playerSelectedCommander = {}; // Store selected commander per player
    }

    /**
     * Generate commanders for a specific player with powerup effects
     * @param {number} playerNumber - Player number (1-4)
     * @param {Object} powerupEffects - Powerup effects object
     * @param {Object} colorSelections - Color filter selections {selected: ['W', 'U'], mode: 'include'}
     * @returns {Promise<Array>} Array of commander objects
     */
    async generateCommandersForPlayer(playerNumber, powerupEffects, colorSelections = null) {
        // Base configuration
        const timePeriod = 'Monthly'; // Default
        const minRank = 1;
        const maxRank = 1000;
        const excludePartners = true;
        
        // Calculate quantity from powerup
        const baseQuantity = 3;
        const quantityModifier = powerupEffects.commanderQuantity || 0;
        const quantity = baseQuantity + quantityModifier;
        
        // Handle color filter from powerup
        let colors = null;
        let colorMode = 'exactly';
        let numColors = null;
        
        if (colorSelections && colorSelections.selected && colorSelections.selected.length > 0) {
            colors = colorSelections.selected.join('');
            
            if (colorSelections.mode === 'exclude') {
                // Exclude mode: select all colors EXCEPT the excluded ones
                const allColors = ['W', 'U', 'B', 'R', 'G'];
                const included = allColors.filter(c => !colorSelections.selected.includes(c));
                colors = included.join('');
                colorMode = 'including';
            } else if (colorSelections.mode === 'include') {
                colorMode = 'including';
            } else if (colorSelections.mode === 'exact') {
                colorMode = 'exactly';
            }
        }
        
        try {
            const result = await randomizeCommanders(
                timePeriod,
                minRank,
                maxRank,
                quantity,
                colors,
                colorMode,
                numColors,
                null, // selected_color_counts
                excludePartners,
                null, // min_cmc
                null, // max_cmc
                null, // salt_mode
                null  // distributionFunc
            );
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to generate commanders');
            }
            
            const commanders = result.commanders || [];
            
            // Fetch images and URLs
            for (const commander of commanders) {
                commander.edhrec_url = commanderNameToUrl(commander.name);
                try {
                    commander.image_url = await getCardImageUrl(commander.name);
                } catch (error) {
                    console.error(`Failed to fetch image for ${commander.name}:`, error);
                    commander.image_url = null;
                }
            }
            
            // Store for this player
            this.playerCommanderData[playerNumber] = commanders;
            
            return commanders;
        } catch (error) {
            console.error('Error generating commanders:', error);
            throw error;
        }
    }

    /**
     * Select a commander for a player
     * @param {number} playerNumber - Player number
     * @param {number} commanderIndex - Index in the commander array
     */
    selectCommander(playerNumber, commanderIndex) {
        const commanders = this.playerCommanderData[playerNumber];
        if (!commanders || !commanders[commanderIndex]) {
            throw new Error('Invalid commander selection');
        }
        
        this.playerSelectedCommander[playerNumber] = commanders[commanderIndex];
    }

    /**
     * Lock in commander for current player
     * @param {number} playerNumber - Player number
     * @returns {Promise<Object>} Updated session data
     */
    async lockCommanderForPlayer(playerNumber) {
        const commander = this.playerSelectedCommander[playerNumber];
        if (!commander) {
            throw new Error('No commander selected');
        }
        
        const player = this.currentSession.players.find(p => p.number === playerNumber);
        if (!player || player.id !== this.currentPlayerId) {
            throw new Error('Can only lock commander for yourself');
        }
        
        try {
            const session = await this.sessionManager.lockCommander(
                this.currentSession.sessionCode,
                this.currentPlayerId,
                commander.edhrec_url,
                {
                    name: commander.name,
                    rank: commander.rank,
                    image_url: commander.image_url
                }
            );
            
            this.currentSession = session;
            return session;
        } catch (error) {
            console.error('Error locking commander:', error);
            throw error;
        }
    }

    /**
     * Get pack code for a player
     * @param {number} playerNumber - Player number
     * @returns {string|null} Pack code or null if not generated
     */
    getPackCodeForPlayer(playerNumber) {
        const player = this.currentSession.players.find(p => p.number === playerNumber);
        return player ? player.packCode : null;
    }

    /**
     * Check if all players have locked in
     * @returns {boolean}
     */
    allPlayersLocked() {
        if (!this.currentSession) return false;
        return this.currentSession.players.every(p => p.commanderLocked);
    }

    /**
     * Parse color filter selections from powerup effects and UI state
     * @param {HTMLElement} colorFilterContainer - Container with color symbols
     * @returns {Object|null} {selected: ['W', 'U'], mode: 'include'} or null
     */
    getColorSelectionsFromUI(colorFilterContainer) {
        if (!colorFilterContainer) return null;
        
        const mode = colorFilterContainer.dataset.mode;
        if (!mode) return null;
        
        const selectedColors = [];
        const colorSymbols = colorFilterContainer.querySelectorAll('.color-symbol.selected');
        colorSymbols.forEach(symbol => {
            selectedColors.push(symbol.dataset.color);
        });
        
        if (selectedColors.length === 0 && mode !== 'exact') {
            return null; // No colors selected
        }
        
        return {
            selected: selectedColors,
            mode: mode
        };
    }
}
