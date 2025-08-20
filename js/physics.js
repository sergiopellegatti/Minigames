logDebug('js/physics.js loaded.');

const Physics = {
    update: function(state, level) {
        logDebug('Physics.update started.');
        const { player, platforms, quanta, electrons, keys, quantumLeapReady } = state;
        const { gravity, jumpStrength, quantumJumpStrength } = level.physics;
        logDebug('...deconstruction complete.');

        // --- Player Horizontal Movement ---
        if (keys['ArrowLeft'] || keys['KeyA']) {
            player.velocityX = -player.speed;
        } else if (keys['ArrowRight'] || keys['KeyD']) {
            player.velocityX = player.speed;
        } else {
            player.velocityX = 0;
        }
        player.x += player.velocityX;
        logDebug('...horizontal movement done.');

        // --- Scrolling Camera Logic ---
        const worldWidth = platforms.length > 0 ? platforms[platforms.length - 1].x + platforms[platforms.length - 1].width : state.gameWidth;
        state.scrollOffset = player.x - state.gameWidth / 2;
        if (state.scrollOffset < 0) state.scrollOffset = 0;
        if (state.scrollOffset > worldWidth - state.gameWidth) {
            state.scrollOffset = worldWidth - state.gameWidth;
        }
        logDebug('...camera logic done.');

        // --- Player Vertical Movement & Gravity ---
        player.y += player.velocityY;
        player.velocityY += gravity;
        logDebug('...vertical movement done.');

        // --- Collision Detection: Platforms ---
        let onPlatform = false;
        platforms.forEach(p => {
            if (player.x + player.width > p.x &&
                player.x < p.x + p.width &&
                player.y + player.height >= p.y &&
                player.y + player.height <= p.y + player.velocityY && // Check against next frame's position
                player.velocityY >= 0)
            {
                player.y = p.y - player.height;
                player.velocityY = 0;
                player.isJumping = false;
                onPlatform = true;
                if (p.goal) {
                    state.gameState = 'complete';
                }
            }
        });
        logDebug('...platform collision done.');

        // --- Collision Detection: Quanta ---
        quanta.forEach(q => {
            if (q.active &&
                player.x < q.x + q.width &&
                player.x + player.width > q.x &&
                player.y < q.y + q.height &&
                player.y + player.height > q.y)
            {
                q.active = false;
                state.score++;
                if (state.score >= state.quantaGoal) {
                    state.quantumLeapReady = true;
                }
                // The engine will be responsible for playing sounds
                state.pendingSounds.push('collect');
            }
        });
        logDebug('...quanta collision done.');

        // --- Player Jump ---
        if ((keys['Space'] || keys['ArrowUp']) && !player.isJumping) {
            player.isJumping = true;
            player.velocityY = quantumLeapReady ? quantumJumpStrength : jumpStrength;
            if (quantumLeapReady) {
                state.quantumLeapReady = false; // Reset the leap
            }
            state.pendingSounds.push('jump');
        }
        logDebug('...jump logic done.');

        // --- Fall off screen ---
        if (player.y > state.gameHeight) {
            state.shouldReset = true;
        }
        logDebug('...fall logic done.');

        // --- Update Enemies ---
        this.updateEnemies(state, level);
        logDebug('...enemy update done.');
        logDebug('Physics.update finished.');
    },

    updateEnemies: function(state, level) {
        if (!level.enemies) return;

        const { player, electrons, scrollOffset, gameWidth } = state;

        state.electronTimer++;
        if (state.electronTimer > level.enemies.interval) {
            this.spawnEnemy(state, level);
            state.electronTimer = 0;
        }

        electrons.forEach((e, index) => {
            e.x += e.speed;
            // Remove if off-screen
            if (e.x < scrollOffset - 50 || e.x > scrollOffset + gameWidth + 50) {
                electrons.splice(index, 1);
            }
            // Check for collision with player
            if (player.x < e.x + e.width &&
                player.x + player.width > e.x &&
                player.y < e.y + e.height &&
                player.y + player.height > e.y)
            {
                state.shouldReset = true;
            }
        });
    },

    spawnEnemy: function(state, level) {
        const { scrollOffset, gameHeight, gameWidth } = state;
        const { speedRange } = level.enemies;

        const y = Math.random() * gameHeight;
        const speed = speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]);

        if (Math.random() > 0.5) {
            // Spawn from left
            state.electrons.push({ x: scrollOffset - 20, y: y, width: 10, height: 10, speed: speed });
        } else {
            // Spawn from right
            state.electrons.push({ x: scrollOffset + gameWidth + 20, y: y, width: 10, height: 10, speed: -speed });
        }
    }
};
