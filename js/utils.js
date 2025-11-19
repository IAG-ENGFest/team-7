/* ==========================================
   UTILITY FUNCTIONS
   Helper functions used throughout the game
   ========================================== */

const Utils = {
    /**
     * Generate a random integer between min and max (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Generate a random float between min and max
     */
    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    /**
     * Pick a random element from an array
     */
    randomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    
    /**
     * Format currency
     */
    formatCurrency(amount) {
        return '$' + amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
    },
    
    /**
     * Format percentage
     */
    formatPercent(value) {
        return Math.round(value) + '%';
    },
    
    /**
     * Clamp a value between min and max
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    /**
     * Generate a unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    /**
     * Generate a flight number
     */
    generateFlightNumber() {
        const prefix = Utils.randomElement(FLIGHT_NUMBERS);
        const number = Utils.randomInt(100, 999);
        return `${prefix}${number}`;
    },
    
    /**
     * Get random flight type based on probabilities
     */
    getRandomFlightType() {
        const rand = Math.random();
        
        if (rand < CONSTANTS.EMERGENCY_CHANCE) {
            // Emergency flight - treat as international with priority
            return 'INTERNATIONAL';
        } else if (rand < CONSTANTS.EMERGENCY_CHANCE + CONSTANTS.VIP_CHANCE) {
            return 'VIP';
        } else if (rand < 0.7) {
            // 65% domestic flights (more manageable)
            return 'DOMESTIC';
        } else if (rand < 0.9) {
            // 20% international
            return 'INTERNATIONAL';
        } else {
            // 10% cargo
            return 'CARGO';
        }
    },
    
    /**
     * Calculate satisfaction color
     */
    getSatisfactionColor(satisfaction) {
        if (satisfaction >= 80) return '#10b981'; // Green
        if (satisfaction >= 50) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    },
    
    /**
     * Interpolate between two colors
     */
    interpolateColor(color1, color2, factor) {
        const c1 = parseInt(color1.slice(1), 16);
        const c2 = parseInt(color2.slice(1), 16);
        
        const r1 = (c1 >> 16) & 0xff;
        const g1 = (c1 >> 8) & 0xff;
        const b1 = c1 & 0xff;
        
        const r2 = (c2 >> 16) & 0xff;
        const g2 = (c2 >> 8) & 0xff;
        const b2 = c2 & 0xff;
        
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);
        
        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    },
    
    /**
     * Format time remaining
     */
    formatTime(milliseconds) {
        const seconds = Math.ceil(milliseconds / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    },
    
    /**
     * Check if flight matches gate capacity
     */
    isGoodMatch(flight, gate) {
        const flightType = CONSTANTS.FLIGHT_TYPES[flight.type];
        const gateCapacity = gate.capacity;
        
        // Perfect match bonus
        if (flight.passengers <= gateCapacity && 
            flight.passengers >= gateCapacity * 0.7) {
            return 'perfect';
        }
        
        // Acceptable match
        if (flight.passengers <= gateCapacity) {
            return 'good';
        }
        
        // Overload - will reduce satisfaction
        return 'poor';
    },
    
    /**
     * Play a simple beep sound using Web Audio API
     */
    playBeep(frequency = 440, duration = 100, volume = 0.1) {
        if (!window.audioContext) return;
        
        const oscillator = window.audioContext.createOscillator();
        const gainNode = window.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(window.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.value = volume;
        
        oscillator.start(window.audioContext.currentTime);
        oscillator.stop(window.audioContext.currentTime + duration / 1000);
    }
};
