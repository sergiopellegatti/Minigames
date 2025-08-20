const Renderer = {
    // Main drawing function, orchestrates all other drawing
    draw: function(dCtx, gCtx, state, level) {
        const { gameState, gameWidth, gameHeight, scale } = state;

        // Clear and draw to the offscreen game canvas
        gCtx.clearRect(0, 0, gameWidth, gameHeight);
        this.drawBackground(gCtx, state, level);

        if (gameState === 'playing') {
            this.drawPlatforms(gCtx, state, level);
            this.drawQuanta(gCtx, state, level);
            this.drawEnemies(gCtx, state, level);
            this.drawPlayer(gCtx, state, level);
        }

        // Draw the game canvas to the visible display canvas
        dCtx.clearRect(0, 0, dCtx.canvas.width, dCtx.canvas.height);
        dCtx.drawImage(gCtx.canvas, 0, 0, dCtx.canvas.width, dCtx.canvas.height);

        // Draw UI elements directly on the display canvas for sharpness
        if (gameState === 'playing') {
            this.drawUI(dCtx, state, level);
        } else if (gameState === 'start') {
            this.drawStartScreen(dCtx, state, level);
        } else if (gameState === 'complete') {
            this.drawCompleteScreen(dCtx, state, level);
        }
    },

    // --- Component Drawing Functions ---

    drawBackground: function(ctx, state, level) {
        const { gameWidth, gameHeight } = state;
        const { type, color } = level.background;

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, gameWidth, gameHeight);

        if (type === 'starfield') {
            // This will be implemented for Level 1
            ctx.fillStyle = 'white';
            if (!state.stars) { // Create stars if they don't exist
                state.stars = [];
                for (let i = 0; i < 100; i++) {
                    state.stars.push({
                        x: Math.random() * gameWidth,
                        y: Math.random() * gameHeight,
                        radius: Math.random() * 1.5
                    });
                }
            }
            state.stars.forEach(star => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    },

    drawPlatforms: function(ctx, state, level) {
        const { atoms, scrollOffset } = state;
        const { type } = level.background; // Use this to decide platform style

        if (type === 'atomic') {
            atoms.forEach(a => {
                const grad = ctx.createRadialGradient(a.x - scrollOffset, a.y, a.radius * 0.1, a.x - scrollOffset, a.y, a.radius);
                grad.addColorStop(0, a.goal ? 'rgba(255,223,0,0.8)' : 'rgba(150,150,255,0.5)');
                grad.addColorStop(1, 'rgba(100,100,255,0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(a.x - scrollOffset, a.y, a.radius, 0, Math.PI * 2);
                ctx.fill();
            });
        } else { // Default simple platforms
            const { platforms } = state;
            ctx.fillStyle = '#888';
            platforms.forEach(p => {
                ctx.fillRect(p.x - scrollOffset, p.y, p.width, p.height);
            });
        }
    },

    drawPlayer: function(ctx, state, level) {
        const { player, scrollOffset, score, quantaGoal, quantumLeapReady } = state;
        const { style } = level.player;

        ctx.save();
        ctx.translate(player.x - scrollOffset, player.y);

        if (style === 'quanti') {
            const scaleFactor = level.player.scaleFactor || 1;
            ctx.translate(player.width / 2, player.height / 2);
            ctx.scale(scaleFactor, scaleFactor);
            ctx.translate(-player.width / 2, -player.height / 2);

            const progress = Math.min(score / quantaGoal, 1);
            const g = Math.floor(255 - (150 * progress));
            const b = Math.floor(0 + (100 * progress));
            const currentColor = `rgb(255, ${g}, ${b})`;

            ctx.shadowColor = quantumLeapReady ? 'white' : 'yellow';
            ctx.shadowBlur = 20;
            ctx.fillStyle = currentColor;
            ctx.beginPath();
            ctx.arc(player.width / 2, player.height / 2, player.width / 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#888';
            ctx.fillRect(player.width/2 - 5, player.height/2, 10, player.height/2 + 5);
            if (player.isJumping) {
                ctx.fillStyle = 'orange';
                for (let i = 0; i < 5; i++) {
                    ctx.beginPath();
                    ctx.arc(player.width/2, player.height+Math.random()*10, Math.random()*5, 0, Math.PI*2);
                    ctx.fill();
                }
            }
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(player.width/3, player.height/2, 6, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(player.width*2/3, player.height/2, 6, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(player.width/3+6, player.height/2);
            ctx.lineTo(player.width*2/3-6, player.height/2);
            ctx.stroke();
        } else { // Default simple player
            ctx.fillStyle = 'red';
            ctx.fillRect(0, 0, player.width, player.height);
        }
        ctx.restore();
    },

    drawQuanta: function(ctx, state, level) {
        const { quanta, scrollOffset } = state;
        ctx.fillStyle = 'gold';
        quanta.forEach(q => {
            if (q.active) {
                ctx.beginPath();
                ctx.arc(q.x - scrollOffset, q.y, q.width, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    },

    drawEnemies: function(ctx, state, level) {
        if (!level.enemies) return;
        const { electrons, scrollOffset } = state;
        ctx.fillStyle = 'cyan';
        electrons.forEach(e => {
            ctx.beginPath();
            ctx.arc(e.x - scrollOffset, e.y, e.width / 2, 0, Math.PI * 2);
            ctx.fill();
        });
    },

    // --- UI Drawing Functions ---
    drawUI: function(dCtx, state, level) {
        const { score, quantaGoal, quantumLeapReady, gameWidth, scale } = state;
        dCtx.fillStyle = 'white';
        dCtx.font = `${24*scale}px "Comic Sans MS"`;
        dCtx.textAlign = 'left';
        dCtx.fillText('Energia: ' + score + ' / ' + quantaGoal, 20 * scale, 30 * scale);
        if (quantumLeapReady) {
            dCtx.fillStyle = '#00dddd';
            dCtx.font = `bold ${20*scale}px "Comic Sans MS"`;
            dCtx.textAlign = 'center';
            dCtx.fillText('SALTO QUANTICO PRONTO!', (gameWidth / 2) * scale, 30 * scale);
        }
        // Touch controls are part of UI
        this.drawControls(dCtx, state, level);
        this.drawFullscreenButton(dCtx, state, level);
        this.drawAudioButton(dCtx, state, level);
    },

    drawControls: function(dCtx, state, level) {
        const { scale, touchControls, keys } = state;
        dCtx.globalAlpha = 0.5;
        for (const key in touchControls) {
            const btn = touchControls[key];
            dCtx.fillStyle = keys[btn.key] ? '#999' : '#4a4a4a';
            dCtx.fillRect(btn.x * scale, btn.y * scale, btn.width * scale, btn.height * scale);
            dCtx.fillStyle = 'white';
            dCtx.font = `bold ${30*scale}px sans-serif`;
            dCtx.textAlign = 'center';
            dCtx.textBaseline = 'middle';
            let text = '';
            if (key === 'left') text = '◀';
            else if (key === 'right') text = '▶';
            else if (key === 'jump') text = '▲';
            dCtx.fillText(text, (btn.x + btn.width / 2) * scale, (btn.y + btn.height / 2 + 2) * scale);
        }
        dCtx.globalAlpha = 1.0;
    },

    drawAudioButton: function(dCtx, state, level) {
        const { scale, audioToggleButton } = state;
        const btn = audioToggleButton;
        dCtx.strokeStyle = 'white';
        dCtx.lineWidth = 2*scale;
        dCtx.strokeRect(btn.x*scale, btn.y*scale, btn.width*scale, btn.height*scale);
        dCtx.font = `bold ${24*scale}px sans-serif`;
        dCtx.textAlign = 'center';
        dCtx.textBaseline = 'middle';
        dCtx.fillStyle = 'white';
        if (AudioSystem.isAudioEnabled) dCtx.fillText('🔊', (btn.x + btn.width/2)*scale, (btn.y + btn.height/2 + 2)*scale);
        else dCtx.fillText('🔇', (btn.x + btn.width/2)*scale, (btn.y + btn.height/2 + 2)*scale);
    },

    drawFullscreenButton: function(dCtx, state, level) {
        if (!state.isFullscreenSupported) return;
        const { scale, fullscreenButton } = state;
        dCtx.strokeStyle = 'white';
        dCtx.lineWidth = 3*scale;
        const { x, y, width: w, height: h } = fullscreenButton;
        const L = 10;
        dCtx.beginPath();
        dCtx.moveTo((x)*scale, (y+L)*scale);
        dCtx.lineTo(x*scale, y*scale);
        dCtx.lineTo((x+L)*scale, y*scale);
        dCtx.moveTo((x+w-L)*scale, y*scale);
        dCtx.lineTo((x+w)*scale, y*scale);
        dCtx.lineTo((x+w)*scale, (y+L)*scale);
        dCtx.moveTo(x*scale, (y+h-L)*scale);
        dCtx.lineTo(x*scale, (y+h)*scale);
        dCtx.lineTo((x+L)*scale, (y+h)*scale);
        dCtx.moveTo((x+w-L)*scale, (y+h)*scale);
        dCtx.lineTo((x+w)*scale, (y+h)*scale);
        dCtx.lineTo((x+w)*scale, (y+h-L)*scale);
        dCtx.stroke();
    },

    drawStartScreen: function(dCtx, state, level) {
        const { gameWidth, gameHeight, scale, startButton } = state;
        const { ui } = level;
        dCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        dCtx.fillRect(0, 0, gameWidth * scale, gameHeight * scale);
        dCtx.fillStyle = 'white';
        dCtx.textAlign = 'center';
        dCtx.font = `bold ${36*scale}px "Comic Sans MS"`;
        dCtx.fillText(ui.startScreen.title, (gameWidth / 2)*scale, (gameHeight / 2 - 150)*scale);
        dCtx.font = `${20*scale}px "Comic Sans MS"`;
        dCtx.fillText(ui.startScreen.subtitle1, (gameWidth/2)*scale, (gameHeight/2 - 90)*scale);
        dCtx.fillText(ui.startScreen.subtitle2, (gameWidth/2)*scale, (gameHeight/2 - 60)*scale);
        dCtx.fillStyle = 'gold';
        dCtx.font = `bold ${22*scale}px "Comic Sans MS"`;
        dCtx.fillText(ui.startScreen.levelTitle, (gameWidth/2)*scale, (gameHeight/2 - 10)*scale);
        dCtx.font = `${18*scale}px "Comic Sans MS"`;
        dCtx.fillText(ui.startScreen.instructions, (gameWidth/2)*scale, (gameHeight/2 + 25)*scale);
        const btn = startButton;
        dCtx.fillStyle = '#2c5b1b';
        dCtx.fillRect(btn.x*scale, btn.y*scale, btn.width*scale, btn.height*scale);
        dCtx.fillStyle = 'white';
        dCtx.font = `bold ${28*scale}px "Comic Sans MS"`;
        dCtx.fillText(ui.startScreen.buttonText, (btn.x + btn.width/2)*scale, (btn.y + btn.height/2 + 5)*scale);
    },

    drawCompleteScreen: function(dCtx, state, level) {
        const { gameWidth, gameHeight, scale } = state;
        const { ui } = level;
        dCtx.fillStyle = 'rgba(0,0,0,0.7)';
        dCtx.fillRect(0,0,gameWidth*scale, gameHeight*scale);
        dCtx.fillStyle = 'white';
        dCtx.textAlign = 'center';
        dCtx.font = `bold ${40*scale}px "Comic Sans MS"`;
        dCtx.fillText(ui.completeScreen.title, (gameWidth/2)*scale, (gameHeight/2-80)*scale);
        dCtx.font = `${22*scale}px "Comic Sans MS"`;
        dCtx.fillText(ui.completeScreen.subtitle, (gameWidth/2)*scale, (gameHeight/2-40)*scale);
        dCtx.fillStyle = 'gold';
        dCtx.font = `${18*scale}px "Comic Sans MS"`;
        dCtx.fillText(ui.completeScreen.message1, (gameWidth/2)*scale, (gameHeight/2)*scale);
        dCtx.fillText(ui.completeScreen.message2, (gameWidth/2)*scale, (gameHeight/2+30)*scale);
        dCtx.fillStyle = 'white';
        dCtx.font = `${22*scale}px "Comic Sans MS"`;
        dCtx.fillText(ui.completeScreen.buttonText, (gameWidth/2)*scale, (gameHeight/2+80)*scale);
    }
};
