/* ==========================================
   CANVAS RENDERER
   Handles drawing the airport layout and animations
   ========================================== */

const Renderer = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    animationFrame: 0,
    taxiingPlanes: [], // Planes moving on taxiways
    
    // Colors
    colors: {
        runway: '#4b5563',
        runwayLines: '#fbbf24',
        grass: '#22c55e',
        taxiway: '#6b7280',
        gate: '#3b82f6',
        gateOccupied: '#f59e0b',
        gateAvailable: '#10b981',
        plane: '#e5e7eb',
        planeWindow: '#60a5fa',
        terminal: '#64748b',
        sky: '#87ceeb',
        cloud: '#ffffff'
    },
    
    // Cloud positions for atmosphere
    clouds: [],
    
    /**
     * Initialize the canvas
     */
    init(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        // Initialize clouds
        this.initClouds();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resize();
            this.initClouds();
        });
    },
    
    /**
     * Initialize cloud positions
     */
    initClouds() {
        this.clouds = [];
        const cloudCount = 8;
        for (let i = 0; i < cloudCount; i++) {
            this.clouds.push({
                x: Math.random() * this.width,
                y: Math.random() * (this.height * 0.3),
                size: 40 + Math.random() * 60,
                speed: 0.1 + Math.random() * 0.3
            });
        }
    },
    
    /**
     * Resize canvas to fit container
     */
    resize() {
        const container = this.canvas.parentElement;
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Force a redraw after resize
        if (window.GameState && GameState.gates) {
            this.draw(GameState);
        }
    },
    
    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    },
    
    /**
     * Draw the entire airport scene
     */
    draw(gameState) {
        this.clear();
        
        // Increment animation frame
        this.animationFrame++;
        
        // Sky background
        this.drawSky();
        
        // Moving clouds
        this.drawClouds();
        
        // Background (grass)
        this.drawBackground();
        
        // Runways
        this.drawRunways();
        
        // Taxiways
        this.drawTaxiways();
        
        // Terminal building
        this.drawTerminal(gameState.gates.length);
        
        // Gates with visual connections
        this.drawGates(gameState.gates);
        
        // Planes at gates
        this.drawPlanes(gameState.gates);
        
        // Draw taxiing plane animations
        this.drawTaxiingPlanes();
        
        // Add some visual flair
        this.drawControlTower();
        this.drawParkingLot();
    },
    
    /**
     * Draw sky background
     */
    drawSky() {
        // Gradient sky
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height * 0.4);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(1, '#b0d4f1');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height * 0.4);
    },
    
    /**
     * Draw moving clouds
     */
    drawClouds() {
        this.clouds.forEach(cloud => {
            // Move cloud
            cloud.x += cloud.speed;
            if (cloud.x > this.width + cloud.size) {
                cloud.x = -cloud.size;
            }
            
            // Draw cloud (multiple circles for fluffy effect)
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.size * 0.4, cloud.y - cloud.size * 0.2, cloud.size * 0.4, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.size * 0.7, cloud.y, cloud.size * 0.45, 0, Math.PI * 2);
            this.ctx.fill();
        });
    },
    
    /**
     * Draw background (grass/tarmac)
     */
    drawBackground() {
        // Grass area (bottom 60% of canvas)
        const grassStart = this.height * 0.4;
        const gradient = this.ctx.createLinearGradient(0, grassStart, 0, this.height);
        gradient.addColorStop(0, '#2d5016');
        gradient.addColorStop(1, '#22c55e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, grassStart, this.width, this.height - grassStart);
        
        // Add some texture/detail
        this.ctx.globalAlpha = 0.15;
        this.ctx.fillStyle = '#16a34a';
        for (let i = 0; i < 150; i++) {
            const x = Math.random() * this.width;
            const y = grassStart + Math.random() * (this.height - grassStart);
            const size = Math.random() * 4 + 1;
            this.ctx.fillRect(x, y, size, size);
        }
        this.ctx.globalAlpha = 1.0;
    },
    
    /**
     * Draw runways
     */
    drawRunways() {
        const runwayWidth = Math.min(this.width * 0.8, 800);
        const runwayHeight = 80;
        const runwayX = (this.width - runwayWidth) / 2;
        const runwayY = this.height - 150;
        
        // Runway surface
        this.ctx.fillStyle = this.colors.runway;
        this.ctx.fillRect(runwayX, runwayY, runwayWidth, runwayHeight);
        
        // Center line
        this.ctx.strokeStyle = this.colors.runwayLines;
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([20, 20]);
        this.ctx.beginPath();
        this.ctx.moveTo(runwayX, runwayY + runwayHeight / 2);
        this.ctx.lineTo(runwayX + runwayWidth, runwayY + runwayHeight / 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Runway numbers
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('09', runwayX + 40, runwayY + runwayHeight / 2 + 8);
        this.ctx.fillText('27', runwayX + runwayWidth - 40, runwayY + runwayHeight / 2 + 8);
    },
    
    /**
     * Draw terminal building
     */
    drawTerminal(gateCount) {
        const terminalWidth = Math.min(this.width * 0.7, 700);
        const terminalHeight = 100;
        const terminalX = (this.width - terminalWidth) / 2;
        const terminalY = this.height * 0.35;
        
        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(terminalX + 5, terminalY + 5, terminalWidth, terminalHeight);
        
        // Main building with gradient
        const gradient = this.ctx.createLinearGradient(terminalX, terminalY, terminalX, terminalY + terminalHeight);
        gradient.addColorStop(0, '#64748b');
        gradient.addColorStop(1, '#475569');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(terminalX, terminalY, terminalWidth, terminalHeight);
        
        // Building details
        this.ctx.strokeStyle = '#334155';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(terminalX, terminalY, terminalWidth, terminalHeight);
        
        // Roof
        this.ctx.fillStyle = '#334155';
        this.ctx.beginPath();
        this.ctx.moveTo(terminalX - 10, terminalY);
        this.ctx.lineTo(terminalX + terminalWidth + 10, terminalY);
        this.ctx.lineTo(terminalX + terminalWidth, terminalY - 15);
        this.ctx.lineTo(terminalX, terminalY - 15);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Windows with lighting
        const windowWidth = 15;
        const windowHeight = 25;
        const windowSpacing = 35;
        const rows = 2;
        
        for (let row = 0; row < rows; row++) {
            for (let i = 0; i < Math.floor(terminalWidth / windowSpacing) - 1; i++) {
                const x = terminalX + 20 + i * windowSpacing;
                const y = terminalY + 20 + row * 40;
                
                // Window glow
                this.ctx.fillStyle = Math.random() > 0.3 ? '#fbbf24' : '#60a5fa';
                this.ctx.fillRect(x, y, windowWidth, windowHeight);
                
                // Window frame
                this.ctx.strokeStyle = '#1e293b';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x, y, windowWidth, windowHeight);
            }
        }
        
        // Terminal label with glow
        this.ctx.shadowColor = '#fbbf24';
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('✈ INTERNATIONAL TERMINAL ✈', this.width / 2, terminalY + terminalHeight / 2 + 8);
        this.ctx.shadowBlur = 0;
        
        // Gate count indicator
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`${gateCount} Active Gates`, this.width / 2, terminalY + terminalHeight + 15);
    },
    
    /**
     * Draw gates
     */
    drawGates(gates) {
        const terminalY = this.height * 0.35 + 100;
        const gateSpacing = Math.min(100, (this.width - 100) / gates.length);
        const startX = (this.width - (gates.length * gateSpacing)) / 2 + gateSpacing / 2;
        
        gates.forEach((gate, index) => {
            const x = startX + index * gateSpacing;
            const y = terminalY + 20;
            
            // Store position for later use
            gate.x = x;
            gate.y = y;
            
            // Gate platform with depth
            const gateWidth = 70;
            const gateHeight = 50;
            
            // Shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.fillRect(x - gateWidth / 2 + 3, y + 3, gateWidth, gateHeight);
            
            // Gate color based on status
            if (gate.isAvailable()) {
                const gradient = this.ctx.createLinearGradient(x, y, x, y + gateHeight);
                gradient.addColorStop(0, '#10b981');
                gradient.addColorStop(1, '#059669');
                this.ctx.fillStyle = gradient;
            } else {
                const gradient = this.ctx.createLinearGradient(x, y, x, y + gateHeight);
                gradient.addColorStop(0, '#f59e0b');
                gradient.addColorStop(1, '#d97706');
                this.ctx.fillStyle = gradient;
            }
            this.ctx.fillRect(x - gateWidth / 2, y, gateWidth, gateHeight);
            
            // Border with glow
            if (!gate.isAvailable()) {
                this.ctx.shadowColor = '#fbbf24';
                this.ctx.shadowBlur = 5;
            }
            this.ctx.strokeStyle = gate.isAvailable() ? '#065f46' : '#92400e';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(x - gateWidth / 2, y, gateWidth, gateHeight);
            this.ctx.shadowBlur = 0;
            
            // Gate label
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(gate.name, x, y + gateHeight / 2 + 6);
            
            // Status indicator
            const statusColor = gate.isAvailable() ? '#10b981' : '#ef4444';
            this.ctx.fillStyle = statusColor;
            this.ctx.beginPath();
            this.ctx.arc(x + gateWidth / 2 - 8, y + 8, 5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Jetway (boarding bridge) with detail
            const jetWayGradient = this.ctx.createLinearGradient(x, y - 30, x, y);
            jetWayGradient.addColorStop(0, '#cbd5e1');
            jetWayGradient.addColorStop(1, '#94a3b8');
            this.ctx.fillStyle = jetWayGradient;
            this.ctx.fillRect(x - 12, y - 30, 24, 30);
            
            // Jetway windows
            this.ctx.fillStyle = '#60a5fa';
            for (let i = 0; i < 2; i++) {
                this.ctx.fillRect(x - 8, y - 25 + i * 10, 6, 6);
                this.ctx.fillRect(x + 2, y - 25 + i * 10, 6, 6);
            }
        });
    },
    
    /**
     * Draw taxiways connecting gates
     */
    drawTaxiways() {
        const gateY = 200 + CONSTANTS.CANVAS.GATE_HEIGHT;
        const runwayY = this.height - 150;
        
        this.ctx.strokeStyle = this.colors.taxiway;
        this.ctx.lineWidth = 30;
        this.ctx.beginPath();
        this.ctx.moveTo(50, gateY + 20);
        this.ctx.lineTo(this.width - 50, gateY + 20);
        this.ctx.stroke();
        
        // Center taxiway to runway
        this.ctx.beginPath();
        this.ctx.moveTo(this.width / 2, gateY + 20);
        this.ctx.lineTo(this.width / 2, runwayY);
        this.ctx.stroke();
    },
    
    /**
     * Draw planes at occupied gates
     */
    drawPlanes(gates) {
        gates.forEach(gate => {
            if (gate.assignedFlight) {
                const progress = gate.getProgress();
                this.drawDetailedPlane(gate.x, gate.y + 65, progress, gate.assignedFlight);
            }
        });
    },
    
    /**
     * Draw a detailed plane with animations
     */
    drawDetailedPlane(x, y, progress, flight) {
        const planeWidth = 50;
        const planeHeight = 35;
        
        // Plane shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y + planeHeight / 2 + 5, planeWidth / 2 + 5, planeHeight / 2 + 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Fuselage (main body) with gradient
        const gradient = this.ctx.createLinearGradient(x - planeWidth / 2, y - planeHeight / 2, x + planeWidth / 2, y + planeHeight / 2);
        gradient.addColorStop(0, '#f8fafc');
        gradient.addColorStop(0.5, '#e2e8f0');
        gradient.addColorStop(1, '#cbd5e1');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, planeWidth / 2, planeHeight / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Fuselage outline
        this.ctx.strokeStyle = '#94a3b8';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Cockpit window
        this.ctx.fillStyle = '#0ea5e9';
        this.ctx.beginPath();
        this.ctx.ellipse(x + planeWidth / 2 - 10, y - 5, 8, 10, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#0284c7';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Passenger windows
        this.ctx.fillStyle = '#60a5fa';
        const windowCount = 6;
        for (let i = 0; i < windowCount; i++) {
            const windowX = x + 15 - i * 8;
            const windowY = y - 3;
            this.ctx.fillRect(windowX, windowY, 5, 5);
        }
        
        // Wings
        this.ctx.fillStyle = '#cbd5e1';
        // Top wing
        this.ctx.beginPath();
        this.ctx.moveTo(x - 15, y - 15);
        this.ctx.lineTo(x - 15, y + 15);
        this.ctx.lineTo(x + 5, y + 5);
        this.ctx.lineTo(x + 5, y - 5);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.strokeStyle = '#94a3b8';
        this.ctx.stroke();
        
        // Tail fin
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.beginPath();
        this.ctx.moveTo(x - planeWidth / 2, y - 8);
        this.ctx.lineTo(x - planeWidth / 2 - 10, y - 15);
        this.ctx.lineTo(x - planeWidth / 2, y);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Airline logo on tail (colored dot)
        const airlineColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
        const logoColor = airlineColors[flight.flightNumber.charCodeAt(0) % airlineColors.length];
        this.ctx.fillStyle = logoColor;
        this.ctx.beginPath();
        this.ctx.arc(x - planeWidth / 2 - 5, y - 8, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Engines (small circles under wings)
        this.ctx.fillStyle = '#64748b';
        this.ctx.beginPath();
        this.ctx.arc(x - 5, y + 8, 4, 0, Math.PI * 2);
        this.ctx.arc(x - 5, y - 8, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Progress bar below plane
        if (progress < 1) {
            const barWidth = 60;
            const barHeight = 8;
            const barX = x - barWidth / 2;
            const barY = y + planeHeight / 2 + 15;
            
            // Background
            this.ctx.fillStyle = '#1e293b';
            this.ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Progress fill with gradient
            const progressGradient = this.ctx.createLinearGradient(barX, barY, barX + barWidth * progress, barY);
            progressGradient.addColorStop(0, '#10b981');
            progressGradient.addColorStop(1, '#22c55e');
            this.ctx.fillStyle = progressGradient;
            this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);
            
            // Border
            this.ctx.strokeStyle = '#475569';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(barX, barY, barWidth, barHeight);
            
            // Percentage text
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${Math.round(progress * 100)}%`, x, barY + barHeight + 12);
        }
        
        // Flight number below plane
        this.ctx.fillStyle = '#1e293b';
        this.ctx.font = 'bold 11px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(flight.flightNumber, x, y + planeHeight / 2 + 32);
    },
    
    /**
     * Draw a moving plane animation (for takeoffs/landings)
     */
    drawMovingPlane(x, y, rotation = 0) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        
        // Simple plane for taxiing
        const size = 20;
        this.ctx.fillStyle = '#e5e7eb';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#94a3b8';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        this.ctx.restore();
    },
    
    /**
     * Draw taxiing planes (planes moving on taxiways)
     */
    drawTaxiingPlanes() {
        // Occasionally add new taxiing planes
        if (Math.random() < 0.01 && this.taxiingPlanes.length < 3) {
            this.taxiingPlanes.push({
                x: -30,
                y: this.height - 200,
                speed: 1 + Math.random(),
                rotation: 0
            });
        }
        
        // Draw and move taxiing planes
        this.taxiingPlanes = this.taxiingPlanes.filter(plane => {
            plane.x += plane.speed;
            
            if (plane.x < this.width + 50) {
                this.drawMovingPlane(plane.x, plane.y, plane.rotation);
                return true;
            }
            return false;
        });
    },
    
    /**
     * Draw control tower
     */
    drawControlTower() {
        const towerX = this.width - 100;
        const towerY = this.height * 0.5;
        const towerWidth = 60;
        const towerHeight = 120;
        
        // Tower shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(towerX + 3, towerY + 3, towerWidth, towerHeight);
        
        // Tower base
        const baseGradient = this.ctx.createLinearGradient(towerX, towerY, towerX, towerY + towerHeight);
        baseGradient.addColorStop(0, '#64748b');
        baseGradient.addColorStop(1, '#475569');
        this.ctx.fillStyle = baseGradient;
        this.ctx.fillRect(towerX, towerY + 40, towerWidth, towerHeight - 40);
        
        // Control room (top)
        const roomGradient = this.ctx.createLinearGradient(towerX - 10, towerY, towerX + towerWidth + 10, towerY + 50);
        roomGradient.addColorStop(0, '#1e40af');
        roomGradient.addColorStop(1, '#1e3a8a');
        this.ctx.fillStyle = roomGradient;
        this.ctx.fillRect(towerX - 10, towerY, towerWidth + 20, 50);
        
        // Windows with lights
        this.ctx.fillStyle = '#fbbf24';
        for (let i = 0; i < 4; i++) {
            this.ctx.fillRect(towerX + 5 + i * 15, towerY + 10, 10, 30);
        }
        
        // Antenna
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(towerX + towerWidth / 2, towerY);
        this.ctx.lineTo(towerX + towerWidth / 2, towerY - 20);
        this.ctx.stroke();
        
        // Blinking light on antenna
        if (this.animationFrame % 30 < 15) {
            this.ctx.fillStyle = '#ef4444';
            this.ctx.beginPath();
            this.ctx.arc(towerX + towerWidth / 2, towerY - 20, 4, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Label
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('ATC', towerX + towerWidth / 2, towerY + towerHeight + 12);
    },
    
    /**
     * Draw parking lot
     */
    drawParkingLot() {
        const parkingX = 50;
        const parkingY = this.height * 0.5;
        const parkingWidth = 80;
        const parkingHeight = 100;
        
        // Parking lot surface
        this.ctx.fillStyle = '#4b5563';
        this.ctx.fillRect(parkingX, parkingY, parkingWidth, parkingHeight);
        
        // Parking lines
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const y = parkingY + 20 + i * 20;
            this.ctx.beginPath();
            this.ctx.moveTo(parkingX, y);
            this.ctx.lineTo(parkingX + parkingWidth, y);
            this.ctx.stroke();
        }
        
        // Cars (simple rectangles)
        const carColors = ['#ef4444', '#3b82f6', '#22c55e', '#fbbf24', '#8b5cf6'];
        for (let i = 0; i < 3; i++) {
            this.ctx.fillStyle = carColors[i];
            this.ctx.fillRect(parkingX + 10, parkingY + 25 + i * 20, 25, 12);
            this.ctx.fillRect(parkingX + 45, parkingY + 25 + i * 20, 25, 12);
        }
        
        // Label
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PARKING', parkingX + parkingWidth / 2, parkingY + parkingHeight + 12);
    }
};
