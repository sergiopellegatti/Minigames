const AudioSystem = {
    isAudioEnabled: false,
    audioInitialized: false,
    audioContext: null,
    buffers: {},
    musicSource: null,

    // Use this to unlock audio on user interaction
    unlockAudio: function() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    },

    // Load all audio files specified in the level data
    load: async function(sources) {
        if (!window.AudioContext) {
            console.warn("Web Audio API is not supported in this browser.");
            return;
        }
        this.audioContext = new AudioContext();

        const promises = [];
        for (const key in sources) {
            if (sources[key]) { // Only load if a URL is provided
                promises.push(
                    fetch(sources[key])
                        .then(response => response.arrayBuffer())
                        .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
                        .then(audioBuffer => {
                            this.buffers[key] = audioBuffer;
                        })
                        .catch(e => console.error(`Error loading audio source ${key}:`, e))
                );
            }
        }
        await Promise.all(promises);
        this.audioInitialized = true;
    },

    playSound: function(sound) {
        if (!this.isAudioEnabled || !this.buffers[sound]) return;

        this.unlockAudio(); // Try to resume context just in case

        const source = this.audioContext.createBufferSource();
        source.buffer = this.buffers[sound];
        source.connect(this.audioContext.destination);
        source.start(0);
    },

    playMusic: function() {
        if (!this.isAudioEnabled || !this.buffers.music || this.musicSource) return;

        this.unlockAudio();

        this.musicSource = this.audioContext.createBufferSource();
        this.musicSource.buffer = this.buffers.music;
        this.musicSource.loop = true;
        this.musicSource.connect(this.audioContext.destination);
        this.musicSource.start(0);
    },

    stopMusic: function() {
        if (this.musicSource) {
            this.musicSource.stop();
            this.musicSource.disconnect();
            this.musicSource = null;
        }
    },

    toggleAudio: function(enable) {
        this.isAudioEnabled = enable;
        if (this.isAudioEnabled) {
            this.unlockAudio();
            if(!this.musicSource) {
               this.playMusic();
            }
        } else {
            this.stopMusic();
        }
    }
};
