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
            this.drawPowerUps(gCtx, state, level);
            this.drawDoors(gCtx, state, level);
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
        const { style, scaleFactor } = player;

        ctx.save();
        ctx.translate(player.x - scrollOffset, player.y);

        if (style === 'quanti') {
            const resolvedScaleFactor = scaleFactor || 1;
            ctx.translate(player.width / 2, player.height / 2);
            ctx.scale(resolvedScaleFactor, resolvedScaleFactor);
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

    drawDoors: function(ctx, state, level) {
        const { doors, scrollOffset, gameHeight } = state;
        ctx.fillStyle = '#a52a2a'; // A brownish color for the doors

        doors.forEach(d => {
            const openingTop = d.y - d.currentOpeningHeight / 2;
            const openingBottom = d.y + d.currentOpeningHeight / 2;

            // Top part of the door
            ctx.fillRect(d.x - scrollOffset, 0, d.width, openingTop);

            // Bottom part of the door
            ctx.fillRect(d.x - scrollOffset, openingBottom, d.width, gameHeight - openingBottom);
        });
    },

    drawPowerUps: function(ctx, state, level) {
        const { powerUps, scrollOffset } = state;

        powerUps.forEach(p => {
            if (p.active) {
                ctx.save();
                ctx.translate(p.x - scrollOffset, p.y);

                switch (p.icon) {
                    case 'jetpack':
                        this.drawJetpackIcon(ctx);
                        break;
                    case 'waveMarble':
                        this.drawWaveMarbleIcon(ctx);
                        break;
                    case 'magnifyingSphere':
                        this.drawMagnifyingSphereIcon(ctx);
                        break;
                    default:
                        this.drawDefaultPowerUpIcon(ctx);
                        break;
                }

                ctx.restore();
            }
        });
    },

    // --- Text Helper ---
    drawWrappedText: function(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let testLine;
        let metrics;
        let testWidth;

        for (let n = 0; n < words.length; n++) {
            testLine = line + words[n] + ' ';
            metrics = ctx.measureText(testLine);
            testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y);
    },

    // --- Icon Drawing Helpers ---
    drawDefaultPowerUpIcon: function(ctx) {
        ctx.fillStyle = 'yellow';
        ctx.strokeStyle = 'gold';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -15);
        for (let i = 0; i < 5; i++) {
            ctx.rotate(Math.PI / 5);
            ctx.lineTo(0, - (15 * 0.5));
            ctx.rotate(Math.PI / 5);
            ctx.lineTo(0, -15);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    },

    drawMagnifyingSphereIcon: function(ctx) {
        // Sphere
        ctx.fillStyle = 'rgba(180, 180, 180, 0.7)';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Magnifying glass handle
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(12, 12);
        ctx.lineTo(20, 20);
        ctx.stroke();
    },

    drawWaveMarbleIcon: function(ctx) {
        // Marble
        ctx.fillStyle = 'rgba(200, 200, 255, 0.7)';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Wave
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.quadraticCurveTo(-5, -10, 0, 0);
        ctx.quadraticCurveTo(5, 10, 10, 0);
        ctx.stroke();
    },

    drawJetpackIcon: function(ctx) {
        // Body of the jetpack
        ctx.fillStyle = '#ccc';
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.fillRect(-10, -15, 20, 30);
        ctx.strokeRect(-10, -15, 20, 30);

        // Flame
        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.moveTo(0, 15);
        ctx.lineTo(-7, 25);
        ctx.lineTo(7, 25);
        ctx.closePath();
        ctx.fill();

        // "x2" text
        ctx.fillStyle = 'black';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('x2', 0, 0);
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
    this.drawPowerUpHUD(dCtx, state, level);
        // Touch controls are part of UI
        this.drawControls(dCtx, state, level);
        this.drawFullscreenButton(dCtx, state, level);
        this.drawAudioButton(dCtx, state, level);
    },

drawPowerUpHUD: function(dCtx, state, level) {
    const { player, scale, gameWidth } = state;
    const hudY = 20 * scale;
    const barHeight = 8 * scale;
    const barWidth = 60 * scale;

    const activePowerUps = Object.values(player.abilities).filter(a => a.active && !a.permanent);
    const totalWidth = activePowerUps.length * (barWidth + 10 * scale);
    let startX = (gameWidth * scale / 2) - (totalWidth / 2);

    for (const ability of activePowerUps) {
        const iconX = startX + barWidth / 2;
        const barX = startX;
        const barY = hudY + 25 * scale;

        // Draw Icon
        dCtx.save();
        dCtx.translate(iconX, hudY);
        dCtx.scale(0.6, 0.6);
        switch (ability.icon) {
            case 'jetpack':
                this.drawJetpackIcon(dCtx);
                break;
            case 'magnifyingSphere':
                this.drawMagnifyingSphereIcon(dCtx);
                break;
            default:
                break;
        }
        dCtx.restore();

        // Draw Progress Bar
        const progress = ability.timer / ability.duration;
        dCtx.fillStyle = 'rgba(255,255,255,0.3)';
        dCtx.fillRect(barX, barY, barWidth, barHeight);
        dCtx.fillStyle = 'white';
        dCtx.fillRect(barX, barY, barWidth * progress, barHeight);

        startX += barWidth + 10 * scale;
    }
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
        const maxWidth = (gameWidth - 80) * scale;
        const lineHeight = 24 * scale;
        const centerX = (gameWidth / 2) * scale;

        dCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        dCtx.fillRect(0, 0, gameWidth * scale, gameHeight * scale);
        dCtx.fillStyle = 'white';
        dCtx.textAlign = 'center';

        dCtx.font = `bold ${36*scale}px "Comic Sans MS"`;
        dCtx.fillText(ui.startScreen.title, centerX, (gameHeight / 2 - 150) * scale);

        dCtx.font = `${20*scale}px "Comic Sans MS"`;
        this.drawWrappedText(dCtx, ui.startScreen.subtitle1, centerX, (gameHeight / 2 - 90) * scale, maxWidth, lineHeight);
        this.drawWrappedText(dCtx, ui.startScreen.subtitle2, centerX, (gameHeight / 2 - 60) * scale, maxWidth, lineHeight);

        dCtx.fillStyle = 'gold';
        dCtx.font = `bold ${22*scale}px "Comic Sans MS"`;
        dCtx.fillText(ui.startScreen.levelTitle, centerX, (gameHeight / 2) * scale);

        dCtx.font = `${18*scale}px "Comic Sans MS"`;
        this.drawWrappedText(dCtx, ui.startScreen.instructions, centerX, (gameHeight / 2 + 35) * scale, maxWidth, lineHeight);

        const btn = startButton;
        dCtx.fillStyle = '#2c5b1b';
        dCtx.fillRect(btn.x*scale, btn.y*scale, btn.width*scale, btn.height*scale);
        dCtx.fillStyle = 'white';
        dCtx.font = `bold ${28*scale}px "Comic Sans MS"`;
        dCtx.fillText(ui.startScreen.buttonText, (btn.x + btn.width/2)*scale, (btn.y + btn.height/2 + 5)*scale);
    },

    drawCompleteScreen: function(dCtx, state, level) {
        const { gameWidth, gameHeight, scale, startButton } = state;
        const { ui } = level;
        const maxWidth = (gameWidth - 80) * scale;
        const lineHeight = 22 * scale;
        const centerX = (gameWidth / 2) * scale;

        dCtx.fillStyle = 'rgba(0,0,0,0.7)';
        dCtx.fillRect(0,0,gameWidth*scale, gameHeight*scale);
        dCtx.fillStyle = 'white';
        dCtx.textAlign = 'center';

        // Title and messages
        dCtx.font = `bold ${40*scale}px "Comic Sans MS"`;
        dCtx.fillText(ui.completeScreen.title, centerX, (gameHeight/2-120)*scale);

        dCtx.font = `${22*scale}px "Comic Sans MS"`;
        this.drawWrappedText(dCtx, ui.completeScreen.subtitle, centerX, (gameHeight/2-70)*scale, maxWidth, lineHeight);

        dCtx.fillStyle = 'gold';
        dCtx.font = `${18*scale}px "Comic Sans MS"`;
        this.drawWrappedText(dCtx, ui.completeScreen.message1, centerX, (gameHeight/2-20)*scale, maxWidth, lineHeight);
        this.drawWrappedText(dCtx, ui.completeScreen.message2, centerX, (gameHeight/2+20)*scale, maxWidth, lineHeight);

        // Button
        const btn = startButton;
        dCtx.fillStyle = '#2c5b1b';
        dCtx.fillRect(btn.x*scale, (btn.y + 40)*scale, btn.width*scale, btn.height*scale); // Move button down
        dCtx.fillStyle = 'white';
        dCtx.font = `bold ${28*scale}px "Comic Sans MS"`;
        dCtx.fillText(ui.completeScreen.buttonText, (btn.x + btn.width/2)*scale, (btn.y + 40 + btn.height/2 + 5)*scale);
    }
};
