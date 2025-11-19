/* ==========================================
   UI MANAGER
   Handles updating the user interface
   ========================================== */

const UI = {
    /**
     * Initialize UI
     */
    init() {
        this.updateStats();
        this.updateGatesList();
        this.updateFlightQueue();
        this.updateUpgradesList();
        this.updateWeather();
        this.updateStatusMessage('💡 TIP: Completing flights earns money. Daily costs and upgrades cost money.');
    },
    
    /**
     * Update stats display
     */
    updateStats() {
        document.getElementById('cash').textContent = Utils.formatCurrency(GameState.cash);
        document.getElementById('satisfaction').textContent = Utils.formatPercent(GameState.satisfaction);
        document.getElementById('reputation').textContent = GameState.reputation;
        document.getElementById('gameDay').textContent = GameState.day;
        document.getElementById('flightsCompleted').textContent = GameState.flightsCompleted;
        
        // Color code satisfaction
        const satisfactionEl = document.getElementById('satisfaction');
        satisfactionEl.style.color = Utils.getSatisfactionColor(GameState.satisfaction);
    },
    
    /**
     * Update gates list
     */
    updateGatesList() {
        const gatesList = document.getElementById('gatesList');
        gatesList.innerHTML = '';
        
        GameState.gates.forEach(gate => {
            const gateItem = document.createElement('div');
            gateItem.className = `gate-item ${gate.isAvailable() ? 'available' : 'occupied'}`;
            gateItem.dataset.gateId = gate.id;
            
            const statusText = gate.isAvailable() ? 'Available' : 'Occupied';
            const statusClass = gate.isAvailable() ? 'available' : 'occupied';
            
            let progressHTML = '';
            if (gate.isProcessing) {
                const progress = gate.getProgress() * 100;
                const flight = gate.assignedFlight;
                progressHTML = `
                    <div class="gate-progress">
                        <small>${flight.flightNumber} - ${flight.airline}</small>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <small>${Math.round(100 - progress)}% remaining</small>
                    </div>
                `;
            }
            
            gateItem.innerHTML = `
                <div class="gate-header">
                    <span class="gate-name">${gate.name}</span>
                    <span class="gate-status ${statusClass}">${statusText}</span>
                </div>
                <div class="gate-info">
                    Capacity: ${gate.capacity} passengers
                </div>
                ${progressHTML}
            `;
            
            gatesList.appendChild(gateItem);
        });
    },
    
    /**
     * Update flight queue
     */
    updateFlightQueue() {
        const flightQueue = document.getElementById('flightQueue');
        flightQueue.innerHTML = '';
        
        // Only show unassigned flights
        const unassignedFlights = GameState.flightQueue.filter(f => !f.assignedGate);
        
        if (unassignedFlights.length === 0) {
            flightQueue.innerHTML = '<p style="text-align: center; color: #64748b; padding: 1rem;">No pending flights</p>';
            return;
        }
        
        unassignedFlights.forEach(flight => {
            const flightCard = document.createElement('div');
            flightCard.className = `flight-card ${flight.getDisplayClass()}`;
            flightCard.draggable = true;
            flightCard.dataset.flightId = flight.id;
            
            const typeInfo = CONSTANTS.FLIGHT_TYPES[flight.type];
            const waitingTime = Math.floor(flight.waitingTime);
            
            let specialBadge = '';
            if (flight.isEmergency) {
                specialBadge = '<span class="flight-type">⚠️ EMERGENCY</span>';
            } else if (flight.isVIP) {
                specialBadge = '<span class="flight-type">⭐ VIP</span>';
            }
            
            flightCard.innerHTML = `
                <div class="flight-header">
                    <span class="flight-number">${flight.icon} ${flight.flightNumber}</span>
                    ${specialBadge}
                </div>
                <div class="flight-details">
                    <div>
                        <span>Airline:</span>
                        <span>${flight.airline}</span>
                    </div>
                    <div>
                        <span>Type:</span>
                        <span>${typeInfo.name}</span>
                    </div>
                    ${flight.passengers > 0 ? `
                    <div>
                        <span>Passengers:</span>
                        <span>${flight.passengers}</span>
                    </div>
                    ` : '<div><span>Cargo Flight</span></div>'}
                    ${waitingTime > 0 ? `
                    <div>
                        <span>Waiting:</span>
                        <span style="color: #fbbf24;">${waitingTime}s</span>
                    </div>
                    ` : ''}
                </div>
            `;
            
            flightQueue.appendChild(flightCard);
        });
    },
    
    /**
     * Update upgrades list
     */
    updateUpgradesList() {
        const upgradesList = document.getElementById('upgradesList');
        upgradesList.innerHTML = '';
        
        GameState.availableUpgrades.forEach(upgrade => {
            const upgradeItem = document.createElement('div');
            upgradeItem.className = `upgrade-item ${upgrade.purchased ? 'purchased' : ''}`;
            
            const canAfford = GameState.cash >= upgrade.cost;
            const buttonDisabled = upgrade.purchased || !canAfford ? 'disabled' : '';
            const buttonText = upgrade.purchased ? '✓ Purchased' : (canAfford ? 'Purchase' : `Need ${Utils.formatCurrency(upgrade.cost - GameState.cash)} more`);
            
            // Color code the cost
            const costColor = canAfford ? '#10b981' : '#ef4444';
            
            upgradeItem.innerHTML = `
                <div class="upgrade-header">
                    <span class="upgrade-name">${upgrade.name}</span>
                    <span class="upgrade-cost" style="color: ${costColor}">${Utils.formatCurrency(upgrade.cost)}</span>
                </div>
                <div class="upgrade-description">${upgrade.description}</div>
                <button class="btn-upgrade" ${buttonDisabled} data-upgrade-id="${upgrade.id}">
                    ${buttonText}
                </button>
            `;
            
            upgradesList.appendChild(upgradeItem);
        });
    },
    
    /**
     * Update weather display
     */
    updateWeather() {
        const weatherEl = document.getElementById('weather');
        const weather = CONSTANTS.WEATHER[GameState.currentWeather];
        weatherEl.textContent = weather.name;
    },
    
    /**
     * Update status message
     */
    updateStatusMessage(message) {
        document.getElementById('statusMessage').textContent = message;
    },
    
    /**
     * Update alerts
     */
    updateAlerts() {
        const alertsContainer = document.getElementById('alerts');
        alertsContainer.innerHTML = '';
        
        GameState.activeAlerts.forEach(alert => {
            const alertEl = document.createElement('div');
            alertEl.className = `alert ${alert.type}`;
            alertEl.innerHTML = `
                <div class="alert-title">${alert.title}</div>
                <div class="alert-message">${alert.message}</div>
            `;
            alertsContainer.appendChild(alertEl);
        });
    },
    
    /**
     * Update everything
     */
    updateAll() {
        this.updateStats();
        this.updateGatesList();
        this.updateFlightQueue();
        this.updateAlerts();
        this.updateWeather();
    },
    
    /**
     * Show game over screen
     */
    showGameOver(score, isHighScore, reason) {
        const gameOverEl = document.getElementById('gameOver');
        const finalScoreEl = document.getElementById('finalScore');
        const highScoreMessageEl = document.getElementById('highScoreMessage');
        
        // Determine performance rating
        let rating = '⭐';
        if (GameState.flightsCompleted > 50) rating = '⭐⭐⭐⭐⭐';
        else if (GameState.flightsCompleted > 30) rating = '⭐⭐⭐⭐';
        else if (GameState.flightsCompleted > 15) rating = '⭐⭐⭐';
        else if (GameState.flightsCompleted > 5) rating = '⭐⭐';
        
        finalScoreEl.innerHTML = `
            <strong>Performance Rating:</strong> ${rating}<br><br>
            <strong>Final Score:</strong> ${score.toLocaleString()}<br>
            <strong>Days Survived:</strong> ${GameState.day}<br>
            <strong>Flights Completed:</strong> ${GameState.flightsCompleted}<br>
            <strong>Final Cash:</strong> ${Utils.formatCurrency(GameState.cash)}<br>
            <strong>Reputation:</strong> ${GameState.reputation}<br>
            <strong>Gates Owned:</strong> ${GameState.gates.length}<br><br>
            <em style="color: #ef4444;">${reason}</em>
        `;
        
        if (isHighScore) {
            highScoreMessageEl.innerHTML = '🎉 <strong>NEW HIGH SCORE!</strong> 🎉';
            highScoreMessageEl.style.color = '#10b981';
            highScoreMessageEl.style.fontSize = '1.2rem';
        } else {
            const highScore = StorageManager.getHighScore();
            highScoreMessageEl.innerHTML = `High Score: ${highScore.toLocaleString()}`;
            highScoreMessageEl.style.color = '#64748b';
        }
        
        gameOverEl.classList.remove('hidden');
    }
};
