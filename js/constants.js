/* ==========================================
   GAME CONSTANTS
   Configuration and static values for the game
   ========================================== */

const CONSTANTS = {
    // Game Balance
    STARTING_CASH: 80000,
    STARTING_SATISFACTION: 100,
    STARTING_REPUTATION: 50,
    
    // Flight Generation
    MIN_FLIGHT_INTERVAL: 8000,  // 8 seconds
    MAX_FLIGHT_INTERVAL: 20000, // 20 seconds
    
    // Flight Types
    FLIGHT_TYPES: {
        DOMESTIC: {
            name: 'Domestic',
            minPassengers: 50,
            maxPassengers: 120,
            baseRevenue: 8000,
            processingTime: 15000, // 15 seconds
            icon: '✈️'
        },
        INTERNATIONAL: {
            name: 'International',
            minPassengers: 120,
            maxPassengers: 250,
            baseRevenue: 18000,
            processingTime: 25000, // 25 seconds
            icon: '🌍'
        },
        CARGO: {
            name: 'Cargo',
            minPassengers: 0,
            maxPassengers: 0,
            baseRevenue: 12000,
            processingTime: 10000, // 10 seconds
            icon: '📦'
        },
        VIP: {
            name: 'VIP',
            minPassengers: 10,
            maxPassengers: 50,
            baseRevenue: 30000,
            processingTime: 20000, // 20 seconds
            icon: '⭐',
            reputationBonus: 10
        }
    },
    
    // Gate Types
    GATE_TYPES: {
        SMALL: {
            name: 'Small Gate',
            capacity: 150,
            cost: 0 // Starting gates
        },
        MEDIUM: {
            name: 'Medium Gate',
            capacity: 250,
            cost: 25000
        },
        LARGE: {
            name: 'Large Gate',
            capacity: 350,
            cost: 50000
        }
    },
    
    // Weather Conditions
    WEATHER: {
        CLEAR: { name: '☀️ Clear', delayFactor: 1.0, icon: '☀️' },
        CLOUDY: { name: '☁️ Cloudy', delayFactor: 1.1, icon: '☁️' },
        RAIN: { name: '🌧️ Rain', delayFactor: 1.3, icon: '🌧️' },
        STORM: { name: '⛈️ Storm', delayFactor: 1.5, icon: '⛈️' },
        FOG: { name: '🌫️ Fog', delayFactor: 1.4, icon: '🌫️' }
    },
    
    // Upgrades
    UPGRADES: [
        {
            id: 'terminal2',
            name: '🏢 Terminal 2',
            description: 'Unlock 2 additional gates',
            cost: 50000,
            effect: 'gates',
            value: 2
        },
        {
            id: 'lounge',
            name: '🛋️ VIP Lounge',
            description: 'Increase passenger satisfaction by 10%',
            cost: 35000,
            effect: 'satisfaction',
            value: 1.1
        },
        {
            id: 'fuelStation',
            name: '⛽ Fuel Station',
            description: 'Reduce operational costs by 15%',
            cost: 40000,
            effect: 'costs',
            value: 0.85
        },
        {
            id: 'runway2',
            name: '🛫 Second Runway',
            description: 'Reduce processing time by 20%',
            cost: 70000,
            effect: 'processingSpeed',
            value: 0.8
        },
        {
            id: 'controlTower',
            name: '🗼 Advanced Control Tower',
            description: 'Increase revenue by 25%',
            cost: 85000,
            effect: 'revenue',
            value: 1.25
        },
        {
            id: 'terminal3',
            name: '🏢 Terminal 3',
            description: 'Unlock 3 additional gates',
            cost: 120000,
            effect: 'gates',
            value: 3
        }
    ],
    
    // Game Mechanics
    SATISFACTION_DECAY_RATE: 0.3, // Per second when flight waiting
    MIN_SATISFACTION: 0,
    MAX_SATISFACTION: 100,
    
    REPUTATION_GAIN_SUCCESS: 2,
    REPUTATION_LOSS_TIMEOUT: 5,
    REPUTATION_LOSS_EMERGENCY: 10,
    
    OPERATIONAL_COST_PER_DAY: 3000,
    
    // Canvas Settings
    CANVAS: {
        GATE_WIDTH: 80,
        GATE_HEIGHT: 60,
        PLANE_WIDTH: 40,
        PLANE_HEIGHT: 30,
        RUNWAY_WIDTH: 600,
        RUNWAY_HEIGHT: 80
    },
    
    // Events
    EMERGENCY_CHANCE: 0.05, // 5% chance per flight
    VIP_CHANCE: 0.1, // 10% chance per flight
    WEATHER_CHANGE_INTERVAL: 60000, // Change weather every minute
    
    // Day/Night Cycle
    DAY_DURATION: 180000, // 3 minutes = 1 game day
    
    // Game Over Conditions
    MIN_CASH_GAME_OVER: -50000,
    MIN_REPUTATION_GAME_OVER: 0
};

// Flight numbers pool
const FLIGHT_NUMBERS = [
    'AA', 'UA', 'DL', 'BA', 'LH', 'AF', 'KL', 'EK', 'QR', 'SQ',
    'JL', 'NH', 'CX', 'TG', 'QF', 'VS', 'IB', 'AZ', 'LX', 'OS'
];

// Airline names
const AIRLINES = [
    'SkyWings', 'CloudJet', 'AeroLine', 'GlobalAir', 'PremiumFly',
    'SwiftAir', 'OceanicAir', 'MountainAir', 'CoastalAir', 'StarLine'
];
