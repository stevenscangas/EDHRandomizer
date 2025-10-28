// ========================================
// ADVANCED PROBABILITY DISTRIBUTION FUNCTIONS
// ========================================

/**
 * Parse a user-provided math equation string into a probability function
 * Variables available: rank, min, max
 * @param {string} equation - User's math equation (e.g., "max - rank", "(max - rank) / (max - min)")
 * @param {number} minRank - Minimum rank to test with
 * @param {number} maxRank - Maximum rank to test with
 * @returns {Function|null} - A function that takes (rank, min, max) and returns a weight, or null if invalid
 */
export function parseDistributionEquation(equation, minRank = 600, maxRank = 1400) {
    if (!equation || typeof equation !== 'string') {
        return null;
    }
    
    // Sanitize the equation - only allow safe characters
    const sanitized = equation.trim();
    const allowedPattern = /^[0-9+\-*/().\s,rankminxRankMinMax]+$/;
    
    if (!allowedPattern.test(sanitized)) {
        console.error('Invalid characters in equation. Only numbers, +, -, *, /, (), ., and variables (rank, min, max) are allowed.');
        return null;
    }
    
    // Replace variable names with parameter references
    // Use word boundaries to avoid partial matches
    let functionBody = sanitized
        .replace(/\brank\b/gi, 'rank')
        .replace(/\bmin\b/gi, 'min')
        .replace(/\bmax\b/gi, 'max');
    
    try {
        // Create the function
        const func = new Function('rank', 'min', 'max', `return ${functionBody};`);
        
        // Test with the actual min/max values from settings
        const testMid = func((minRank + maxRank) / 2, minRank, maxRank);
        const testMin = func(minRank, minRank, maxRank);
        const testMax = func(maxRank, minRank, maxRank);
        
        // Only reject if we get NaN (actual error), allow Infinity (just means very large exponent)
        if (isNaN(testMid) || isNaN(testMin) || isNaN(testMax)) {
            console.error('Equation produces NaN (invalid math) with range', minRank, '-', maxRank);
            return null;
        }
        
        // Warn about Infinity but still allow it
        if (!isFinite(testMid) || !isFinite(testMin) || !isFinite(testMax)) {
            console.warn('⚠️ Equation produces Infinity - exponent may be too large. Results may be unpredictable.');
        }
        
        return func;
    } catch (error) {
        console.error('Error parsing equation:', error);
        return null;
    }
}

/**
 * Preset distribution functions
 */
export const DISTRIBUTION_PRESETS = {
    uniform: {
        name: 'Uniform [Default]',
        description: 'All commanders equally likely',
        equation: '1',
        func: (rank, min, max) => 1
    },
    favorPopular: {
        name: 'Favor Popular',
        description: 'Lower rank numbers (more popular) are more likely',
        equation: 'max - rank',
        func: (rank, min, max) => max - rank
    },
    favorObscure: {
        name: 'Favor Obscure',
        description: 'Higher rank numbers (less popular) are more likely',
        equation: 'rank - min',
        func: (rank, min, max) => rank - min
    },
    stronglyPopular: {
        name: 'Strongly Popular',
        description: 'Strongly favor lower rank numbers (most popular)',
        equation: '(max - rank) ** 2',
        func: (rank, min, max) => Math.pow(max - rank, 2)
    },
    stronglyObscure: {
        name: 'Strongly Obscure',
        description: 'Strongly favor higher rank numbers (most obscure)',
        equation: '(rank - min) ** 2',
        func: (rank, min, max) => Math.pow(rank - min, 2)
    },
    balanced: {
        name: 'Balanced (Sweet Spot)',
        description: 'Most selections from middle range (30%-70% of span), rare lottery for top tier (exponential at half weight), linear taper toward max',
        equation: 'rank < (min + (max - min) * 0.3) ? 2 ** ((min + (max - min) * 0.3 - rank) / ((max - min) * 0.01)) / 2 : (rank <= (min + (max - min) * 0.7) ? 100 : (max - rank))',
        func: (rank, min, max) => {
            const range = max - min;
            const lotteryThreshold = min + range * 0.3;  // 30% point
            const sweetSpotEnd = min + range * 0.7;      // 70% point
            
            if (rank < lotteryThreshold) {
                // Exponential lottery for top commanders, halved weight
                return Math.pow(2, (lotteryThreshold - rank) / (range * 0.01)) / 2;
            } else if (rank <= sweetSpotEnd) {
                // Flat weight for sweet spot range
                return 100;
            } else {
                // Linear decline toward max
                return Math.max(0, max - rank);
            }
        }
    }
};

/**
 * Get the distribution function based on current UI settings
 * @returns {Function|null} - Distribution function or null for uniform distribution
 */
export function getDistributionFunction() {
    const enabled = document.getElementById('enable-advanced-randomizer')?.checked;
    
    if (!enabled) {
        return null; // Use uniform distribution
    }
    
    const equation = document.getElementById('distribution-equation')?.value;
    
    if (!equation || equation.trim() === '') {
        console.warn('Advanced randomizer enabled but no equation provided');
        return null;
    }
    
    // Get the actual min/max from settings to validate with
    const minRank = parseInt(document.getElementById('min-rank')?.value) || 1;
    const maxRank = parseInt(document.getElementById('max-rank')?.value) || 1000;
    
    const parsedFunc = parseDistributionEquation(equation, minRank, maxRank);
    if (!parsedFunc) {
        console.error('Failed to parse equation, falling back to uniform distribution');
        return null;
    }
    
    return parsedFunc;
}

/**
 * Set the equation in the input field
 * @param {string} equation - The equation to set
 */
export function setEquation(equation) {
    const input = document.getElementById('distribution-equation');
    if (input) {
        input.value = equation;
        // Trigger change event to save settings
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }
}
