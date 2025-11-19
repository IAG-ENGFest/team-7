/* ==========================================
   EVENT HANDLERS
   Manages drag and drop and user interactions
   ========================================== */

const EventHandler = {
    draggedFlight: null,
    draggedElement: null,
    
    /**
     * Initialize event handlers
     */
    init() {
        this.setupDragAndDrop();
        this.setupUpgradeButtons();
        this.setupControlButtons();
    },
    
    /**
     * Setup drag and drop for flights
     */
    setupDragAndDrop() {
        const flightQueue = document.getElementById('flightQueue');
        const gatesList = document.getElementById('gatesList');
        
        // Use event delegation for flight cards
        flightQueue.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('flight-card')) {
                this.draggedFlight = e.target.dataset.flightId;
                this.draggedElement = e.target;
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            }
        });
        
        flightQueue.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('flight-card')) {
                e.target.classList.remove('dragging');
                this.draggedFlight = null;
                this.draggedElement = null;
            }
        });
        
        // Gate drop targets - use more robust event delegation
        gatesList.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const gateItem = e.target.closest('.gate-item');
            if (gateItem && gateItem.classList.contains('available')) {
                gateItem.classList.add('drop-target');
            }
        });
        
        gatesList.addEventListener('dragleave', (e) => {
            e.stopPropagation();
            const gateItem = e.target.closest('.gate-item');
            if (gateItem) {
                gateItem.classList.remove('drop-target');
            }
        });
        
        gatesList.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const gateItem = e.target.closest('.gate-item');
            
            // Remove all drop-target classes
            document.querySelectorAll('.gate-item').forEach(g => g.classList.remove('drop-target'));
            
            if (gateItem && this.draggedFlight) {
                const gateId = gateItem.dataset.gateId;
                const flight = GameState.flightQueue.find(f => f.id === this.draggedFlight);
                const gate = GameState.gates.find(g => g.id === gateId);
                
                // Check if gate is available
                if (!gate || !gate.isAvailable()) {
                    AudioManager.play('error');
                    GameState.addAlert(
                        'Gate Occupied!',
                        `${gate ? gate.name : 'This gate'} is currently processing another flight.`,
                        'warning'
                    );
                    return;
                }
                
                // Check if flight fits in gate
                if (flight && gate && flight.passengers > gate.capacity) {
                    AudioManager.play('error');
                    GameState.addAlert(
                        'Gate Too Small!',
                        `${flight.flightNumber} has ${flight.passengers} passengers but ${gate.name} only holds ${gate.capacity}. Choose a larger gate!`,
                        'danger'
                    );
                    return;
                }
                
                // Assign flight to gate
                if (GameState.assignFlightToGate(this.draggedFlight, gateId)) {
                    // Update UI
                    UI.updateGatesList();
                    UI.updateFlightQueue();
                }
            }
        });
    },
    
    /**
     * Setup upgrade button clicks
     */
    setupUpgradeButtons() {
        const upgradesList = document.getElementById('upgradesList');
        
        upgradesList.addEventListener('click', (e) => {
            const upgradeBtn = e.target.closest('.btn-upgrade');
            if (upgradeBtn && !upgradeBtn.hasAttribute('disabled')) {
                const upgradeId = upgradeBtn.dataset.upgradeId;
                
                if (GameState.purchaseUpgrade(upgradeId)) {
                    // Update UI immediately
                    UI.updateUpgradesList();
                    UI.updateStats();
                    
                    // Use setTimeout to ensure UI updates before canvas redraw
                    setTimeout(() => {
                        UI.updateGatesList();
                        Renderer.draw(GameState);
                    }, 50);
                }
            }
        });
    },
    
    /**
     * Setup control buttons (pause, sound, help)
     */
    setupControlButtons() {
        // Help button
        const helpBtn = document.getElementById('helpBtn');
        helpBtn.addEventListener('click', () => {
            document.getElementById('helpOverlay').classList.remove('hidden');
            AudioManager.play('click');
        });
        
        // Close help button
        const closeHelpBtn = document.getElementById('closeHelp');
        closeHelpBtn.addEventListener('click', () => {
            document.getElementById('helpOverlay').classList.add('hidden');
            AudioManager.play('click');
        });
        
        // Close help on overlay click
        document.getElementById('helpOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'helpOverlay') {
                document.getElementById('helpOverlay').classList.add('hidden');
            }
        });
        
        // Pause button
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.addEventListener('click', () => {
            const isPaused = GameState.togglePause();
            pauseBtn.textContent = isPaused ? '▶️ Resume' : '⏸️ Pause';
            pauseBtn.classList.toggle('paused', isPaused);
            
            if (isPaused) {
                UI.updateStatusMessage('Game Paused');
            } else {
                UI.updateStatusMessage('Game Resumed');
            }
        });
        
        // Sound button
        const soundBtn = document.getElementById('soundBtn');
        soundBtn.addEventListener('click', () => {
            const enabled = AudioManager.toggle();
            soundBtn.textContent = enabled ? '🔊 Sound' : '🔇 Muted';
            AudioManager.play('click');
        });
        
        // Start game button
        const startBtn = document.getElementById('startGame');
        startBtn.addEventListener('click', () => {
            this.startNewGame();
        });
        
        // Restart game button
        const restartBtn = document.getElementById('restartGame');
        restartBtn.addEventListener('click', () => {
            this.startNewGame();
        });
    },
    
    /**
     * Start a new game
     */
    startNewGame() {
        // Hide overlays
        document.getElementById('tutorial').classList.add('hidden');
        document.getElementById('gameOver').classList.add('hidden');
        
        // Game container is already visible
        
        // Reset game state
        GameState.reset();
        GameState.start();
        
        // Initialize UI
        UI.init();
        
        // Game loop is already running from DOMContentLoaded
    }
};
