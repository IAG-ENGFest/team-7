/* ==========================================
   AUDIO MANAGER
   Handles sound effects and audio playback
   ========================================== */

const AudioManager = {
    context: null,
    enabled: true,
    
    /**
     * Initialize audio context
     */
    init() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
            window.audioContext = this.context;
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    },
    
    /**
     * Play a sound effect
     */
    play(type) {
        if (!this.enabled || !this.context) return;
        
        switch (type) {
            case 'flightAssigned':
                this.playTone(523.25, 100, 0.1); // C5
                break;
            case 'flightComplete':
                this.playMelody([523.25, 659.25, 783.99], 0.1); // C5, E5, G5
                break;
            case 'emergency':
                this.playAlarm();
                break;
            case 'upgrade':
                this.playMelody([523.25, 587.33, 659.25, 783.99], 0.15); // C5, D5, E5, G5
                break;
            case 'warning':
                this.playTone(293.66, 150, 0.1); // D4
                break;
            case 'cashRegister':
                this.playMelody([659.25, 783.99], 0.1); // E5, G5
                break;
            case 'error':
                this.playTone(220, 200, 0.1); // A3
                break;
            case 'click':
                this.playTone(800, 50, 0.05); // High click
                break;
        }
    },
    
    /**
     * Play a single tone
     */
    playTone(frequency, duration, volume = 0.1) {
        if (!this.context) return;
        
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.value = volume;
        gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            this.context.currentTime + duration / 1000
        );
        
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration / 1000);
    },
    
    /**
     * Play a melody (sequence of tones)
     */
    playMelody(frequencies, volume = 0.1) {
        if (!this.context) return;
        
        let time = this.context.currentTime;
        const noteDuration = 0.15;
        
        frequencies.forEach(freq => {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            gainNode.gain.value = volume;
            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                time + noteDuration
            );
            
            oscillator.start(time);
            oscillator.stop(time + noteDuration);
            
            time += noteDuration;
        });
    },
    
    /**
     * Play alarm sound
     */
    playAlarm() {
        if (!this.context) return;
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.playTone(440, 100, 0.15);
                setTimeout(() => this.playTone(554.37, 100, 0.15), 120);
            }, i * 300);
        }
    },
    
    /**
     * Toggle sound on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
};
