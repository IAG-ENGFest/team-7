/* ==========================================
   GAME ENTITIES
   Classes for flights, gates, and upgrades
   ========================================== */

/**
 * Flight Class
 * Represents an incoming flight that needs to be assigned to a gate
 */
class Flight {
    constructor(type, isEmergency = false) {
        this.id = Utils.generateId();
        this.flightNumber = Utils.generateFlightNumber();
        this.type = type;
        this.isEmergency = isEmergency;
        this.isVIP = type === 'VIP';
        
        const flightConfig = CONSTANTS.FLIGHT_TYPES[type];
        this.passengers = Utils.randomInt(
            flightConfig.minPassengers,
            flightConfig.maxPassengers
        );
        this.baseRevenue = flightConfig.baseRevenue;
        this.processingTime = flightConfig.processingTime;
        this.icon = flightConfig.icon;
        
        this.airline = Utils.randomElement(AIRLINES);
        this.createdAt = Date.now();
        this.assignedGate = null;
        this.waitingTime = 0;
    }
    
    /**
     * Calculate revenue based on gate match and satisfaction
     */
    calculateRevenue(gateMatch, satisfactionFactor = 1.0) {
        let revenue = this.baseRevenue;
        
        // Gate match bonus
        if (gateMatch === 'perfect') revenue *= 1.2;
        else if (gateMatch === 'poor') revenue *= 0.7;
        
        // VIP bonus
        if (this.isVIP) revenue *= 1.5;
        
        // Satisfaction multiplier
        revenue *= satisfactionFactor;
        
        return Math.round(revenue);
    }
    
    /**
     * Get display class for styling
     */
    getDisplayClass() {
        if (this.isEmergency) return 'emergency';
        if (this.isVIP) return 'vip';
        return '';
    }
}

/**
 * Gate Class
 * Represents a gate where flights can be assigned
 */
class Gate {
    constructor(id, name, type = 'SMALL') {
        this.id = id;
        this.name = name;
        this.type = type;
        
        const gateConfig = CONSTANTS.GATE_TYPES[type];
        this.capacity = gateConfig.capacity;
        
        this.assignedFlight = null;
        this.isProcessing = false;
        this.processingStartTime = null;
        this.processingDuration = 0;
        
        // Canvas position
        this.x = 0;
        this.y = 0;
    }
    
    /**
     * Assign a flight to this gate
     */
    assignFlight(flight, processingSpeedMultiplier = 1.0) {
        if (this.assignedFlight) return false;
        
        this.assignedFlight = flight;
        this.isProcessing = true;
        this.processingStartTime = Date.now();
        this.processingDuration = flight.processingTime * processingSpeedMultiplier;
        
        flight.assignedGate = this;
        
        return true;
    }
    
    /**
     * Check if processing is complete
     */
    isComplete() {
        if (!this.isProcessing || !this.processingStartTime) return false;
        
        const elapsed = Date.now() - this.processingStartTime;
        return elapsed >= this.processingDuration;
    }
    
    /**
     * Get processing progress (0-1)
     */
    getProgress() {
        if (!this.isProcessing || !this.processingStartTime) return 0;
        
        const elapsed = Date.now() - this.processingStartTime;
        return Math.min(elapsed / this.processingDuration, 1);
    }
    
    /**
     * Complete processing and clear gate
     */
    completeFlight() {
        const flight = this.assignedFlight;
        this.assignedFlight = null;
        this.isProcessing = false;
        this.processingStartTime = null;
        this.processingDuration = 0;
        return flight;
    }
    
    /**
     * Check if gate is available
     */
    isAvailable() {
        return !this.assignedFlight && !this.isProcessing;
    }
}

/**
 * Upgrade Class
 * Represents an upgrade that can be purchased
 */
class Upgrade {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.cost = config.cost;
        this.effect = config.effect;
        this.value = config.value;
        this.purchased = false;
    }
    
    /**
     * Purchase this upgrade
     */
    purchase() {
        this.purchased = true;
    }
}

/**
 * Alert Class
 * Represents a notification/alert shown to the player
 */
class Alert {
    constructor(title, message, type = 'info') {
        this.id = Utils.generateId();
        this.title = title;
        this.message = message;
        this.type = type; // 'success', 'warning', 'danger', 'info'
        this.createdAt = Date.now();
    }
}
