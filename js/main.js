/* ==========================================
   MAIN GAME LOOP
   Entry point and game loop management
   ========================================== */

// Game loop function
function gameLoop() {
    // Always render canvas for animations (clouds, etc.)
    Renderer.draw(GameState);
    
    // Only update game logic if running
    if (GameState.isRunning && !GameState.isPaused) {
        GameState.update();
        UI.updateAll();
    }
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🛫 Airport Logistics Tycoon - Starting...');
    
    // Initialize audio
    AudioManager.init();
    
    // Initialize renderer
    const canvas = document.getElementById('airportCanvas');
    Renderer.init(canvas);
    
    // Initialize event handlers
    EventHandler.init();
    
    // Draw initial canvas scene (empty airport)
    GameState.init();
    
    // Start rendering loop immediately (for animations)
    requestAnimationFrame(gameLoop);
    
    // Force multiple redraws to ensure canvas appears
    setTimeout(() => {
        Renderer.resize();
        Renderer.draw(GameState);
    }, 50);
    
    setTimeout(() => {
        Renderer.resize();
        Renderer.draw(GameState);
    }, 200);
    
    setTimeout(() => {
        Renderer.draw(GameState);
    }, 500);
    
    console.log('✅ Game ready! Click "Start Playing" to begin.');
});

// Handle page visibility changes (pause when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && GameState.isRunning && !GameState.isPaused) {
        GameState.togglePause();
        document.getElementById('pauseBtn').textContent = '▶️ Resume';
        UI.updateStatusMessage('Game Auto-Paused (tab hidden)');
    }
});

// Prevent default drag behavior on the document
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
});

// Export for debugging (optional)
if (typeof window !== 'undefined') {
    window.GameState = GameState;
    window.Renderer = Renderer;
    window.AudioManager = AudioManager;
    window.Utils = Utils;
}
