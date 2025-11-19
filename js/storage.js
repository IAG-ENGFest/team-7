/* ==========================================
   LOCAL STORAGE MANAGER
   Handles saving and loading game data
   ========================================== */

const StorageManager = {
    STORAGE_KEY: 'airportTycoonSave',
    HIGH_SCORE_KEY: 'airportTycoonHighScore',
    
    /**
     * Save game state to localStorage
     */
    saveGame(gameState) {
        try {
            const saveData = {
                cash: gameState.cash,
                satisfaction: gameState.satisfaction,
                reputation: gameState.reputation,
                day: gameState.day,
                flightsCompleted: gameState.flightsCompleted,
                purchasedUpgrades: Array.from(gameState.purchasedUpgrades),
                gates: gameState.gates.map(gate => ({
                    id: gate.id,
                    name: gate.name,
                    capacity: gate.capacity,
                    type: gate.type
                })),
                timestamp: Date.now()
            };
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.error('Failed to save game:', e);
            return false;
        }
    },
    
    /**
     * Load game state from localStorage
     */
    loadGame() {
        try {
            const saveData = localStorage.getItem(this.STORAGE_KEY);
            if (!saveData) return null;
            
            return JSON.parse(saveData);
        } catch (e) {
            console.error('Failed to load game:', e);
            return null;
        }
    },
    
    /**
     * Delete saved game
     */
    deleteSave() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (e) {
            console.error('Failed to delete save:', e);
            return false;
        }
    },
    
    /**
     * Save high score
     */
    saveHighScore(score) {
        try {
            const currentHigh = this.getHighScore();
            if (score > currentHigh) {
                localStorage.setItem(this.HIGH_SCORE_KEY, score.toString());
                return true;
            }
            return false;
        } catch (e) {
            console.error('Failed to save high score:', e);
            return false;
        }
    },
    
    /**
     * Get high score
     */
    getHighScore() {
        try {
            const score = localStorage.getItem(this.HIGH_SCORE_KEY);
            return score ? parseInt(score) : 0;
        } catch (e) {
            console.error('Failed to get high score:', e);
            return 0;
        }
    },
    
    /**
     * Calculate final score
     */
    calculateScore(gameState) {
        return Math.round(
            gameState.cash * 0.1 +
            gameState.reputation * 100 +
            gameState.flightsCompleted * 50 +
            gameState.day * 500
        );
    }
};
