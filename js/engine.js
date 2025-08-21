const Engine = {
    // --- Game State ---
    state: {},

    // --- Canvas & Contexts ---
    displayCanvas: null,
    displayCtx: null,
    gameCanvas: null,
    gameCtx: null,

    // --- Configuration ---
    levelData: null,

    // --- Initialization ---
    init: async function(canvasId, levelData) {
        // --- Canvas Setup ---
        this.displayCanvas = document.getElementById(canvasId);
        this.displayCtx = this.displayCanvas.getContext('2d');
        this.gameCanvas = document.createElement('canvas');

        // --- Load Level Data ---
        this.levelData = levelData;

        // --- Initialize State ---
        this.state = {
            // Canvases
            gameWidth: 800,
            gameHeight: 450,
            scale: 1,
            // Game progress
            gameState: 'start',
            scrollOffset: 0,
            score: 0,
            quantaGoal: 0,
            quantumLeapReady: false,
            // Entities
            player: this.initializePlayerState(this.levelData.character),
            platforms: [],
            quanta: [],
            atoms: [],
            electrons: [],
            powerUps: [],
            collectedPowerUps: [],
            // Timers & flags
            electronTimer: 0,
            shouldReset: false,
            pendingSounds: [],
            prevKeys: {},
            // UI elements
            touchControls: { left: { x: 50, y: 360, width: 70, height: 70, key: 'ArrowLeft' }, right: { x: 140, y: 360, width: 70, height: 70, key: 'ArrowRight' }, jump: { x: 680, y: 360, width: 70, height: 70, key: 'Space' } },
            fullscreenButton: { x: 750, y: 10, width: 40, height: 40 },
            audioToggleButton: { x: 700, y: 10, width: 40, height: 40 },
            startButton: { x: 300, y: 305, width: 200, height: 50 },
            isFullscreenSupported: typeof document.fullscreenEnabled !== 'undefined'
        };
        this.gameCanvas.width = this.state.gameWidth;
        this.gameCanvas.height = this.state.gameHeight;
        this.gameCtx = this.gameCanvas.getContext('2d');

        // --- Initialize Modules ---
        Controls.initialize(this.displayCanvas, this.state, {
            onAction: (code) => this.handleAction(code),
            onTap: (pos) => this.handleTap(pos)
        });
        this.state.keys = Controls.keys; // Link the controls keys to the state

        // Load audio sources from levelData
        await AudioSystem.load(this.levelData.audio);

        // --- Setup Level & Start ---
        this.resize();
        window.addEventListener('resize', () => this.resize());

        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    },

    initializePlayerState: function(characterName) {
        const characterData = Characters[characterName];
        const playerState = {
            ...characterData,
            velocityX: 0,
            velocityY: 0,
            isJumping: true,
            jumpCount: 0,
            abilities: {}
        };

        if (characterData.possibleAbilities) {
            characterData.possibleAbilities.forEach(ability => {
                playerState.abilities[ability] = {
                    active: false,
                    permanent: false,
                    timer: 0
                };
            });
        }

        return playerState;
    },

    // --- Game Loop ---
    gameLoop: function(timestamp) {
        if (this.state.gameState === 'playing') {
            Physics.update(this.state, this.levelData);
            this.updateAbilities(this.state);
        }

        Renderer.draw(this.displayCtx, this.gameCtx, this.state, this.levelData);

        // Handle post-update logic
        this.state.pendingSounds.forEach(sound => AudioSystem.playSound(sound));
        this.state.pendingSounds = [];

        if (this.state.shouldReset) {
            this.resetLevel();
            this.state.shouldReset = false;
        }

        // Update prevKeys for the next frame's input check
        this.state.prevKeys = { ...this.state.keys };

        requestAnimationFrame((t) => this.gameLoop(t));
    },

    updateAbilities: function(state) {
        // Activate collected power-ups
        if (state.collectedPowerUps.length > 0) {
            state.collectedPowerUps.forEach(p => {
                const ability = state.player.abilities[p.ability];
                if (ability) {
                    ability.active = true;
                    ability.timer = p.duration;
                }
            });
            state.collectedPowerUps = []; // Clear the array
        }

        // Update timers
        for (const key in state.player.abilities) {
            const ability = state.player.abilities[key];
            if (ability.timer > 0) {
                ability.timer--;
                if (ability.timer === 0 && !ability.permanent) {
                    ability.active = false;
                }
            }
        }
    },

    // --- Level Management ---
    resetLevel: function() {
        // Reset player state
        const freshPlayerState = this.initializePlayerState(this.levelData.character);
        this.state.player.x = 0;
        this.state.player.y = 0;
        this.state.player.velocityX = 0;
        this.state.player.velocityY = 0;
        this.state.player.isJumping = true;
        this.state.player.jumpCount = 0;
        this.state.player.abilities = freshPlayerState.abilities; // Reset abilities

        // Apply permanent unlocks for the level
        if (this.levelData.unlockedAbilities) {
            this.levelData.unlockedAbilities.forEach(ability => {
                if (this.state.player.abilities[ability]) {
                    this.state.player.abilities[ability].active = true;
                    this.state.player.abilities[ability].permanent = true;
                }
            });
        }

        // Reset progress
        this.state.scrollOffset = 0;
        this.state.score = 0;
        this.state.quantumLeapReady = false;
        this.state.electrons = [];
        this.state.electronTimer = 0;

        // Generate level layout
        this.setupLevelLayout();

        // Place player at start
        this.state.player.x = this.state.platforms[0].x + (this.state.platforms[0].width / 2) - (this.state.player.width / 2);
        this.state.player.y = this.state.platforms[0].y - this.state.player.height;

        this.state.gameState = 'playing';
        AudioSystem.playMusic();
    },

    setupLevelLayout: function() {
        this.state.platforms = [];
        this.state.quanta = [];
        this.state.atoms = [];
        this.state.powerUps = [];

        // Load power-ups if they exist in level data
        if (this.levelData.powerUps) {
            this.levelData.powerUps.forEach(p => {
                this.state.powerUps.push({
                    ...p,
                    y: this.state.gameHeight - p.y,
                    active: true
                });
            });
        }

        const pData = this.levelData.platforms;

        // If a static layout is provided, use it
        if (pData.layout) {
            pData.layout.forEach((p, i) => {
                const platform = {
                    x: p.x,
                    y: this.state.gameHeight - p.y,
                    width: p.width,
                    height: p.height,
                    goal: p.goal || false
                };
                this.state.platforms.push(platform);

                // Add quanta to all platforms except the first one
                if (i > 0) {
                    const qConf = this.levelData.quanta;
                    this.state.quanta.push({
                        x: platform.x + platform.width / 2,
                        y: platform.y + qConf.offsetY,
                        width: qConf.width,
                        height: qConf.height,
                        active: true
                    });
                }
            });
        } else { // Otherwise, generate the level procedurally
            let currentX = pData.initialX;
            for (let i = 0; i < pData.count; i++) {
                const y = pData.yRange[0] + Math.random() * (pData.yRange[1] - pData.yRange[0]);
                const width = pData.widthRange[0] + Math.random() * (pData.widthRange[1] - pData.widthRange[0]);
                const platform = { x: currentX, y: this.state.gameHeight - y, width: width, height: width };
                this.state.platforms.push(platform);

                if (this.levelData.background.type === 'atomic') {
                    this.state.atoms.push({ x: currentX + width / 2, y: platform.y + width / 2, radius: width / 2 });
                }

                if (i > 0) {
                    const qConf = this.levelData.quanta;
                    this.state.quanta.push({ x: currentX + width / 2, y: platform.y + qConf.offsetY, width: qConf.width, height: qConf.height, active: true });
                }
                currentX += pData.gap[0] + Math.random() * (pData.gap[1] - pData.gap[0]);
            }

            // Add goal platform
            const goalConf = pData.goalPlatform;
            const goalPlatform = { x: currentX, y: this.state.gameHeight - goalConf.y, width: goalConf.width, height: goalConf.height, goal: true };
            this.state.platforms.push(goalPlatform);
            if (this.levelData.background.type === 'atomic') {
                this.state.atoms.push({ x: currentX + goalConf.width / 2, y: goalPlatform.y + goalConf.height / 2, radius: goalConf.width / 2, goal: true });
            }
        }

        this.state.quantaGoal = this.state.quanta.length;
    },

    // --- Event Handlers ---
    handleAction: function(code) {
        if (this.state.gameState === 'start' && (code === 'Enter' || code === 'Space')) {
            this.resetLevel();
        } else if (this.state.gameState === 'complete' && (code === 'Enter' || code === 'Space')) {
            if (this.levelData.nextLevel) {
                window.location.href = this.levelData.nextLevel;
            } else {
                this.resetLevel();
            }
        }
    },

    handleTap: function(pos) {
        const { gameState, startButton, fullscreenButton, audioToggleButton, scale } = this.state;

        if (gameState === 'start' && isInside(pos, startButton, scale)) {
            this.resetLevel();
            return;
        }

        if (gameState === 'complete' && isInside(pos, startButton, scale)) {
            if (this.levelData.nextLevel) {
                window.location.href = this.levelData.nextLevel;
            } else {
                this.resetLevel();
            }
            return;
        }

        if (this.state.isFullscreenSupported && isInside(pos, fullscreenButton, scale)) {
            this.toggleFullscreen();
            return;
        }
        if (isInside(pos, audioToggleButton, scale)) {
            AudioSystem.toggleAudio(!AudioSystem.isAudioEnabled);
        }
    },

    // --- Utility Functions ---
    resize: function() {
        const ratio = this.state.gameWidth / this.state.gameHeight;
        let newWidth = window.innerWidth;
        let newHeight = window.innerHeight;
        if (newWidth / newHeight > ratio) {
            newWidth = newHeight * ratio;
        } else {
            newHeight = newWidth / ratio;
        }
        this.displayCanvas.style.width = newWidth + 'px';
        this.displayCanvas.style.height = newHeight + 'px';
        this.displayCanvas.width = newWidth;
        this.displayCanvas.height = newHeight;
        this.state.scale = newWidth / this.state.gameWidth;
    },

    toggleFullscreen: function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.().catch(err => console.log(err));
        } else {
            document.exitFullscreen?.();
        }
    }
};

// Redefine isInside here for Engine's own use, or import it. For now, redefine.
function isInside(pos, button, scale) {
    return pos.x > button.x * scale &&
           pos.x < (button.x + button.width) * scale &&
           pos.y < (button.y + button.height) * scale &&
           pos.y > button.y * scale;
}
