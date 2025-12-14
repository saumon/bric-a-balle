export class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3; // Global volume
        this.masterGain.connect(this.ctx.destination);
    }

    resume() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(frequency, type, duration, startTime = 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime + startTime);
        
        gain.gain.setValueAtTime(1, this.ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(this.ctx.currentTime + startTime);
        osc.stop(this.ctx.currentTime + startTime + duration);
    }

    playBrickHit() {
        this.resume();
        // High pitched ping
        this.playTone(800 + Math.random() * 200, 'sine', 0.1);
    }

    playPaddleHit() {
        this.resume();
        // Lower pitched thud
        this.playTone(300, 'square', 0.1);
    }

    playPowerUp() {
        this.resume();
        // Ascending arpeggio
        this.playTone(440, 'sine', 0.1, 0);       // A4
        this.playTone(554.37, 'sine', 0.1, 0.05); // C#5
        this.playTone(659.25, 'sine', 0.2, 0.1);  // E5
    }
}
