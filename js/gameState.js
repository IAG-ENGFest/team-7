/* ==========================================
   GAME STATE MANAGER
   Core game logic and state management
   ========================================== */

const GameState = {
    // Game status
    isRunning: false,
    isPaused: false,
    gameStartTime: null,
    
    // Player stats
    cash: CONSTANTS.STARTING_CASH,
    satisfaction: CONSTANTS.STARTING_SATISFACTION,
    reputation: CONSTANTS.STARTING_REPUTATION,
    day: 1,
    flightsCompleted: 0,
    
    // Game entities
    gates: [],
    flightQueue: [],
    activeAlerts: [],
    purchasedUpgrades: new Set(),
    availableUpgrades: [],
    
    // Modifiers from upgrades
    processingSpeedMultiplier: 1.0,
    revenueMultiplier: 1.0,
    satisfactionMultiplier: 1.0,
    costMultiplier: 1.0,
    
    // Weather
    currentWeather: 'CLEAR',
    weatherChangeTimer: null,
    
    // Timers
    flightGenerationTimer: null,
    dayTimer: null,
    lastUpdate: Date.now(),
    
    // Warning flags
    lowCashWarned: false,
    lowRepWarned: false,
    
    /**
     * Initialize the game
     */
    init() {
        // Create starting gates
        this.gates = [
            new Gate('G1', 'Gate A1', 'SMALL'),
            new Gate('G2', 'Gate A2', 'SMALL'),
            new Gate('G3', 'Gate A3', 'SMALL')
        ];
        
        // Initialize upgrades
        this.availableUpgrades = CONSTANTS.UPGRADES.map(config => new Upgrade(config));
        
        // Set initial weather
        this.setWeather('CLEAR');
    },
    
    /**
     * Start the game
     */
    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.gameStartTime = Date.now();
        this.lastUpdate = Date.now();
        
        // Start generating flights
        this.scheduleNextFlight();
        
        // Start day cycle
        this.startDayCycle();
        
        // Start weather changes
        this.startWeatherCycle();
        
        // Generate initial flights
        this.generateFlight();
        setTimeout(() => this.generateFlight(), 3000);
    },
    
    /**
     * Pause/Resume game
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        return this.isPaused;
    },
    
    /**
     * Update game state (called every frame)
     */
    update() {
        if (!this.isRunning || this.isPaused) return;
        
        const now = Date.now();
        const deltaTime = (now - this.lastUpdate) / 1000; // seconds
        this.lastUpdate = now;
        
        // Update waiting flights satisfaction
        this.updateFlightQueue(deltaTime);
        
        // Check for completed flights
        this.checkCompletedFlights();
        
        // Update satisfaction based on queue
        this.updateSatisfaction(deltaTime);
        
        // Check game over conditions
        this.checkGameOver();
    },
    
    /**
     * Update flights in queue (decrease satisfaction while waiting)
     */
    updateFlightQueue(deltaTime) {
        this.flightQueue.forEach(flight => {
            if (!flight.assignedGate) {
                flight.waitingTime += deltaTime;
                
                // Decrease satisfaction for waiting flights
                if (flight.waitingTime > 5) {
                    const decrease = CONSTANTS.SATISFACTION_DECAY_RATE * deltaTime;
                    this.satisfaction = Math.max(
                        CONSTANTS.MIN_SATISFACTION,
                        this.satisfaction - decrease
                    );
                }
            }
        });
    },
    
    /**
     * Check for flights that have completed processing
     */
    checkCompletedFlights() {
        this.gates.forEach(gate => {
            if (gate.isComplete()) {
                this.completeFlight(gate);
            }
        });
    },
    
    /**
     * Complete a flight and award revenue
     */
    completeFlight(gate) {
        const flight = gate.assignedFlight;
        if (!flight) return;
        
        // Calculate match quality
        const match = Utils.isGoodMatch(flight, gate);
        
        // Calculate revenue
        const satisfactionFactor = this.satisfaction / 100;
        let revenue = flight.calculateRevenue(match, satisfactionFactor);
        revenue = Math.round(revenue * this.revenueMultiplier);
        
        // Award cash
        this.cash += revenue;
        
        // Update reputation
        let reputationChange = CONSTANTS.REPUTATION_GAIN_SUCCESS;
        if (flight.isVIP) {
            reputationChange += CONSTANTS.FLIGHT_TYPES.VIP.reputationBonus;
        }
        if (match === 'perfect') {
            reputationChange += 2;
        }
        this.reputation += reputationChange;
        
        // Increase satisfaction for successful completion
        this.satisfaction = Math.min(
            CONSTANTS.MAX_SATISFACTION,
            this.satisfaction + 5
        );
        
        // Update stats
        this.flightsCompleted++;
        
        // Remove from queue
        this.flightQueue = this.flightQueue.filter(f => f.id !== flight.id);
        
        // Clear gate
        gate.completeFlight();
        
        // Play sound
        AudioManager.play('flightComplete');
        
        // Show alert with revenue details
        const matchBonus = match === 'perfect' ? ' (+20% Perfect Match!)' : match === 'poor' ? ' (-30% Poor Match)' : '';
        this.addAlert(
            `💰 Flight ${flight.flightNumber} Completed!`,
            `Revenue: +${Utils.formatCurrency(revenue)}${matchBonus}`,
            'success'
        );
    },
    
    /**
     * Generate a new flight
     */
    generateFlight() {
        if (!this.isRunning) return;
        
        // Determine if emergency
        const isEmergency = Math.random() < CONSTANTS.EMERGENCY_CHANCE;
        
        // Get flight type
        const type = Utils.getRandomFlightType();
        
        // Create flight
        const flight = new Flight(type, isEmergency);
        
        // Add to queue
        this.flightQueue.push(flight);
        
        // Play sound
        if (isEmergency) {
            AudioManager.play('emergency');
            this.addAlert(
                `EMERGENCY: ${flight.flightNumber}`,
                `Priority landing required!`,
                'danger'
            );
        } else {
            AudioManager.play('click');
        }
        
        // Schedule next flight
        this.scheduleNextFlight();
    },
    
    /**
     * Schedule the next flight generation
     */
    scheduleNextFlight() {
        if (this.flightGenerationTimer) {
            clearTimeout(this.flightGenerationTimer);
        }
        
        // Increase frequency with difficulty
        const baseInterval = CONSTANTS.MIN_FLIGHT_INTERVAL;
        const maxInterval = CONSTANTS.MAX_FLIGHT_INTERVAL - (this.day * 1000);
        const interval = Utils.randomInt(
            baseInterval,
            Math.max(baseInterval, maxInterval)
        );
        
        this.flightGenerationTimer = setTimeout(() => {
            this.generateFlight();
        }, interval);
    },
    
    /**
     * Assign a flight to a gate
     */
    assignFlightToGate(flightId, gateId) {
        const flight = this.flightQueue.find(f => f.id === flightId);
        const gate = this.gates.find(g => g.id === gateId);
        
        if (!flight || !gate || !gate.isAvailable()) {
            AudioManager.play('error');
            return false;
        }
        
        // Apply weather delay
        const weather = CONSTANTS.WEATHER[this.currentWeather];
        const processingSpeed = this.processingSpeedMultiplier * weather.delayFactor;
        
        // Assign flight
        if (gate.assignFlight(flight, processingSpeed)) {
            AudioManager.play('flightAssigned');
            
            // Check match quality
            const match = Utils.isGoodMatch(flight, gate);
            if (match === 'poor') {
                this.addAlert(
                    'Poor Gate Match',
                    `${flight.flightNumber} exceeds gate capacity!`,
                    'warning'
                );
                this.satisfaction = Math.max(
                    CONSTANTS.MIN_SATISFACTION,
                    this.satisfaction - 10
                );
            } else if (match === 'perfect') {
                this.addAlert(
                    'Perfect Match!',
                    `${flight.flightNumber} is optimally assigned`,
                    'success'
                );
            }
            
            return true;
        }
        
        return false;
    },
    
    /**
     * Purchase an upgrade
     */
    purchaseUpgrade(upgradeId) {
        const upgrade = this.availableUpgrades.find(u => u.id === upgradeId);
        
        if (!upgrade || upgrade.purchased || this.cash < upgrade.cost) {
            AudioManager.play('error');
            return false;
        }
        
        // Deduct cost
        this.cash -= upgrade.cost;
        
        // Mark as purchased
        upgrade.purchase();
        this.purchasedUpgrades.add(upgradeId);
        
        // Apply effect
        this.applyUpgrade(upgrade);
        
        // Play sound
        AudioManager.play('upgrade');
        
        // Show alert
        this.addAlert(
            `🏗️ Upgrade Purchased!`,
            `${upgrade.name} - Cost: -${Utils.formatCurrency(upgrade.cost)}`,
            'success'
        );
        
        return true;
    },
    
    /**
     * Apply upgrade effects
     */
    applyUpgrade(upgrade) {
        switch (upgrade.effect) {
            case 'gates':
                // Add new gates
                for (let i = 0; i < upgrade.value; i++) {
                    const gateNumber = this.gates.length + 1;
                    const terminal = gateNumber <= 3 ? 'A' : gateNumber <= 6 ? 'B' : 'C';
                    const terminalGate = ((gateNumber - 1) % 3) + 1;
                    this.gates.push(
                        new Gate(
                            `G${gateNumber}`,
                            `Gate ${terminal}${terminalGate}`,
                            'MEDIUM'
                        )
                    );
                }
                break;
            case 'processingSpeed':
                this.processingSpeedMultiplier *= upgrade.value;
                break;
            case 'revenue':
                this.revenueMultiplier *= upgrade.value;
                break;
            case 'satisfaction':
                this.satisfactionMultiplier *= upgrade.value;
                break;
            case 'costs':
                this.costMultiplier *= upgrade.value;
                break;
        }
    },
    
    /**
     * Update satisfaction based on overall performance
     */
    updateSatisfaction(deltaTime) {
        // Natural decay if there are waiting flights
        const waitingFlights = this.flightQueue.filter(f => !f.assignedGate).length;
        if (waitingFlights > 5) {
            this.satisfaction = Math.max(
                CONSTANTS.MIN_SATISFACTION,
                this.satisfaction - (0.5 * deltaTime)
            );
        }
        
        // Apply satisfaction multiplier from upgrades
        // (This is applied during revenue calculation)
    },
    
    /**
     * Start day/night cycle
     */
    startDayCycle() {
        this.dayTimer = setInterval(() => {
            this.day++;
            
            // Deduct operational costs
            const dailyCost = Math.round(
                CONSTANTS.OPERATIONAL_COST_PER_DAY * this.costMultiplier
            );
            this.cash -= dailyCost;
            
            this.addAlert(
                `📅 Day ${this.day} - Operational Costs`,
                `Expenses: -${Utils.formatCurrency(dailyCost)} (staff, maintenance, utilities)`,
                'warning'
            );
            
            AudioManager.play('warning');
        }, CONSTANTS.DAY_DURATION);
    },
    
    /**
     * Start weather cycle
     */
    startWeatherCycle() {
        this.weatherChangeTimer = setInterval(() => {
            const weatherTypes = Object.keys(CONSTANTS.WEATHER);
            const newWeather = Utils.randomElement(weatherTypes);
            this.setWeather(newWeather);
        }, CONSTANTS.WEATHER_CHANGE_INTERVAL);
    },
    
    /**
     * Set current weather
     */
    setWeather(weatherType) {
        this.currentWeather = weatherType;
        const weather = CONSTANTS.WEATHER[weatherType];
        
        if (weatherType !== 'CLEAR') {
            this.addAlert(
                'Weather Change',
                `${weather.name} - Delays expected`,
                'warning'
            );
        }
    },
    
    /**
     * Add an alert notification
     */
    addAlert(title, message, type = 'info') {
        const alert = new Alert(title, message, type);
        this.activeAlerts.push(alert);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            this.activeAlerts = this.activeAlerts.filter(a => a.id !== alert.id);
        }, 5000);
    },
    
    /**
     * Check game over conditions
     */
    checkGameOver() {
        // Warning alerts before game over
        if (this.cash < -30000 && this.cash > CONSTANTS.MIN_CASH_GAME_OVER) {
            if (!this.lowCashWarned) {
                this.addAlert(
                    '⚠️ LOW FUNDS WARNING!',
                    `Cash: ${Utils.formatCurrency(this.cash)} - You need to complete flights soon or face bankruptcy!`,
                    'danger'
                );
                this.lowCashWarned = true;
                AudioManager.play('alarm');
            }
        } else if (this.cash > -20000) {
            this.lowCashWarned = false;
        }
        
        if (this.reputation <= 10 && this.reputation > CONSTANTS.MIN_REPUTATION_GAME_OVER) {
            if (!this.lowRepWarned) {
                this.addAlert(
                    '⚠️ REPUTATION CRITICAL!',
                    `Reputation: ${this.reputation} - Improve satisfaction or your airport will close!`,
                    'danger'
                );
                this.lowRepWarned = true;
                AudioManager.play('alarm');
            }
        } else if (this.reputation > 15) {
            this.lowRepWarned = false;
        }
        
        // Check game over
        if (this.cash < CONSTANTS.MIN_CASH_GAME_OVER) {
            this.endGame(`💸 BANKRUPTCY! Your cash dropped to ${Utils.formatCurrency(this.cash)}. You couldn't cover operational costs.`);
        } else if (this.reputation <= CONSTANTS.MIN_REPUTATION_GAME_OVER) {
            this.endGame('⭐ REPUTATION DESTROYED! Your airport lost all credibility with passengers and airlines.');
        }
    },
    
    /**
     * End the game
     */
    endGame(reason) {
        this.isRunning = false;
        
        // Clear timers
        if (this.flightGenerationTimer) clearTimeout(this.flightGenerationTimer);
        if (this.dayTimer) clearInterval(this.dayTimer);
        if (this.weatherChangeTimer) clearInterval(this.weatherChangeTimer);
        
        // Calculate final score
        const score = StorageManager.calculateScore(this);
        const isHighScore = StorageManager.saveHighScore(score);
        
        // Show game over screen
        UI.showGameOver(score, isHighScore, reason);
        
        AudioManager.play('warning');
    },
    
    /**
     * Reset game state
     */
    reset() {
        // Clear timers
        if (this.flightGenerationTimer) clearTimeout(this.flightGenerationTimer);
        if (this.dayTimer) clearInterval(this.dayTimer);
        if (this.weatherChangeTimer) clearInterval(this.weatherChangeTimer);
        
        // Reset values
        this.isRunning = false;
        this.isPaused = false;
        this.cash = CONSTANTS.STARTING_CASH;
        this.satisfaction = CONSTANTS.STARTING_SATISFACTION;
        this.reputation = CONSTANTS.STARTING_REPUTATION;
        this.day = 1;
        this.flightsCompleted = 0;
        
        this.gates = [];
        this.flightQueue = [];
        this.activeAlerts = [];
        this.purchasedUpgrades.clear();
        this.availableUpgrades = [];
        
        this.processingSpeedMultiplier = 1.0;
        this.revenueMultiplier = 1.0;
        this.satisfactionMultiplier = 1.0;
        this.costMultiplier = 1.0;
        
        this.currentWeather = 'CLEAR';
        
        // Reset warnings
        this.lowCashWarned = false;
        this.lowRepWarned = false;
        
        // Reinitialize
        this.init();
    }
};
