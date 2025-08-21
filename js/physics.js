const Physics = {
    update: function(state, level) {
        const { players, platforms, quanta, electrons, keys, quantumLeapReady, prevKeys } = state;
        const { gravity, jumpStrength, quantumJumpStrength, doubleJumpStrength } = level.physics;
        const player1 = players[0];

        // --- Player Horizontal Movement (applied to all players) ---
        let velocityX = 0;
        if (keys['ArrowLeft'] || keys['KeyA']) {
            velocityX = -player1.speed;
        } else if (keys['ArrowRight'] || keys['KeyD']) {
            velocityX = player1.speed;
        }

        // --- Player Jump (applied to all players) ---
        const jumpKeyPressed = (keys['Space'] || keys['ArrowUp']);
        const prevJumpKeyPressed = (prevKeys['Space'] || prevKeys['ArrowUp']);
        if (jumpKeyPressed && !prevJumpKeyPressed) {
            const canFirstJump = player1.jumpCount === 0;
            const canDoubleJump = player1.jumpCount === 1 && player1.abilities.doubleJump?.active;

            if (canFirstJump || canDoubleJump) {
                player1.isJumping = true;
                player1.jumpCount++;
                let jumpVelocity = 0;

                if (quantumLeapReady) {
                    jumpVelocity = quantumJumpStrength;
                    state.quantumLeapReady = false;
                } else if (canFirstJump) {
                    jumpVelocity = jumpStrength;
                } else { // Double jump
                    jumpVelocity = doubleJumpStrength;
                }

                players.forEach(p => p.velocityY = jumpVelocity);
                state.pendingSounds.push('jump');
            }
        }

        // --- Update each player instance ---
        players.forEach((player, index) => {
            player.velocityX = velocityX;
            player.x += player.velocityX;

            // Vertical Movement & Gravity
            player.y += player.velocityY;
            player.velocityY += gravity;

            // Platform Collision
            platforms.forEach(p => {
                if (this.isColliding(player, p) && player.velocityY >= 0) {
                    // A more precise check to prevent sticking to ceilings
                    const verticalCheck = player.y + player.height;
                    if (verticalCheck >= p.y && verticalCheck <= p.y + player.velocityY) {
                        player.y = p.y - player.height;
                        player.velocityY = 0;
                        player.isJumping = false;
                        player.jumpCount = 0;
                        if (p.goal) state.gameState = 'complete';
                    }
                }
            });

            // Door Collision
            state.doors?.forEach(d => {
                let doorSegments = [];
                if (d.type === 'single') {
                    const currentOpening = d.openingHeight * d.currentOpeningRatio;
                    const openingTop = d.y - currentOpening / 2;
                    const openingBottom = d.y + currentOpening / 2;
                    doorSegments.push({ x: d.x, y: 0, width: d.width, height: openingTop });
                    doorSegments.push({ x: d.x, y: openingBottom, width: d.width, height: state.gameHeight - openingBottom });
                } else if (d.type === 'double') {
                    const open1 = d.openings[0];
                    const open2 = d.openings[1];
                    const currentOpening1 = open1.height * d.currentOpeningRatio;
                    const currentOpening2 = open2.height * d.currentOpeningRatio;
                    const opening1Top = open1.y - currentOpening1 / 2;
                    const opening1Bottom = open1.y + currentOpening1 / 2;
                    const opening2Top = open2.y - currentOpening2 / 2;
                    const opening2Bottom = open2.y + currentOpening2 / 2;
                    doorSegments.push({ x: d.x, y: 0, width: d.width, height: opening1Top });
                    doorSegments.push({ x: d.x, y: opening1Bottom, width: d.width, height: opening2Top - opening1Bottom });
                    doorSegments.push({ x: d.x, y: opening2Bottom, width: d.width, height: state.gameHeight - opening2Bottom });
                }
                doorSegments.forEach(segment => {
                    if (this.isColliding(player, segment)) {
                        state.shouldReset = true;
                    }
                });
            });

            // Quanta & PowerUp Collision (only for player1 to avoid double counting)
            if (index === 0) {
                quanta.forEach(q => {
                    if (q.active && this.isColliding(player, q)) {
                        q.active = false;
                        state.score++;
                        if (state.score >= state.quantaGoal) state.quantumLeapReady = true;
                        state.pendingSounds.push('collect');
                    }
                });
                state.powerUps?.forEach(p => {
                    if (p.active && this.isColliding(player, p, 15)) {
                        p.active = false;
                        state.collectedPowerUps.push(p);
                        state.pendingSounds.push('collect');
                    }
                });
            }

            // Fall off screen
            if (player.y > state.gameHeight) {
                state.shouldReset = true;
            }
        });

        // --- Wave-like motion for split state ---
        if (players.length > 1) {
            const player2 = players[1];
            const waveOffset = 40; // Vertical separation
            player2.y = player1.y + waveOffset;
            player2.x = player1.x; // Keep x position locked
        }

        // --- Scrolling Camera Logic (based on player1) ---
        const worldWidth = platforms.length > 0 ? platforms[platforms.length - 1].x + platforms[platforms.length - 1].width : state.gameWidth;
        state.scrollOffset = player1.x - state.gameWidth / 2;
        if (state.scrollOffset < 0) state.scrollOffset = 0;
        if (state.scrollOffset > worldWidth - state.gameWidth) {
            state.scrollOffset = worldWidth - state.gameWidth;
        }

        // --- Update Enemies (pass player1 for collision) ---
        this.updateEnemies(state, level, player1);
    },

    isColliding: function(obj1, obj2, padding = 0) {
        return obj1.x < obj2.x + (obj2.width || padding * 2) &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + (obj2.height || padding * 2) &&
               obj1.y + obj1.height > obj2.y;
    },

    updateEnemies: function(state, level, player) {
        if (!level.enemies) return;

        const { electrons, scrollOffset, gameWidth } = state;

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
            if (this.isColliding(player, e)) {
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
