const Physics = {
    update: function(state, level) {
        const { player, platforms, quanta, electrons, keys, quantumLeapReady } = state;
        const { gravity, jumpStrength, quantumJumpStrength } = level.physics;

        // --- Player Horizontal Movement ---
        if (keys['ArrowLeft'] || keys['KeyA']) {
            player.velocityX = -player.speed;
        } else if (keys['ArrowRight'] || keys['KeyD']) {
            player.velocityX = player.speed;
        } else {
            player.velocityX = 0;
        }
        player.x += player.velocityX;

        // --- Scrolling Camera Logic ---
        const worldWidth = platforms.length > 0 ? platforms[platforms.length - 1].x + platforms[platforms.length - 1].width : state.gameWidth;
        state.scrollOffset = player.x - state.gameWidth / 2;
        if (state.scrollOffset < 0) state.scrollOffset = 0;
        if (state.scrollOffset > worldWidth - state.gameWidth) {
            state.scrollOffset = worldWidth - state.gameWidth;
        }

        // --- Player Vertical Movement & Gravity ---
        player.y += player.velocityY;
        player.velocityY += gravity;

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
                player.jumpCount = 0; // Reset jump count on landing
                onPlatform = true;
                if (p.goal) {
                    state.gameState = 'complete';
                }
            }
        });

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

        // --- Collision Detection: PowerUps ---
        state.powerUps?.forEach(p => {
            if (p.active &&
                player.x < p.x + 15 &&
                player.x + player.width > p.x - 15 &&
                player.y < p.y + 15 &&
                player.y + player.height > p.y - 15)
            {
                p.active = false;
                state.collectedPowerUps.push(p);
                state.pendingSounds.push('collect'); // Reuse collect sound
            }
        });

        // --- Player Jump ---
        const { prevKeys } = state;
        const { doubleJumpStrength } = level.physics;
        const jumpKeyPressed = (keys['Space'] || keys['ArrowUp']);
        const prevJumpKeyPressed = (prevKeys['Space'] || prevKeys['ArrowUp']);

        if (jumpKeyPressed && !prevJumpKeyPressed) {
            const canFirstJump = player.jumpCount === 0;
            const canDoubleJump = player.jumpCount === 1 && player.abilities.doubleJump?.active;

            if (canFirstJump || canDoubleJump) {
                player.isJumping = true;
                player.jumpCount++;

                if (quantumLeapReady) {
                    player.velocityY = quantumJumpStrength;
                    state.quantumLeapReady = false;
                } else if (canFirstJump) {
                    player.velocityY = jumpStrength;
                } else { // Double jump
                    player.velocityY = doubleJumpStrength;
                }

                state.pendingSounds.push('jump');
            }
        }

        // --- Fall off screen ---
        if (player.y > state.gameHeight) {
            state.shouldReset = true;
        }

        // --- Update Enemies ---
        this.updateEnemies(state, level);
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
