// Retro Sound System using Web Audio API
const sounds = {
    audioCtx: null,
    bgmOsc: null,
    bgmGain: null,
    bgmInterval: null,
    isPlayingBGM: false,

    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    },

    playTone(freq, type, duration, vol = 0.1) {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    },

    playCoin() { this.playTone(800, 'sine', 0.2, 0.2); setTimeout(() => this.playTone(1200, 'sine', 0.3, 0.2), 50); },
    playFuel() { this.playTone(400, 'square', 0.1, 0.1); setTimeout(() => this.playTone(600, 'square', 0.3, 0.1), 100); },
    playCrash() { this.playTone(100, 'sawtooth', 0.5, 0.3); },
    playBonus() { this.playTone(600, 'sine', 0.1, 0.2); setTimeout(() => this.playTone(800, 'sine', 0.2, 0.2), 100); },

    playBGM() {
        if (this.isPlayingBGM || !this.audioCtx) return;
        this.isPlayingBGM = true;

        const notes = [
            261.63, 329.63, 392.00, 523.25, // C E G C
            261.63, 329.63, 392.00, 523.25,
            349.23, 440.00, 523.25, 698.46, // F A C F
            293.66, 349.23, 440.00, 587.33  // D F A D
        ];
        let noteIndex = 0;

        this.bgmOsc = this.audioCtx.createOscillator();
        this.bgmGain = this.audioCtx.createGain();

        this.bgmOsc.type = 'triangle';
        this.bgmGain.gain.setValueAtTime(0.05, this.audioCtx.currentTime);

        this.bgmOsc.connect(this.bgmGain);
        this.bgmGain.connect(this.audioCtx.destination);
        this.bgmOsc.start();

        this.bgmInterval = setInterval(() => {
            if (this.audioCtx && this.isPlayingBGM) {
                this.bgmOsc.frequency.setValueAtTime(notes[noteIndex], this.audioCtx.currentTime);
                noteIndex = (noteIndex + 1) % notes.length;
            }
        }, 200); // 200ms per note
    },

    stopBGM() {
        if (!this.isPlayingBGM) return;
        this.isPlayingBGM = false;
        if (this.bgmInterval) clearInterval(this.bgmInterval);
        if (this.bgmOsc) {
            try { this.bgmOsc.stop(); } catch (e) { }
            this.bgmOsc.disconnect();
        }
        if (this.bgmGain) this.bgmGain.disconnect();
    }
};
